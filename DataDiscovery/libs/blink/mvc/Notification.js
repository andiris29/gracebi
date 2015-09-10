(function() {

	var blink = andrea.blink;

	blink.declare("andrea.blink.mvc.Notification");

	/**
	 *
	 * @param {String} type
	 *            event type
	 * @param {andrea.blink.events} target
	 *            event target
	 * @param {Object|undefined} data
	 *            event data
	 */
	var Notification = andrea.blink.mvc.Notification = function(type, source, data) {
		Notification.superclass.constructor.apply(this, arguments);

		this.__className = "andrea.blink.mvc.Notification";

		this._type = type;
		this._target = null;
		this._source = source;
		this.data = data;
	};

	blink.extend(andrea.blink.mvc.Notification, andrea.blink.events.Event);

	Notification.prototype.source = function() {
		return this._source;
	};

})();
