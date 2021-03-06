(function(Base) {

	Base.Views.Base = Backbone.View.extend({

		messageTimeout: 7000,
		infoMessageTimeout: 1000,

		templatePath: '/src/templates/',
		templateSuffix: '.tpl',
		cachedTemplates: {},

		messageEventAdded: false,

		dp: 5,

		messageElem: function() {
			return $('div#alert');
		},

		throbberElem: function() {
			return $('div#toolbar ul li.search form#search input.submit');
		},

		error: function(msg) {
			if (this.messageEventAdded == false) {
				var self = this;

				this.messageElem().find('span.close').live('click', function() {
					self.messageElem().removeClass();
					self.messageElem().hide();
				});

				self.messageEventAdded = true;
			}

			this.messageElem().removeClass();
			this.messageElem().addClass('error');
			this.messageElem().find('div.content').text(msg);
			this.messageElem().show();			
		},
		
		showThrobber: function() {
			this.throbberElem().addClass('throbber');
		},

		hideThrobber: function() {
			this.throbberElem().removeClass('throbber');
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
	    	return $('div#toolbar ul li.search form#search input.submit');
	    },

	    showThrobber: function() {
	    	if (this.throbberShown == false) {
				this.throbberElem().addClass('throbber');
				this.throbberShown = true;
			}
		},

		hideThrobber: function() {
			this.throbberElem().removeClass('throbber');		
			this.throbberShown = false;
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