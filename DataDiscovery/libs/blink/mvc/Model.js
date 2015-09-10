(function() {

	var blink = andrea.blink;

	blink.declare("andrea.blink.mvc.Model");

	var Model = andrea.blink.mvc.Model = function() {
		this.__className = "andrea.blink.mvc.Model";

		this._notifyRequested = null;
	};

	/**
	 *
	 * @param {String} name
	 * @param {Object} data
	 */
	Model.prototype._notify = function(name, data) {
	};

	Model.prototype._deferNotify = function(name) {
		if (this._notifyRequested) {
			this._notifyRequested.names.push(name);
		} else {
			this._notifyRequested = {
				"names" : [name]
			};

			var _this = this;
			_.defer(function() {
				var names = _.uniq(_this._notifyRequested.names);
				_this._notifyRequested = null;

				for (var i = 0; i < names.length; i++) {
					_this._notify.call(_this, names[i]);
				}
			});
		}
	};
})();
