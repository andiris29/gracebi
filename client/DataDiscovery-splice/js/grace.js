/*jslint browser: true, eqeqeq: true, bitwise: true, newcap: true, immed: true, regexp: false */

/**
LazyLoad makes it easy and painless to lazily load one or more external
JavaScript or CSS files on demand either during or after the rendering of a web
page.

Supported browsers include Firefox 2+, IE6+, Safari 3+ (including Mobile
Safari), Google Chrome, and Opera 9+. Other browsers may or may not work and
are not officially supported.

Visit https://github.com/rgrove/lazyload/ for more info.

Copyright (c) 2011 Ryan Grove <ryan@wonko.com>
All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

@module lazyload
@class LazyLoad
@static
*/

LazyLoad = (function (doc) {
  // -- Private Variables ------------------------------------------------------

  // User agent and feature test information.
  var env,

  // Reference to the <head> element (populated lazily).
  head,

  // Requests currently in progress, if any.
  pending = {},

  // Number of times we've polled to check whether a pending stylesheet has
  // finished loading. If this gets too high, we're probably stalled.
  pollCount = 0,

  // Queued requests.
  queue = {css: [], js: []},

  // Reference to the browser's list of stylesheets.
  styleSheets = doc.styleSheets;

  // -- Private Methods --------------------------------------------------------

  /**
  Creates and returns an HTML element with the specified name and attributes.

  @method createNode
  @param {String} name element name
  @param {Object} attrs name/value mapping of element attributes
  @return {HTMLElement}
  @private
  */
  function createNode(name, attrs) {
    var node = doc.createElement(name), attr;

    for (attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        node.setAttribute(attr, attrs[attr]);
      }
    }

    return node;
  }

  /**
  Called when the current pending resource of the specified type has finished
  loading. Executes the associated callback (if any) and loads the next
  resource in the queue.

  @method finish
  @param {String} type resource type ('css' or 'js')
  @private
  */
  function finish(type) {
    var p = pending[type],
        callback,
        urls;

    if (p) {
      callback = p.callback;
      urls     = p.urls;

      urls.shift();
      pollCount = 0;

      // If this is the last of the pending URLs, execute the callback and
      // start the next request in the queue (if any).
      if (!urls.length) {
        callback && callback.call(p.context, p.obj);
        pending[type] = null;
        queue[type].length && load(type);
      }
    }
  }

  /**
  Populates the <code>env</code> variable with user agent and feature test
  information.

  @method getEnv
  @private
  */
  function getEnv() {
    var ua = navigator.userAgent;

    env = {
      // True if this browser supports disabling async mode on dynamically
      // created script nodes. See
      // http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
      async: doc.createElement('script').async === true
    };

    (env.webkit = /AppleWebKit\//.test(ua))
      || (env.ie = /MSIE|Trident/.test(ua))
      || (env.opera = /Opera/.test(ua))
      || (env.gecko = /Gecko\//.test(ua))
      || (env.unknown = true);
  }

  /**
  Loads the specified resources, or the next resource of the specified type
  in the queue if no resources are specified. If a resource of the specified
  type is already being loaded, the new request will be queued until the
  first request has been finished.

  When an array of resource URLs is specified, those URLs will be loaded in
  parallel if it is possible to do so while preserving execution order. All
  browsers support parallel loading of CSS, but only Firefox and Opera
  support parallel loading of scripts. In other browsers, scripts will be
  queued and loaded one at a time to ensure correct execution order.

  @method load
  @param {String} type resource type ('css' or 'js')
  @param {String|Array} urls (optional) URL or array of URLs to load
  @param {Function} callback (optional) callback function to execute when the
    resource is loaded
  @param {Object} obj (optional) object to pass to the callback function
  @param {Object} context (optional) if provided, the callback function will
    be executed in this object's context
  @private
  */
  function load(type, urls, callback, obj, context) {
    var _finish = function () { finish(type); },
        isCSS   = type === 'css',
        nodes   = [],
        i, len, node, p, pendingUrls, url;

    env || getEnv();

    if (urls) {
      // If urls is a string, wrap it in an array. Otherwise assume it's an
      // array and create a copy of it so modifications won't be made to the
      // original.
      urls = typeof urls === 'string' ? [urls] : urls.concat();

      // Create a request object for each URL. If multiple URLs are specified,
      // the callback will only be executed after all URLs have been loaded.
      //
      // Sadly, Firefox and Opera are the only browsers capable of loading
      // scripts in parallel while preserving execution order. In all other
      // browsers, scripts must be loaded sequentially.
      //
      // All browsers respect CSS specificity based on the order of the link
      // elements in the DOM, regardless of the order in which the stylesheets
      // are actually downloaded.
      if (isCSS || env.async || env.gecko || env.opera) {
        // Load in parallel.
        queue[type].push({
          urls    : urls,
          callback: callback,
          obj     : obj,
          context : context
        });
      } else {
        // Load sequentially.
        for (i = 0, len = urls.length; i < len; ++i) {
          queue[type].push({
            urls    : [urls[i]],
            callback: i === len - 1 ? callback : null, // callback is only added to the last URL
            obj     : obj,
            context : context
          });
        }
      }
    }

    // If a previous load request of this type is currently in progress, we'll
    // wait our turn. Otherwise, grab the next item in the queue.
    if (pending[type] || !(p = pending[type] = queue[type].shift())) {
      return;
    }

    head || (head = doc.head || doc.getElementsByTagName('head')[0]);
    pendingUrls = p.urls;

    for (i = 0, len = pendingUrls.length; i < len; ++i) {
      url = pendingUrls[i];

      if (isCSS) {
          node = env.gecko ? createNode('style') : createNode('link', {
            href: url,
            rel : 'stylesheet'
          });
      } else {
        node = createNode('script', {src: url});
        node.async = false;
      }

      node.className = 'lazyload';
      node.setAttribute('charset', 'utf-8');

      if (env.ie && !isCSS && 'onreadystatechange' in node && !('draggable' in node)) {
        node.onreadystatechange = function () {
          if (/loaded|complete/.test(node.readyState)) {
            node.onreadystatechange = null;
            _finish();
          }
        };
      } else if (isCSS && (env.gecko || env.webkit)) {
        // Gecko and WebKit don't support the onload event on link nodes.
        if (env.webkit) {
          // In WebKit, we can poll for changes to document.styleSheets to
          // figure out when stylesheets have loaded.
          p.urls[i] = node.href; // resolve relative URLs (or polling won't work)
          pollWebKit();
        } else {
          // In Gecko, we can import the requested URL into a <style> node and
          // poll for the existence of node.sheet.cssRules. Props to Zach
          // Leatherman for calling my attention to this technique.
          node.innerHTML = '@import "' + url + '";';
          pollGecko(node);
        }
      } else {
        node.onload = node.onerror = _finish;
      }

      nodes.push(node);
    }

    for (i = 0, len = nodes.length; i < len; ++i) {
      head.appendChild(nodes[i]);
    }
  }

  /**
  Begins polling to determine when the specified stylesheet has finished loading
  in Gecko. Polling stops when all pending stylesheets have loaded or after 10
  seconds (to prevent stalls).

  Thanks to Zach Leatherman for calling my attention to the @import-based
  cross-domain technique used here, and to Oleg Slobodskoi for an earlier
  same-domain implementation. See Zach's blog for more details:
  http://www.zachleat.com/web/2010/07/29/load-css-dynamically/

  @method pollGecko
  @param {HTMLElement} node Style node to poll.
  @private
  */
  function pollGecko(node) {
    var hasRules;

    try {
      // We don't really need to store this value or ever refer to it again, but
      // if we don't store it, Closure Compiler assumes the code is useless and
      // removes it.
      hasRules = !!node.sheet.cssRules;
    } catch (ex) {
      // An exception means the stylesheet is still loading.
      pollCount += 1;

      if (pollCount < 200) {
        setTimeout(function () { pollGecko(node); }, 50);
      } else {
        // We've been polling for 10 seconds and nothing's happened. Stop
        // polling and finish the pending requests to avoid blocking further
        // requests.
        hasRules && finish('css');
      }

      return;
    }

    // If we get here, the stylesheet has loaded.
    finish('css');
  }

  /**
  Begins polling to determine when pending stylesheets have finished loading
  in WebKit. Polling stops when all pending stylesheets have loaded or after 10
  seconds (to prevent stalls).

  @method pollWebKit
  @private
  */
  function pollWebKit() {
    var css = pending.css, i;

    if (css) {
      i = styleSheets.length;

      // Look for a stylesheet matching the pending URL.
      while (--i >= 0) {
        if (styleSheets[i].href === css.urls[0]) {
          finish('css');
          break;
        }
      }

      pollCount += 1;

      if (css) {
        if (pollCount < 200) {
          setTimeout(pollWebKit, 50);
        } else {
          // We've been polling for 10 seconds and nothing's happened, which may
          // indicate that the stylesheet has been removed from the document
          // before it had a chance to load. Stop polling and finish the pending
          // request to prevent blocking further requests.
          finish('css');
        }
      }
    }
  }

  return {

    /**
    Requests the specified CSS URL or URLs and executes the specified
    callback (if any) when they have finished loading. If an array of URLs is
    specified, the stylesheets will be loaded in parallel and the callback
    will be executed after all stylesheets have finished loading.

    @method css
    @param {String|Array} urls CSS URL or array of CSS URLs to load
    @param {Function} callback (optional) callback function to execute when
      the specified stylesheets are loaded
    @param {Object} obj (optional) object to pass to the callback function
    @param {Object} context (optional) if provided, the callback function
      will be executed in this object's context
    @static
    */
    css: function (urls, callback, obj, context) {
      load('css', urls, callback, obj, context);
    },

    /**
    Requests the specified JavaScript URL or URLs and executes the specified
    callback (if any) when they have finished loading. If an array of URLs is
    specified and the browser supports it, the scripts will be loaded in
    parallel and the callback will be executed after all scripts have
    finished loading.

    Currently, only Firefox and Opera support parallel loading of scripts while
    preserving execution order. In other browsers, scripts will be
    queued and loaded one at a time to ensure correct execution order.

    @method js
    @param {String|Array} urls JS URL or array of JS URLs to load
    @param {Function} callback (optional) callback function to execute when
      the specified scripts are loaded
    @param {Object} obj (optional) object to pass to the callback function
    @param {Object} context (optional) if provided, the callback function
      will be executed in this object's context
    @static
    */
    js: function (urls, callback, obj, context) {
      load('js', urls, callback, obj, context);
    }

  };
})(this.document);
/*!	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/

var swfobject = function() {
	
	var UNDEF = "undefined",
		OBJECT = "object",
		SHOCKWAVE_FLASH = "Shockwave Flash",
		SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash",
		FLASH_MIME_TYPE = "application/x-shockwave-flash",
		EXPRESS_INSTALL_ID = "SWFObjectExprInst",
		ON_READY_STATE_CHANGE = "onreadystatechange",
		
		win = window,
		doc = document,
		nav = navigator,
		
		plugin = false,
		domLoadFnArr = [main],
		regObjArr = [],
		objIdArr = [],
		listenersArr = [],
		storedAltContent,
		storedAltContentId,
		storedCallbackFn,
		storedCallbackObj,
		isDomLoaded = false,
		isExpressInstallActive = false,
		dynamicStylesheet,
		dynamicStylesheetMedia,
		autoHideShow = true,
	
	/* Centralized function for browser feature detection
		- User agent string detection is only used when no good alternative is possible
		- Is executed directly for optimal performance
	*/	
	ua = function() {
		var w3cdom = typeof doc.getElementById != UNDEF && typeof doc.getElementsByTagName != UNDEF && typeof doc.createElement != UNDEF,
			u = nav.userAgent.toLowerCase(),
			p = nav.platform.toLowerCase(),
			windows = p ? /win/.test(p) : /win/.test(u),
			mac = p ? /mac/.test(p) : /mac/.test(u),
			webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, // returns either the webkit version or false if not webkit
			ie = !+"\v1", // feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
			playerVersion = [0,0,0],
			d = null;
		if (typeof nav.plugins != UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] == OBJECT) {
			d = nav.plugins[SHOCKWAVE_FLASH].description;
			if (d && !(typeof nav.mimeTypes != UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && !nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) { // navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
				plugin = true;
				ie = false; // cascaded feature detection for Internet Explorer
				d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
				playerVersion[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
				playerVersion[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
				playerVersion[2] = /[a-zA-Z]/.test(d) ? parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
			}
		}
		else if (typeof win.ActiveXObject != UNDEF) {
			try {
				var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
				if (a) { // a will return null when ActiveX is disabled
					d = a.GetVariable("$version");
					if (d) {
						ie = true; // cascaded feature detection for Internet Explorer
						d = d.split(" ")[1].split(",");
						playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
					}
				}
			}
			catch(e) {}
		}
		return { w3:w3cdom, pv:playerVersion, wk:webkit, ie:ie, win:windows, mac:mac };
	}(),
	
	/* Cross-browser onDomLoad
		- Will fire an event as soon as the DOM of a web page is loaded
		- Internet Explorer workaround based on Diego Perini's solution: http://javascript.nwbox.com/IEContentLoaded/
		- Regular onload serves as fallback
	*/ 
	onDomLoad = function() {
		if (!ua.w3) { return; }
		if ((typeof doc.readyState != UNDEF && doc.readyState == "complete") || (typeof doc.readyState == UNDEF && (doc.getElementsByTagName("body")[0] || doc.body))) { // function is fired after onload, e.g. when script is inserted dynamically 
			callDomLoadFunctions();
		}
		if (!isDomLoaded) {
			if (typeof doc.addEventListener != UNDEF) {
				doc.addEventListener("DOMContentLoaded", callDomLoadFunctions, false);
			}		
			if (ua.ie && ua.win) {
				doc.attachEvent(ON_READY_STATE_CHANGE, function() {
					if (doc.readyState == "complete") {
						doc.detachEvent(ON_READY_STATE_CHANGE, arguments.callee);
						callDomLoadFunctions();
					}
				});
				if (win == top) { // if not inside an iframe
					(function(){
						if (isDomLoaded) { return; }
						try {
							doc.documentElement.doScroll("left");
						}
						catch(e) {
							setTimeout(arguments.callee, 0);
							return;
						}
						callDomLoadFunctions();
					})();
				}
			}
			if (ua.wk) {
				(function(){
					if (isDomLoaded) { return; }
					if (!/loaded|complete/.test(doc.readyState)) {
						setTimeout(arguments.callee, 0);
						return;
					}
					callDomLoadFunctions();
				})();
			}
			addLoadEvent(callDomLoadFunctions);
		}
	}();
	
	function callDomLoadFunctions() {
		if (isDomLoaded) { return; }
		try { // test if we can really add/remove elements to/from the DOM; we don't want to fire it too early
			var t = doc.getElementsByTagName("body")[0].appendChild(createElement("span"));
			t.parentNode.removeChild(t);
		}
		catch (e) { return; }
		isDomLoaded = true;
		var dl = domLoadFnArr.length;
		for (var i = 0; i < dl; i++) {
			domLoadFnArr[i]();
		}
	}
	
	function addDomLoadEvent(fn) {
		if (isDomLoaded) {
			fn();
		}
		else { 
			domLoadFnArr[domLoadFnArr.length] = fn; // Array.push() is only available in IE5.5+
		}
	}
	
	/* Cross-browser onload
		- Based on James Edwards' solution: http://brothercake.com/site/resources/scripts/onload/
		- Will fire an event as soon as a web page including all of its assets are loaded 
	 */
	function addLoadEvent(fn) {
		if (typeof win.addEventListener != UNDEF) {
			win.addEventListener("load", fn, false);
		}
		else if (typeof doc.addEventListener != UNDEF) {
			doc.addEventListener("load", fn, false);
		}
		else if (typeof win.attachEvent != UNDEF) {
			addListener(win, "onload", fn);
		}
		else if (typeof win.onload == "function") {
			var fnOld = win.onload;
			win.onload = function() {
				fnOld();
				fn();
			};
		}
		else {
			win.onload = fn;
		}
	}
	
	/* Main function
		- Will preferably execute onDomLoad, otherwise onload (as a fallback)
	*/
	function main() { 
		if (plugin) {
			testPlayerVersion();
		}
		else {
			matchVersions();
		}
	}
	
	/* Detect the Flash Player version for non-Internet Explorer browsers
		- Detecting the plug-in version via the object element is more precise than using the plugins collection item's description:
		  a. Both release and build numbers can be detected
		  b. Avoid wrong descriptions by corrupt installers provided by Adobe
		  c. Avoid wrong descriptions by multiple Flash Player entries in the plugin Array, caused by incorrect browser imports
		- Disadvantage of this method is that it depends on the availability of the DOM, while the plugins collection is immediately available
	*/
	function testPlayerVersion() {
		var b = doc.getElementsByTagName("body")[0];
		var o = createElement(OBJECT);
		o.setAttribute("type", FLASH_MIME_TYPE);
		var t = b.appendChild(o);
		if (t) {
			var counter = 0;
			(function(){
				if (typeof t.GetVariable != UNDEF) {
					var d = t.GetVariable("$version");
					if (d) {
						d = d.split(" ")[1].split(",");
						ua.pv = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
					}
				}
				else if (counter < 10) {
					counter++;
					setTimeout(arguments.callee, 10);
					return;
				}
				b.removeChild(o);
				t = null;
				matchVersions();
			})();
		}
		else {
			matchVersions();
		}
	}
	
	/* Perform Flash Player and SWF version matching; static publishing only
	*/
	function matchVersions() {
		var rl = regObjArr.length;
		if (rl > 0) {
			for (var i = 0; i < rl; i++) { // for each registered object element
				var id = regObjArr[i].id;
				var cb = regObjArr[i].callbackFn;
				var cbObj = {success:false, id:id};
				if (ua.pv[0] > 0) {
					var obj = getElementById(id);
					if (obj) {
						if (hasPlayerVersion(regObjArr[i].swfVersion) && !(ua.wk && ua.wk < 312)) { // Flash Player version >= published SWF version: Houston, we have a match!
							setVisibility(id, true);
							if (cb) {
								cbObj.success = true;
								cbObj.ref = getObjectById(id);
								cb(cbObj);
							}
						}
						else if (regObjArr[i].expressInstall && canExpressInstall()) { // show the Adobe Express Install dialog if set by the web page author and if supported
							var att = {};
							att.data = regObjArr[i].expressInstall;
							att.width = obj.getAttribute("width") || "0";
							att.height = obj.getAttribute("height") || "0";
							if (obj.getAttribute("class")) { att.styleclass = obj.getAttribute("class"); }
							if (obj.getAttribute("align")) { att.align = obj.getAttribute("align"); }
							// parse HTML object param element's name-value pairs
							var par = {};
							var p = obj.getElementsByTagName("param");
							var pl = p.length;
							for (var j = 0; j < pl; j++) {
								if (p[j].getAttribute("name").toLowerCase() != "movie") {
									par[p[j].getAttribute("name")] = p[j].getAttribute("value");
								}
							}
							showExpressInstall(att, par, id, cb);
						}
						else { // Flash Player and SWF version mismatch or an older Webkit engine that ignores the HTML object element's nested param elements: display alternative content instead of SWF
							displayAltContent(obj);
							if (cb) { cb(cbObj); }
						}
					}
				}
				else {	// if no Flash Player is installed or the fp version cannot be detected we let the HTML object element do its job (either show a SWF or alternative content)
					setVisibility(id, true);
					if (cb) {
						var o = getObjectById(id); // test whether there is an HTML object element or not
						if (o && typeof o.SetVariable != UNDEF) { 
							cbObj.success = true;
							cbObj.ref = o;
						}
						cb(cbObj);
					}
				}
			}
		}
	}
	
	function getObjectById(objectIdStr) {
		var r = null;
		var o = getElementById(objectIdStr);
		if (o && o.nodeName == "OBJECT") {
			if (typeof o.SetVariable != UNDEF) {
				r = o;
			}
			else {
				var n = o.getElementsByTagName(OBJECT)[0];
				if (n) {
					r = n;
				}
			}
		}
		return r;
	}
	
	/* Requirements for Adobe Express Install
		- only one instance can be active at a time
		- fp 6.0.65 or higher
		- Win/Mac OS only
		- no Webkit engines older than version 312
	*/
	function canExpressInstall() {
		return !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac) && !(ua.wk && ua.wk < 312);
	}
	
	/* Show the Adobe Express Install dialog
		- Reference: http://www.adobe.com/cfusion/knowledgebase/index.cfm?id=6a253b75
	*/
	function showExpressInstall(att, par, replaceElemIdStr, callbackFn) {
		isExpressInstallActive = true;
		storedCallbackFn = callbackFn || null;
		storedCallbackObj = {success:false, id:replaceElemIdStr};
		var obj = getElementById(replaceElemIdStr);
		if (obj) {
			if (obj.nodeName == "OBJECT") { // static publishing
				storedAltContent = abstractAltContent(obj);
				storedAltContentId = null;
			}
			else { // dynamic publishing
				storedAltContent = obj;
				storedAltContentId = replaceElemIdStr;
			}
			att.id = EXPRESS_INSTALL_ID;
			if (typeof att.width == UNDEF || (!/%$/.test(att.width) && parseInt(att.width, 10) < 310)) { att.width = "310"; }
			if (typeof att.height == UNDEF || (!/%$/.test(att.height) && parseInt(att.height, 10) < 137)) { att.height = "137"; }
			doc.title = doc.title.slice(0, 47) + " - Flash Player Installation";
			var pt = ua.ie && ua.win ? "ActiveX" : "PlugIn",
				fv = "MMredirectURL=" + encodeURI(window.location).toString().replace(/&/g,"%26") + "&MMplayerType=" + pt + "&MMdoctitle=" + doc.title;
			if (typeof par.flashvars != UNDEF) {
				par.flashvars += "&" + fv;
			}
			else {
				par.flashvars = fv;
			}
			// IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
			// because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
			if (ua.ie && ua.win && obj.readyState != 4) {
				var newObj = createElement("div");
				replaceElemIdStr += "SWFObjectNew";
				newObj.setAttribute("id", replaceElemIdStr);
				obj.parentNode.insertBefore(newObj, obj); // insert placeholder div that will be replaced by the object element that loads expressinstall.swf
				obj.style.display = "none";
				(function(){
					if (obj.readyState == 4) {
						obj.parentNode.removeChild(obj);
					}
					else {
						setTimeout(arguments.callee, 10);
					}
				})();
			}
			createSWF(att, par, replaceElemIdStr);
		}
	}
	
	/* Functions to abstract and display alternative content
	*/
	function displayAltContent(obj) {
		if (ua.ie && ua.win && obj.readyState != 4) {
			// IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
			// because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
			var el = createElement("div");
			obj.parentNode.insertBefore(el, obj); // insert placeholder div that will be replaced by the alternative content
			el.parentNode.replaceChild(abstractAltContent(obj), el);
			obj.style.display = "none";
			(function(){
				if (obj.readyState == 4) {
					obj.parentNode.removeChild(obj);
				}
				else {
					setTimeout(arguments.callee, 10);
				}
			})();
		}
		else {
			obj.parentNode.replaceChild(abstractAltContent(obj), obj);
		}
	} 

	function abstractAltContent(obj) {
		var ac = createElement("div");
		if (ua.win && ua.ie) {
			ac.innerHTML = obj.innerHTML;
		}
		else {
			var nestedObj = obj.getElementsByTagName(OBJECT)[0];
			if (nestedObj) {
				var c = nestedObj.childNodes;
				if (c) {
					var cl = c.length;
					for (var i = 0; i < cl; i++) {
						if (!(c[i].nodeType == 1 && c[i].nodeName == "PARAM") && !(c[i].nodeType == 8)) {
							ac.appendChild(c[i].cloneNode(true));
						}
					}
				}
			}
		}
		return ac;
	}
	
	/* Cross-browser dynamic SWF creation
	*/
	function createSWF(attObj, parObj, id) {
		var r, el = getElementById(id);
		if (ua.wk && ua.wk < 312) { return r; }
		if (el) {
			if (typeof attObj.id == UNDEF) { // if no 'id' is defined for the object element, it will inherit the 'id' from the alternative content
				attObj.id = id;
			}
			if (ua.ie && ua.win) { // Internet Explorer + the HTML object element + W3C DOM methods do not combine: fall back to outerHTML
				var att = "";
				for (var i in attObj) {
					if (attObj[i] != Object.prototype[i]) { // filter out prototype additions from other potential libraries
						if (i.toLowerCase() == "data") {
							parObj.movie = attObj[i];
						}
						else if (i.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
							att += ' class="' + attObj[i] + '"';
						}
						else if (i.toLowerCase() != "classid") {
							att += ' ' + i + '="' + attObj[i] + '"';
						}
					}
				}
				var par = "";
				for (var j in parObj) {
					if (parObj[j] != Object.prototype[j]) { // filter out prototype additions from other potential libraries
						par += '<param name="' + j + '" value="' + parObj[j] + '" />';
					}
				}
				el.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + '>' + par + '</object>';
				objIdArr[objIdArr.length] = attObj.id; // stored to fix object 'leaks' on unload (dynamic publishing only)
				r = getElementById(attObj.id);	
			}
			else { // well-behaving browsers
				var o = createElement(OBJECT);
				o.setAttribute("type", FLASH_MIME_TYPE);
				for (var m in attObj) {
					if (attObj[m] != Object.prototype[m]) { // filter out prototype additions from other potential libraries
						if (m.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
							o.setAttribute("class", attObj[m]);
						}
						else if (m.toLowerCase() != "classid") { // filter out IE specific attribute
							o.setAttribute(m, attObj[m]);
						}
					}
				}
				for (var n in parObj) {
					if (parObj[n] != Object.prototype[n] && n.toLowerCase() != "movie") { // filter out prototype additions from other potential libraries and IE specific param element
						createObjParam(o, n, parObj[n]);
					}
				}
				el.parentNode.replaceChild(o, el);
				r = o;
			}
		}
		return r;
	}
	
	function createObjParam(el, pName, pValue) {
		var p = createElement("param");
		p.setAttribute("name", pName);	
		p.setAttribute("value", pValue);
		el.appendChild(p);
	}
	
	/* Cross-browser SWF removal
		- Especially needed to safely and completely remove a SWF in Internet Explorer
	*/
	function removeSWF(id) {
		var obj = getElementById(id);
		if (obj && obj.nodeName == "OBJECT") {
			if (ua.ie && ua.win) {
				obj.style.display = "none";
				(function(){
					if (obj.readyState == 4) {
						removeObjectInIE(id);
					}
					else {
						setTimeout(arguments.callee, 10);
					}
				})();
			}
			else {
				obj.parentNode.removeChild(obj);
			}
		}
	}
	
	function removeObjectInIE(id) {
		var obj = getElementById(id);
		if (obj) {
			for (var i in obj) {
				if (typeof obj[i] == "function") {
					obj[i] = null;
				}
			}
			obj.parentNode.removeChild(obj);
		}
	}
	
	/* Functions to optimize JavaScript compression
	*/
	function getElementById(id) {
		var el = null;
		try {
			el = doc.getElementById(id);
		}
		catch (e) {}
		return el;
	}
	
	function createElement(el) {
		return doc.createElement(el);
	}
	
	/* Updated attachEvent function for Internet Explorer
		- Stores attachEvent information in an Array, so on unload the detachEvent functions can be called to avoid memory leaks
	*/	
	function addListener(target, eventType, fn) {
		target.attachEvent(eventType, fn);
		listenersArr[listenersArr.length] = [target, eventType, fn];
	}
	
	/* Flash Player and SWF content version matching
	*/
	function hasPlayerVersion(rv) {
		var pv = ua.pv, v = rv.split(".");
		v[0] = parseInt(v[0], 10);
		v[1] = parseInt(v[1], 10) || 0; // supports short notation, e.g. "9" instead of "9.0.0"
		v[2] = parseInt(v[2], 10) || 0;
		return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
	}
	
	/* Cross-browser dynamic CSS creation
		- Based on Bobby van der Sluis' solution: http://www.bobbyvandersluis.com/articles/dynamicCSS.php
	*/	
	function createCSS(sel, decl, media, newStyle) {
		if (ua.ie && ua.mac) { return; }
		var h = doc.getElementsByTagName("head")[0];
		if (!h) { return; } // to also support badly authored HTML pages that lack a head element
		var m = (media && typeof media == "string") ? media : "screen";
		if (newStyle) {
			dynamicStylesheet = null;
			dynamicStylesheetMedia = null;
		}
		if (!dynamicStylesheet || dynamicStylesheetMedia != m) { 
			// create dynamic stylesheet + get a global reference to it
			var s = createElement("style");
			s.setAttribute("type", "text/css");
			s.setAttribute("media", m);
			dynamicStylesheet = h.appendChild(s);
			if (ua.ie && ua.win && typeof doc.styleSheets != UNDEF && doc.styleSheets.length > 0) {
				dynamicStylesheet = doc.styleSheets[doc.styleSheets.length - 1];
			}
			dynamicStylesheetMedia = m;
		}
		// add style rule
		if (ua.ie && ua.win) {
			if (dynamicStylesheet && typeof dynamicStylesheet.addRule == OBJECT) {
				dynamicStylesheet.addRule(sel, decl);
			}
		}
		else {
			if (dynamicStylesheet && typeof doc.createTextNode != UNDEF) {
				dynamicStylesheet.appendChild(doc.createTextNode(sel + " {" + decl + "}"));
			}
		}
	}
	
	function setVisibility(id, isVisible) {
		if (!autoHideShow) { return; }
		var v = isVisible ? "visible" : "hidden";
		if (isDomLoaded && getElementById(id)) {
			getElementById(id).style.visibility = v;
		}
		else {
			createCSS("#" + id, "visibility:" + v);
		}
	}

	/* Filter to avoid XSS attacks
	*/
	function urlEncodeIfNecessary(s) {
		var regex = /[\\\"<>\.;]/;
		var hasBadChars = regex.exec(s) != null;
		return hasBadChars && typeof encodeURIComponent != UNDEF ? encodeURIComponent(s) : s;
	}
	
	/* Release memory to avoid memory leaks caused by closures, fix hanging audio/video threads and force open sockets/NetConnections to disconnect (Internet Explorer only)
	*/
	var cleanup = function() {
		if (ua.ie && ua.win) {
			window.attachEvent("onunload", function() {
				// remove listeners to avoid memory leaks
				var ll = listenersArr.length;
				for (var i = 0; i < ll; i++) {
					listenersArr[i][0].detachEvent(listenersArr[i][1], listenersArr[i][2]);
				}
				// cleanup dynamically embedded objects to fix audio/video threads and force open sockets and NetConnections to disconnect
				var il = objIdArr.length;
				for (var j = 0; j < il; j++) {
					removeSWF(objIdArr[j]);
				}
				// cleanup library's main closures to avoid memory leaks
				for (var k in ua) {
					ua[k] = null;
				}
				ua = null;
				for (var l in swfobject) {
					swfobject[l] = null;
				}
				swfobject = null;
			});
		}
	}();
	
	return {
		/* Public API
			- Reference: http://code.google.com/p/swfobject/wiki/documentation
		*/ 
		registerObject: function(objectIdStr, swfVersionStr, xiSwfUrlStr, callbackFn) {
			if (ua.w3 && objectIdStr && swfVersionStr) {
				var regObj = {};
				regObj.id = objectIdStr;
				regObj.swfVersion = swfVersionStr;
				regObj.expressInstall = xiSwfUrlStr;
				regObj.callbackFn = callbackFn;
				regObjArr[regObjArr.length] = regObj;
				setVisibility(objectIdStr, false);
			}
			else if (callbackFn) {
				callbackFn({success:false, id:objectIdStr});
			}
		},
		
		getObjectById: function(objectIdStr) {
			if (ua.w3) {
				return getObjectById(objectIdStr);
			}
		},
		
		embedSWF: function(swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn) {
			var callbackObj = {success:false, id:replaceElemIdStr};
			if (ua.w3 && !(ua.wk && ua.wk < 312) && swfUrlStr && replaceElemIdStr && widthStr && heightStr && swfVersionStr) {
				setVisibility(replaceElemIdStr, false);
				addDomLoadEvent(function() {
					widthStr += ""; // auto-convert to string
					heightStr += "";
					var att = {};
					if (attObj && typeof attObj === OBJECT) {
						for (var i in attObj) { // copy object to avoid the use of references, because web authors often reuse attObj for multiple SWFs
							att[i] = attObj[i];
						}
					}
					att.data = swfUrlStr;
					att.width = widthStr;
					att.height = heightStr;
					var par = {}; 
					if (parObj && typeof parObj === OBJECT) {
						for (var j in parObj) { // copy object to avoid the use of references, because web authors often reuse parObj for multiple SWFs
							par[j] = parObj[j];
						}
					}
					if (flashvarsObj && typeof flashvarsObj === OBJECT) {
						for (var k in flashvarsObj) { // copy object to avoid the use of references, because web authors often reuse flashvarsObj for multiple SWFs
							if (typeof par.flashvars != UNDEF) {
								par.flashvars += "&" + k + "=" + flashvarsObj[k];
							}
							else {
								par.flashvars = k + "=" + flashvarsObj[k];
							}
						}
					}
					if (hasPlayerVersion(swfVersionStr)) { // create SWF
						var obj = createSWF(att, par, replaceElemIdStr);
						if (att.id == replaceElemIdStr) {
							setVisibility(replaceElemIdStr, true);
						}
						callbackObj.success = true;
						callbackObj.ref = obj;
					}
					else if (xiSwfUrlStr && canExpressInstall()) { // show Adobe Express Install
						att.data = xiSwfUrlStr;
						showExpressInstall(att, par, replaceElemIdStr, callbackFn);
						return;
					}
					else { // show alternative content
						setVisibility(replaceElemIdStr, true);
					}
					if (callbackFn) { callbackFn(callbackObj); }
				});
			}
			else if (callbackFn) { callbackFn(callbackObj);	}
		},
		
		switchOffAutoHideShow: function() {
			autoHideShow = false;
		},
		
		ua: ua,
		
		getFlashPlayerVersion: function() {
			return { major:ua.pv[0], minor:ua.pv[1], release:ua.pv[2] };
		},
		
		hasFlashPlayerVersion: hasPlayerVersion,
		
		createSWF: function(attObj, parObj, replaceElemIdStr) {
			if (ua.w3) {
				return createSWF(attObj, parObj, replaceElemIdStr);
			}
			else {
				return undefined;
			}
		},
		
		showExpressInstall: function(att, par, replaceElemIdStr, callbackFn) {
			if (ua.w3 && canExpressInstall()) {
				showExpressInstall(att, par, replaceElemIdStr, callbackFn);
			}
		},
		
		removeSWF: function(objElemIdStr) {
			if (ua.w3) {
				removeSWF(objElemIdStr);
			}
		},
		
		createCSS: function(selStr, declStr, mediaStr, newStyleBoolean) {
			if (ua.w3) {
				createCSS(selStr, declStr, mediaStr, newStyleBoolean);
			}
		},
		
		addDomLoadEvent: addDomLoadEvent,
		
		addLoadEvent: addLoadEvent,
		
		getQueryParamValue: function(param) {
			var q = doc.location.search || doc.location.hash;
			if (q) {
				if (/\?/.test(q)) { q = q.split("?")[1]; } // strip question mark
				if (param == null) {
					return urlEncodeIfNecessary(q);
				}
				var pairs = q.split("&");
				for (var i = 0; i < pairs.length; i++) {
					if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
						return urlEncodeIfNecessary(pairs[i].substring((pairs[i].indexOf("=") + 1)));
					}
				}
			}
			return "";
		},
		
		// For internal usage only
		expressInstallCallback: function() {
			if (isExpressInstallActive) {
				var obj = getElementById(EXPRESS_INSTALL_ID);
				if (obj && storedAltContent) {
					obj.parentNode.replaceChild(storedAltContent, obj);
					if (storedAltContentId) {
						setVisibility(storedAltContentId, true);
						if (ua.ie && ua.win) { storedAltContent.style.display = "block"; }
					}
					if (storedCallbackFn) { storedCallbackFn(storedCallbackObj); }
				}
				isExpressInstallActive = false;
			} 
		}
	};
}();
(function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,h=e.reduce,v=e.reduceRight,d=e.filter,g=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,_=Object.keys,j=i.bind,w=function(n){return n instanceof w?n:this instanceof w?(this._wrapped=n,void 0):new w(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=w),exports._=w):n._=w,w.VERSION="1.4.4";var A=w.each=w.forEach=function(n,t,e){if(null!=n)if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a in n)if(w.has(n,a)&&t.call(e,n[a],a,n)===r)return};w.map=w.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e[e.length]=t.call(r,n,u,i)}),e)};var O="Reduce of empty array with no initial value";w.reduce=w.foldl=w.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduce===h)return e&&(t=w.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(O);return r},w.reduceRight=w.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduceRight===v)return e&&(t=w.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=w.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(O);return r},w.find=w.detect=function(n,t,r){var e;return E(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},w.filter=w.select=function(n,t,r){var e=[];return null==n?e:d&&n.filter===d?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&(e[e.length]=n)}),e)},w.reject=function(n,t,r){return w.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},w.every=w.all=function(n,t,e){t||(t=w.identity);var u=!0;return null==n?u:g&&n.every===g?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var E=w.some=w.any=function(n,t,e){t||(t=w.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};w.contains=w.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:E(n,function(n){return n===t})},w.invoke=function(n,t){var r=o.call(arguments,2),e=w.isFunction(t);return w.map(n,function(n){return(e?t:n[t]).apply(n,r)})},w.pluck=function(n,t){return w.map(n,function(n){return n[t]})},w.where=function(n,t,r){return w.isEmpty(t)?r?null:[]:w[r?"find":"filter"](n,function(n){for(var r in t)if(t[r]!==n[r])return!1;return!0})},w.findWhere=function(n,t){return w.where(n,t,!0)},w.max=function(n,t,r){if(!t&&w.isArray(n)&&n[0]===+n[0]&&65535>n.length)return Math.max.apply(Math,n);if(!t&&w.isEmpty(n))return-1/0;var e={computed:-1/0,value:-1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a>=e.computed&&(e={value:n,computed:a})}),e.value},w.min=function(n,t,r){if(!t&&w.isArray(n)&&n[0]===+n[0]&&65535>n.length)return Math.min.apply(Math,n);if(!t&&w.isEmpty(n))return 1/0;var e={computed:1/0,value:1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;e.computed>a&&(e={value:n,computed:a})}),e.value},w.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=w.random(r++),e[r-1]=e[t],e[t]=n}),e};var k=function(n){return w.isFunction(n)?n:function(t){return t[n]}};w.sortBy=function(n,t,r){var e=k(t);return w.pluck(w.map(n,function(n,t,u){return{value:n,index:t,criteria:e.call(r,n,t,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index<t.index?-1:1}),"value")};var F=function(n,t,r,e){var u={},i=k(t||w.identity);return A(n,function(t,a){var o=i.call(r,t,a,n);e(u,o,t)}),u};w.groupBy=function(n,t,r){return F(n,t,r,function(n,t,r){(w.has(n,t)?n[t]:n[t]=[]).push(r)})},w.countBy=function(n,t,r){return F(n,t,r,function(n,t){w.has(n,t)||(n[t]=0),n[t]++})},w.sortedIndex=function(n,t,r,e){r=null==r?w.identity:k(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;u>r.call(e,n[o])?i=o+1:a=o}return i},w.toArray=function(n){return n?w.isArray(n)?o.call(n):n.length===+n.length?w.map(n,w.identity):w.values(n):[]},w.size=function(n){return null==n?0:n.length===+n.length?n.length:w.keys(n).length},w.first=w.head=w.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:o.call(n,0,t)},w.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},w.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},w.rest=w.tail=w.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},w.compact=function(n){return w.filter(n,w.identity)};var R=function(n,t,r){return A(n,function(n){w.isArray(n)?t?a.apply(r,n):R(n,t,r):r.push(n)}),r};w.flatten=function(n,t){return R(n,t,[])},w.without=function(n){return w.difference(n,o.call(arguments,1))},w.uniq=w.unique=function(n,t,r,e){w.isFunction(t)&&(e=r,r=t,t=!1);var u=r?w.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:w.contains(a,r))||(a.push(r),i.push(n[e]))}),i},w.union=function(){return w.uniq(c.apply(e,arguments))},w.intersection=function(n){var t=o.call(arguments,1);return w.filter(w.uniq(n),function(n){return w.every(t,function(t){return w.indexOf(t,n)>=0})})},w.difference=function(n){var t=c.apply(e,o.call(arguments,1));return w.filter(n,function(n){return!w.contains(t,n)})},w.zip=function(){for(var n=o.call(arguments),t=w.max(w.pluck(n,"length")),r=Array(t),e=0;t>e;e++)r[e]=w.pluck(n,""+e);return r},w.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},w.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=w.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},w.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},w.range=function(n,t,r){1>=arguments.length&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=Array(e);e>u;)i[u++]=n,n+=r;return i},w.bind=function(n,t){if(n.bind===j&&j)return j.apply(n,o.call(arguments,1));var r=o.call(arguments,2);return function(){return n.apply(t,r.concat(o.call(arguments)))}},w.partial=function(n){var t=o.call(arguments,1);return function(){return n.apply(this,t.concat(o.call(arguments)))}},w.bindAll=function(n){var t=o.call(arguments,1);return 0===t.length&&(t=w.functions(n)),A(t,function(t){n[t]=w.bind(n[t],n)}),n},w.memoize=function(n,t){var r={};return t||(t=w.identity),function(){var e=t.apply(this,arguments);return w.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},w.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},w.defer=function(n){return w.delay.apply(w,[n,1].concat(o.call(arguments,1)))},w.throttle=function(n,t){var r,e,u,i,a=0,o=function(){a=new Date,u=null,i=n.apply(r,e)};return function(){var c=new Date,l=t-(c-a);return r=this,e=arguments,0>=l?(clearTimeout(u),u=null,a=c,i=n.apply(r,e)):u||(u=setTimeout(o,l)),i}},w.debounce=function(n,t,r){var e,u;return function(){var i=this,a=arguments,o=function(){e=null,r||(u=n.apply(i,a))},c=r&&!e;return clearTimeout(e),e=setTimeout(o,t),c&&(u=n.apply(i,a)),u}},w.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},w.wrap=function(n,t){return function(){var r=[n];return a.apply(r,arguments),t.apply(this,r)}},w.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},w.after=function(n,t){return 0>=n?t():function(){return 1>--n?t.apply(this,arguments):void 0}},w.keys=_||function(n){if(n!==Object(n))throw new TypeError("Invalid object");var t=[];for(var r in n)w.has(n,r)&&(t[t.length]=r);return t},w.values=function(n){var t=[];for(var r in n)w.has(n,r)&&t.push(n[r]);return t},w.pairs=function(n){var t=[];for(var r in n)w.has(n,r)&&t.push([r,n[r]]);return t},w.invert=function(n){var t={};for(var r in n)w.has(n,r)&&(t[n[r]]=r);return t},w.functions=w.methods=function(n){var t=[];for(var r in n)w.isFunction(n[r])&&t.push(r);return t.sort()},w.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},w.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},w.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)w.contains(r,u)||(t[u]=n[u]);return t},w.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)null==n[r]&&(n[r]=t[r])}),n},w.clone=function(n){return w.isObject(n)?w.isArray(n)?n.slice():w.extend({},n):n},w.tap=function(n,t){return t(n),n};var I=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof w&&(n=n._wrapped),t instanceof w&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==t+"";case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;r.push(n),e.push(t);var a=0,o=!0;if("[object Array]"==u){if(a=n.length,o=a==t.length)for(;a--&&(o=I(n[a],t[a],r,e)););}else{var c=n.constructor,f=t.constructor;if(c!==f&&!(w.isFunction(c)&&c instanceof c&&w.isFunction(f)&&f instanceof f))return!1;for(var s in n)if(w.has(n,s)&&(a++,!(o=w.has(t,s)&&I(n[s],t[s],r,e))))break;if(o){for(s in t)if(w.has(t,s)&&!a--)break;o=!a}}return r.pop(),e.pop(),o};w.isEqual=function(n,t){return I(n,t,[],[])},w.isEmpty=function(n){if(null==n)return!0;if(w.isArray(n)||w.isString(n))return 0===n.length;for(var t in n)if(w.has(n,t))return!1;return!0},w.isElement=function(n){return!(!n||1!==n.nodeType)},w.isArray=x||function(n){return"[object Array]"==l.call(n)},w.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){w["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),w.isArguments(arguments)||(w.isArguments=function(n){return!(!n||!w.has(n,"callee"))}),"function"!=typeof/./&&(w.isFunction=function(n){return"function"==typeof n}),w.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},w.isNaN=function(n){return w.isNumber(n)&&n!=+n},w.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},w.isNull=function(n){return null===n},w.isUndefined=function(n){return n===void 0},w.has=function(n,t){return f.call(n,t)},w.noConflict=function(){return n._=t,this},w.identity=function(n){return n},w.times=function(n,t,r){for(var e=Array(n),u=0;n>u;u++)e[u]=t.call(r,u);return e},w.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))};var M={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","/":"&#x2F;"}};M.unescape=w.invert(M.escape);var S={escape:RegExp("["+w.keys(M.escape).join("")+"]","g"),unescape:RegExp("("+w.keys(M.unescape).join("|")+")","g")};w.each(["escape","unescape"],function(n){w[n]=function(t){return null==t?"":(""+t).replace(S[n],function(t){return M[n][t]})}}),w.result=function(n,t){if(null==n)return null;var r=n[t];return w.isFunction(r)?r.call(n):r},w.mixin=function(n){A(w.functions(n),function(t){var r=w[t]=n[t];w.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),D.call(this,r.apply(w,n))}})};var N=0;w.uniqueId=function(n){var t=++N+"";return n?n+t:t},w.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var T=/(.)^/,q={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},B=/\\|'|\r|\n|\t|\u2028|\u2029/g;w.template=function(n,t,r){var e;r=w.defaults({},r,w.templateSettings);var u=RegExp([(r.escape||T).source,(r.interpolate||T).source,(r.evaluate||T).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(B,function(n){return"\\"+q[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,w);var c=function(n){return e.call(this,n,w)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},w.chain=function(n){return w(n).chain()};var D=function(n){return this._chain?w(n).chain():n};w.mixin(w),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];w.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],D.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];w.prototype[n]=function(){return D.call(this,t.apply(this._wrapped,arguments))}}),w.extend(w.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}).call(this);!function(e,n){"use strict";function r(e,n){var r,t,u=e.toLowerCase();for(n=[].concat(n),r=0;n.length>r;r+=1)if(t=n[r]){if(t.test&&t.test(e))return!0;if(t.toLowerCase()===u)return!0}}var t=n.prototype.trim,u=n.prototype.trimRight,i=n.prototype.trimLeft,l=function(e){return 1*e||0},o=function(e,n){if(1>n)return"";for(var r="";n>0;)1&n&&(r+=e),n>>=1,e+=e;return r},a=[].slice,c=function(e){return null==e?"\\s":e.source?e.source:"["+g.escapeRegExp(e)+"]"},s={lt:"<",gt:">",quot:'"',amp:"&",apos:"'"},f={};for(var p in s)f[s[p]]=p;f["'"]="#39";var h=function(){function e(e){return Object.prototype.toString.call(e).slice(8,-1).toLowerCase()}var r=o,t=function(){return t.cache.hasOwnProperty(arguments[0])||(t.cache[arguments[0]]=t.parse(arguments[0])),t.format.call(null,t.cache[arguments[0]],arguments)};return t.format=function(t,u){var i,l,o,a,c,s,f,p=1,g=t.length,d="",m=[];for(l=0;g>l;l++)if(d=e(t[l]),"string"===d)m.push(t[l]);else if("array"===d){if(a=t[l],a[2])for(i=u[p],o=0;a[2].length>o;o++){if(!i.hasOwnProperty(a[2][o]))throw new Error(h('[_.sprintf] property "%s" does not exist',a[2][o]));i=i[a[2][o]]}else i=a[1]?u[a[1]]:u[p++];if(/[^s]/.test(a[8])&&"number"!=e(i))throw new Error(h("[_.sprintf] expecting number but found %s",e(i)));switch(a[8]){case"b":i=i.toString(2);break;case"c":i=n.fromCharCode(i);break;case"d":i=parseInt(i,10);break;case"e":i=a[7]?i.toExponential(a[7]):i.toExponential();break;case"f":i=a[7]?parseFloat(i).toFixed(a[7]):parseFloat(i);break;case"o":i=i.toString(8);break;case"s":i=(i=n(i))&&a[7]?i.substring(0,a[7]):i;break;case"u":i=Math.abs(i);break;case"x":i=i.toString(16);break;case"X":i=i.toString(16).toUpperCase()}i=/[def]/.test(a[8])&&a[3]&&i>=0?"+"+i:i,s=a[4]?"0"==a[4]?"0":a[4].charAt(1):" ",f=a[6]-n(i).length,c=a[6]?r(s,f):"",m.push(a[5]?i+c:c+i)}return m.join("")},t.cache={},t.parse=function(e){for(var n=e,r=[],t=[],u=0;n;){if(null!==(r=/^[^\x25]+/.exec(n)))t.push(r[0]);else if(null!==(r=/^\x25{2}/.exec(n)))t.push("%");else{if(null===(r=/^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(n)))throw new Error("[_.sprintf] huh?");if(r[2]){u|=1;var i=[],l=r[2],o=[];if(null===(o=/^([a-z_][a-z_\d]*)/i.exec(l)))throw new Error("[_.sprintf] huh?");for(i.push(o[1]);""!==(l=l.substring(o[0].length));)if(null!==(o=/^\.([a-z_][a-z_\d]*)/i.exec(l)))i.push(o[1]);else{if(null===(o=/^\[(\d+)\]/.exec(l)))throw new Error("[_.sprintf] huh?");i.push(o[1])}r[2]=i}else u|=2;if(3===u)throw new Error("[_.sprintf] mixing positional and named placeholders is not (yet) supported");t.push(r)}n=n.substring(r[0].length)}return t},t}(),g={VERSION:"2.3.0",isBlank:function(e){return null==e&&(e=""),/^\s*$/.test(e)},stripTags:function(e){return null==e?"":n(e).replace(/<\/?[^>]+>/g,"")},capitalize:function(e){return e=null==e?"":n(e),e.charAt(0).toUpperCase()+e.slice(1)},chop:function(e,r){return null==e?[]:(e=n(e),r=~~r,r>0?e.match(new RegExp(".{1,"+r+"}","g")):[e])},clean:function(e){return g.strip(e).replace(/\s+/g," ")},count:function(e,r){if(null==e||null==r)return 0;e=n(e),r=n(r);for(var t=0,u=0,i=r.length;;){if(u=e.indexOf(r,u),-1===u)break;t++,u+=i}return t},chars:function(e){return null==e?[]:n(e).split("")},swapCase:function(e){return null==e?"":n(e).replace(/\S/g,function(e){return e===e.toUpperCase()?e.toLowerCase():e.toUpperCase()})},escapeHTML:function(e){return null==e?"":n(e).replace(/[&<>"']/g,function(e){return"&"+f[e]+";"})},unescapeHTML:function(e){return null==e?"":n(e).replace(/\&([^;]+);/g,function(e,r){var t;return r in s?s[r]:(t=r.match(/^#x([\da-fA-F]+)$/))?n.fromCharCode(parseInt(t[1],16)):(t=r.match(/^#(\d+)$/))?n.fromCharCode(~~t[1]):e})},escapeRegExp:function(e){return null==e?"":n(e).replace(/([.*+?^=!:${}()|[\]\/\\])/g,"\\$1")},splice:function(e,n,r,t){var u=g.chars(e);return u.splice(~~n,~~r,t),u.join("")},insert:function(e,n,r){return g.splice(e,n,0,r)},include:function(e,r){return""===r?!0:null==e?!1:-1!==n(e).indexOf(r)},join:function(){var e=a.call(arguments),n=e.shift();return null==n&&(n=""),e.join(n)},lines:function(e){return null==e?[]:n(e).split("\n")},reverse:function(e){return g.chars(e).reverse().join("")},startsWith:function(e,r){return""===r?!0:null==e||null==r?!1:(e=n(e),r=n(r),e.length>=r.length&&e.slice(0,r.length)===r)},endsWith:function(e,r){return""===r?!0:null==e||null==r?!1:(e=n(e),r=n(r),e.length>=r.length&&e.slice(e.length-r.length)===r)},succ:function(e){return null==e?"":(e=n(e),e.slice(0,-1)+n.fromCharCode(e.charCodeAt(e.length-1)+1))},titleize:function(e){return null==e?"":(e=n(e).toLowerCase(),e.replace(/(?:^|\s|-)\S/g,function(e){return e.toUpperCase()}))},camelize:function(e){return g.trim(e).replace(/[-_\s]+(.)?/g,function(e,n){return n?n.toUpperCase():""})},underscored:function(e){return g.trim(e).replace(/([a-z\d])([A-Z]+)/g,"$1_$2").replace(/[-\s]+/g,"_").toLowerCase()},dasherize:function(e){return g.trim(e).replace(/([A-Z])/g,"-$1").replace(/[-_\s]+/g,"-").toLowerCase()},classify:function(e){return g.titleize(n(e).replace(/[\W_]/g," ")).replace(/\s/g,"")},humanize:function(e){return g.capitalize(g.underscored(e).replace(/_id$/,"").replace(/_/g," "))},trim:function(e,r){return null==e?"":!r&&t?t.call(e):(r=c(r),n(e).replace(new RegExp("^"+r+"+|"+r+"+$","g"),""))},ltrim:function(e,r){return null==e?"":!r&&i?i.call(e):(r=c(r),n(e).replace(new RegExp("^"+r+"+"),""))},rtrim:function(e,r){return null==e?"":!r&&u?u.call(e):(r=c(r),n(e).replace(new RegExp(r+"+$"),""))},truncate:function(e,r,t){return null==e?"":(e=n(e),t=t||"...",r=~~r,e.length>r?e.slice(0,r)+t:e)},prune:function(e,r,t){if(null==e)return"";if(e=n(e),r=~~r,t=null!=t?n(t):"...",r>=e.length)return e;var u=function(e){return e.toUpperCase()!==e.toLowerCase()?"A":" "},i=e.slice(0,r+1).replace(/.(?=\W*\w*$)/g,u);return i=i.slice(i.length-2).match(/\w\w/)?i.replace(/\s*\S+$/,""):g.rtrim(i.slice(0,i.length-1)),(i+t).length>e.length?e:e.slice(0,i.length)+t},words:function(e,n){return g.isBlank(e)?[]:g.trim(e,n).split(n||/\s+/)},pad:function(e,r,t,u){e=null==e?"":n(e),r=~~r;var i=0;switch(t?t.length>1&&(t=t.charAt(0)):t=" ",u){case"right":return i=r-e.length,e+o(t,i);case"both":return i=r-e.length,o(t,Math.ceil(i/2))+e+o(t,Math.floor(i/2));default:return i=r-e.length,o(t,i)+e}},lpad:function(e,n,r){return g.pad(e,n,r)},rpad:function(e,n,r){return g.pad(e,n,r,"right")},lrpad:function(e,n,r){return g.pad(e,n,r,"both")},sprintf:h,vsprintf:function(e,n){return n.unshift(e),h.apply(null,n)},toNumber:function(e,n){return e?(e=g.trim(e),e.match(/^-?\d+(?:\.\d+)?$/)?l(l(e).toFixed(~~n)):0/0):0},numberFormat:function(e,n,r,t){if(isNaN(e)||null==e)return"";e=e.toFixed(~~n),t="string"==typeof t?t:",";var u=e.split("."),i=u[0],l=u[1]?(r||".")+u[1]:"";return i.replace(/(\d)(?=(?:\d{3})+$)/g,"$1"+t)+l},strRight:function(e,r){if(null==e)return"";e=n(e),r=null!=r?n(r):r;var t=r?e.indexOf(r):-1;return~t?e.slice(t+r.length,e.length):e},strRightBack:function(e,r){if(null==e)return"";e=n(e),r=null!=r?n(r):r;var t=r?e.lastIndexOf(r):-1;return~t?e.slice(t+r.length,e.length):e},strLeft:function(e,r){if(null==e)return"";e=n(e),r=null!=r?n(r):r;var t=r?e.indexOf(r):-1;return~t?e.slice(0,t):e},strLeftBack:function(e,n){if(null==e)return"";e+="",n=null!=n?""+n:n;var r=e.lastIndexOf(n);return~r?e.slice(0,r):e},toSentence:function(e,n,r,t){n=n||", ",r=r||" and ";var u=e.slice(),i=u.pop();return e.length>2&&t&&(r=g.rtrim(n)+r),u.length?u.join(n)+r+i:i},toSentenceSerial:function(){var e=a.call(arguments);return e[3]=!0,g.toSentence.apply(g,e)},slugify:function(e){if(null==e)return"";var r="ąàáäâãåæăćęèéëêìíïîłńòóöôõøśșțùúüûñçżź",t="aaaaaaaaaceeeeeiiiilnoooooosstuuuunczz",u=new RegExp(c(r),"g");return e=n(e).toLowerCase().replace(u,function(e){var n=r.indexOf(e);return t.charAt(n)||"-"}),g.dasherize(e.replace(/[^\w\s-]/g,""))},surround:function(e,n){return[n,e,n].join("")},quote:function(e,n){return g.surround(e,n||'"')},unquote:function(e,n){return n=n||'"',e[0]===n&&e[e.length-1]===n?e.slice(1,e.length-1):e},exports:function(){var e={};for(var n in this)this.hasOwnProperty(n)&&!n.match(/^(?:include|contains|reverse)$/)&&(e[n]=this[n]);return e},repeat:function(e,r,t){if(null==e)return"";if(r=~~r,null==t)return o(n(e),r);for(var u=[];r>0;u[--r]=e);return u.join(t)},naturalCmp:function(e,r){if(e==r)return 0;if(!e)return-1;if(!r)return 1;for(var t=/(\.\d+)|(\d+)|(\D+)/g,u=n(e).toLowerCase().match(t),i=n(r).toLowerCase().match(t),l=Math.min(u.length,i.length),o=0;l>o;o++){var a=u[o],c=i[o];if(a!==c){var s=parseInt(a,10);if(!isNaN(s)){var f=parseInt(c,10);if(!isNaN(f)&&s-f)return s-f}return c>a?-1:1}}return u.length===i.length?u.length-i.length:r>e?-1:1},levenshtein:function(e,r){if(null==e&&null==r)return 0;if(null==e)return n(r).length;if(null==r)return n(e).length;e=n(e),r=n(r);for(var t,u,i=[],l=0;r.length>=l;l++)for(var o=0;e.length>=o;o++)u=l&&o?e.charAt(o-1)===r.charAt(l-1)?t:Math.min(i[o],i[o-1],t)+1:l+o,t=i[o],i[o]=u;return i.pop()},toBoolean:function(e,n,t){return"number"==typeof e&&(e=""+e),"string"!=typeof e?!!e:(e=g.trim(e),r(e,n||["true","1"])?!0:r(e,t||["false","0"])?!1:void 0)}};g.strip=g.trim,g.lstrip=g.ltrim,g.rstrip=g.rtrim,g.center=g.lrpad,g.rjust=g.lpad,g.ljust=g.rpad,g.contains=g.include,g.q=g.quote,g.toBool=g.toBoolean,"undefined"!=typeof exports&&("undefined"!=typeof module&&module.exports&&(module.exports=g),exports._s=g),"function"==typeof define&&define.amd&&define("underscore.string",[],function(){return g}),e._=e._||{},e._.string=e._.str=g}(this,String);/**
 * Copyright (c)2005-2009 Matt Kruse (javascripttoolbox.com)
 * 
 * Dual licensed under the MIT and GPL licenses. 
 * This basically means you can use this code however you want for
 * free, but don't claim to have written it yourself!
 * Donations always accepted: http://www.JavascriptToolbox.com/donate/
 * 
 * Please do not link to the .js files on javascripttoolbox.com from
 * your site. Copy the files locally to your server instead.
 * 
 */
/*
Date functions

These functions are used to parse, format, and manipulate Date objects.
See documentation and examples at http://www.JavascriptToolbox.com/lib/date/

*/
Date.$VERSION = 1.02;

// Utility function to append a 0 to single-digit numbers
Date.LZ = function(x) {return(x<0||x>9?"":"0")+x};
// Full month names. Change this for local month names
Date.monthNames = new Array('January','February','March','April','May','June','July','August','September','October','November','December');
// Month abbreviations. Change this for local month names
Date.monthAbbreviations = new Array('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
// Full day names. Change this for local month names
Date.dayNames = new Array('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday');
// Day abbreviations. Change this for local month names
Date.dayAbbreviations = new Array('Sun','Mon','Tue','Wed','Thu','Fri','Sat');
// Used for parsing ambiguous dates like 1/2/2000 - default to preferring 'American' format meaning Jan 2.
// Set to false to prefer 'European' format meaning Feb 1
Date.preferAmericanFormat = true;

// If the getFullYear() method is not defined, create it
if (!Date.prototype.getFullYear) { 
	Date.prototype.getFullYear = function() { var yy=this.getYear(); return (yy<1900?yy+1900:yy); } ;
} 

// Parse a string and convert it to a Date object.
// If no format is passed, try a list of common formats.
// If string cannot be parsed, return null.
// Avoids regular expressions to be more portable.
Date.parseString = function(val, format) {
	// If no format is specified, try a few common formats
	if (typeof(format)=="undefined" || format==null || format=="") {
		var generalFormats=new Array('y-M-d','MMM d, y','MMM d,y','y-MMM-d','d-MMM-y','MMM d','MMM-d','d-MMM');
		var monthFirst=new Array('M/d/y','M-d-y','M.d.y','M/d','M-d');
		var dateFirst =new Array('d/M/y','d-M-y','d.M.y','d/M','d-M');
		var checkList=new Array(generalFormats,Date.preferAmericanFormat?monthFirst:dateFirst,Date.preferAmericanFormat?dateFirst:monthFirst);
		for (var i=0; i<checkList.length; i++) {
			var l=checkList[i];
			for (var j=0; j<l.length; j++) {
				var d=Date.parseString(val,l[j]);
				if (d!=null) { 
					return d; 
				}
			}
		}
		return null;
	};

	this.isInteger = function(val) {
		for (var i=0; i < val.length; i++) {
			if ("1234567890".indexOf(val.charAt(i))==-1) { 
				return false; 
			}
		}
		return true;
	};
	this.getInt = function(str,i,minlength,maxlength) {
		for (var x=maxlength; x>=minlength; x--) {
			var token=str.substring(i,i+x);
			if (token.length < minlength) { 
				return null; 
			}
			if (this.isInteger(token)) { 
				return token; 
			}
		}
	return null;
	};
	val=val+"";
	format=format+"";
	var i_val=0;
	var i_format=0;
	var c="";
	var token="";
	var token2="";
	var x,y;
	var year=new Date().getFullYear();
	var month=1;
	var date=1;
	var hh=0;
	var mm=0;
	var ss=0;
	var ampm="";
	while (i_format < format.length) {
		// Get next token from format string
		c=format.charAt(i_format);
		token="";
		while ((format.charAt(i_format)==c) && (i_format < format.length)) {
			token += format.charAt(i_format++);
		}
		// Extract contents of value based on format token
		if (token=="yyyy" || token=="yy" || token=="y") {
			if (token=="yyyy") { 
				x=4;y=4; 
			}
			if (token=="yy") { 
				x=2;y=2; 
			}
			if (token=="y") { 
				x=2;y=4; 
			}
			year=this.getInt(val,i_val,x,y);
			if (year==null) { 
				return null; 
			}
			i_val += year.length;
			if (year.length==2) {
				if (year > 70) { 
					year=1900+(year-0); 
				}
				else { 
					year=2000+(year-0); 
				}
			}
		}
		else if (token=="MMM" || token=="NNN"){
			month=0;
			var names = (token=="MMM"?(Date.monthNames.concat(Date.monthAbbreviations)):Date.monthAbbreviations);
			for (var i=0; i<names.length; i++) {
				var month_name=names[i];
				if (val.substring(i_val,i_val+month_name.length).toLowerCase()==month_name.toLowerCase()) {
					month=(i%12)+1;
					i_val += month_name.length;
					break;
				}
			}
			if ((month < 1)||(month>12)){
				return null;
			}
		}
		else if (token=="EE"||token=="E"){
			var names = (token=="EE"?Date.dayNames:Date.dayAbbreviations);
			for (var i=0; i<names.length; i++) {
				var day_name=names[i];
				if (val.substring(i_val,i_val+day_name.length).toLowerCase()==day_name.toLowerCase()) {
					i_val += day_name.length;
					break;
				}
			}
		}
		else if (token=="MM"||token=="M") {
			month=this.getInt(val,i_val,token.length,2);
			if(month==null||(month<1)||(month>12)){
				return null;
			}
			i_val+=month.length;
		}
		else if (token=="dd"||token=="d") {
			date=this.getInt(val,i_val,token.length,2);
			if(date==null||(date<1)||(date>31)){
				return null;
			}
			i_val+=date.length;
		}
		else if (token=="hh"||token=="h") {
			hh=this.getInt(val,i_val,token.length,2);
			if(hh==null||(hh<1)||(hh>12)){
				return null;
			}
			i_val+=hh.length;
		}
		else if (token=="HH"||token=="H") {
			hh=this.getInt(val,i_val,token.length,2);
			if(hh==null||(hh<0)||(hh>23)){
				return null;
			}
			i_val+=hh.length;
		}
		else if (token=="KK"||token=="K") {
			hh=this.getInt(val,i_val,token.length,2);
			if(hh==null||(hh<0)||(hh>11)){
				return null;
			}
			i_val+=hh.length;
			hh++;
		}
		else if (token=="kk"||token=="k") {
			hh=this.getInt(val,i_val,token.length,2);
			if(hh==null||(hh<1)||(hh>24)){
				return null;
			}
			i_val+=hh.length;
			hh--;
		}
		else if (token=="mm"||token=="m") {
			mm=this.getInt(val,i_val,token.length,2);
			if(mm==null||(mm<0)||(mm>59)){
				return null;
			}
			i_val+=mm.length;
		}
		else if (token=="ss"||token=="s") {
			ss=this.getInt(val,i_val,token.length,2);
			if(ss==null||(ss<0)||(ss>59)){
				return null;
			}
			i_val+=ss.length;
		}
		else if (token=="a") {
			if (val.substring(i_val,i_val+2).toLowerCase()=="am") {
				ampm="AM";
			}
			else if (val.substring(i_val,i_val+2).toLowerCase()=="pm") {
				ampm="PM";
			}
			else {
				return null;
			}
			i_val+=2;
		}
		else {
			if (val.substring(i_val,i_val+token.length)!=token) {
				return null;
			}
			else {
				i_val+=token.length;
			}
		}
	}
	// If there are any trailing characters left in the value, it doesn't match
	if (i_val != val.length) { 
		return null; 
	}
	// Is date valid for month?
	if (month==2) {
		// Check for leap year
		if ( ( (year%4==0)&&(year%100 != 0) ) || (year%400==0) ) { // leap year
			if (date > 29){ 
				return null; 
			}
		}
		else { 
			if (date > 28) { 
				return null; 
			} 
		}
	}
	if ((month==4)||(month==6)||(month==9)||(month==11)) {
		if (date > 30) { 
			return null; 
		}
	}
	// Correct hours value
	if (hh<12 && ampm=="PM") {
		hh=hh-0+12; 
	}
	else if (hh>11 && ampm=="AM") { 
		hh-=12; 
	}
	return new Date(year,month-1,date,hh,mm,ss);
};

// Check if a date string is valid
Date.isValid = function(val,format) {
	return (Date.parseString(val,format) != null);
};

// Check if a date object is before another date object
Date.prototype.isBefore = function(date2) {
	if (date2==null) { 
		return false; 
	}
	return (this.getTime()<date2.getTime());
};

// Check if a date object is after another date object
Date.prototype.isAfter = function(date2) {
	if (date2==null) { 
		return false; 
	}
	return (this.getTime()>date2.getTime());
};

// Check if two date objects have equal dates and times
Date.prototype.equals = function(date2) {
	if (date2==null) { 
		return false; 
	}
	return (this.getTime()==date2.getTime());
};

// Check if two date objects have equal dates, disregarding times
Date.prototype.equalsIgnoreTime = function(date2) {
	if (date2==null) { 
		return false; 
	}
	var d1 = new Date(this.getTime()).clearTime();
	var d2 = new Date(date2.getTime()).clearTime();
	return (d1.getTime()==d2.getTime());
};

// Format a date into a string using a given format string
Date.prototype.format = function(format) {
	format=format+"";
	var result="";
	var i_format=0;
	var c="";
	var token="";
	var y=this.getYear()+"";
	var M=this.getMonth()+1;
	var d=this.getDate();
	var E=this.getDay();
	var H=this.getHours();
	var m=this.getMinutes();
	var s=this.getSeconds();
	var yyyy,yy,MMM,MM,dd,hh,h,mm,ss,ampm,HH,H,KK,K,kk,k;
	// Convert real date parts into formatted versions
	var value=new Object();
	if (y.length < 4) {
		y=""+(+y+1900);
	}
	value["y"]=""+y;
	value["yyyy"]=y;
	value["yy"]=y.substring(2,4);
	value["M"]=M;
	value["MM"]=Date.LZ(M);
	value["MMM"]=Date.monthNames[M-1];
	value["NNN"]=Date.monthAbbreviations[M-1];
	value["d"]=d;
	value["dd"]=Date.LZ(d);
	value["E"]=Date.dayAbbreviations[E];
	value["EE"]=Date.dayNames[E];
	value["H"]=H;
	value["HH"]=Date.LZ(H);
	if (H==0){
		value["h"]=12;
	}
	else if (H>12){
		value["h"]=H-12;
	}
	else {
		value["h"]=H;
	}
	value["hh"]=Date.LZ(value["h"]);
	value["K"]=value["h"]-1;
	value["k"]=value["H"]+1;
	value["KK"]=Date.LZ(value["K"]);
	value["kk"]=Date.LZ(value["k"]);
	if (H > 11) { 
		value["a"]="PM"; 
	}
	else { 
		value["a"]="AM"; 
	}
	value["m"]=m;
	value["mm"]=Date.LZ(m);
	value["s"]=s;
	value["ss"]=Date.LZ(s);
	while (i_format < format.length) {
		c=format.charAt(i_format);
		token="";
		while ((format.charAt(i_format)==c) && (i_format < format.length)) {
			token += format.charAt(i_format++);
		}
		if (typeof(value[token])!="undefined") { 
			result=result + value[token]; 
		}
		else { 
			result=result + token; 
		}
	}
	return result;
};

// Get the full name of the day for a date
Date.prototype.getDayName = function() { 
	return Date.dayNames[this.getDay()];
};

// Get the abbreviation of the day for a date
Date.prototype.getDayAbbreviation = function() { 
	return Date.dayAbbreviations[this.getDay()];
};

// Get the full name of the month for a date
Date.prototype.getMonthName = function() {
	return Date.monthNames[this.getMonth()];
};

// Get the abbreviation of the month for a date
Date.prototype.getMonthAbbreviation = function() { 
	return Date.monthAbbreviations[this.getMonth()];
};

// Clear all time information in a date object
Date.prototype.clearTime = function() {
  this.setHours(0); 
  this.setMinutes(0);
  this.setSeconds(0); 
  this.setMilliseconds(0);
  return this;
};

// Add an amount of time to a date. Negative numbers can be passed to subtract time.
Date.prototype.add = function(interval, number) {
	if (typeof(interval)=="undefined" || interval==null || typeof(number)=="undefined" || number==null) { 
		return this; 
	}
	number = +number;
	if (interval=='y') { // year
		this.setFullYear(this.getFullYear()+number);
	}
	else if (interval=='M') { // Month
		this.setMonth(this.getMonth()+number);
	}
	else if (interval=='d') { // Day
		this.setDate(this.getDate()+number);
	}
	else if (interval=='w') { // Weekday
		var step = (number>0)?1:-1;
		while (number!=0) {
			this.add('d',step);
			while(this.getDay()==0 || this.getDay()==6) { 
				this.add('d',step);
			}
			number -= step;
		}
	}
	else if (interval=='h') { // Hour
		this.setHours(this.getHours() + number);
	}
	else if (interval=='m') { // Minute
		this.setMinutes(this.getMinutes() + number);
	}
	else if (interval=='s') { // Second
		this.setSeconds(this.getSeconds() + number);
	}
	return this;
};
/**
 * jQuery number plug-in 2.1.0
 * Copyright 2012, Digital Fusion
 * Licensed under the MIT license.
 * http://opensource.teamdf.com/license/
 *
 * A jQuery plugin which implements a permutation of phpjs.org's number_format to provide
 * simple number formatting, insertion, and as-you-type masking of a number.
 * 
 * @author	Sam Sehnert
 * @docs	http://www.teamdf.com/web/jquery-number-format-redux/196/
 */
(function($){
	
	/**
	 * Method for selecting a range of characters in an input/textarea.
	 *
	 * @param int rangeStart			: Where we want the selection to start.
	 * @param int rangeEnd				: Where we want the selection to end.
	 *
	 * @return void;
	 */
	function setSelectionRange( rangeStart, rangeEnd )
	{
		// Check which way we need to define the text range.
		if( this.createTextRange )
		{
			var range = this.createTextRange();
				range.collapse( true );
				range.moveStart( 'character',	rangeStart );
				range.moveEnd( 'character',		rangeEnd-rangeStart );
				range.select();
		}
		
		// Alternate setSelectionRange method for supporting browsers.
		else if( this.setSelectionRange )
		{
			this.focus();
			this.setSelectionRange( rangeStart, rangeEnd );
		}
	}
	
	/**
	 * Get the selection position for the given part.
	 * 
	 * @param string part			: Options, 'Start' or 'End'. The selection position to get.
	 *
	 * @return int : The index position of the selection part.
	 */
	function getSelection( part )
	{
		var pos	= this.value.length;
		
		// Work out the selection part.
		part = ( part.toLowerCase() == 'start' ? 'Start' : 'End' );
		
		if( document.selection ){
			// The current selection
			var range = document.selection.createRange(), stored_range, selectionStart, selectionEnd;
			// We'll use this as a 'dummy'
			stored_range = range.duplicate();
			// Select all text
			//stored_range.moveToElementText( this );
			stored_range.expand('textedit');
			// Now move 'dummy' end point to end point of original range
			stored_range.setEndPoint( 'EndToEnd', range );
			// Now we can calculate start and end points
			selectionStart = stored_range.text.length - range.text.length;
			selectionEnd = selectionStart + range.text.length;
			return part == 'Start' ? selectionStart : selectionEnd;
		}
		
		else if(typeof(this['selection'+part])!="undefined")
		{
		 	pos = this['selection'+part];
		}
		return pos;
	}
	
	/**
	 * Substitutions for keydown keycodes.
	 * Allows conversion from e.which to ascii characters.
	 */
	var _keydown = {
		codes : {
			188 : 44,
			109 : 45,
			190 : 46,
			191 : 47,
			192 : 96,
			220 : 92,
			222 : 39,
			221 : 93,
			219 : 91,
			173 : 45,
			187 : 61, //IE Key codes
			186 : 59, //IE Key codes
			189 : 45, //IE Key codes
			110 : 46  //IE Key codes
        },
        shifts : {
			96 : "~",
			49 : "!",
			50 : "@",
			51 : "#",
			52 : "$",
			53 : "%",
			54 : "^",
			55 : "&",
			56 : "*",
			57 : "(",
			48 : ")",
			45 : "_",
			61 : "+",
			91 : "{",
			93 : "}",
			92 : "|",
			59 : ":",
			39 : "\"",
			44 : "<",
			46 : ">",
			47 : "?"
        }
    };
	
	/**
	 * jQuery number formatter plugin. This will allow you to format numbers on an element.
	 *
	 * @params proxied for format_number method.
	 *
	 * @return : The jQuery collection the method was called with.
	 */
	$.fn.number = function( number, decimals, dec_point, thousands_sep ){
	    
	    // Enter the default thousands separator, and the decimal placeholder.
	    thousands_sep	= (typeof thousands_sep === 'undefined') ? ',' : thousands_sep;
	    dec_point		= (typeof dec_point === 'undefined') ? '.' : dec_point;
	    decimals		= (typeof decimals === 'undefined' ) ? 0 : decimals;
	    	    
	    // Work out the unicode character for the decimal placeholder.
	    var u_dec			= ('\\u'+('0000'+(dec_point.charCodeAt(0).toString(16))).slice(-4)),
	    	regex_dec_num	= new RegExp('[^'+u_dec+'0-9]','g'),
	    	regex_dec		= new RegExp(u_dec,'g');
	    
	    // If we've specified to take the number from the target element,
	    // we loop over the collection, and get the number.
	    if( number === true )
	    {
	    	// If this element is a number, then we add a keyup
	    	if( this.is('input:text') )
	    	{
	    		// Return the jquery collection.
	    		return this.on({
	    			
	    			/**
	    			 * Handles keyup events, re-formatting numbers.
	    			 *
	    			 * @param object e			: the keyup event object.s
	    			 *
	    			 * @return void;
	    			 */
	    			'keydown.format' : function(e){
	    				
	    				// Define variables used in the code below.
	    				var $this	= $(this),
	    					data	= $this.data('numFormat'),
	    					code	= (e.keyCode ? e.keyCode : e.which),
							chara	= '', //unescape(e.originalEvent.keyIdentifier.replace('U+','%u')),
	    					start	= getSelection.apply(this,['start']),
	    					end		= getSelection.apply(this,['end']),
	    					val		= '',
	    					setPos	= false;
	    				
	    				// Webkit (Chrome & Safari) on windows screws up the keyIdentifier detection
	    				// for numpad characters. I've disabled this for now, because while keyCode munging
	    				// below is hackish and ugly, it actually works cross browser & platform.
	    				
//	    				if( typeof e.originalEvent.keyIdentifier !== 'undefined' )
//	    				{
//	    					chara = unescape(e.originalEvent.keyIdentifier.replace('U+','%u'));
//	    				}
//	    				else
//	    				{
	    					if (_keydown.codes.hasOwnProperty(code)) {
					            code = _keydown.codes[code];
					        }
					        if (!e.shiftKey && (code >= 65 && code <= 90)){
					        	code += 32;
					        } else if (!e.shiftKey && (code >= 69 && code <= 105)){
					        	code -= 48;
					        } else if (e.shiftKey && _keydown.shifts.hasOwnProperty(code)){
					            //get shifted keyCode value
					            chara = _keydown.shifts[code];
					        }
					        
					        if( chara == '' ) chara = String.fromCharCode(code);
//	    				}
	    				
	    				// Stop executing if the user didn't type a number key, a decimal character, or backspace.
	    				if( code !== 8 && chara != dec_point && !chara.match(/[0-9]/) )
	    				{
	    					// We need the original keycode now...
	    					var key = (e.keyCode ? e.keyCode : e.which);
	    					if( // Allow control keys to go through... (delete, etc)
	    						key == 46 || key == 8 || key == 9 || key == 27 || key == 13 || 
	    						// Allow: Ctrl+A, Ctrl+R
	    						( (key == 65 || key == 82 ) && ( e.ctrlKey || e.metaKey ) === true ) || 
	    						// Allow: home, end, left, right
	    						( (key >= 35 && key <= 39) )
							){
								return;
							}
							// But prevent all other keys.
							e.preventDefault();
							return false;
	    				}
	    				
	    				//console.log('Continuing on: ', code, chara);
	    				
	    				// The whole lot has been selected, or if the field is empty, and the character
	    				if( ( start == 0 && end == this.value.length || $this.val() == 0 ) && !e.metaKey && !e.ctrlKey && !e.altKey && chara.length === 1 && chara != 0 )
	    				{
	    					// Blank out the field, but only if the data object has already been instanciated.
    						start = end = 1;
    						this.value = '';
    						
    						// Reset the cursor position.
	    					data.init = (decimals>0?-1:0);
	    					data.c = (decimals>0?-(decimals+1):0);
	    					setSelectionRange.apply(this, [0,0]);
	    				}
	    				
	    				// Otherwise, we need to reset the caret position
	    				// based on the users selection.
	    				else
	    				{
	    					data.c = end-this.value.length;
	    				}
	    				
	    				// If the start position is before the decimal point,
	    				// and the user has typed a decimal point, we need to move the caret
	    				// past the decimal place.
	    				if( decimals > 0 && chara == dec_point && start == this.value.length-decimals-1 )
	    				{
	    					data.c++;
	    					data.init = Math.max(0,data.init);
	    					e.preventDefault();
	    					
	    					// Set the selection position.
	    					setPos = this.value.length+data.c;
	    				}
	    				
	    				// If the user is just typing the decimal place,
	    				// we simply ignore it.
	    				else if( chara == dec_point )
	    				{
	    					data.init = Math.max(0,data.init);
	    					e.preventDefault();
	    				}
	    				
	    				// If hitting the delete key, and the cursor is behind a decimal place,
	    				// we simply move the cursor to the other side of the decimal place.
	    				else if( decimals > 0 && code == 8 && start == this.value.length-decimals )
	    				{
	    					e.preventDefault();
	    					data.c--;
	    					
	    					// Set the selection position.
	    					setPos = this.value.length+data.c;
	    				}
	    				
	    				// If hitting the delete key, and the cursor is to the right of the decimal
	    				// (but not directly to the right) we replace the character preceeding the
	    				// caret with a 0.
	    				else if( decimals > 0 && code == 8 && start > this.value.length-decimals )
	    				{
	    					if( this.value === '' ) return;
	    					
	    					// If the character preceeding is not already a 0,
	    					// replace it with one.
	    					if( this.value.slice(start-1, start) != '0' )
	    					{
	    						val = this.value.slice(0, start-1) + '0' + this.value.slice(start);
	    						$this.val(val.replace(regex_dec_num,'').replace(regex_dec,dec_point));
	    					}
	    					
	    					e.preventDefault();
	    					data.c--;
	    					
	    					// Set the selection position.
	    					setPos = this.value.length+data.c;
	    				}
	    				
	    				// If the delete key was pressed, and the character immediately
	    				// before the caret is a thousands_separator character, simply
	    				// step over it.
	    				else if( code == 8 && this.value.slice(start-1, start) == thousands_sep )
	    				{
	    					e.preventDefault();
	    					data.c--;
	    					
	    					// Set the selection position.
	    					setPos = this.value.length+data.c;
	    				}
	    				
	    				// If the caret is to the right of the decimal place, and the user is entering a
	    				// number, remove the following character before putting in the new one. 
	    				else if(
	    					decimals > 0 &&
	    					start == end &&
	    					this.value.length > decimals+1 &&
	    					start > this.value.length-decimals-1 && isFinite(+chara) &&
		    				!e.metaKey && !e.ctrlKey && !e.altKey && chara.length === 1
	    				)
	    				{
	    					// If the character preceeding is not already a 0,
	    					// replace it with one.
	    					if( end === this.value.length )
	    					{
	    						val = this.value.slice(0, start-1);
	    					}
	    					else
	    					{
	    						val = this.value.slice(0, start)+this.value.slice(start+1);
	    					}
	    					
	    					// Reset the position.
	    					this.value = val;
	    					setPos = start;
	    				}
	    				
	    				// If we need to re-position the characters.
	    				if( setPos !== false )
	    				{
	    					//console.log('Setpos keydown: ', setPos );
	    					setSelectionRange.apply(this, [setPos, setPos]);
	    				}
	    				
	    				// Store the data on the element.
	    				$this.data('numFormat', data);
	    				
	    			},
	    			
	    			/**
	    			 * Handles keyup events, re-formatting numbers.
	    			 *
	    			 * @param object e			: the keyup event object.s
	    			 *
	    			 * @return void;
	    			 */
	    			'keyup.format' : function(e){
	    				
	    				// Store these variables for use below.
	    				var $this	= $(this),
	    					data	= $this.data('numFormat'),
	    					code	= (e.keyCode ? e.keyCode : e.which),
	    					start	= getSelection.apply(this,['start']),
	    					setPos;
	    				    				    			
	    				// Stop executing if the user didn't type a number key, a decimal, or a comma.
	    				if( this.value === '' || (code < 48 || code > 57) && (code < 96 || code > 105 ) && code !== 8 ) return;
	    				
	    				// Re-format the textarea.
	    				$this.val($this.val());
	    				
	    				if( decimals > 0 )
	    				{
		    				// If we haven't marked this item as 'initialised'
		    				// then do so now. It means we should place the caret just 
		    				// before the decimal. This will never be un-initialised before
		    				// the decimal character itself is entered.
		    				if( data.init < 1 )
		    				{
		    					start		= this.value.length-decimals-( data.init < 0 ? 1 : 0 );
		    					data.c		= start-this.value.length;
		    					data.init	= 1;
		    					
		    					$this.data('numFormat', data);
		    				}
		    				
		    				// Increase the cursor position if the caret is to the right
		    				// of the decimal place, and the character pressed isn't the delete key.
		    				else if( start > this.value.length-decimals && code != 8 )
		    				{
		    					data.c++;
		    					
		    					// Store the data, now that it's changed.
		    					$this.data('numFormat', data);
		    				}
	    				}
	    				
	    				//console.log( 'Setting pos: ', start, decimals, this.value.length + data.c, this.value.length, data.c );
	    				
	    				// Set the selection position.
	    				setPos = this.value.length+data.c;
	    				setSelectionRange.apply(this, [setPos, setPos]);
	    			},
	    			
	    			/**
	    			 * Reformat when pasting into the field.
	    			 *
	    			 * @param object e 		: jQuery event object.
	    			 *
	    			 * @return false : prevent default action.
	    			 */
	    			'paste.format' : function(e){
	    				
	    				// Defint $this. It's used twice!.
	    				var $this		= $(this),
	    					original	= e.originalEvent,
	    					val		= null;
						
						// Get the text content stream.
						if (window.clipboardData && window.clipboardData.getData) { // IE
							val = window.clipboardData.getData('Text');
						} else if (original.clipboardData && original.clipboardData.getData) {
							val = original.clipboardData.getData('text/plain');
						}
						
	    				// Do the reformat operation.
	    				$this.val(val);
	    				
	    				// Stop the actual content from being pasted.
	    				e.preventDefault();
	    				return false;
	    			}
	    		
	    		})
	    		
	    		// Loop each element (which isn't blank) and do the format.
    			.each(function(){
    			
    				var $this = $(this).data('numFormat',{
    					c				: -(decimals+1),
    					decimals		: decimals,
    					thousands_sep	: thousands_sep,
    					dec_point		: dec_point,
    					regex_dec_num	: regex_dec_num,
    					regex_dec		: regex_dec,
    					init			: false
    				});
    				
    				// Return if the element is empty.
    				if( this.value === '' ) return;
    				
    				// Otherwise... format!!
    				$this.val($this.val());
    			});
	    	}
	    	else
	    	{
		    	// return the collection.
		    	return this.each(function(){
		    		var $this = $(this), num = +$this.text().replace(regex_dec_num,'').replace(regex_dec,'.');
		    		$this.number( !isFinite(num) ? 0 : +num, decimals, dec_point, thousands_sep );
		    	});
	    	}
	    }
	    
	    // Add this number to the element as text.
	    return this.text( $.number.apply(window,arguments) );
	};
	
	//
	// Create .val() hooks to get and set formatted numbers in inputs.
	//
	
	// We check if any hooks already exist, and cache
	// them in case we need to re-use them later on.
	var origHookGet = null, origHookSet = null;
	 
	// Check if a text valHook already exists.
	if( $.valHooks.text )
	{
	    // Preserve the original valhook function
	    // we'll call this for values we're not 
	    // explicitly handling.
	    origHookGet = $.valHooks.text.get;
	    origHookSet = $.valHooks.text.set;
	}
	else
	{
	    // Define an object for the new valhook.
	    $.valHooks.text = {};
	} 
	
	/**
	 * Define the valHook to return normalised field data against an input
	 * which has been tagged by the number formatter.
	 *
	 * @param object el			: The raw DOM element that we're getting the value from.
	 *
	 * @return mixed : Returns the value that was written to the element as a
	 *				   javascript number, or undefined to let jQuery handle it normally.
	 */
	$.valHooks.text.get = function( el ){
		
		// Get the element, and its data.
		var $this	= $(el), num,
			data	= $this.data('numFormat');
		
        // Does this element have our data field?
        if( !data )
        {
            // Check if the valhook function already existed
            if( $.isFunction( origHookGet ) )
            {
                // There was, so go ahead and call it
                return origHookGet(el);
            }
            else
            {
                // No previous function, return undefined to have jQuery
                // take care of retrieving the value
                return undefined;
			}
		}
		else
		{			
			// Remove formatting, and return as number.
			if( el.value === '' ) return '';
			
			// Convert to a number.
			num = +(el.value
				.replace( data.regex_dec_num, '' )
				.replace( data.regex_dec, '.' ));
			
			// If we've got a finite number, return it.
			// Otherwise, simply return 0.
			// Return as a string... thats what we're
			// used to with .val()
			return ''+( isFinite( num ) ? num : 0 );
		}
	};
	
	/**
	 * A valhook which formats a number when run against an input
	 * which has been tagged by the number formatter.
	 *
	 * @param object el		: The raw DOM element (input element).
	 * @param float			: The number to set into the value field.
	 *
	 * @return mixed : Returns the value that was written to the element,
	 *				   or undefined to let jQuery handle it normally. 
	 */
	$.valHooks.text.set = function( el, val )
	{
		// Get the element, and its data.
		var $this	= $(el),
			data	= $this.data('numFormat');
		
		// Does this element have our data field?
		if( !data )
		{
		    // Check if the valhook function already existed
		    if( $.isFunction( origHookSet ) )
		    {
		        // There was, so go ahead and call it
		        return origHookSet(el,val);
		    }
		    else
		    {
		        // No previous function, return undefined to have jQuery
		        // take care of retrieving the value
		        return undefined;
			}
		}
		else
		{
			return el.value = $.number( val, data.decimals, data.dec_point, data.thousands_sep )
		}
	};
	
	/**
	 * The (modified) excellent number formatting method from PHPJS.org.
	 * http://phpjs.org/functions/number_format/
	 *
	 * @modified by Sam Sehnert (teamdf.com)
	 *	- don't redefine dec_point, thousands_sep... just overwrite with defaults.
	 *	- don't redefine decimals, just overwrite as numeric.
	 *	- Generate regex for normalizing pre-formatted numbers.
	 *
	 * @param float number			: The number you wish to format, or TRUE to use the text contents
	 *								  of the element as the number. Please note that this won't work for
	 *								  elements which have child nodes with text content.
	 * @param int decimals			: The number of decimal places that should be displayed. Defaults to 0.
	 * @param string dec_point		: The character to use as a decimal point. Defaults to '.'.
	 * @param string thousands_sep	: The character to use as a thousands separator. Defaults to ','.
	 *
	 * @return string : The formatted number as a string.
	 */
	$.number = function( number, decimals, dec_point, thousands_sep ){
		
		// Set the default values here, instead so we can use them in the replace below.
		thousands_sep	= (typeof thousands_sep === 'undefined') ? ',' : thousands_sep;
		dec_point		= (typeof dec_point === 'undefined') ? '.' : dec_point;
		decimals		= !isFinite(+decimals) ? 0 : Math.abs(decimals);
		
		// Work out the unicode representation for the decimal place.	
		var u_dec = ('\\u'+('0000'+(dec_point.charCodeAt(0).toString(16))).slice(-4));
		
		// Fix the number, so that it's an actual number.
		number = (number + '')
			.replace(new RegExp(u_dec,'g'),'.')
			.replace(new RegExp('[^0-9+\-Ee.]','g'),'');
		
		var n = !isFinite(+number) ? 0 : +number,
		    s = '',
		    toFixedFix = function (n, decimals) {
		        var k = Math.pow(10, decimals);
		        return '' + Math.round(n * k) / k;
		    };
		
		// Fix for IE parseFloat(0.55).toFixed(0) = 0;
		s = (decimals ? toFixedFix(n, decimals) : '' + Math.round(n)).split('.');
		if (s[0].length > 3) {
		    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, thousands_sep);
		}
		if ((s[1] || '').length < decimals) {
		    s[1] = s[1] || '';
		    s[1] += new Array(decimals - s[1].length + 1).join('0');
		}
		return s.join(dec_point);
	}
	
})(jQuery);
/**
 * Dependencies
 * 	jquery-1.8.3
 *
 */
(function($) {
    $.fn.appendAt = function(element, index) {
        var children = this.children();
        if (index < 0) {
            if (children.length > 0) {
                $(children[0]).before(element);
            } else {
                this.append(element);
            }
        } else {
            if (index < children.length) {
                $(children[index]).before(element);
            } else {
                this.append(element);
            }
        }
    };
    $.fn.vMargin = function() {
        return parseInt(this.css("margin-top")) + parseInt(this.css("margin-bottom"));
    };
    $.fn.hMargin = function() {
        return parseInt(this.css("margin-left")) + parseInt(this.css("margin-right"));
    };
    $.fn.vPadding = function() {
        return parseInt(this.css("padding-top")) + parseInt(this.css("padding-bottom"));
    };
    $.fn.hPadding = function() {
        return parseInt(this.css("padding-left")) + parseInt(this.css("padding-right"));
    };
    $.fn.layoutWidth = function() {
        return this.outerWidth() + this.hMargin();
    };
    $.fn.layoutHeight = function() {
        return this.outerHeight() + this.vMargin();
    };
    $.browser.chrome = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
})(jQuery);
/**
 * Dependencies
 * 	JavascriptToolbox-Date 1.02
 * 		http://www.JavascriptToolbox.com/lib/date/
 *
 */
(function() {
	// TODO Globalization
	// Override
	Date.monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
	Date.dateNames = (function() {
		var array = _.range(1, 31 + 1);
		_.each(array, function(element, index, array) {
			array[index] = element + "日"
		});
		return array;
	})();
	// Override
	Date.dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
	Date.hourNames = (function() {
		var array = _.range(0, 24);
		_.each(array, function(element, index, array) {
			array[index] = element + "时"
		});
		return array;
	})();

	Date.prototype.getMonsday = function() {
		var t = new Date();
		t.setTime(this.getTime());
		t.clearTime();
		t.setDate(t.getDate() - (t.getDay() === 0 ? 6 : t.getDay() - 1));
		return t;
	};

})();
andrea.blink.declare("andrea.grace");(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.constants.AppConst");

    var AppConst = andrea.grace.constants.AppConst;

    /**
     * Models
     */
    AppConst.MODEL_GRACE = "MODEL_GRACE";

    /**
     * Mediators
     */
    AppConst.MEDIATOR_DATA_DISCOVERY = "MEDIATOR_DATA_DISCOVERY";

    AppConst.MEDIATOR_ANALYSIS_SRC_DIM = "MEDIATOR_ANALYSIS_SRC_DIM";
    AppConst.MEDIATOR_ANALYSIS_SRC_MEA = "MEDIATOR_ANALYSIS_SRC_MEA";
    AppConst.MEDIATOR_ANALYSIS_DES_DIM = "MEDIATOR_ANALYSIS_DES_DIM";
    AppConst.MEDIATOR_ANALYSIS_DES_MEA = "MEDIATOR_ANALYSIS_DES_MEA";

    AppConst.MEDIATOR_ANALYSIS_RESULT = "MEDIATOR_ANALYSIS_RESULT";

    AppConst.MEDIATOR_VIZ_NAVIGATOR = "MEDIATOR_VIZ_NAVIGATOR";
    /**
     * Actions
     */
    AppConst.ACTION_CHANGE_DATA_PROVIDER = "ACTION_CHANGE_DATA_PROVIDER";
    AppConst.ACTION_RUN_ANALYSIS = "ACTION_RUN_ANALYSIS";
    /**
     * Notifications
     */
    AppConst.NOTIFICATION_DATA_PROVIDER_CHANGED = "NOTIFICATION_DATA_PROVIDER_CHANGED";
    AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED = "NOTIFICATION_VIZ_CONTEXT_CHANGED";
    AppConst.NOTIFICATION_VIZ_CONTEXT_APPLIED = "NOTIFICATION_VIZ_CONTEXT_APPLIED";

    AppConst.VIEW_NOTIFICATION_PASTE_TO = "VIEW_NOTIFICATION_PASTE_TO";

})();
(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.constants.ShelfType");
    var ShelfType = grace.constants.ShelfType;

    ShelfType.SRC_DIM = "srcDim";
    ShelfType.SRC_MEA = "srcMea";

    ShelfType.DES_DIM = "desDimX";
    ShelfType.DES_VALUE = "desMeaValueY";

    ShelfType.PROC_FILTER = "procFilter";

    ShelfType.like = function(type1, type2) {
        return type1.substring(0, 3) === type2.substring(0, 3);
    }
    ShelfType.src = function(type) {
        return type && type.substring(0, 3) === "src";
    };
    ShelfType.des = function(type) {
        return type && type.substring(0, 3) === "des";
    };
    ShelfType.proc = function(type) {
        return type && type.substring(0, 4) === "proc";
    };

    ShelfType.dim = function(type) {
        return type === ShelfType.SRC_DIM || type === ShelfType.DES_DIM;
    };})();
(function() {
	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.constants.AnalysisType");

	/**
	 * TODO Remove this class
	 * It seems no needed
	 */
	var AnalysisType = grace.constants.AnalysisType;

	AnalysisType.DIMENSION = "dimension";
	AnalysisType.MEASURE = "measure";
})();
(function() {
	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.constants.ValueType");

	var ValueType = grace.constants.ValueType;

    ValueType.NULL = "null";
	ValueType.STRING = "string";
	ValueType.NUMBER = "number";
	ValueType.DATE = "date";
    ValueType.GEO = "geo";
})();
(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.constants.VizType");
    var VizType = grace.constants.VizType;

    VizType.RECOMMEND = "RECOMMEND";
    /**
     * Highcharts
     */

    // 1 category, 0~1 series, 1 data
    VizType.BAR = "BAR";
    VizType.STACKED_BAR = "STACKED_BAR";
    VizType.COLUMN = "COLUMN";
    VizType.STACKED_COLUMN = "STACKED_COLUMN";
    VizType.LINE = "LINE";
    VizType.AREA = "AREA";
    VizType.RADAR = "RADAR";

    // 0 category, 1 series, 1 data
    VizType.PIE = "PIE";
    // 0 category, 1 series, 1 data with neg
    VizType.WATERFALL = "WATERFALL";

    // 0 category, 0~1 series, 2~3 data(Merged with bubble)
    VizType.SCATTER = "SCATTER";

    /**
     * Google Charts
     */
    // TODO
    VizType.TABLE = "TABLE";
    VizType.GEO = "GEO";
    VizType.TREE_MAP = "TREE_MAP";

    VizType._MANIFESTS = (function() {
        var gen = function(type, title, numDimensions, numMeasures, icon) {
            return {
                'type' : type,
                'title' : title,
                'required' : {
                    'numDimensions' : numDimensions,
                    'numMeasures' : numMeasures
                },
                'icon' : icon ? grace.Settings.dataDiscovery.folder + icon : ''
            }
        }
        var m = {};
        m[VizType.RECOMMEND] = gen(VizType.RECOMMEND, '推荐图形', 0, 0, '');

        m[VizType.COLUMN] = gen(VizType.COLUMN, '柱状图', 0, 1, './assets/navigator/column.png', '');
        m[VizType.BAR] = gen(VizType.BAR, '条状图', 0, 1, './assets/navigator/bar.png', '');
        m[VizType.RADAR] = gen(VizType.RADAR, '雷达图', 1, 1, './assets/navigator/radar.png', '');

        m[VizType.SCATTER] = gen(VizType.SCATTER, '散点图', 1, 1, './assets/navigator/scatter.png', '');

        m[VizType.LINE] = gen(VizType.LINE, '折线图', 1, 1, './assets/navigator/line.png', '');
        m[VizType.AREA] = gen(VizType.AREA, '面积图', 1, 1, './assets/navigator/area.png', '');

        m[VizType.PIE] = gen(VizType.PIE, '饼图', 1, 1, './assets/navigator/pie.png', '');
        m[VizType.STACKED_COLUMN] = gen(VizType.STACKED_COLUMN, '堆积柱状图', 2, 1, './assets/navigator/stackedColumn.png', '');
        m[VizType.STACKED_BAR] = gen(VizType.STACKED_BAR, '堆积条状图', 2, 1, './assets/navigator/stackedBar.png', '');

        return m;
    })();

    VizType.manifest = function(type) {
        return VizType._MANIFESTS[type];
    };

    VizType.vertical = function(type) {
        return type === VizType.BAR || type === VizType.STACKED_BAR;
    };
    VizType.horizontal = function(type) {
        return type === VizType.COLUMN || type === VizType.STACKED_COLUMN || type === VizType.LINE || type === VizType.AREA;
    };
})();
(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.constants.Taobao");

    /**
     * TODO Remove this class
     * It seems no needed
     */
    var Taobao = grace.constants.Taobao = {
        'trade' : {
        }
    };

    Taobao.trade.status = {
        'TRADE_NO_CREATE_PAY' : '未创建支付宝交易',
        'WAIT_BUYER_PAY' : '等待买家付款',
        'SELLER_CONSIGNED_PART' : '卖家部分发货',
        // 即:买家已付款
        'WAIT_SELLER_SEND_GOODS' : '等待卖家发货',
        // 即:卖家已发货
        'WAIT_BUYER_CONFIRM_GOODS' : '等待买家确认收货',
        // 货到付款专用
        'TRADE_BUYER_SIGNED' : '买家已签收',
        'TRADE_FINISHED' : '交易成功',
        'TRADE_CLOSED' : '退款成功，交易关闭',
        'TRADE_CLOSED_BY_TAOBAO' : '未付款，交易关闭'
    }

    Taobao.trade.type = {
        'fixed' : '一口价',
        'auction' : '拍卖',
        'guarantee_trade' : '一口价、拍卖',
        'auto_delivery' : '自动发货',
        'independent_simple_trade' : '旺店入门版交易',
        'independent_shop_trade' : '旺店标准版交易',
        'ec' : '直冲',
        'cod' : '货到付款',
        'fenxiao' : '分销',
        'game_equipment' : '游戏装备',
        'shopex_trade' : 'ShopEX交易',
        'netcn_trade' : '万网交易',
        'external_trade' : '统一外部交易',
        'step' : '万人团'
    };
    Taobao.trade.shipping_type = {
        'free' : '卖家包邮',
        'post' : '平邮',
        'express' : '快递',
        'ems' : 'EMS',
        'virtual' : '虚拟发货',
        '25' : '次日必达',
        '26' : '预约配送'
    };

    Taobao.trade.trade_from = {
        'WAP' : '手机',
        'HITAO' : '嗨淘',
        'TOP' : 'TOP平台',
        'TAOBAO' : '普通淘宝',
        'JHS' : '聚划算'
    };
    Taobao.isKey = function(type, id) {
        return Taobao[type] != null && Taobao[type][id] != null;
    }
    Taobao.toCaption = function(key, type, id) {
        if (Taobao.isKey(type, id)) {
            if (id === 'trade_from') {
                var ids = id.split(',');
                if (ids.length > 1) {
                    var captions = [];
                    _.each(ids, function(id) {
                        captions.push(Taobao.toCaption(key, type, id));
                    })
                    return captions.join('，');
                }
            }
            return Taobao[type][id][key];
        } else {
            return key
        }
    };
})();
(function() {
	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.operation.OperationPriorityBaseline");

	var OperationPriorityBaseline = grace.operation.OperationPriorityBaseline;

	OperationPriorityBaseline.DISPLAY_ONLY = 0;
	OperationPriorityBaseline.DEFAULT_OPERATION = 10000;
	OperationPriorityBaseline.USER_SPECIFICATION = 20000;

})();
(function($) {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.operation.OperationType");

	var OperationType = grace.operation.OperationType;

    OperationType.CARD_REMOVE = "CARD_REMOVE";
    OperationType.CARD_ADD_TO_DIMENSION = "CARD_ADD_TO_DIMENSION";
    OperationType.CARD_ADD_TO_MEASURE = "CARD_ADD_TO_MEASURE";
    
	OperationType.CALC_COUNT = "CALC_COUNT";
	OperationType.CALC_UNIQ_COUNT = "CALC_UNIQ_COUNT";
	OperationType.CALC_SUM = "CALC_SUM";
	OperationType.CALC_AVG = "CALC_AVG";
	OperationType.CALC_MAX = "CALC_MAX";
	OperationType.CALC_MIN = "CALC_MIN";

	OperationType.SORT_NONE = "SORT_NONE";
	OperationType.SORT_ASCEND = "SORT_ASCEND";
	OperationType.SORT_DESCEND = "SORT_DESCEND";
    OperationType.SORT_ALPHABET_ASCEND = "SORT_ALPHABET_ASCEND";
    OperationType.SORT_ALPHABET_DESCEND = "SORT_ALPHABET_DESCEND";

	OperationType.DRILL_YEAR = "DRILL_YEAR";
	OperationType.DRILL_MONTH = "DRILL_MONTH";
	OperationType.DRILL_WEEK = "DRILL_WEEK";
	OperationType.DRILL_DATE = "DRILL_DATE";
	// OperationType.DRILL_HOUR = "DRILL_HOUR";

	OperationType.GROUP_MONTH = "GROUP_MONTH";
	OperationType.GROUP_DATE = "GROUP_DATE";
	OperationType.GROUP_DAY = "GROUP_DAY";
	OperationType.GROUP_HOUR = "GROUP_HOUR";
})(jQuery);
(function() {
	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.operation.OperationClassification");

	var OperationClassification = grace.operation.OperationClassification;

    OperationClassification.CARD_OPERATION = "cardOperation";
    OperationClassification.CALCULATE = "calculate";
	OperationClassification.SORT = "sort";
	OperationClassification.DRILL = "drill"
	OperationClassification.GROUP = "group";

	OperationClassification.exclusive = function(c1, c2) {
		if (c1 === c2) {
			return true;
		} else if ((c1 === OperationClassification.DRILL || c1 === OperationClassification.GROUP) && (c2 === OperationClassification.DRILL || c2 === OperationClassification.GROUP)) {
			return true;
		} else {
			return false;
		}
	}
})();
(function($) {
    var grace = andrea.grace;

    var OperationClassification = grace.operation.OperationClassification;
    var OperationType = grace.operation.OperationType;

    andrea.blink.declare('andrea.grace.operation.Operation');
    var Operation = grace.operation.Operation = function(type, priority) {
        this.id = _.uniqueId('operationID_');
        this.type = type;
        this.priority = priority;

        this.name = Operation._TYPE_TO_NAME[this.type];
        this.abbreviation = Operation._TYPE_TO_ABBREVIATION[this.type];
        this.classification = Operation._TYPE_TO_CLASSIFICATION[this.type];

        this.classificationName = Operation._CLASSIFICATION_TO_NAME[this.classification];
    };

    Operation._TYPE_TO_NAME = {};
    Operation._TYPE_TO_ABBREVIATION = {};
    Operation._TYPE_TO_CLASSIFICATION = {};

    Operation._CLASSIFICATION_TO_TYPES = {};
    Operation._CLASSIFICATION_TO_NAME = {};

    Operation._loadClass = function() {
        var loadType = function(classification, type, name, abbreviation) {
            Operation._TYPE_TO_CLASSIFICATION[type] = classification;
            Operation._TYPE_TO_NAME[type] = name;
            Operation._TYPE_TO_ABBREVIATION[type] = abbreviation;

            if (!Operation._CLASSIFICATION_TO_TYPES[classification]) {
                Operation._CLASSIFICATION_TO_TYPES[classification] = [];
            }
            Operation._CLASSIFICATION_TO_TYPES[classification].push(type);
        }
        var loadClassification = function(classification, name) {
            Operation._CLASSIFICATION_TO_NAME[classification] = name;
        }
        // Classification
        loadClassification(OperationClassification.CARD_OPERATION, '删除');
        loadClassification(OperationClassification.CALCULATE, '计算');
        loadClassification(OperationClassification.SORT, '排序');
        loadClassification(OperationClassification.DRILL, '每');
        loadClassification(OperationClassification.GROUP, '按...分组');
        // CARD_OPERATION
        loadType(OperationClassification.CARD_OPERATION, OperationType.CARD_ADD_TO_DIMENSION, '\uf067 分析纬度', '');
        loadType(OperationClassification.CARD_OPERATION, OperationType.CARD_ADD_TO_MEASURE, '\uf067 分析指标', '');
        loadType(OperationClassification.CARD_OPERATION, OperationType.CARD_REMOVE, '\uf00d 移除', '');
        // CALCULATE
        loadType(OperationClassification.CALCULATE, OperationType.CALC_COUNT, '总数', '总');
        loadType(OperationClassification.CALCULATE, OperationType.CALC_UNIQ_COUNT, '计数（唯一）', '数');
        loadType(OperationClassification.CALCULATE, OperationType.CALC_SUM, '∑ 总和', '∑');
        loadType(OperationClassification.CALCULATE, OperationType.CALC_AVG, '平均值', '均');
        loadType(OperationClassification.CALCULATE, OperationType.CALC_MAX, '最大值', 'Max');
        loadType(OperationClassification.CALCULATE, OperationType.CALC_MIN, '最小值', 'Min');
        // SORT
        loadType(OperationClassification.SORT, OperationType.SORT_NONE, '不排序', '');
        loadType(OperationClassification.SORT, OperationType.SORT_ASCEND, '\uf160 升序', '\uf160');
        loadType(OperationClassification.SORT, OperationType.SORT_DESCEND, '\uf161 降序', '\uf161');
        loadType(OperationClassification.SORT, OperationType.SORT_ALPHABET_ASCEND, '\uf15d 升序', '\uf15d');
        loadType(OperationClassification.SORT, OperationType.SORT_ALPHABET_DESCEND, '\uf15e 降序', '\uf15e');
        // DRILL
        var today = new Date();
        loadType(OperationClassification.DRILL, OperationType.DRILL_YEAR, '每年 (' + today.format('yyyy') + ')', '每年');
        loadType(OperationClassification.DRILL, OperationType.DRILL_MONTH, '每月 (' + today.format('yyyy/M') + ')', '每月');
        var currentMon = today.getMonsday();
        var nextMon = new Date();
        nextMon.setTime(currentMon.getTime() + 7 * 24 * 3600 * 1000);
        loadType(OperationClassification.DRILL, OperationType.DRILL_WEEK, '每周 (' + currentMon.format('yyyy/M/d') + ' - ' + nextMon.format('M/d') + ')', '每周');
        loadType(OperationClassification.DRILL, OperationType.DRILL_DATE, '每日 (' + today.format('yyyy/M/d') + ')', '每日');
        // GROUP
        loadType(OperationClassification.GROUP, OperationType.GROUP_MONTH, '月 (1 - 12)', '月');
        loadType(OperationClassification.GROUP, OperationType.GROUP_DATE, '日 (1 - 31)', '日');
        loadType(OperationClassification.GROUP, OperationType.GROUP_DAY, '星期 (1 - 7)', '星');
        loadType(OperationClassification.GROUP, OperationType.GROUP_HOUR, '时 (0 - 23)', '时');
    };
    Operation._loadClass();

    Operation.getTypes = function(classification) {
        return Operation._CLASSIFICATION_TO_TYPES[classification];
    }
})(jQuery);
(function($) {
	var grace = andrea.grace;
	var Operation = grace.operation.Operation;
	var OperationPriorityBaseline = grace.operation.OperationPriorityBaseline;

	andrea.blink.declare("andrea.grace.operation.OperationFactory");
	var OperationFactory = grace.operation.OperationFactory;

	if (!OperationFactory._count) {
		OperationFactory._count = 0;
	}
	if (!OperationFactory._mapping) {
		OperationFactory._mapping = {};
	}
	OperationFactory.produce = function(type, baseline) {
		var o = new Operation(type, baseline + OperationFactory._count);

		OperationFactory._count++;
		OperationFactory._mapping[o.id] = o;
		
		return o;
	};
	OperationFactory.get = function(id) {
		return OperationFactory._mapping[id];
	};
})(jQuery);
(function($) {
    var grace = andrea.grace;

    var OperationType = grace.operation.OperationType;
    var Operation = grace.operation.Operation;
    var OperationFactory = grace.operation.OperationFactory;
    var OperationClassification = grace.operation.OperationClassification;
    var OperationPriorityBaseline = grace.operation.OperationPriorityBaseline;

    andrea.blink.declare("andrea.grace.operation.OperationGroup");
    var OperationGroup = grace.operation.OperationGroup = function(ids) {
        this._operations = null;
        this._typeToOperation = null;

        this._initialize(ids);
    };
    OperationGroup.createByTypes = function(types, baseline) {
        if (baseline) {
            baseline = OperationPriorityBaseline.DISPLAY_ONLY;
        }

        var ids = [];
        for (var i = 0; i < types.length; i++) {
            var o = OperationFactory.produce(types[i]);
            ids.push(o.id);
        }
        return new OperationGroup(ids);
    };
    OperationGroup.createByClassification = function(classification, excludes) {
        var types = Operation.getTypes(classification);
        if (excludes) {
            excludes.splice(0, 0, types);
            types = _.without.apply(null, excludes);
        }
        return OperationGroup.createByTypes(types);
    };
    OperationGroup.prototype._initialize = function(ids) {
        this._operations = [];
        this._typeToOperation = {};

        if (!ids) {
            return;
        }

        var i;

        for ( i = 0; i < ids.length; i++) {
            var id = ids[i];
            var o = OperationFactory.get(id);

            this._operations.push(o);
            this._typeToOperation[o.type] = o;
        }
    };
    OperationGroup.prototype.operations = function() {
        return this._operations;
    };

    OperationGroup.prototype.mapIDs = function() {
        return _.map(this._operations, function(o) {
            return o.id;
        })
    };
    OperationGroup.prototype.mapNames = function() {
        return _.map(this._operations, function(o) {
            return o.name;
        });
    };
    OperationGroup.prototype.mapAbbrs = function() {
        return _.map(this._operations, function(o) {
            return o.abbreviation;
        });
    };
    OperationGroup.prototype.get = function(type) {
        return this._typeToOperation[type];
    };
    OperationGroup.prototype.ascend = function() {
        return this.get(OperationType.SORT_ASCEND) || this.get(OperationType.SORT_ALPHABET_ASCEND);
    };
    OperationGroup.prototype.descend = function() {
        return this.get(OperationType.SORT_DESCEND) || this.get(OperationType.SORT_ALPHABET_DESCEND);
    };
    OperationGroup.prototype.has = function(type) {
        return this._typeToOperation[type] !== undefined;
    };
    OperationGroup.prototype.hasClassification = function(classification) {
        return _.map(this._operations, function(o) {
            return o.classification;
        }).indexOf(classification) != -1;
    };
    OperationGroup.prototype.calculator = function() {
        if (this.has(OperationType.CALC_COUNT)) {
            return new grace.calculator.Count();
        } else if (this.has(OperationType.CALC_UNIQ_COUNT)) {
            return new grace.calculator.UniqCount();
        } else if (this.has(OperationType.CALC_SUM)) {
            return new grace.calculator.Sum();
        } else if (this.has(OperationType.CALC_AVG)) {
            return new grace.calculator.Avg();
        } else if (this.has(OperationType.CALC_MAX)) {
            return new grace.calculator.Max();
        } else if (this.has(OperationType.CALC_MIN)) {
            return new grace.calculator.Min();
        }
        return null;
    };
    OperationGroup.prototype.addOperation = function(id) {
        var newOperation = OperationFactory.get(id);

        this._operations = _.filter(this._operations, function(o) {
            return !OperationClassification.exclusive(o.classification, newOperation.classification);
        });
        this._operations.push(newOperation);
    };
    OperationGroup.prototype.removeOperation = function(id) {
        var operation = OperationFactory.get(id);
        this._operations = _.without(this._operations, operation);
        delete this._typeToOperation[operation.type];
    };
})(jQuery);
(function() {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.models.value.ValueBase");
    // TODO Remove value param, Pass date temporary. Integrate with DataConvertUtil
    var ValueBase = grace.models.value.ValueBase = function(raw, value) {
        this._raw = raw;
        this._value = value;

        this._quantified = null;
        this._caption = null;
    };
    ValueBase.prototype.raw = function() {
        return this._raw;
    };
    ValueBase.prototype.value = function() {
        return this._value;
    };
    ValueBase.prototype.notNull = function() {
        return true;
    };
    ValueBase.prototype.quantified = function() {
        throw new Error('StringValue does not quantifiable.');
    };
    ValueBase.prototype.caption = function() {
    };
    ValueBase.prototype.toString = function() {
        return this._value.toString();
    };
})();
(function() {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.models.value.BooleanValue");
    var BooleanValue = grace.models.value.BooleanValue = function(raw, value) {
        BooleanValue.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(BooleanValue, andrea.grace.models.value.ValueBase);

    BooleanValue._falseInstance = new BooleanValue(false, false);
    BooleanValue._trueInstance = new BooleanValue(true, true);

    BooleanValue.falseInstance = function() {
        return BooleanValue._falseInstance;
    }
    BooleanValue.trueInstance = function() {
        return BooleanValue._trueInstance;
    }

    BooleanValue.prototype.caption = function() {
        if (this._value) {
            return '是';
        } else {
            return '否';
        }
    };
})();
(function() {

	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.models.value.DateValue");
	var DateValue = grace.models.value.DateValue = function(raw, value) {
		DateValue.superclass.constructor.apply(this, arguments);

		this._captionsByFormat = {};

		DateValue._instances[raw] = this;
	};
	andrea.blink.extend(DateValue, andrea.grace.models.value.ValueBase);

	DateValue.parseQuantified = function(quantified) {
		var d = new Date();
		d.setTime(quantified);
		return new DateValue(quantified.toString(), d);
	};

	DateValue._instances = {};
	DateValue.instance = function(raw) {
		return DateValue._instances[raw];
	};

	DateValue.prototype.quantified = function() {
		if (this._quantified === null) {
			this._quantified = this._value.getTime();
		}
		return this._quantified;
	};
	DateValue.CAPTION_DRILL_YEAR = 'CAPTION_DRILL_YEAR';
	DateValue.CAPTION_DRILL_MONTH = 'CAPTION_DRILL_MONTH';
	DateValue.CAPTION_DRILL_WEEK = 'CAPTION_DRILL_WEEK';
	DateValue.CAPTION_DRILL_DATE = 'CAPTION_DRILL_DATE';
	DateValue.CAPTION_GROUP_MONTH = 'CAPTION_GROUP_MONTH';
	DateValue.CAPTION_GROUP_DATE = 'CAPTION_GROUP_DATE';
	DateValue.CAPTION_GROUP_DAY = 'CAPTION_GROUP_DAY';
	DateValue.CAPTION_GROUP_HOUR = 'CAPTION_GROUP_HOUR';

	DateValue.prototype.caption = function(format) {
		if (!format) {
			format = DateValue.CAPTION_DRILL_DATE;
		}
		var caption;
		if (!this._captionsByFormat[format]) {
			if (format === DateValue.CAPTION_DRILL_YEAR) {
				caption = this._value.format('yyyy');
			} else if (format === DateValue.CAPTION_DRILL_MONTH) {
				caption = this._value.format('yyyy/M');
			} else if (format === DateValue.CAPTION_DRILL_DATE) {
				caption = this._value.format('yyyy/M/d');
			} else if (format === DateValue.CAPTION_DRILL_WEEK) {
				var from = this._value.getMonsday();
				var to = new Date();
				to.setTime(from.getTime() + 7 * 24 * 3600 * 1000);
				caption = from.format('yyyy/M/d') + '-' + to.format('M/d');
			} else if (format === DateValue.CAPTION_GROUP_MONTH) {
				caption = Date.monthNames[this._value.getMonth()];
			} else if (format === DateValue.CAPTION_GROUP_DATE) {
				caption = Date.dateNames[this._value.getDate() - 1];
			} else if (format === DateValue.CAPTION_GROUP_DAY) {
				caption = Date.dayNames[this._value.getDay()];
			} else if (format === DateValue.CAPTION_GROUP_HOUR) {
				caption = Date.hourNames[this._value.getHours()];
			}

			this._captionsByFormat[format] = caption
		}
		return this._captionsByFormat[format];
	};
})();
(function() {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.models.value.NullValue");
    var NullValue = grace.models.value.NullValue = function(raw, value) {
        NullValue.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(NullValue, andrea.grace.models.value.ValueBase);

    NullValue._instance = new NullValue();
    NullValue.instance = function() {
        return NullValue._instance;
    }

    NullValue.prototype.notNull = function() {
        return false;
    };
    NullValue.prototype.quantified = function() {
        return 0;
    };
    NullValue.prototype.caption = function() {
        return '{空值}';
    };
    NullValue.prototype.toString = function() {
        return '';
    };
})();
(function() {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.models.value.NumberValue");
    var NumberValue = grace.models.value.NumberValue = function(raw, value) {
        NumberValue.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(NumberValue, andrea.grace.models.value.ValueBase);

    NumberValue.parseQuantified = function(quantified) {
        return new NumberValue(quantified.toString(), quantified);
    };
    NumberValue.prototype.quantified = function() {
        return this._value;
    };
    NumberValue.prototype.caption = function() {
        if (this._caption === null) {
            var n = this._value;
            if (n != parseInt(n)) {
                this._caption = $.number(n, 2);
            } else {
                this._caption = $.number(n, 0);
            }
        }
        return this._caption;
    };
})();
(function() {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.models.value.StringValue");
    var StringValue = grace.models.value.StringValue = function(raw, value) {
        StringValue.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(StringValue, andrea.grace.models.value.ValueBase);

    StringValue.prototype.caption = function() {
        return this._value;
    };
})();
(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.utils.URLUtil");
    var URLUtil = grace.utils.URLUtil;

    var _hashPairs = null;

    URLUtil.hashPairs = function() {
        if (_hashPairs === null) {
            _hashPairs = {};
            // Ignore '#' in the hash
            var paramString = window.location.hash.slice(1);
            var parameters = paramString.split("&");
            for (var index in parameters) {
                var parameter = parameters[index].split("=");
                if (parameter.length == 2) {
                    var name = parameter[0];
                    if (name) {
                        _hashPairs[name] = decodeURIComponent(parameter[1]);
                    }
                }
            }

            paramString = window.location.search.slice(1);
            // Ignore '?' in the search
            parameters = paramString.split("&");
            for (var index in parameters) {
                var parameter = parameters[index].split("=");
                if (parameter.length == 2) {
                    var name = parameter[0];
                    if (name && (_hashPairs[name] == null || _hashPairs[name] === "")) {
                        _hashPairs[name] = decodeURIComponent(parameter[1]);
                    }
                }
            }
        }
        return _hashPairs;
    };
})();
(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.utils.FilterUtil");
    var FilterUtil = grace.utils.FilterUtil;

    FilterUtil.filter = function(dataProvider, filterSAs) {
        if (!filterSAs || filterSAs.length === 0) {
            return dataProvider;
        }
        var filteredValues2d = [];
        for ( i = 0; i < dataProvider.numRows; i++) {
            var values = dataProvider.getRValues(i);
            // Filter
            var filtered = true;
            _.each(filterSAs, function(sa) {
                filtered = filtered && sa.filter.filter(values[sa.source.index]);
            });
            if (!filtered) {
                continue;
            }
            filteredValues2d.push(values);
        }
        return new grace.models.DataProvider(filteredValues2d);
    }
})();
(function() {
	var grace = andrea.grace;

	andrea.blink.declare('andrea.grace.utils.ConverterType');

	var ConverterType = grace.utils.ConverterType;

	ConverterType.ANY = 'any';

	ConverterType.BOOLEAN = 'boolean';
	ConverterType.STRING = 'string';
	ConverterType.NUMBER = 'number';
	ConverterType.EXCEL_DATE = 'excelDate';
	ConverterType.DATE = 'date';

	ConverterType._dateFormats = (function() {
		var array = [];
		array.push('yyyy/MM/dd');
		array.push('yyyy/M/d');
		array.push('yy/MM/dd');
		array.push('yy/M/d');
		array.push('MM/dd/yyyy');
		array.push('M/d/yyyy');
		array.push('MM/dd/yy');
		array.push('M/d/yy');
		array.reverse();
		return array;
	})();
	ConverterType.getDateFormats = function() {
		return ConverterType._dateFormats;
	}
	ConverterType._monthFormats = (function() {
		var array = [];
		array.push('yyyy/M');
		array.push('yy/M');
		array.reverse();
		return array;
	})();
	ConverterType.getMonthFormats = function() {
		return ConverterType._monthFormats;
	}
})();
(function() {
	var grace = andrea.grace;

	var ConverterType = grace.utils.ConverterType;
	var DateValue = grace.models.value.DateValue;
	var NullValue = grace.models.value.NullValue;
	var BooleanValue = grace.models.value.BooleanValue;
	var NumberValue = grace.models.value.NumberValue;
	var StringValue = grace.models.value.StringValue;

	andrea.blink.declare('andrea.grace.utils.DataConvertUtil');
	var DataConvertUtil = grace.utils.DataConvertUtil;

	DataConvertUtil.match = function(raw, tryExcel) {
		var value = null;
		var type = null;
		if (raw) {
			value = DataConvertUtil._convertNumber(raw);
			// We can't identify a number or a date exactly in excel date format, so we narrow down the date range to
			// 1990/1/1 - 2030/12/31
			if (value.notNull()) {
				if (tryExcel && (value.value() >= 32874 && value.value() <= 47848 )) {
					value = DataConvertUtil._convertExcelDate(raw);
					type = ConverterType.EXCEL_DATE;
				} else {
					type = ConverterType.NUMBER;
				}
			}
			if (!value.notNull()) {
				value = DataConvertUtil._convertDate(raw);
				type = ConverterType.DATE;
			}
			if (!value.notNull()) {
				value = DataConvertUtil._convertBoolean(raw);
				type = ConverterType.BOOLEAN;
			}
			if (!value.notNull()) {
				value = DataConvertUtil._convertString(raw);
				type = ConverterType.STRING;
			}
		} else {
			type = ConverterType.ANY;
			value = NullValue.instance();
		}
		return {
			'type' : type,
			'value' : value
		};
	};
	DataConvertUtil.getConverter = function(type, raw) {
		if (type === ConverterType.BOOLEAN) {
			return DataConvertUtil._convertBoolean;
		} else if (type === ConverterType.NUMBER) {
			return DataConvertUtil._convertNumber;
		} else if (type === ConverterType.DATE) {
			return DataConvertUtil._convertDate;
		} else if (type === ConverterType.EXCEL_DATE) {
			return DataConvertUtil._convertExcelDate;
		} else if (type === ConverterType.STRING) {
			return DataConvertUtil._convertString;
		} else {
			return null;
		}
	};
	DataConvertUtil._convertString = function(raw) {
		if (raw != null) {
			return new StringValue(raw, _.str.trim(raw.toString()));
		} else {
			return NullValue.instance();
		}
	};
	DataConvertUtil._convertBoolean = function(raw) {
		if (raw === false) {
			return new BooleanValue.falseInstance();
		} else if (raw === true) {
			return new BooleanValue.trueInstance();
		} else {
			return NullValue.instance();
		}
	};

	DataConvertUtil._convertNumber = function(raw) {
		if (raw != null) {
			var s = _.str.trim(raw.toString());
			if (!isNaN(s)) {
				return new NumberValue(raw, Number(s));
			} else {
				if (s.length > 1 && s.substr(s.length - 1, 1) === '%') {
					s = s.substr(0, s.length - 1);
					if (!isNaN(s)) {
						return new NumberValue(raw, Number(s));
					}
				}
			}
		} else {
			return NullValue.instance();
		}
		return NullValue.instance();
	};
	/**
	 *
	 * @param {Object} raw
	 */
	DataConvertUtil._convertDate = function(raw) {
		if (!raw) {
			return NullValue.instance();
		}
		var s = _.str.trim(raw.toString());
		if (s.length < 6 || isNaN(s.substr(0, 1)) || isNaN(s.substr(s.length - 1, 1))) {
			return NullValue.instance();
		}
		s = s.replace(/[年月日_-]/g, '/');
		if (s.indexOf('/') === -1) {
			return NullValue.instance();
		}
		var cache = DateValue.instance(raw);
		if (cache) {
			return cache;
		}
		var formatHMS;
		if (s.indexOf(' ') !== -1) {
			if (s.indexOf(':') === -1) {
				return NullValue.instance();
			} else {
				if (s.indexOf(':') === s.lastIndexOf(':')) {
					formatHMS = 'H:m';
				} else {
					formatHMS = 'H:m:s';
				}
			}
		}
		var date = null;
		if (DataConvertUtil._preferDateTest) {
			date = Date.parseString(s, DataConvertUtil._preferDateTest);
		}
		var formats;
		var parts = s.split('/');
		if (parts.length === 3) {
			formats = ConverterType.getDateFormats();
		} else if (parts.length === 2) {
			formats = ConverterType.getMonthFormats();
		}
		for (var i = formats.length - 1; i >= 0 && !date; i--) {
			var test = formats[i];
			if (formatHMS) {
				test = test + ' ' + formatHMS;
			}
			date = Date.parseString(s, test);
			if (date) {
				DataConvertUtil._preferDateTest = test;
				break;
			}
		}
		// console.log(date);
		if (date) {
			return new DateValue(raw, date);
		} else {
			return NullValue.instance();
		}
	}
	DataConvertUtil._preferDateTest = null;

	/**
	 *
	 * @param {Object} raw
	 */
	DataConvertUtil._convertExcelDate = function(raw) {
		if (!raw) {
			return NullValue.instance();
		}
		var s = _.str.trim(raw.toString());
		if (isNaN(s)) {
			return NullValue.instance();
		}
		var cache = DateValue.instance(raw);
		if (cache) {
			return cache;
		}

		excelTime = parseFloat(s);
		// Adjust excelTime overflow
		if (excelTime > DataConvertUtil._WRONG_DATE_IN_EXCEL_FORMAT)
			excelTime = excelTime - 1;

		var excelBaseMS = DataConvertUtil._EXCEL_BASE_TIME - DataConvertUtil._DAY_IN_MILLISECONDS;
		var dateMSUTC = excelBaseMS + excelTime * DataConvertUtil._DAY_IN_MILLISECONDS;

		var date = new Date();
		date.setTime(dateMSUTC + DataConvertUtil._getTimezoneOffsetMS());
		return new DateValue(raw, date);
	};
	// Date.UTC(1900, 0);
	DataConvertUtil._EXCEL_BASE_TIME = -2208988800000;
	// February 29th 1900, There is no 'February 29' in 1900, wrong set in Excel Date
	DataConvertUtil._WRONG_DATE_IN_EXCEL_FORMAT = 60;
	// milliseconds of 1 day, 24 * 60 * 60 * 1000
	DataConvertUtil._DAY_IN_MILLISECONDS = 86400000;

	DataConvertUtil._TIMEZONE_OFFSET_MS = 0;
	DataConvertUtil._createAndReadTimezoneOffset = function() {
		// Create
		DataConvertUtil._TIMEZONE_OFFSET_MS = new Date().getTimezoneOffset() * 60 * 1000;
		// Redirect the get method to Read
		DataConvertUtil._getTimezoneOffsetMS = DataConvertUtil._readTimezoneOffset;
		// Read
		return DataConvertUtil._readTimezoneOffset();
	};
	DataConvertUtil._readTimezoneOffset = function() {
		return DataConvertUtil._TIMEZONE_OFFSET_MS;
	};
	// Default get method is Write
	DataConvertUtil._getTimezoneOffsetMS = DataConvertUtil._createAndReadTimezoneOffset;
})();
(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.utils.ColorUtil");

    var ColorUtil = grace.utils.ColorUtil;

    ColorUtil.hexToRgb = function(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            'r' : parseInt(result[1], 16),
            'g' : parseInt(result[2], 16),
            'b' : parseInt(result[3], 16)
        } : null;
    }

    ColorUtil.rgbToHex = function(r, g, b) {
        return "#" + ColorUtil._componentToHex(r) + ColorUtil._componentToHex(g) + ColorUtil._componentToHex(b);
    }
    ColorUtil._componentToHex = function(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
})();
(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.utils.Stopwatch");

    var Stopwatch = grace.utils.Stopwatch = function(type, startImmediately) {
        this._s = null;
        this._e = null;
        this._laps = null;

        this.type = type;
        if (startImmediately === true) {
            this.start();
        }
    };
    Stopwatch.prototype.start = function() {
        this._s = new Date().getTime();
        this._laps = [];
    };
    Stopwatch.prototype.lap = function(last) {
        var laps = this._laps;
        laps.push(new Date().getTime());

        if (last === true) {
            this._e = laps[laps.length - 1];
        }

        if (laps.length > 1) {
            return laps[laps.length - 1] - laps[laps.length - 2];
        } else {
            return laps[0] - this._s;
        }
    };
    Stopwatch.prototype.total = function() {
        return this._e - this._s;
    };
})();
(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.managers.Log');
    var Log = grace.managers.Log;

    Log.INTERACTION = 'interaction';
    Log.PERFORMANCE = 'performance';

    Log.LINE_SPLITTER = '%LINE_SPLITTER%';

    Log._start = new Date().getTime();
    Log._uid = Log._start + '_' + _.random(0, 10000);
    Log.user = null;

    Log.console = function() {
        console.log(arguments);
    };
    Log.interaction = function(interaction, detail) {
        Log._log('info', Log.INTERACTION, [interaction, detail].join(','));
    };
    Log.performance = function(phase, detail) {
        Log._log('info', Log.PERFORMANCE, [phase, detail].join(','));
    };

    $(window).on('beforeunload', function() {
        Log.interaction('close', (new Date().getTime() - Log._start) / 1000);
        Log._releaseCache();
    });
    Log._logCache = null;
    Log._log = function(level, type, detail) {
        var prefix = [];
        prefix.push('grace_' + grace.Settings.version);
        prefix.push('log_' + grace.Settings.log.version);
        prefix.push(Log.user);
        prefix.push(Log._uid);
        prefix.push(Log._time());

        var msg = [prefix.join(','), type, detail].join(',');
        if (grace.Settings.log.console && console) {
            console.log(level, msg);
        }

        if (!Log._logCache) {
            Log._logCache = {};
            _.delay(Log._releaseCache, 10 * 1000);
        }
        if (!Log._logCache[level]) {
            Log._logCache[level] = [];
        }
        Log._logCache[level].push(msg);
    };
    Log._releaseCache = function() {
        if (!Log._logCache) {
            return;
        }
        for (var level in Log._logCache) {
            var msg = Log._logCache[level].join(Log.LINE_SPLITTER);
            $.ajax({
                'dataType' : 'json',
                'url' : grace.Settings.log.url,
                'data' : {
                    'level' : level,
                    'msg' : msg
                },
                'type' : 'POST'
            });
        }
        Log._logCache = null;
    }
    Log._time = function() {
        var d = new Date();
        var t = d.getTime().toString();
        return d.format('yyyy/MM/dd HH:mm:ss') + ',' + t.substr(t.length - 3);
    }
})(jQuery);
(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.helpers.PageTransition");
    /**
     * out, in {
     *     $page
     *     classes
     * }
     */
    var PageTransition = grace.helpers.PageTransition = function(outObj, inObj, endCallback) {
        this._$outPage = outObj['$page'];        this._outClasses = outObj.classes.join(' ');
        this._outDelay = outObj.delay;
        this._$inPage = inObj['$page'];
        this._inClasses = inObj.classes.join(' ');
        this._inDelay = inObj.delay;

        this._endCallback = endCallback;

        this._inEnded = false;
        this._outEnded = false;
    };
    PageTransition.prototype.$outPage = function() {
        return this._$outPage;
    };
    PageTransition.prototype.$inPage = function() {
        return this._$inPage;
    };
    PageTransition.prototype.play = function() {
        // Play animation
        if (this._outClasses) {
            var playOut = $.proxy(function() {
                this._$outPage.addClass(this._outClasses).on('webkitAnimationEnd', $.proxy(function() {
                    this._$outPage.off('webkitAnimationEnd');

                    this._inEnded = true;
                    this._animationEndHandler();
                }, this));
            }, this);

            if (this._outDelay) {
                _.delay(playOut, this._outDelay);
            } else {
                playOut();
            }
        } else {
            this._inEnded = true;
            this._animationEndHandler();
        }

        if (this._inClasses) {
            var playIn = $.proxy(function() {
                this._$inPage.show(0);
                this._$inPage.addClass(this._inClasses).on('webkitAnimationEnd', $.proxy(function() {
                    this._$inPage.off('webkitAnimationEnd');

                    this._outEnded = true;
                    this._animationEndHandler();
                }, this));
            }, this);
            if (this._inDelay) {
                this._$inPage.hide(0);
                _.delay(playIn, this._inDelay);
            } else {
                playIn();
            }
        } else {
            this._outEnded = true;
            this._animationEndHandler();
        }
    };
    PageTransition.prototype._animationEndHandler = function() {
        if (!this._inEnded || !this._outEnded) {
            return;
        }
        // Reset pages
        this._$outPage.removeClass(this._outClasses);
        this._$inPage.removeClass(this._inClasses);

        // Reset flags
        this._inEnded = false;
        this._outEnded = false;

        // Callback
        if (this._endCallback) {
            this._endCallback.call(this);
        }
    };
})();
(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.calculator.supportClasses.ICalculator");

	var ICalculator = grace.calculator.supportClasses.ICalculator = function() {
	};

	ICalculator.prototype.addFactor = function(value) {

	};
	ICalculator.prototype.calculate = function() {
		return 0;
	};
})();
(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.calculator.Sum");

	var Sum = grace.calculator.Sum = function() {
		this._sum = 0;
	};
	andrea.blink.extend(Sum, grace.calculator.supportClasses.ICalculator);

	Sum.prototype.addFactor = function(value) {
		value = parseFloat(value);
		if (!isNaN(value)) {
			this._sum = parseFloat((this._sum + value).toFixed(4));
		}
	};
	Sum.prototype.calculate = function() {
		return this._sum;
	};
})();
(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.calculator.Max");

	var Max = grace.calculator.Max = function() {
		this._max = 0;
	};
	andrea.blink.extend(Max, grace.calculator.supportClasses.ICalculator);

	Max.prototype.addFactor = function(value) {
		if (!isNaN(value)) {
			this._max = Math.max(this._max, value);
		}
	};
	Max.prototype.calculate = function() {
		return this._max;
	};
})();
(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.calculator.Min");

	var Min = grace.calculator.Min = function() {
		this._max = Number.MAX_VALUE;
	};
	andrea.blink.extend(Min, grace.calculator.supportClasses.ICalculator);

	Min.prototype.addFactor = function(value) {
		if (!isNaN(value)) {
			this._max = Math.min(this._max, value);
		}
	};
	Min.prototype.calculate = function() {
		return this._max;
	};
})();
(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.calculator.Avg");

    var Avg = grace.calculator.Avg = function() {
        this._sumAlternate = 0;
        this._count = 0;
    };
    andrea.blink.extend(Avg, grace.calculator.supportClasses.ICalculator);

    Avg.prototype.addFactor = function(value) {
        if (!isNaN(value)) {
            this._sumAlternate += Math.round(value * 1000000);
        }
        this._count++;
    };
    Avg.prototype.calculate = function() {
        if (this._count === 0) {
            return 0;
        } else {
            return Math.round(this._sumAlternate / this._count) / 1000000;
        }
    };
})();
(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.calculator.Count");

	var Count = grace.calculator.Count = function() {
		this._count = 0;
	};
	andrea.blink.extend(Count, grace.calculator.supportClasses.ICalculator);

	Count.prototype.addFactor = function(value) {
		this._count++;
	};
	Count.prototype.calculate = function() {
		return this._count;
	};
})();
(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.calculator.UniqCount");

	var UniqCount = grace.calculator.UniqCount = function() {
		this._count = 0;
		this._mapping = {};
	};
	andrea.blink.extend(UniqCount, grace.calculator.supportClasses.ICalculator);

	UniqCount.prototype.addFactor = function(value) {
		if (!this._mapping[value]) {
			this._mapping[value] = true;
			this._count++;
		}
	};
	UniqCount.prototype.calculate = function() {
		return this._count;
	};
})();
(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.filter.IFilter");

    var IFilter = grace.filter.IFilter = function() {
    };
    IFilter.prototype.filter = function(value) {
        return false;
    };
})();
(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.filter.TextFilter");

	var TextFilter = grace.filter.TextFilter = function(optionValues, nullable) {
		var options = this._options = {};
		_.each(optionValues, function(value) {
			options[value.caption()] = true;
		});

		this.nullable = nullable;
	};
	andrea.blink.extend(TextFilter, grace.filter.IFilter);

	/**
	 *
	 * @param {Object} value
	 * @return The result of filter
	 * 	true: use normally
	 * 	false: will be skip
	 */
	TextFilter.prototype.filter = function(value) {
		return this._options[value.caption()];
	};

	TextFilter.prototype.addOption = function(value) {
		this._options[value.caption()] = true;
	};
	TextFilter.prototype.removeOption = function(value) {
		this._options[value.caption()] = false;
	};
})();
(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.filter.RangeFilter");

	var RangeFilter = grace.filter.RangeFilter = function(optionValues, nullable, parseQuantified) {
		this._from = Number.MAX_VALUE;
		this._to = -Number.MAX_VALUE;

		_.each(optionValues, $.proxy(function(value) {
			var quantified = value.quantified();
			this._from = Math.min(this._from, quantified);
			this._to = Math.max(this._to, quantified);
		}, this));

		this._min = this._from;
		this._max = this._to;

		this.nullable = nullable;
		this._parseQuantified = parseQuantified;
	};
	andrea.blink.extend(RangeFilter, grace.filter.IFilter);

	/**
	 *
	 * @param {Object} value
	 * @return The result of filter
	 * 	true: use normally
	 * 	false: will be skip
	 */
	RangeFilter.prototype.filter = function(value) {
		var quantified = value.quantified();
		return this._max >= quantified && this._min <= quantified;
	};

	RangeFilter.prototype.from = function(value) {
		return this._from;
	};
	RangeFilter.prototype.to = function(value) {
		return this._to;
	};
	RangeFilter.prototype.min = function(value) {
		if (arguments.length > 0) {
			this._min = value;
			return this;
		} else {
			return this._min;
		}
	};
	RangeFilter.prototype.max = function(value) {
		if (arguments.length > 0) {
			this._max = value;
			return this;
		} else {
			return this._max;
		}
	};
	RangeFilter.prototype.parseQuantified = function(quantified) {
		return this._parseQuantified.call(null, quantified);
	}
})();
(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.managers.PopUpManager');

    var PopUpManager = grace.managers.PopUpManager;

    PopUpManager.createPopUp = function(popUp, modal) {
        var $body = $('body');
        var $document = $(document);
        var $layer = $('<div/>').addClass('grace-popup-layer').appendTo($body);
        if (modal) {
            $layer.width($document.width());
            $layer.height($document.height());
        }
        var $popUp = $(popUp.dom());
        $popUp.appendTo($layer);
        return popUp;
    }
    PopUpManager.removePopUp = function(popUp) {
        var $popUp = $(popUp.dom());
        $popUp.parent().detach();
    }
    PopUpManager.centerPopUp = function(popUp) {
        var $popUp = $(popUp.dom());
        var $body = $('body');
        var $root = $body.children().eq(0)
        $popUp.css({
            'left' : ($root.width() - $popUp.width()) / 2 + 'px',
            'top' : ($root.height() - $popUp.height()) / 2 - 36 + 'px'
        });
    }
})(jQuery);
(function() {

	var grace = andrea.grace;

	andrea.blink.declare('andrea.grace.models.vo.Analysis');

	var ShelfType = grace.constants.ShelfType;
	var DataConvertUtil = grace.utils.DataConvertUtil;
	var ValueType = grace.constants.ValueType;

	var Analysis = grace.models.vo.Analysis = function(id) {
		this.id = id ? id : _.uniqueId('analysisID_');
		this.index = null;
		this.name = null;

		this._valueType = null;
		this.quantifiable = false;

		this.analysisType = null;
		// For dimension
		this.numUniqueValue/*Number*/ = null;
		// For dimension, DATE
		this.dateSpan/*Number*/ = null;
	};
	Analysis.prototype.valueType = function(value) {
		if (arguments.length > 0) {
			this._valueType = value;
			this.quantifiable = this._valueType === ValueType.NUMBER || this._valueType === ValueType.DATE;
			return this;
		} else {
			return this._valueType;
		}
	}
})();
(function() {
    var grace = andrea.grace;

    var ValueType = grace.constants.ValueType;
    var AnalysisType = grace.constants.AnalysisType;
    var OperationClassification = grace.operation.OperationClassification;

    andrea.blink.declare("andrea.grace.models.vo.ShelvedAnalysis");
    var ShelvedAnalysis = grace.models.vo.ShelvedAnalysis = function(id, source) {
        this.id = id;
        this.source/*Analysis*/ = source;

        // For des shelves
        this.operationGroup = null;
        this.visualized = false;
        this.numPartialVisualized = 0;
        // For proc shelves
        this.filter = null;
    };
    ShelvedAnalysis.prototype.isDateSeries = function() {
        return this.source.valueType() === ValueType.DATE && this.operationGroup.hasClassification(OperationClassification.DRILL)
    };

    ShelvedAnalysis.prototype.multiply = function(sa) {
        // TODO Build a full multiply logic for extensibility
        var result = {};

        if (sa && sa.source && sa.source.numUniqueValue) {
            result.numUniqueValue = this.source.numUniqueValue * sa.source.numUniqueValue;
        } else {
            result.numUniqueValue = this.source.numUniqueValue
        }
        return result;
    };
})();
(function($) {
    var grace = andrea.grace;

    var NullValue = grace.models.value.NullValue;

    /**
     *
     */
    andrea.blink.declare("andrea.grace.models.DataProvider");
    var DataProvider = grace.models.DataProvider = function(values2d) {
        this._values2d/*Array.<Array.<*>>*/ = values2d;
        this.numRows = 0;
        this.numColumns = 0;

        this._columnBased = null;
        this._build();
    };
    andrea.blink.extend(DataProvider, andrea.blink.mvc.Model);

    DataProvider.prototype._build = function() {
        var i, j;
        var values;

        var cbUVMapping = [];

        this._columnBased = {
            'values2d' : [],
            'uniqueValues2d' : [],
            'notNullValue2d' : [],
            'notNullUniqueValues2d' : [],
            'hasNull2d' : []
        }
        this.numRows = this._values2d.length;
        this.numColumns = this.numRows > 0 ? this._values2d[0].length : 0;

        for ( j = 0; j < this.numColumns; j++) {
            this._columnBased.values2d[j] = [];
            this._columnBased.uniqueValues2d[j] = [];
            this._columnBased.notNullValue2d[j] = [];
            this._columnBased.notNullUniqueValues2d[j] = [];
            this._columnBased.hasNull2d[j] = false;
            cbUVMapping[j] = [];
        }
        for ( i = 0; i < this.numRows; i++) {
            values = this.getRValues(i);
            for ( j = 0; j < this.numColumns; j++) {
                var v = values[j];
                var vs = v.toString();

                // Has null
                this._columnBased.hasNull2d[j] = this._columnBased.hasNull2d[j] || !v.notNull();
                // Values 2d
                this._columnBased.values2d[j].push(v);
                if (v.notNull()) {
                    this._columnBased.notNullValue2d[j].push(v);
                }
                if (!cbUVMapping[j][vs]) {
                    cbUVMapping[j][vs] = true;
                    if (v.notNull()) {
                        this._columnBased.uniqueValues2d[j].push(v);
                        this._columnBased.notNullUniqueValues2d[j].push(v);
                    }
                }
            }
        }
        for ( j = 0; j < this.numColumns; j++) {
            if (this._columnBased.hasNull2d[j]) {
                this._columnBased.uniqueValues2d[j].push(NullValue.instance());
            }
        }
    };
    DataProvider.prototype.getRValues = function(index) {
        return this._values2d[index];
    };
    DataProvider.prototype.getCValues = function(index, unique, notNull) {
        if (unique && notNull) {
            return this._columnBased.notNullUniqueValues2d[index];
        } else if (!unique && notNull) {
            return this._columnBased.notNullValue2d[index];
        } else if (unique && !notNull) {
            return this._columnBased.uniqueValues2d[index];
        } else if (!unique && !notNull) {
            return this._columnBased.values2d[index];
        }
    };
    DataProvider.prototype.isCHasNull = function(index) {
        return this._columnBased.hasNull2d[index];
    };
})(jQuery);
(function($) {

	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.models.DataDiscoveryModel");

	var ShelfType = grace.constants.ShelfType;
	var AppConst = andrea.grace.constants.AppConst;
	var VizType = grace.constants.VizType;
	/**
	 * App Model host all widgets (including chart, cross table and other widget).
	 */
	var DataDiscoveryModel = grace.models.DataDiscoveryModel = function() {
		DataDiscoveryModel.superclass.constructor.apply(this, arguments);
		DataDiscoveryModel._instance = this;

		this.raw/*Object*/ = null;
		this.analyses/*Array.<Analysis>*/ = null;
		this.dataProvider = null;

		this._analysisFilters/*Array.<ShelvedAnalysis>*/ = [];
		this._analysisDimesions/*Array.<ShelvedAnalysis>*/ = [];
		this._analysisDatas/*Array.<ShelvedAnalysis>*/ = [];

		this._vizType = VizType.RECOMMEND;
	};
	andrea.blink.extend(DataDiscoveryModel, andrea.blink.mvc.Model);

	// TODO Remove this method after refator view mediator, static method for view get model currently
	DataDiscoveryModel._instance = null;
	DataDiscoveryModel.instance = function() {
		return DataDiscoveryModel._instance;
	}
	/**
	 * A short cut way for view-view communication
	 * TODO Refactor it
	 */
	DataDiscoveryModel.prototype.viewNotify = function(name, data) {
		this._notify(name, data);
	}
	/**
	 *
	 */
	DataDiscoveryModel.prototype.setDataProvider = function(raw, analyses, dataProvider) {
		this.raw = raw;
		this.analyses = analyses;
		this.dataProvider = dataProvider;

		this._vizType = VizType.RECOMMEND;

		this._analysisFilters = [];
		this._analysisDimesions = [];
		this._analysisDatas = [];

		this._notify(AppConst.NOTIFICATION_DATA_PROVIDER_CHANGED);
	}	/**
	 *
	 */
	DataDiscoveryModel.prototype.vizType = function(value) {
		if (arguments.length > 0) {
			if (this._vizType !== value) {
				this._vizType = value;
				this._deferNotify(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED);
			}
		} else {
			return this._vizType;
		}
	}
	DataDiscoveryModel.prototype.analysisFilters = function(value) {
		if (arguments.length > 0) {
			this._analysisFilters = value;
			this._deferNotify(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED);
		} else {
			return this._analysisFilters;
		}
	}
	DataDiscoveryModel.prototype.analysisDimesions = function(value) {
		if (arguments.length > 0) {
			this._analysisDimesions = value;
			this._deferNotify(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED);
		} else {
			return this._analysisDimesions;
		}
	}
	DataDiscoveryModel.prototype.analysisDatas = function(value) {
		if (arguments.length > 0) {
			this._analysisDatas = value;
			this._deferNotify(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED);
		} else {
			return this._analysisDatas;
		}
	}
	DataDiscoveryModel.prototype.invalidateShelvedAnalysis = function() {
		this._deferNotify(AppConst.NOTIFICATION_VIZ_CONTEXT_APPLIED);
	}
	/**
	 *
	 */	DataDiscoveryModel.prototype.getAnalyses = function(ids) {
		var as = [];
		for (var i = 0; i < ids.length; i++) {
			as.push(this.getAnalysis(ids[i]));
		}
		return as;
	}
	DataDiscoveryModel.prototype.getAnalysis = function(id) {
		return this._get(id, this.analyses);
	}
	DataDiscoveryModel.prototype.getShelvedAnalysis = function(id) {
		var sa = this._get(id, this._analysisFilters);
		if (!sa) {
			sa = this._get(id, this._analysisDimesions);
		}
		if (!sa) {
			sa = this._get(id, this._analysisDatas);
		}
		return sa;
	}
	DataDiscoveryModel.prototype._get = function(id, items) {
		for (var i = 0; i < items.length; i++) {
			if (items[i].id === id) {
				return items[i];
			}
		}
		return null;
	}
})(jQuery);
(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.actions.ChangeDataProviderAction");

    var ConverterType = grace.utils.ConverterType;
    var ValueType = grace.constants.ValueType;
    var NullValue = grace.models.value.NullValue;
    var AnalysisType = andrea.grace.constants.AnalysisType;
    var AppConst = andrea.grace.constants.AppConst;
    var Analysis = grace.models.vo.Analysis;
    var DataProvider = grace.models.DataProvider;
    var DataConvertUtil = grace.utils.DataConvertUtil;
    var Stopwatch = grace.utils.Stopwatch;
    var Log = grace.managers.Log;

    var ChangeDataProviderAction = grace.actions.ChangeDataProviderAction = function() {
        ChangeDataProviderAction.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(ChangeDataProviderAction, andrea.blink.mvc.Action);

    ChangeDataProviderAction.prototype.execute = function(parameters) {
        ChangeDataProviderAction.superclass.execute.apply(this, arguments);

        var raw = {
            'columnDescriptors' : parameters.columnDescriptors,
            'rows' : parameters.rows,
            'source' : parameters.source
        };

        var i, j;
        var fromExcel = raw.source === 'excel';
        var columnDescriptors = raw.columnDescriptors;
        var rows = raw.rows;
        var numRows = rows.length;
        var numColumns = columnDescriptors.length;

        Log.interaction('parseColumnRows', [numColumns, numRows].join(','));
        if (numRows === 0) {
            return;
        }

        var watch = new Stopwatch([numColumns, numRows].join(','), true);
        // Parse columnDescriptors
        var analyses = [];
        for ( j = 0; j < numColumns; j++) {
            var c = columnDescriptors[j];
            var a/*Analysis*/ = new Analysis(c.id);
            a.index = j;
            a.name = c.name;
            a.analysisType = c.analysisType;
            analyses[j] = a;
        }
        // Parse rows
        var values2d = [];
        var values = null;
        var value = null;
        var valueTypeCandidates = [];
        /**
         * For static {
         *  fn
         * }
         *
         * For dynamic {
         *  numByType
         *  numTotal
         * }
         */
        var converter;
        for ( i = numRows - 1; i >= 0; i--) {
            values2d[i] = [];
            var row = rows[i];
            for ( j = numColumns - 1; j >= 0; j--) {
                var cell/*String*/ = row[j];

                converter = valueTypeCandidates[j];
                if (!converter) {
                    valueTypeCandidates[j] = converter = {
                        'numByType' : {
                        }
                    };
                    converter.numByType[ConverterType.ANY] = 0;
                }

                // Convert raw to value
                var type = columnDescriptors[j].converterType;
                if (type) {
                    // Explicit data type, eg: data from server
                    if (cell != null) {
                        if (!converter.fn) {
                            converter.fn = DataConvertUtil.getConverter(type);
                        }
                        value = converter.fn.call(null, cell);
                    } else {
                        value = NullValue.instance();
                        type = ConverterType.ANY;
                    }
                } else {
                    // Non-explicit data type, eg: data from csv, excel
                    var tryExcelDate = fromExcel;
                    if (converter.numByType && converter.numByType[ConverterType.NUMBER] && converter.numByType[ConverterType.NUMBER] > 3) {
                        tryExcelDate = false;
                    }
                    var match = DataConvertUtil.match(cell, tryExcelDate);
                    type = match.type;
                    value = match.value;
                }
                if (!converter.numByType[type]) {
                    converter.numByType[type] = 0;
                }
                converter.numByType[type]++;

                values2d[i][j] = value;
            }
        }
        Log.performance('parseDataProvider', [watch.type, 'parse', watch.lap()].join(','));

        // Rinse
        for ( j = 0; j < numColumns; j++) {
            a = analyses[j];
            if (!a.name) {
                a.name = "列" + (j + 1);
            }
            // Set valueType
            if (!a.valueType()) {
                var allMatching = false;
                var allValidMatching = false;
                var majorConvertType = null;
                converter = valueTypeCandidates[j];
                if (converter.numByType) {
                    for (type in converter.numByType) {
                        var numOfType = converter.numByType[type];
                        var numOfAny = converter.numByType[ConverterType.ANY];

                        if (numOfType / numRows === 1) {
                            allMatching = true;
                        }
                        if (type === ConverterType.ANY) {
                            continue;
                        }
                        // Set data type when numOfType is greater than 50%
                        if (numOfType / (numRows - numOfAny) > .5) {
                            if (type === ConverterType.EXCEL_DATE || type === ConverterType.DATE) {
                                a.valueType(ValueType.DATE);
                            } else if (type === ConverterType.NUMBER) {
                                a.valueType(ValueType.NUMBER);
                            } else if (type === ConverterType.STRING) {
                                a.valueType(ValueType.STRING);
                            }
                            // Check valid matching
                            if (!allMatching) {
                                majorConvertType = type;
                                if ((numOfType + numOfAny) / numRows === 1) {
                                    allValidMatching = true;
                                }
                            }
                            break;
                        }
                    }
                }
                if (!a.valueType()) {
                    a.valueType(ValueType.STRING);
                }
                if (!allMatching && majorConvertType) {
                    var fn = DataConvertUtil.getConverter(majorConvertType);
                    for ( i = numRows - 1; i >= 0; i--) {
                        cell = rows[i][j];
                        if (!cell || !allValidMatching) {
                            values2d[i][j] = fn.call(null, cell);
                        }
                    }
                } else {
                }
            }
            // Set valueType
            // Set analysisType
            if (!a.analysisType) {
                if (a.valueType() === ValueType.NUMBER) {
                    a.analysisType = AnalysisType.MEASURE;
                } else {
                    a.analysisType = AnalysisType.DIMENSION;
                }
            }
        }
        Log.performance('parseDataProvider', [watch.type, 'rinse', watch.lap()].join(','));

        // Set data provider and additional info in analysis
        var dp = new DataProvider(values2d);
        var parsedDimensions = [];
        var parsedMeasures = [];
        for ( j = 0; j < numColumns; j++) {
            a = analyses[j];

            // TODO Remove this property
            a.numUniqueValue = dp.getCValues(j, true, false).length;
            if (a.valueType() === ValueType.DATE) {
                var dates = _.sortBy(dp.getCValues(j, true, true), function(dv) {
                    return dv.quantified();
                });
                var from = dates[0];
                var to = dates[dates.length - 1];
                a.dateSpan = to.quantified() - from.quantified();
            }
            if (a.analysisType === AnalysisType.MEASURE) {
                parsedMeasures.push(a.name);
            } else if (a.analysisType === AnalysisType.DIMENSION) {
                parsedDimensions.push(a.name);
            }
        }

        var model = this._getModel(AppConst.MODEL_GRACE);
        model.setDataProvider(raw, analyses, dp);
        Log.performance('parseDataProvider', [watch.type, 'setDataProvider', watch.lap(true), watch.total()].join(','));

        Log.interaction('parsedDimensions', [parsedDimensions].join(','));
        Log.interaction('parsedMeasures', [parsedMeasures].join(','));
    };

})();
(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.actions.RunAnalysisAction");

    var AppConst = andrea.grace.constants.AppConst;
    var ShelfType = grace.constants.ShelfType;
    var ShelvedAnalysis = grace.models.vo.ShelvedAnalysis;

    var RunAnalysisAction = grace.actions.RunAnalysisAction = function() {
        RunAnalysisAction.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(RunAnalysisAction, andrea.blink.mvc.Action);

    /**
     * Create and update ShelvedAnalysis
     */
    RunAnalysisAction.prototype.execute = function(parameters) {
        RunAnalysisAction.superclass.execute.apply(this, arguments);

        var i;
        var ACT = ShelfType;
        var model = this._getModel(AppConst.MODEL_GRACE);

        if (parameters.shelfType) {
            // Analysis shelf change
            var shelfType = parameters.shelfType;
            var shelvedContexts = parameters.shelvedContexts;
            if (!shelvedContexts) {
                return;
            }
            // Des operation
            var shelvedAnalyses = [];
            _.each(shelvedContexts, function(ctx) {
                var sa/*ShelvedAnalysis*/ = model.getShelvedAnalysis(ctx.shelvedAnalysisID);
                if (!sa) {
                    sa = new ShelvedAnalysis(ctx.shelvedAnalysisID, model.getAnalysis(ctx.analysisID));
                }
                sa.operationGroup = ctx.operationGroup;
                sa.filter = ctx.filter;
                shelvedAnalyses.push(sa);
            });

            if (shelfType === ACT.DES_DIM) {
                if (!_.isEqual(shelvedAnalyses, model.analysisDimesions())) {
                    model.analysisDimesions(shelvedAnalyses);
                }
            } else if (shelfType === ACT.DES_VALUE) {
                if (!_.isEqual(shelvedAnalyses, model.analysisDatas())) {
                    model.analysisDatas(shelvedAnalyses);
                }
            } else if (shelfType === ACT.PROC_FILTER) {
                model.analysisFilters(shelvedAnalyses);
            }
        } else if (parameters.vizType) {
            // Viz navigator change
            model.vizType(parameters.vizType);
        }
    };

})();
(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.views.analysisContainer.events.ShelfEvent");

    var ShelfEvent = grace.views.analysisContainer.events.ShelfEvent = function(type, target, data) {
        ShelfEvent.superclass.constructor.apply(this, arguments);

    };
    andrea.blink.extend(ShelfEvent, andrea.blink.events.Event);

    ShelfEvent.CARD_COPIED = "cardCopied";
    ShelfEvent.CARD_SHELVED = "cardShelved";

    ShelfEvent.HELPER_DROPPED = "helperDropped";
})();
(function() {
    var grace = andrea.grace;
    var PageTransition = grace.helpers.PageTransition;

    andrea.blink.declare("andrea.grace.views.components.MoreButton");
    var MoreButton = grace.views.components.MoreButton = function(dom) {
        MoreButton.superclass.constructor.apply(this, arguments);

        var children = this._$dom.children();
        this._$p1 = $(children[0]);
        this._$p2 = $(children[1]);
        _.defer($.proxy(function() {
            this._onTop(this._$p1)
        }, this));

        this._$dom.addClass('grace-morebutton');
        this._$p1.addClass('grace-morebutton-page');
        this._$p2.addClass('grace-morebutton-page');

        this._$dom.hover($.proxy(this.showP2, this), $.proxy(this.showP1, this));
    };
    andrea.blink.extend(MoreButton, andrea.blink.mvc.View);

    MoreButton.prototype._onTop = function($child) {
        this._$p1.removeClass('pt-page-onTop');
        this._$p2.removeClass('pt-page-onTop');
        $child.addClass('pt-page-onTop');

        this._$p1.css('width', this._$dom.width());
        this._$p1.css('height', this._$dom.height());
        this._$p2.css('width', this._$dom.width());
        this._$p2.css('height', this._$dom.height());
    };
    MoreButton.prototype.showP1 = function() {
        var pt = new PageTransition({
            '$page' : this._$p2,
            'classes' : ['pt-page-moveToBottom']
        }, {
            '$page' : this._$p1,
            'classes' : ['pt-page-moveFromTop']
        }, function() {
        });
        this._onTop(pt.$inPage());
        pt.play();
    };
    MoreButton.prototype.showP2 = function() {
        var pt = new PageTransition({
            '$page' : this._$p1,
            'classes' : ['pt-page-moveToTop']
        }, {
            '$page' : this._$p2,
            'classes' : ['pt-page-moveFromBottom']
        }, function() {
        });
        this._onTop(pt.$inPage());
        pt.play();
    };
})();
(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.views.popUp.PopUpEvent");

	var PopUpEvent = grace.views.popUp.PopUpEvent = function(type, target, data) {
		PopUpEvent.superclass.constructor.apply(this, arguments);

	};
	andrea.blink.extend(PopUpEvent, andrea.blink.events.Event);

	PopUpEvent.POPUP_OPENED = "popupOpened";
	PopUpEvent.POPUP_CLOSED = "popupClosed";
})();
(function($) {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.popUp.PopUpBase");

    var PopUpManager = grace.managers.PopUpManager;
    var PopUpEvent = grace.views.popUp.PopUpEvent;

    var PopUpBase = grace.views.popUp.PopUpBase = function(dom) {
        PopUpBase.superclass.constructor.apply(this, arguments);

        this.$dom().bind("selectstart", function() {
            return false;
        });

        this._classVisible = null;
        this._$dock = null;
    };
    andrea.blink.extend(PopUpBase, andrea.blink.mvc.View);

    PopUpBase.prototype.$dock = function() {
        return this._$dock;
    };
    PopUpBase.prototype.open = function($dock, modal) {
        this._$dock = $dock;

        var _this = this;
        var $dom = $(this._dom);
        // Initialize
        $dom.css({
            "position" : "absolute",
            "left" : $dock.offset().left,
            "top" : $dock.offset().top + $dock.outerHeight()
        });
        // Animation
        if (this._classVisible) {
            _.defer(function() {
                $dom.addClass(_this._classVisible);
            });
        }
        // Pop up
        PopUpManager.createPopUp(this, modal);

        this.dispatchEvent(new PopUpEvent(PopUpEvent.POPUP_OPENED, this));
    }
    PopUpBase.prototype.close = function(delay) {
        var _this = this;
        var $dom = $(this._dom);
        if (delay == null) {
            delay = 1
        }
        if (this._classVisible) {
            $dom.removeClass(this._classVisible);
            delay = 2000;
        }
        if (delay > 0) {
            setTimeout(function() {
                PopUpManager.removePopUp(_this);
            }, delay);
        } else {
            PopUpManager.removePopUp(_this);
        }

        this.dispatchEvent(new PopUpEvent(PopUpEvent.POPUP_CLOSED, this));
    };
    PopUpBase.prototype.closeImmediately = function() {
        this.close(0);
    }
})(jQuery);
(function($) {
	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.views.popUp.HoverPopUpBase");

	var HoverPopUpBase = grace.views.popUp.HoverPopUpBase = function(dom) {
		HoverPopUpBase.superclass.constructor.apply(this, arguments);
		this._hover = null;
		this._click = null;
		this._mousedown = null;
		this._mouseup = null;
	};
	andrea.blink.extend(HoverPopUpBase, grace.views.popUp.PopUpBase);

	HoverPopUpBase.prototype.open = function($dock) {
		HoverPopUpBase.superclass.open.apply(this, arguments);
		this._closeByHover(true);
	};
	HoverPopUpBase.prototype.close = function() {
		HoverPopUpBase.superclass.close.apply(this, arguments);
		this._closeByHover(false);
	};
	HoverPopUpBase.prototype._closeByClick = function(activate) {
		if (activate) {
			var _this = this;

			var click = this._click = $.proxy(function(event) {
				if (this._$dom[0] != event.target && !$.contains(this._$dom[0], event.target)) {
					if (this._$dock[0] != event.target && !$.contains(this._$dock[0], event.target)) {
						this.close();
					}
				}
			}, this);
			$('body').on('click', click);
		} else {
			$('body').off('click', this._click);
		}
	};

	HoverPopUpBase.prototype._closeByHover = function(activate) {
		if (activate) {
			var _this = this;
			// Event lisenter
			var inside = true;
			var operating = false;
			var closeOutside = function() {
				if (operating) {
					return;
				}
				// Delay serveral ms to wait moving to submenu
				setTimeout(function() {
					if (!inside) {
						_this.close();
					}
				}, 120)
			}
			var hover = this._hover = function(event) {
				// console.log(event.type, event.currentTarget)
				if (event.type === 'mouseenter') {
					inside = true;
				} else if (event.type === 'mouseleave') {
					inside = false;
					closeOutside();
				}
			};
			var mousedown = this._mousedown = function() {
				operating = true;
			}
			var mouseup = this._mouseup = function() {
				operating = false;
				if (!inside) {
					closeOutside();
				}
			}
			this._$dock.on('hover', hover);
			this._$dom.on('hover', hover);
			this._$dom.on('mousedown', mousedown);
			$('body').on('mouseup', mouseup);
		} else {
			this._$dock.off('hover', this._hover);
			this._$dom.off('hover', this._hover);
			this._$dom.off('mousedown', this._mousedown);
			$('body').off('mouseup', this._mouseup);

		}
	};
})(jQuery);
(function($) {
	var grace = andrea.grace;

	var PopUpManager = grace.managers.PopUpManager;

	andrea.blink.declare('andrea.grace.views.popUp.Loading');
	var Loading = grace.views.popUp.Loading = function(dom, label) {
		Loading.superclass.constructor.apply(this, arguments);

		this._classVisible = 'grace-loading-visible';
		this._$spin = null;
		this._spinner = null;

		this._label = label;
		this._percent = 0;
		this._$label = null;

		this._createChildren()
	};
	andrea.blink.extend(Loading, grace.views.popUp.PopUpBase);

	Loading.prototype.open = function($dock, model) {
		Loading.superclass.open.apply(this, arguments);

		if (this._label == null) {
			this._$dom.width(90);
			this._$dom.height(90);
		} else {
			this._$dom.width(90);
			this._$dom.height(105);
			this._$label = $('<div/>').addClass('grace-loading-label').appendTo(this._$dom);
			this._validateLabel();
		}
		this._$spin.width(this._$dom.width());
		this._$spin.height(90);
		this._spinner = new Spinner({
			'color' : '#ffffff'
		});
		this._spinner.spin(this._$spin[0]);

		PopUpManager.centerPopUp(this, $dock);
	};
	Loading.prototype.percent = function(value) {
		this._percent = value;
		this._validateLabel();
	};
	Loading.prototype._validateLabel = function() {
		var caption = Math.min(99, Math.round(this._percent * 100)) + '%';
		if (this._label) {
			caption = this._label + ': ' + caption;
		}
		this._$label.text(caption);
	};
	Loading.prototype._createChildren = function() {
		this._$dom.addClass('grace-loading');

		this._$spin = $('<div/>').addClass('grace-loading-spin').appendTo(this._$dom);
	};
})(jQuery);
(function($) {
    var grace = andrea.grace;
    var NullValue = grace.models.value.NullValue;

    andrea.blink.declare('andrea.grace.views.popUp.filter.dataProvider.TextValuesProxy');
    var TextValuesProxy = grace.views.popUp.filter.dataProvider.TextValuesProxy = function(filter, values, hasNull) {
        this.filter = filter
        // For checkbox list
        this._dp = _.sortBy(values, function(v) {
            return v.caption();
        });
        // For null checkbox
        this._hasNull = hasNull;
    };
    TextValuesProxy.prototype.checked = function(v, checked) {
        if (arguments.length > 1) {
            if (checked) {
                this.filter.addOption(v);
            } else {
                this.filter.removeOption(v);
            }
        } else {
            return this.filter.filter(v);
        }
    }
    TextValuesProxy.prototype.length = function() {
        return this._dp.length;
    };
    TextValuesProxy.prototype.getItemAt = function(i) {
        return this._dp[i];
    };
    TextValuesProxy.prototype.getCaption = function(item) {
        return item.caption();
    };
    TextValuesProxy.prototype.getNullItem = function() {
        if (this._hasNull) {
            NullValue.instance();
        } else {
            return null;
        }
    };
})(jQuery);
(function($) {
	var grace = andrea.grace;
	var NullValue = grace.models.value.NullValue;

	andrea.blink.declare('andrea.grace.views.popUp.filter.dataProvider.RangeValuesProxy');
	var RangeValuesProxy = grace.views.popUp.filter.dataProvider.RangeValuesProxy = function(filter, hasNull) {
		this.filter = filter
		// For null checkbox
		this._hasNull = hasNull;
	};
	RangeValuesProxy.prototype.from = function(value) {
		return this.filter.from.apply(this.filter, arguments);
	};
	RangeValuesProxy.prototype.to = function(value) {
		return this.filter.to.apply(this.filter, arguments);
	};
	RangeValuesProxy.prototype.min = function(value) {
		return this.filter.min.apply(this.filter, arguments);
	};
	RangeValuesProxy.prototype.max = function(value) {
		return this.filter.max.apply(this.filter, arguments);
	};
	RangeValuesProxy.prototype.getNullItem = function() {
		if (this._hasNull) {
			NullValue.instance();
		} else {
			return null;
		}
	};
	RangeValuesProxy.prototype.getMinCaption = function(value) {
		return this.filter.parseQuantified(this.min()).caption();
	};
	RangeValuesProxy.prototype.getMaxCaption = function(value) {
		return this.filter.parseQuantified(this.max()).caption();
	};
})(jQuery);
(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.views.popUp.filter.FilterEvent");

	var FilterEvent = grace.views.popUp.filter.FilterEvent = function(type, target, data) {
		FilterEvent.superclass.constructor.apply(this, arguments);

	};
	andrea.blink.extend(FilterEvent, andrea.blink.events.Event);

	FilterEvent.ITEM_SELECTED = "itemSelected";
})();
(function($) {
    var grace = andrea.grace;

    var FilterEvent = grace.views.popUp.filter.FilterEvent;

    andrea.blink.declare('andrea.grace.views.popUp.filter.PopUpTextFilter');
    var PopUpTextFilter = grace.views.popUp.filter.PopUpTextFilter = function(dom, dataProvider) {
        PopUpTextFilter.superclass.constructor.apply(this, arguments);
        this._$dom.addClass('grace-text-filter');
        this._classVisible = 'grace-text-filter-visible';
        this._dataProvider = dataProvider;
    };
    andrea.blink.extend(PopUpTextFilter, grace.views.popUp.HoverPopUpBase);

    PopUpTextFilter.create = function(dataProvider) {
        var filter = new PopUpTextFilter($('<div/>')[0], dataProvider);        filter._createChildren();
        return filter;    }

    PopUpTextFilter.prototype._createChildren = function() {
        var _this = this;
        var dp = this._dataProvider;

        var $ulAll = $('<ul/>').appendTo(this._$dom);

        var i;
        var value;

        var genLI = function(checked, text) {
            var $li = $('<li/>');
            var id = _.uniqueId('checkbox_');
            var $input = $('<input type="checkbox"/>').appendTo($li).attr({
                'id' : id,
                'checked' : checked
            });
            var $label = $('<label/>').appendTo($li).attr({
                'for' : id
            }).addClass('grace-text-ellipsis');
            $('<span/>').appendTo($label).attr({
                'usage' : 'icon'
            });
            $('<span/>').appendTo($label).text(text);

            $li.on('change', function(event) {
                var value;
                $li = $(this);
                var $itemLIs = $('li[__all="false"]', $ulAll);

                var checked = isChecked($li);
                var all = $li.attr('__all') === 'true';

                if (all) {
                    // Select all
                    for ( i = 0; i < $itemLIs.length; i++) {
                        $li = $itemLIs.eq(i);
                        value = $li.data('__item');
                        // Update model
                        _this._dataProvider.checked(value, checked);
                        // Update ui
                        $('input', $li).attr('checked', checked);
                    }
                } else {
                    value = $li.data('__item');
                    if (value.notNull()) {
                        // Update model
                        _this._dataProvider.checked(value, checked);
                        // Update ui
                        updateAllCheck();
                    }
                }
                _this.dispatchEvent(new FilterEvent(FilterEvent.ITEM_SELECTED, _this));
            });
            return $li;
        }
        var isChecked = function($li) {
            return $('input', $li).attr('checked') === 'checked';
        }
        var updateAllCheck = function() {
            var $itemLIs = $('li[__all="false"]', $ulAll);
            var allChecked = true;
            for ( i = 0; i < $itemLIs.length; i++) {
                var $li = $itemLIs.eq(i);
                allChecked = allChecked && isChecked($li);
            }
            $('input', $('li[__all="true"]', $ulAll)).attr('checked', allChecked);
        }
        var $li;
        // Select all
        $li = genLI(true, '全选');
        $li.attr('__all', true).appendTo($ulAll);
        $('<div/>').appendTo($ulAll);
        // List
        var $ulList = $('<ul/>').appendTo($('<li/>').appendTo($ulAll).addClass('grace-text-filter-li-ascontainer')).addClass('fancy-scrollbar');
        for ( i = 0; i < dp.length(); i++) {
            value = dp.getItemAt(i);
            $li = genLI(dp.checked(value), dp.getCaption(value));
            $li.attr('__all', false).data('__item', value);
            $li.appendTo($ulList);
        }
        // Null
        var valueNull = dp.getNullItem();
        if (valueNull) {
            $li = genLI(dp.checked(valueNull), dp.getCaption(valueNull));
            $li.attr('__all', false).appendTo($ulAll);
            $('<div/>').appendTo($ulAll);
        }
        // Update ui
        _.defer(function() {
            $ulAll.removeClass('grace-text-filter-animation');
            $ulAll.width($ulList.width())
            _.defer(function() {
                $ulAll.addClass('grace-text-filter-animation');
            })
        })
        updateAllCheck();
    }
})(jQuery);
(function($) {
    var grace = andrea.grace;

    var FilterEvent = grace.views.popUp.filter.FilterEvent;

    andrea.blink.declare('andrea.grace.views.popUp.filter.PopUpRangeFilter');
    var PopUpRangeFilter = grace.views.popUp.filter.PopUpRangeFilter = function(dom, dataProvider) {
        PopUpRangeFilter.superclass.constructor.apply(this, arguments);

        this._$dom.addClass('grace-range-filter');
        this._classVisible = 'grace-range-filter-visible';
        this._dataProvider = dataProvider;

        this._itemSelectRequested = false;
    };
    andrea.blink.extend(PopUpRangeFilter, grace.views.popUp.HoverPopUpBase);

    PopUpRangeFilter.create = function(dataProvider) {
        var filter = new PopUpRangeFilter($('<div/>')[0], dataProvider);
        filter._createChildren();
        return filter;
    };
    PopUpRangeFilter.prototype.close = function(delay) {
        if (this._itemSelectRequested) {
            this.dispatchEvent(new FilterEvent(FilterEvent.ITEM_SELECTED, this));
        }
        PopUpRangeFilter.superclass.close.apply(this, arguments);
    };
    PopUpRangeFilter.prototype._createChildren = function() {
        var _this = this;
        var dp = this._dataProvider;
        // Labe
        var $label = $('<div/>').addClass('grace-range-filter-label');
        $label.appendTo(this._$dom);
        // Silder
        var $slider = $('<div/>').addClass('grace-range-filter-slider');
        var $sliderUI = $('<div/>').slider({
            range : true,
            min : dp.from(),
            max : dp.to(),
            values : [dp.min(), dp.max()],
            slide : function(event, ui) {
                dp.min(ui.values[0]);
                dp.max(ui.values[1]);
                validateLabel(true);
                itemSelected();
            }
        }).appendTo($slider);
        $slider.appendTo(this._$dom);
        // Update label
        _this._itemSelectRequested = false;
        var itemSelected = function() {
            if (!_this._itemSelectRequested) {
                _this._itemSelectRequested = true;
                _.delay(function() {
                    _this._itemSelectRequested = false;
                    _this.dispatchEvent(new FilterEvent(FilterEvent.ITEM_SELECTED, _this));
                }, 300);
            }
        }
        var validateLabel = function() {
            $label.text([dp.getMinCaption(), dp.getMaxCaption()].join(' - '));
        }
        validateLabel(false);
        // Update model
    }
})(jQuery);
(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.views.popUp.menu.dataProvider.OperationGroupProxy');
    var OperationGroupProxy = grace.views.popUp.menu.dataProvider.OperationGroupProxy = function(ogs) {
        this._operationGroups = ogs;
    };
    OperationGroupProxy.prototype.length = function() {
        return this._operationGroups.length;
    };
    OperationGroupProxy.prototype.groupLength = function(i) {
        return this._operationGroups[i].operations().length;
    };
    OperationGroupProxy.prototype.getItem = function(i, j) {
        return this._operationGroups[i].operations()[j];
    };
})(jQuery);
(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.views.popUp.menu.dataProvider.AnalysesProxy');
    var AnalysesProxy = grace.views.popUp.menu.dataProvider.AnalysesProxy = function(analyses) {
        this._analyses = analyses;
    };
    AnalysesProxy.prototype.length = function() {
        return 1;
    };
    AnalysesProxy.prototype.groupLength = function(i) {
        if (i === 0) {
            return this._analyses.length;
        } else {
            return 0;
        }
    };
    AnalysesProxy.prototype.getItem = function(i, j) {
        if (i === 0) {
            return this._analyses[j];
        } else {
            return null;
        }
    };
})(jQuery);
(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.views.popUp.menu.MenuEvent");

	var MenuEvent = grace.views.popUp.menu.MenuEvent = function(type, target, data) {
		MenuEvent.superclass.constructor.apply(this, arguments);

	};
	andrea.blink.extend(MenuEvent, andrea.blink.events.Event);

	MenuEvent.ITEM_SELECTED = "itemSelected";
})();
(function($) {
    var grace = andrea.grace;

    var MenuEvent = grace.views.popUp.menu.MenuEvent;

    andrea.blink.declare('andrea.grace.views.popUp.menu.PopUpMenu');
    var PopUpMenu = grace.views.popUp.menu.PopUpMenu = function(dom) {
        PopUpMenu.superclass.constructor.apply(this, arguments);

        this._$dom.addClass('grace-menu');
        this._classVisible = 'grace-menu-visible';
        this._dataProvider = null;
    };
    andrea.blink.extend(PopUpMenu, grace.views.popUp.HoverPopUpBase);

    PopUpMenu.create = function(dataProvider) {
        var menu = new PopUpMenu($('<div/>'));        menu._createChildren(dataProvider);
        return menu;    }
    /**
     *
     * @param {Array} value [{
     * 	text: xxx,
     * 	callback: function() {}
     * }]
     */
    PopUpMenu.prototype._createChildren = function(dataProvider) {
        this._dataProvider = dataProvider;

        this._createMenu(this._dataProvider, $(this._dom))    }
    PopUpMenu.prototype._createMenu = function(dataProvider, $dom) {
        var _this = this;

        var clickHandler = function(event) {
            $li = $(event.currentTarget);
            _this.dispatchEvent(new MenuEvent(MenuEvent.ITEM_SELECTED, _this, {
                'item' : $li.data('__item')
            }));
            _this.close();
        }
        var $ul = $('<ul/>').appendTo($dom);

        var i, j;
        var o;
        // Flattern style
        for ( i = 0; i < dataProvider.length(); i++) {
            if (i !== 0) {
                $('<div/>').appendTo($ul);
            }
            for ( j = 0; j < dataProvider.groupLength(i); j++) {
                var $li = $('<li/>').appendTo($ul);
                var $a = $('<a/>').appendTo($li);
                o = dataProvider.getItem(i, j);
                $li.data({
                    '__item' : o
                }).click(clickHandler);
                $a.text(o.name);
            }
        }
    }
})(jQuery);
(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.views.analysisContainer.supportClasses.ShelfBase');

    var DataDiscoveryModel = grace.models.DataDiscoveryModel;
    var ValueType = grace.constants.ValueType;
    var NumberValue = grace.models.value.NumberValue;
    var DateValue = grace.models.value.DateValue;
    var AnalysisType = andrea.grace.constants.AnalysisType;
    var ShelfEvent = grace.views.analysisContainer.events.ShelfEvent;
    var Analysis = grace.models.vo.Analysis;
    var ShelfType = grace.constants.ShelfType;
    var PopUpMenu = grace.views.popUp.menu.PopUpMenu;
    var OperationGroupProxy = grace.views.popUp.menu.dataProvider.OperationGroupProxy;
    var AnalysesProxy = grace.views.popUp.menu.dataProvider.AnalysesProxy;
    var PopUpEvent = grace.views.popUp.PopUpEvent;
    var OperationFactory = grace.operation.OperationFactory;
    var MenuEvent = grace.views.popUp.menu.MenuEvent;
    var OperationGroup = grace.operation.OperationGroup;
    var OperationClassification = grace.operation.OperationClassification;
    var OperationPriorityBaseline = grace.operation.OperationPriorityBaseline;
    var OperationType = grace.operation.OperationType;

    var TextFilter = grace.filter.TextFilter;
    var FilterUtil = grace.utils.FilterUtil;
    var TextValuesProxy = grace.views.popUp.filter.dataProvider.TextValuesProxy;
    var PopUpTextFilter = grace.views.popUp.filter.PopUpTextFilter;
    var RangeFilter = grace.filter.RangeFilter;
    var RangeValuesProxy = grace.views.popUp.filter.dataProvider.RangeValuesProxy;
    var PopUpRangeFilter = grace.views.popUp.filter.PopUpRangeFilter;
    var FilterEvent = grace.views.popUp.filter.FilterEvent;

    var ShelfBase = grace.views.analysisContainer.supportClasses.ShelfBase = function(dom) {
        ShelfBase.superclass.constructor.apply(this, arguments);

        var _this = this;
        // Place holder for card dragging
        this._$ph = $('<div/>').addClass('grace-analysis-card_placeholder');
        //
        this._popUpMenu = null;
        this._popUpFilter = null;
        this._trashMenu = null;
        /**
         * @protected
         */
        this._type = null;
        this._layout = null;
        this._initialization();

        this.helperGetAnalysis = null;

        $(this._dom).css({
            // 'width' : 160 + 'px'
        }).addClass('grace-analysis-contaier');

        this._$trashBin = null;
        this._$cards = null;

        var $container;
        // Title
        $container = $(this._dom);
        $container = $('<div/>').appendTo($container).addClass('grace-analysis-titleArea grace-analysis-clearfix');
        $container = $('<div/>').appendTo($container).addClass('grace-analysis-title');
        $('<h2/>').appendTo($container).addClass('grace-analysis-title-text');
        if (ShelfType.src(this._type)) {
            this._$trashBin = $('<span/>').appendTo($container).attr('title', '移回');
            this._$trashBin.addClass(['grace-analysis-operation', 'grace-analysis-title-operation', 'grace-analysis-title-operation-recycleBin'].join(' '));
        }

        // Content Cards
        $container = $(this._dom);
        $container = $('<div/>').appendTo($container).addClass('grace-analysis-cardArea');
        var $cards = this._$cards = $('<div/>').appendTo($container).addClass('grace-analysis-cards fancy-scrollbar');
        if (this._layout === 'horizontal') {
            $cards.addClass('grace-analysis-cards-horizontal');
        }
        if (_this._layout === 'vertical') {
            $('<div/>').appendTo($container).addClass('grace-analysis-cardArea-gradientTop');
            $('<div/>').appendTo($container).addClass('grace-analysis-cardArea-gradientBottom');
        }

        //
        $(this._dom).droppable({
            tolerance : 'pointer',
            accept : function(helper) {
                var from = helper.attr('__shelfType');
                var to = _this._type;

                var a = _this.helperGetAnalysis(helper.attr('__analysisID'));

                if (ShelfType.src(to)) {
                    if (to === ShelfType.SRC_MEA) {
                        if (ShelfType.src(from) && a.valueType() === ValueType.NUMBER) {
                            return true;
                        }
                    } else {
                        if (ShelfType.src(from)) {
                            return true
                        }
                    }
                } else if (ShelfType.des(to)) {
                    if (to === ShelfType.DES_DIM) {
                        if (a.analysisType === AnalysisType.DIMENSION) {
                            return true;
                        }
                    } else {
                        return true;
                    }
                } else if (ShelfType.proc(to)) {
                    return true;
                }
                return false;
            },
            activate : function(event) {
                var helper = $(event.currentTarget);
                var from = helper.attr('__shelfType');
                var to = _this._type;

                if (from !== to) {
                    $(this).addClass('grace-analysis-contaier_dropAcceptable');
                }
            },
            deactivate : function(event) {
                $(this).removeClass('grace-analysis-contaier_dropAcceptable');

                _this._$ph.detach();
            },
            drop : function(event, ui) {
                var from = ui.helper.attr('__shelfType');
                var to = _this._type;

                _this._$ph.detach();
                ui.helper.attr('__toContainerType', to);

                var shelvedAnalysisID = null;
                if (from === to) {
                    shelvedAnalysisID = ui.helper.attr('__shelvedAnalysisID');
                }
                _this.dispatchEvent(new ShelfEvent(ShelfEvent.HELPER_DROPPED, _this, {
                    'analysisID' : ui.helper.attr('__analysisID'),
                    '$helper' : ui.helper,
                    'from' : from,
                    'to' : to
                }))

                _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_SHELVED, _this, {
                    'shelvedContexts' : _this.getShelvedContexts()
                }));            },
            over : function(event, ui) {
                ui.helper.attr('__overContainerType', _this._type);
                _this._$ph.attr('__toIndex', '');

                var $cards = _this._$cards;
                _this._$ph.appendTo($cards).css({
                    'width' : ui.helper.outerWidth() + 'px',
                    'height' : ui.helper.outerHeight() + 'px'
                });
                if (_this._layout === 'horizontal') {
                    _this._$ph.addClass('grace-analysis-card_horizontal');
                }
                ui.helper.on('event-drag', function() {
                    var bases = [];
                    var draggingIndex = -1;
                    _this._traversalCards(function(index) {
                        var $card = $(this);
                        if ($card.attr('__dragging') === 'true') {
                            draggingIndex = bases.length;
                        }
                        bases.push({
                            top : $card.offset().top,
                            left : $card.offset().left
                        });
                    }, true, false)
                    var p;
                    if (_this._layout === 'vertical') {
                        p = 'top';
                    } else if (_this._layout === 'horizontal') {
                        p = 'left'
                    }
                    var draggingPosition = ui.helper.offset()[p];
                    for ( i = -1; i < bases.length; i++) {
                        var min = i < 0 ? Number.MIN_VALUE : bases[i][p];
                        var max = i === bases.length - 1 ? Number.MAX_VALUE : bases[i + 1][p];

                        if (draggingPosition > min && draggingPosition <= max) {
                            if (_this._$ph.attr('__toIndex') !== i + 1 + '') {
                                _this._$ph.detach();
                                _this._$ph.attr('__toIndex', i + 1);
                                if (draggingIndex === -1 || (draggingIndex !== i + 1 && draggingIndex !== i )) {
                                    $cards.appendAt(_this._$ph, i + 1);
                                }
                            }
                            break;
                        }
                    }
                }).removeClass('grace-analysis-card_draggingHelper_noDrop').addClass('grace-analysis-card_draggingHelper_grabbing');
            },
            out : function(event, ui) {
                var over = ui.helper.attr('__overContainerType');
                if (_this._type === over) {
                    ui.helper.off('event-drag').addClass('grace-analysis-card_draggingHelper_noDrop').removeClass('grace-analysis-card_draggingHelper_grabbing');
                }

                _this._$ph.detach();
            }
        });
    };
    andrea.blink.extend(ShelfBase, andrea.blink.mvc.View);

    ShelfBase.OPERATION_DISPLAY_SPLITTER = ' | ';

    ShelfBase.prototype.getShelvedContexts = function() {
        var contexts = [];
        this._traversalCards(function(index) {
            var $card = $(this);
            var ctx = {
                'analysisID' : $card.attr('__analysisID'),
                'shelvedAnalysisID' : $card.attr('__shelvedAnalysisID'),
                'operationGroup' : new OperationGroup(JSON.parse($card.attr('__operationIDs'))),
                'filter' : $card.data('__filter')
            };

            contexts.push(ctx);
        }, true, true);
        return contexts;
    }
    ShelfBase.prototype._traversalCards = function(callback, ignorePH, ignoreDragging) {
        var $cards = this._$cards;
        var children = $cards.children();

        var index = 0;
        for (var i = 0; i < children.length; i++) {
            var card = children[i];
            var $card = $(card);

            if (ignorePH && card === this._$ph[0]) {
                continue;
            }
            if (ignoreDragging && $card.attr('__dragging') === 'true') {
                continue;
            }

            callback.call(card, index);
            index++;
        }
    }
    ShelfBase.prototype._setTitle = function(title) {
        var $h2 = $(this._dom).find('h2');
        $h2.text(title);
    }
    ShelfBase.prototype._setRequired = function(required) {
        var $h2 = $(this._dom).find('h2');
        if (required) {
            $h2.addClass('grace-analysis-title-text_required');
        } else {
            $h2.removeClass('grace-analysis-title-text_required');
        }
    }
    ShelfBase.prototype.addSuffix = function(suffix) {
        var $h2 = $(this._dom).find('h2');

        if (suffix) {
            $h2.addClass('grace-analysis-title-text_suffix').attr({
                '__suffix' : suffix
            });
        } else {
            $h2.removeClass('grace-analysis-title-text_suffix');
        }
    }
    ShelfBase.prototype.type = function(value) {
        if (arguments.length > 0) {
            this._type = value;
        } else {
            return this._type;
        }
    }
    ShelfBase.prototype.dropAnalysis = function(a, $helper, from, to) {
        var $card = this._addCardAt(a, parseInt(this._$ph.attr('__toIndex')), $helper, from !== to);
    };

    ShelfBase.prototype.addCard = function(a) {
        return this._addCardAt(a);
    };
    // Override by child class
    ShelfBase.prototype._getOperationInfo = function() {
        return {
            'availableOGs' : [],
            'defaultTypes' : []        }
    };
    /**
     * @param a Analysis
     * @param index optional int
     * @param $helper optional object
     * @param newShelved optional boolean
     */
    ShelfBase.prototype._addCardAt = function(a, index, $helper, newShelved) {
        var _this = this;

        var $cards = this._$cards;
        var $card = $('<div/>').addClass(['grace-analysis-card', 'grace-analysis-card-transition'].join(' '));
        if (this._layout === 'horizontal') {
            $card.addClass('grace-analysis-card_horizontal');
        }
        $card.width('');

        $cards.appendAt($card, index);
        var shelvedAnalysisID;
        if ($helper && !newShelved) {
            shelvedAnalysisID = $helper.attr('__shelvedAnalysisID');
        } else {
            shelvedAnalysisID = _.uniqueId('shelvedAnalysisID_');
        }
        // TODO Use data replace attr
        $card.data({
            '__analysis' : a
        });
        $card.attr({
            '__analysisID' : a.id,
            '__shelvedAnalysisID' : shelvedAnalysisID,
            '__shelfType' : this._type
        });

        var $text = $('<div/>').appendTo($card).addClass('grace-analysis-card-text grace-text-ellipsis').text(a.name);
        // Show title only when ellipsis is actiated
        $text.on('mouseenter', function() {
            var $this = $(this);
            if (this.offsetWidth < this.scrollWidth && !$card.attr('title'))
                $card.attr('title', $this.text());
        }).on('mouseleave', function() {
            $card.attr('title', '');
        });
        // Handler operation
        var operationIDs;
        if ($helper && $helper.attr('__operationIDs') && $helper.attr('__shelfType') === this._type) {
            operationIDs = JSON.parse($helper.attr('__operationIDs'));
        }
        var info = this._getOperationInfo(a);
        var availableOGs = info.availableOGs;
        var defaultTypes = info.defaultTypes;

        var stopPropagation = function(event) {
            return false;
        };
        var removeFromShelf = function() {
            var $operation = $('<span/>').appendTo($card).addClass(['grace-analysis-operation', 'grace-analysis-card-operation'].join(' '));
            $operation.addClass(['grace-analysis-card-operation-removeFromShelf', 'grace-analysis-card-operation-1'].join(' '));
            $operation.attr('title', '移除');
            $operation.on('click', function() {                _this._hide($card, function() {
                    $card.detach();
                    _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_SHELVED, _this));
                });
            }).on('mousedown', stopPropagation);
            return $operation;
        }
        var $operation;
        if (ShelfType.proc(this._type)) {
            // Proc filter shelf
            // Remove
            removeFromShelf();
            // Filter
            var cValues = this._model().dataProvider.getCValues(a.index, true, false);
            var hasNull = this._model().dataProvider.isCHasNull(a.index);
            if (a.quantifiable) {
                if (a.valueType() === ValueType.DATE) {
                    $card.data('__filter', new RangeFilter(cValues, hasNull, DateValue.parseQuantified));
                } else if (a.valueType() === ValueType.NUMBER) {
                    $card.data('__filter', new RangeFilter(cValues, hasNull, NumberValue.parseQuantified));
                }
            } else {
                $card.data('__filter', new TextFilter(cValues, hasNull));
            }
            $operation = $('<span/>').appendTo($card).addClass(['grace-analysis-operation', 'grace-analysis-card-operation'].join(' '));
            $operation.addClass(['grace-analysis-card-operation-filter', 'grace-analysis-card-operation-2'].join(' '));
            $operation.on('hover', function(event) {
                if (event.type === 'mouseenter') {
                    _this._createPopUpFilter(a, $card, $operation);
                }
            }).on('mousedown', stopPropagation);
        } else if (ShelfType.des(this._type)) {
            // Des shelf
            // Remove
            removeFromShelf();
            // Drop down
            if (availableOGs && availableOGs.length > 0) {
                $operation = $('<span/>').appendTo($card).addClass(['grace-analysis-operation', 'grace-analysis-card-operation'].join(' '));
                $operation.addClass(['grace-analysis-card-operation-dropDown', 'grace-analysis-card-operation-2'].join(' '));
                $operation.on('hover', function(event) {
                    if (event.type === 'mouseenter') {
                        _this._createPopUpMenu(availableOGs, a, $card, $operation);
                    }
                }).on('mousedown', stopPropagation);
            }
        } else if (ShelfType.src(this._type)) {
            // Src shelf
            // Add
            $operation = $('<span/>').appendTo($card).addClass(['grace-analysis-operation', 'grace-analysis-card-operation'].join(' '));
            $operation.addClass(['grace-analysis-card-operation-addToAnalysis', 'grace-analysis-card-operation-1'].join(' '));
            if (this._type === ShelfType.SRC_DIM)
                $operation.attr('title', '添加到分析纬度');
            else if (this._type === ShelfType.SRC_MEA)
                $operation.attr('title', '添加到分析指标');

            var copyCard = function() {
                var pasteTo;
                if (this._type === ShelfType.SRC_DIM) {
                    pasteTo = ShelfType.DES_DIM;
                } else if (this._type === ShelfType.SRC_MEA) {
                    pasteTo = ShelfType.DES_VALUE;
                }
                this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_COPIED, this, {
                    'analysis' : $card.data('__analysis'),
                    'pasteTo' : pasteTo
                }));
            }
            $card.on('dblclick', $.proxy(copyCard, this))
            $operation.on('click', $.proxy(copyCard, this)).on('mousedown', stopPropagation);
            // Hide
            $operation = $('<span/>').appendTo($card).addClass(['grace-analysis-operation', 'grace-analysis-card-operation'].join(' '));
            $operation.addClass(['grace-analysis-card-operation-moveToTrash', 'grace-analysis-card-operation-2'].join(' '));
            $operation.attr('title', '隐藏');
            $operation.on('click', $.proxy(function() {
                this._addToTrash($card);
            }, this)).on('mousedown', stopPropagation);
        }
        if (!operationIDs || operationIDs.length === 0) {
            operationIDs = OperationGroup.createByTypes(defaultTypes).mapIDs();
        }
        if (!operationIDs) {
            operationIDs = [];
        }
        this._setOperations(operationIDs, $card);

        // Complete analysis
        if (ShelfType.src(this._type)) {
            if (this._type === ShelfType.SRC_DIM) {
                a.analysisType = AnalysisType.DIMENSION;
            } else if (this._type === ShelfType.SRC_MEA) {
                a.analysisType = AnalysisType.MEASURE;
            }
        }
        // Add suffix
        if (ShelfType.dim(this._type) && ShelfType.src(this._type)) {
            var suffix;
            if (a.valueType() === ValueType.DATE) {
                suffix = '\uf073';
            } else {
                if (a.numUniqueValue !== null) {
                    suffix = a.numUniqueValue;
                }
            }
            if (suffix) {
                $text.addClass('grace-analysis-card-text_suffix').attr({
                    '__suffix' : suffix
                });
            }
        }
        $card.addClass('grace-analysis-card_asSource');

        // Add card border
        if (a.analysisType === AnalysisType.DIMENSION) {
            $card.addClass('grace-analysis-card_asDimension');
        } else if (a.analysisType === AnalysisType.MEASURE) {
            $card.addClass('grace-analysis-card_asMeasure');
        }

        // Drag
        $card.draggable({
            containment : $('#divDataDiscovery'),
            helper : function(event) {
                var $clone = $(this).clone();
                $clone.width($(this).width()).addClass('grace-analysis-card_draggingHelper');
                $clone.removeClass('grace-analysis-card_asSource grace-analysis-card_asDimension grace-analysis-card_asMeasure');
                $clone.removeClass('grace-analysis-card-transition');
                $clone.appendTo($('body'));
                return $clone;
            },
            start : function(event, ui) {
                $(this).addClass('grace-analysis-card_disabled').attr({
                    '__dragging' : 'true'
                });
                ui.helper.addClass('grace-analysis-card_draggingHelper_grabbing');
            },
            stop : function(event, ui) {
                $(this).removeClass('grace-analysis-card_disabled').attr({
                    '__dragging' : 'false'
                });
                ui.helper.removeClass('grace-analysis-card_draggingHelper_grabbing');

                var from = ui.helper.attr('__shelfType');
                var to = ui.helper.attr('__toContainerType');

                if (to) {
                    if (ShelfType.like(from, to)) {
                        $(this).detach();
                    } else if (ShelfType.des(from) && ShelfType.proc(to)) {
                        $(this).detach();
                    } else if (ShelfType.proc(from) && ShelfType.des(to)) {
                        $(this).detach();
                    }
                } else {
                    if (ShelfType.des(from)) {
                        $(this).detach();
                    }
                }
                // Clear
                ui.helper.off('event-drag');
                //
                _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_SHELVED, _this, {
                    'shelvedContexts' : _this.getShelvedContexts()
                }));
            },
            drag : function(event, ui) {
                ui.helper.trigger('event-drag');
            }
        });
        //
        if (this._animationActivated) {
            $card.width($card.width());
            this._show($card);
        }
        return $card;
    };
    ShelfBase.prototype._addOperation = function(type, $card) {
        var o = OperationFactory.produce(type, OperationPriorityBaseline.USER_SPECIFICATION);

        var og = new OperationGroup(JSON.parse($card.attr('__operationIDs')));
        og.addOperation(o.id);

        this._setOperations(og.mapIDs(), $card);
    };
    ShelfBase.prototype._setOperations = function(operationIDs, $card) {
        var $text = $card.find('.grace-analysis-card-text');

        var operationIDsStringify = JSON.stringify(operationIDs);
        if (operationIDsStringify) {
            if ($card.attr('__operationIDs') !== operationIDsStringify) {
                $card.attr({
                    '__shelvedAnalysisID' : _.uniqueId('shelvedAnalysisID_'),
                    '__operationIDs' : operationIDsStringify
                });
            }

            var og = new OperationGroup(operationIDs);
            var abbrs = og.mapAbbrs();
            abbrs = _.without(abbrs, '');
            var abbr = abbrs.join(ShelfBase.OPERATION_DISPLAY_SPLITTER);
            if (abbr && ShelfType.des(this._type)) {
                $text.addClass('grace-analysis-card-text_prefix').attr({
                    '__prefix' : abbr
                });
            } else {
                $text.removeClass('grace-analysis-card-text_prefix');
            }
        } else {
            $card.removeAttr('__operationIDs');
            $text.removeClass('grace-analysis-card-text_prefix');
        }
    };
    ShelfBase.prototype._model = function() {
        return DataDiscoveryModel.instance();
    };
    ShelfBase.prototype._createPopUpFilter = function(a/*Analysis*/, $card, $operation) {
        if (this._popUpFilter) {
            if (this._popUpFilter.$dock() === $operation) {
                return;
            } else {
                this._popUpFilter.closeImmediately();
            }
        }
        var _this = this;
        // Update operation when open
        this._showOperation(true, $card, $operation);
        $card.find('.grace-analysis-card-text').addClass('grace-analysis-card-text-shrink');
        // Update menu when open
        var model = this._model();
        var filterSAs = [];
        var shelvedContexts = this.getShelvedContexts();
        _.each(shelvedContexts, function(ctx) {
            var sa = model.getShelvedAnalysis(ctx.shelvedAnalysisID);
            if (sa.id !== $card.attr('__shelvedAnalysisID')) {
                filterSAs.push(sa);
            }
        });
        var dataProvider = FilterUtil.filter(model.dataProvider, filterSAs)        var cValues = dataProvider.getCValues(a.index, true, true);
        var hasNull = dataProvider.isCHasNull(a.index);
        if (a.quantifiable) {
            this._popUpFilter = PopUpRangeFilter.create(new RangeValuesProxy($card.data('__filter'), hasNull));
        } else {
            this._popUpFilter = PopUpTextFilter.create(new TextValuesProxy($card.data('__filter'), cValues, hasNull));
        }
        var renderRequested = false;
        this._popUpFilter.addEventListener(FilterEvent.ITEM_SELECTED, function(event) {
            _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_SHELVED, _this));
        });

        this._popUpFilter.addEventListener(PopUpEvent.POPUP_CLOSED, function(event) {
            // Update operation when close
            this._showOperation(false, $card, $operation);
            $card.find('.grace-analysis-card-text').removeClass('grace-analysis-card-text-shrink');
            // Update operation when close
            _this._popUpFilter.removeAllEventListeners();
            _this._popUpFilter = null;
        }, this);
        this._popUpFilter.open($operation);
    }
    ShelfBase.prototype._showOperation = function(show, $card, $operation) {
        if (show) {
            $card.find('.grace-analysis-card-text').addClass('grace-analysis-card-text-shrink');
            $operation.addClass('grace-analysis-card-operation-show');
        } else {
            $card.find('.grace-analysis-card-text').removeClass('grace-analysis-card-text-shrink');
            $operation.removeClass('grace-analysis-card-operation-show');
        }
    }
    /**
     * Should be overrided
     * @param {Object} $card
     * @param {Object} $operation
     */
    ShelfBase.prototype._createPopUpMenu = function(operationGroups, a/*Analysis*/, $card, $operation) {
        if (this._popUpMenu) {
            return;
        }
        var _this = this;
        // Update operation when open
        this._showOperation(true, $card, $operation);
        // Update menu when open
        this._popUpMenu = PopUpMenu.create(new OperationGroupProxy(operationGroups));
        this._popUpMenu.addEventListener(MenuEvent.ITEM_SELECTED, function(event) {
            var operation = event.data.item;            _this._addOperation(operation.type, $card);
            // Dispatch CARD_SHELVED to notify visualization update
            _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_SHELVED, _this));
        });

        this._popUpMenu.addEventListener(PopUpEvent.POPUP_CLOSED, function(event) {
            // Update operation when close
            this._showOperation(false, $card, $operation);
            // Update operation when close
            _this._popUpMenu.removeAllEventListeners();
            _this._popUpMenu = null;
        }, this);
        this._popUpMenu.open($operation);
    }
    ShelfBase.prototype.updateShelvedAnalyses = function(getSA) {
        var _this = this;
        var numVisualized = 0;
        // Count number visualized
        this._traversalCards(function(index) {
            var $card = $(this);
            var sa = getSA($card.attr('__shelvedAnalysisID'));
            if (sa && sa.visualized) {
                numVisualized++;
            }
        }, true, true);

        // Update style
        this._traversalCards(function(index) {
            var $card = $(this);
            var sa = getSA($card.attr('__shelvedAnalysisID'));
            // Grey out
            if (sa) {
                if (numVisualized > 0 && !sa.visualized) {
                    $card.addClass('grace-analysis-card_disabled');
                } else {
                    $card.removeClass('grace-analysis-card_disabled');
                }
                // Operation
                _this._setOperations(sa.operationGroup.mapIDs(), $card);
            }
        }, true, true);
    };
    ShelfBase.prototype._addToTrash = function($card) {
        var a = $card.data('__analysis');
        // Model
        var trash = this._$cards.data('__trash') || [];
        if (trash.length === 0) {
            var $trashBin = this._$trashBin;
            var hover = $.proxy(function(event) {
                if (event.type === 'mouseenter' && !this._trashMenu) {
                    var trashMenu = this._trashMenu = PopUpMenu.create(new AnalysesProxy(this._$cards.data('__trash')));
                    trashMenu.addEventListener(MenuEvent.ITEM_SELECTED, function(event) {
                        this._removeFromTrash(event.data.item);
                    }, this);
                    trashMenu.addEventListener(PopUpEvent.POPUP_CLOSED, function(event) {
                        trashMenu.removeAllEventListeners();
                        this._trashMenu = null;
                    }, this);
                    trashMenu.open($trashBin);
                }
            }, this)
            this._show($trashBin).on('hover', hover);
        }
        trash.push(a);
        this._$cards.data('__trash', trash);
        // View
        this._hide($card, $.proxy(function() {
            $card.detach();
        }, this));
    };
    ShelfBase.prototype._removeFromTrash = function(a) {
        // Model
        var trash = this._$cards.data('__trash') || [];
        trash = _.without(trash, a);
        if (trash.length === 0) {
            this._hide(this._$trashBin).off('hover');
        }
        this._$cards.data('__trash', trash);
        // View
        this._addCardAt(a, 0);
    };
    ShelfBase.prototype._hide = function($target, complete) {
        $target.width($target.width());
        return $target.show(0).hide('explode', {
            'easing' : 'easeOutSine'
        }, 180, complete);
    };
    ShelfBase.prototype._show = function($target, complete) {
        return $target.hide(0).show('explode', {
            'easing' : 'easeInSine'
        }, 250, complete);
    };
    ShelfBase.prototype.removeAll = function() {
        this._$cards.empty();
    };
    ShelfBase.prototype._validateSize = function() {
        var size = this.size();

        var h = size.height - 36;
        this._$cards.css({
            'max-height' : h + 'px',
            'height' : h + 'px'
        });
    };
})(jQuery);
(function($) {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisContainer.supportClasses.ShelfBaseMediator");

    var AppConst = grace.constants.AppConst;
    var ShelfEvent = grace.views.analysisContainer.events.ShelfEvent;
    var VizNavigatorEvent = grace.views.popUp.VizNavigatorEvent;

    /**
     * App Mediator.
     */
    var ShelfBaseMediator = grace.views.analysisContainer.supportClasses.ShelfBaseMediator = function(view) {
        ShelfBaseMediator.superclass.constructor.apply(this, arguments);

        this._view = view;
        this._model = null;
    };

    andrea.blink.extend(ShelfBaseMediator, andrea.blink.mvc.ViewMediator);

    ShelfBaseMediator.prototype.init = function() {
        var _this = this;
        this._model = this._getModel(AppConst.MODEL_GRACE);

        this._view.helperGetAnalysis = function(id) {
            return _this._model.getAnalysis(id);
        };
        var runAnalysis = function() {
            _this._action(AppConst.ACTION_RUN_ANALYSIS, {
                'shelfType' : _this._view.type(),
                'shelvedContexts' : _this._view.getShelvedContexts()
            });
        }

        this._view.addEventListener(ShelfEvent.CARD_SHELVED, function(event) {
            runAnalysis();
        }, this);

        this._view.addEventListener(ShelfEvent.HELPER_DROPPED, function(event) {
            var a = _this._model.getAnalysis(event.data.analysisID);
            _this._view.dropAnalysis(a, event.data.$helper, event.data.from, event.data.to);
        });
        this._view.addEventListener(ShelfEvent.CARD_COPIED, function(event) {
            _this._model.viewNotify(AppConst.VIEW_NOTIFICATION_PASTE_TO, {
                'analysis' : event.data.analysis,
                'targetShelfType' : event.data.pasteTo
            });
        });

        this._subscribe(AppConst.VIEW_NOTIFICATION_PASTE_TO, function(notification) {
            if (_this._view.type() === notification.data.targetShelfType) {
                _this._view.addCard(notification.data.analysis);
            }
            runAnalysis();
        });
        this._subscribe(AppConst.NOTIFICATION_DATA_PROVIDER_CHANGED, function(notification) {
            _this._dataProviderChangedHandler(notification);
        });

        this._subscribe(AppConst.NOTIFICATION_VIZ_CONTEXT_APPLIED, function(notification) {
            _this._view.updateShelvedAnalyses(function(id) {
                return _this._model.getShelvedAnalysis(id);
            });
        });
    }
    /**
     * @protected
     */
    ShelfBaseMediator.prototype._dataProviderChangedHandler = function(notification) {
        this._view.removeAll();
    }
})(jQuery);
(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisContainer.source.SrcDimensionShelf");

    var AnalysisType = grace.constants.AnalysisType;
    var ShelfType = grace.constants.ShelfType;
    var OperationClassification = grace.operation.OperationClassification;
    var OperationType = grace.operation.OperationType;
    var OperationGroup = grace.operation.OperationGroup;

    var SrcDimensionShelf = grace.views.analysisContainer.source.SrcDimensionShelf = function(dom) {
        SrcDimensionShelf.superclass.constructor.apply(this, arguments);

        this._setTitle("纬度");

        $(this._dom).css({
            // "height" : "50%"
        });
    };
    andrea.blink.extend(SrcDimensionShelf, grace.views.analysisContainer.supportClasses.ShelfBase);

    SrcDimensionShelf.prototype._initialization = function() {
        this._type = ShelfType.SRC_DIM;
        this._layout = "vertical";
    };
    // SrcDimensionShelf.prototype._getOperationInfo = function(a) {
        // return {
            // 'availableOGs' : SrcDimensionShelf.OGS_DEFAULT,
            // 'defaultTypes' : []
        // };
    // }
    // SrcDimensionShelf.OGS_DEFAULT = null;
// 
    // SrcDimensionShelf._loadClass = function() {
        // var availableOGs;
        // // OGS_DEFAULT
        // availableOGs = [];
        // availableOGs.push(OperationGroup.createByTypes([OperationType.CARD_ADD_TO_DIMENSION, OperationType.CARD_ADD_TO_MEASURE]));
        // SrcDimensionShelf.OGS_DEFAULT = availableOGs;
    // };
    // SrcDimensionShelf._loadClass();
})();
(function($) {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisContainer.source.SrcDimensionShelfMediator");

    var AppConst = grace.constants.AppConst;
    var AnalysisType = andrea.grace.constants.AnalysisType;
    /**
     * App Mediator.
     */
    var SrcDimensionShelfMediator = grace.views.analysisContainer.source.SrcDimensionShelfMediator = function() {
        SrcDimensionShelfMediator.superclass.constructor.apply(this, arguments);
    };

    andrea.blink.extend(SrcDimensionShelfMediator, grace.views.analysisContainer.supportClasses.ShelfBaseMediator);

    SrcDimensionShelfMediator.prototype.init = function() {
        SrcDimensionShelfMediator.superclass.init.apply(this, arguments);
    }

    SrcDimensionShelfMediator.prototype._dataProviderChangedHandler = function() {
        SrcDimensionShelfMediator.superclass._dataProviderChangedHandler.apply(this, arguments);

        this._view.deactivateAnimation();
        var model = this._getModel(AppConst.MODEL_GRACE);
        for (var i = 0; i < model.analyses.length; i++) {
            var a = model.analyses[i];
            if (a.analysisType === AnalysisType.DIMENSION) {
                this._view.addCard(a);
            }
        }
        this._view.activateAnimation();
    }
})(jQuery);
(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisContainer.source.SrcMeasureShelf");

    var AnalysisType = grace.constants.AnalysisType;
    var ShelfType = grace.constants.ShelfType;
    var OperationClassification = grace.operation.OperationClassification;
    var OperationType = grace.operation.OperationType;
    var OperationGroup = grace.operation.OperationGroup;

    var SrcMeasureShelf = grace.views.analysisContainer.source.SrcMeasureShelf = function(dom) {
        SrcMeasureShelf.superclass.constructor.apply(this, arguments);

        this._setTitle("指标");
    };
    andrea.blink.extend(SrcMeasureShelf, grace.views.analysisContainer.supportClasses.ShelfBase);

    SrcMeasureShelf.prototype._initialization = function() {
        this._type = ShelfType.SRC_MEA;
        this._layout = "vertical";
    };
    // SrcMeasureShelf.prototype._getOperationInfo = function(a) {
        // return {
            // 'availableOGs' : SrcMeasureShelf.OGS_DEFAULT,
            // 'defaultTypes' : []
        // };
    // }
    // SrcMeasureShelf.OGS_DEFAULT = null;
// 
    // SrcMeasureShelf._loadClass = function() {
        // var availableOGs;
        // // OGS_DEFAULT
        // availableOGs = [];
        // availableOGs.push(OperationGroup.createByTypes([OperationType.CARD_ADD_TO_MEASURE]));
        // SrcMeasureShelf.OGS_DEFAULT = availableOGs;
    // };
    // SrcMeasureShelf._loadClass();
})();
(function($) {

	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.views.analysisContainer.source.SrcMeasureShelfMediator");

	var AppConst = grace.constants.AppConst;
	var AnalysisType = andrea.grace.constants.AnalysisType;
	/**
	 * App Mediator.
	 */
	var SrcMeasureShelfMediator = grace.views.analysisContainer.source.SrcMeasureShelfMediator = function() {
		SrcMeasureShelfMediator.superclass.constructor.apply(this, arguments);
	};

	andrea.blink.extend(SrcMeasureShelfMediator, grace.views.analysisContainer.supportClasses.ShelfBaseMediator);

	SrcMeasureShelfMediator.prototype.init = function() {
		SrcMeasureShelfMediator.superclass.init.apply(this, arguments);
	}

	SrcMeasureShelfMediator.prototype._dataProviderChangedHandler = function() {
		SrcMeasureShelfMediator.superclass._dataProviderChangedHandler.apply(this, arguments);

        this._view.deactivateAnimation();
		var model = this._getModel(AppConst.MODEL_GRACE);

		this._view.addSuffix(model.dataProvider.numRows);

		for (var i = 0; i < model.analyses.length; i++) {
			var a = model.analyses[i];
			if (a.analysisType === AnalysisType.MEASURE) {
				this._view.addCard(a);
			}
		}
        this._view.activateAnimation();

	}
})(jQuery);
(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisContainer.destination.DesDimensionShelf");

    var AnalysisType = grace.constants.AnalysisType;
    var ValueType = grace.constants.ValueType;
    var ShelfType = grace.constants.ShelfType;
    var OperationType = grace.operation.OperationType;
    var OperationGroup = grace.operation.OperationGroup;
    var OperationClassification = grace.operation.OperationClassification;
    var OT = OperationType;
    var OG = OperationGroup;
    var OC = OperationClassification;

    var DesDimensionShelf = grace.views.analysisContainer.destination.DesDimensionShelf = function(dom) {
        DesDimensionShelf.superclass.constructor.apply(this, arguments);

        this._setTitle("分析维度");
        this._setRequired(true);
    };
    andrea.blink.extend(DesDimensionShelf, grace.views.analysisContainer.supportClasses.ShelfBase);

    DesDimensionShelf.prototype._initialization = function() {
        this._type = ShelfType.DES_DIM;
        this._layout = "horizontal";
    };
    DesDimensionShelf.prototype._getOperationInfo = function(a) {
        var availableOGs;
        var defaultTypes;

        if (a.valueType()=== ValueType.DATE) {
            availableOGs = DesDimensionShelf.OGS_DATE;
            defaultTypes = [OT.SORT_ASCEND];
            if (a.dateSpan < 86400000 * (365 / 2 + 1)) {
                defaultTypes.push(OT.DRILL_DATE);
            } else if (a.dateSpan < 86400000 * (365 * 1)) {
                defaultTypes.push(OT.DRILL_WEEK);
            } else if (a.dateSpan < 86400000 * (365 * 5)) {
                defaultTypes.push(OT.DRILL_MONTH);
            } else {
                defaultTypes.push(OT.DRILL_YEAR);
            }
        } else {
            availableOGs = DesDimensionShelf.OGS_DEFAULT;
            defaultTypes = [OT.SORT_NONE];
        }

        return {
            'availableOGs' : availableOGs,
            'defaultTypes' : defaultTypes
        };
    }
    DesDimensionShelf.OGS_DATE = null;
    DesDimensionShelf.OGS_DEFAULT = null;
    DesDimensionShelf._loadClass = function() {
        var availableOGs;
        // OGS_DATE
        availableOGs = [];
        availableOGs.push(OG.createByTypes([OT.SORT_ASCEND, OT.SORT_DESCEND]));
        availableOGs.push(OG.createByClassification(OC.DRILL));
        availableOGs.push(OG.createByClassification(OC.GROUP));
        DesDimensionShelf.OGS_DATE = availableOGs;
        // OGS_DEFAULT
        availableOGs = [];
        availableOGs.push(OG.createByTypes([OT.SORT_NONE, OT.SORT_ALPHABET_ASCEND, OT.SORT_ALPHABET_DESCEND]));
        DesDimensionShelf.OGS_DEFAULT = availableOGs;
    };
    DesDimensionShelf._loadClass();

})();
(function($) {

	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.views.analysisContainer.destination.DesDimensionShelfMediator");

	var AppConst = grace.constants.AppConst;
	/**
	 * App Mediator.
	 */
	var DesDimensionShelfMediator = grace.views.analysisContainer.destination.DesDimensionShelfMediator = function() {
		DesDimensionShelfMediator.superclass.constructor.apply(this, arguments);
	};

	andrea.blink.extend(DesDimensionShelfMediator, grace.views.analysisContainer.supportClasses.ShelfBaseMediator);

	DesDimensionShelfMediator.prototype.init = function() {
		DesDimensionShelfMediator.superclass.init.apply(this, arguments);
	}

})(jQuery);
(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisContainer.destination.DesMeasureShelf");

    var AnalysisType = grace.constants.AnalysisType;
    var ShelfType = grace.constants.ShelfType;
    var OperationType = grace.operation.OperationType;
    var OperationGroup = grace.operation.OperationGroup;
    var OperationClassification = grace.operation.OperationClassification;
    var OperationFactory = grace.operation.OperationFactory;
    var OT = OperationType;
    var OG = OperationGroup;
    var OC = OperationClassification;

    var DesMeasureShelf = grace.views.analysisContainer.destination.DesMeasureShelf = function(dom) {
        DesMeasureShelf.superclass.constructor.apply(this, arguments);

        this._setTitle("分析指标");
        this._setRequired(true);
    };
    andrea.blink.extend(DesMeasureShelf, grace.views.analysisContainer.supportClasses.ShelfBase);

    DesMeasureShelf.prototype._initialization = function() {
        this._type = ShelfType.DES_VALUE;
        this._layout = "horizontal";

    };
    DesMeasureShelf.prototype._getOperationInfo = function(a) {
        var availableOGs;
        var defaultTypes;
        if (a.analysisType === AnalysisType.DIMENSION) {
            availableOGs = DesMeasureShelf.OGS_DIMENSION;
            defaultTypes = [OT.CALC_COUNT];
        } else if (a.analysisType === AnalysisType.MEASURE) {
            availableOGs = DesMeasureShelf.OGS_MEASURE;
            defaultTypes = [OT.CALC_SUM];
        }

        return {
            'availableOGs' : availableOGs,
            'defaultTypes' : defaultTypes
        };
    };

    DesMeasureShelf.OGS_DIMENSION = null;
    DesMeasureShelf.OGS_MEASURE = null;
    DesMeasureShelf._loadClass = function() {
        var availableOGs;
        // OGS_DIMENSION
        availableOGs = [];
        availableOGs.push(OG.createByTypes([OT.CALC_UNIQ_COUNT, OT.CALC_COUNT]));
        availableOGs.push(OG.createByTypes([OT.SORT_NONE, OT.SORT_ASCEND, OT.SORT_DESCEND]));
        DesMeasureShelf.OGS_DIMENSION = availableOGs;
        // OGS_MEASURE
        availableOGs = [];
        availableOGs.push(OG.createByTypes([OT.CALC_SUM, OT.CALC_AVG, OT.CALC_MAX, OT.CALC_MIN]));
        availableOGs.push(OG.createByTypes([OT.SORT_NONE, OT.SORT_ASCEND, OT.SORT_DESCEND]));
        DesMeasureShelf.OGS_MEASURE = availableOGs;
    };
    DesMeasureShelf._loadClass();
})();
(function($) {

	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.views.analysisContainer.destination.DesMeasureShelfMediator");

	var AppConst = grace.constants.AppConst;
	/**
	 * App Mediator.
	 */
	var DesMeasureShelfMediator = grace.views.analysisContainer.destination.DesMeasureShelfMediator = function() {
		DesMeasureShelfMediator.superclass.constructor.apply(this, arguments);
	};

	andrea.blink.extend(DesMeasureShelfMediator, grace.views.analysisContainer.supportClasses.ShelfBaseMediator);

	DesMeasureShelfMediator.prototype.init = function() {
		DesMeasureShelfMediator.superclass.init.apply(this, arguments);
	}

})(jQuery);
(function() {
	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.views.analysisContainer.processor.FilterShelf");

	var AnalysisType = grace.constants.AnalysisType;
	var ShelfType = grace.constants.ShelfType;

	var FilterShelf = grace.views.analysisContainer.processor.FilterShelf = function(dom) {
		FilterShelf.superclass.constructor.apply(this, arguments);

		this._setTitle("过滤数据");
	};
	andrea.blink.extend(FilterShelf, grace.views.analysisContainer.supportClasses.ShelfBase);

	FilterShelf.prototype._initialization = function() {
		this._type = ShelfType.PROC_FILTER;
		this._layout = "vertical";
	};
})();
(function($) {

	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.views.analysisContainer.processor.FilterShelfMediator");

	var AppConst = grace.constants.AppConst;
	/**
	 * App Mediator.
	 */
	var FilterShelfMediator = grace.views.analysisContainer.processor.FilterShelfMediator = function() {
		FilterShelfMediator.superclass.constructor.apply(this, arguments);
	};

	andrea.blink.extend(FilterShelfMediator, grace.views.analysisContainer.supportClasses.ShelfBaseMediator);

	FilterShelfMediator.prototype.init = function() {
		FilterShelfMediator.superclass.init.apply(this, arguments);
	}

})(jQuery);
(function($) {
	var grace = andrea.grace;

	var VizType = grace.constants.VizType;

	andrea.blink.declare("andrea.grace.views.analysisResult.viz.VizFactory");
	var VizFactory = grace.views.analysisResult.viz.VizFactory;

	VizFactory.produce = function(dom, type, selectedVizType) {
		var vizInstance;
		var placeHolder = grace.views.analysisResult.viz.placeHolder;
		var highCharts = grace.views.analysisResult.viz.highCharts;
		var googleCharts = grace.views.analysisResult.viz.googleCharts;

		if (type === VizType.SCATTER) {
			return new highCharts.Scatter(dom, 'scatter', type);
		} else if (type === VizType.BAR || type === VizType.STACKED_BAR) {
			return new highCharts.BasicXY(dom, 'bar', type);
		} else if (type === VizType.COLUMN || type === VizType.STACKED_COLUMN) {
			return new highCharts.BasicXY(dom, 'column', type);
		} else if (type === VizType.LINE || type === VizType.RADAR) {
			return new highCharts.BasicXY(dom, 'line', type);
		} else if (type === VizType.AREA) {
			return new highCharts.BasicXY(dom, 'area', type);
		} else if (type === VizType.PIE) {
			return new highCharts.Pie(dom, 'pie', type);
		} else {
			return new placeHolder.VizPH(dom, selectedVizType);
		}
	};
})(jQuery);
(function($) {
	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.views.analysisResult.viz.VizBase");

	var VizBase = grace.views.analysisResult.viz.VizBase = function(dom) {
		VizBase.superclass.constructor.apply(this, arguments);

		this._$dom = $(dom);
		this._$dom.addClass('grace-result-viz');
	};
	andrea.blink.extend(VizBase, andrea.blink.mvc.View);

	/**
	 * Should be overrided by child class
	 *
	 * @param {Object} dataProvider
	 * @param {Object} dimesionSAs
	 * @param {Object} dataSAs
	 *
	 */
	VizBase.prototype.render = function(dataProvider, dimesionSAs, dataSAs) {
		VizBase._renderingCache = null;
		return true;
	};
	VizBase._renderingCache = null;
	VizBase.prototype.destroy = function() {
		return true;
	};
	VizBase.prototype._addMessage = function(msgID) {
		// TODO
	};
	VizBase.prototype._removeMessages = function(msgID) {

	};
	VizBase._MESSAGES = {
	};
})(jQuery);
(function($) {
	var grace = andrea.grace;
	var VizType = grace.constants.VizType;
	var VizBase = grace.views.analysisResult.viz.VizBase;

	andrea.blink.declare("andrea.grace.views.analysisResult.viz.placeHolder.VizPH");
	var VizPH = grace.views.analysisResult.viz.placeHolder.VizPH = function(dom, selectedVizType) {
		VizPH.superclass.constructor.apply(this, arguments);

		this._selectedVizType = selectedVizType;
	};
	andrea.blink.extend(VizPH, VizBase);

	VizPH.prototype.render = function(dataProvider, dimesionSAs, dataSAs) {
		VizBase._renderingCache = null;

		var $hint = $('<div/>').appendTo(this._$dom).addClass('grace-result-viz-placeHolder-hint');
		var $line1 = $('<span/>').appendTo($hint);
		$('<br/>').appendTo($hint);
		$('<br/>').appendTo($hint);
		var $line2 = $('<span/>').appendTo($hint);

		if (dataProvider && dataProvider.numRows === 0) {
			$line1.text('所有数据都被过滤掉了，');
			$line2.text('请修改过滤设置。');
		} else {
			if (this._selectedVizType === VizType.RECOMMEND) {
				$line1.text('从左边的纬度栏和指标栏');
				$line2.text('开启您数据发现之旅！');
			} else {
				var manifest = VizType.manifest(this._selectedVizType);
				var required = manifest.required;

				var text = '需要至少';
				if (required.numDimensions > 0) {
					text = text + required.numDimensions + '个分析纬度，';
				}
				if (required.numMeasures > 0) {
					text = text + required.numMeasures + '个分析指标。';
				}
				$line1.text(manifest.title + text);
				$line2.text('或者请使用推荐图形');
			}
		}
		$hint.css({
			'left' : (this._$dom.width() - $hint.width()) / 2 + 'px',
			'top' : (this._$dom.height() - $hint.height()) / 2 + 'px'
		});

		return true;
	};
})(jQuery);
(function() {
    var grace = andrea.grace;

    var ValueType = grace.constants.ValueType;
    var OperationType = grace.operation.OperationType;
    var NullValue = grace.models.value.NullValue;
    var DateValue = grace.models.value.DateValue;

    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.supportClasses.ValueQuery");
    var ValueQuery = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.ValueQuery = function(dataProvider, shelvedAnalysis, turboThreshold) {
        this._dataProvider = dataProvider;
        this._sa = shelvedAnalysis;
        this._a = this._sa.source;

        this._names = null;
        this._captionParams = [];

        this._initialize();

        // Highcharts limitation
        this._allNames = this._names;
        this._names = this._names.slice(0, turboThreshold);
    };
    ValueQuery.prototype._initialize = function() {
        var values = this._dataProvider.getCValues(this._a.index, true, true);

        // Builde names
        var source = {
            'values' : values,
            'hasNull' : this._dataProvider.isCHasNull(this._a.index)
        };
        if (this._a.valueType() === ValueType.STRING) {
            this._names = this._generateNames(source);
        } else if (this._a.valueType() === ValueType.NUMBER) {
            this._names = this._generateNames(source);
        } else if (this._a.valueType() === ValueType.DATE) {
            // Drill
            if (this._sa.operationGroup.has(OperationType.DRILL_YEAR)) {
                // Year
                this._captionParams = [DateValue.CAPTION_DRILL_YEAR];
                this._names = this._generateDateDrillNames(source, function(transition) {
                    transition.setMonth(0);
                    transition.setDate(1);
                }, function(transition, to) {
                    return transition.getFullYear() < to.getFullYear();
                }, function(transition) {
                    transition.setFullYear(transition.getFullYear() + 1);
                });
            } else if (this._sa.operationGroup.has(OperationType.DRILL_MONTH)) {
                // Month
                this._captionParams = [DateValue.CAPTION_DRILL_MONTH];
                this._names = this._generateDateDrillNames(source, function(transition) {
                    transition.setDate(1);
                }, function(transition, to) {
                    return transition.getFullYear() * 12 + transition.getMonth() < to.getFullYear() * 12 + to.getMonth();
                }, function(transition) {
                    transition.setMonth(transition.getMonth() + 1);
                });
            } else if (this._sa.operationGroup.has(OperationType.DRILL_WEEK)) {
                // Week
                this._captionParams = [DateValue.CAPTION_DRILL_WEEK];
                this._names = this._generateDateDrillNames(source, function(transition) {
                }, function(transition, to) {
                    return Math.floor(transition.getMonsday().getTime() / 7 / 24 / 3600 / 1000) < Math.floor(to.getMonsday().getTime() / 7 / 24 / 3600 / 1000)
                }, function(transition) {
                    transition.setDate(transition.getDate() + 7);
                });
            } else if (this._sa.operationGroup.has(OperationType.DRILL_DATE)) {
                // Date
                this._captionParams = [DateValue.CAPTION_DRILL_DATE];
                // this._valueToName = ValueToName.dateDrillDate;
                this._names = this._generateDateDrillNames(source, function(transition) {
                }, function(transition, to) {
                    return Math.floor(transition.getTime() / 24 / 3600 / 1000) < Math.floor(to.getTime() / 24 / 3600 / 1000)
                }, function(transition) {
                    transition.setDate(transition.getDate() + 1);
                });
            }
            // Group
            else if (this._sa.operationGroup.has(OperationType.GROUP_MONTH)) {
                this._captionParams = [DateValue.CAPTION_GROUP_MONTH];
                this._names = this._generateSortedNames(source, _.clone(Date.monthNames));
            } else if (this._sa.operationGroup.has(OperationType.GROUP_DATE)) {
                this._captionParams = [DateValue.CAPTION_GROUP_DATE];
                this._names = this._generateSortedNames(source, _.clone(Date.dateNames));
            } else if (this._sa.operationGroup.has(OperationType.GROUP_DAY)) {
                this._captionParams = [DateValue.CAPTION_GROUP_DAY];
                this._names = this._generateSortedNames(source, _.clone(Date.dayNames));
            } else if (this._sa.operationGroup.has(OperationType.GROUP_HOUR)) {
                this._captionParams = [DateValue.CAPTION_GROUP_HOUR];
                this._names = this._generateSortedNames(source, _.clone(Date.hourNames));
            }
        }
    }

    ValueQuery.prototype._generateNames = function(source) {
        var values = source.values;
        var v;
        // TODO Performance optimize
        if (this._sa.operationGroup.ascend()) {
            values = _.sortBy(values, function(v) {
                v.caption.apply(v, this._captionParams);
            });
        } else if (this._sa.operationGroup.descend()) {
            values = _.sortBy(values, function(v) {
                v.caption.apply(v, this._captionParams);
            });
            values.reverse();
        }

        var names = [];
        _.each(values, function(v) {
            names.push(v.caption.apply(v, this._captionParams))
        });
        if (source.hasNull) {
            v = NullValue.instance();
            names.push(v.caption.apply(v, this._captionParams));
        }
        return names;
    };
    ValueQuery.prototype._generateDateDrillNames = function(source, loopInitialization, loopCondition, loopAfterThought) {
        var values = source.values;

        var dates = _.sortBy(values, function(d) {
            return d.quantified();
        });
        if (dates.length === 0) {
            return [];
        }

        var from = dates[0];
        var to = dates[dates.length - 1];

        var transition = new Date();
        transition.setTime(from.value().getTime());

        loopInitialization(transition);
        var names = [];
        while (true) {
            var v = new DateValue('', transition);
            names.push(v.caption.apply(v, this._captionParams));

            if (!loopCondition(transition, to.value())) {
                break;
            }
            loopAfterThought(transition);
        }

        return this._generateSortedNames(source, names);
    };
    ValueQuery.prototype._generateSortedNames = function(source, names) {
        if (this._sa.operationGroup.has(OperationType.SORT_DESCEND)) {
            names.reverse();
        }
        if (source.hasNull) {
            var v = NullValue.instance();
            names.push(v.caption.apply(v, this._captionParams));
        }
        return names;
    };
    ValueQuery.prototype.queryIndex = function(rValues) {
        var v = rValues[this._a.index];
        var name = v.caption.apply(v, this._captionParams);
        // TODO Performance optimize
        var index = this._names.indexOf(name);

        if (index === -1 && this._allNames.indexOf(name) === -1) {
        }
        return index;
    };
    ValueQuery.prototype.names = function() {
        return this._names;
    };
})();
(function() {
    var grace = andrea.grace;

    var OperationGroup = grace.operation.OperationGroup;
    var ValueQuery = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.ValueQuery;

    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption");
    var HighChartsOption = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption;

    HighChartsOption.genMain = function(chartType) {
        return {
            chart : {
                type : chartType
            },
            title : {
                text : null
            },
            credits : {
                enabled : false
            }

        }
    }
    HighChartsOption.genLegend = function(enabled) {
        var legend = null;
        if (enabled) {
            legend = {
                layout : 'vertical',
                align : 'left',
                verticalAlign : 'middle'
            }
        } else {
            legend = {
                "enabled" : false
            }
        }
        return {
            "legend" : legend
        }
    }
    HighChartsOption._visualize = function(analyses, index) {
        var sa/*ShelvedAnalysis*/ = null;
        if (index < analyses.length) {
            sa = analyses[index];
            sa.visualized = true;
        }
        return sa;
    }
    HighChartsOption._setVisualized = function(shelvedAnalyses) {
        if (!shelvedAnalyses) {
            return;
        }
        if (!_.isArray(shelvedAnalyses)) {
            shelvedAnalyses = [shelvedAnalyses];
        }
        for (var i = 0; i < shelvedAnalyses.length; i++) {
            var sa = shelvedAnalyses[i];
            sa.visualized = true;
        }
    }
    /**
     *
     */
    HighChartsOption.dataConfig = function(dataProvider, seriesSA, categorySA, dataSAs, isSeriesByDatas, turboThreshold) {
        var i, d, f;
        var og/*OperationGroup*/;
        var sa;
        // Series, category, data index/length
        var si, ci, di;
        var sl, cl, dl;
        // ValueQuery for series, category
        var sq, cq;
        // For data sort
        var sortByData;
        // function(values, indexDataSA)
        var querySeriesIndex;
        // function(values)
        var queryCategoryIndex;

        // Rinse operations
        var ogs = [];
        var sortOperations = [];
        var prepareRinseOperation = function(og) {
            ogs.push(og);

            sortOperations.push(og.ascend());
            sortOperations.push(og.descend());
        }
        if (seriesSA) {
            prepareRinseOperation(seriesSA.operationGroup);
        }
        if (categorySA) {
            prepareRinseOperation(categorySA.operationGroup);
        }
        for ( di = 0; di < dataSAs.length; di++) {
            prepareRinseOperation(dataSAs[0].operationGroup);
        }
        sortOperations = _.without(sortOperations, undefined);
        sortOperations.sort(function(o1, o2) {
            return o1.priority - o2.priority;
        })
        sortOperations.pop();
        _.each(ogs, function(og) {
            _.each(sortOperations, function(o) {
                og.removeOperation(o.id);
            });
        });
        // Series
        if (!seriesSA) {
            if (isSeriesByDatas) {
                querySeriesIndex = function(values, indexDataSA) {
                    return indexDataSA;
                }
                sl = dataSAs.length;
                dl = 1;
            } else {
                querySeriesIndex = function(values, indexDataSA) {
                    return 0;
                }
                sl = 1;
                dl = dataSAs.length;
            }
        } else {
            sq = new ValueQuery(dataProvider, seriesSA, turboThreshold);
            querySeriesIndex = function(values, indexDataSA) {
                return sq.queryIndex(values);
            }
            sl = sq.names().length;
            dl = dataSAs.length;
        }
        // Category
        if (!categorySA) {
            queryCategoryIndex = function(values) {
                return 0;
            }
            cl = 1;
        } else {
            cq = new ValueQuery(dataProvider, categorySA, turboThreshold);
            queryCategoryIndex = function(values) {
                return cq.queryIndex(values);
            }
            cl = cq.names().length;
        }

        // Data for highcharts
        var highSeries = [];
        // Prepare
        for ( si = 0; si < sl; si++) {
            highSeries[si] = {
                "name" : isSeriesByDatas ? HighChartsOption.saToDisplay(dataSAs[si]) : ( sq ? sq.names()[si] : HighChartsOption.saToDisplay(dataSAs[0])),
                "data" : []
            };
            for ( ci = 0; ci < cl; ci++) {
                highSeries[si].data[ci] = {
                    "name" : cq ? cq.names()[ci] : "",
                    "data" : []
                };
                for ( di = 0; di < dl; di++) {
                    d = isSeriesByDatas ? si : di;
                    og = dataSAs[d].operationGroup;
                    highSeries[si].data[ci].data[di] = og.calculator();
                    if (!sortByData && (og.ascend() || og.descend())) {
                        sortByData = {
                            'si' : si,
                            'di' : di,
                            'ascend' : og.ascend()
                        }
                    }
                }
            }
        }

        // Query
        for ( i = 0; i < dataProvider.numRows; i++) {
            var values = dataProvider.getRValues(i);

            // Set
            for ( d = 0; d < dataSAs.length; d++) {
                si = querySeriesIndex(values, d);
                ci = queryCategoryIndex(values);
                di = isSeriesByDatas ? 0 : d;
                if (si === -1 || ci === -1 || di === -1) {
                    continue;
                }
                highSeries[si].data[ci].data[di].addFactor(values[dataSAs[d].source.index].value());
            }
        }
        // Calculate
        var allPositive = true;
        for ( si = 0; si < sl; si++) {
            for ( ci = 0; ci < cl; ci++) {
                for ( di = 0; di < dl; di++) {
                    var calculate = highSeries[si].data[ci].data[di].calculate();
                    highSeries[si].data[ci].data[di] = calculate;
                    allPositive = allPositive && calculate >= 0;
                }
            }
        }

        // Set config
        var config = {
            'allPositive' : allPositive
        };
        if (cq) {
            config.categories = cq.names();
        }
        config.series = highSeries;

        // Apply data sort
        if (sortByData && config.categories) {
            // Array to objects
            var objects = [];
            for ( i = 0; i < cl; i++) {
                o = {
                    'category' : config.categories[i],
                    'series' : []
                };
                for ( si = 0; si < config.series.length; si++) {
                    o.series[si] = config.series[si].data[i];
                }
                objects.push(o);
            }
            // Sort
            objects.sort(function(o1, o2) {
                return o1.series[sortByData.si].data[sortByData.di] - o2.series[sortByData.si].data[sortByData.di];
            });
            if (!sortByData.ascend) {
                objects.reverse();
            }
            // Clear old
            config.categories = [];
            for ( si = 0; si < config.series.length; si++) {
                config.series[si].data = [];
            }
            // Set new, objects to array
            for ( i = 0; i < cl; i++) {
                o = objects[i];
                config.categories.push(o.category);
                for ( si = 0; si < config.series.length; si++) {
                    config.series[si].data.push(o.series[si]);
                }
            }
        }
        return config;
    };

    HighChartsOption.OPERATION_DISPLAY_SPLITTER = " | ";
    // HighChartsOption.OPERATION_DISPLAY_CONNECTIOR = " - ";
    HighChartsOption.OPERATION_DISPLAY_SPLITTER_ABBR = "|";
    // HighChartsOption.OPERATION_DISPLAY_CONNECTIOR_ABBR = "-";

    HighChartsOption.saToDisplay = function(sa) {
        var name = sa.operationGroup.mapNames().join(HighChartsOption.OPERATION_DISPLAY_SPLITTER);
        if (name) {
            return sa.source.name + ' (' + name + ')';
        } else {
            return sa.source.name;
        }
    }
    HighChartsOption.saToDisplayAbbr = function(sa) {
        var abbr = sa.operationGroup.mapAbbrs().join(HighChartsOption.OPERATION_DISPLAY_SPLITTER_ABBR);
        if (abbr) {
            return sa.source.name + '(' + abbr + ')';
        } else {
            return sa.source.name;
        }
    }
})();
(function($) {
    var grace = andrea.grace;

    var HighChartsOption = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption;
    var VizType = grace.constants.VizType;
    var VizBase = grace.views.analysisResult.viz.VizBase;

    /**
     * chartType: column, bar, line, area
     * vizType:
     */
    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.HighChartsBase");
    var HighChartsBase = grace.views.analysisResult.viz.highCharts.HighChartsBase = function(dom, chartType, vizType) {
        HighChartsBase.superclass.constructor.apply(this, arguments);

        this._chartType = chartType;
        this._vizType = vizType;
    };
    andrea.blink.extend(HighChartsBase, VizBase);

    HighChartsBase.prototype.highConfig = function() {
        return HighChartsOption.genMain(this._chartType);
    };
    HighChartsBase.prototype._setVisualized = function(dataProvider, seriesSA, categorySA, dataSAs, isSeriesByDatas) {
        // Set visualized
        HighChartsOption._setVisualized(seriesSA);
        HighChartsOption._setVisualized(categorySA);
        HighChartsOption._setVisualized(dataSAs);
    };
    HighChartsBase.prototype.render = function(dataProvider, dimesionSAs, dataSAs) {
        var highConfig = HighChartsOption.genMain(this._chartType);

        // Get data config args
        var dataConfigArgs = {
            'array' : this.dataConfigArgs(dataProvider, dimesionSAs, dataSAs)
        };
        var toObject = function(dataProvider, seriesSA, categorySA, dataSAs, isSeriesByDatas, turboThreshold) {
            dataConfigArgs.object = {
                'dataProvider' : dataProvider,
                'seriesSA' : seriesSA,
                'categorySA' : categorySA,
                'dataSAs' : dataSAs,
                'isSeriesByDatas' : isSeriesByDatas,
                'turboThreshold' : turboThreshold
            }
        }
        toObject.apply(this, dataConfigArgs.array);
        // Set visualized
        this._setVisualized.apply(this, dataConfigArgs.array);
        // Check outdate
        var outdate = HighChartsBase.checkOutdate(this._vizType, dataConfigArgs);
        if (!outdate.render) {
            return false;
        }
        // Data config
        var dataConfig = HighChartsOption.dataConfig.apply(null, dataConfigArgs.array);
        // High config
        this.completeHighConfig(highConfig, dataConfig, dataProvider, dimesionSAs, dataSAs);

        highConfig.plotOptions = highConfig.plotOptions || {};
        highConfig.plotOptions.series = highConfig.plotOptions.series || {};
        highConfig.plotOptions.series.turboThreshold = dataConfigArgs.object.turboThreshold;
        highConfig.plotOptions.series.stickyTracking = false;
        if (!outdate.animation) {
            highConfig.plotOptions.series.animation = false;
        }
        if (dataConfig.allPositive) {
            highConfig.xAxis = highConfig.xAxis || {};
            highConfig.xAxis.min = 0;
            if (!highConfig.yAxis) {
                highConfig.yAxis = {};
                highConfig.yAxis.min = 0;
            } else {
                for (var i = 0; i < highConfig.yAxis.length; i++) {
                    highConfig.yAxis[i].min = 0;
                }
            }
        }
        $(this._dom).highcharts(highConfig);
        return true;
    };
    HighChartsBase.prototype.dataConfigArgs = function(dataProvider, dimesionSAs, dataSAs) {
    };
    HighChartsBase.prototype.completeHighConfig = function(highConfig, dataConfig, dataProvider, dimesionSAs, dataSAs) {
    };
    HighChartsBase.checkOutdate = function(vizType, dataConfigArgs) {        var clone = function(value) {
            if (value != null) {
                return JSON.parse(JSON.stringify(value));
            } else {
                return null;
            }
        }        var current = {
            'vizType' : vizType,
            'numRows' : dataConfigArgs.object.dataProvider.numRows,
            'seriesSA' : clone(dataConfigArgs.object.seriesSA),
            'categorySA' : clone(dataConfigArgs.object.categorySA),
            'dataSAs' : clone(dataConfigArgs.object.dataSAs),
            'isSeriesByDatas' : dataConfigArgs.object.isSeriesByDatas
        };
        var cache = VizBase._renderingCache;
        var outdate;
        if (!cache) {
            outdate = {
                'render' : true,
                'animation' : true
            }
        } else if (!_.isEqual(cache, current)) {
            outdate = {
                'render' : true,
                'animation' : cache.numRows === current.numRows
            }
        } else {
            outdate = {
                'render' : false
            };
        }
        if (outdate.render) {
            VizBase._renderingCache = current;
        }
        return outdate;
    };
})(jQuery);

(function($) {
    var grace = andrea.grace;

    var VizType = grace.constants.VizType;
    var HighChartsOption = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption;
    var CalculatorFactory = grace.calculator.supportClasses.CalculatorFactory;

    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.Pie");
    var Pie = grace.views.analysisResult.viz.highCharts.Pie = function(dom) {
        Pie.superclass.constructor.apply(this, [dom, 'pie', VizType.PIE]);
    };
    andrea.blink.extend(Pie, grace.views.analysisResult.viz.highCharts.HighChartsBase);

    Pie.prototype.dataConfigArgs = function(dataProvider, dimesionSAs, dataSAs) {
        var turboThreshold = grace.Settings.dataDiscovery.highcharts.turboThreshold.pie;
        return [dataProvider, null, dimesionSAs[0], dataSAs.slice(0, 1), false, turboThreshold];
    };
    Pie.prototype.completeHighConfig = function(highConfig, dataConfig, dataProvider, dimesionSAs, dataSAs) {
        highConfig.xAxis = {
            "title" : {
                "text" : dimesionSAs[0].source.name
            },
            "categories" : dataConfig.categories
        }
        // Edit the common data config
        for (var i = 0; i < dataConfig.series.length; i++) {
            var categories = dataConfig.series[i].data;
            for (var j = 0; j < categories.length; j++) {
                categories[j].y = categories[j].data[0];
            }
        }
        highConfig.series = dataConfig.series;

        highConfig.tooltip = {
            hideDelay : 240
        };        highConfig.plotOptions = {
            "series" : {
                "dataLabels" : {
                    "enabled" : true,
                    "formatter" : function() {
                        return '<b>' + this.point.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                    }
                }
            }
        };

        if (highConfig.series.length > 50) {
            this._addMessage('W001');

            var _this = this;
            _.delay(function() {
                // $(_this._dom).highcharts(highConfig);
                this._removeMessages();
            }, 300);
        } else {
            // $(this._dom).highcharts(highConfig);
        }
    }
})(jQuery);
(function($) {
    var grace = andrea.grace;

    var HighChartsOption = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption;
    var VizType = grace.constants.VizType;

    /**
     * chartType: column, bar, line, area
     * vizType:
     */
    andrea.blink.declare('andrea.grace.views.analysisResult.viz.highCharts.BasicXY');
    var BasicXY = grace.views.analysisResult.viz.highCharts.BasicXY = function(dom, chartType, vizType) {
        BasicXY.superclass.constructor.apply(this, arguments);

        this._chartType = chartType;
        this._vizType = vizType;

        this._isSeriesByDatas = false;
    };
    andrea.blink.extend(BasicXY, grace.views.analysisResult.viz.highCharts.HighChartsBase);

    BasicXY.prototype.dataConfigArgs = function(dataProvider, dimesionSAs, dataSAs) {
        var dataSAs;
        var turboThreshold = grace.Settings.dataDiscovery.highcharts.turboThreshold.xy;
        if (dimesionSAs.length > 1) {
            dataSAs = dataSAs.slice(0, 1);
            return [dataProvider, dimesionSAs[1], dimesionSAs[0], dataSAs, this._isSeriesByDatas, turboThreshold];
        } else {
            dataSAs = dataSAs;
            this._isSeriesByDatas = true
            return [dataProvider, null, dimesionSAs[0], dataSAs, this._isSeriesByDatas, turboThreshold];
        }
    };
    BasicXY.prototype.completeHighConfig = function(highConfig, dataConfig, dataProvider, dimesionSAs, dataSAs) {
        highConfig.xAxis = {};
        if (dimesionSAs && dimesionSAs[0]) {
            highConfig.xAxis.title = {
                'text' : HighChartsOption.saToDisplayAbbr(dimesionSAs[0])
            }
        } else {
            highConfig.xAxis.title = {
                'text' : null
            }
        }
        if (dataConfig.categories) {
            highConfig.xAxis.categories = dataConfig.categories;
            highConfig.xAxis.labels = {
                'rotation' : -45,
                'align' : 'right'
            }
        } else {
            highConfig.xAxis.categories = [''];
        }

        highConfig.yAxis = [];
        var genYAxis = function(dataSA) {
            var title;
            if (!dataSA) {
                title = null;
            } else if (this._vizType === VizType.RADAR) {
                title = null;
            } else {
                title = HighChartsOption.saToDisplay(dataSA);
            }
            return {
                'title' : {
                    'text' : title
                }
            }
        }
        if (this._isSeriesByDatas) {
            for (var i = 0; i < dataSAs.length; i++) {
                var y = genYAxis.call(this, dataSAs[i]);
                y.opposite = i % 2 === 1;
                highConfig.yAxis.push(y);
            }
        } else {
            highConfig.yAxis.push(genYAxis.call(this, dataSAs.length === 1 ? dataSAs[0] : null));
        }
        // Edit the common data config
        for (var i = 0; i < dataConfig.series.length; i++) {
            var series = dataConfig.series[i];
            if (highConfig.yAxis.length === dataConfig.series.length) {
                series.yAxis = i;
            }
            var categories = series.data;
            for (var j = 0; j < categories.length; j++) {
                categories[j].y = categories[j].data[0];
            }
        }
        highConfig.series = dataConfig.series;

        var multiSeries = highConfig.series.length > 1;
        highConfig = _.defaults(highConfig, HighChartsOption.genLegend(multiSeries));

        highConfig.tooltip = {
            headerFormat : '<span style="font-size:10px">{point.key}</span><table>',
            footerFormat : '</table>',
            shared : this._isSeriesByDatas,
            useHTML : true,
            hideDelay : 240
        };
        if (multiSeries) {
            highConfig.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' + '<td style="padding:0"><b>{point.y}</b></td></tr>'
        } else {
            highConfig.tooltip.pointFormat = '<tr>' + '<td style="padding:0"><b>{point.y}</b></td></tr>'
        }
        if (this._vizType) {
            if (this._vizType === VizType.RADAR) {
                highConfig.chart.polar = true;
                highConfig.xAxis.labels = {
                    'rotation' : 0,
                    'align' : 'center'
                }
            } else if (this._vizType === VizType.STACKED_BAR || this._vizType === VizType.STACKED_COLUMN) {
                highConfig.plotOptions = {
                    'series' : {
                        'stacking' : 'normal'
                    }
                }
            }
        }

        var sl = highConfig.series.length;
        var cl = sl > 0 ? highConfig.series[0].data.length : 0;
        var minSize;
        var sizeProp;
        if (VizType.horizontal(this._vizType)) {
            sizeProp = 'width';
        } else if (VizType.vertical(this._vizType)) {
            sizeProp = 'height';
        }
        if (this._vizType === VizType.BAR || this._vizType === VizType.COLUMN) {
            minSize = sl * cl * 12;
        } else if (this._vizType === VizType.STACKED_BAR || this._vizType === VizType.STACKED_COLUMN) {
            minSize = cl * 18;
        } else if (this._vizType === VizType.LINE || this._vizType === VizType.AREA) {
            minSize = sl * 6;
        }
        if (sizeProp && minSize > this._$dom[sizeProp]()) {
            this._$dom[sizeProp](minSize);
        }
    }
})(jQuery);
(function($) {
    var grace = andrea.grace;

    var HighChartsOption = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption;
    var VizType = grace.constants.VizType;
    var ColorUtil = grace.utils.ColorUtil;

    /**
     * chartType: column, bar, line, area
     * vizType
     */
    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.Scatter");
    var Scatter = grace.views.analysisResult.viz.highCharts.Scatter = function(dom, chartType, vizType) {
        Scatter.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(Scatter, grace.views.analysisResult.viz.highCharts.HighChartsBase);

    Scatter.prototype.render = function(dataProvider, dimesionSAs, dataSAs) {
        if (dataSAs.length >= 3) {
            this._chartType = 'bubble'
        } else {
            this._chartType = 'scatter'
        }
        return Scatter.superclass.render.apply(this, arguments);
    };
    Scatter.prototype.dataConfigArgs = function(dataProvider, dimesionSAs, dataSAs) {
        dataSAs = dataSAs.slice(0, 3);
        var turboThreshold = grace.Settings.dataDiscovery.highcharts.turboThreshold.scatter;
        if (dimesionSAs.length === 1) {
            return [dataProvider, null, dimesionSAs[0], dataSAs, false, turboThreshold];
        } else {
            return [dataProvider, dimesionSAs[0], dimesionSAs[1], dataSAs, false, turboThreshold];
        }
    };
    Scatter.prototype.completeHighConfig = function(highConfig, dataConfig, dataProvider, dimesionSAs, dataSAs) {
        var i, j;
        highConfig.xAxis = {
            "title" : {
                "text" : HighChartsOption.saToDisplay(dataSAs[0])
            },
            'startOnTick' : true,
            'endOnTick' : true
        };
        highConfig.yAxis = {};
        var yTitle = dataSAs.length > 1 ? HighChartsOption.saToDisplay(dataSAs[1]) : null;
        highConfig.yAxis.title = {
            'text' : yTitle
        }
        highConfig.yAxis.labels = {
            'enabled' : yTitle !== null
        }

        var pointFormat;
        var array = [];
        if (dimesionSAs.length === 1) {
            array.push('<b>' + HighChartsOption.saToDisplayAbbr(dimesionSAs[0]) + ': </b>{point.name}');
        } else if (dimesionSAs.length === 2) {
            array.push('<b>' + HighChartsOption.saToDisplayAbbr(dimesionSAs[0]) + ': </b>{series.name}');
            array.push('<b>' + HighChartsOption.saToDisplayAbbr(dimesionSAs[1]) + ': </b>{point.name}');
        }
        array.push('    ' + HighChartsOption.saToDisplayAbbr(dataSAs[0]) + ': {point.x}');
        if (dataSAs.length > 1) {
            array.push('    ' + HighChartsOption.saToDisplayAbbr(dataSAs[1]) + ': {point.y}');
        }
        if (dataSAs.length > 2) {
            array.push('    ' + HighChartsOption.saToDisplayAbbr(dataSAs[2]) + ': {point.z}');
        }
        pointFormat = array.join("<br/>");
        var headerFormat;        headerFormat = '';
        // TODO Merge to tooltip
        highConfig.plotOptions = {
            "series" : {
                "tooltip" : {
                    "pointFormat" : pointFormat,
                    "headerFormat" : headerFormat
                }
            }
        };
        highConfig.tooltip = {
            hideDelay : 240
        };
        // Edit the common data config
        var highSeries;
        var highSeriesData;
        var highPoint;
        // Combine serieses, remove category
        // s*n, c*m, d*1 -> s*n, d*m
        highSeries = [];
        var colors = Highcharts.getOptions().colors;
        for ( i = 0; i < dataConfig.series.length; i++) {
            var s = dataConfig.series[i];
            var categories = s.data;
            highSeriesData = [];
            for ( j = 0; j < categories.length; j++) {
                var c = categories[j]
                var d = c.data;
                if (d.length === 1 && d[0] === 0) {
                    continue;
                } else if (d.length === 2 && d[0] === 0 && d[1] === 0) {
                    continue;
                } else if (d.length === 3 && d[0] === 0 && d[1] === 0 && d[2] === 0) {
                    continue;
                }
                highPoint = {
                    'name' : c.name,
                    'x' : d[0],
                    'y' : d[1] != null ? d[1] : 1,
                    'z' : d[2] != null ? d[2] : 1
                }
                highSeriesData.push(highPoint);
            }
            var rgb = ColorUtil.hexToRgb(colors[i % colors.length]);
            highSeries.push({
                'name' : s.name,
                'data' : highSeriesData,
                'color' : 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', .65)'
            })
        }
        highConfig.series = highSeries;        var multiSeries = highConfig.series.length > 1;
        highConfig = _.defaults(highConfig, HighChartsOption.genLegend(multiSeries));

        if (highConfig.series.length > 50 || (highConfig.series.length * highConfig.series[0].data.length > 1000)) {
            this._addMessage('W001');

            _.delay($.proxy(function() {
                // $(this._dom).highcharts(highConfig);
                this._removeMessages();
            }, this), 300);
        } else {
            // $(this._dom).highcharts(highConfig);
        }
    }
})(jQuery);
(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.views.analysisResult.AnalysisResult');

    var VizFactory = grace.views.analysisResult.viz.VizFactory;
    var VizType = grace.constants.VizType;
    var DataProvider = grace.models.DataProvider;
    var FilterUtil = grace.utils.FilterUtil;

    var AnalysisResult = grace.views.analysisResult.AnalysisResult = function(dom) {
        AnalysisResult.superclass.constructor.apply(this, arguments);

        this._$dom = $(dom);
        this._$dom.addClass('grace-result fancy-scrollbar');

        this._renderArgs = null;
    };
    andrea.blink.extend(AnalysisResult, andrea.blink.mvc.View);

    /**
     *
     * @param {Array.<Array.<*>>} dataProvider
     * @param {Array.<ShelvedAnalysis>} dimesionSAs
     * @param {Array.<ShelvedAnalysis>} dataSAs
     */
    AnalysisResult.prototype.render = function(selectedVizType, dataProvider, filterSAs, dimesionSAs, dataSAs) {
        this._renderArgs = arguments;

        // Prepare data
        var clear = function(sa) {
            sa.visualized = false;
            sa.numPartialVisualized = 0;
        }
        _.each(dimesionSAs, clear);
        _.each(dataSAs, clear);

        // Filter
        dataProvider = FilterUtil.filter(dataProvider, filterSAs);
        // Find viz type
        var vizType = null;
        if (dataProvider && dataProvider.numRows === 0) {
            vizType = null;
        } else {
            if (selectedVizType === VizType.RECOMMEND) {
                vizType = this._recommend(dataProvider, dimesionSAs, dataSAs);
            } else {
                if (this._valid(selectedVizType, dataProvider, dimesionSAs, dataSAs)) {
                    vizType = selectedVizType;
                } else {
                    vizType = null;
                }
            }
        }
        // Prepare DOM
        var $viz = $('<div/>').css({
            'height' : this.size().height + 'px'
        });
        // this._$dom.empty().append($viz);
        this._$dom.append($viz);
        // Render viz
        var viz/*VizBase*/ = VizFactory.produce($viz[0], vizType, selectedVizType);
        var success = viz.render(dataProvider, dimesionSAs, dataSAs);
        if (success) {
            while (this._$dom.children().length > 1) {
                this._$dom.children().eq(0).detach();
            }
            // Add scroll bar
            var domSize = this.size();
            var vizSize = viz.size();
            this._$dom.css({
                'overflow-x' : 'hidden',
                'overflow-y' : 'hidden'
            })
            if (vizSize.width > domSize.width) {
                this._$dom.css('overflow-x', 'auto');
            }
            if (vizSize.height > domSize.height) {
                this._$dom.css('overflow-y', 'auto');
            }
        } else {
            while (this._$dom.children().length > 1) {
                this._$dom.children().eq(this._$dom.children().length - 1).detach();
            }
        }
    }
    AnalysisResult.prototype._validateSize = function() {
        var size = this.size();

        this._$dom.css({
            'height' : size.height + 'px',
            'width' : size.width + 'px'
        });

        if (this._renderArgs) {
            this.render.apply(this, this._renderArgs);
        }
    };
    AnalysisResult.prototype._recommend = function(dataProvider, dimesionSAs, dataSAs) {        if (dataSAs.length === 0) {
            return null;
        }
        // Dimension
        var d0, d1;
        // Number unique values
        var l0, l1;
        if (dimesionSAs.length >= 2 && dataSAs.length >= 2) {
            // Dim 2+, Mea 2+
            return VizType.SCATTER;
        } else if (dimesionSAs.length >= 2 && dataSAs.length === 1) {
            // Dim 2+, Mea 1
            d0 = dimesionSAs[0];
            l0 = dataProvider.getCValues(d0.source.index, true, false).length;
            d1 = dimesionSAs[1];
            l1 = dataProvider.getCValues(d1.source.index, true, false).length;
            if (d0.isDateSeries()) {
                return VizType.LINE;
            } else if (l0 < 16 && l1 < 16) {
                return VizType.COLUMN;
            } else if ((l0 * l1) > (40 * 40)) {
                return VizType.SCATTER;
            } else if (l0 > l1) {
                return VizType.STACKED_COLUMN;
            } else {
                return VizType.STACKED_BAR;
            }
        } else if (dimesionSAs.length === 1) {
            // Dim 1
            d0 = dimesionSAs[0];
            l0 = dataProvider.getCValues(d0.source.index, true, false).length;
            if (d0.isDateSeries()) {
                return VizType.LINE;
            } else {
                return VizType.COLUMN;
            }
        } else if (dimesionSAs.length === 0) {
            // Dim 0
            return VizType.BAR;
        }
        return null;
    };

    AnalysisResult.prototype._valid = function(vizType, dataProvider, dimesionSAs, dataSAs) {
        var manifest = VizType.manifest(vizType);
        var required = manifest.required;

        return dimesionSAs.length >= required.numDimensions && dataSAs.length >= required.numMeasures;
    };})(jQuery);
(function($) {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisResult.AnalysisResultMediator");

    var AppConst = grace.constants.AppConst;
    var Log = grace.managers.Log;

    /**
     * App Mediator.
     */
    var AnalysisResultMediator = grace.views.analysisResult.AnalysisResultMediator = function(view) {
        AnalysisResultMediator.superclass.constructor.apply(this, arguments);

        this._view = view;
        this._model = null;
    };

    andrea.blink.extend(AnalysisResultMediator, andrea.blink.mvc.ViewMediator);

    AnalysisResultMediator.prototype.init = function() {
        var _this = this;
        var model = this._model = this._getModel(AppConst.MODEL_GRACE);

        var logFmt = function(shelvedAnalyses) {
            var names = [];
            _.each(shelvedAnalyses, function(sa) {
                names.push(sa.source.name);
            });
            return [shelvedAnalyses.length, names.join('|')].join(',');
        }
        this._subscribe(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED, function(notification) {
            Log.interaction('analysis', [logFmt(model.analysisDimesions()), logFmt(model.analysisDatas()), logFmt(model.analysisFilters())].join(','));
            _this._view.render(model.vizType(), model.dataProvider, model.analysisFilters(), model.analysisDimesions(), model.analysisDatas());

            model.invalidateShelvedAnalysis();
        });
        _this._view.render(model.vizType(), model.dataProvider, model.analysisFilters(), model.analysisDimesions(), model.analysisDatas());
    };
})(jQuery);
(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.views.popUp.VizIconEvent");

    var VizIconEvent = grace.views.popUp.VizIconEvent = function(type, target, data) {
        VizIconEvent.superclass.constructor.apply(this, arguments);

    };
    andrea.blink.extend(VizIconEvent, andrea.blink.events.Event);

    VizIconEvent.CLICK = "click";
})();
(function($) {
    var grace = andrea.grace;
    var VizIconEvent = grace.views.popUp.VizIconEvent;

    andrea.blink.declare("andrea.grace.views.vizNavigator.VizIcon");
    var VizIcon = grace.views.vizNavigator.VizIcon = function(dom, settings) {
        VizIcon.superclass.constructor.apply(this, arguments);

        this._$dom = $(this._dom);

        this._enabled = false;
        this._selected = false;

        this._data = settings.data;

        this._basicClass = settings.basicClass;
        this._enabledClass = settings.enabledClass;
        this._selectedClass = settings.selectedClass;
        // Initialize
        var _this = this;
        this._$dom.addClass(this._basicClass).click(function() {
            _this.dispatchEvent(new VizIconEvent(VizIconEvent.CLICK, _this));
        });

        if (this._data.icon) {
            this._$dom.css({
                'background-image' : 'url("' + this._data.icon + '")'
            });
        } else if (this._data.title) {
            $('<div/>').text(this._data.title).appendTo(this._$dom);
        }

        this._$dom.attr({
            'title' : this._data.title
        });
    };
    andrea.blink.extend(VizIcon, andrea.blink.mvc.View);

    VizIcon.prototype.type = function() {
        return this._data.type;
    };
    VizIcon.prototype.enabled = function(value) {
        if (arguments.length > 0) {
            if (this._enabled !== value) {
                this._enabled = value;

                if (this._enabled) {
                    if (!this.selected()) {
                        this._$dom.addClass(this._enabledClass);
                    } else {
                        this._$dom.removeClass(this._enabledClass);
                    }
                } else {
                    this._$dom.removeClass(this._enabledClass);
                }
            }
            return this;
        } else {
            return this._enabled;
        }
    };
    VizIcon.prototype.selected = function(value) {
        if (arguments.length > 0) {
            if (this._selected !== value) {
                this._selected = value;
                if (this._selected) {
                    this._$dom.addClass(this._selectedClass);
                    this._$dom.removeClass(this._enabledClass);
                } else {
                    this._$dom.removeClass(this._selectedClass);
                    if (this.enabled()) {
                        this._$dom.addClass(this._enabledClass);
                    }
                }
            }
            return this;
        } else {
            return this._selected;
        }
    };

    VizIcon.prototype.update = function(numDimensions, numMeasures) {
        var required = this._data.required;
        this.enabled(numDimensions >= required.numDimensions && numMeasures >= required.numMeasures);
    };
})(jQuery);
(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.views.popUp.VizNavigatorEvent");

    var VizNavigatorEvent = grace.views.popUp.VizNavigatorEvent = function(type, target, data) {
        VizNavigatorEvent.superclass.constructor.apply(this, arguments);

    };
    andrea.blink.extend(VizNavigatorEvent, andrea.blink.events.Event);

    VizNavigatorEvent.VIZ_CHANGED = "vizChanged";
})();
(function($) {
	var grace = andrea.grace;
	var VizIcon = grace.views.vizNavigator.VizIcon;
	var VizIconEvent = grace.views.popUp.VizIconEvent;
	var VizNavigatorEvent = grace.views.popUp.VizNavigatorEvent;
	var VizType = grace.constants.VizType;

	andrea.blink.declare("andrea.grace.views.vizNavigator.VizNavigator");
	var VizNavigator = grace.views.vizNavigator.VizNavigator = function(dom) {
		VizNavigator.superclass.constructor.apply(this, arguments);

		this._$dom = $(this._dom);

		this._selectedType = null;
		this._defaultViewIcon = null;

		var VT = VizType;
		var recommendIcon = VT.manifest(VT.RECOMMEND);
		var groupedIcon = [{
			'title' : '对比',
			'icons' : [VT.manifest(VT.COLUMN), VT.manifest(VT.BAR), VT.manifest(VT.RADAR)]
		}, {
			'title' : '相关性',
			'icons' : [VT.manifest(VT.SCATTER)]
		}, {
			'title' : '趋势',
			'icons' : [VT.manifest(VT.LINE), VT.manifest(VT.AREA)]
		}, {
			'title' : '贡献度',
			'icons' : [VT.manifest(VT.PIE), VT.manifest(VT.STACKED_COLUMN), VT.manifest(VT.STACKED_BAR)]
		}];

		var _this = this;
		this._vizIcons = [];

		var $container = $('<div/>').appendTo(this._$dom).addClass('grace-navigator-contaier');
		// Recommend
		var $recommend = $('<div/>').appendTo($container).addClass('grace-navigator-recommend');
		var $recommendIcon = $('<div/>').appendTo($recommend);
		var viewRecommendIcon = this._defaultViewIcon = new VizIcon($recommendIcon[0], {
			'data' : recommendIcon,
			'basicClass' : 'grace-navigator-recommend-icon',
			'enabledClass' : 'grace-navigator-recommend-icon-enabled',
			'selectedClass' : 'grace-navigator-recommend-icon-selected'
		});
		$('div', viewRecommendIcon.dom()).css('margin-top', '4px');
		this._vizIcons.push(viewRecommendIcon);
		// Selector
		var $selector = $('<div/>').appendTo($container).addClass('grace-navigator-selector');
		var $line;
		$line = $('<div/>').appendTo($selector).addClass('grace-navigator-line');
		this._createGroup($line, groupedIcon[0]);
		this._createGroup($line, groupedIcon[1]);
		$line = $('<div/>').appendTo($container).addClass('grace-navigator-line');
		this._createGroup($line, groupedIcon[2]);
		this._createGroup($line, groupedIcon[3]);
		// Event listener
		var vizIconClickHandler = function(event) {
			_this._select(event.target());
		};
		for (var i = 0; i < this._vizIcons.length; i++) {
			this._vizIcons[i].addEventListener(VizIconEvent.CLICK, vizIconClickHandler);
		}

		viewRecommendIcon.enabled(true);
		this._select(this._defaultViewIcon);	};
	andrea.blink.extend(VizNavigator, andrea.blink.mvc.View);

	VizNavigator.prototype._createGroup = function($line, group) {
		var _this = this;
		$group = $('<div/>').appendTo($line).addClass('grace-navigator-group');

		var $header = $('<h2/>').appendTo($group).addClass('grace-navigator-group-text');
		$header.text(group.title);
		var $icons = $('<div/>').appendTo($group).addClass('grace-navigator-group-icons');

		for (var i = 0; i < group.icons.length; i++) {
			var icon = group.icons[i];
			var $icon = $('<div/>').appendTo($icons);
			var viewIcon = new VizIcon($icon[0], {
				'data' : icon,
				'basicClass' : 'grace-navigator-group-icon',
				'enabledClass' : 'grace-navigator-group-icon-enabled',
				'selectedClass' : 'grace-navigator-group-icon-selected'
			});

			this._vizIcons.push(viewIcon);
		}
	};
	VizNavigator.prototype.selectedType = function() {
		return this._selectedType;
	}
	VizNavigator.prototype._select = function(targetVizIcon) {
		if (!targetVizIcon.enabled() || targetVizIcon.selected()) {
			return;
		}
		this._selectedType = targetVizIcon.type();

		_.each(this._vizIcons, function(vizIcon) {
			vizIcon.selected(vizIcon === targetVizIcon);
		});
		this.dispatchEvent(new VizNavigatorEvent(VizNavigatorEvent.VIZ_CHANGED, this));
	};
	VizNavigator.prototype.update = function(numDimensions, numMeasures) {
		var _this = this;
		_.each(this._vizIcons, function(vizIcon) {
			var oldSelected = vizIcon.selected();

			vizIcon.update(numDimensions, numMeasures);
			var newEnabled = vizIcon.enabled();
			// if (oldSelected && !newEnabled) {
			// _.defer(function() {
			// _this._select(_this._defaultViewIcon);
			// })
			// }
		});
	};
})(jQuery);
(function($) {

    var grace = andrea.grace;

    var VizNavigatorEvent = grace.views.popUp.VizNavigatorEvent;
    var AppConst = grace.constants.AppConst;

    /**
     * App Mediator.
     */
    andrea.blink.declare("andrea.grace.views.vizNavigator.VizNavigatorMediator");
    var VizNavigatorMediator = grace.views.vizNavigator.VizNavigatorMediator = function(view) {
        VizNavigatorMediator.superclass.constructor.apply(this, arguments);

        this._view = view;
        this._model = null;
    };

    andrea.blink.extend(VizNavigatorMediator, andrea.blink.mvc.ViewMediator);

    VizNavigatorMediator.prototype.init = function() {
        var _this = this;
        var model = this._model = this._getModel(AppConst.MODEL_GRACE);

        this._view.addEventListener(VizNavigatorEvent.VIZ_CHANGED, function(event) {
            _this._action(AppConst.ACTION_RUN_ANALYSIS, {
                'vizType' : _this._view.selectedType()
            });
        }, this);
        this._subscribe(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED, function(notification) {
            _this._view.update(model.analysisDimesions().length, model.analysisDatas().length);        });
    }
})(jQuery);
(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.DataDiscovery");

    var App = andrea.blink.mvc.App;
    var AppConst = grace.constants.AppConst;

    var DataDiscovery = grace.DataDiscovery = function(div) {
        DataDiscovery.superclass.constructor.apply(this, arguments);

        this._div = div;
        this._$dom = $(div);

        this._viewSourceDim = null;
        this._viewSourceMea = null;

        this._viewDesDimensionShelf = null;
        this._viewDesMeasureShelf = null;
        this._viewFilterShelf = null;

        this._viewAnalysisResult = null;

        this._viewVizNavigator = null;

        this._applyHighSettings();
        this._startup();
    };
    andrea.blink.extend(DataDiscovery, andrea.blink.mvc.View);

    DataDiscovery.prototype._applyHighSettings = function() {
        Highcharts.setOptions({
            'chart' : {
                'style' : {
                    'fontFamily' : 'Trebuchet MS, Verdana, sans-serif, FontAwesome'
                }
            }
        });
    }
    /**
     *
     * @param {Object} rows [
     * 	[cell1, cell2, ...],
     * 	...
     * ]
     *
     * @param {Object} columnDescriptors [{
     * 		"name": columnName1, // Optional
     * 		"converterType": columnConverterType1, // Optional
     * 		"analysisType": columnAnalysisType1 // Optional
     * 	},
     * 	...
     * ]
     *
     */
    DataDiscovery.prototype.rowBasedDataProvider = function(rows, columnDescriptors, source) {
        this._apiMediator.rowBasedDataProvider(rows, columnDescriptors, source);
    };

    DataDiscovery.prototype._startup = function() {
        var app = new App();

        var view = null;
        var mediator = null;

        this._viewSourceDim = new grace.views.analysisContainer.source.SrcDimensionShelf($("#divSrcDim")[0]);
        this._viewSourceMea = new grace.views.analysisContainer.source.SrcMeasureShelf($("#divSrcMea")[0]);

        this._viewDesDimensionShelf = new grace.views.analysisContainer.destination.DesDimensionShelf($("#divDesAnalysisDim")[0]);
        this._viewDesMeasureShelf = new grace.views.analysisContainer.destination.DesMeasureShelf($("#divDesAnalysisMea")[0]);
        this._viewFilterShelf = new grace.views.analysisContainer.processor.FilterShelf($("#divProcFilter")[0]);

        this._viewAnalysisResult = new grace.views.analysisResult.AnalysisResult($("#divAnalysisResult")[0]);

        this._viewVizNavigator = new grace.views.vizNavigator.VizNavigator($("#divVizNavigator")[0]);
        // Models
        app.registerModel(AppConst.MODEL_GRACE, new grace.models.DataDiscoveryModel());

        // Actions
        app.registerAction(AppConst.ACTION_CHANGE_DATA_PROVIDER, grace.actions.ChangeDataProviderAction);
        app.registerAction(AppConst.ACTION_RUN_ANALYSIS, grace.actions.RunAnalysisAction);

        // Views
        // var appView = this._appView = new grace.views.analysisContainer.AppView(this._div);

        // Mediators
        mediator = new grace.DataDiscoveryMediator();
        app.registerViewMediator(AppConst.MEDIATOR_DATA_DISCOVERY, mediator);
        this._apiMediator = mediator;

        mediator = new grace.views.analysisContainer.source.SrcDimensionShelfMediator(this._viewSourceDim);
        app.registerViewMediator(AppConst.MEDIATOR_ANALYSIS_SRC_DIM, mediator);
        mediator = new grace.views.analysisContainer.source.SrcMeasureShelfMediator(this._viewSourceMea);
        app.registerViewMediator(AppConst.MEDIATOR_ANALYSIS_SRC_MEA, mediator);

        mediator = new grace.views.analysisContainer.destination.DesDimensionShelfMediator(this._viewDesDimensionShelf);
        app.registerViewMediator(AppConst.MEDIATOR_ANALYSIS_DES_DIM, mediator);
        mediator = new grace.views.analysisContainer.destination.DesMeasureShelfMediator(this._viewDesMeasureShelf);
        app.registerViewMediator(AppConst.MEDIATOR_ANALYSIS_DES_MEA, mediator);
        mediator = new grace.views.analysisContainer.processor.FilterShelfMediator(this._viewFilterShelf);
        app.registerViewMediator(AppConst.MEDIATOR_ANALYSIS_DES_MEA, mediator);

        mediator = new grace.views.analysisResult.AnalysisResultMediator(this._viewAnalysisResult);
        app.registerViewMediator(AppConst.MEDIATOR_ANALYSIS_RESULT, mediator);

        mediator = new grace.views.vizNavigator.VizNavigatorMediator(this._viewVizNavigator);
        app.registerViewMediator(AppConst.MEDIATOR_VIZ_NAVIGATOR, mediator);

        var _this = this;
        var invalidateSize = false;
        $(window).resize(function() {
            if (!invalidateSize) {
                setTimeout(function() {
                    invalidateSize = false;
                    _this._validateSize();
                }, 1000 / 24);
            }
            invalidateSize = true;
        });
        this._validateSize();
    };

    DataDiscovery.prototype._validateSize = function() {
        var $div;
        var w, h;
        // Main
        var marginBody = parseInt($("body").css("margin"));
        var windowHeight = $(window).height() - marginBody * 2;
        var windowWidth = $(window).width() - marginBody * 2;

        var $header = $('#divHeader', this._$dom);
        var $footer = $('#divFooter', this._$dom);
        var $main = $('#divMain', this._$dom);
        // vMargin = parseInt($main.css("margin-top")) + parseInt($main.css("margin-bottom"));
        var mainHeight = windowHeight - $header.outerHeight() - $footer.outerHeight() - $main.vMargin();
        var mainWidth = windowWidth - $main.hMargin();
        $main.css({
            "height" : mainHeight + "px",
            "width" : mainWidth + "px"
        });

        // Col1: source dim, source mea
        var column1Width = 172;
        $("#divCol1").css({
            "width" : column1Width + "px",
            "height" : mainHeight + "px"
        });

        $div = $(this._viewSourceDim.dom());
        var vGap = parseInt($(this._viewSourceDim.dom()).css("margin-bottom"));
        this._viewSourceDim.size({
            "width" : column1Width,
            "height" : (mainHeight - vGap) / 2 + vGap - $div.vPadding() - 6
        });
        this._viewSourceMea.size({
            "width" : column1Width,
            "height" : (mainHeight - vGap) / 2 + vGap - $div.vPadding() - 6
        });

        // Col2: proc filter, des marker
        var column2Width = 142;
        $("#divCol2").css({
            "width" : column2Width + "px",
            // "height" : 300 + "px"
        });
        this._viewFilterShelf.size({
            "height" : 228
        });

        // Col3: proc filter, des marker
        w = mainWidth - $("#divCol1").layoutWidth() - $("#divCol2").layoutWidth();
        $("#divCol3").css({
            "width" : w + "px",
            "height" : mainHeight + "px"
        });

        var $divNavigator = $('#divVizNavigator', this._$dom);

        var $divDestinations = $('#divDestinations', this._$dom);
        $divDestinations.css({
            'width' : Math.min(1024, w - $divNavigator.width() - parseInt($divDestinations.css('margin-right'))) + 'px'
        });

        this._viewDesDimensionShelf.size({
            "height" : 35 + 34 * 1 - 6
        });
        this._viewDesMeasureShelf.size({
            "height" : 35 + 34 * 1 - 6
        });
        this._viewAnalysisResult.size({
            "height" : mainHeight - (35 + 34 * 1) * 2
        });
    };
    DataDiscovery.prototype._createChildDiv = function(parent) {
        var div = document.createElement('div');
        if (parent) {
            $(div).appendTo(parent);
        }

        return div;
    };
})();
(function($) {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.DataDiscoveryMediator");

    var AppConst = grace.constants.AppConst;
    /**
     * App Mediator.
     */
    var DataDiscoveryMediator = andrea.grace.DataDiscoveryMediator = function() {
        DataDiscoveryMediator.superclass.constructor.apply(this, arguments);
    };

    andrea.blink.extend(DataDiscoveryMediator, andrea.blink.mvc.ViewMediator);

    DataDiscoveryMediator.prototype.rowBasedDataProvider = function(rows, columnDescriptors, source) {
        this._action(AppConst.ACTION_CHANGE_DATA_PROVIDER, {
            'rows' : rows,
            'columnDescriptors' : columnDescriptors,
            'source' : source
        });
    };

})(jQuery);
(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.views.analysisContainer.events.DataSourceEvent");

    var DataSourceEvent = grace.views.analysisContainer.events.DataSourceEvent = function(type, target, data) {
        DataSourceEvent.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(DataSourceEvent, andrea.blink.events.Event);

    DataSourceEvent.DATA_SOURCE_READY = "dataSourceReady";
})();
(function() {
    var grace = andrea.grace;
    var MoreButton = grace.views.components.MoreButton;
    var DataSourceEvent = grace.views.analysisContainer.events.DataSourceEvent;
    var URLUtil = grace.utils.URLUtil;
    var AnalysisType = grace.constants.AnalysisType;
    var Taobao = grace.constants.Taobao;
    var ConverterType = grace.utils.ConverterType;
    var Loading = grace.views.popUp.Loading;
    var Stopwatch = grace.utils.Stopwatch;
    var Log = grace.managers.Log;

    andrea.blink.declare('andrea.grace.DataSource');
    var DataSource = grace.DataSource = function(div) {
        DataSource.superclass.constructor.apply(this, arguments);

        this._$main = $('#divDataSourceMain', this._$dom);
        this._$main.empty();

        this._loading = null;

        this._btnAnalysis = null;
        this._$btnAnalysis = null;

        this._watch
        this._cdaReady = false;
        this._cdsNumTrades = 0;

        this._dp = null;

        // Create container
        var $container = this._genCell(0, 0, 3, 2).addClass('grace-dataSource-main-container').appendTo(this._$main);
        $container.css({
            'position' : 'absolute',
            'left' : (this._$main.width() - $container.width()) / 2,
            'top' : (this._$main.height() - $container.height()) / 2
        });

        if ($.browser.webkit) {
            // Chrome, Safari
            this._createChildren($container);
        } else {
            // Browser fail
            var $chrome = this._genCell(0, 0, 3, 2).appendTo($container);
            $chrome.text('请通过谷歌浏览器使用易分析！').addClass('grace-dataSource-chrome')
            $chrome.css('line-height', $chrome.height() + 'px');
            $chrome.on('click', $.proxy(function(event) {
                window.location = grace.Settings.chrome.localURL
            }, this));
            var $download = $('<a/>').appendTo($container).addClass('grace-dataSource-chrome-official');
            $download.text('官方下载…').css('color', '#ffffff');
            $download.attr({
                'target' : '_blank',
                'href' : grace.Settings.chrome.officialURL
            }).on('click', function(event) {
                event.stopPropagation();
            });
        }
        // Parse URL
        var hashPairs = URLUtil.hashPairs();
        if (hashPairs.dataSource === 'taobao') {
            this._gotoTaobao();
        }
    };
    andrea.blink.extend(DataSource, andrea.blink.mvc.View);

    DataSource.prototype._gotoTaobao = function() {
        var hashPairs = URLUtil.hashPairs();
        var cdaSettings = grace.Settings.crossDomainAccessor;

        if (hashPairs.access_token && hashPairs.taobao_user_id && hashPairs.taobao_user_nick) {
            // Taobao OAuth redirect
            this._watch = new Stopwatch([hashPairs.taobao_user_id, hashPairs.taobao_user_nick].join(','), true);
            this._addLoading('', 0);
            this._getCrossDomainAccessor($.proxy(function(cda) {
                cda.setAccessToken(hashPairs.access_token);
                var fields = [];
                for (var i = 0; i < this._dp.columnDescriptors.length; i++) {
                    fields.push(this._dp.columnDescriptors[i].id)
                }
                Log.interaction('dataSource', ['taobao', hashPairs.taobao_user_id, hashPairs.taobao_user_nick].join(','));
                cda.load(cdaSettings.taobao.trade.maxResults, fields.join(','));
                Log.performance('loadTaobaoTrades', [this._watch.type, 'loadSWF', this._watch.lap()].join(','));
            }, this));
        } else if (hashPairs.error) {
            Log.interaction('authorizeError', [hashPairs.error, hashPairs.error_description.replace(/,/g, '|')]);
            if (hashPairs.error === 'invalid_client') {
                var shop = prompt('留下您的 店铺。(店铺网址/店铺名称 均可)\n应用尚未正式发布需要手动设置授权。');
                var contact = prompt('留下您的 联系方式。以便完成授权之后通知您。\n(邮箱/QQ/微博 均可)');
                Log.interaction('authorize', [shop, contact]);
                if (shop && contact) {
                    alert('您的店铺已保存，完成授权预计需要一天，请稍候。\n完成后会通知到您。');
                } else if (shop) {
                    alert('您的店铺已保存，完成授权预计需要一天，请稍候。');
                }
            }
        } else {
            // Taobao OAuth
            var urlVariables = [];
            urlVariables.push(['client_id', cdaSettings.taobao.appKey].join('='));
            urlVariables.push(['response_type', 'token'].join('='));
            urlVariables.push(['redirect_uri', cdaSettings.taobao.redirect + '?dataSource=taobao'].join('='));
            window.location.href = 'https://oauth.taobao.com/authorize?' + urlVariables.join('&');
        }
    };
    DataSource.prototype.destroy = function() {
        this._loading.close();
    }
    DataSource.prototype.faHoverHandler = function(hover) {
        if (hover) {
            this._btnAnalysis.showP2();
        } else {
            this._btnAnalysis.showP1();
        }
    };
    DataSource.prototype.faClickHandler = function(hover) {
        this._addLoading();
    };
    DataSource.prototype.faCancelHandler = function() {
        this._removeLoading();
    };

    DataSource.prototype.faDataHandler = function(name, rows, columnDescriptors) {
        // Write some log for eg
        if (grace.Settings.debug.egJS) {
            var egJS = grace.Settings.debug.egJS;
            var lines = [];
            lines.push('(function() {');
            lines.push('var grace = andrea.grace;');
            lines.push('andrea.blink.declare("andrea.grace.eg.' + egJS + '");');
            lines.push('var ' + egJS + ' = grace.eg.' + egJS + ' = function() {');
            lines.push('this.columnDescriptors = \'' + columnDescriptors.replace(/\'/g, '\\\'') + '\';');
            lines.push('this.rows = \'' + rows.replace(/\'/g, '\\\'') + '\';');
            lines.push('}');
            lines.push('})();');
            console.log(lines.join('\n'));
        }
        Log.interaction('dataSource', ['file', this._decode(name)].join(','));
        this._stringDataHandler(rows, columnDescriptors);
    };
    DataSource.prototype.cdaReadyHandler = function() {
        this._cdaReady = true;

        var columnDescriptors = [];
        var genColumn = function(id, name, converterType, analysisType) {
            return {
                'id' : id,
                'name' : name,
                'converterType' : converterType,
                'analysisType' : analysisType
            }
        }
        columnDescriptors.push(genColumn('status', '交易状态', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('type', '交易类型', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('created', '交易创建时间', ConverterType.DATE, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('buyer_nick', '买家昵称', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('receiver_state', '收货人省份', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('receiver_city', '收货人城市', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('has_yfx', '包含运费险', ConverterType.BOOLEAN, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('shipping_type', '物流方式', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('trade_from', '交易来源', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('orders.title', '商品标题', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('orders.logistics_company', '快递公司', ConverterType.STRING, AnalysisType.DIMENSION));

        columnDescriptors.push(genColumn('orders.price', '商品价格', ConverterType.NUMBER, AnalysisType.MEASURE));
        columnDescriptors.push(genColumn('orders.num', '购买数量', ConverterType.NUMBER, AnalysisType.MEASURE));
        columnDescriptors.push(genColumn('orders.total_fee', '应付金额', ConverterType.NUMBER, AnalysisType.MEASURE));
        this._dp = {
            'rows' : [],
            'columnDescriptors' : columnDescriptors,
            'source' : 'taobao'
        };
    };
    DataSource.prototype.cdaDataHandler = function(response) {
        Log.performance('loadTaobaoTrades', [this._watch.type, 'loadData', this._watch.lap()].join(','));
        var i, j, k;
        response = this._decode(response);
        var trades = response.trades_sold_get_response.trades.trade;
        var rows = this._dp.rows;
        var columnDescriptors = this._dp.columnDescriptors;
        this._cdsNumTrades += trades.length;
        for ( i = 0; i < trades.length; i++) {
            var t = trades[i];
            var orders = t.orders.order;
            for ( j = 0; j < orders.length; j++) {
                var o = orders[j];
                var row = [];
                for ( k = columnDescriptors.length - 1; k >= 0; k--) {
                    var cd = columnDescriptors[k];
                    var id = cd.id;
                    var path = id.split('.');
                    if (path[0] === 'orders') {
                        id = path[1];
                        row[k] = Taobao.toCaption(o[id], 'order', id);
                    } else {
                        id = path[0];
                        row[k] = Taobao.toCaption(t[id], 'trade', id);
                    }
                }
                rows.push(row);
            }
        }

        var cdaSettings = grace.Settings.crossDomainAccessor;
        var dataPercent = this._cdsNumTrades / Math.min(cdaSettings.taobao.trade.maxResults, response.trades_sold_get_response.total_results);
        this._loading.percent(dataPercent);
    };
    DataSource.prototype.cdaCompleteHandler = function() {
        Log.performance('loadTaobaoTrades', [this._watch.type, 'loadComplete', this._watch.lap(true), this._watch.total()].join(','));
        this._dpReady();
    };
    DataSource.prototype._getCrossDomainAccessor = function(callback) {
        var check = $.proxy(function() {
            var $cda = $('#CrossDomainAccessor');
            if ($cda[0] && this._cdaReady) {
                callback($cda[0]);
            } else {
                _.delay(check, 500);
            }
        }, this);
        check();
    }
    DataSource.prototype._stringDataHandler = function(rows, columnDescriptors) {
        this._dp = {
            'rows' : _.isString(rows) ? this._decode(rows) : rows,
            'columnDescriptors' : _.isString(columnDescriptors) ? this._decode(columnDescriptors) : columnDescriptors,
            'source' : 'excel'
        };
        this._dpReady();
    };
    DataSource.prototype._encode = function(o) {
        var s = JSON.stringify(o);
        s = s.replace(/%/g, '%25');
        s = s.replace(/\\/g, '%5C');
        s = s.replace(/\"/g, '%22');
        return s;
    };
    DataSource.prototype._decode = function(s) {
        s = s.replace(/%22/g, '\"');
        s = s.replace(/%5C/g, '\\');
        s = s.replace(/%25/g, '%');
        return JSON.parse(s);
    };
    DataSource.prototype._addLoading = function(label, percent) {
        this._loading = new Loading($('<div/>'), label, percent);
        this._loading.open(this._$main, true);
    };
    DataSource.prototype._removeLoading = function() {
        this._loading.close();
    };

    DataSource.prototype._loadEg = function(jsPath, jsClassName) {
        this._addLoading();
        LazyLoad.js([jsPath], $.proxy(function() {
            var eg = new grace.eg[jsClassName]();
            Log.interaction('dataSource', ['sample', jsClassName].join(','));
            this._stringDataHandler(eg.rows, eg.columnDescriptors);
        }, this));
    };
    DataSource.prototype._dpReady = function() {
        this.dispatchEvent(new DataSourceEvent(DataSourceEvent.DATA_SOURCE_READY, this, this._dp));
    };
    DataSource.prototype._createChildren = function($container) {
        var $swf;
        var w, h;
        // Analysis excel
        var $btnAnalysis = this._$btnAnalysis = this._createButtonAnalysis(this._genCell(0, 0, 2, 1), $container);

        $swf = $('<div/>').appendTo($container);
        w = $btnAnalysis.width();
        h = $btnAnalysis.height();
        var faSettings = grace.Settings.fileAccessor;
        this._embedFlash($('<div/>').appendTo($swf), faSettings.name, faSettings.swfURL, 'transparent', w, h, {
            'alpha' : 0,
            'width' : w,
            'height' : h,
            'hoverCallback' : 'andrea.grace.Grace.faHoverCallback',
            'clickCallback' : 'andrea.grace.Grace.faClickCallback',
            'cancelCallback' : 'andrea.grace.Grace.faCancelCallback',
            'dataCallback' : 'andrea.grace.Grace.faDataCallback',
            'logFileURL' : grace.Settings.logFile.url
        });
        $swf.css({
            'z-index' : 10000,
            'position' : 'absolute',
            'left' : parseFloat($btnAnalysis.css('left')) + 1,
            'top' : parseFloat($btnAnalysis.css('top')) + 1,
            'width' : w,
            'height' : h
        });
        // Taobao
        var cdaSettings = grace.Settings.crossDomainAccessor;
        this._createButton(this._genCell(0, 1, 1, 1), $container, {
            'color' : '#ff692f',
            'captions' : ['淘宝', '销售分析'],
            'description' : '分析卖家的近3个月销售数据。'
        }).on('click', $.proxy(function(event) {
            this._gotoTaobao();
        }, this));
        $swf = $('<div/>').appendTo($container);
        w = h = 1;
        this._embedFlash($('<div/>').appendTo($swf), cdaSettings.name, cdaSettings.swfURL, 'window', w, h, {
            'readyCallback' : 'andrea.grace.Grace.cdaReadyCallback',
            'dataCallback' : 'andrea.grace.Grace.cdaDataCallback',
            'completeCallback' : 'andrea.grace.Grace.cdaCompleteCallback'
        });
        $swf.css('visibility', 'hidden');
        // Customize data source
        this._createButton(this._genCell(1, 1, 1, 1), $container, {
            'color' : '#3498db',
            'captions' : ['定制', '我的数据源…'],
            'description' : '创建专属于您的数据源。请邮件至andiris29@gmail.com'
        }).on('click', $.proxy(function(event) {
            window.location.href = 'mailto:andiris29@gmail.com?subject=添加定制数据源&body=<请描述您的数据源（如数据库地址、网页地址等）。作者会在至多2个工作日内给您回复。';
        }, this));
        // Eg 1
        this._createButton(this._genCell(2, 0, 1, 1), $container, {
            'name' : 'SuperMarket',
            'color' : '#e74c3c',
            'captions' : ['样例', '超市销售'],
            'description' : '时间、空间、产品、客户等多维度查看及分析超市的销售状况。',
            'link' : {
                'text' : '下载数据…',
                'url' : grace.Settings.data.superMarket.excel
            }
        }).on('click', $.proxy(function(event) {
            this._loadEg(grace.Settings.data.superMarket.js, 'SuperMarket');
        }, this));
        // Eg 2
        this._createButton(this._genCell(2, 1, 1, 1), $container, {
            'color' : '#e74c3c',
            'captions' : ['样例', '世界银行'],
            'description' : '世界银行公布的各国数据指标。涵盖股市、金融、商业等。',
            'link' : {
                'text' : '下载数据…',
                'url' : grace.Settings.data.worldBank.excel
            }
        }).on('click', $.proxy(function(event) {
            this._loadEg(grace.Settings.data.worldBank.js, 'WorldBank');
        }, this));
    };
    DataSource.prototype._genCell = function(x, y, w, h) {
        var gap = {
            'horizontal' : 30,
            'vertical' : 20
        };
        var cell = {
            'width' : 160,
            'height' : 100
        };
        var $div = $('<div/>');
        $div.css({
            'width' : cell.width * w + gap.horizontal * (w - 1) + 'px',
            'height' : cell.height * h + gap.vertical * (h - 1) + 'px',
            'left' : x * (cell.width + gap.horizontal) + 'px',
            'top' : y * (cell.height + gap.vertical) + 'px'
        });
        return $div;
    };
    DataSource.prototype._embedFlash = function($ph, name, swfURL, wmode, w, h, flashvars) {
        var uid = _.uniqueId('flashContent_');

        var params = {};
        params.quality = 'high';
        params.bgcolor = '#ffffff';
        params.allowscriptaccess = 'sameDomain';
        params.allowfullscreen = 'true';
        params.wmode = wmode;
        var attributes = {};
        attributes.id = name;
        attributes.name = name;
        attributes.align = 'middle';

        $ph.attr('id', uid);
        swfobject.embedSWF(swfURL, uid, w, h, '11.0.0', null, flashvars, params, attributes);
    };

    DataSource.prototype._createButtonAnalysis = function($cell, $parent) {
        var $dom = $cell.addClass('grace-dataSource-main-analysis');
        var $more = $('<div/>').appendTo($dom).addClass('grace-dataSource-main-analysis-more');
        // P1
        var $p1 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-analysis-p1').css('line-height', $cell.height() + 'px');
        $('<span/>').appendTo($p1).text('数据文件');
        // P2
        var $p2 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-analysis-p2');
        $('<div/>').appendTo($p2).addClass('grace-dataSource-main-analysis-p2-ribbon');
        $('<div/>').appendTo($p2).addClass('grace-dataSource-main-analysis-p2-text').text('分析数据文件').css('line-height', $cell.height() + 'px');
        var $type = $('<div/>').appendTo($p2).addClass('grace-dataSource-main-analysis-p2-type');
        $('<div/>').appendTo($type).addClass('grace-dataSource-main-analysis-p2-type-icon');
        $('<div/>').appendTo($type).addClass('grace-dataSource-main-analysis-p2-type-text').text('2007,2003,CSV');
        // More button
        this._btnAnalysis = new MoreButton($more[0]);

        $dom.appendTo($parent);
        return $dom;
    };
    /**
     *
     * @param {Object} settings {
     * 	   color,
     *     caption,
     *     description
     * }
     */
    DataSource.prototype._createButton = function($cell, $parent, settings) {
        var $dom = $cell.addClass('grace-dataSource-main-example').appendTo($parent);
        var $more = $('<div/>').appendTo($dom).addClass('grace-dataSource-main-example-more');
        // P1
        var $p1 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-example-p1').css('background-color', settings.color);
        var $caption = $('<div/>').appendTo($p1).addClass('grace-dataSource-main-example-p1-caption');
        _.each(settings.captions, function(caption) {
            $('<span/>').appendTo($caption).text(caption);
            $('<br/>').appendTo($caption).css('line-height', 30 + 'px');
        });
        $caption.children().last().detach();
        $caption.css({
            'top' : ($cell.height() - $caption.height()) / 2,
            'left' : ($cell.width() - $caption.width()) / 2
        })
        // P2
        var $p2 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-example-p2');
        $('<div/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-ribbon').css('background-color', settings.color);
        $('<div/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-icon');
        $('<div/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-text').text(settings.description);

        if (settings.link) {
            var $download = $('<a/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-download');
            $download.text(settings.link.text).css('color', settings.color);
            $download.attr({
                'target' : '_blank',
                'href' : settings.link.url,
                'title' : '右键，另存为…'
            });
            $download.on('click', function(event) {
                event.stopPropagation();
            });
        }
        // More button
        new MoreButton($more[0]);

        return $dom;
    };
})();
(function() {
    var grace = andrea.grace;
    var PageTransition = grace.helpers.PageTransition;
    var DataSourceEvent = grace.views.analysisContainer.events.DataSourceEvent;
    var Log = grace.managers.Log;
    var URLUtil = grace.utils.URLUtil;

    andrea.blink.declare("andrea.grace.Grace");
    var Grace = grace.Grace = function(dependencyFiles) {
        var hashPairs = URLUtil.hashPairs();
        Log.user = hashPairs.andrea_user ? hashPairs.andrea_user : 'user';
        Log.interaction('open', JSON.stringify($.browser));
        // Static
        Grace._instance = this;

        $($.proxy(function() {
            // Load dependency js files for DataDiscovery
            LazyLoad.js(dependencyFiles, $.proxy(this._jsReady, this));
            //
            this._$dataSource = $('#divDataSource');
            this._$dataDiscovery = $("#divDataDiscovery");
            $('#divMain', this._$dataDiscovery).bind("selectstart", function() {
                return false;
            });

            var dataSource = this._dataSource = new grace.DataSource(this._$dataSource[0]);
            dataSource.addEventListener(DataSourceEvent.DATA_SOURCE_READY, this._dataSourceDataSourceReadyHandler, this);
        }, this));

        this._dataSource = null;
        this._$dataSource = null;
        this._$dataDiscovery = null;

        this._lazyLoading = true;
        this._dp = null;

    };
    // ------------------------------------
    // Static for flash
    // ------------------------------------
    Grace._instance = null;

    Grace._flashCallback = function(context, handler, args) {
        _.defer($.proxy(function() {
            this[handler].apply(this, arguments[0]);
        }, context), args);
    };
    // File accessor callbacks
    Grace.faHoverCallback = function(hover) {
        Grace._flashCallback(Grace._instance._dataSource, 'faHoverHandler', arguments);
    };
    Grace.faClickCallback = function(hover) {
        Grace._flashCallback(Grace._instance._dataSource, 'faClickHandler', arguments);
    };
    Grace.faCancelCallback = function(rows, columnDescriptors) {
        Grace._flashCallback(Grace._instance._dataSource, 'faCancelHandler', arguments);
    };
    Grace.faDataCallback = function(rows, columnDescriptors) {
        Grace._flashCallback(Grace._instance._dataSource, 'faDataHandler', arguments);
        return true;
    };
    // Cross domain accessor callbacks
    Grace.cdaReadyCallback = function() {
        Grace._flashCallback(Grace._instance._dataSource, 'cdaReadyHandler', arguments);
    };
    Grace.cdaDataCallback = function(response) {
        Grace._flashCallback(Grace._instance._dataSource, 'cdaDataHandler', arguments);
    };
    Grace.cdaCompleteCallback = function() {
        Grace._flashCallback(Grace._instance._dataSource, 'cdaCompleteHandler', arguments);
    };
    // ------------------------------------
    // Private methods
    // ------------------------------------
    // Goto DataDiscovery
    Grace.prototype._dataSourceDataSourceReadyHandler = function(event) {
        this._dp = event.data;
        this._gotoDataDiscovery();
    }
    Grace.prototype._jsReady = function() {
        this._lazyLoading = false;
        this._gotoDataDiscovery();
    };
    Grace.prototype._gotoDataDiscovery = function() {
        if (!this._dp) {
            return;
        }
        if (this._lazyLoading) {
            return;
        }
        this._dataSource.destroy();
        // Draw data discovery
        var dataDiscovery = new grace.DataDiscovery(this._$dataDiscovery[0]);
        dataDiscovery.rowBasedDataProvider(this._dp.rows, this._dp.columnDescriptors, this._dp.source);

        // Play animation
        var pt = new PageTransition({
            '$page' : this._$dataSource,
            'classes' : ['pt-page-scaleDownCenter']
        }, {
            '$page' : this._$dataDiscovery,            'classes' : ['pt-page-scaleUpCenter'],
            'delay' : 180
        }, $.proxy(function() {
            this._$dataSource.css('z-index', -1);
        }, this));
        _.defer(function() {
            pt.play();
        });
    };
})();
