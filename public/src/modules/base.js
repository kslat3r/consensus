(function(Base) {

	Base.Views.Base = Backbone.View.extend({

		messageTimeout: 7000,
		infoMessageTimeout: 1000,

		templatePath: '/src/templates/',
		templateSuffix: '.tpl',
		cachedTemplates: {},

		dp: 5,

		messageElem: function() {
			return $('div#message');
		},

		throbberElem: function() {
			return $('div#throbber');
		},

		success: function(msg) {
			this.messageElem().removeClass();
			this.messageElem().addClass('success');
			this.messageElem().text(msg);
			this.messageElem().animate({
    			bottom: '0',
    			duration: 700
    		});

			var self = this;

			setTimeout(function() {
				self.messageElem().animate({
	    			bottom: '-37',
	    			duration: 700
	    		});
			}, this.messageTimeout);
		},

		error: function(msg) {
			this.messageElem().removeClass();
			this.messageElem().addClass('error');
			this.messageElem().text(msg);
			this.messageElem().animate({
    			bottom: '0',
    			duration: 700
    		});

			var self = this;

			setTimeout(function() {
				self.messageElem().animate({
	    			bottom: '-37',
	    			duration: 700
	    		});
			}, this.messageTimeout);
		},

		warning: function(msg) {
			this.messageElem().removeClass();
			this.messageElem().addClass('warning');
			this.messageElem().text(msg);
			this.messageElem().animate({
    			bottom: '0',
    			duration: 700
    		});

			var self = this;

			setTimeout(function() {
				self.messageElem().animate({
	    			bottom: '-37',
	    			duration: 700
	    		});
			}, this.messageTimeout);
		},

		info: function(msg) {
			this.messageElem().removeClass();
			this.messageElem().addClass('info');
			this.messageElem().text(msg);
			this.messageElem().animate({
    			bottom: '0',
    			duration: 700
    		});

			var self = this;

			setTimeout(function() {
				self.messageElem().animate({
	    			bottom: '-37',
	    			duration: 700
	    		});
			}, this.infoMessageTimeout);
		},

		showThrobber: function() {
			this.throbberElem().animate({
				bottom: '0',
				duration: 700
			});
		},

		hideThrobber: function() {
			this.throbberElem().animate({
				bottom: '-51',
				duration: 700
			});
		},

		preloadTemplate: function(template) {
			var self = this;

			$.ajax({
				url: this.templatePath + template + this.templateSuffix,
				async: false,
				dataType: 'text',
				success: function(data) {
					self.cachedTemplates[template] = data;
				}
			});
		},

		render: function(template, obj) {
			if (this.cachedTemplates[template]) {
				return _.template(this.cachedTemplates[template], obj);
			}
			else {
				var self = this;

				$.ajax({
					url: this.templatePath + template + this.templateSuffix,
					async: false,
					dataType: 'text',
					success: function(data) {
						self.cachedTemplates[template] = data;
					}
				});

				return _.template(this.cachedTemplates[template], obj);
			}
		}
	});

	Base.Router = Backbone.Router.extend({

		throbberShown: false,

		appElem: function() {
      return $('div#app');
    },

    throbberElem: function() {
    	return $('div#throbber');
    },

    showThrobber: function() {
    	if (this.throbberShown == false) {
				this.throbberElem().animate({
					bottom: '0',
					duration: 200
				});

				this.throbberShown = true;
			}
		},

		hideThrobber: function() {
			var self = this;

			this.throbberElem().animate({
				bottom: '-51',
				duration: 100
			}, function() {
				self.throbberShown = false;
			});
		},

    initialize: function() {

    	var self = this;

    	$.ajaxSetup({
        statusCode: {
          403: function(resp) {
              self.navigate('error/403', {trigger: true});
          },
          404: function(resp) {
              self.navigate('error/404', {trigger: true});
          },
          500: function(resp) {
              self.navigate('error/500', {trigger: true});
          }
        },
        beforeSend: function() {
      		self.showThrobber();
				},
				complete: function() {
					self.hideThrobber();
				}
      });
    }
	});

})(Consensus.module("base"));