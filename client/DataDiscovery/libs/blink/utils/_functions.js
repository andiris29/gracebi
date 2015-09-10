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

})();