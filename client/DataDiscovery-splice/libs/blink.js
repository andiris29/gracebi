/**
 * Dependencies
 * 	underscore-1.4.4
 *
 */

(function() {
	// make sure undefined is undefined
	var undefined;

	if (window) {
		andrea = window.andrea || {};
	} else {
		andrea = andrea || {};
	}

	if (window.andrea) {
		andrea.blink = window.andrea.blink || {};
	} else {
		andrea.blink = andrea.blink || {};
	}

	var blink = andrea.blink;

	/**
	 * Version number like 1.0.0.
	 *
	 * @return {String} the version number
	 * @public
	 * @static
	 */
	blink.VERSION = function() {
		return "1.0.0";
	};

	/**
	 * Build number like 100.
	 *
	 * @return {Number} the build number
	 * @public
	 * @static
	 */
	// Do NOT change this function including the coding format,
	// it will be auto-updated by build script.
	blink.BUILD = function() {
		return 1;
	};

	/**
	 * Declear a module and create namespace.
	 *
	 * @para {String} ns the module namespace
	 * @return {Object} the created module
	 * @public
	 * @static
	 */
	blink.declare = function(ns) {
		if (!ns)
			throw new Error("name required");
		if ( typeof (ns) != "string")
			throw new Error("name has to be a string");
		if (ns.charAt(0) == '.' || ns.charAt(ns.length - 1) == '.' || ns.indexOf("..") != -1)
			throw new Error("illegal name: " + ns);

		ns = ns.split(".");
		var o = window;
		for (var i = 0; i < ns.length; i++) {
			o[ns[i]] = o[ns[i]] || {};
			o = o[ns[i]];
		}
		return o;
	};

	/**
	 * Require a class module (js file).
	 * JSDep use this to dump all the js class dependencies.
	 *
	 * @para {String} ns the module namespace
	 * @public
	 * @static
	 */
	blink.require = function(ns) {
		// TODO: [BI4.0SP5+] support lazy loading only necessary js files in runtime.
		// We don't do this in BI4.0 SP5 because JSGen handles this and only outputs necessary js files.
	};

	/**
	 * Extend class, superClz's constructor will be applied with no parameters.
	 *
	 * @para {function} subClz the sub class
	 * @para {function} superClz the super class to be extended
	 * @return {function} the extended subClz
	 * @public
	 * @static
	 */
	blink.extend = function(subClz, superClz) {
		var subClzPrototype = subClz.prototype;

		if (superClz) {
			// add the superclass prototype to the subclass definition
			subClz.superclass = superClz.prototype;
		} else {
			console.log(subClz)
		}

		// copy prototype
		var F = function() {
		};
		F.prototype = superClz.prototype;

		subClz.prototype = new F();
		for (var prop in subClzPrototype) {
			if (subClzPrototype.hasOwnProperty(prop)) {
				subClz.prototype[prop] = subClzPrototype[prop];
			}
		}
		subClz.prototype.constructor = subClz;
		if (superClz.prototype.constructor == Object.prototype.constructor) {
			superClz.prototype.constructor = superClz;
		}
		return subClz;
	};

})();
(function() {

    var blink = andrea.blink;

    blink.declare("andrea.blink.utils");

    var utils = andrea.blink.utils;

    // static private in globale to make sure id is not duplicated
    var _vc_util_GEN_UID = 0;

    /**
     * return the global uid for HTML elements in the same window scope.
     *
     */
    utils.genUID = function() {
        if (!_vc_util_GEN_UID) {
            _vc_util_GEN_UID = 0;
        }
        return "vcgen_" + (_vc_util_GEN_UID++);
    };

    var class2type = {
        '[object Boolean]' : 'boolean',
        '[object Number]' : 'number',
        '[object String]' : 'string',
        '[object Function]' : 'function',
        '[object Array]' : 'array',
        '[object Date]' : 'date',
        '[object RegExp]' : 'regexp',
        '[object Object]' : 'object'
    };

    utils.applyObjectProperty = function(object, propertyName, propertyValue) {
        try {
            if (utils.isFunction(object[propertyName])) {
                object[propertyName](propertyValue);
            } else {
                object[propertyName] = propertyValue;
            }
        } catch(e) {
            console.log(e);
        }

    };

    /**
     * apply properties to a item
     *
     * @name utils.utils.SpreadSheetBindingManager.applyProperties
     * @memberOf Function.prototype
     * @function
     * @param {Object}
     *            the item to apply properties
     * @param {Array}
     *            the properties array
     * */
    utils.applyProperties = function(item, properties/*Array*/) {
        if (properties != null) {// apply the passed properties
            var len = properties.length;
            for (var i = 0; i < len; i++) {
                var property = properties[i];
                if (property && property != null) {
                    utils.applyObjectProperty(item, property.name, property.value);
                }
            }
        }
    }

    utils.getObjectProperty = function(object, propertyName) {
        try {
            if (utils.isFunction(object[propertyName])) {
                return object[propertyName]();
            } else if (object.hasOwnProperty(propertyName)) {
                return object[propertyName];
            }

        } catch(e) {
            console.log(e);
        }
    };
    utils.type = function(obj) {
        return obj == null ? String(obj) : class2type[Object.prototype.toString.call(obj)] || "object";
    };

    utils.isFunction = function(obj) {
        return utils.type(obj) === "function";
    };

    utils.isBoolean = function(obj) {
        return utils.type(obj) === "boolean";
    };

    utils.isString = function(obj) {
        return utils.type(obj) === "string";
    };

    utils.isArray = function(obj) {
        return utils.type(obj) === "array";
    };

    utils.isNumber = function(obj) {
        return utils.type(obj) === "number";
    };

    utils.isRegExp = function(obj) {
        return utils.type(obj) === "regexp";
    };

    /**
     * Sort an object Array.
     *
     * @param {Array} arr The object Array to sort.
     * @param {String} prop The object field for the sort.
     * @param {Boolean} [desc] Sort by ASC or DESC, by default is ASC.
     *
     */
    utils.sortArrayOn = function(arr, prop, desc) {
        if (utils.isArray(arr) && utils.isString(prop)) {
            arr.sort(function(a, b) {
                return desc ? (a[prop] < b[prop]) - (a[prop] > b[prop]) : (a[prop] > b[prop]) - (a[prop] < b[prop]);
            });
        }
    };

    /**
     * An empty function doing nothing.
     */
    utils.noop = function() {
    };

})();(function() {

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
(function() {

    var blink = andrea.blink;

    blink.declare("andrea.blink.mvc.View");

    var View = andrea.blink.mvc.View = function(dom) {
        View.superclass.constructor.apply(this, arguments);
        this.__className = "andrea.blink.mvc.View";

        this._dom = dom;
        this._$dom = $(dom);

        this._animationActivated = true;

        this._explicitWidth = null;
        this._explicitHeight = null;
        this._measuredWidth = 0;
        this._measuredHeight = 0;
    };

    blink.extend(andrea.blink.mvc.View, andrea.blink.events.EventDispatcher);

    View.prototype.dom = function() {
        return this._dom;
    };

    View.prototype.$dom = function() {
        return this._$dom;
    };

    View.prototype.activateAnimation = function() {
        this._animationActivated = true;
    };
    View.prototype.deactivateAnimation = function() {
        this._animationActivated = false;
    };

    View.prototype.size = function(value) {
        if (arguments.length > 0) {
            var invalidate = false;
            if (value.width != null && this._explicitWidth !== value.width) {
                this._explicitWidth = value.width;
                invalidate = true;
            }
            if (value.height != null && this._explicitHeight !== value.height) {
                this._explicitHeight = value.height;
                invalidate = true;
            }
            if (invalidate) {
                this.invalidateSize();
            }
            return this;
        } else {
            if (this._explicitWidth == null || this._explicitHeight == null) {
                this._measuredWidth = $(this._dom).outerWidth();
                this._measuredHeight = $(this._dom).outerHeight();
            }
            return {
                width : this._explicitWidth != null ? this._explicitWidth : this._measuredWidth,
                height : this._explicitHeight != null ? this._explicitHeight : this._measuredHeight,
            }
        }
    };
    View.prototype.invalidateSize = function() {
        this._validateSize();
    };
    View.prototype._validateSize = function() {

    };
})();
(function() {

    var blink = andrea.blink;

    blink.declare("andrea.blink.mvc.ViewMediator");

    var ViewMediator = andrea.blink.mvc.ViewMediator = function() {
        this.__className = "andrea.blink.mvc.ViewMediator";
    };

    /**
     * For child class to override, will be called when registerViewMediator
     */
    ViewMediator.prototype.init = function() {
    };

    /**
     *
     * @param {String} name
     * @return {Model}
     */
    ViewMediator.prototype._getModel = function(name) {
        return null;
    };

    /**
     *
     * @param {String} name
     * @param {Function} handler function(){...}
     */
    ViewMediator.prototype._subscribe = function(name, handler) {
    };

    /**
     *
     * @param {String} name
     * @param {Function} handler
     */
    ViewMediator.prototype._unsubscribe = function(name, handler) {
    };

    /**
     *
     * @param {String} name
     * @param {Object} parameters
     * @return {Object}
     */
    ViewMediator.prototype._action = function(name, parameters) {
        return null;
    };

})();(function() {

	var blink = andrea.blink;

	blink.declare("andrea.blink.mvc.App");

	var mvc = andrea.blink.mvc;
	var utils = andrea.blink.utils;
	var EventDispatcher = andrea.blink.events.EventDispatcher;

	var App = andrea.blink.mvc.App = function() {
		this.__className = "andrea.blink.mvc.App";

		// -------------------------------------------
		// Private Vars
		// -------------------------------------------

		/**
		 * {name, Action}
		 */
		var actions = {};
		/**
		 * {name, Model}
		 */
		var models = {};
		/**
		 * {name, ViewMediator}
		 */
		var viewMediators = {};
		/**
		 * {andrea.blink.events.EventDispatcher}
		 */
		var viewMediatorsEventBus = new EventDispatcher();

		// -------------------------------------------
		// Injection Functions
		// -------------------------------------------

		// /**
		// *
		// * @param {String} name
		// * @param {Object} data
		// */
		// var action_notify = function(name, data) {
		// if (utils.isString(name) && viewMediatorsEventBus.hasEventListeners(name)) {
		// var source = null;
		// for (var actionName in actions) {
		// if (actions[actionName] === this) {
		// source = actionName;
		// break;
		// }
		// }
		// var notification = new mvc.Notification(name, source, data);
		// viewMediatorsEventBus.dispatchEvent(notification);
		// }
		// };
		/**
		 *
		 * @param {String} name
		 * @param {Object} data
		 */
		var model_notify = function(name, data) {
			if (utils.isString(name) && viewMediatorsEventBus.hasEventListeners(name)) {
				var notification = new mvc.Notification(name, this, data);
				viewMediatorsEventBus.dispatchEvent(notification);
			}
		};

		/**
		 *
		 * @param {String} name
		 * @return {Model}
		 */
		var action_getModel = function(name) {
			if (utils.isString(name)) {
				return models[name];
			}
			return null;
		};

		/**
		 *
		 * @param {String} name
		 * @return {Model}
		 */
		var viewMediator_getModel = function(name) {
			if (utils.isString(name)) {
				return models[name];
			}
			return null;
		};

		/**
		 *
		 * @param {String} name
		 * @param {Function} handler
		 */
		var viewMediator_subscribe = function(name, handler) {
			if (utils.isString(name) && utils.isFunction(handler)) {
				viewMediatorsEventBus.addEventListener(name, handler);
			}
		};

		/**
		 *
		 * @param {String} name
		 * @param {Function} handler
		 */
		var viewMediator_unsubscribe = function(name, handler) {
			if (utils.isString(name) && utils.isFunction(handler)) {
				viewMediatorsEventBus.removeEventListener(name, handler);
			}
		};

		/**
		 *
		 * @param {String} name
		 * @param {Object} parameters
		 * @return {Object}
		 */
		var viewMediator_action = function(name, parameters) {
			if (utils.isString(name)) {
				var actionClz = actions[name];
				if (utils.isFunction(actionClz)) {
					var result = null;
					var actionInstance = new actionClz();
					if ( actionInstance instanceof mvc.Action) {
						// inject functions
						// actionInstance._notify = action_notify;						actionInstance._getModel = action_getModel;
						// try {							result = actionInstance.execute.call(actionInstance, parameters);
						// } catch(e) {
							// throw e;
						// } finally {
							// delete actionInstance._notify;
							// delete actionInstance._getModel;
						// }					}
					actionInstance = null;
					return result;
				}
			}
			return null;
		};

		// -------------------------------------------
		// Application Setup
		// -------------------------------------------

		/**
		 *
		 * @param {String} name
		 * @param {Action} action
		 */
		this.registerAction = function(name, actionClz) {
			if (utils.isString(name) && utils.isFunction(actionClz)) {
				actions[name] = actionClz;
			}
		};

		/**
		 *
		 * @param {String} name
		 */
		this.unregisterAction = function(name) {
			if (utils.isString(name)) {
				var actionClz = actions[name];
				if (utils.isFunction(actionClz)) {
					delete actions[name];
				}
			}
		};

		/**
		 *
		 * @param {String} name
		 * @param {Model} model
		 */
		this.registerModel = function(name, model) {
			if (utils.isString(name) && model instanceof mvc.Model) {
				model._notify = model_notify;
				models[name] = model;
			}
		};

		/**
		 *
		 * @param {String} name
		 */
		this.unregisterModel = function(name) {
			if (utils.isString(name)) {
				delete models[name];
			}
		};

		/**
		 *
		 * @param {String} name
		 * @param {ViewMediator} viewMediator
		 */
		this.registerViewMediator = function(name, viewMediator) {
			if (utils.isString(name) && viewMediator instanceof mvc.ViewMediator) {
				viewMediators[name] = viewMediator;
				// inject functions
				viewMediator._getModel = viewMediator_getModel;
				viewMediator._subscribe = viewMediator_subscribe;
				viewMediator._unsubscribe = viewMediator_unsubscribe;
				viewMediator._action = viewMediator_action;
				viewMediator.init();
			}
		};

		/**
		 *
		 * @param {String} name
		 */
		this.unregisterViewMediator = function(name) {
			if (utils.isString(name)) {
				var viewMediator = viewMediators[name];
				if ( viewMediator instanceof mvc.ViewMediator) {
					delete viewMediators[name];
					// clean up injections
					delete viewMediator._getModel;
					delete viewMediator._subscribe;
					delete viewMediator._unsubscribe;
					delete viewMediator._action;
				}
			}
		};
	};

})();
