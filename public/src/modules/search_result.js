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

    new_threshold: 10,
    old_threshold: 100,

    views: [],

    loading: true,
    loading_more: false,

    initialize: function() {
      //this.preloadTemplate('search_result/item');
    },

    loadMore: function() {
      this.new_threshold = this.collection.length;
      this.render();
    },

    hideNew: function(new_threshold) {
      if (parseInt(this.collection.models.length) > parseInt(new_threshold)) {
        var models = this.collection.hideNew(new_threshold);
        this.views = this.views.splice(0, parseInt(new_threshold));
      }
      else {
        var models = this.collection.models;
      }

      return models;
    },

    render: function() {

      var self = this;

      //peform sort

      this.collection.performSort(this.sort_column, this.sort_direction);
      var models_subset = this.hideNew(this.new_threshold);

      //render

      this.$el.html(SearchResult.Views.List.__super__.render(this.template, {
        search_results: models_subset,

        loading: this.loading,
        
        show_load_more: (this.collection.length > models_subset.length ? true : false),
        show_load_more_text: 'Load ' + (this.collection.length - models_subset.length > 100 ? '100+' : this.collection.length - models_subset.length) + ' more',

        show_load_scroll: false
      }));

      //replace

      var ids = [];
      _.each(models_subset, function(search_result) {
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