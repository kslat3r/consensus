//see http://weblog.bocoup.com/organizing-your-backbone-js-application-with-modules/ for documentation on organisational structure

var Consensus = {

  module: function() {

    var modules = {};

		return function(name) {
			if (modules[name]) {
				return modules[name];
			}

      return modules[name] = {
        Views: {},
        Collection: null,
        Model: null,
        Router: null
		  };
    };
  }(),

  templates: {}
};

Backbone.Model.prototype.mongoId = function() {
  return this.get('_id').$id;
}

//go!

$(document).ready(function() {  
  var Base          = Consensus.module('base');
  var Error         = Consensus.module('error');
  var Job           = Consensus.module('job');

  var baseRouter      = new Base.Router();
  var errorRouter     = new Error.Router();
  var jobRouter       = new Job.Router();

  Backbone.history.start({root: '/app'});
});