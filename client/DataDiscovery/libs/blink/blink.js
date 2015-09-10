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
