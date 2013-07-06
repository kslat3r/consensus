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

    removeOld: function(shown_threshold) {
      this.models = this.slice(shown_threshold*-1);
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

    tagName: 'div',
    template: 'search_result/list',

    attributes: {
      class: ''
    },

    events: {

    },

    job: null,

    sort_column: 'date',
    sort_direction: 'desc',

    shown_threshold: 100,

    views: [],

    loading: true,
    loading_more: false,

    initialize: function() {
      this.preloadTemplate('search_result/item');
    },

    removeOld: function() {
      this.collection.removeOld(this.shown_threshold);

      //code needs to be added here to delete old views
    },

    render: function() {

      var self = this;

      //peform sort

      this.collection.performSort(this.sort_column, this.sort_direction);

      //render

      this.$el.html(SearchResult.Views.List.__super__.render(this.template, {
        search_results: this.collection,

        loading: this.loading,
        loading_more: this.loading_more
      }));

      //replace

      var ids = [];
      _.each(this.collection.models, function(search_result) {
        if (typeof(self.views[search_result.get('id')]) == 'undefined') {
          var view = new SearchResult.Views.Item({
            model: search_result,
          });

          self.$el.find('.items').append(view.render().el);
          self.views[search_result.get('id')] = view;
        }
        else {
          self.$el.find('.items').append(self.views[search_result.get('id')].el);
        }
      });

      //return

      return this;
    }
  });

  SearchResult.Views.Item = Base.Views.Base.extend({

    tagName: 'tr',
    template: 'search_result/item',

    attributes: {
      class: 'result'
    },

    events: {
      'click a.classification_detail': 'classificationDetail'
    },

    selected: 'item',
    classification_detail_view: null,

    classificationDetail: function(e) {
      e.preventDefault();

      if (this.selected == 'item') {
        this.selected = 'classification_detail';
      }
      else {
        this.selected = 'item';
      }

      this.classification_detail_view = new SearchResult.Views.ClassificationDetail({
        model: this.model,
        item: this
      });

      this.classification_detail_view.render();
      this.render();
    },

    closeClassificationDetailView: function() {
      if (this.selected == 'classification_detail') {
        this.selected = 'item';
        this.render();
      }
    },

    render: function() {
      this.$el.html(SearchResult.Views.Item.__super__.render(this.template, {
        search_result: this.model,
        selected: this.selected,
        scoring_band: JSON.parse(this.model.get('scoring_band'))
      }));

      //replace

      if (this.classification_detail_view !== null) {
        this.$el.find('.classification_detail_cont').replaceWith(this.classification_detail_view.el);
      }

      return this;
    }
  });

  SearchResult.Views.ClassificationDetail = Base.Views.Base.extend({

    tagName: 'td',
    template: 'search_result/classification_detail',

    events: {
      'click .token': 'tokenDetails',
    },

    item: null,

    initialize: function() {
      this.item = this.options.item;
    },

    tokenDetails: function(e) {
      var self = this;

      var id = $(e.target).attr('id');

      if ($(e.target).hasClass('selected')) {
        this.$el.find('#' + id + '_desc').hide();
        $(e.target).removeClass('selected');
      }
      else {
        this.$el.find('.selected').removeClass('selected');
        $(e.target).addClass('selected');

        this.$el.find('.token_desc').hide();
        this.$el.find('#' + id + '_desc').show();
      }
    },

    closeTokenDetails: function() {
      this.$el.find('.selected').removeClass('selected');
      this.$el.find('.token_desc').hide();
    },

    render: function() {
      this.$el.html(SearchResult.Views.ClassificationDetail.__super__.render(this.template, {
        search_result: this.model,
        tokens: JSON.parse(this.model.get('tokens'))
      }));

      return this;
    }
  });

})(Consensus.module("search_result"));