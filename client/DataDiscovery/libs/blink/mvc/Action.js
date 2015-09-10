(function() {

	var blink = andrea.blink;

	blink.declare("andrea.blink.mvc.Action");

	var Action = andrea.blink.mvc.Action = function() {
		this.__className = "andrea.blink.mvc.Action";
	};

	/**
	 *
	 * @param {Object} parameters
	 * @return {Object}
	 */
	Action.prototype.execute = function(parameters) {
		return null;
	};

	// /**
	// *
	// * @param {String} name
	// * @param {Object} data
	// */
	// Action.prototype._notify = function(name, data) {
	// };
	/**
	 *
	 * @param {String} name
	 * @return {Model}
	 */
	Action.prototype._getModel = function(name) {
		return null;
	};

})();
