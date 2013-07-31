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
      'click li.view': 'switchView',
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

      this.search_results_view = new SearchResult.Views.List({
        collection: new SearchResult.Collection()
      });

      this.chart_view = new Job.Views.Chart({
        collection: new Backbone.Collection()
      });

      //set up window leave event

      var self = this;
      window.onbeforeunload = function() {
        if (self.job != null) {
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
                direction: -1
              };

              if (self.search_results_view.collection.length > 0) {
                data.from_id = self.search_results_view.collection.at(0).mongoId()
              }

              collection = null;

              searchResults.fetch({
                data: data,
                success: function(collection, response) {

                  //add models to collection

                  self.search_results_view.collection.add(collection.models);

                  //assign some config values

                  if (self.search_results_view.collection.length > 0) {
                    self.search_results_view.loading = false;
                  }

                  //render

                  self.search_results_view.render();

                  //add most recent search to chart

                  search = new Backbone.Model();
                  search.set('search_results', collection);
                  self.chart_view.collection.add(search);

                  //render chart view

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
      e.preventDefault();

      var self = this;

      this.$el.find('li.view').removeClass('selected');
      $(e.target).addClass('selected');

      if ($(e.target).parents('li').attr('id') == 'results_view_sel') {
        if (this.$el.find('#chart_view').is(':visible')) {
          this.$el.find('#chart_view, #stats').fadeOut('fast', function() {

            //close classification screens

            for (var i in self.search_results_view.views) {
              self.search_results_view.views[i].closeClassificationDetailView();
            }

            //rerender

            self.search_results_view.render();

            //show div

            self.$el.find('#results_view').show();
          })
        }
        else if (this.$el.find('#detailed_view').is(':visible')) {
          this.$el.find('#detailed_view').fadeOut('fast', function() {

            //close classification screens

            for (var i in self.search_results_view.views) {
              self.search_results_view.views[i].closeClassificationDetailView();
            }

            //rerender

            self.search_results_view.render();

            //show div

            self.$el.find('#results_view').show();
          })
        }

        this.selected = 'results'
      }
      else if ($(e.target).parents('li').attr('id') == 'chart_view_sel') {
        if (this.$el.find('#results_view').is(':visible')) {
          this.$el.find('#results_view').fadeOut('fast', function() {
            self.$el.find('#chart_view').show();
            self.$el.find('#stats').show();

            //close classification screens

            for (var i in self.search_results_view.views) {
              self.search_results_view.views[i].closeClassificationDetailView();
            }
          });
        }
        else if (this.$el.find('#detailed_view').is(':visible')) {
          this.$el.find('#detailed_view').fadeOut('fast', function() {
            self.$el.find('#chart_view').show();
            self.$el.find('#stats').show();

            //close classification screens

            for (var i in self.search_results_view.views) {
              self.search_results_view.views[i].closeClassificationDetailView();
            }
          });
        }

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

      this.search_results_view = new SearchResult.Views.List({
        collection: new SearchResult.Collection(),
      });

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
    mins: 5,
    title: '',

    all_points: [],

    chart_el: '',

    min: null,
    max: null,

    height: 400,
    width: 938,
    margin_right: 20,

    select_event: true,
    click_event: true,
    show_tooltip: true,
    chart_click_url: null,

    initialize: function() {
      this.mins                 = typeof(this.options.mins) != 'undefined' ? this.options.mins : this.mins;
      this.title                = typeof(this.options.title) != 'undefined' ? this.options.title : this.title;
      this.height               = typeof(this.options.height) != 'undefined' ? this.options.height : this.height;
      this.width                = typeof(this.options.width) != 'undefined' ? this.options.width : this.width;
      this.margin_right         = typeof(this.options.margin_right) != 'undefined' ? this.options.margin_right : this.margin_right;
      this.select_event         = typeof(this.options.select_event) != 'undefined' ? this.options.select_event : this.select_event;
      this.click_event          = typeof(this.options.click_event) != 'undefined' ? this.options.click_event : this.click_event;
      this.show_tooltip         = typeof(this.options.show_tooltip) != 'undefined' ? this.options.show_tooltip : this.show_tooltip;
      this.chart_click_url      = typeof(this.options.chart_click_url) != 'undefined' ? this.options.chart_click_url : this.chart_click_url;

      this.chart_el = document.createElement('div');

      this.collection.bind('add', this.update, this);

      this._createChart();
    },

    _createChart: function() {

      var self = this;

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.chart_el,
          type: 'spline',
          marginRight: this.margin_right,
          height: this.height,
          width: this.width,
          zoomType: this.select_event == true ? 'x' : null,
          events: {
            click: function(e) {
              if (self.chart_click_url != null) {
                window.location = self.chart_click_url;
              }
            },
            selection: function(e) {
              if (self.select_event == true) {

                e.preventDefault();

                if (typeof(e.xAxis[0]) == 'undefined' || typeof(e.xAxis[0].max) == 'undefined') {
                  return;
                }

                var min_timestamp = e.xAxis[0].min / 1000;
                var max_timestamp = e.xAxis[0].max / 1000;
                var arr           = [];

                _.each(self.collection.models, function(search) {
                  if (search.get('date_created_timestamp') >= min_timestamp && search.get('date_created_timestamp') <= max_timestamp) {
                    arr.push(search);
                  }
                });

                if (arr.length > 0) {
                  self._createDetailedView(arr);
                }
              }
            }
          }
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
            name: 'Average result rating',
            data: [],
          }
        ],
        plotOptions: {
          series: {
            cursor: 'pointer',
            point: {
              events: {
                click: function() {
                  if (self.click_event == true) {

                    var timestamp = this.x / 1000;

                    //find search object

                    var clicked_search = null;

                    _.each(self.collection.models, function(search) {
                      if (search.get('date_created_timestamp') == timestamp) {
                        clicked_search = search;
                      }
                    });

                    if (clicked_search !== null) {
                      self._createDetailedView([clicked_search])
                    }
                    else {
                      self.warning('Something went wrong. Search not found');
                    }
                  }
                  else if (self.chart_click_url != null) {
                    window.location = self.chart_click_url;
                  }
                }
              }
            },
            events: {
              click: function() {
                if (self.chart_click_url != null) {
                  window.location = self.chart_click_url;
                }
              }
            }
          }
        }
      });
    },

    update: function(model) {

      //create point

      if (parseInt(model.get('search_results').length) > 0) {

        //get average

        var total = 0;
        model.get('search_results').each(function(model) {
          total += parseFloat(model.get('score'));
        });

        var point = {
          x: parseInt(new Date().getTime()),
          y: parseFloat((total / model.get('search_results').length).toFixed(3))
        };
      }
      else {
        var point = {
          x: parseInt(new Date().getTime()),
          y: 0,
          color: '#99173C',
          marker: {
            fillColor: '#99173C',
            states: {
              hover: {
                fillColor: '#99173C'
              }
            }
          },
          events: {

          },
        };
      }

      this.all_points.push(point);

      //add to series

      this.chart.series[0].addPoint(point);

      //redraw

      this.redraw();
    },

    destroy: function() {
      this.all_points             = [];
      this.chart.series[0].points = [];

      if (typeof(this.chart) == 'object') {
        this.chart.destroy();
        this.chart = null;
      }

      this.collection.unbind();
      this.collection = null;

      this.remove();
      this.unbind();
    },

    setTitle: function(title) {
      this.chart.setTitle({text: title});
    },

    redoPoints: function() {
      var past_time = (new Date().getTime() / 1000) - (60*parseInt(this.mins));
      var out       = [];

      if (this.min == null && this.max == null) {
        for (var i in this.all_points) {
          if (past_time <= (this.all_points[i].x / 1000)) {
            out.push(this.all_points[i]);
          }
        }
      }
      else {
        for (var i in this.all_points) {
          if (this.all_points[i].x >= this.min && this.all_points[i].x <= this.max) {
            out.push(this.all_points[i]);
          }
        }
      }

      this.chart.series[0].setData(out);
    },

    redraw: function() {
      this.chart.redraw();
    },

    render: function() {

      //render

      this.$el.html(Job.Views.Chart.__super__.render(this.template, {
        searches: this.collection.models
      }));

      //replace

      this.$el.find('.chart').replaceWith(this.chart_el);

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