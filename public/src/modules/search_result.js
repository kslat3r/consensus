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

    removeOld: function(old_threshold) {
      if (parseInt(this.length) > parseInt(old_threshold)) {
        this.models  = this.slice(0, old_threshold);
        this.length  = old_threshold;
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

    //new_threshold: 10,

    old_threshold: 20,
    window_threshold: 95,
    loading_old: false,
    load_old_scroll: false,
    old_scroll_top: 0,

    views: [],

    loading: true,
    loading_more: false,

    initialize: function() {
      //this.preloadTemplate('search_result/item');

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

    /*loadMore: function() {
      this.new_threshold = this.collection.length;
      this.render();
    },*/

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

      if (this.collection.where({'num': 1}).length > 0) {
        return;
      }

      this.loading_old = true;

      //render

      this.load_old_scroll = true;
      this.render();

      var searchResults = new SearchResult.Collection();

      //do params

      var data = {
        job_id: this.collection.at(this.collection.length - 1).get('job_id').$id,
        to_id: this.collection.at(this.collection.length - 1).mongoId(),
        order_by: 'source_date_created_timestamp',
        direction: -1,
        limit: 10
      };

      //make request

      var self    = this;
      collection  = null;

      searchResults.fetch({
        data: data,
        success: function(collection, response) {
          self.collection.add(collection.models);
          self.old_threshold += collection.length;            
          
          self.load_old_scroll  = false;
          self.loading_old      = false;
          
          self.render();          
        }        
      });      
    },

    removeOld: function(old_threshold) {
      if (parseInt(this.collection.models.length) > parseInt(old_threshold)) {
        this.collection.removeOld(old_threshold);

        if (this.views.length > this.old_threshold) {
          this.views = this.views.splice(0, this.views.length - old_threshold);
        }
      }
    },

    render: function() {

      var self = this;

      //peform sort

      this.collection.performSort(this.sort_column, this.sort_direction);
      this.removeOld(this.old_threshold);
      
      //render

      this.$el.html(SearchResult.Views.List.__super__.render(this.template, {
        search_results: this.collection.models,

        loading: this.loading,
        
        //show_load_more: (this.collection.length > models_subset.length ? true : false),
        //show_load_more_text: 'Load ' + (this.collection.length - models_subset.length > 100 ? '100+' : this.collection.length - models_subset.length) + ' more',
        show_load_more: false,
        show_load_more_text: '',

        show_load_scroll: self.load_old_scroll
      }));

      //replace

      var ids = [];
      _.each(this.collection.models, function(search_result) {
        if (typeof(self.views[search_result.mongoId()]) == 'undefined') {
          var view = new SearchResult.Views.Item({
            model: search_result,
          });

          self.$el.find('#results').append(view.render().el);
          self.views[search_result.mongoId()] = view;
        }
        else {
          self.$el.find('#results').append(self.views[search_result.mongoId()].el);
        }
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