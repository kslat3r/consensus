(function(Error) {

  var Base = Consensus.module('base');

  Error.Views.Forbidden = Base.Views.Base.extend({

    tagName: 'div',
    template: 'error/403',

    render: function() {
      this.$el.html(Error.Views.Forbidden.__super__.render(this.template));
      return this;
    }
  });

  Error.Views.PageNotFound = Base.Views.Base.extend({

    tagName: 'div',
    template: 'error/404',

    render: function() {
      this.$el.html(Error.Views.PageNotFound.__super__.render(this.template));
      return this;
    }
  });

  Error.Views.ServerError = Base.Views.Base.extend({

    tagName: 'div',
    template: 'error/500',

    render: function() {
      this.$el.html(Error.Views.ServerError.__super__.render(this.template));
      return this;
    }
  });

  Error.Router = Base.Router.extend({
      routes: {
          'error/404': 'pageNotFound',
          'error/403': 'forbidden',
          'error/500': 'serverError'
      },

      pageNotFound: function() {
          var view = new Error.Views.PageNotFound();
          this.appElem().html(view.render().el);
      },

      forbidden: function() {
          var view = new Error.Views.Forbidden();
          this.appElem().html(view.render().el);
      },

      serverError: function() {
          var view = new Error.Views.ServerError();
          this.appElem().html(view.render().el);
      }
  });

})(Consensus.module("error"));