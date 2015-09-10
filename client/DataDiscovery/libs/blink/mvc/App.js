(function() {

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
