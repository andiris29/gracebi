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

})();