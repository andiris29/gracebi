(function() {

    var blink = andrea.blink;

    blink.declare("andrea.blink.events.EventDispatcher");

    var utils = andrea.blink.utils

    /**
     * EventDispatcher Class
     * we remove the orignal two properties, because this is Base class;
     * all the properties should be dynamically created during function call
     * of subclass.
     *
     */
    var EventDispatcher = andrea.blink.events.EventDispatcher = function() {
        this.__className = "andrea.blink.events.EventDispatcher";

        // lazy create the listeners maps
        // this._listeners/*<String Array<{type:type, scope:scope, listener:listener, priority:priority}>>*/ = {};
        /**
         * {Boolean}
         */
        this._enableDispatchEvent = true;
    };

    /**
     * Add event listener
     *
     * @param {String} type
     *            The type of event
     * @param {Function} listener
     *            The listener function that processes the event
     * @param {Object} scope
     *            scope
     * @param {int} priority
     *            The priority level of the event listener
     */
    EventDispatcher.prototype.addEventListener = function(type, listener, scope, priority) {
        // default priority is 0 if priority is not assigned or null.
        if (!priority) {
            priority = 0;
        }

        var eventListener = this._findEventListener(type, listener, scope);
        if (eventListener) {
            // already exists
            return;
        }

        eventListener = {
            type : type,
            scope : scope,
            listener : listener,
            priority : priority
        };

        var listeners = this.listeners()[type];
        if (!listeners) {
            this.listeners()[type] = listeners = [eventListener];
        } else {
            // insert the eventListener at correct position according to its priority
            var isAdded = false;
            for (var n = 0; n < listeners.length; ++n) {
                var temp = listeners[n];
                if (priority > temp.priority) {
                    listeners.splice(n, 0, eventListener);
                    isAdded = true;
                    break;
                }
            }

            if (isAdded == false) {
                listeners.push(eventListener);
            }
        }
    };

    /**
     * Removes a listener from the EventDispatcher object.
     *
     * @param {String} type
     *            The type of event
     * @param {Function} listener
     *            The listener function that processes the event
     * @param {Object} scope
     *            scope
     */
    EventDispatcher.prototype.removeEventListener = function(type, listener, scope) {
        var eventListener = this._findEventListener(type, listener, scope);
        if (eventListener) {
            var listeners = this.listeners()[type];
            listeners.splice(listeners.indexOf(eventListener), 1);
        }
    };

    /**
     * Removes the listeners of s specified event type.
     *
     * @param {String} type
     *            The type of event
     */
    EventDispatcher.prototype.removeEventListeners = function(type) {
        this.listeners()[type] = [];
    };

    /**
     * Removes all the listener.
     */
    EventDispatcher.prototype.removeAllEventListeners = function() {
        this._listeners = {};
    };

    /**
     * Checks whether the EventDispatcher object has any listeners registered for a specific type, listener and scope of event.
     *
     * @param {String} type
     *            The type of event
     * @param {Function} listener
     *            The listener function that processes the event
     * @param {Object} scope
     *            scope
     * @returns {Boolean}
     */
    EventDispatcher.prototype.hasEventListener = function(type, listener, scope) {
        var eventListener = this._findEventListener(type, listener, scope);
        return eventListener != null;
    };

    /**
     * Checks whether the EventDispatcher object has any listeners registered for a specific type (with any listeners or scopes) of event.
     *
     * @param {String} type
     *            The type of event
     * @returns {Boolean}
     */
    EventDispatcher.prototype.hasEventListeners = function(type) {
        var listeners = this.listeners()[type];
        if (listeners) {
            return listeners.length > 0;
        }
        return false;
    };

    /**
     * Dispatch event
     *
     * @param {Event} event
     *            The event object
     * @returns {Boolean}
     */
    EventDispatcher.prototype.dispatchEvent = function(event) {
        if (this._enableDispatchEvent === undefined)
            this._enableDispatchEvent = true;
        if (this._enableDispatchEvent) {
            var type = event.type();
            var listeners = this.listeners()[type];
            if (listeners) {
                var clones = listeners.slice(0);
                for (var n = 0; n < clones.length; ++n) {
                    var listener = clones[n];
                    listener.listener.call(listener.scope, event);
                }
            }
        }
    };

    EventDispatcher.prototype.enableDispatchEvent = function(v) {
        if (this._enableDispatchEvent === undefined)
            this._enableDispatchEvent = true;
        if (arguments.length >= 1) {
            if (utils.isBoolean(v)) {
                this._enableDispatchEvent = v;
            }
            return this;
        } else {
            return this._enableDispatchEvent;
        }
    };

    // -------------------------------------------
    // Private Methods
    // -------------------------------------------
    
    /**
     * Find the EventListener
     *
     * @param {String} type
     *            The type of event
     * @param {Function} listener
     *            The listener function that processes the event
     * @param {Object} scope
     *            scope
     * @returns {Object|null}
     */
    EventDispatcher.prototype._findEventListener = function(type, listener, scope) {
        var listeners = this.listeners()[type];
        if (!listeners) {
            return null;
        };

        for (var n = 0; n < listeners.length; ++n) {
            var eventListener = listeners[n];
            if (eventListener.listener === listener && eventListener.scope === scope) {
                return eventListener;
            }
        }

        return null;
    };

    /**
     * Read only
     */
    EventDispatcher.prototype.listeners = function() {
        if (this._listeners === undefined)
            this._listeners = {};
        return this._listeners;
    };

})();
