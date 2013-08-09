(function(SearchResult) {

  //dependencies

  var Base  = Consensus.module('base');

  SearchResult.Model = Backbone.Model.extend({

    url: function() {
      if (this.isNew()) {
        return '/apiv1/searchresults';
      }
      else {
        return '/apiv1/searchresults/' + this.get('id');
      }
    }

  });

  SearchResult.Collection = Backbone.Collection.extend({

    model: SearchResult.Model,

    url: function() {
      return '/apiv1/searchresults';
    },

    hideNew: function(new_threshold) {
      if (parseInt(this.length) > parseInt(new_threshold)) {
        return this.slice(new_threshold * -1);
      }

      return this.models;
    },

    removeOld: function(threshold) {
      if (parseInt(this.length) > parseInt(threshold)) {
        this.models  = this.slice(0, threshold);
        this.length  = threshold;
      }
    },

    performSort: function(sort_column, sort_direction) {
      switch (sort_column) {
        case 'score':
          this.models = _.sortBy(this.models, function(result) {
            return parseFloat(result.get('score'));
          });

          if (sort_direction == 'desc') {
            this.models.reverse();
          }

          break;
        case 'date':
          this.models = this.models.sort(function(a, b) {
            if (a.get('source_date_created_timestamp') > b.get('source_date_created_timestamp')) {
              if (sort_direction == 'desc') {
                return -1;
              }
              else if (sort_direction == 'asc') {
                return 1;
              }
            }
            else if (a.get('source_date_created_timestamp') < b.get('source_date_created_timestamp')) {
              if (sort_direction == 'desc') {
                return 1;
              }
              else if (sort_direction == 'desc') {
                return -1;
              }
            }
            else if (a.get('source_date_created_timestamp') == b.get('source_date_created_timestamp')) {
              return 0;
            }
          });
          break;
      }
    }
  });

  SearchResult.Views.List = Base.Views.Base.extend({

    template: 'search_result/list',

    events: {
      'click div#load_more': 'loadMore',
    },

    job: null,

    sort_column: 'date',
    sort_direction: 'desc',

    shown: null,
    hidden: null,
    shown_threshold: 20,
    max_shown_threshold: 100,

    window_threshold: 80,
    loading_old: false,
    load_old_scroll: false,
    old_scroll_top: 0,

    loading: true,
    loading_more: false,

    initialize: function() {
      this.preloadTemplate('search_result/item');

      this.shown  = new SearchResult.Collection();
      this.hidden = new SearchResult.Collection();

      var self = this;
      $(window).scroll(function(e) {
        var window_height = $(window).height();
        var scroll_top    = $(window).scrollTop();

        if (scroll_top > self.old_scroll_top) {
          if (((scroll_top / window_height) * 100) > self.window_threshold) {
            self.loadOld();
          }
        }
        
        self.old_scroll_top = scroll_top;
      });
    },

    add: function(models) {
      if (this.shown.length < this.shown_threshold) {
        var self = this;

        _.each(models, function(model) {
          if (self.shown.length < self.shown_threshold) {
            self.shown.add(model);
          }
          else {
            self.hidden.add(model);
          }
        });
      }
      else {
        this.hidden.add(models);
      }
    },

    loadMore: function() {
      this.shown.add(this.hidden.models);
      this.hidden = new SearchResult.Collection();
      
      if (this.shown.length > this.max_shown_threshold) {
        this.shown_threshold = this.max_shown_threshold;
      }

      this.render();
    },

    /*hideNew: function(new_threshold) {
      if (parseInt(this.collection.models.length) > parseInt(new_threshold)) {
        var models = this.collection.hideNew(new_threshold);
        this.views = this.views.splice(0, parseInt(new_threshold));
      }
      else {
        var models = this.collection.models;
      }

      return models;
    },*/

    loadOld: function() {
      if (this.loading_old == true) {
        return;
      }

      if (this.shown.where({'num': 1}).length > 0) {
        return;
      }

      this.loading_old = true;

      //render

      this.load_old_scroll = true;
      this.render();

      var searchResults = new SearchResult.Collection();

      //do params

      var data = {
        job_id: this.shown.at(this.shown.length - 1).get('job_id').$id,
        to_id: this.shown.at(this.shown.length - 1).mongoId(),
        order_by: 'source_date_created_timestamp',
        direction: -1,
        limit: 25
      };

      //make request

      var self    = this;
      collection  = null;

      searchResults.fetch({
        data: data,
        success: function(collection, response) {
          self.shown.add(collection.models);
          self.shown_threshold += collection.length;
          
          self.load_old_scroll  = false;
          self.loading_old      = false;
          
          self.render();          
        }        
      });      
    },

    render: function() {

      var self = this;

      //peform sort

      this.shown.performSort(this.sort_column, this.sort_direction);
      this.shown.removeOld(this.shown_threshold);
      
      //render

      this.$el.html(SearchResult.Views.List.__super__.render(this.template, {
        search_results: this.shown.models,

        loading: this.loading,
        
        show_load_more: (this.hidden.length > 0 ? true : false),
        show_load_more_text: 'Load ' + (this.hidden.length > 100 ? '100+' : this.hidden.length) + ' more',        

        show_load_scroll: self.load_old_scroll
      }));

      //replace

      var ids = [];
      _.each(this.shown.models, function(search_result) {
        var view = new SearchResult.Views.Item({
          model: search_result,
        });

        self.$el.find('#results').append(view.render().el);
      });

      //return

      return this;
    }
  });

  SearchResult.Views.Item = Base.Views.Base.extend({

    template: 'search_result/item',

    render: function() {
      this.$el.html(SearchResult.Views.Item.__super__.render(this.template, {
        search_result: this.model,
        scoring_band: JSON.parse(this.model.get('scoring_band')),
        tokens: JSON.parse(this.model.get('tokens'))
      }));

      return this;
    }
  });
})(Consensus.module("search_result"));