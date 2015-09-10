(function() {

    var blink = andrea.blink;

    blink.declare("andrea.blink.events.Event");

    /**
     * andrea.blink.events.Event Class
     *
     * @param {String} type
     *            event type
     * @param {andrea.blink.events.EventDispatcher} target
     *            event target
     * @param {Object|undefined} data
     *            event data
     */
    var Event = andrea.blink.events.Event = function(type, target, data) {
        this.__className = "andrea.blink.events.Event";

        /**
         * {String}
         */
        this._type = type;
        /**
         * {andrea.blink.events.EventDispatcher}
         */
        this._target = target;
        /**
         * {Object}
         */
        this.data = data;
    };

    /**
     * Get event type
     *
     * @returns {String}
     */
    Event.prototype.type = function() {
        return this._type;
    };

    /**
     * Get event target
     *
     * @returns {andrea.blink.events.EventDispatcher}
     */
    Event.prototype.target = function() {
        return this._target;
    };

})();
