(function(Job) {

  var Base          = Consensus.module('base');
  var SearchResult  = Consensus.module('search_result');

  Job.Model = Backbone.Model.extend({

    url: function() {
      if (this.isNew()) {
        return '/apiv1/jobs';
      }
      else {
        return '/apiv1/jobs/' + this.get('id');
      }
    },

    validate: function(attrs) {

      //check empty term

      if (attrs.term === '') {
        return 'Please enter a search term';
      }
    },

    pushToWorker: function(callback) {
      $.get('/apiv1/jobs/' + this.mongoId() + '&push=true', function(resp) {
        if (typeof(callback) == 'function') {
          callback(resp);
        }
      });
    },

    delete: function(async) {
      $.ajax({
        url: '/apiv1/jobs/' + this.mongoId(),
        type: 'DELETE',
        async: async
      });
    }
  });

  Job.Collection = Backbone.Collection.extend({

    model: Job.Model,

    url: function() {
      return '/apiv1/jobs';
    }
  });

  Job.Views.Index = Base.Views.Base.extend({
    template: 'job/index',

    events: {
      'click input#submit': 'search',
      'keypress input#term': 'searchOnEnter',
      'click li.graph a': 'switchView',
      'click li.list a': 'switchView',
      'focus input#search': 'searchFocussed',
      'blur input#search': 'searchBlurred'
    },

    //config

    selected: 'results',

    //main objects

    job: null,
    search_results_view: null,
    chart_view: null,

    //internal timer

    timer: null,
    timerIncrement: 10,
    ajaxOccurring: false,
    
    //ui

    searchFocussed: false,
    startedFalseCount: 0,
    startedFalseCountThreshold: 3,

    //constructor

    initialize: function() {

      var self = this;

      //set up views

      this.search_results_view = new SearchResult.Views.List();

      this.chart_view = new Job.Views.Chart({
        collection: new Backbone.Collection()
      });

      //set up window leave event

      var self = this;
      window.onbeforeunload = function() {
        if (self.job != null) {
          clearTimeout(self.timer);
          self.job.delete(false);
        }
      };
    },

    searchOnEnter: function(e) {
      if (e.keyCode != 13) return;

      this.search(e);
    },

    search: function(e) {
      e.preventDefault();

      var self = this;

      //reset old searches?

      if (this.timer != null) {
        this._reset();
      }

      //create job

      var valid = this._createJob();

      if (valid) {

        //get searches on a timer

        this.job.save(null, {
          success: function(model, response) {

            //assign

            self.job = model;

            //render search results view

            self.search_results_view.render();

            //render chart view

            self.chart_view.render();

            //render

            self.render();

            //start timer

            self.timer = setInterval(function() {

              //ajax current occurring?

              if (self.ajaxOccurring == true || self.searchFocussed == true) {
                return;
              }

              //toggle switch

              self.ajaxOccurring = true;

              //get most recent search

              var searchResults = new SearchResult.Collection();

              //do params

              var data = {
                job_id: self.job.mongoId(),
                order_by: 'source_date_created_timestamp',
                direction: 1
              };

              if (self.search_results_view.shown.length > 0) {
                if (self.search_results_view.hidden.length > 0) {
                  data.from_id = self.search_results_view.hidden.at(self.search_results_view.hidden.length - 1).mongoId()
                }
                else {
                  data.from_id = self.search_results_view.shown.at(0).mongoId() 
                }
              }

              collection = null;

              searchResults.fetch({
                data: data,
                success: function(collection, response) {

                  //add model to collection

                  self.search_results_view.add(collection.models);

                  //assign some config values

                  if (self.search_results_view.shown.length > 0) {
                    self.search_results_view.loading = false;
                  }

                  //render

                  self.search_results_view.render();

                  //add most recent search to chart

                  search = new Backbone.Model();
                  search.set('search_results', collection);
                  self.chart_view.collection.add(search);

                  //render chart view

                  if (self.chart_view.collection.length > 0) {
                    self.chart_view.loading = false;
                  }

                  self.chart_view.render();

                  //render

                  self.render();

                  //push job to queue and toggle switch

                  self.job.pushToWorker(function(resp) {
                    if (resp.started == false) {
                      self.startedFalseCount++;

                      if (self.startedFalseCount > self.startedFalseCountThreshold) {
                        self.error('Looks like searches aren\'t being processed at the moment. Please bear with us!');
                        self.startedFalseCount = 0;
                      }
                    }

                    self.ajaxOccurring = false;
                  });                  
                }
              });
            }, self.timerIncrement * 1000);
          },
          error: function(model, response) {
            self.error('An error has occurred when creating your search! Please try again.');
          }
        });
      }
      else {
        self.error(valid);
      }
    },

    switchView: function(e) {
      var parent = $(e.currentTarget).parents('li');

      if (parent.hasClass('selected')) {
        return;
      }

      this.$el.find('li.selected').removeClass('selected');
      parent.addClass('selected');

      if (parent.hasClass('list')) {
        $('div#content').find('#results_view').removeClass('hidden');
        $('div#content').find('#chart_view').addClass('hidden');

        this.selected = 'results';
      }
      else if (parent.hasClass('graph')) {
        $('div#content').find('#chart_view').removeClass('hidden');
        $('div#content').find('#results_view').addClass('hidden');

        this.selected = 'chart';
      }
    },

    _reset: function() {

      //reset timer

      clearTimeout(this.timer);

      //delete old job

      if (this.job != null) {
        this.job.delete(true);        
      }

      //reset collection

      this.collection = new SearchResult.Collection();

      //destroy old views

      this.search_results_view = null;
      this.chart_view.destroy();
      this.chart_view = null;

      //set up views

      this.search_results_view = new SearchResult.Views.List();

      this.chart_view = new Job.Views.Chart({
        collection: new Backbone.Collection()
      });
    },

    _createJob: function() {

      var self = this;

      //create obj

      var obj = {
        term: this.$el.find('input#term').val()
      };

      //create model, attempt to assign and return result

      this.job = new Job.Model();

      return this.job.set(obj, {
        error: function(model, error) {
          self.error('An error has occurred when creating your search! Please try again.');
        }
      });
    },

    searchFocussed: function() {
      this.searchFocussed = true;
    },

    searchBlurred: function() {
      this.searchFocussed = false;
    },

    render: function() {

      this.$el.html(Job.Views.Index.__super__.render(this.template, {
        job: this.job,
        selected: this.selected
      }));

      //replace

      this.$el.find('#results_view').html(this.search_results_view.el);
      this.$el.find('#chart_view').html(this.chart_view.el);

      //redelegate

      this.search_results_view.delegateEvents();

      //return

      return this;
    },
  });

  Job.Views.Chart = Base.Views.Base.extend({

    template: 'job/chart',
    tagName: 'div',

    chart: null,
    bar_chart: null,

    total_score: 0,
    total_count: 0,
    count: 0,
    scores: [
      {
        color: '#bb0000',
        y: 0
      },
      {
        color: '#ff2211',
        y: 0
      },
      {
        color: '#ff4433',
        y: 0
      },
      {
        color: '#ff7766',
        y: 0
      },
      {
        color: '#ffaa99',
        y: 0
      },
      {
        color: '#bbb',
        y: 0
      },
      {
        color: '#bbffaa',
        y: 0
      },
      {
        color: '#88ff77',
        y: 0
      },
      {
        color: '#66ff33',
        y: 0
      },
      {
        color: '#22cc00',
        y: 0
      },
      {
        color: '#117700',
        y: 0
      }
    ],

    chart_el: '',
    bar_chart_el: '',

    min: null,
    max: null,

    title: '',
    height: 400,
    width: 750,
    marginRight: 40,    
    show_tooltip: true,

    loading: true,

    initialize: function() {
      this.title                = typeof(this.options.title) != 'undefined' ? this.options.title : this.title;
      this.height               = typeof(this.options.height) != 'undefined' ? this.options.height : this.height;
      this.width                = typeof(this.options.width) != 'undefined' ? this.options.width : this.width;
      this.marginRight          = typeof(this.options.marginRight) != 'undefined' ? this.options.marginRight : this.marginRight;
      this.show_tooltip         = typeof(this.options.show_tooltip) != 'undefined' ? this.options.show_tooltip : this.show_tooltip;

      this.chart_el = document.createElement('div');
      this.bar_chart_el = document.createElement('div');

      this.collection.bind('add', this.update, this);

      this._createChart();
      this._createBarChart();
    },

    _createChart: function() {

      var self = this;

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.chart_el,
          type: 'spline',
          height: this.height,
          width: this.width,
          marginRight: this.marginRight
        },
        title: {
          text: this.title
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
            second: '%H:%M:%S',
            minute: '%H:%M:%S',
            hour: '%H:%M:%S',
            day: '%e %b',
            week: '%e %b',
            month: '%b \'%y',
            year: '%Y'
          }
        },
        tooltip: {
            xDateFormat: '%H:%M:%S',
            shared: false,
            enabled: this.show_tooltip,
        },
        yAxis: {
          title: {
            text: 'Score'
          },
          min: -5,
          max: 5,
          tickInterval: 1,
        },
        legend: {
          enabled: false
        },
        series: [
          {
            name: 'Average score',
            data: [],
            marker: {
              radius: 2
            },
            lineWidth: 1
          }
        ]
      });
    },

    _createBarChart: function() {
      this.bar_chart = new Highcharts.Chart({
        chart: {
          renderTo: this.bar_chart_el,
          type: 'column',
          height: this.height,
          width: this.width,
          marginRight: this.marginRight
        },
        title: {
          text: this.title
        },
        yAxis: {
          title: {
            text: 'Count'
          },
        },
        xAxis: {
          categories: [
            '-5',
            '-4',
            '-3',
            '-2',
            '-1',
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
          ],
          title: {
            text: 'Score'
          },
        },
        tooltip: {
          enabled: false,
        },
        legend: {
          enabled: false
        },
        series: [{
          name: 'Scores',
          data: this.scores
        }]
      });
    },

    update: function(model) {

      var self = this;

      //loop

      model.get('search_results').each(function(model) {
        if (model.get('score') != 0) {
          self.total_score += parseFloat(model.get('score'));
          self.total_count += 1;          
        }

        var score = Math.floor(model.get('score'));
        self.scores[score+5].y++;

        self.count++;
      });

      //create point

      var point = {
        x: parseInt(new Date().getTime()),
        y: parseFloat((this.total_score / this.total_count).toFixed(3))
      };
      
      //add to series

      this.chart.series[0].addPoint(point);
      this.bar_chart.series[0].setData(this.scores);

      //redraw

      this.chart.redraw();
      this.bar_chart.redraw();
    },

    destroy: function() {
      this.chart.series[0].points = [];

      if (typeof(this.chart) == 'object') {
        this.chart.destroy();
        this.chart = null;
      }

      if (typeof(this.bar_chart) == 'object') {
        this.bar_chart.destroy();
        this.bar_chart = null;
      }

      this.collection.unbind();
      this.collection = null;

      this.remove();
      this.unbind();
    },

    render: function() {

      //render

      this.$el.html(Job.Views.Chart.__super__.render(this.template, {
        searches: this.collection.models,
        loading: this.loading,
        count: this.count
      }));

      //replace

      this.$el.find('.chart').replaceWith(this.chart_el);
      this.$el.find('.bar_chart').replaceWith(this.bar_chart_el);

      return this;
    }
  });

  Job.Router = Base.Router.extend({

      routes: {
          '': 'index'
      },

      index: function() {
        var view = new Job.Views.Index();
        this.appElem().html(view.render().el);
      }
  });

})(Consensus.module("job"));