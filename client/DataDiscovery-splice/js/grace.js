/* Modernizr 2.7.1 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-touch-teststyles-prefixes
 */
;window.Modernizr=function(a,b,c){function v(a){i.cssText=a}function w(a,b){return v(l.join(a+";")+(b||""))}function x(a,b){return typeof a===b}function y(a,b){return!!~(""+a).indexOf(b)}function z(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:x(f,"function")?f.bind(d||b):f}return!1}var d="2.7.1",e={},f=b.documentElement,g="modernizr",h=b.createElement(g),i=h.style,j,k={}.toString,l=" -webkit- -moz- -o- -ms- ".split(" "),m={},n={},o={},p=[],q=p.slice,r,s=function(a,c,d,e){var h,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:g+(d+1),l.appendChild(j);return h=["&#173;",'<style id="s',g,'">',a,"</style>"].join(""),l.id=g,(m?l:n).innerHTML+=h,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=f.style.overflow,f.style.overflow="hidden",f.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),f.style.overflow=k),!!i},t={}.hasOwnProperty,u;!x(t,"undefined")&&!x(t.call,"undefined")?u=function(a,b){return t.call(a,b)}:u=function(a,b){return b in a&&x(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=q.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(q.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(q.call(arguments)))};return e}),m.touch=function(){var c;return"ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch?c=!0:s(["@media (",l.join("touch-enabled),("),g,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(a){c=a.offsetTop===9}),c};for(var A in m)u(m,A)&&(r=A.toLowerCase(),e[r]=m[A](),p.push((e[r]?"":"no-")+r));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)u(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof enableClasses!="undefined"&&enableClasses&&(f.className+=" "+(b?"":"no-")+a),e[a]=b}return e},v(""),h=j=null,e._version=d,e._prefixes=l,e.testStyles=s,e}(this,this.document);/*jslint browser: true, eqeqeq: true, bitwise: true, newcap: true, immed: true, regexp: false */

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
/*! Video.js v4.3.0 Copyright 2013 Brightcove, Inc. https://github.com/videojs/video.js/blob/master/LICENSE */ (function() {var b=void 0,f=!0,h=null,l=!1;function m(){return function(){}}function p(a){return function(){return this[a]}}function s(a){return function(){return a}}var t;document.createElement("video");document.createElement("audio");document.createElement("track");function u(a,c,d){if("string"===typeof a){0===a.indexOf("#")&&(a=a.slice(1));if(u.xa[a])return u.xa[a];a=u.w(a)}if(!a||!a.nodeName)throw new TypeError("The element or ID supplied is not valid. (videojs)");return a.player||new u.s(a,c,d)}var v=u;
window.Td=window.Ud=u;u.Tb="4.3";u.Fc="https:"==document.location.protocol?"https://":"http://";u.options={techOrder:["html5","flash"],html5:{},flash:{},width:300,height:150,defaultVolume:0,children:{mediaLoader:{},posterImage:{},textTrackDisplay:{},loadingSpinner:{},bigPlayButton:{},controlBar:{}},notSupportedMessage:'Sorry, no compatible source and playback technology were found for this video. Try using another browser like <a href="http://bit.ly/ccMUEC">Chrome</a> or download the latest <a href="http://adobe.ly/mwfN1">Adobe Flash Player</a>.'};
"GENERATED_CDN_VSN"!==u.Tb&&(v.options.flash.swf=u.Fc+"vjs.zencdn.net/"+u.Tb+"/video-js.swf");u.xa={};u.la=u.CoreObject=m();u.la.extend=function(a){var c,d;a=a||{};c=a.init||a.i||this.prototype.init||this.prototype.i||m();d=function(){c.apply(this,arguments)};d.prototype=u.k.create(this.prototype);d.prototype.constructor=d;d.extend=u.la.extend;d.create=u.la.create;for(var e in a)a.hasOwnProperty(e)&&(d.prototype[e]=a[e]);return d};
u.la.create=function(){var a=u.k.create(this.prototype);this.apply(a,arguments);return a};u.d=function(a,c,d){var e=u.getData(a);e.z||(e.z={});e.z[c]||(e.z[c]=[]);d.t||(d.t=u.t++);e.z[c].push(d);e.W||(e.disabled=l,e.W=function(c){if(!e.disabled){c=u.kc(c);var d=e.z[c.type];if(d)for(var d=d.slice(0),k=0,q=d.length;k<q&&!c.pc();k++)d[k].call(a,c)}});1==e.z[c].length&&(document.addEventListener?a.addEventListener(c,e.W,l):document.attachEvent&&a.attachEvent("on"+c,e.W))};
u.o=function(a,c,d){if(u.oc(a)){var e=u.getData(a);if(e.z)if(c){var g=e.z[c];if(g){if(d){if(d.t)for(e=0;e<g.length;e++)g[e].t===d.t&&g.splice(e--,1)}else e.z[c]=[];u.gc(a,c)}}else for(g in e.z)c=g,e.z[c]=[],u.gc(a,c)}};u.gc=function(a,c){var d=u.getData(a);0===d.z[c].length&&(delete d.z[c],document.removeEventListener?a.removeEventListener(c,d.W,l):document.detachEvent&&a.detachEvent("on"+c,d.W));u.Bb(d.z)&&(delete d.z,delete d.W,delete d.disabled);u.Bb(d)&&u.vc(a)};
u.kc=function(a){function c(){return f}function d(){return l}if(!a||!a.Cb){var e=a||window.event;a={};for(var g in e)"layerX"!==g&&"layerY"!==g&&(a[g]=e[g]);a.target||(a.target=a.srcElement||document);a.relatedTarget=a.fromElement===a.target?a.toElement:a.fromElement;a.preventDefault=function(){e.preventDefault&&e.preventDefault();a.returnValue=l;a.Ab=c};a.Ab=d;a.stopPropagation=function(){e.stopPropagation&&e.stopPropagation();a.cancelBubble=f;a.Cb=c};a.Cb=d;a.stopImmediatePropagation=function(){e.stopImmediatePropagation&&
e.stopImmediatePropagation();a.pc=c;a.stopPropagation()};a.pc=d;if(a.clientX!=h){g=document.documentElement;var j=document.body;a.pageX=a.clientX+(g&&g.scrollLeft||j&&j.scrollLeft||0)-(g&&g.clientLeft||j&&j.clientLeft||0);a.pageY=a.clientY+(g&&g.scrollTop||j&&j.scrollTop||0)-(g&&g.clientTop||j&&j.clientTop||0)}a.which=a.charCode||a.keyCode;a.button!=h&&(a.button=a.button&1?0:a.button&4?1:a.button&2?2:0)}return a};
u.j=function(a,c){var d=u.oc(a)?u.getData(a):{},e=a.parentNode||a.ownerDocument;"string"===typeof c&&(c={type:c,target:a});c=u.kc(c);d.W&&d.W.call(a,c);if(e&&!c.Cb()&&c.bubbles!==l)u.j(e,c);else if(!e&&!c.Ab()&&(d=u.getData(c.target),c.target[c.type])){d.disabled=f;if("function"===typeof c.target[c.type])c.target[c.type]();d.disabled=l}return!c.Ab()};u.U=function(a,c,d){function e(){u.o(a,c,e);d.apply(this,arguments)}e.t=d.t=d.t||u.t++;u.d(a,c,e)};var w=Object.prototype.hasOwnProperty;
u.e=function(a,c){var d,e;d=document.createElement(a||"div");for(e in c)w.call(c,e)&&(-1!==e.indexOf("aria-")||"role"==e?d.setAttribute(e,c[e]):d[e]=c[e]);return d};u.$=function(a){return a.charAt(0).toUpperCase()+a.slice(1)};u.k={};u.k.create=Object.create||function(a){function c(){}c.prototype=a;return new c};u.k.ua=function(a,c,d){for(var e in a)w.call(a,e)&&c.call(d||this,e,a[e])};u.k.B=function(a,c){if(!c)return a;for(var d in c)w.call(c,d)&&(a[d]=c[d]);return a};
u.k.ic=function(a,c){var d,e,g;a=u.k.copy(a);for(d in c)w.call(c,d)&&(e=a[d],g=c[d],a[d]=u.k.qc(e)&&u.k.qc(g)?u.k.ic(e,g):c[d]);return a};u.k.copy=function(a){return u.k.B({},a)};u.k.qc=function(a){return!!a&&"object"===typeof a&&"[object Object]"===a.toString()&&a.constructor===Object};u.bind=function(a,c,d){function e(){return c.apply(a,arguments)}c.t||(c.t=u.t++);e.t=d?d+"_"+c.t:c.t;return e};u.ra={};u.t=1;u.expando="vdata"+(new Date).getTime();
u.getData=function(a){var c=a[u.expando];c||(c=a[u.expando]=u.t++,u.ra[c]={});return u.ra[c]};u.oc=function(a){a=a[u.expando];return!(!a||u.Bb(u.ra[a]))};u.vc=function(a){var c=a[u.expando];if(c){delete u.ra[c];try{delete a[u.expando]}catch(d){a.removeAttribute?a.removeAttribute(u.expando):a[u.expando]=h}}};u.Bb=function(a){for(var c in a)if(a[c]!==h)return l;return f};u.n=function(a,c){-1==(" "+a.className+" ").indexOf(" "+c+" ")&&(a.className=""===a.className?c:a.className+" "+c)};
u.u=function(a,c){var d,e;if(-1!=a.className.indexOf(c)){d=a.className.split(" ");for(e=d.length-1;0<=e;e--)d[e]===c&&d.splice(e,1);a.className=d.join(" ")}};u.na=u.e("video");u.F=navigator.userAgent;u.Mc=/iPhone/i.test(u.F);u.Lc=/iPad/i.test(u.F);u.Nc=/iPod/i.test(u.F);u.Kc=u.Mc||u.Lc||u.Nc;var aa=u,x;var y=u.F.match(/OS (\d+)_/i);x=y&&y[1]?y[1]:b;aa.Fd=x;u.Ic=/Android/i.test(u.F);var ba=u,z;var A=u.F.match(/Android (\d+)(?:\.(\d+))?(?:\.(\d+))*/i),B,C;
A?(B=A[1]&&parseFloat(A[1]),C=A[2]&&parseFloat(A[2]),z=B&&C?parseFloat(A[1]+"."+A[2]):B?B:h):z=h;ba.Gc=z;u.Oc=u.Ic&&/webkit/i.test(u.F)&&2.3>u.Gc;u.Jc=/Firefox/i.test(u.F);u.Gd=/Chrome/i.test(u.F);u.ac=!!("ontouchstart"in window||window.Hc&&document instanceof window.Hc);
u.xb=function(a){var c,d,e,g;c={};if(a&&a.attributes&&0<a.attributes.length){d=a.attributes;for(var j=d.length-1;0<=j;j--){e=d[j].name;g=d[j].value;if("boolean"===typeof a[e]||-1!==",autoplay,controls,loop,muted,default,".indexOf(","+e+","))g=g!==h?f:l;c[e]=g}}return c};
u.Kd=function(a,c){var d="";document.defaultView&&document.defaultView.getComputedStyle?d=document.defaultView.getComputedStyle(a,"").getPropertyValue(c):a.currentStyle&&(d=a["client"+c.substr(0,1).toUpperCase()+c.substr(1)]+"px");return d};u.zb=function(a,c){c.firstChild?c.insertBefore(a,c.firstChild):c.appendChild(a)};u.Pb={};u.w=function(a){0===a.indexOf("#")&&(a=a.slice(1));return document.getElementById(a)};
u.La=function(a,c){c=c||a;var d=Math.floor(a%60),e=Math.floor(a/60%60),g=Math.floor(a/3600),j=Math.floor(c/60%60),k=Math.floor(c/3600);if(isNaN(a)||Infinity===a)g=e=d="-";g=0<g||0<k?g+":":"";return g+(((g||10<=j)&&10>e?"0"+e:e)+":")+(10>d?"0"+d:d)};u.Tc=function(){document.body.focus();document.onselectstart=s(l)};u.Bd=function(){document.onselectstart=s(f)};u.trim=function(a){return(a+"").replace(/^\s+|\s+$/g,"")};u.round=function(a,c){c||(c=0);return Math.round(a*Math.pow(10,c))/Math.pow(10,c)};
u.tb=function(a,c){return{length:1,start:function(){return a},end:function(){return c}}};
u.get=function(a,c,d){var e,g;"undefined"===typeof XMLHttpRequest&&(window.XMLHttpRequest=function(){try{return new window.ActiveXObject("Msxml2.XMLHTTP.6.0")}catch(a){}try{return new window.ActiveXObject("Msxml2.XMLHTTP.3.0")}catch(c){}try{return new window.ActiveXObject("Msxml2.XMLHTTP")}catch(d){}throw Error("This browser does not support XMLHttpRequest.");});g=new XMLHttpRequest;try{g.open("GET",a)}catch(j){d(j)}e=0===a.indexOf("file:")||0===window.location.href.indexOf("file:")&&-1===a.indexOf("http");
g.onreadystatechange=function(){4===g.readyState&&(200===g.status||e&&0===g.status?c(g.responseText):d&&d())};try{g.send()}catch(k){d&&d(k)}};u.td=function(a){try{var c=window.localStorage||l;c&&(c.volume=a)}catch(d){22==d.code||1014==d.code?u.log("LocalStorage Full (VideoJS)",d):18==d.code?u.log("LocalStorage not allowed (VideoJS)",d):u.log("LocalStorage Error (VideoJS)",d)}};u.mc=function(a){a.match(/^https?:\/\//)||(a=u.e("div",{innerHTML:'<a href="'+a+'">x</a>'}).firstChild.href);return a};
u.log=function(){u.log.history=u.log.history||[];u.log.history.push(arguments);window.console&&window.console.log(Array.prototype.slice.call(arguments))};u.ad=function(a){var c,d;a.getBoundingClientRect&&a.parentNode&&(c=a.getBoundingClientRect());if(!c)return{left:0,top:0};a=document.documentElement;d=document.body;return{left:c.left+(window.pageXOffset||d.scrollLeft)-(a.clientLeft||d.clientLeft||0),top:c.top+(window.pageYOffset||d.scrollTop)-(a.clientTop||d.clientTop||0)}};
u.c=u.la.extend({i:function(a,c,d){this.b=a;this.g=u.k.copy(this.g);c=this.options(c);this.Q=c.id||(c.el&&c.el.id?c.el.id:a.id()+"_component_"+u.t++);this.gd=c.name||h;this.a=c.el||this.e();this.G=[];this.qb={};this.V={};if((a=this.g)&&a.children){var e=this;u.k.ua(a.children,function(a,c){c!==l&&!c.loadEvent&&(e[a]=e.Z(a,c))})}this.L(d)}});t=u.c.prototype;
t.D=function(){this.j("dispose");if(this.G)for(var a=this.G.length-1;0<=a;a--)this.G[a].D&&this.G[a].D();this.V=this.qb=this.G=h;this.o();this.a.parentNode&&this.a.parentNode.removeChild(this.a);u.vc(this.a);this.a=h};t.b=f;t.K=p("b");t.options=function(a){return a===b?this.g:this.g=u.k.ic(this.g,a)};t.e=function(a,c){return u.e(a,c)};t.w=p("a");t.id=p("Q");t.name=p("gd");t.children=p("G");
t.Z=function(a,c){var d,e;"string"===typeof a?(e=a,c=c||{},d=c.componentClass||u.$(e),c.name=e,d=new window.videojs[d](this.b||this,c)):d=a;this.G.push(d);"function"===typeof d.id&&(this.qb[d.id()]=d);(e=e||d.name&&d.name())&&(this.V[e]=d);"function"===typeof d.el&&d.el()&&(this.sa||this.a).appendChild(d.el());return d};
t.removeChild=function(a){"string"===typeof a&&(a=this.V[a]);if(a&&this.G){for(var c=l,d=this.G.length-1;0<=d;d--)if(this.G[d]===a){c=f;this.G.splice(d,1);break}c&&(this.qb[a.id]=h,this.V[a.name]=h,(c=a.w())&&c.parentNode===(this.sa||this.a)&&(this.sa||this.a).removeChild(a.w()))}};t.T=s("");t.d=function(a,c){u.d(this.a,a,u.bind(this,c));return this};t.o=function(a,c){u.o(this.a,a,c);return this};t.U=function(a,c){u.U(this.a,a,u.bind(this,c));return this};t.j=function(a,c){u.j(this.a,a,c);return this};
t.L=function(a){a&&(this.aa?a.call(this):(this.Sa===b&&(this.Sa=[]),this.Sa.push(a)));return this};t.Ua=function(){this.aa=f;var a=this.Sa;if(a&&0<a.length){for(var c=0,d=a.length;c<d;c++)a[c].call(this);this.Sa=[];this.j("ready")}};t.n=function(a){u.n(this.a,a);return this};t.u=function(a){u.u(this.a,a);return this};t.show=function(){this.a.style.display="block";return this};t.C=function(){this.a.style.display="none";return this};function D(a){a.u("vjs-lock-showing")}
t.disable=function(){this.C();this.show=m()};t.width=function(a,c){return E(this,"width",a,c)};t.height=function(a,c){return E(this,"height",a,c)};t.Xc=function(a,c){return this.width(a,f).height(c)};function E(a,c,d,e){if(d!==b)return a.a.style[c]=-1!==(""+d).indexOf("%")||-1!==(""+d).indexOf("px")?d:"auto"===d?"":d+"px",e||a.j("resize"),a;if(!a.a)return 0;d=a.a.style[c];e=d.indexOf("px");return-1!==e?parseInt(d.slice(0,e),10):parseInt(a.a["offset"+u.$(c)],10)}
u.q=u.c.extend({i:function(a,c){u.c.call(this,a,c);var d=l;this.d("touchstart",function(a){a.preventDefault();d=f});this.d("touchmove",function(){d=l});var e=this;this.d("touchend",function(a){d&&e.p(a);a.preventDefault()});this.d("click",this.p);this.d("focus",this.Oa);this.d("blur",this.Na)}});t=u.q.prototype;
t.e=function(a,c){c=u.k.B({className:this.T(),innerHTML:'<div class="vjs-control-content"><span class="vjs-control-text">'+(this.qa||"Need Text")+"</span></div>",qd:"button","aria-live":"polite",tabIndex:0},c);return u.c.prototype.e.call(this,a,c)};t.T=function(){return"vjs-control "+u.c.prototype.T.call(this)};t.p=m();t.Oa=function(){u.d(document,"keyup",u.bind(this,this.ba))};t.ba=function(a){if(32==a.which||13==a.which)a.preventDefault(),this.p()};
t.Na=function(){u.o(document,"keyup",u.bind(this,this.ba))};u.O=u.c.extend({i:function(a,c){u.c.call(this,a,c);this.Sc=this.V[this.g.barName];this.handle=this.V[this.g.handleName];a.d(this.tc,u.bind(this,this.update));this.d("mousedown",this.Pa);this.d("touchstart",this.Pa);this.d("focus",this.Oa);this.d("blur",this.Na);this.d("click",this.p);this.b.d("controlsvisible",u.bind(this,this.update));a.L(u.bind(this,this.update));this.P={}}});t=u.O.prototype;
t.e=function(a,c){c=c||{};c.className+=" vjs-slider";c=u.k.B({qd:"slider","aria-valuenow":0,"aria-valuemin":0,"aria-valuemax":100,tabIndex:0},c);return u.c.prototype.e.call(this,a,c)};t.Pa=function(a){a.preventDefault();u.Tc();this.P.move=u.bind(this,this.Hb);this.P.end=u.bind(this,this.Ib);u.d(document,"mousemove",this.P.move);u.d(document,"mouseup",this.P.end);u.d(document,"touchmove",this.P.move);u.d(document,"touchend",this.P.end);this.Hb(a)};
t.Ib=function(){u.Bd();u.o(document,"mousemove",this.P.move,l);u.o(document,"mouseup",this.P.end,l);u.o(document,"touchmove",this.P.move,l);u.o(document,"touchend",this.P.end,l);this.update()};t.update=function(){if(this.a){var a,c=this.yb(),d=this.handle,e=this.Sc;isNaN(c)&&(c=0);a=c;if(d){a=this.a.offsetWidth;var g=d.w().offsetWidth;a=g?g/a:0;c*=1-a;a=c+a/2;d.w().style.left=u.round(100*c,2)+"%"}e.w().style.width=u.round(100*a,2)+"%"}};
function F(a,c){var d,e,g,j;d=a.a;e=u.ad(d);j=g=d.offsetWidth;d=a.handle;if(a.g.Cd)return j=e.top,e=c.changedTouches?c.changedTouches[0].pageY:c.pageY,d&&(d=d.w().offsetHeight,j+=d/2,g-=d),Math.max(0,Math.min(1,(j-e+g)/g));g=e.left;e=c.changedTouches?c.changedTouches[0].pageX:c.pageX;d&&(d=d.w().offsetWidth,g+=d/2,j-=d);return Math.max(0,Math.min(1,(e-g)/j))}t.Oa=function(){u.d(document,"keyup",u.bind(this,this.ba))};
t.ba=function(a){37==a.which?(a.preventDefault(),this.yc()):39==a.which&&(a.preventDefault(),this.zc())};t.Na=function(){u.o(document,"keyup",u.bind(this,this.ba))};t.p=function(a){a.stopImmediatePropagation();a.preventDefault()};u.ea=u.c.extend();u.ea.prototype.defaultValue=0;u.ea.prototype.e=function(a,c){c=c||{};c.className+=" vjs-slider-handle";c=u.k.B({innerHTML:'<span class="vjs-control-text">'+this.defaultValue+"</span>"},c);return u.c.prototype.e.call(this,"div",c)};u.ma=u.c.extend();
function ca(a,c){a.Z(c);c.d("click",u.bind(a,function(){D(this)}))}u.ma.prototype.e=function(){var a=this.options().Vc||"ul";this.sa=u.e(a,{className:"vjs-menu-content"});a=u.c.prototype.e.call(this,"div",{append:this.sa,className:"vjs-menu"});a.appendChild(this.sa);u.d(a,"click",function(a){a.preventDefault();a.stopImmediatePropagation()});return a};u.N=u.q.extend({i:function(a,c){u.q.call(this,a,c);this.selected(c.selected)}});
u.N.prototype.e=function(a,c){return u.q.prototype.e.call(this,"li",u.k.B({className:"vjs-menu-item",innerHTML:this.g.label},c))};u.N.prototype.p=function(){this.selected(f)};u.N.prototype.selected=function(a){a?(this.n("vjs-selected"),this.a.setAttribute("aria-selected",f)):(this.u("vjs-selected"),this.a.setAttribute("aria-selected",l))};
u.R=u.q.extend({i:function(a,c){u.q.call(this,a,c);this.wa=this.Ka();this.Z(this.wa);this.I&&0===this.I.length&&this.C();this.d("keyup",this.ba);this.a.setAttribute("aria-haspopup",f);this.a.setAttribute("role","button")}});t=u.R.prototype;t.pa=l;t.Ka=function(){var a=new u.ma(this.b);this.options().title&&a.w().appendChild(u.e("li",{className:"vjs-menu-title",innerHTML:u.$(this.A),zd:-1}));if(this.I=this.createItems())for(var c=0;c<this.I.length;c++)ca(a,this.I[c]);return a};t.ta=m();
t.T=function(){return this.className+" vjs-menu-button "+u.q.prototype.T.call(this)};t.Oa=m();t.Na=m();t.p=function(){this.U("mouseout",u.bind(this,function(){D(this.wa);this.a.blur()}));this.pa?G(this):H(this)};t.ba=function(a){a.preventDefault();32==a.which||13==a.which?this.pa?G(this):H(this):27==a.which&&this.pa&&G(this)};function H(a){a.pa=f;a.wa.n("vjs-lock-showing");a.a.setAttribute("aria-pressed",f);a.I&&0<a.I.length&&a.I[0].w().focus()}
function G(a){a.pa=l;D(a.wa);a.a.setAttribute("aria-pressed",l)}
u.s=u.c.extend({i:function(a,c,d){this.M=a;c=u.k.B(da(a),c);this.v={};this.uc=c.poster;this.sb=c.controls;a.controls=l;u.c.call(this,this,c,d);this.controls()?this.n("vjs-controls-enabled"):this.n("vjs-controls-disabled");this.U("play",function(a){u.j(this.a,{type:"firstplay",target:this.a})||(a.preventDefault(),a.stopPropagation(),a.stopImmediatePropagation())});this.d("ended",this.hd);this.d("play",this.Kb);this.d("firstplay",this.jd);this.d("pause",this.Jb);this.d("progress",this.ld);this.d("durationchange",
this.sc);this.d("error",this.Gb);this.d("fullscreenchange",this.kd);u.xa[this.Q]=this;c.plugins&&u.k.ua(c.plugins,function(a,c){this[a](c)},this);var e,g,j,k;e=this.Mb;a=function(){e();clearInterval(g);g=setInterval(u.bind(this,e),250)};c=function(){e();clearInterval(g)};this.d("mousedown",a);this.d("mousemove",e);this.d("mouseup",c);this.d("keydown",e);this.d("keyup",e);this.d("touchstart",a);this.d("touchmove",e);this.d("touchend",c);this.d("touchcancel",c);j=setInterval(u.bind(this,function(){this.ka&&
(this.ka=l,this.ja(f),clearTimeout(k),k=setTimeout(u.bind(this,function(){this.ka||this.ja(l)}),2E3))}),250);this.d("dispose",function(){clearInterval(j);clearTimeout(k)})}});t=u.s.prototype;t.g=u.options;t.D=function(){this.j("dispose");this.o("dispose");u.xa[this.Q]=h;this.M&&this.M.player&&(this.M.player=h);this.a&&this.a.player&&(this.a.player=h);clearInterval(this.Ra);this.za();this.h&&this.h.D();u.c.prototype.D.call(this)};
function da(a){var c={sources:[],tracks:[]};u.k.B(c,u.xb(a));if(a.hasChildNodes()){var d,e,g,j;a=a.childNodes;g=0;for(j=a.length;g<j;g++)d=a[g],e=d.nodeName.toLowerCase(),"source"===e?c.sources.push(u.xb(d)):"track"===e&&c.tracks.push(u.xb(d))}return c}
t.e=function(){var a=this.a=u.c.prototype.e.call(this,"div"),c=this.M;c.removeAttribute("width");c.removeAttribute("height");if(c.hasChildNodes()){var d,e,g,j,k;d=c.childNodes;e=d.length;for(k=[];e--;)g=d[e],j=g.nodeName.toLowerCase(),"track"===j&&k.push(g);for(d=0;d<k.length;d++)c.removeChild(k[d])}c.id=c.id||"vjs_video_"+u.t++;a.id=c.id;a.className=c.className;c.id+="_html5_api";c.className="vjs-tech";c.player=a.player=this;this.n("vjs-paused");this.width(this.g.width,f);this.height(this.g.height,
f);c.parentNode&&c.parentNode.insertBefore(a,c);u.zb(c,a);return a};
function I(a,c,d){a.h?(a.aa=l,a.h.D(),a.Eb&&(a.Eb=l,clearInterval(a.Ra)),a.Fb&&J(a),a.h=l):"Html5"!==c&&a.M&&(u.l.jc(a.M),a.M=h);a.ia=c;a.aa=l;var e=u.k.B({source:d,parentEl:a.a},a.g[c.toLowerCase()]);d&&(d.src==a.v.src&&0<a.v.currentTime&&(e.startTime=a.v.currentTime),a.v.src=d.src);a.h=new window.videojs[c](a,e);a.h.L(function(){this.b.Ua();if(!this.m.progressEvents){var a=this.b;a.Eb=f;a.Ra=setInterval(u.bind(a,function(){this.v.lb<this.buffered().end(0)?this.j("progress"):1==this.Ja()&&(clearInterval(this.Ra),
this.j("progress"))}),500);a.h.U("progress",function(){this.m.progressEvents=f;var a=this.b;a.Eb=l;clearInterval(a.Ra)})}this.m.timeupdateEvents||(a=this.b,a.Fb=f,a.d("play",a.Cc),a.d("pause",a.za),a.h.U("timeupdate",function(){this.m.timeupdateEvents=f;J(this.b)}))})}function J(a){a.Fb=l;a.za();a.o("play",a.Cc);a.o("pause",a.za)}t.Cc=function(){this.hc&&this.za();this.hc=setInterval(u.bind(this,function(){this.j("timeupdate")}),250)};t.za=function(){clearInterval(this.hc)};
t.Kb=function(){u.u(this.a,"vjs-paused");u.n(this.a,"vjs-playing")};t.jd=function(){this.g.starttime&&this.currentTime(this.g.starttime);this.n("vjs-has-started")};t.Jb=function(){u.u(this.a,"vjs-playing");u.n(this.a,"vjs-paused")};t.ld=function(){1==this.Ja()&&this.j("loadedalldata")};t.hd=function(){this.g.loop&&(this.currentTime(0),this.play())};t.sc=function(){this.duration(K(this,"duration"))};t.kd=function(){this.H?this.n("vjs-fullscreen"):this.u("vjs-fullscreen")};
t.Gb=function(a){u.log("Video Error",a)};function L(a,c,d){if(a.h&&!a.h.aa)a.h.L(function(){this[c](d)});else try{a.h[c](d)}catch(e){throw u.log(e),e;}}function K(a,c){if(a.h&&a.h.aa)try{return a.h[c]()}catch(d){throw a.h[c]===b?u.log("Video.js: "+c+" method not defined for "+a.ia+" playback technology.",d):"TypeError"==d.name?(u.log("Video.js: "+c+" unavailable on "+a.ia+" playback technology element.",d),a.h.aa=l):u.log(d),d;}}t.play=function(){L(this,"play");return this};
t.pause=function(){L(this,"pause");return this};t.paused=function(){return K(this,"paused")===l?l:f};t.currentTime=function(a){return a!==b?(this.v.rc=a,L(this,"setCurrentTime",a),this.Fb&&this.j("timeupdate"),this):this.v.currentTime=K(this,"currentTime")||0};t.duration=function(a){if(a!==b)return this.v.duration=parseFloat(a),this;this.v.duration===b&&this.sc();return this.v.duration};
t.buffered=function(){var a=K(this,"buffered"),c=a.length-1,d=this.v.lb=this.v.lb||0;a&&(0<=c&&a.end(c)!==d)&&(d=a.end(c),this.v.lb=d);return u.tb(0,d)};t.Ja=function(){return this.duration()?this.buffered().end(0)/this.duration():0};t.volume=function(a){if(a!==b)return a=Math.max(0,Math.min(1,parseFloat(a))),this.v.volume=a,L(this,"setVolume",a),u.td(a),this;a=parseFloat(K(this,"volume"));return isNaN(a)?1:a};t.muted=function(a){return a!==b?(L(this,"setMuted",a),this):K(this,"muted")||l};
t.Ta=function(){return K(this,"supportsFullScreen")||l};
t.ya=function(){var a=u.Pb.ya;this.H=f;a?(u.d(document,a.vb,u.bind(this,function(c){this.H=document[a.H];this.H===l&&u.o(document,a.vb,arguments.callee);this.j("fullscreenchange")})),this.a[a.wc]()):this.h.Ta()?L(this,"enterFullScreen"):(this.cd=f,this.Yc=document.documentElement.style.overflow,u.d(document,"keydown",u.bind(this,this.lc)),document.documentElement.style.overflow="hidden",u.n(document.body,"vjs-full-window"),this.j("enterFullWindow"),this.j("fullscreenchange"));return this};
t.ob=function(){var a=u.Pb.ya;this.H=l;if(a)document[a.nb]();else this.h.Ta()?L(this,"exitFullScreen"):(M(this),this.j("fullscreenchange"));return this};t.lc=function(a){27===a.keyCode&&(this.H===f?this.ob():M(this))};function M(a){a.cd=l;u.o(document,"keydown",a.lc);document.documentElement.style.overflow=a.Yc;u.u(document.body,"vjs-full-window");a.j("exitFullWindow")}
t.src=function(a){if(a instanceof Array){var c;a:{c=a;for(var d=0,e=this.g.techOrder;d<e.length;d++){var g=u.$(e[d]),j=window.videojs[g];if(j.isSupported())for(var k=0,q=c;k<q.length;k++){var n=q[k];if(j.canPlaySource(n)){c={source:n,h:g};break a}}}c=l}c?(a=c.source,c=c.h,c==this.ia?this.src(a):I(this,c,a)):this.a.appendChild(u.e("p",{innerHTML:this.options().notSupportedMessage}))}else a instanceof Object?window.videojs[this.ia].canPlaySource(a)?this.src(a.src):this.src([a]):(this.v.src=a,this.aa?
(L(this,"src",a),"auto"==this.g.preload&&this.load(),this.g.autoplay&&this.play()):this.L(function(){this.src(a)}));return this};t.load=function(){L(this,"load");return this};t.currentSrc=function(){return K(this,"currentSrc")||this.v.src||""};t.Qa=function(a){return a!==b?(L(this,"setPreload",a),this.g.preload=a,this):K(this,"preload")};t.autoplay=function(a){return a!==b?(L(this,"setAutoplay",a),this.g.autoplay=a,this):K(this,"autoplay")};
t.loop=function(a){return a!==b?(L(this,"setLoop",a),this.g.loop=a,this):K(this,"loop")};t.poster=function(a){return a!==b?(this.uc=a,this):this.uc};t.controls=function(a){return a!==b?(a=!!a,this.sb!==a&&((this.sb=a)?(this.u("vjs-controls-disabled"),this.n("vjs-controls-enabled"),this.j("controlsenabled")):(this.u("vjs-controls-enabled"),this.n("vjs-controls-disabled"),this.j("controlsdisabled"))),this):this.sb};u.s.prototype.Sb;t=u.s.prototype;
t.Rb=function(a){return a!==b?(a=!!a,this.Sb!==a&&((this.Sb=a)?(this.n("vjs-using-native-controls"),this.j("usingnativecontrols")):(this.u("vjs-using-native-controls"),this.j("usingcustomcontrols"))),this):this.Sb};t.error=function(){return K(this,"error")};t.seeking=function(){return K(this,"seeking")};t.ka=f;t.Mb=function(){this.ka=f};t.Qb=f;
t.ja=function(a){return a!==b?(a=!!a,a!==this.Qb&&((this.Qb=a)?(this.ka=f,this.u("vjs-user-inactive"),this.n("vjs-user-active"),this.j("useractive")):(this.ka=l,this.h.U("mousemove",function(a){a.stopPropagation();a.preventDefault()}),this.u("vjs-user-active"),this.n("vjs-user-inactive"),this.j("userinactive"))),this):this.Qb};var N,O,P;P=document.createElement("div");O={};
P.Hd!==b?(O.wc="requestFullscreen",O.nb="exitFullscreen",O.vb="fullscreenchange",O.H="fullScreen"):(document.mozCancelFullScreen?(N="moz",O.H=N+"FullScreen"):(N="webkit",O.H=N+"IsFullScreen"),P[N+"RequestFullScreen"]&&(O.wc=N+"RequestFullScreen",O.nb=N+"CancelFullScreen"),O.vb=N+"fullscreenchange");document[O.nb]&&(u.Pb.ya=O);u.Fa=u.c.extend();
u.Fa.prototype.g={Md:"play",children:{playToggle:{},currentTimeDisplay:{},timeDivider:{},durationDisplay:{},remainingTimeDisplay:{},progressControl:{},fullscreenToggle:{},volumeControl:{},muteToggle:{}}};u.Fa.prototype.e=function(){return u.e("div",{className:"vjs-control-bar"})};u.Yb=u.q.extend({i:function(a,c){u.q.call(this,a,c);a.d("play",u.bind(this,this.Kb));a.d("pause",u.bind(this,this.Jb))}});t=u.Yb.prototype;t.qa="Play";t.T=function(){return"vjs-play-control "+u.q.prototype.T.call(this)};
t.p=function(){this.b.paused()?this.b.play():this.b.pause()};t.Kb=function(){u.u(this.a,"vjs-paused");u.n(this.a,"vjs-playing");this.a.children[0].children[0].innerHTML="Pause"};t.Jb=function(){u.u(this.a,"vjs-playing");u.n(this.a,"vjs-paused");this.a.children[0].children[0].innerHTML="Play"};u.Ya=u.c.extend({i:function(a,c){u.c.call(this,a,c);a.d("timeupdate",u.bind(this,this.Ca))}});
u.Ya.prototype.e=function(){var a=u.c.prototype.e.call(this,"div",{className:"vjs-current-time vjs-time-controls vjs-control"});this.content=u.e("div",{className:"vjs-current-time-display",innerHTML:'<span class="vjs-control-text">Current Time </span>0:00',"aria-live":"off"});a.appendChild(u.e("div").appendChild(this.content));return a};
u.Ya.prototype.Ca=function(){var a=this.b.Nb?this.b.v.currentTime:this.b.currentTime();this.content.innerHTML='<span class="vjs-control-text">Current Time </span>'+u.La(a,this.b.duration())};u.Za=u.c.extend({i:function(a,c){u.c.call(this,a,c);a.d("timeupdate",u.bind(this,this.Ca))}});
u.Za.prototype.e=function(){var a=u.c.prototype.e.call(this,"div",{className:"vjs-duration vjs-time-controls vjs-control"});this.content=u.e("div",{className:"vjs-duration-display",innerHTML:'<span class="vjs-control-text">Duration Time </span>0:00',"aria-live":"off"});a.appendChild(u.e("div").appendChild(this.content));return a};u.Za.prototype.Ca=function(){var a=this.b.duration();a&&(this.content.innerHTML='<span class="vjs-control-text">Duration Time </span>'+u.La(a))};
u.cc=u.c.extend({i:function(a,c){u.c.call(this,a,c)}});u.cc.prototype.e=function(){return u.c.prototype.e.call(this,"div",{className:"vjs-time-divider",innerHTML:"<div><span>/</span></div>"})};u.fb=u.c.extend({i:function(a,c){u.c.call(this,a,c);a.d("timeupdate",u.bind(this,this.Ca))}});
u.fb.prototype.e=function(){var a=u.c.prototype.e.call(this,"div",{className:"vjs-remaining-time vjs-time-controls vjs-control"});this.content=u.e("div",{className:"vjs-remaining-time-display",innerHTML:'<span class="vjs-control-text">Remaining Time </span>-0:00',"aria-live":"off"});a.appendChild(u.e("div").appendChild(this.content));return a};u.fb.prototype.Ca=function(){this.b.duration()&&(this.content.innerHTML='<span class="vjs-control-text">Remaining Time </span>-'+u.La(this.b.duration()-this.b.currentTime()))};
u.Ga=u.q.extend({i:function(a,c){u.q.call(this,a,c)}});u.Ga.prototype.qa="Fullscreen";u.Ga.prototype.T=function(){return"vjs-fullscreen-control "+u.q.prototype.T.call(this)};u.Ga.prototype.p=function(){this.b.H?(this.b.ob(),this.a.children[0].children[0].innerHTML="Fullscreen"):(this.b.ya(),this.a.children[0].children[0].innerHTML="Non-Fullscreen")};u.eb=u.c.extend({i:function(a,c){u.c.call(this,a,c)}});u.eb.prototype.g={children:{seekBar:{}}};
u.eb.prototype.e=function(){return u.c.prototype.e.call(this,"div",{className:"vjs-progress-control vjs-control"})};u.Zb=u.O.extend({i:function(a,c){u.O.call(this,a,c);a.d("timeupdate",u.bind(this,this.Ba));a.L(u.bind(this,this.Ba))}});t=u.Zb.prototype;t.g={children:{loadProgressBar:{},playProgressBar:{},seekHandle:{}},barName:"playProgressBar",handleName:"seekHandle"};t.tc="timeupdate";t.e=function(){return u.O.prototype.e.call(this,"div",{className:"vjs-progress-holder","aria-label":"video progress bar"})};
t.Ba=function(){var a=this.b.Nb?this.b.v.currentTime:this.b.currentTime();this.a.setAttribute("aria-valuenow",u.round(100*this.yb(),2));this.a.setAttribute("aria-valuetext",u.La(a,this.b.duration()))};t.yb=function(){var a;"Flash"===this.b.ia&&this.b.seeking()?(a=this.b.v,a=a.rc?a.rc:this.b.currentTime()):a=this.b.currentTime();return a/this.b.duration()};t.Pa=function(a){u.O.prototype.Pa.call(this,a);this.b.Nb=f;this.Dd=!this.b.paused();this.b.pause()};
t.Hb=function(a){a=F(this,a)*this.b.duration();a==this.b.duration()&&(a-=0.1);this.b.currentTime(a)};t.Ib=function(a){u.O.prototype.Ib.call(this,a);this.b.Nb=l;this.Dd&&this.b.play()};t.zc=function(){this.b.currentTime(this.b.currentTime()+5)};t.yc=function(){this.b.currentTime(this.b.currentTime()-5)};u.ab=u.c.extend({i:function(a,c){u.c.call(this,a,c);a.d("progress",u.bind(this,this.update))}});u.ab.prototype.e=function(){return u.c.prototype.e.call(this,"div",{className:"vjs-load-progress",innerHTML:'<span class="vjs-control-text">Loaded: 0%</span>'})};
u.ab.prototype.update=function(){this.a.style&&(this.a.style.width=u.round(100*this.b.Ja(),2)+"%")};u.Xb=u.c.extend({i:function(a,c){u.c.call(this,a,c)}});u.Xb.prototype.e=function(){return u.c.prototype.e.call(this,"div",{className:"vjs-play-progress",innerHTML:'<span class="vjs-control-text">Progress: 0%</span>'})};u.gb=u.ea.extend();u.gb.prototype.defaultValue="00:00";u.gb.prototype.e=function(){return u.ea.prototype.e.call(this,"div",{className:"vjs-seek-handle"})};
u.ib=u.c.extend({i:function(a,c){u.c.call(this,a,c);a.h&&(a.h.m&&a.h.m.volumeControl===l)&&this.n("vjs-hidden");a.d("loadstart",u.bind(this,function(){a.h.m&&a.h.m.volumeControl===l?this.n("vjs-hidden"):this.u("vjs-hidden")}))}});u.ib.prototype.g={children:{volumeBar:{}}};u.ib.prototype.e=function(){return u.c.prototype.e.call(this,"div",{className:"vjs-volume-control vjs-control"})};
u.hb=u.O.extend({i:function(a,c){u.O.call(this,a,c);a.d("volumechange",u.bind(this,this.Ba));a.L(u.bind(this,this.Ba));setTimeout(u.bind(this,this.update),0)}});t=u.hb.prototype;t.Ba=function(){this.a.setAttribute("aria-valuenow",u.round(100*this.b.volume(),2));this.a.setAttribute("aria-valuetext",u.round(100*this.b.volume(),2)+"%")};t.g={children:{volumeLevel:{},volumeHandle:{}},barName:"volumeLevel",handleName:"volumeHandle"};t.tc="volumechange";
t.e=function(){return u.O.prototype.e.call(this,"div",{className:"vjs-volume-bar","aria-label":"volume level"})};t.Hb=function(a){this.b.muted()&&this.b.muted(l);this.b.volume(F(this,a))};t.yb=function(){return this.b.muted()?0:this.b.volume()};t.zc=function(){this.b.volume(this.b.volume()+0.1)};t.yc=function(){this.b.volume(this.b.volume()-0.1)};u.dc=u.c.extend({i:function(a,c){u.c.call(this,a,c)}});
u.dc.prototype.e=function(){return u.c.prototype.e.call(this,"div",{className:"vjs-volume-level",innerHTML:'<span class="vjs-control-text"></span>'})};u.jb=u.ea.extend();u.jb.prototype.defaultValue="00:00";u.jb.prototype.e=function(){return u.ea.prototype.e.call(this,"div",{className:"vjs-volume-handle"})};
u.da=u.q.extend({i:function(a,c){u.q.call(this,a,c);a.d("volumechange",u.bind(this,this.update));a.h&&(a.h.m&&a.h.m.volumeControl===l)&&this.n("vjs-hidden");a.d("loadstart",u.bind(this,function(){a.h.m&&a.h.m.volumeControl===l?this.n("vjs-hidden"):this.u("vjs-hidden")}))}});u.da.prototype.e=function(){return u.q.prototype.e.call(this,"div",{className:"vjs-mute-control vjs-control",innerHTML:'<div><span class="vjs-control-text">Mute</span></div>'})};
u.da.prototype.p=function(){this.b.muted(this.b.muted()?l:f)};u.da.prototype.update=function(){var a=this.b.volume(),c=3;0===a||this.b.muted()?c=0:0.33>a?c=1:0.67>a&&(c=2);this.b.muted()?"Unmute"!=this.a.children[0].children[0].innerHTML&&(this.a.children[0].children[0].innerHTML="Unmute"):"Mute"!=this.a.children[0].children[0].innerHTML&&(this.a.children[0].children[0].innerHTML="Mute");for(a=0;4>a;a++)u.u(this.a,"vjs-vol-"+a);u.n(this.a,"vjs-vol-"+c)};
u.oa=u.R.extend({i:function(a,c){u.R.call(this,a,c);a.d("volumechange",u.bind(this,this.update));a.h&&(a.h.m&&a.h.m.Dc===l)&&this.n("vjs-hidden");a.d("loadstart",u.bind(this,function(){a.h.m&&a.h.m.Dc===l?this.n("vjs-hidden"):this.u("vjs-hidden")}));this.n("vjs-menu-button")}});u.oa.prototype.Ka=function(){var a=new u.ma(this.b,{Vc:"div"}),c=new u.hb(this.b,u.k.B({Cd:f},this.g.Vd));a.Z(c);return a};u.oa.prototype.p=function(){u.da.prototype.p.call(this);u.R.prototype.p.call(this)};
u.oa.prototype.e=function(){return u.q.prototype.e.call(this,"div",{className:"vjs-volume-menu-button vjs-menu-button vjs-control",innerHTML:'<div><span class="vjs-control-text">Mute</span></div>'})};u.oa.prototype.update=u.da.prototype.update;u.cb=u.q.extend({i:function(a,c){u.q.call(this,a,c);(!a.poster()||!a.controls())&&this.C();a.d("play",u.bind(this,this.C))}});
u.cb.prototype.e=function(){var a=u.e("div",{className:"vjs-poster",tabIndex:-1}),c=this.b.poster();c&&("backgroundSize"in a.style?a.style.backgroundImage='url("'+c+'")':a.appendChild(u.e("img",{src:c})));return a};u.cb.prototype.p=function(){this.K().controls()&&this.b.play()};
u.Wb=u.c.extend({i:function(a,c){u.c.call(this,a,c);a.d("canplay",u.bind(this,this.C));a.d("canplaythrough",u.bind(this,this.C));a.d("playing",u.bind(this,this.C));a.d("seeked",u.bind(this,this.C));a.d("seeking",u.bind(this,this.show));a.d("seeked",u.bind(this,this.C));a.d("error",u.bind(this,this.show));a.d("waiting",u.bind(this,this.show))}});u.Wb.prototype.e=function(){return u.c.prototype.e.call(this,"div",{className:"vjs-loading-spinner"})};u.Wa=u.q.extend();
u.Wa.prototype.e=function(){return u.q.prototype.e.call(this,"div",{className:"vjs-big-play-button",innerHTML:'<span aria-hidden="true"></span>',"aria-label":"play video"})};u.Wa.prototype.p=function(){this.b.play()};
u.r=u.c.extend({i:function(a,c,d){u.c.call(this,a,c,d);var e,g;g=this;e=this.K();a=function(){if(e.controls()&&!e.Rb()){var a,c;g.d("mousedown",g.p);g.d("touchstart",function(a){a.preventDefault();a.stopPropagation();c=this.b.ja()});a=function(a){a.stopPropagation();c&&this.b.Mb()};g.d("touchmove",a);g.d("touchleave",a);g.d("touchcancel",a);g.d("touchend",a);var d,n,r;d=0;g.d("touchstart",function(){d=(new Date).getTime();r=f});a=function(){r=l};g.d("touchmove",a);g.d("touchleave",a);g.d("touchcancel",
a);g.d("touchend",function(){r===f&&(n=(new Date).getTime()-d,250>n&&this.j("tap"))});g.d("tap",g.md)}};c=u.bind(g,g.pd);this.L(a);e.d("controlsenabled",a);e.d("controlsdisabled",c)}});u.r.prototype.pd=function(){this.o("tap");this.o("touchstart");this.o("touchmove");this.o("touchleave");this.o("touchcancel");this.o("touchend");this.o("click");this.o("mousedown")};u.r.prototype.p=function(a){0===a.button&&this.K().controls()&&(this.K().paused()?this.K().play():this.K().pause())};
u.r.prototype.md=function(){this.K().ja(!this.K().ja())};u.r.prototype.m={volumeControl:f,fullscreenResize:l,progressEvents:l,timeupdateEvents:l};u.media={};u.media.Va="play pause paused currentTime setCurrentTime duration buffered volume setVolume muted setMuted width height supportsFullScreen enterFullScreen src load currentSrc preload setPreload autoplay setAutoplay loop setLoop error networkState readyState seeking initialTime startOffsetTime played seekable ended videoTracks audioTracks videoWidth videoHeight textTracks defaultPlaybackRate playbackRate mediaGroup controller controls defaultMuted".split(" ");
function ea(){var a=u.media.Va[i];return function(){throw Error('The "'+a+"\" method is not available on the playback technology's API");}}for(var i=u.media.Va.length-1;0<=i;i--)u.r.prototype[u.media.Va[i]]=ea();
u.l=u.r.extend({i:function(a,c,d){this.m.volumeControl=u.l.Uc();this.m.movingMediaElementInDOM=!u.Kc;this.m.fullscreenResize=f;u.r.call(this,a,c,d);(c=c.source)&&this.a.currentSrc===c.src&&0<this.a.networkState?a.j("loadstart"):c&&(this.a.src=c.src);if(u.ac&&a.options().nativeControlsForTouch!==l){var e,g,j,k;e=this;g=this.K();c=g.controls();e.a.controls=!!c;j=function(){e.a.controls=f};k=function(){e.a.controls=l};g.d("controlsenabled",j);g.d("controlsdisabled",k);c=function(){g.o("controlsenabled",
j);g.o("controlsdisabled",k)};e.d("dispose",c);g.d("usingcustomcontrols",c);g.Rb(f)}a.L(function(){this.M&&(this.g.autoplay&&this.paused())&&(delete this.M.poster,this.play())});for(a=u.l.$a.length-1;0<=a;a--)u.d(this.a,u.l.$a[a],u.bind(this.b,this.$c));this.Ua()}});t=u.l.prototype;t.D=function(){u.r.prototype.D.call(this)};
t.e=function(){var a=this.b,c=a.M,d;if(!c||this.m.movingMediaElementInDOM===l)c?(d=c.cloneNode(l),u.l.jc(c),c=d,a.M=h):c=u.e("video",{id:a.id()+"_html5_api",className:"vjs-tech"}),c.player=a,u.zb(c,a.w());d=["autoplay","preload","loop","muted"];for(var e=d.length-1;0<=e;e--){var g=d[e];a.g[g]!==h&&(c[g]=a.g[g])}return c};t.$c=function(a){this.j(a);a.stopPropagation()};t.play=function(){this.a.play()};t.pause=function(){this.a.pause()};t.paused=function(){return this.a.paused};t.currentTime=function(){return this.a.currentTime};
t.sd=function(a){try{this.a.currentTime=a}catch(c){u.log(c,"Video is not ready. (Video.js)")}};t.duration=function(){return this.a.duration||0};t.buffered=function(){return this.a.buffered};t.volume=function(){return this.a.volume};t.xd=function(a){this.a.volume=a};t.muted=function(){return this.a.muted};t.vd=function(a){this.a.muted=a};t.width=function(){return this.a.offsetWidth};t.height=function(){return this.a.offsetHeight};
t.Ta=function(){return"function"==typeof this.a.webkitEnterFullScreen&&(/Android/.test(u.F)||!/Chrome|Mac OS X 10.5/.test(u.F))?f:l};t.src=function(a){this.a.src=a};t.load=function(){this.a.load()};t.currentSrc=function(){return this.a.currentSrc};t.Qa=function(){return this.a.Qa};t.wd=function(a){this.a.Qa=a};t.autoplay=function(){return this.a.autoplay};t.rd=function(a){this.a.autoplay=a};t.controls=function(){return this.a.controls};t.loop=function(){return this.a.loop};
t.ud=function(a){this.a.loop=a};t.error=function(){return this.a.error};t.seeking=function(){return this.a.seeking};u.l.isSupported=function(){return!!u.na.canPlayType};u.l.mb=function(a){try{return!!u.na.canPlayType(a.type)}catch(c){return""}};u.l.Uc=function(){var a=u.na.volume;u.na.volume=a/2+0.1;return a!==u.na.volume};u.l.$a="loadstart suspend abort error emptied stalled loadedmetadata loadeddata canplay canplaythrough playing waiting seeking seeked ended durationchange timeupdate progress play pause ratechange volumechange".split(" ");
u.l.jc=function(a){if(a){a.player=h;for(a.parentNode&&a.parentNode.removeChild(a);a.hasChildNodes();)a.removeChild(a.firstChild);a.removeAttribute("src");"function"===typeof a.load&&a.load()}};u.Oc&&(document.createElement("video").constructor.prototype.canPlayType=function(a){return a&&-1!=a.toLowerCase().indexOf("video/mp4")?"maybe":""});
u.f=u.r.extend({i:function(a,c,d){u.r.call(this,a,c,d);var e=c.source;d=c.parentEl;var g=this.a=u.e("div",{id:a.id()+"_temp_flash"}),j=a.id()+"_flash_api";a=a.g;var k=u.k.B({readyFunction:"videojs.Flash.onReady",eventProxyFunction:"videojs.Flash.onEvent",errorEventProxyFunction:"videojs.Flash.onError",autoplay:a.autoplay,preload:a.Qa,loop:a.loop,muted:a.muted},c.flashVars),q=u.k.B({wmode:"opaque",bgcolor:"#000000"},c.params),n=u.k.B({id:j,name:j,"class":"vjs-tech"},c.attributes);e&&(e.type&&u.f.ed(e.type)?
(a=u.f.Ac(e.src),k.rtmpConnection=encodeURIComponent(a.rb),k.rtmpStream=encodeURIComponent(a.Ob)):k.src=encodeURIComponent(u.mc(e.src)));u.zb(g,d);c.startTime&&this.L(function(){this.load();this.play();this.currentTime(c.startTime)});if(c.iFrameMode===f&&!u.Jc){var r=u.e("iframe",{id:j+"_iframe",name:j+"_iframe",className:"vjs-tech",scrolling:"no",marginWidth:0,marginHeight:0,frameBorder:0});k.readyFunction="ready";k.eventProxyFunction="events";k.errorEventProxyFunction="errors";u.d(r,"load",u.bind(this,
function(){var a,d=r.contentWindow;a=r.contentDocument?r.contentDocument:r.contentWindow.document;a.write(u.f.nc(c.swf,k,q,n));d.player=this.b;d.ready=u.bind(this.b,function(c){var d=this.h;d.a=a.getElementById(c);u.f.pb(d)});d.events=u.bind(this.b,function(a,c){this&&"flash"===this.ia&&this.j(c)});d.errors=u.bind(this.b,function(a,c){u.log("Flash Error",c)})}));g.parentNode.replaceChild(r,g)}else u.f.Zc(c.swf,g,k,q,n)}});t=u.f.prototype;t.D=function(){u.r.prototype.D.call(this)};t.play=function(){this.a.vjs_play()};
t.pause=function(){this.a.vjs_pause()};t.src=function(a){u.f.dd(a)?(a=u.f.Ac(a),this.Qd(a.rb),this.Rd(a.Ob)):(a=u.mc(a),this.a.vjs_src(a));if(this.b.autoplay()){var c=this;setTimeout(function(){c.play()},0)}};t.currentSrc=function(){var a=this.a.vjs_getProperty("currentSrc");if(a==h){var c=this.Od(),d=this.Pd();c&&d&&(a=u.f.yd(c,d))}return a};t.load=function(){this.a.vjs_load()};t.poster=function(){this.a.vjs_getProperty("poster")};t.buffered=function(){return u.tb(0,this.a.vjs_getProperty("buffered"))};
t.Ta=s(l);var Q=u.f.prototype,R="rtmpConnection rtmpStream preload currentTime defaultPlaybackRate playbackRate autoplay loop mediaGroup controller controls volume muted defaultMuted".split(" "),S="error currentSrc networkState readyState seeking initialTime duration startOffsetTime paused played seekable ended videoTracks audioTracks videoWidth videoHeight textTracks".split(" ");
function fa(){var a=R[T],c=a.charAt(0).toUpperCase()+a.slice(1);Q["set"+c]=function(c){return this.a.vjs_setProperty(a,c)}}function U(a){Q[a]=function(){return this.a.vjs_getProperty(a)}}var T;for(T=0;T<R.length;T++)U(R[T]),fa();for(T=0;T<S.length;T++)U(S[T]);u.f.isSupported=function(){return 10<=u.f.version()[0]};u.f.mb=function(a){if(!a.type)return"";a=a.type.replace(/;.*/,"").toLowerCase();if(a in u.f.bd||a in u.f.Bc)return"maybe"};
u.f.bd={"video/flv":"FLV","video/x-flv":"FLV","video/mp4":"MP4","video/m4v":"MP4"};u.f.Bc={"rtmp/mp4":"MP4","rtmp/flv":"FLV"};u.f.onReady=function(a){a=u.w(a);var c=a.player||a.parentNode.player,d=c.h;a.player=c;d.a=a;u.f.pb(d)};u.f.pb=function(a){a.w().vjs_getProperty?a.Ua():setTimeout(function(){u.f.pb(a)},50)};u.f.onEvent=function(a,c){u.w(a).player.j(c)};u.f.onError=function(a,c){u.w(a).player.j("error");u.log("Flash Error",c,a)};
u.f.version=function(){var a="0,0,0";try{a=(new window.ActiveXObject("ShockwaveFlash.ShockwaveFlash")).GetVariable("$version").replace(/\D+/g,",").match(/^,?(.+),?$/)[1]}catch(c){try{navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin&&(a=(navigator.plugins["Shockwave Flash 2.0"]||navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g,",").match(/^,?(.+),?$/)[1])}catch(d){}}return a.split(",")};
u.f.Zc=function(a,c,d,e,g){a=u.f.nc(a,d,e,g);a=u.e("div",{innerHTML:a}).childNodes[0];d=c.parentNode;c.parentNode.replaceChild(a,c);var j=d.childNodes[0];setTimeout(function(){j.style.display="block"},1E3)};
u.f.nc=function(a,c,d,e){var g="",j="",k="";c&&u.k.ua(c,function(a,c){g+=a+"="+c+"&amp;"});d=u.k.B({movie:a,flashvars:g,allowScriptAccess:"always",allowNetworking:"all"},d);u.k.ua(d,function(a,c){j+='<param name="'+a+'" value="'+c+'" />'});e=u.k.B({data:a,width:"100%",height:"100%"},e);u.k.ua(e,function(a,c){k+=a+'="'+c+'" '});return'<object type="application/x-shockwave-flash"'+k+">"+j+"</object>"};u.f.yd=function(a,c){return a+"&"+c};
u.f.Ac=function(a){var c={rb:"",Ob:""};if(!a)return c;var d=a.indexOf("&"),e;-1!==d?e=d+1:(d=e=a.lastIndexOf("/")+1,0===d&&(d=e=a.length));c.rb=a.substring(0,d);c.Ob=a.substring(e,a.length);return c};u.f.ed=function(a){return a in u.f.Bc};u.f.Qc=/^rtmp[set]?:\/\//i;u.f.dd=function(a){return u.f.Qc.test(a)};
u.Pc=u.c.extend({i:function(a,c,d){u.c.call(this,a,c,d);if(!a.g.sources||0===a.g.sources.length){c=0;for(d=a.g.techOrder;c<d.length;c++){var e=u.$(d[c]),g=window.videojs[e];if(g&&g.isSupported()){I(a,e);break}}}else a.src(a.g.sources)}});function V(a){a.Aa=a.Aa||[];return a.Aa}function W(a,c,d){for(var e=a.Aa,g=0,j=e.length,k,q;g<j;g++)k=e[g],k.id()===c?(k.show(),q=k):d&&(k.J()==d&&0<k.mode())&&k.disable();(c=q?q.J():d?d:l)&&a.j(c+"trackchange")}
u.X=u.c.extend({i:function(a,c){u.c.call(this,a,c);this.Q=c.id||"vjs_"+c.kind+"_"+c.language+"_"+u.t++;this.xc=c.src;this.Wc=c["default"]||c.dflt;this.Ad=c.title;this.Ld=c.srclang;this.fd=c.label;this.fa=[];this.ec=[];this.ga=this.ha=0;this.b.d("fullscreenchange",u.bind(this,this.Rc))}});t=u.X.prototype;t.J=p("A");t.src=p("xc");t.ub=p("Wc");t.title=p("Ad");t.label=p("fd");t.readyState=p("ha");t.mode=p("ga");t.Rc=function(){this.a.style.fontSize=this.b.H?140*(screen.width/this.b.width())+"%":""};
t.e=function(){return u.c.prototype.e.call(this,"div",{className:"vjs-"+this.A+" vjs-text-track"})};t.show=function(){X(this);this.ga=2;u.c.prototype.show.call(this)};t.C=function(){X(this);this.ga=1;u.c.prototype.C.call(this)};t.disable=function(){2==this.ga&&this.C();this.b.o("timeupdate",u.bind(this,this.update,this.Q));this.b.o("ended",u.bind(this,this.reset,this.Q));this.reset();this.b.V.textTrackDisplay.removeChild(this);this.ga=0};
function X(a){0===a.ha&&a.load();0===a.ga&&(a.b.d("timeupdate",u.bind(a,a.update,a.Q)),a.b.d("ended",u.bind(a,a.reset,a.Q)),("captions"===a.A||"subtitles"===a.A)&&a.b.V.textTrackDisplay.Z(a))}t.load=function(){0===this.ha&&(this.ha=1,u.get(this.xc,u.bind(this,this.nd),u.bind(this,this.Gb)))};t.Gb=function(a){this.error=a;this.ha=3;this.j("error")};
t.nd=function(a){var c,d;a=a.split("\n");for(var e="",g=1,j=a.length;g<j;g++)if(e=u.trim(a[g])){-1==e.indexOf("--\x3e")?(c=e,e=u.trim(a[++g])):c=this.fa.length;c={id:c,index:this.fa.length};d=e.split(" --\x3e ");c.startTime=Y(d[0]);c.va=Y(d[1]);for(d=[];a[++g]&&(e=u.trim(a[g]));)d.push(e);c.text=d.join("<br/>");this.fa.push(c)}this.ha=2;this.j("loaded")};
function Y(a){var c=a.split(":");a=0;var d,e,g;3==c.length?(d=c[0],e=c[1],c=c[2]):(d=0,e=c[0],c=c[1]);c=c.split(/\s+/);c=c.splice(0,1)[0];c=c.split(/\.|,/);g=parseFloat(c[1]);c=c[0];a+=3600*parseFloat(d);a+=60*parseFloat(e);a+=parseFloat(c);g&&(a+=g/1E3);return a}
t.update=function(){if(0<this.fa.length){var a=this.b.currentTime();if(this.Lb===b||a<this.Lb||this.Ma<=a){var c=this.fa,d=this.b.duration(),e=0,g=l,j=[],k,q,n,r;a>=this.Ma||this.Ma===b?r=this.wb!==b?this.wb:0:(g=f,r=this.Db!==b?this.Db:c.length-1);for(;;){n=c[r];if(n.va<=a)e=Math.max(e,n.va),n.Ia&&(n.Ia=l);else if(a<n.startTime){if(d=Math.min(d,n.startTime),n.Ia&&(n.Ia=l),!g)break}else g?(j.splice(0,0,n),q===b&&(q=r),k=r):(j.push(n),k===b&&(k=r),q=r),d=Math.min(d,n.va),e=Math.max(e,n.startTime),
n.Ia=f;if(g)if(0===r)break;else r--;else if(r===c.length-1)break;else r++}this.ec=j;this.Ma=d;this.Lb=e;this.wb=k;this.Db=q;a=this.ec;c="";d=0;for(e=a.length;d<e;d++)c+='<span class="vjs-tt-cue">'+a[d].text+"</span>";this.a.innerHTML=c;this.j("cuechange")}}};t.reset=function(){this.Ma=0;this.Lb=this.b.duration();this.Db=this.wb=0};u.Ub=u.X.extend();u.Ub.prototype.A="captions";u.$b=u.X.extend();u.$b.prototype.A="subtitles";u.Vb=u.X.extend();u.Vb.prototype.A="chapters";
u.bc=u.c.extend({i:function(a,c,d){u.c.call(this,a,c,d);if(a.g.tracks&&0<a.g.tracks.length){c=this.b;a=a.g.tracks;var e;for(d=0;d<a.length;d++){e=a[d];var g=c,j=e.kind,k=e.label,q=e.language,n=e;e=g.Aa=g.Aa||[];n=n||{};n.kind=j;n.label=k;n.language=q;j=u.$(j||"subtitles");g=new window.videojs[j+"Track"](g,n);e.push(g)}}}});u.bc.prototype.e=function(){return u.c.prototype.e.call(this,"div",{className:"vjs-text-track-display"})};
u.Y=u.N.extend({i:function(a,c){var d=this.ca=c.track;c.label=d.label();c.selected=d.ub();u.N.call(this,a,c);this.b.d(d.J()+"trackchange",u.bind(this,this.update))}});u.Y.prototype.p=function(){u.N.prototype.p.call(this);W(this.b,this.ca.Q,this.ca.J())};u.Y.prototype.update=function(){this.selected(2==this.ca.mode())};u.bb=u.Y.extend({i:function(a,c){c.track={J:function(){return c.kind},K:a,label:function(){return c.kind+" off"},ub:s(l),mode:s(l)};u.Y.call(this,a,c);this.selected(f)}});
u.bb.prototype.p=function(){u.Y.prototype.p.call(this);W(this.b,this.ca.Q,this.ca.J())};u.bb.prototype.update=function(){for(var a=V(this.b),c=0,d=a.length,e,g=f;c<d;c++)e=a[c],e.J()==this.ca.J()&&2==e.mode()&&(g=l);this.selected(g)};u.S=u.R.extend({i:function(a,c){u.R.call(this,a,c);1>=this.I.length&&this.C()}});u.S.prototype.ta=function(){var a=[],c;a.push(new u.bb(this.b,{kind:this.A}));for(var d=0;d<V(this.b).length;d++)c=V(this.b)[d],c.J()===this.A&&a.push(new u.Y(this.b,{track:c}));return a};
u.Da=u.S.extend({i:function(a,c,d){u.S.call(this,a,c,d);this.a.setAttribute("aria-label","Captions Menu")}});u.Da.prototype.A="captions";u.Da.prototype.qa="Captions";u.Da.prototype.className="vjs-captions-button";u.Ha=u.S.extend({i:function(a,c,d){u.S.call(this,a,c,d);this.a.setAttribute("aria-label","Subtitles Menu")}});u.Ha.prototype.A="subtitles";u.Ha.prototype.qa="Subtitles";u.Ha.prototype.className="vjs-subtitles-button";
u.Ea=u.S.extend({i:function(a,c,d){u.S.call(this,a,c,d);this.a.setAttribute("aria-label","Chapters Menu")}});t=u.Ea.prototype;t.A="chapters";t.qa="Chapters";t.className="vjs-chapters-button";t.ta=function(){for(var a=[],c,d=0;d<V(this.b).length;d++)c=V(this.b)[d],c.J()===this.A&&a.push(new u.Y(this.b,{track:c}));return a};
t.Ka=function(){for(var a=V(this.b),c=0,d=a.length,e,g,j=this.I=[];c<d;c++)if(e=a[c],e.J()==this.A&&e.ub()){if(2>e.readyState()){this.Id=e;e.d("loaded",u.bind(this,this.Ka));return}g=e;break}a=this.wa=new u.ma(this.b);a.a.appendChild(u.e("li",{className:"vjs-menu-title",innerHTML:u.$(this.A),zd:-1}));if(g){e=g.fa;for(var k,c=0,d=e.length;c<d;c++)k=e[c],k=new u.Xa(this.b,{track:g,cue:k}),j.push(k),a.Z(k)}0<this.I.length&&this.show();return a};
u.Xa=u.N.extend({i:function(a,c){var d=this.ca=c.track,e=this.cue=c.cue,g=a.currentTime();c.label=e.text;c.selected=e.startTime<=g&&g<e.va;u.N.call(this,a,c);d.d("cuechange",u.bind(this,this.update))}});u.Xa.prototype.p=function(){u.N.prototype.p.call(this);this.b.currentTime(this.cue.startTime);this.update(this.cue.startTime)};u.Xa.prototype.update=function(){var a=this.cue,c=this.b.currentTime();this.selected(a.startTime<=c&&c<a.va)};
u.k.B(u.Fa.prototype.g.children,{subtitlesButton:{},captionsButton:{},chaptersButton:{}});
if("undefined"!==typeof window.JSON&&"function"===window.JSON.parse)u.JSON=window.JSON;else{u.JSON={};var Z=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;u.JSON.parse=function(a,c){function d(a,e){var k,q,n=a[e];if(n&&"object"===typeof n)for(k in n)Object.prototype.hasOwnProperty.call(n,k)&&(q=d(n,k),q!==b?n[k]=q:delete n[k]);return c.call(a,e,n)}var e;a=String(a);Z.lastIndex=0;Z.test(a)&&(a=a.replace(Z,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));
if(/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return e=eval("("+a+")"),"function"===typeof c?d({"":e},""):e;throw new SyntaxError("JSON.parse(): invalid or malformed JSON data");}}
u.fc=function(){var a,c,d=document.getElementsByTagName("video");if(d&&0<d.length)for(var e=0,g=d.length;e<g;e++)if((c=d[e])&&c.getAttribute)c.player===b&&(a=c.getAttribute("data-setup"),a!==h&&(a=u.JSON.parse(a||"{}"),v(c,a)));else{u.kb();break}else u.Ec||u.kb()};u.kb=function(){setTimeout(u.fc,1)};"complete"===document.readyState?u.Ec=f:u.U(window,"load",function(){u.Ec=f});u.kb();u.od=function(a,c){u.s.prototype[a]=c};var ga=this;ga.Ed=f;function $(a,c){var d=a.split("."),e=ga;!(d[0]in e)&&e.execScript&&e.execScript("var "+d[0]);for(var g;d.length&&(g=d.shift());)!d.length&&c!==b?e[g]=c:e=e[g]?e[g]:e[g]={}};$("videojs",u);$("_V_",u);$("videojs.options",u.options);$("videojs.players",u.xa);$("videojs.TOUCH_ENABLED",u.ac);$("videojs.cache",u.ra);$("videojs.Component",u.c);u.c.prototype.player=u.c.prototype.K;u.c.prototype.dispose=u.c.prototype.D;u.c.prototype.createEl=u.c.prototype.e;u.c.prototype.el=u.c.prototype.w;u.c.prototype.addChild=u.c.prototype.Z;u.c.prototype.children=u.c.prototype.children;u.c.prototype.on=u.c.prototype.d;u.c.prototype.off=u.c.prototype.o;u.c.prototype.one=u.c.prototype.U;
u.c.prototype.trigger=u.c.prototype.j;u.c.prototype.triggerReady=u.c.prototype.Ua;u.c.prototype.show=u.c.prototype.show;u.c.prototype.hide=u.c.prototype.C;u.c.prototype.width=u.c.prototype.width;u.c.prototype.height=u.c.prototype.height;u.c.prototype.dimensions=u.c.prototype.Xc;u.c.prototype.ready=u.c.prototype.L;u.c.prototype.addClass=u.c.prototype.n;u.c.prototype.removeClass=u.c.prototype.u;$("videojs.Player",u.s);u.s.prototype.dispose=u.s.prototype.D;u.s.prototype.requestFullScreen=u.s.prototype.ya;
u.s.prototype.cancelFullScreen=u.s.prototype.ob;u.s.prototype.bufferedPercent=u.s.prototype.Ja;u.s.prototype.usingNativeControls=u.s.prototype.Rb;u.s.prototype.reportUserActivity=u.s.prototype.Mb;u.s.prototype.userActive=u.s.prototype.ja;$("videojs.MediaLoader",u.Pc);$("videojs.TextTrackDisplay",u.bc);$("videojs.ControlBar",u.Fa);$("videojs.Button",u.q);$("videojs.PlayToggle",u.Yb);$("videojs.FullscreenToggle",u.Ga);$("videojs.BigPlayButton",u.Wa);$("videojs.LoadingSpinner",u.Wb);
$("videojs.CurrentTimeDisplay",u.Ya);$("videojs.DurationDisplay",u.Za);$("videojs.TimeDivider",u.cc);$("videojs.RemainingTimeDisplay",u.fb);$("videojs.Slider",u.O);$("videojs.ProgressControl",u.eb);$("videojs.SeekBar",u.Zb);$("videojs.LoadProgressBar",u.ab);$("videojs.PlayProgressBar",u.Xb);$("videojs.SeekHandle",u.gb);$("videojs.VolumeControl",u.ib);$("videojs.VolumeBar",u.hb);$("videojs.VolumeLevel",u.dc);$("videojs.VolumeMenuButton",u.oa);$("videojs.VolumeHandle",u.jb);$("videojs.MuteToggle",u.da);
$("videojs.PosterImage",u.cb);$("videojs.Menu",u.ma);$("videojs.MenuItem",u.N);$("videojs.MenuButton",u.R);u.R.prototype.createItems=u.R.prototype.ta;u.S.prototype.createItems=u.S.prototype.ta;u.Ea.prototype.createItems=u.Ea.prototype.ta;$("videojs.SubtitlesButton",u.Ha);$("videojs.CaptionsButton",u.Da);$("videojs.ChaptersButton",u.Ea);$("videojs.MediaTechController",u.r);u.r.prototype.features=u.r.prototype.m;u.r.prototype.m.volumeControl=u.r.prototype.m.Dc;u.r.prototype.m.fullscreenResize=u.r.prototype.m.Jd;
u.r.prototype.m.progressEvents=u.r.prototype.m.Nd;u.r.prototype.m.timeupdateEvents=u.r.prototype.m.Sd;$("videojs.Html5",u.l);u.l.Events=u.l.$a;u.l.isSupported=u.l.isSupported;u.l.canPlaySource=u.l.mb;u.l.prototype.setCurrentTime=u.l.prototype.sd;u.l.prototype.setVolume=u.l.prototype.xd;u.l.prototype.setMuted=u.l.prototype.vd;u.l.prototype.setPreload=u.l.prototype.wd;u.l.prototype.setAutoplay=u.l.prototype.rd;u.l.prototype.setLoop=u.l.prototype.ud;$("videojs.Flash",u.f);u.f.isSupported=u.f.isSupported;
u.f.canPlaySource=u.f.mb;u.f.onReady=u.f.onReady;$("videojs.TextTrack",u.X);u.X.prototype.label=u.X.prototype.label;$("videojs.CaptionsTrack",u.Ub);$("videojs.SubtitlesTrack",u.$b);$("videojs.ChaptersTrack",u.Vb);$("videojs.autoSetup",u.fc);$("videojs.plugin",u.od);$("videojs.createTimeRange",u.tb);})();
/**
 * alertify
 * An unobtrusive customizable JavaScript notification system
 *
 * @author Fabien Doiron <fabien.doiron@gmail.com>
 * @copyright Fabien Doiron 2013
 * @license MIT <http://opensource.org/licenses/mit-license.php>
 * @link http://fabien-d.github.com/alertify.js/
 * @module alertify
 * @version 0.3.11
 */
(function (global, undefined) {
	"use strict";

	var document = global.document,
	    Alertify;

	Alertify = function () {

		var _alertify = {},
		    dialogs   = {},
		    isopen    = false,
		    keys      = { ENTER: 13, ESC: 27, SPACE: 32 },
		    queue     = [],
		    $, btnCancel, btnOK, btnReset, btnResetBack, btnFocus, elCallee, elCover, elDialog, elLog, form, input, getTransitionEvent;

		/**
		 * Markup pieces
		 * @type {Object}
		 */
		dialogs = {
			buttons : {
				holder : "<nav class=\"alertify-buttons\">{{buttons}}</nav>",
				submit : "<button type=\"submit\" class=\"alertify-button alertify-button-ok\" id=\"alertify-ok\">{{ok}}</button>",
				ok     : "<button class=\"alertify-button alertify-button-ok\" id=\"alertify-ok\">{{ok}}</button>",
				cancel : "<button class=\"alertify-button alertify-button-cancel\" id=\"alertify-cancel\">{{cancel}}</button>"
			},
			input   : "<div class=\"alertify-text-wrapper\"><input type=\"text\" class=\"alertify-text\" id=\"alertify-text\"></div>",
			message : "<p class=\"alertify-message\">{{message}}</p>",
			log     : "<article class=\"alertify-log{{class}}\">{{message}}</article>"
		};

		/**
		 * Return the proper transitionend event
		 * @return {String}    Transition type string
		 */
		getTransitionEvent = function () {
			var t,
			    type,
			    supported   = false,
			    el          = document.createElement("fakeelement"),
			    transitions = {
				    "WebkitTransition" : "webkitTransitionEnd",
				    "MozTransition"    : "transitionend",
				    "OTransition"      : "otransitionend",
				    "transition"       : "transitionend"
			    };

			for (t in transitions) {
				if (el.style[t] !== undefined) {
					type      = transitions[t];
					supported = true;
					break;
				}
			}

			return {
				type      : type,
				supported : supported
			};
		};

		/**
		 * Shorthand for document.getElementById()
		 *
		 * @param  {String} id    A specific element ID
		 * @return {Object}       HTML element
		 */
		$ = function (id) {
			return document.getElementById(id);
		};

		/**
		 * Alertify private object
		 * @type {Object}
		 */
		_alertify = {

			/**
			 * Labels object
			 * @type {Object}
			 */
			labels : {
				ok     : "OK",
				cancel : "Cancel"
			},

			/**
			 * Delay number
			 * @type {Number}
			 */
			delay : 5000,

			/**
			 * Whether buttons are reversed (default is secondary/primary)
			 * @type {Boolean}
			 */
			buttonReverse : false,

			/**
			 * Which button should be focused by default
			 * @type {String}	"ok" (default), "cancel", or "none"
			 */
			buttonFocus : "ok",

			/**
			 * Set the transition event on load
			 * @type {[type]}
			 */
			transition : undefined,

			/**
			 * Set the proper button click events
			 *
			 * @param {Function} fn    [Optional] Callback function
			 *
			 * @return {undefined}
			 */
			addListeners : function (fn) {
				var hasOK     = (typeof btnOK !== "undefined"),
				    hasCancel = (typeof btnCancel !== "undefined"),
				    hasInput  = (typeof input !== "undefined"),
				    val       = "",
				    self      = this,
				    ok, cancel, common, key, reset;

				// ok event handler
				ok = function (event) {
					if (typeof event.preventDefault !== "undefined") event.preventDefault();
					common(event);
					if (typeof input !== "undefined") val = input.value;
					if (typeof fn === "function") {
						if (typeof input !== "undefined") {
							fn(true, val);
						}
						else fn(true);
					}
					return false;
				};

				// cancel event handler
				cancel = function (event) {
					if (typeof event.preventDefault !== "undefined") event.preventDefault();
					common(event);
					if (typeof fn === "function") fn(false);
					return false;
				};

				// common event handler (keyup, ok and cancel)
				common = function (event) {
					self.hide();
					self.unbind(document.body, "keyup", key);
					self.unbind(btnReset, "focus", reset);
					if (hasOK) self.unbind(btnOK, "click", ok);
					if (hasCancel) self.unbind(btnCancel, "click", cancel);
				};

				// keyup handler
				key = function (event) {
					var keyCode = event.keyCode;
					if ((keyCode === keys.SPACE && !hasInput) || (hasInput && keyCode === keys.ENTER)) ok(event);
					if (keyCode === keys.ESC && hasCancel) cancel(event);
				};

				// reset focus to first item in the dialog
				reset = function (event) {
					if (hasInput) input.focus();
					else if (!hasCancel || self.buttonReverse) btnOK.focus();
					else btnCancel.focus();
				};

				// handle reset focus link
				// this ensures that the keyboard focus does not
				// ever leave the dialog box until an action has
				// been taken
				this.bind(btnReset, "focus", reset);
				this.bind(btnResetBack, "focus", reset);
				// handle OK click
				if (hasOK) this.bind(btnOK, "click", ok);
				// handle Cancel click
				if (hasCancel) this.bind(btnCancel, "click", cancel);
				// listen for keys, Cancel => ESC
				this.bind(document.body, "keyup", key);
				if (!this.transition.supported) {
					this.setFocus();
				}
			},

			/**
			 * Bind events to elements
			 *
			 * @param  {Object}   el       HTML Object
			 * @param  {Event}    event    Event to attach to element
			 * @param  {Function} fn       Callback function
			 *
			 * @return {undefined}
			 */
			bind : function (el, event, fn) {
				if (typeof el.addEventListener === "function") {
					el.addEventListener(event, fn, false);
				} else if (el.attachEvent) {
					el.attachEvent("on" + event, fn);
				}
			},

			/**
			 * Use alertify as the global error handler (using window.onerror)
			 *
			 * @return {boolean} success
			 */
			handleErrors : function () {
				if (typeof global.onerror !== "undefined") {
					var self = this;
					global.onerror = function (msg, url, line) {
						self.error("[" + msg + " on line " + line + " of " + url + "]", 0);
					};
					return true;
				} else {
					return false;
				}
			},

			/**
			 * Append button HTML strings
			 *
			 * @param {String} secondary    The secondary button HTML string
			 * @param {String} primary      The primary button HTML string
			 *
			 * @return {String}             The appended button HTML strings
			 */
			appendButtons : function (secondary, primary) {
				return this.buttonReverse ? primary + secondary : secondary + primary;
			},

			/**
			 * Build the proper message box
			 *
			 * @param  {Object} item    Current object in the queue
			 *
			 * @return {String}         An HTML string of the message box
			 */
			build : function (item) {
				var html    = "",
				    type    = item.type,
				    message = item.message,
				    css     = item.cssClass || "";

				html += "<div class=\"alertify-dialog\">";
				html += "<a id=\"alertify-resetFocusBack\" class=\"alertify-resetFocus\" href=\"#\">Reset Focus</a>";

				if (_alertify.buttonFocus === "none") html += "<a href=\"#\" id=\"alertify-noneFocus\" class=\"alertify-hidden\"></a>";

				// doens't require an actual form
				if (type === "prompt") html += "<div id=\"alertify-form\">";

				html += "<article class=\"alertify-inner\">";
				html += dialogs.message.replace("{{message}}", message);

				if (type === "prompt") html += dialogs.input;

				html += dialogs.buttons.holder;
				html += "</article>";

				if (type === "prompt") html += "</div>";

				html += "<a id=\"alertify-resetFocus\" class=\"alertify-resetFocus\" href=\"#\">Reset Focus</a>";
				html += "</div>";

				switch (type) {
				case "confirm":
					html = html.replace("{{buttons}}", this.appendButtons(dialogs.buttons.cancel, dialogs.buttons.ok));
					html = html.replace("{{ok}}", this.labels.ok).replace("{{cancel}}", this.labels.cancel);
					break;
				case "prompt":
					html = html.replace("{{buttons}}", this.appendButtons(dialogs.buttons.cancel, dialogs.buttons.submit));
					html = html.replace("{{ok}}", this.labels.ok).replace("{{cancel}}", this.labels.cancel);
					break;
				case "alert":
					html = html.replace("{{buttons}}", dialogs.buttons.ok);
					html = html.replace("{{ok}}", this.labels.ok);
					break;
				default:
					break;
				}

				elDialog.className = "alertify alertify-" + type + " " + css;
				elCover.className  = "alertify-cover";
				return html;
			},

			/**
			 * Close the log messages
			 *
			 * @param  {Object} elem    HTML Element of log message to close
			 * @param  {Number} wait    [optional] Time (in ms) to wait before automatically hiding the message, if 0 never hide
			 *
			 * @return {undefined}
			 */
			close : function (elem, wait) {
				// Unary Plus: +"2" === 2
				var timer = (wait && !isNaN(wait)) ? +wait : this.delay,
				    self  = this,
				    hideElement, transitionDone;

				// set click event on log messages
				this.bind(elem, "click", function () {
					hideElement(elem);
				});
				// Hide the dialog box after transition
				// This ensure it doens't block any element from being clicked
				transitionDone = function (event) {
					event.stopPropagation();
					// unbind event so function only gets called once
					self.unbind(this, self.transition.type, transitionDone);
					// remove log message
					elLog.removeChild(this);
					if (!elLog.hasChildNodes()) elLog.className += " alertify-logs-hidden";
				};
				// this sets the hide class to transition out
				// or removes the child if css transitions aren't supported
				hideElement = function (el) {
					// ensure element exists
					if (typeof el !== "undefined" && el.parentNode === elLog) {
						// whether CSS transition exists
						if (self.transition.supported) {
							self.bind(el, self.transition.type, transitionDone);
							el.className += " alertify-log-hide";
						} else {
							elLog.removeChild(el);
							if (!elLog.hasChildNodes()) elLog.className += " alertify-logs-hidden";
						}
					}
				};
				// never close (until click) if wait is set to 0
				if (wait === 0) return;
				// set timeout to auto close the log message
				setTimeout(function () { hideElement(elem); }, timer);
			},

			/**
			 * Create a dialog box
			 *
			 * @param  {String}   message        The message passed from the callee
			 * @param  {String}   type           Type of dialog to create
			 * @param  {Function} fn             [Optional] Callback function
			 * @param  {String}   placeholder    [Optional] Default value for prompt input field
			 * @param  {String}   cssClass       [Optional] Class(es) to append to dialog box
			 *
			 * @return {Object}
			 */
			dialog : function (message, type, fn, placeholder, cssClass) {
				// set the current active element
				// this allows the keyboard focus to be resetted
				// after the dialog box is closed
				elCallee = document.activeElement;
				// check to ensure the alertify dialog element
				// has been successfully created
				var check = function () {
					if ((elLog && elLog.scrollTop !== null) && (elCover && elCover.scrollTop !== null)) return;
					else check();
				};
				// error catching
				if (typeof message !== "string") throw new Error("message must be a string");
				if (typeof type !== "string") throw new Error("type must be a string");
				if (typeof fn !== "undefined" && typeof fn !== "function") throw new Error("fn must be a function");
				// initialize alertify if it hasn't already been done
				this.init();
				check();

				queue.push({ type: type, message: message, callback: fn, placeholder: placeholder, cssClass: cssClass });
				if (!isopen) this.setup();

				return this;
			},

			/**
			 * Extend the log method to create custom methods
			 *
			 * @param  {String} type    Custom method name
			 *
			 * @return {Function}
			 */
			extend : function (type) {
				if (typeof type !== "string") throw new Error("extend method must have exactly one paramter");
				return function (message, wait) {
					this.log(message, type, wait);
					return this;
				};
			},

			/**
			 * Hide the dialog and rest to defaults
			 *
			 * @return {undefined}
			 */
			hide : function () {
				var transitionDone,
				    self = this;
				// remove reference from queue
				queue.splice(0,1);
				// if items remaining in the queue
				if (queue.length > 0) this.setup(true);
				else {
					isopen = false;
					// Hide the dialog box after transition
					// This ensure it doens't block any element from being clicked
					transitionDone = function (event) {
						event.stopPropagation();
						// unbind event so function only gets called once
						self.unbind(elDialog, self.transition.type, transitionDone);
					};
					// whether CSS transition exists
					if (this.transition.supported) {
						this.bind(elDialog, this.transition.type, transitionDone);
						elDialog.className = "alertify alertify-hide alertify-hidden";
					} else {
						elDialog.className = "alertify alertify-hide alertify-hidden alertify-isHidden";
					}
					elCover.className  = "alertify-cover alertify-cover-hidden";
					// set focus to the last element or body
					// after the dialog is closed
					elCallee.focus();
				}
			},

			/**
			 * Initialize Alertify
			 * Create the 2 main elements
			 *
			 * @return {undefined}
			 */
			init : function () {
				// ensure legacy browsers support html5 tags
				document.createElement("nav");
				document.createElement("article");
				document.createElement("section");
				// cover
				if ($("alertify-cover") == null) {
					elCover = document.createElement("div");
					elCover.setAttribute("id", "alertify-cover");
					elCover.className = "alertify-cover alertify-cover-hidden";
					document.body.appendChild(elCover);
				}
				// main element
				if ($("alertify") == null) {
					isopen = false;
					queue = [];
					elDialog = document.createElement("section");
					elDialog.setAttribute("id", "alertify");
					elDialog.className = "alertify alertify-hidden";
					document.body.appendChild(elDialog);
				}
				// log element
				if ($("alertify-logs") == null) {
					elLog = document.createElement("section");
					elLog.setAttribute("id", "alertify-logs");
					elLog.className = "alertify-logs alertify-logs-hidden";
					document.body.appendChild(elLog);
				}
				// set tabindex attribute on body element
				// this allows script to give it focus
				// after the dialog is closed
				document.body.setAttribute("tabindex", "0");
				// set transition type
				this.transition = getTransitionEvent();
			},

			/**
			 * Show a new log message box
			 *
			 * @param  {String} message    The message passed from the callee
			 * @param  {String} type       [Optional] Optional type of log message
			 * @param  {Number} wait       [Optional] Time (in ms) to wait before auto-hiding the log
			 *
			 * @return {Object}
			 */
			log : function (message, type, wait) {
				// check to ensure the alertify dialog element
				// has been successfully created
				var check = function () {
					if (elLog && elLog.scrollTop !== null) return;
					else check();
				};
				// initialize alertify if it hasn't already been done
				this.init();
				check();

				elLog.className = "alertify-logs";
				this.notify(message, type, wait);
				return this;
			},

			/**
			 * Add new log message
			 * If a type is passed, a class name "alertify-log-{type}" will get added.
			 * This allows for custom look and feel for various types of notifications.
			 *
			 * @param  {String} message    The message passed from the callee
			 * @param  {String} type       [Optional] Type of log message
			 * @param  {Number} wait       [Optional] Time (in ms) to wait before auto-hiding
			 *
			 * @return {undefined}
			 */
			notify : function (message, type, wait) {
				var log = document.createElement("article");
				log.className = "alertify-log" + ((typeof type === "string" && type !== "") ? " alertify-log-" + type : "");
				log.innerHTML = message;
				// append child
				elLog.appendChild(log);
				// triggers the CSS animation
				setTimeout(function() { log.className = log.className + " alertify-log-show"; }, 50);
				this.close(log, wait);
			},

			/**
			 * Set properties
			 *
			 * @param {Object} args     Passing parameters
			 *
			 * @return {undefined}
			 */
			set : function (args) {
				var k;
				// error catching
				if (typeof args !== "object" && args instanceof Array) throw new Error("args must be an object");
				// set parameters
				for (k in args) {
					if (args.hasOwnProperty(k)) {
						this[k] = args[k];
					}
				}
			},

			/**
			 * Common place to set focus to proper element
			 *
			 * @return {undefined}
			 */
			setFocus : function () {
				if (input) {
					input.focus();
					input.select();
				}
				else btnFocus.focus();
			},

			/**
			 * Initiate all the required pieces for the dialog box
			 *
			 * @return {undefined}
			 */
			setup : function (fromQueue) {
				var item = queue[0],
				    self = this,
				    transitionDone;

				// dialog is open
				isopen = true;
				// Set button focus after transition
				transitionDone = function (event) {
					event.stopPropagation();
					self.setFocus();
					// unbind event so function only gets called once
					self.unbind(elDialog, self.transition.type, transitionDone);
				};
				// whether CSS transition exists
				if (this.transition.supported && !fromQueue) {
					this.bind(elDialog, this.transition.type, transitionDone);
				}
				// build the proper dialog HTML
				elDialog.innerHTML = this.build(item);
				// assign all the common elements
				btnReset  = $("alertify-resetFocus");
				btnResetBack  = $("alertify-resetFocusBack");
				btnOK     = $("alertify-ok")     || undefined;
				btnCancel = $("alertify-cancel") || undefined;
				btnFocus  = (_alertify.buttonFocus === "cancel") ? btnCancel : ((_alertify.buttonFocus === "none") ? $("alertify-noneFocus") : btnOK),
				input     = $("alertify-text")   || undefined;
				form      = $("alertify-form")   || undefined;
				// add placeholder value to the input field
				if (typeof item.placeholder === "string" && item.placeholder !== "") input.value = item.placeholder;
				if (fromQueue) this.setFocus();
				this.addListeners(item.callback);
			},

			/**
			 * Unbind events to elements
			 *
			 * @param  {Object}   el       HTML Object
			 * @param  {Event}    event    Event to detach to element
			 * @param  {Function} fn       Callback function
			 *
			 * @return {undefined}
			 */
			unbind : function (el, event, fn) {
				if (typeof el.removeEventListener === "function") {
					el.removeEventListener(event, fn, false);
				} else if (el.detachEvent) {
					el.detachEvent("on" + event, fn);
				}
			}
		};

		return {
			alert   : function (message, fn, cssClass) { _alertify.dialog(message, "alert", fn, "", cssClass); return this; },
			confirm : function (message, fn, cssClass) { _alertify.dialog(message, "confirm", fn, "", cssClass); return this; },
			extend  : _alertify.extend,
			init    : _alertify.init,
			log     : function (message, type, wait) { _alertify.log(message, type, wait); return this; },
			prompt  : function (message, fn, placeholder, cssClass) { _alertify.dialog(message, "prompt", fn, placeholder, cssClass); return this; },
			success : function (message, wait) { _alertify.log(message, "success", wait); return this; },
			error   : function (message, wait) { _alertify.log(message, "error", wait); return this; },
			set     : function (args) { _alertify.set(args); },
			labels  : _alertify.labels,
			debug   : _alertify.handleErrors
		};
	};

	// AMD and window support
	if (typeof define === "function") {
		define([], function () { return new Alertify(); });
	} else if (typeof global.alertify === "undefined") {
		global.alertify = new Alertify();
	}

}(this));
/**
 * Dependencies
 * 	jquery-1.8.3
 *
 */
(function($) {
    $.fn.appendAt = function(element, index) {
        var children = this.children();
        if (index < 0) {
            this.append(element);
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
alertify.reset = function() {
    alertify.set({
        'labels' : {
            'ok' : 'OK',
            'cancel' : 'Cancel'
        },
        'delay' : 5000,
        'buttonReverse' : false,
        'buttonFocus' : 'ok'
    });
};
andrea.blink.declare('andrea.grace');
(function() {
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
    AppConst.ACTION_SAVE_COLLABORATION = "ACTION_SAVE_COLLABORATION";
    AppConst.ACTION_LOAD_COLLABORATION = "ACTION_LOAD_COLLABORATION";
    /**
     * Notifications
     */
    AppConst.NOTIFICATION_DATA_PROVIDER_CHANGED = "NOTIFICATION_DATA_PROVIDER_CHANGED";
    AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED = "NOTIFICATION_VIZ_CONTEXT_CHANGED";
    AppConst.NOTIFICATION_VIZ_CONTEXT_APPLIED = "NOTIFICATION_VIZ_CONTEXT_APPLIED";
    AppConst.NOTIFICATION_VIZ_CONTEXT_RESET = "NOTIFICATION_VIZ_CONTEXT_RESET";

    AppConst.NOTIFICATION_VIEW_PASTE_TO = "NOTIFICATION_VIEW_PASTE_TO";
    
    AppConst.NOTIFICATION_ACTION_SAVE_COLLABORATION_START = "NOTIFICATION_ACTION_SAVE_COLLABORATION_START";
    AppConst.NOTIFICATION_ACTION_SAVE_COLLABORATION_COMPLETE = "NOTIFICATION_ACTION_SAVE_COLLABORATION_COMPLETE";

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

    andrea.blink.declare("andrea.grace.constants.TaobaoAPI");

    /**
     * TODO Remove this class
     * It seems no needed
     */
    var TaobaoAPI = grace.constants.TaobaoAPI = {
        'trade' : {
        }
    };

    TaobaoAPI.trade.status = {
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
    };

    TaobaoAPI.trade.type = {
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
    TaobaoAPI.trade.shipping_type = {
        'free' : '卖家包邮',
        'post' : '平邮',
        'express' : '快递',
        'ems' : 'EMS',
        'virtual' : '虚拟发货',
        '25' : '次日必达',
        '26' : '预约配送'
    };

    TaobaoAPI.trade.trade_from = {
        'WAP' : '手机',
        'HITAO' : '嗨淘',
        'TOP' : 'TOP平台',
        'TAOBAO' : '普通淘宝',
        'JHS' : '聚划算'
    };
    TaobaoAPI.isKey = function(type, id) {
        return TaobaoAPI[type] != null && TaobaoAPI[type][id] != null;
    };
    TaobaoAPI.toCaption = function(key, type, id) {
        if (TaobaoAPI.isKey(type, id)) {
            if (id === 'trade_from') {
                var ids = id.split(',');
                if (ids.length > 1) {
                    var captions = [];
                    _.each(ids, function(id) {
                        captions.push(TaobaoAPI.toCaption(key, type, id));
                    });
                    return captions.join('，');
                }
            }
            return TaobaoAPI[type][id][key];
        } else {
            return key;
        }
    };
})();
(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.constants.JingdongAPI");

    /**
     * TODO Remove this class
     * It seems no needed
     */
    var JingdongAPI = grace.constants.JingdongAPI = {
        'order' : {},
        'coupon' : {}
    };

    JingdongAPI.order.pay_type = {
        '1' : '货到付款',
        '2' : '邮局汇款',
        '3' : '自提',
        '4' : '在线支付',
        '5' : '公司转账',
        '6' : '银行转账'
    };
    JingdongAPI.order.delivery_type = {
        '1' : '只工作日送货',
        '2' : '只双休日、假日送货',
        '3' : '工作日、双休日与假日均可送货',
        '*' : '任意时间'
    };
    JingdongAPI.order.order_state = {
        'WAIT_SELLER_STOCK_OUT' : '等待出库',
        // 只适用于LBP，SOPL商家
        'SEND_TO_DISTRIBUTION_CENER' : '发往配送中心',
        // 只适用于LBP，SOPL商家
        'DISTRIBUTION_CENTER_RECEIVED' : '配送中心已收货',
        'WAIT_GOODS_RECEIVE_CONFIRM' : '等待确认收货',
        // 只适用于LBP，SOPL商家
        'RECEIPTS_CONFIRM' : '收款确认（服务完成）',
        // 只适用于海外购商家，等待境内发货 标签下的订单
        'WAIT_SELLER_DELIVERY' : '等待发货',
        'FINISHED_L' : '完成',
        // 取消的订单不返回收货人基本信息
        'TRADE_CANCELED' : '取消',
        // 锁定的订单不返回收货人基本信息
        'LOCKED' : '已锁定'
    };
    JingdongAPI.coupon.coupon_type = {
        '20' : '套装优惠',
        '28' : '闪团优惠',
        '29' : '团购优惠',
        '30' : '单品促销优惠',
        '34' : '手机红包',
        '35' : '满返满送(返现)',
        '39' : '京豆优惠',
        '41' : '京东券优惠',
        '52' : '礼品卡优惠',
        '100' : '店铺优惠'
    };

    // TODO Move to utils
    JingdongAPI.isKey = function(type, id) {
        return JingdongAPI[type] != null && JingdongAPI[type][id] != null;
    };
    // TODO Handler * as key
    JingdongAPI.toCaption = function(key, type, id) {
        if (JingdongAPI.isKey(type, id)) {
            if (id === 'trade_from') {
                var ids = id.split(',');
                if (ids.length > 1) {
                    var captions = [];
                    _.each(ids, function(id) {
                        captions.push(JingdongAPI.toCaption(key, type, id));
                    });
                    return captions.join('，');
                }
            }
            return JingdongAPI[type][id][key];
        } else {
            return key;
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
        };
        var loadClassification = function(classification, name) {
            Operation._CLASSIFICATION_TO_NAME[classification] = name;
        };
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
        loadType(OperationClassification.GROUP, OperationType.GROUP_MONTH, '分月 (1-12)', '月');
        loadType(OperationClassification.GROUP, OperationType.GROUP_DATE, '分日 (1-31)', '日');
        loadType(OperationClassification.GROUP, OperationType.GROUP_DAY, '分星期 (1-7)', '星');
        loadType(OperationClassification.GROUP, OperationType.GROUP_HOUR, '分时 (0-23)', '时');
    };
    Operation._loadClass();

    Operation.getTypes = function(classification) {
        return Operation._CLASSIFICATION_TO_TYPES[classification];
    };

    Operation.toJSON = function(instance) {
        return {
            'id' : instance.id,
            'type' : instance.type,
            'priority' : instance.priority,
            'name' : instance.name,
            'abbreviation' : instance.abbreviation,
            'classification' : instance.classification,
            'classificationName' : instance.classificationName
        };
    };
    Operation.fromJSON = function(json) {
        var instance = new Operation();
        instance.id = json.id;
        instance.type = json.type;
        instance.priority = json.priority;
        instance.name = json.name;
        instance.abbreviation = json.abbreviation;
        instance.classification = json.classification;
        instance.classificationName = json.classificationName;
        grace.operation.OperationFactory.register(instance);
        return instance;
    };
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
    OperationFactory.register = function(o) {
        if (!OperationFactory._mapping[o.id]) {
            OperationFactory._count++;
            OperationFactory._mapping[o.id] = o;
        }
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
        });
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
    OperationGroup.toJSON = function(instance) {
        return {
            '_operations' : grace.utils.SerializeUtil.batchToJSON(instance._operations, Operation.toJSON),
            '_typeToOperation' : instance._typeToOperation
        };
    };
    OperationGroup.fromJSON = function(json) {
        var instance = new OperationGroup();
        instance._operations = grace.utils.SerializeUtil.batchFromJSON(json._operations, Operation.fromJSON);
        instance._typeToOperation = json._typeToOperation;
        return instance;
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

			this._captionsByFormat[format] = caption;
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
    andrea.blink.declare("andrea.grace.models.value.supportClasses.QuantifiedHelper");

    var DateValue = grace.models.value.DateValue;
    var NumberValue = grace.models.value.NumberValue;

    var QuantifiedHelper = grace.models.value.supportClasses.QuantifiedHelper = {};

    QuantifiedHelper.TYPE_DATE = 'quantified_typeDate';
    QuantifiedHelper.TYPE_NUMBER = 'quantified_typeNumber';

    QuantifiedHelper.fromQuantified = function(type, quantified) {
        if (type === QuantifiedHelper.TYPE_DATE) {
            var d = new Date();
            d.setTime(quantified);
            return new DateValue(quantified.toString(), d);
        } else if (type === QuantifiedHelper.TYPE_NUMBER) {
            return new NumberValue(quantified.toString(), quantified);
        }
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

    // URLUtil.isMobile = function() {
        // var is = false;
        // // http://detectmobilebrowsers.com/
        // (function(a) {
            // if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
                // is = true;
            // }
        // })(navigator.userAgent || navigator.vendor || window.opera);
        // return is;
    // };
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
	ConverterType.DATE_IN_EXCEL = 'dataInExcel';
	ConverterType.DATE_IN_TEXT = 'dateInText';
	ConverterType.DATE_IN_MS = 'dateInMS';

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
	};
	ConverterType._monthFormats = (function() {
		var array = [];
		array.push('yyyy/M');
		array.push('yy/M');
		array.reverse();
		return array;
	})();
	ConverterType.getMonthFormats = function() {
		return ConverterType._monthFormats;
	};
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
                    value = DataConvertUtil._convertDateInExcel(raw);
                    type = ConverterType.DATE_IN_EXCEL;
                } else {
                    type = ConverterType.NUMBER;
                }
            }
            if (!value.notNull()) {
                value = DataConvertUtil._convertDateInText(raw);
                type = ConverterType.DATE_IN_TEXT;
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
        } else if (type === ConverterType.DATE_IN_TEXT) {
            return DataConvertUtil._convertDateInText;
        } else if (type === ConverterType.DATE_IN_EXCEL) {
            return DataConvertUtil._convertDateInExcel;
        } else if (type === ConverterType.DATE_IN_MS) {
            return DataConvertUtil._convertDateInMS;
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

    DataConvertUtil._convertDateInMS = function(raw) {
        if (!raw) {
            return NullValue.instance();
        }
        return new DateValue(raw, new Date(raw));
    };
    /**
     *
     * @param {Object} raw
     */
    DataConvertUtil._convertDateInText = function(raw) {
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
    };
    DataConvertUtil._preferDateTest = null;

    /**
     *
     * @param {Object} raw
     */
    DataConvertUtil._convertDateInExcel = function(raw) {
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
(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.utils.SerializeUtil");
    var SerializeUtil = grace.utils.SerializeUtil;

    SerializeUtil.batchToJSON = function(instances, toJSON) {
        if (_.isArray(instances)) {
            var result = [];
            for (var i = 0; i < instances.length; i++) {
                result.push(toJSON.call(null, instances[i]));
            }
            return result;
        } else if (instances) {
            return toJSON.call(null, instances);
        } else {
            return null;
        }
    };

    SerializeUtil.batchFromJSON = function(array, fromJSON) {
        if (_.isArray(array)) {
            var result = [];
            for (var i = 0; i < array.length; i++) {
                result.push(fromJSON.call(null, array[i]));
            }
            return result;
        } else if (array) {
            return fromJSON.call(null, array);
        } else {
            return null;
        }
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
    Log._logServer = grace.Settings.log.url;
    Log._releaseCache = function() {
        if (!Log._logCache || !Log._logServer) {
            return;
        }
        for (var level in Log._logCache) {
            var msg = Log._logCache[level].join(Log.LINE_SPLITTER);
            $.ajax({
                'dataType' : 'json',
                'url' : Log._logServer,
                'data' : {
                    'level' : level,
                    'msg' : msg
                },
                'type' : 'POST'
            }).fail(function() {
                Log._logServer = null;
            });
        }
        Log._logCache = null;
    };
    Log._time = function() {
        var d = new Date();
        var t = d.getTime().toString();
        return d.format('yyyy/MM/dd HH:mm:ss') + ',' + t.substr(t.length - 3);
    };
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
    IFilter.prototype.type = function() {
        return undefined;
    };
    IFilter.toJSON = function(instance) {
        var type = instance.type();

        if (type === 'RangeFilter') {
            return grace.filter.RangeFilter.toJSON(instance);
        } else if (type === 'TextFilter') {
            return grace.filter.TextFilter.toJSON(instance);
        }
    };
    IFilter.fromJSON = function(json) {
        var type = json.type;

        if (type === 'RangeFilter') {
            return grace.filter.RangeFilter.fromJSON(json);
        } else if (type === 'TextFilter') {
            return grace.filter.TextFilter.fromJSON(json);
        }
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

    TextFilter.prototype.type = function() {
        return 'TextFilter';
    };
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

    TextFilter.toJSON = function(instance) {
        return {
            'type' : instance.type(),
            'options' : instance._options,
            'nullable' : instance.nullable
        };
    };
    TextFilter.fromJSON = function(json) {
        var instance = new TextFilter([], json.quantifiedType);
        instance._options = json.options;
        return instance;
    };
})();
(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.filter.RangeFilter");

    var QuantifiedHelper = grace.models.value.supportClasses.QuantifiedHelper;

    var RangeFilter = grace.filter.RangeFilter = function(optionValues, nullable, quantifiedType) {
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
        this._quantifiedType = quantifiedType;
    };
    andrea.blink.extend(RangeFilter, grace.filter.IFilter);

    RangeFilter.prototype.type = function() {
        return 'RangeFilter';
    };
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
    RangeFilter.prototype.fromQuantified = function(quantified) {
        return QuantifiedHelper.fromQuantified(this._quantifiedType, quantified);
    };

    RangeFilter.toJSON = function(instance) {
        return {
            'type' : instance.type(),
            'from' : instance._from,
            'to' : instance._to,
            'min' : instance._min,
            'max' : instance._max,
            'nullable' : instance.nullable,
            'quantifiedType' : instance._quantifiedType
        };
    };
    RangeFilter.fromJSON = function(json) {
        var instance = new RangeFilter([], json.nullable, json.quantifiedType);
        instance._from = json.from;
        instance._to = json.to;
        instance._min = json.min;
        instance._max = json.max;
        return instance;
    };
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
    };
    PopUpManager.removePopUp = function(popUp) {
        var $popUp = $(popUp.dom());
        $popUp.parent().empty().detach();
    };
    PopUpManager.centerPopUp = function(popUp) {
        var $popUp = $(popUp.dom());
        var $body = $('body');
        var $root = $body.children().eq(0);
        $popUp.css({
            'left' : ($root.width() - $popUp.width()) / 2 + 'px',
            'top' : ($root.height() - $popUp.height()) / 2 - 36 + 'px'
        });
    };
})(jQuery);
(function($) {
    var grace = andrea.grace;
    andrea.blink.declare('andrea.grace.managers.SerializeManager');

    var SerializeUtil = grace.utils.SerializeUtil;
    var Log = grace.managers.Log;

    var SerializeManager = grace.managers.SerializeManager = function() {
        this._serializing = {};
        this._deserializing = null;

        this._requestedSerializations = [];
    };
    SerializeManager._instance = null;

    SerializeManager.instance = function() {
        if (!SerializeManager._instance) {
            SerializeManager._instance = new SerializeManager();
        }
        return SerializeManager._instance;
    };

    SerializeManager.prototype.serializable = function() {
        return this._serializing.dsInfo !== null && this._serializing.dsInfo !== undefined;
    };

    SerializeManager.prototype.serialize = function(layout, callback) {
        if (!this._serializing.dsInfo) {
            this._requestedSerializations.push(arguments);
            return;
        }

        _.extend(this._serializing, {
            'layout' : layout
        });

        $.ajax({
            'url' : grace.Settings.nodeServer + '/collaboration/create',
            'type' : 'POST',
            'data' : {
                'collaboration' : JSON.stringify(this._serializing)
            }
        }).done($.proxy(function(data) {
            data = JSON.parse(data);
            callback(data.sn);
        }, this)).fail($.proxy(function() {
            Log.console('serialize collaboration fail.');
        }, this));
    };

    SerializeManager.prototype.deserialize = function(collaborationSN) {
        $.ajax({
            'url' : grace.Settings.nodeServer + '/collaboration/get',
            'dataType' : 'jsonp',
            'data' : {
                'sn' : collaborationSN
            }
        }).done($.proxy(function(data) {
            this._deserializing = data.collaboration;

            grace.api.config.dataDiscovery.layout = this._deserializing.layout;
            grace.api.dataSource.load(this._deserializing.dsInfo);
        }, this)).fail($.proxy(function() {
            Log.console('deserialize visualization fail.');
        }, this));
    };

    SerializeManager.prototype.loadVizContext = function(callback) {
        if (this._deserializing) {
            var ShelvedAnalysis = grace.models.vo.ShelvedAnalysis;

            var loaded = {
                'vizType' : this._deserializing.vizType,
                'analysisDimesions' : SerializeUtil.batchFromJSON(this._deserializing.analysisDimesions, ShelvedAnalysis.fromJSON),
                'analysisDatas' : SerializeUtil.batchFromJSON(this._deserializing.analysisDatas, ShelvedAnalysis.fromJSON),
                'analysisFilters' : SerializeUtil.batchFromJSON(this._deserializing.analysisFilters, ShelvedAnalysis.fromJSON)
            };
            if (this._deserializing.title) {
                var array = document.title.split(' - ');
                array[array.length - 1] = this._deserializing.title;
                document.title = array.join(' - ');

                var HighChartsOption = grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption;
                HighChartsOption.title = this._deserializing.title;
            }

            callback(loaded);
        }
    };

    SerializeManager.prototype.saveDataSource = function(dsInfo) {
        this._serializing.dsInfo = dsInfo;

        if (this._serializing.dsInfo && this._requestedSerializations.length) {
            _.each(this._requestedSerializations, $.proxy(function(args) {
                this.serialize.apply(this, args);
            }, this));
            this._requestedSerializations = [];
        }
    };

    SerializeManager.prototype.saveVizContext = function(vizType, analysisDimesions, analysisDatas, analysisFilters, title) {
        var ShelvedAnalysis = grace.models.vo.ShelvedAnalysis;
        _.extend(this._serializing, {
            'vizType' : vizType,
            'analysisDimesions' : SerializeUtil.batchToJSON(analysisDimesions, ShelvedAnalysis.toJSON),
            'analysisDatas' : SerializeUtil.batchToJSON(analysisDatas, ShelvedAnalysis.toJSON),
            'analysisFilters' : SerializeUtil.batchToJSON(analysisFilters, ShelvedAnalysis.toJSON),
            'title' : title
        });
    };

    SerializeManager.prototype.saveViz = function(viz) {
        this._serializing.viz = viz;
    };
})(jQuery);
(function() {

    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.models.vo.Analysis');

    var ShelfType = grace.constants.ShelfType;
    var DataConvertUtil = grace.utils.DataConvertUtil;
    var ValueType = grace.constants.ValueType;
    var AnalysisType = grace.constants.AnalysisType;

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
    };

    Analysis.toJSON = function(instance) {
        return {
            'id' : instance.id,
            'index' : instance.index,
            'name' : instance.name,
            '_valueType' : instance._valueType,
            'quantifiable' : instance.quantifiable,
            'analysisType' : instance.analysisType,
            'numUniqueValue' : instance.numUniqueValue,
            'dateSpan' : instance.dateSpan,
        };
    };
    Analysis.fromJSON = function(json) {
        var instance = new Analysis();
        instance.id = json.id;
        instance.index = json.index;
        instance.name = json.name;
        instance._valueType = json._valueType;
        instance.quantifiable = json.quantifiable;
        instance.analysisType = json.analysisType;
        instance.numUniqueValue = json.numUniqueValue;
        instance.dateSpan = json.dateSpan;
        return instance;
    };
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
        return this.source.valueType() === ValueType.DATE && this.operationGroup.hasClassification(OperationClassification.DRILL);
    };

    ShelvedAnalysis.prototype.multiply = function(instance) {
        // TODO Build a full multiply logic for extensibility
        var result = {};

        if (instance && instance.source && instance.source.numUniqueValue) {
            result.numUniqueValue = this.source.numUniqueValue * instance.source.numUniqueValue;
        } else {
            result.numUniqueValue = this.source.numUniqueValue;
        }
        return result;
    };

    ShelvedAnalysis.toJSON = function(instance) {
        var json = {
            'id' : instance.id,
            'source' : grace.models.vo.Analysis.toJSON(instance.source),
            'operationGroup' : grace.operation.OperationGroup.toJSON(instance.operationGroup),
            'visualized' : instance.visualized,
            'numPartialVisualized' : instance.numPartialVisualized
        };
        if (instance.filter) {
            json.filter = grace.filter.IFilter.toJSON(instance.filter);
        }
        return json;
    };
    ShelvedAnalysis.fromJSON = function(json) {
        var instance = new ShelvedAnalysis();
        instance.id = json.id;
        instance.source = grace.models.vo.Analysis.fromJSON(json.source);
        instance.operationGroup = grace.operation.OperationGroup.fromJSON(json.operationGroup);
        instance.visualized = json.visualized;
        instance.numPartialVisualized = json.numPartialVisualized;
        if (json.filter) {
            instance.filter = grace.filter.IFilter.fromJSON(json.filter);
        }
        return instance;
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
        };

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
    };
    /**
     * A short cut way for view-view, action-view communication
     * TODO Refactor it
     */
    DataDiscoveryModel.prototype.hackNotify = function(name, data) {
        this._notify(name, data);
    };
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
    };
    /**
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
    };
    DataDiscoveryModel.prototype.analysisFilters = function(value) {
        if (arguments.length > 0) {
            this._analysisFilters = value || [];
            this._deferNotify(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED);
        } else {
            return this._analysisFilters;
        }
    };
    DataDiscoveryModel.prototype.analysisDimesions = function(value) {
        if (arguments.length > 0) {
            this._analysisDimesions = value || [];
            this._deferNotify(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED);
        } else {
            return this._analysisDimesions;
        }
    };
    DataDiscoveryModel.prototype.analysisDatas = function(value) {
        if (arguments.length > 0) {
            this._analysisDatas = value || [];
            this._deferNotify(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED);
        } else {
            return this._analysisDatas;
        }
    };

    DataDiscoveryModel.prototype.resetVizContext = function(vizType, analysisDimesions, analysisDatas, analysisFilters) {
        this.vizType(vizType);
        this.analysisDimesions(analysisDimesions);
        this.analysisDatas(analysisDatas);
        this.analysisFilters(analysisFilters);

        this._deferNotify(AppConst.NOTIFICATION_VIZ_CONTEXT_RESET);
    };

    DataDiscoveryModel.prototype.invalidateShelvedAnalysis = function() {
        this._deferNotify(AppConst.NOTIFICATION_VIZ_CONTEXT_APPLIED);
    };
    /**
     *
     */
    DataDiscoveryModel.prototype.getAnalyses = function(ids) {
        var as = [];
        for (var i = 0; i < ids.length; i++) {
            as.push(this.getAnalysis(ids[i]));
        }
        return as;
    };
    DataDiscoveryModel.prototype.getAnalysis = function(id) {
        return this._get(id, this.analyses);
    };
    DataDiscoveryModel.prototype.getShelvedAnalysis = function(id) {
        var sa = this._get(id, this._analysisFilters);
        if (!sa) {
            sa = this._get(id, this._analysisDimesions);
        }
        if (!sa) {
            sa = this._get(id, this._analysisDatas);
        }
        return sa;
    };
    DataDiscoveryModel.prototype._get = function(id, items) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) {
                return items[i];
            }
        }
        return null;
    };
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
        // Handler numRecords
        columnDescriptors.push({
            'id' : 'numRecords',
            'name' : '#记录数',
            'converterType' : ConverterType.NUMBER,
            'analysisType' : AnalysisType.MEASURE
        });
        var numColumns = columnDescriptors.length;
        var rows = raw.rows;
        var numRows = rows.length;

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
            // Handler numRecords
            row.push(1);
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
                            if (type === ConverterType.DATE_IN_EXCEL || type === ConverterType.DATE_IN_TEXT || type === ConverterType.DATE_IN_MS) {
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

    andrea.blink.declare("andrea.grace.actions.SaveCollaborationAction");

    var AppConst = andrea.grace.constants.AppConst;
    var Log = grace.managers.Log;
    var SerializeManager = grace.managers.SerializeManager;

    var SaveCollaborationAction = grace.actions.SaveCollaborationAction = function() {
        SaveCollaborationAction.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(SaveCollaborationAction, andrea.blink.mvc.Action);

    SaveCollaborationAction.prototype.execute = function(parameters) {
        SaveCollaborationAction.superclass.execute.apply(this, arguments);

        var model = this._getModel(AppConst.MODEL_GRACE);

        model.hackNotify(AppConst.NOTIFICATION_ACTION_SAVE_COLLABORATION_START);
        SerializeManager.instance().saveVizContext(model._vizType, model.analysisDimesions(), model.analysisDatas(), model.analysisFilters(), parameters.title);
        SerializeManager.instance().serialize(parameters.layout, function(sn) {
            model.hackNotify(AppConst.NOTIFICATION_ACTION_SAVE_COLLABORATION_COMPLETE, {
                'sn' : sn
            });
        });
    };

})();
(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.actions.LoadCollaborationAction");

    var AppConst = andrea.grace.constants.AppConst;
    var Log = grace.managers.Log;
    var SerializeManager = grace.managers.SerializeManager;

    var LoadCollaborationAction = grace.actions.LoadCollaborationAction = function() {
        LoadCollaborationAction.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(LoadCollaborationAction, andrea.blink.mvc.Action);

    LoadCollaborationAction.prototype.execute = function(parameters) {
        LoadCollaborationAction.superclass.execute.apply(this, arguments);

        var model = this._getModel(AppConst.MODEL_GRACE);

        SerializeManager.instance().loadVizContext(function(loaded) {
            model.resetVizContext(loaded.vizType, loaded.analysisDimesions, loaded.analysisDatas, loaded.analysisFilters);
        });
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
        this._visibleAnimationDuration = 600;

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
    };
    PopUpBase.prototype.close = function(delay) {
        var _this = this;
        var $dom = $(this._dom);
        if (delay == null) {
            delay = 1;
        }
        if (this._classVisible) {
            $dom.removeClass(this._classVisible);
            delay = this._visibleAnimationDuration;
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
    };
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
        this._closeByClick(true);
    };
    HoverPopUpBase.prototype.close = function() {
        HoverPopUpBase.superclass.close.apply(this, arguments);
        this._closeByHover(false);
        this._closeByClick(false);
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
            $(document.body).on('click', click).on('touchstart', click);
        } else {
            $(document.body).off('click', this._click).off('touchstart', this._click);
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
            $(document.body).on('mouseup', mouseup);
        } else {
            this._$dock.off('hover', this._hover);
            this._$dom.off('hover', this._hover);
            this._$dom.off('mousedown', this._mousedown);
            $(document.body).off('mouseup', this._mouseup);

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
        this._visibleAnimationDuration = 300;
        this._$spin = null;
        this._spinner = null;

        this._label = label;
        this._percent = 0;
        this._$label = null;

        this._createChildren();
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
		return this.filter.fromQuantified(this.min()).caption();
	};
	RangeValuesProxy.prototype.getMaxCaption = function(value) {
		return this.filter.fromQuantified(this.max()).caption();
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
    var QuantifiedHelper = grace.models.value.supportClasses.QuantifiedHelper;

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
                            return true;
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
                }));

                _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_SHELVED, _this, {
                    'shelvedContexts' : _this.getShelvedContexts()
                }));
            },
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
                    }, true, false);

                    var p;
                    if (_this._layout === 'vertical') {
                        p = 'top';
                    } else if (_this._layout === 'horizontal') {
                        p = 'left';
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
    };
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
    };
    ShelfBase.prototype._setTitle = function(title) {
        var $h2 = $(this._dom).find('h2');
        $h2.text(title);
    };
    ShelfBase.prototype._setRequired = function(required) {
        var $h2 = $(this._dom).find('h2');
        if (required) {
            $h2.addClass('grace-analysis-title-text_required');
        } else {
            $h2.removeClass('grace-analysis-title-text_required');
        }
    };
    ShelfBase.prototype.addSuffix = function(suffix) {
        var $h2 = $(this._dom).find('h2');

        if (suffix) {
            $h2.addClass('grace-analysis-title-text_suffix').attr({
                '__suffix' : suffix
            });
        } else {
            $h2.removeClass('grace-analysis-title-text_suffix');
        }
    };
    ShelfBase.prototype.type = function(value) {
        if (arguments.length > 0) {
            this._type = value;
        } else {
            return this._type;
        }
    };
    ShelfBase.prototype.dropAnalysis = function(a, $helper, from, to) {
        var shelvedAnalysisID, operationIDs;
        if (from === to) {
            shelvedAnalysisID = $helper.attr('__shelvedAnalysisID');
        }
        if ($helper.attr('__operationIDs') && $helper.attr('__shelfType') === this._type) {
            operationIDs = JSON.parse($helper.attr('__operationIDs'));
        }
        var $card = this._addCardAt(a, parseInt(this._$ph.attr('__toIndex')), shelvedAnalysisID, operationIDs);
    };

    ShelfBase.prototype.addCard = function(a, sa) {
        var shelvedAnalysisID, operationIDs;
        if (sa) {
            shelvedAnalysisID = sa.id;
        }
        if (sa && sa.operationGroup) {
            operationIDs = sa.operationGroup.mapIDs();
        }
        var filter;
        if (sa && sa.filter) {
            filter = sa.filter;
        }
        return this._addCardAt(a, -1, shelvedAnalysisID, operationIDs, filter);
    };
    // Override by child class
    ShelfBase.prototype._getOperationInfo = function() {
        return {
            'availableOGs' : [],
            'defaultTypes' : []
        };
    };
    /**
     * @param a Analysis
     * @param index optional int
     */
    ShelfBase.prototype._addCardAt = function(a, index, shelvedAnalysisID, operationIDs, filter) {
        var _this = this;

        var $cards = this._$cards;
        var $card = $('<div/>').addClass(['grace-analysis-card', 'grace-analysis-card-transition'].join(' '));
        if (this._layout === 'horizontal') {
            $card.addClass('grace-analysis-card_horizontal');
        }
        $card.width('');

        $cards.appendAt($card, index);

        var shelvedAnalysisID;
        if (!shelvedAnalysisID) {
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
        var info = this._getOperationInfo(a);
        var availableOGs = info.availableOGs;
        var defaultTypes = info.defaultTypes;

        var stopPropagation = function(event) {
            return false;
        };
        var genOperation = function(type, position, title, handlers) {
            var $operation = $('<span/>').appendTo($card);
            $operation.addClass(['grace-analysis-operation', 'grace-analysis-card-operation'].join(' '));
            $operation.addClass(['grace-analysis-card-operation-' + type, 'grace-analysis-card-operation-' + position].join(' '));
            if (title) {
                $operation.attr('title', title);
            }
            $operation.on('click', function(event) {
                if (handlers && handlers.click) {
                    handlers.click(event);
                }
            }).on('mouseenter', function(event) {
                if (handlers && handlers.mouseenter) {
                    handlers.mouseenter(event);
                }
            }).on('mousedown', function(event) {
                event.stopPropagation();
            });
            return $operation;
        };
        var genOperationRemove = function() {
            return genOperation('remove', 1, '移除', {
                'click' : function() {
                    _this._hide($card, function() {
                        $card.detach();
                        _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_SHELVED, _this));
                    });
                }
            });
        };
        var $operation;
        if (ShelfType.proc(this._type)) {
            // Proc filter shelf
            // Remove
            genOperationRemove();
            // Filter
            if (filter) {
                $card.data('__filter', filter);
            } else {
                var cValues = this._model().dataProvider.getCValues(a.index, true, false);
                var hasNull = this._model().dataProvider.isCHasNull(a.index);
                if (a.quantifiable) {
                    if (a.valueType() === ValueType.DATE) {
                        $card.data('__filter', new RangeFilter(cValues, hasNull, QuantifiedHelper.TYPE_DATE));
                    } else if (a.valueType() === ValueType.NUMBER) {
                        $card.data('__filter', new RangeFilter(cValues, hasNull, QuantifiedHelper.TYPE_NUMBER));
                    }
                } else {
                    $card.data('__filter', new TextFilter(cValues, hasNull));
                }
            }
            $operation = genOperation('filter', 2, '', {
                'mouseenter' : function(event) {
                    _this._createPopUpFilter(a, $card, $operation);
                }
            });
        } else if (ShelfType.des(this._type)) {
            // Des shelf
            // Remove
            genOperationRemove();
            // Drop down
            if (availableOGs && availableOGs.length > 0) {
                $operation = genOperation('dropDown', 2, '', {
                    'mouseenter' : function(event) {
                        _this._createPopUpMenu(availableOGs, a, $card, $operation);
                    }
                });
            }
        } else if (ShelfType.src(this._type)) {
            // Src shelf
            // Add to analysis
            var copyCard = $.proxy(function(event, pasteTo) {
                if (!pasteTo) {
                    if (this._type === ShelfType.SRC_DIM) {
                        pasteTo = ShelfType.DES_DIM;
                    } else if (this._type === ShelfType.SRC_MEA) {
                        pasteTo = ShelfType.DES_VALUE;
                    }
                }
                this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_COPIED, this, {
                    'analysis' : $card.data('__analysis'),
                    'pasteTo' : pasteTo
                }));
            }, this);

            $operation = genOperation('addToAnalysis', 1, '分析', {
                'click' : copyCard
            });
            $card.on('dblclick', copyCard);
            // Add to filter
            $operation = genOperation('addToFilter', 2, '过滤', {
                'click' : function(event) {
                    copyCard(event, ShelfType.PROC_FILTER);
                }
            });
            // Hide
            var moveToTrash = $.proxy(function() {
                this._addToTrash($card);
            }, this);
            $operation = genOperation('moveToTrash', 3, '隐藏', {
                'click' : moveToTrash
            });
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
            var existing = $card.attr('__operationIDs');
            if (!existing) {
                $card.attr({
                    '__operationIDs' : operationIDsStringify
                });
            } else if (existing !== operationIDsStringify) {
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
        var dataProvider = FilterUtil.filter(model.dataProvider, filterSAs);
        var cValues = dataProvider.getCValues(a.index, true, true);
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
    };
    ShelfBase.prototype._showOperation = function(show, $card, $operation) {
        if (show) {
            $card.find('.grace-analysis-card-text').addClass('grace-analysis-card-text-shrink');
            $operation.addClass('grace-analysis-card-operation-show');
        } else {
            $card.find('.grace-analysis-card-text').removeClass('grace-analysis-card-text-shrink');
            $operation.removeClass('grace-analysis-card-operation-show');
        }
    };
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
            var operation = event.data.item;
            _this._addOperation(operation.type, $card);
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
    };
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
            }, this);
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

        if ($(':visible', $target).length > 0) {
            return $target.show(0).hide('explode', {
                'easing' : 'easeOutSine'
            }, 180, complete);
        } else {
            return $target.hide();
        }
    };
    ShelfBase.prototype._show = function($target, complete) {
        if ($(':visible', $target).length > 0) {
            return $target.hide(0).show('explode', {
                'easing' : 'easeInSine'
            }, 300, complete);
        } else {
            return $target.show();
        }
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
        };

        this._view.addEventListener(ShelfEvent.CARD_SHELVED, function(event) {
            runAnalysis();
        }, this);

        this._view.addEventListener(ShelfEvent.HELPER_DROPPED, function(event) {
            var a = _this._model.getAnalysis(event.data.analysisID);
            _this._view.dropAnalysis(a, event.data.$helper, event.data.from, event.data.to);
        });
        this._view.addEventListener(ShelfEvent.CARD_COPIED, function(event) {
            _this._model.hackNotify(AppConst.NOTIFICATION_VIEW_PASTE_TO, {
                'analysis' : event.data.analysis,
                'targetShelfType' : event.data.pasteTo
            });
        });

        this._subscribe(AppConst.NOTIFICATION_VIEW_PASTE_TO, function(notification) {
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

        this._subscribe(AppConst.NOTIFICATION_VIZ_CONTEXT_RESET, function(notification) {
            var analyses = _this._modelAnalyses();

            if (analyses && analyses.length) {
                _.each(analyses, function(sa) {
                    _this._view.addCard(sa.source, sa);
                });

                _this._view.updateShelvedAnalyses(function(id) {
                    return _this._model.getShelvedAnalysis(id);
                });
            }
        });
    };
    ShelfBaseMediator.prototype._modelAnalyses = function() {
        return [];
    };
    /**
     * @protected
     */
    ShelfBaseMediator.prototype._dataProviderChangedHandler = function(notification) {
        this._view.removeAll();
    };
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
    };

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
    };
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
	};

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
	};
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
    };

    DesDimensionShelfMediator.prototype._modelAnalyses = function() {
        return this._model.analysisDimesions();
    };

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
	};

    DesMeasureShelfMediator.prototype._modelAnalyses = function() {
        return this._model.analysisDatas();
    };
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
	};

    FilterShelfMediator.prototype._modelAnalyses = function() {
        return this._model.analysisFilters();
    };
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
    VizBase.prototype.toJSON = function() {
        return null;
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

    // TODO Integrate title to model
    HighChartsOption.title = null;

    HighChartsOption.genMain = function(chartType) {
        var main = {
            chart : {
                type : chartType
            },
            title : {
                text : HighChartsOption.title
            },
            credits : {
                enabled : false
            },
            navigation : {
                buttonOptions : {
                    enabled : false
                }
            },
            exporting : {
                filename : 'chart',
                type : 'image/jpeg'
            }
        };
        HighChartsOption.title = null;
        return main;
    };
    HighChartsOption.genLegend = function(enabled) {
        var legend = null;
        if (enabled) {
            legend = {
                layout : 'vertical',
                align : 'left',
                verticalAlign : 'middle'
            };
        } else {
            legend = {
                "enabled" : false
            };
        }
        return {
            "legend" : legend
        };
    };
    HighChartsOption._visualize = function(analyses, index) {
        var sa/*ShelvedAnalysis*/ = null;
        if (index < analyses.length) {
            sa = analyses[index];
            sa.visualized = true;
        }
        return sa;
    };
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
    };
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
        };
        if (seriesSA) {
            prepareRinseOperation(seriesSA.operationGroup);
        }
        if (categorySA) {
            prepareRinseOperation(categorySA.operationGroup);
        }
        for ( di = 0; di < dataSAs.length; di++) {
            prepareRinseOperation(dataSAs[di].operationGroup);
        }
        sortOperations = _.without(sortOperations, undefined);
        sortOperations.sort(function(o1, o2) {
            return o1.priority - o2.priority;
        });
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
                };
                sl = dataSAs.length;
                dl = 1;
            } else {
                querySeriesIndex = function(values, indexDataSA) {
                    return 0;
                };
                sl = 1;
                dl = dataSAs.length;
            }
        } else {
            sq = new ValueQuery(dataProvider, seriesSA, turboThreshold);
            querySeriesIndex = function(values, indexDataSA) {
                return sq.queryIndex(values);
            };
            sl = sq.names().length;
            dl = dataSAs.length;
        }
        // Category
        if (!categorySA) {
            queryCategoryIndex = function(values) {
                return 0;
            };
            cl = 1;
        } else {
            cq = new ValueQuery(dataProvider, categorySA, turboThreshold);
            queryCategoryIndex = function(values) {
                return cq.queryIndex(values);
            };
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
                        };
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
    };
    HighChartsOption.saToDisplayAbbr = function(sa) {
        var abbr = sa.operationGroup.mapAbbrs().join(HighChartsOption.OPERATION_DISPLAY_SPLITTER_ABBR);
        if (abbr) {
            return sa.source.name + '(' + abbr + ')';
        } else {
            return sa.source.name;
        }
    };
})();
(function($) {
    var grace = andrea.grace;

    var HighChartsOption = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption;
    var VizType = grace.constants.VizType;
    var VizBase = grace.views.analysisResult.viz.VizBase;
    var Log = grace.managers.Log;

    /**
     * chartType: column, bar, line, area
     * vizType:
     */
    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.HighChartsBase");
    var HighChartsBase = grace.views.analysisResult.viz.highCharts.HighChartsBase = function(dom, chartType, vizType) {
        HighChartsBase.superclass.constructor.apply(this, arguments);

        this._chartType = chartType;
        this._vizType = vizType;

        this._$highcharts = null;
        this._highConfig = null;

        this._$print = $('<button/>').addClass('grace-result-print');
        this._$print.text('导出').appendTo(this._$dom);
        this._$print.on('click', $.proxy(function() {
            this._$highcharts.highcharts().exportChart();
        }, this));
        
        this._validateSize();
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
            };
        };
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
        this._highConfig = JSON.parse(JSON.stringify(highConfig));
        this._$highcharts.highcharts(highConfig);
        return true;
    };
    HighChartsBase.prototype.dataConfigArgs = function(dataProvider, dimesionSAs, dataSAs) {
    };
    HighChartsBase.prototype.completeHighConfig = function(highConfig, dataConfig, dataProvider, dimesionSAs, dataSAs) {
    };

    HighChartsBase.prototype._validateSize = function() {
        var size = this.size();

        this._$dom.css({
            'height' : size.height + 'px',
            'width' : size.width + 'px'
        });
        if (this._$highcharts) {
            this._$highcharts.empty().detach();
        }
        // this._$highcharts = $('<div/>').appendTo(this._$dom);
        this._$highcharts = $('<div/>');
        this._$print.before(this._$highcharts);        
        this._$highcharts.css({
            'height' : size.height + 'px',
            'width' : size.width + 'px'
        });
        if (this._highConfig) {
            this._$highcharts.highcharts(this._highConfig);
        }
    };
    HighChartsBase.prototype.toJSON = function() {
        return {
            'type' : 'highcharts',
            'highConfig' : this._highConfig
        };
    };
    HighChartsBase.checkOutdate = function(vizType, dataConfigArgs) {
        var clone = function(value) {
            if (value != null) {
                return JSON.parse(JSON.stringify(value));
            } else {
                return null;
            }
        };
        var current = {
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
            };
        } else if (!_.isEqual(cache, current)) {
            outdate = {
                'render' : true,
                'animation' : cache.numRows === current.numRows
            };
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
            this._isSeriesByDatas = true;
            return [dataProvider, null, dimesionSAs[0], dataSAs, this._isSeriesByDatas, turboThreshold];
        }
    };
    BasicXY.prototype.completeHighConfig = function(highConfig, dataConfig, dataProvider, dimesionSAs, dataSAs) {
        highConfig.xAxis = {};
        if (dimesionSAs && dimesionSAs[0]) {
            highConfig.xAxis.title = {
                'text' : HighChartsOption.saToDisplayAbbr(dimesionSAs[0])
            };
        } else {
            highConfig.xAxis.title = {
                'text' : null
            };
        }
        if (dataConfig.categories) {
            highConfig.xAxis.categories = dataConfig.categories;
            highConfig.xAxis.labels = {
                'rotation' : -45,
                'align' : 'right'
            };
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
            };
        };
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
            highConfig.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' + '<td style="padding:0"><b>{point.y}</b></td></tr>';
        } else {
            highConfig.tooltip.pointFormat = '<tr>' + '<td style="padding:0"><b>{point.y}</b></td></tr>';
        }
        if (this._vizType) {
            if (this._vizType === VizType.RADAR) {
                highConfig.chart.polar = true;
                highConfig.xAxis.labels = {
                    'rotation' : 0,
                    'align' : 'center'
                };
            } else if (this._vizType === VizType.STACKED_BAR || this._vizType === VizType.STACKED_COLUMN) {
                highConfig.plotOptions = {
                    'series' : {
                        'stacking' : 'normal'
                    }
                };
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
    };
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
        var headerFormat;
        headerFormat = '';

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
        highConfig.series = highSeries;

        var multiSeries = highConfig.series.length > 1;
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
(function() {
    var grace = andrea.grace;
    andrea.blink.declare("grace.views.analysisResult.AnalysisResultEvent");

    var AnalysisResultEvent = grace.views.analysisResult.AnalysisResultEvent = function(type, target, data) {
        AnalysisResultEvent.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(AnalysisResultEvent, andrea.blink.events.Event);

    AnalysisResultEvent.SAVE = "save";
})();
(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.views.analysisResult.AnalysisResult');

    var VizFactory = grace.views.analysisResult.viz.VizFactory;
    var VizType = grace.constants.VizType;
    var DataProvider = grace.models.DataProvider;
    var FilterUtil = grace.utils.FilterUtil;
    var DataDiscoveryModel = grace.models.DataDiscoveryModel;
    var AnalysisResultEvent = grace.views.analysisResult.AnalysisResultEvent;
    var SerializeManager = grace.managers.SerializeManager;

    var AnalysisResult = grace.views.analysisResult.AnalysisResult = function(dom) {
        AnalysisResult.superclass.constructor.apply(this, arguments);

        this._$dom = $(dom);
        this._$dom.addClass('grace-result fancy-scrollbar');

        this._viz = null;
        this._vizContainer$ = null;

        this._$collab = null;

        this._createChildren();
    };
    andrea.blink.extend(AnalysisResult, andrea.blink.mvc.View);

    AnalysisResult.prototype._createChildren = function() {
        this._vizContainer$ = $('<div/>').appendTo(this._$dom);

        this._$collab = $('<div/>').addClass('grace-result-collab-container');

        this._$save = $('<button/>').addClass('grace-result-collab grace-result-collab-save');
        this._$save.attr('title', '保存当前状态');
        this._$save.on('click', $.proxy(function() {
            this.dispatchEvent(new AnalysisResultEvent(AnalysisResultEvent.SAVE, this, {
                'layout' : 'dataDiscovery',
            }));
        }, this));
        this._$save.appendTo(this._$collab);

        this._$share = $('<button/>').addClass('grace-result-collab grace-result-collab-share');
        this._$share.attr('title', '分享图表');
        this._$share.on('click', $.proxy(function() {
            alertify.reset();
            alertify.prompt('为图表输入标题：', $.proxy(function(ok, title) {
                if (ok) {
                    this.dispatchEvent(new AnalysisResultEvent(AnalysisResultEvent.SAVE, this, {
                        'layout' : 'vizOnly',
                        'title' : title
                    }));
                } else {
                    alertify.error('保存取消。');
                }
            }, this));
        }, this));
        this._$share.appendTo(this._$collab);

        if (grace.Config.dataDiscovery.layout === 'vizOnly') {
            this._$collab.hide();
        }
    };
    /**
     *
     * @param {Array.<Array.<*>>} dataProvider
     * @param {Array.<ShelvedAnalysis>} dimesionSAs
     * @param {Array.<ShelvedAnalysis>} dataSAs
     */
    AnalysisResult.prototype.render = function(selectedVizType, dataProvider, filterSAs, dimesionSAs, dataSAs) {
        // Prepare data
        var clear = function(sa) {
            sa.visualized = false;
            sa.numPartialVisualized = 0;
        };
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
        }).appendTo(this._vizContainer$);
        // Render viz
        var viz/*VizBase*/ = VizFactory.produce($viz[0], vizType, selectedVizType);
        var success = viz.render(dataProvider, dimesionSAs, dataSAs);

        if (success) {
            // Rmove old one
            this._$collab.detach();
            if (this._viz) {
                this._viz.destroy();
            }
            // Init new one
            this._viz = viz;
            var vizJSON = this._viz.toJSON();
            SerializeManager.instance().saveViz(vizJSON);
            if (vizJSON && SerializeManager.instance().serializable()) {
                this._$collab.appendTo(this._$dom);
            }
            // Add scroll bar
            var domSize = this.size();
            var vizSize = viz.size();
            this._vizContainer$.css({
                'overflow-x' : 'hidden',
                'overflow-y' : 'hidden'
            });
            if (vizSize.width > domSize.width) {
                this._vizContainer$.css('overflow-x', 'auto');
            }
            if (vizSize.height > domSize.height) {
                this._vizContainer$.css('overflow-y', 'auto');
            }
        } else {
            $viz.detach();
        }
    };
    AnalysisResult.prototype._validateSize = function() {
        var size = this.size();

        this._$dom.css({
            'height' : size.height + 'px',
            'width' : size.width + 'px'
        });

        if (this._viz) {
            this._viz.size(size);
        }
    };
    AnalysisResult.prototype._recommend = function(dataProvider, dimesionSAs, dataSAs) {
        if (dataSAs.length === 0) {
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
    };
})(jQuery);
(function($) {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisResult.AnalysisResultMediator");

    var AppConst = grace.constants.AppConst;
    var Log = grace.managers.Log;
    var AnalysisResultEvent = grace.views.analysisResult.AnalysisResultEvent;

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
        var model = this._model = this._getModel(AppConst.MODEL_GRACE);

        var logFmt = function(shelvedAnalyses) {
            var names = [];
            _.each(shelvedAnalyses, function(sa) {
                names.push(sa.source.name);
            });
            return [shelvedAnalyses.length, names.join('|')].join(',');
        };
        this._subscribe(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED, $.proxy(function(notification) {
            Log.interaction('analysis', [logFmt(model.analysisDimesions()), logFmt(model.analysisDatas()), logFmt(model.analysisFilters())].join(','));
            this._view.render(model.vizType(), model.dataProvider, model.analysisFilters(), model.analysisDimesions(), model.analysisDatas());

            model.invalidateShelvedAnalysis();
        }, this));
        this._view.render(model.vizType(), model.dataProvider, model.analysisFilters(), model.analysisDimesions(), model.analysisDatas());

        this._view.addEventListener(AnalysisResultEvent.SAVE, function(event) {
            this._action(AppConst.ACTION_SAVE_COLLABORATION, event.data);
        }, this);
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
    var Loading = grace.views.popUp.Loading;
    var AppConst = grace.constants.AppConst;

    var DataDiscovery = grace.DataDiscovery = function(div) {
        DataDiscovery.superclass.constructor.apply(this, arguments);

        this._div = div;
        this._$dom = $(div);

        this._loading = null;

        this._viewSourceDim = null;
        this._viewSourceMea = null;

        this._viewDesDimensionShelf = null;
        this._viewDesMeasureShelf = null;
        this._viewFilterShelf = null;

        this._viewAnalysisResult = null;

        this._viewVizNavigator = null;

        this._applyHighSettings();
        this._startup();

        $('#divHeader', this._dom).click(function() {
            window.location.href = grace.Settings.home;
        });
        // Guide
        this._guide$ = $('#divGuide', this._dom);
        this._$dom.droppable({
            'accept' : function() {
                return true;
            },
            'activate' : $.proxy(function(event) {
                if (this._guide$) {
                    this._guide$.fadeOut(100);
                }
            }, this),
            'deactivate' : $.proxy(function(event) {
                _.defer($.proxy(function() {
                    if (this._guide$) {
                        this._guide$.fadeIn(100);
                    }
                }, this));
            }, this)
        });
    };
    andrea.blink.extend(DataDiscovery, andrea.blink.mvc.View);

    DataDiscovery.prototype.vizContextChanged = function(numAnalysisDatas) {
        if (this._guide$ && numAnalysisDatas > 0) {
            var guide$ = this._guide$;
            this._guide$.fadeOut(400, function() {
                guide$.empty().detach();
            });
            this._guide$ = null;
        }
    };
    DataDiscovery.prototype._applyHighSettings = function() {
        Highcharts.setOptions({
            'chart' : {
                'style' : {
                    'fontFamily' : 'Trebuchet MS, Verdana, sans-serif, FontAwesome'
                }
            }
        });
    };

    DataDiscovery.prototype.addLoading = function() {
        if (!this._loading) {
            this._loading = new Loading($('<div/>'));
            this._loading.open(this._$dom, true);
        }
    };
    DataDiscovery.prototype.removeLoading = function() {
        if (this._loading) {
            this._loading.close();
            this._loading = null;
        }
    };
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
    DataDiscovery.prototype.loadCollaboration = function() {
        this._apiMediator.loadCollaboration();
    };

    DataDiscovery.prototype._startup = function() {
        // TODO Refactor app to Grace.js, not the DataDiscovery
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
        app.registerAction(AppConst.ACTION_SAVE_COLLABORATION, grace.actions.SaveCollaborationAction);
        app.registerAction(AppConst.ACTION_LOAD_COLLABORATION, grace.actions.LoadCollaborationAction);

        // Views
        // var appView = this._appView = new grace.views.analysisContainer.AppView(this._div);

        // Mediators
        mediator = new grace.DataDiscoveryMediator(this);
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

        if (grace.Config.dataDiscovery.layout === 'vizOnly') {
            $("#divCol1").hide();
            $("#divCol2").hide();
            $("#divCol3").css({
                "width" : mainWidth + "px",
                "height" : mainHeight + "px"
            });
            $("#divAnalysis").hide();
            this._viewAnalysisResult.size({
                "width" : mainWidth,
                "height" : mainHeight
            });
            $("#divGuide").hide();
            
        } else {
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
        }
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

    andrea.blink.declare('andrea.grace.DataDiscoveryMediator');

    var AppConst = grace.constants.AppConst;
    /**
     * App Mediator.
     */
    var DataDiscoveryMediator = andrea.grace.DataDiscoveryMediator = function(view) {
        DataDiscoveryMediator.superclass.constructor.apply(this, arguments);

        this._view = view;
        this._model = null;
    };

    andrea.blink.extend(DataDiscoveryMediator, andrea.blink.mvc.ViewMediator);

    DataDiscoveryMediator.prototype.rowBasedDataProvider = function(rows, columnDescriptors, source) {
        var model = this._getModel(AppConst.MODEL_GRACE);

        this._subscribe(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED, $.proxy(function(notification) {
            this._view.vizContextChanged(model.analysisDatas().length);
        }, this));

        this._action(AppConst.ACTION_CHANGE_DATA_PROVIDER, {
            'rows' : rows,
            'columnDescriptors' : columnDescriptors,
            'source' : source
        });

        this._subscribe(AppConst.NOTIFICATION_ACTION_SAVE_COLLABORATION_START, $.proxy(function(notification) {
            this._view.addLoading();
        }, this));
        this._subscribe(AppConst.NOTIFICATION_ACTION_SAVE_COLLABORATION_COMPLETE, $.proxy(function(notification) {
            this._view.removeLoading();

            var url = grace.Settings.home + '?collab=' + notification.data.sn;

            alertify.reset();
            alertify.set({
                'labels' : {
                    'ok' : '复制',
                    'cancel' : '跳转至...'
                },
                'buttonFocus' : 'ok'
            });
            alertify.confirm('保存成功：' + url, function(confirmed) {
                if (!confirmed) {
                    _.delay(function() {
                        window.open(url, '_blank');
                    }, 500);
                }
            });
            var alertify$ = $('#alertify');
            var ok$ = $('.alertify-button-ok', alertify$);
            ok$.attr('data-clipboard-text', url);
            var client = ZeroClipboard(ok$);
            client.on('complete', function(client, args) {
                ok$[0].click();
                alertify.success('成功将保存地址写入剪贴板。');
            });
        }, this));
    };
    DataDiscoveryMediator.prototype.loadCollaboration = function() {
        this._action(AppConst.ACTION_LOAD_COLLABORATION);
    };

})(jQuery);
(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.views.analysisContainer.events.DataSourceEvent");

    var DataSourceEvent = grace.views.analysisContainer.events.DataSourceEvent = function(type, target, data) {
        DataSourceEvent.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(DataSourceEvent, andrea.blink.events.Event);

    DataSourceEvent.DATA_PROVIDER_READY = "dataSourceReady";

    DataSourceEvent.STATE_CHANGED = "stateChanged";
})();
(function() {
    var grace = andrea.grace;

    var DataSourceEvent = grace.views.analysisContainer.events.DataSourceEvent;
    var MoreButton = grace.views.components.MoreButton;

    andrea.blink.declare('andrea.grace.views.dataSources.DataSourceBase');
    var DataSourceBase = andrea.grace.views.dataSources.DataSourceBase = function(div) {
        DataSourceBase.superclass.constructor.apply(this, arguments);

        this._swfReady = false;

        this._state = DataSourceBase.STATE_NORMAL;
        this._progress = null;

        this._options = null;
    };
    andrea.blink.extend(DataSourceBase, andrea.blink.mvc.View);

    DataSourceBase.STATE_NORMAL = 'normal';
    DataSourceBase.STATE_LOADING = 'loading';

    DataSourceBase.prototype.state = function(value) {
        if (arguments.length > 0) {
            this._state = value;
            this.dispatchEvent(new DataSourceEvent(DataSourceEvent.STATE_CHANGED, this));
            return this;
        } else {
            return this._state;
        }
    };
    DataSourceBase.prototype.progress = function(value) {
        if (arguments.length > 0) {
            this._progress = value;
            this.state(DataSourceBase.STATE_LOADING);
            return this;
        } else {
            return this._progress;
        }
    };

    DataSourceBase.prototype.keyword = function() {
        return null;
    };
    DataSourceBase.prototype._encode = function(o) {
        var s = JSON.stringify(o);
        s = s.replace(/%/g, '%25');
        s = s.replace(/\\/g, '%5C');
        s = s.replace(/\"/g, '%22');
        return s;
    };
    DataSourceBase.prototype._decode = function(s) {
        s = s.replace(/%22/g, '\"');
        s = s.replace(/%5C/g, '\\');
        s = s.replace(/%25/g, '%');
        return JSON.parse(s);
    };

    /**
     *
     * @param {Object} settings {
     *     color,
     *     caption
     * }
     */
    DataSourceBase.prototype._generateButton = function($container, settings) {
        if ($container.length === 0) {
            return;
        }
        var $dom = $container.addClass('grace-dataSource-main-example').css('background-color', settings.color);
        var $p1 = $('<div/>').appendTo($dom).addClass('grace-dataSource-main-example-p1');
        var $caption = $('<div/>').appendTo($p1).addClass('grace-dataSource-main-example-p1-caption');
        _.each(settings.captions, function(caption) {
            var size = $dom.height() - 25 * 2 + (settings.captions.length - 1);
            size = Math.floor(size / settings.captions.length);

            var $span = $('<span/>').appendTo($caption).text(caption).css('font-size', size + 'px');
            var minus = 1;
            while ($span.height() > (size + 2) || $span.width() > ($dom.width() - 15)) {
                $span.css('font-size', size - minus + 'px');
                minus++;
            }
            $('<br/>').appendTo($caption).css('line-height', size + 'px');
        });
        $caption.children().last().detach();
        $caption.css({
            'top' : ($container.height() - $caption.height()) / 2 + (settings.link ? -2 : 4),
            'left' : ($container.width() - $caption.width()) / 2
        });

        if (settings.link) {
            var $download = $('<a/>').appendTo($p1).addClass('grace-dataSource-main-example-p2-download');
            $download.text(settings.link.text).css('color', '#e59999');
            $download.attr({
                'target' : '_blank',
                'href' : settings.link.url,
                'title' : '右键，另存为…'
            });
            $download.on('click', function(event) {
                event.stopPropagation();
            });
        }
    };

    // /**
    // *
    // * @param {Object} settings {
    // *     color,
    // *     caption,
    // *     description
    // * }
    // */
    // DataSourceBase.prototype._generateMore = function($container, settings) {
    // var $dom = $container.addClass('grace-dataSource-main-example');
    // var $more = $('<div/>').appendTo($dom).addClass('grace-dataSource-main-example-more');
    // // P1
    // var $p1 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-example-p1').css('background-color',
    // settings.color);
    // var $caption = $('<div/>').appendTo($p1).addClass('grace-dataSource-main-example-p1-caption');
    // _.each(settings.captions, function(caption) {
    // $('<span/>').appendTo($caption).text(caption);
    // $('<br/>').appendTo($caption).css('line-height', 30 + 'px');
    // });
    // $caption.children().last().detach();
    // $caption.css({
    // 'top' : ($container.height() - $caption.height()) / 2,
    // 'left' : ($container.width() - $caption.width()) / 2
    // });
    // // P2
    // var $p2 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-example-p2');
    // $('<div/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-ribbon').css('background-color',
    // settings.color);
    // $('<div/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-icon');
    // $('<div/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-text').text(settings.description);
    //
    // if (settings.link) {
    // var $download = $('<a/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-download');
    // $download.text(settings.link.text).css('color', settings.color);
    // $download.attr({
    // 'target' : '_blank',
    // 'href' : settings.link.url,
    // 'title' : '右键，另存为…'
    // });
    // $download.on('click', function(event) {
    // event.stopPropagation();
    // });
    // }
    // // More button
    // return new MoreButton($more[0]);
    // };
    DataSourceBase.prototype._swfReadyHandler = function() {
        this._swfReady = true;
    };
    DataSourceBase.prototype._embedSWF = function($ph, name, swfURL, wmode, w, h, flashvars) {
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
    DataSourceBase.prototype._getSWF = function(selector, callback) {
        var check = $.proxy(function() {
            var $swf = $(selector);
            if ($swf[0] && this._swfReady) {
                callback($swf[0]);
            } else {
                _.delay(check, 100);
            }
        }, this);
        check();
    };
    DataSourceBase.prototype._stringDataReady = function(rows, columnDescriptors) {
        var dp = {
            'rows' : _.isString(rows) ? this._decode(rows) : rows,
            'columnDescriptors' : _.isString(columnDescriptors) ? this._decode(columnDescriptors) : columnDescriptors,
            'source' : 'excel'
        };
        this._dpReady(dp);
    };
    DataSourceBase.prototype._dpReady = function(dp) {
        this.dispatchEvent(new DataSourceEvent(DataSourceEvent.DATA_PROVIDER_READY, this, {
            'dataProvider' : dp,
            'dsInfo' : this._options
        }));
    };
})();
(function() {
    var grace = andrea.grace;

    var DataSourceBase = andrea.grace.views.dataSources.DataSourceBase;
    var MoreButton = grace.views.components.MoreButton;
    var Log = grace.managers.Log;
    var SerializeManager = grace.managers.SerializeManager;

    andrea.blink.declare('andrea.grace.views.dataSources.File');
    var File = andrea.grace.views.dataSources.File = function(div) {
        File.superclass.constructor.apply(this, arguments);

        this._more = null;

        this._hookupAPI();
        this._createChildren();
    };
    andrea.blink.extend(File, andrea.grace.views.dataSources.DataSourceBase);

    File.prototype.loadURL = function(hashPairs) {
        this._load(hashPairs);
    };
    File.prototype.keyword = function() {
        return 'file';
    };
    File.prototype._load = function(options) {
        if (options.url) {
            this.state(DataSourceBase.STATE_LOADING);

            this._getSWF('#FileAccessor', $.proxy(function(swf) {
                swf.load(options.url);
            }, this));
        }
    };
    File.prototype._hookupAPI = function() {
        andrea.blink.declare('andrea.grace._api.dataSource.file');

        andrea.grace._api.dataSource.file.load = $.proxy(function(options) {
            _.defer($.proxy(this._load, this), options);
        }, this);
        andrea.grace._api.dataSource.file.faReadyCallback = $.proxy(function() {
            _.defer($.proxy(this._swfReadyHandler, this));
        }, this);
        andrea.grace._api.dataSource.file.faHoverCallback = $.proxy(function(hover) {
            _.defer($.proxy(this._faHoverHandler, this), hover);
        }, this);
        andrea.grace._api.dataSource.file.faClickCallback = $.proxy(function() {
            _.defer($.proxy(this._faClickHandler, this));
        }, this);
        andrea.grace._api.dataSource.file.faSelectCallback = $.proxy(function() {
            _.defer($.proxy(this._faSelectCallback, this));
        }, this);
        andrea.grace._api.dataSource.file.faCancelCallback = $.proxy(function() {
            _.defer($.proxy(this._faCancelHandler, this));
        }, this);
        andrea.grace._api.dataSource.file.faDataCallback = $.proxy(function(name, rows, columnDescriptors) {
            _.defer($.proxy(this._faDataHandler, this), name, rows, columnDescriptors);
            return true;
        }, this);
        andrea.grace._api.dataSource.file.faSaveCallback = $.proxy(function(response) {
            _.defer($.proxy(this._faSaveHandler, this), response);
            return true;
        }, this);

    };
    File.prototype._createChildren = function() {
        var $container = this._$dom;
        $container.addClass('grace-dataSource-main-analysis');

        // var $more = $('<div/>').appendTo($container).addClass('grace-dataSource-main-analysis-more');
        // // P1
        // var $p1 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-analysis-p1').css('line-height',
        // $container.height() + 'px');
        // $('<span/>').appendTo($p1).text('数据文件');
        // // P2
        // var $p2 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-analysis-p2');
        // $('<div/>').appendTo($p2).addClass('grace-dataSource-main-analysis-p2-ribbon');
        // $('<div/>').appendTo($p2).addClass('grace-dataSource-main-analysis-p2-text').text('分析数据文件').css('line-height',
        // $container.height() + 'px');
        // var $type = $('<div/>').appendTo($p2).addClass('grace-dataSource-main-analysis-p2-type');
        // $('<div/>').appendTo($type).addClass('grace-dataSource-main-analysis-p2-type-icon');
        // $('<div/>').appendTo($type).addClass('grace-dataSource-main-analysis-p2-type-text').text('2007,2003,CSV');
        // // More button
        // this._more = new MoreButton($more[0]);
        this._generateButton($container, {
            'color' : '#7db500',
            'captions' : ['数据文件...', 'excel']
        });

        var flashVersion = swfobject.getFlashPlayerVersion();
        if (!flashVersion || flashVersion.major < 10) {
            $container.on('click', $.proxy(function(event) {
                alert('请使用PC浏览器进行数据文件分析。');
            }, this));
            $container.css('-webkit-filter', 'grayscale(100%)');
        } else {
            // SWF
            var $swf = $('<div/>').appendTo($container);
            var w = $container.width();
            var h = $container.height();
            var faSettings = grace.Settings.fileAccessor;
            this._embedSWF($('<div/>').appendTo($swf), faSettings.name, faSettings.swfURL, 'transparent', w, h, {
                'alpha' : 0,
                'width' : w,
                'height' : h,
                'readyCallback' : 'andrea.grace._api.dataSource.file.faReadyCallback',
                'hoverCallback' : 'andrea.grace._api.dataSource.file.faHoverCallback',
                'clickCallback' : 'andrea.grace._api.dataSource.file.faClickCallback',
                'selectCallback' : 'andrea.grace._api.dataSource.file.faSelectCallback',
                'cancelCallback' : 'andrea.grace._api.dataSource.file.faCancelCallback',
                'dataCallback' : 'andrea.grace._api.dataSource.file.faDataCallback',
                'saveURL' : grace.Settings.javaServer + '/dataSource/file',
                'saveCallback' : 'andrea.grace._api.dataSource.file.faSaveCallback'
            });
            $swf.css({
                'z-index' : 10000,
                'position' : 'absolute',
                'width' : w,
                'height' : h
            });
        }
    };

    File.prototype._faHoverHandler = function(hover) {
        if (!this._more) {
            return;
        }
        if (hover) {
            this._more.showP2();
        } else {
            this._more.showP1();
        }
    };
    File.prototype._faClickHandler = function() {
        this.state(DataSourceBase.STATE_LOADING);
    };
    File.prototype._faCancelHandler = function() {
        this.state(DataSourceBase.STATE_NORMAL);
    };
    File.prototype._faSelectCallback = function() {
    };

    File.prototype._faDataHandler = function(name, rows, columnDescriptors) {
        Log.interaction('dataSource', ['file', this._decode(name)].join(','));
        this._stringDataReady(rows, columnDescriptors);
    };
    File.prototype._faSaveHandler = function(response) {
        response = JSON.parse(response);

        // Update the dsInfo
        SerializeManager.instance().saveDataSource({
            'dataSource' : 'jsonp',
            'url' : grace.Settings.javaServer + '/dataSource/file?name=' + response.json
        });
    };

})();
(function() {
    var grace = andrea.grace;

    var DataSourceBase = andrea.grace.views.dataSources.DataSourceBase;
    var MoreButton = grace.views.components.MoreButton;
    var Log = grace.managers.Log;

    andrea.blink.declare('andrea.grace.views.dataSources.DataSourceJSON');
    var DataSourceJSON = andrea.grace.views.dataSources.DataSourceJSON = function(div) {
        DataSourceJSON.superclass.constructor.apply(this, arguments);

        this._more = null;

        this._hookupAPI();
    };
    andrea.blink.extend(DataSourceJSON, andrea.grace.views.dataSources.DataSourceBase);

    DataSourceJSON.prototype.loadURL = function(hashPairs) {
        this._load(hashPairs);
    };
    DataSourceJSON.prototype.keyword = function() {
        return 'json';
    };
    /**
     * @param {Object} options
     * 	url: *.json
     */
    DataSourceJSON.prototype._load = function(options) {
        if (options.url) {
            this.state(DataSourceBase.STATE_LOADING);

            this._options = options;
            $.ajax({
                'url' : options.url,
                'dataType' : 'json'
            }).done($.proxy(function(json) {
                this._dpReady(json);
            }, this));
        }
    };
    DataSourceJSON.prototype._hookupAPI = function() {
        andrea.blink.declare('andrea.grace._api.dataSource.json');
        andrea.grace._api.dataSource.json.load = $.proxy(function(options) {
            _.defer($.proxy(this._load, this), options);
        }, this);
    };
})();
(function() {
    var grace = andrea.grace;

    var DataSourceBase = andrea.grace.views.dataSources.DataSourceBase;
    var MoreButton = grace.views.components.MoreButton;
    var Log = grace.managers.Log;

    andrea.blink.declare('andrea.grace.views.dataSources.DataSourceJSONP');
    var DataSourceJSONP = andrea.grace.views.dataSources.DataSourceJSONP = function(div) {
        DataSourceJSONP.superclass.constructor.apply(this, arguments);

        this._more = null;

        this._hookupAPI();
    };
    andrea.blink.extend(DataSourceJSONP, andrea.grace.views.dataSources.DataSourceBase);

    DataSourceJSONP.prototype.loadURL = function(hashPairs) {
        this._load(hashPairs);
    };
    DataSourceJSONP.prototype.keyword = function() {
        return 'jsonp';
    };
    /**
     * @param {Object} options
     * 	url: *
     */
    DataSourceJSONP.prototype._load = function(options) {
        if (options.url) {
            this.state(DataSourceBase.STATE_LOADING);

            this._options = options;
            $.ajax({
                'url' : options.url,
                'dataType' : 'jsonp'
            }).done($.proxy(function(json) {
                this._dpReady(json);
            }, this));
        }
    };
    DataSourceJSONP.prototype._hookupAPI = function() {
        andrea.blink.declare('andrea.grace._api.dataSource.jsonp');
        andrea.grace._api.dataSource.jsonp.load = $.proxy(function(options) {
            _.defer($.proxy(this._load, this), options);
        }, this);
    };
})();
(function() {
    var grace = andrea.grace;

    var URLUtil = grace.utils.URLUtil;
    var Log = grace.managers.Log;
    var Stopwatch = grace.utils.Stopwatch;
    var TaobaoAPI = grace.constants.TaobaoAPI;
    var ConverterType = grace.utils.ConverterType;
    var AnalysisType = grace.constants.AnalysisType;

    andrea.blink.declare('andrea.grace.views.dataSources.Taobao');
    var Taobao = andrea.grace.views.dataSources.Taobao = function(div) {
        Taobao.superclass.constructor.apply(this, arguments);

        this._watch = null;
        this._cdaNumTrades = 0;

        this._rows = [];
        this._columnDescriptors = this._generateColumnDescriptors();

        this._hookupAPI();
        this._createChildren();
    };
    andrea.blink.extend(Taobao, andrea.grace.views.dataSources.DataSourceBase);

    Taobao.prototype.loadURL = function(hashPairs) {
        var cdaSettings = grace.Settings.crossDomainAccessor;
        if (hashPairs.access_token && hashPairs.taobao_user_id && hashPairs.taobao_user_nick) {
            this._options = hashPairs;
            // Taobao OAuth redirect
            this._watch = new Stopwatch([hashPairs.taobao_user_id, hashPairs.taobao_user_nick].join(','), true);
            this.progress(0);
            this._getSWF('#CrossDomainAccessor', $.proxy(function(swf) {
                swf.setAccessToken(hashPairs.access_token);
                var fields = [];
                for (var i = 0; i < this._columnDescriptors.length; i++) {
                    fields.push(this._columnDescriptors[i].id);
                }
                Log.interaction('dataSource', ['taobao', hashPairs.taobao_user_id, hashPairs.taobao_user_nick].join(','));
                swf.load(cdaSettings.taobao.trade.maxResults, fields.join(','));
                Log.performance('loadTaobaoTrades', [this._watch.type, 'loadSWF', this._watch.lap()].join(','));
            }, this));
        } else if (hashPairs.error) {
            Log.interaction('authorizeError', [hashPairs.error, hashPairs.error_description.replace(/,/g, '|')]);
            if (hashPairs.error === 'invalid_client') {
                var shop = prompt('留下您的 店铺。(店铺网址/店铺名称 均可)\n应用尚未正式发布需要手动设置授权。');
                var contact = prompt('留下您的 联系方式。以便完成授权之后通知您。\n(邮箱/QQ/微博 均可)');
                Log.interaction('authorize', [shop, contact, 'taobao']);
                if (shop && contact) {
                    alert('您的店铺已保存，完成授权预计需要一天，请稍候。\n完成后会通知到您。');
                } else if (shop) {
                    alert('您的店铺已保存，完成授权预计需要一天，请稍候。');
                }
            }
        }
    };
    Taobao.prototype.keyword = function() {
        return 'taobao';
    };
    Taobao.prototype._hookupAPI = function() {
        andrea.blink.declare('andrea.grace._api.dataSource.taobao');

        andrea.grace._api.dataSource.taobao.cdaReadyCallback = $.proxy(function() {
            _.defer($.proxy(this._swfReadyHandler, this));
        }, this);
        andrea.grace._api.dataSource.taobao.cdaDataCallback = $.proxy(function(response) {
            _.defer($.proxy(this._cdaDataHandler, this), response);
        }, this);
        andrea.grace._api.dataSource.taobao.cdaCompleteCallback = $.proxy(function() {
            _.defer($.proxy(this._cdaCompleteHandler, this));
        }, this);
    };
    Taobao.prototype._createChildren = function() {
        var $container = this._$dom.clone().appendTo(this._$dom);
        $container.on('click', $.proxy(function(event) {
            this._authorize();
        }, this));

        var cdaSettings = grace.Settings.crossDomainAccessor;
        this._generateButton($container, {
            'color' : '#ff692f',
            'captions' : ['淘宝|天猫', '卖家']
        });
        // SWF
        var $swf = $('<div/>').appendTo($container);
        var w, h;
        w = h = 1;
        this._embedSWF($('<div/>').appendTo($swf), cdaSettings.name, cdaSettings.swfURL, 'window', w, h, {
            'appKey' : cdaSettings.taobao.appKey,
            'readyCallback' : 'andrea.grace._api.dataSource.taobao.cdaReadyCallback',
            'dataCallback' : 'andrea.grace._api.dataSource.taobao.cdaDataCallback',
            'completeCallback' : 'andrea.grace._api.dataSource.taobao.cdaCompleteCallback'
        });
        $swf.css('visibility', 'hidden');
    };
    Taobao.prototype._authorize = function() {
        var cdaSettings = grace.Settings.crossDomainAccessor;
        // Taobao OAuth
        var urlVariables = [];
        urlVariables.push(['client_id', cdaSettings.taobao.appKey].join('='));
        urlVariables.push(['response_type', 'token'].join('='));
        urlVariables.push(['redirect_uri', cdaSettings.taobao.redirect + '?dataSource=taobao'].join('='));
        window.location.href = 'https://oauth.taobao.com/authorize?' + urlVariables.join('&');
    };
    Taobao.prototype._generateColumnDescriptors = function() {
        var columnDescriptors = [];
        var genColumn = function(id, name, converterType, analysisType) {
            return {
                'id' : id,
                'name' : name,
                'converterType' : converterType,
                'analysisType' : analysisType
            };
        };
        columnDescriptors.push(genColumn('status', '交易状态', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('type', '交易类型', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('created', '交易创建时间', ConverterType.DATE_IN_TEXT, AnalysisType.DIMENSION));
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

        return columnDescriptors;
    };
    Taobao.prototype._cdaDataHandler = function(response) {
        Log.performance('loadTaobaoTrades', [this._watch.type, 'loadData', this._watch.lap()].join(','));
        var i, j, k;
        response = this._decode(response);

        if (response.trades_sold_get_response.total_results > 0) {
            var trades = response.trades_sold_get_response.trades.trade;
            var rows = this._rows;
            var columnDescriptors = this._columnDescriptors;
            this._cdaNumTrades += trades.length;
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
                            row[k] = TaobaoAPI.toCaption(o[id], 'order', id);
                        } else {
                            id = path[0];
                            row[k] = TaobaoAPI.toCaption(t[id], 'trade', id);
                        }
                    }
                    rows.push(row);
                }
            }

            var cdaSettings = grace.Settings.crossDomainAccessor;
            var dataPercent = this._cdaNumTrades / Math.min(cdaSettings.taobao.trade.maxResults, response.trades_sold_get_response.total_results);
            this.progress(dataPercent);
        }
    };
    Taobao.prototype._cdaCompleteHandler = function() {
        Log.performance('loadTaobaoTrades', [this._watch.type, 'loadComplete', this._watch.lap(true), this._watch.total()].join(','));
        this._dpReady({
            'rows' : this._rows,
            'columnDescriptors' : this._columnDescriptors,
            'source' : 'taobao'
        });
    };
})();
(function() {
    var grace = andrea.grace;

    var URLUtil = grace.utils.URLUtil;
    var DataSourceBase = andrea.grace.views.dataSources.DataSourceBase;
    var Log = grace.managers.Log;
    var Stopwatch = grace.utils.Stopwatch;
    var JingdongAPI = grace.constants.JingdongAPI;
    var ConverterType = grace.utils.ConverterType;
    var AnalysisType = grace.constants.AnalysisType;

    andrea.blink.declare('andrea.grace.views.dataSources.Jingdong');
    var Jingdong = andrea.grace.views.dataSources.Jingdong = function(div) {
        Jingdong.superclass.constructor.apply(this, arguments);

        this._watch = null;
        this._accessToken = null;

        this._rows = [];
        this._columnDescriptors = this._generateColumnDescriptors();

        this._hookupAPI();
        this._createChildren();
    };
    andrea.blink.extend(Jingdong, andrea.grace.views.dataSources.DataSourceBase);

    Jingdong.prototype.loadURL = function(hashPairs) {
        var jingdong = grace.Settings.dataSource.jingdong;
        if (hashPairs.code && hashPairs.codeOverdue !== 'true') {
            this._options = hashPairs;
            $.ajax({
                'url' : grace.Settings.javaServer + '/dataAccessor/jd?method=token',
                'dataType' : 'jsonp',
                'data' : {
                    'oauth' : jingdong.oauth,
                    'code' : hashPairs.code,
                    'state' : hashPairs.state,
                    'appKey' : jingdong.appKey,
                    'redirect_uri' : jingdong.redirect + '?dataSource=jd'
                }
            }).done($.proxy(function(data) {
                Log.interaction('dataSource', ['jingdong', JSON.stringify(data)].join(','));
                window.location.hash = 'codeOverdue=true';
                this._accessToken = data.access_token;
                this._loadOrders();
                this._logUser();
            }, this)).fail($.proxy(function() {
                Log.console('jingdong token fail.');
            }, this));

            this.state(DataSourceBase.STATE_LOADING);
        } else if (hashPairs.error) {
        }
    };
    Jingdong.prototype.keyword = function() {
        return 'jd';
    };
    Jingdong.prototype._hookupAPI = function() {
        andrea.blink.declare('andrea.grace._api.dataSource.jingdong');

        andrea.grace._api.dataSource.jingdong.load = $.proxy(function(options) {
            _.defer($.proxy(this._load, this), options);
        }, this);
    };
    Jingdong.prototype._load = function(options) {
        this.state(DataSourceBase.STATE_LOADING);

        var jingdong = grace.Settings.dataSource.jingdong;
        jingdong.appKey = options.appKey || jingdong.appKey;

        this._accessToken = options.accessToken;
        this._loadOrders();

    };
    Jingdong.prototype._logUser = function(userID) {
        var jingdong = grace.Settings.dataSource.jingdong;

        $.ajax({
            'url' : grace.Settings.nodeServer + '/node/jd/user/create',
            'dataType' : 'jsonp',
            'data' : {
                'app_key' : jingdong.appKey,
                'access_token' : this._accessToken,
                'user_id' : userID
            }
        });
    };
    Jingdong.prototype._loadOrders = function() {
        this._watch = new Stopwatch(['jingdong'].join(','), true);

        var jingdong = grace.Settings.dataSource.jingdong;
        var end = new Date();
        var start = new Date();
        start.setMonth(start.getMonth() - 1);

        var optional_fields = [];
        // Get vernder_id for log db
        optional_fields.push('vender_id');
        var complex = {};
        _.each(this._columnDescriptors, function(column) {
            var ids = column.id.split('.');
            var id = ids[0];
            if (ids.length === 1) {
                optional_fields.push(id);
            } else {
                if (!complex[id]) {
                    if (id === 'consignee_info') {
                        optional_fields.push(id);
                    } else {
                        optional_fields.push(id + '_list');
                    }
                    complex[id] = true;
                }
            }
        });

        $.ajax({
            'url' : grace.Settings.javaServer + '/dataAccessor/jd?method=access',
            'data' : {
                'api' : jingdong.api,
                'token' : this._accessToken,
                'appKey' : jingdong.appKey,
                'start_date' : start.format('yyyy-MM-dd HH:mm:ss'),
                'end_date' : end.format('yyyy-MM-dd HH:mm:ss'),
                'optional_fields' : optional_fields.join(',')
            },
            'dataType' : 'jsonp'
        }).done($.proxy(function(data) {
            _.each(data, $.proxy(function(responses) {
                _.each(responses, $.proxy(function(response) {
                    this._dataHandler(response);
                }, this));
            }, this));

            if (this._rows.length === 0) {
                var contact = prompt('您还不是卖家吧？或者请您留下您的联系方式。');
                Log.interaction('authorize', ['jingdong', contact]);
                this.state(DataSourceBase.STATE_NORMAL);
            } else {
                this._completeHandler();
            }
        }, this));
    };
    Jingdong.prototype._createChildren = function() {
        var $container = this._$dom.clone().appendTo(this._$dom);
        $container.on('click', $.proxy(function(event) {
            this._authorize();
        }, this));

        this._generateButton($container, {
            'color' : '#00569b',
            'captions' : ['京东']
        });
    };
    Jingdong.prototype._authorize = function() {
        var jingdong = grace.Settings.dataSource.jingdong;
        // Jingdong OAuth
        var urlVariables = [];
        urlVariables.push(['client_id', jingdong.appKey].join('='));
        urlVariables.push(['response_type', 'code'].join('='));
        urlVariables.push(['redirect_uri', jingdong.redirect + '?dataSource=jd'].join('='));
        window.location.href = jingdong.oauth + '/authorize?' + urlVariables.join('&');
    };
    Jingdong.prototype._generateColumnDescriptors = function() {
        var columnDescriptors = [];
        var genColumn = function(id, name, converterType, analysisType) {
            return {
                'id' : id,
                'name' : name,
                'converterType' : converterType,
                'analysisType' : analysisType
            };
        };
        columnDescriptors.push(genColumn('order_start_time', '下单时间', ConverterType.DATE_IN_TEXT, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('order_state', '订单状态', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('pay_type', '支付方式', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('item_info.sku_name', '商品名称+SKU', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('order_end_time', '结单时间', ConverterType.DATE_IN_TEXT, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('consignee_info.province', '收货人省份', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('coupon_detail.coupon_type', '优惠类型', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('order_state_remark', '订单状态说明', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('delivery_type', '送货（日期）类型', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('item_info.gift_point', '赠送积分', ConverterType.STRING, AnalysisType.DIMENSION));

        columnDescriptors.push(genColumn('order_total_price', '总金额', ConverterType.NUMBER, AnalysisType.MEASURE));
        columnDescriptors.push(genColumn('order_payment', '应付金额', ConverterType.NUMBER, AnalysisType.MEASURE));
        columnDescriptors.push(genColumn('order_seller_price', '货款金额', ConverterType.NUMBER, AnalysisType.MEASURE));
        columnDescriptors.push(genColumn('seller_discount', '优惠金额', ConverterType.NUMBER, AnalysisType.MEASURE));
        columnDescriptors.push(genColumn('freight_price', '运费', ConverterType.NUMBER, AnalysisType.MEASURE));
        columnDescriptors.push(genColumn('item_info.item_total', '商品名数量', ConverterType.NUMBER, AnalysisType.MEASURE));

        return columnDescriptors;
    };
    Jingdong.prototype._dataHandler = function(response) {
        var k;

        if (response.error_response) {
            Log.interaction('dataHandler', ['jingdong', 'error_response', response.error_response.en_desc]);
            return;
        }

        response = response.order_search_response;
        if (response && response.order_search) {
            Log.interaction('dataHandler', ['jingdong', 'order_search', response.order_search.order_total]);

            var userID = null;
            var columnDescriptors = this._columnDescriptors;
            var rows = this._rows;

            var orders = response.order_search.order_info_list;
            _.each(orders, function(o) {
                userID = userID || o.vender_id;
                var items = o.item_info_list;
                _.each(items, function(i) {
                    var row = [];
                    for ( k = columnDescriptors.length - 1; k >= 0; k--) {
                        var cd = columnDescriptors[k];
                        var id = cd.id;
                        var path = id.split('.');
                        if (path[0] === 'item_info_list') {
                            id = path[1];
                            row[k] = JingdongAPI.toCaption(i[id], 'item', id);
                        } else if (path[0] === 'consignee_info') {
                            id = path[1];
                            row[k] = JingdongAPI.toCaption(o.consignee_info[id], 'consignee', id);
                        } else if (path[0] === 'coupon_detail_list') {
                            id = path[1];
                            row[k] = JingdongAPI.toCaption(o.coupon_detail_list[0][id], 'coupon', id);
                        } else {
                            id = path[0];
                            row[k] = JingdongAPI.toCaption(o[id], 'order', id);
                        }
                    }
                    rows.push(row);
                });
            });
            if (userID) {
                this._logUser(userID);
            }
        }
    };
    Jingdong.prototype._completeHandler = function() {
        Log.performance('loadJingdongOrders', [this._watch.type, 'loadComplete', this._watch.lap(true), this._watch.total()].join(','));
        this._dpReady({
            'rows' : this._rows,
            'columnDescriptors' : this._columnDescriptors,
            'source' : 'jingdong'
        });
    };
})();
(function() {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.views.dataSources.Customize');
    var Customize = andrea.grace.views.dataSources.Customize = function(div) {
        Customize.superclass.constructor.apply(this, arguments);

        this._createChildren();
    };
    andrea.blink.extend(Customize, andrea.grace.views.dataSources.DataSourceBase);

    Customize.prototype._createChildren = function() {
        var $container = this._$dom;
        $container.on('click', $.proxy(function(event) {
            window.location.href = 'mailto:andiris29@gmail.com?subject=添加定制数据源&body=<请描述您的数据源（如数据库地址、网页地址等）。作者会在2个工作日内给您回复。';
        }, this));

        this._generateButton($container, {
            'color' : '#3498db',
            'captions' : ['定制', '数据源…']
        });
    };
})();
(function() {
    var grace = andrea.grace;

    var Log = grace.managers.Log;
    var DataSourceBase = andrea.grace.views.dataSources.DataSourceBase;

    andrea.blink.declare('andrea.grace.views.dataSources.Sample');
    var Sample = andrea.grace.views.dataSources.Sample = function(div, settings) {
        Sample.superclass.constructor.apply(this, arguments);

        this._settings = settings;
        this._createChildren();
    };
    andrea.blink.extend(Sample, andrea.grace.views.dataSources.DataSourceBase);

    Sample.prototype._createChildren = function() {
        var settings = this._settings;

        var $container = this._$dom;
        $container.on('click', $.proxy(function(event) {
            this._loadEg(settings.json, settings.name);
        }, this));

        this._generateButton($container, {
            'color' : '#e74c3c',
            'captions' : settings.captions,
            'link' : {
                'text' : '下载数据…',
                'url' : settings.download
            }
        });
    };
    Sample.prototype._loadEg = function(jsonPath, name) {
        this.state(DataSourceBase.STATE_LOADING);

        grace.api.dataSource.load('json', {
            'url' : jsonPath
        });
        Log.interaction('dataSource', ['sample', name].join(','));
    };
})();
(function() {
    var grace = andrea.grace;
    var MoreButton = grace.views.components.MoreButton;
    var DataSourceEvent = grace.views.analysisContainer.events.DataSourceEvent;
    var URLUtil = grace.utils.URLUtil;
    var Loading = grace.views.popUp.Loading;
    var Log = grace.managers.Log;

    var DataSourceBase = andrea.grace.views.dataSources.DataSourceBase;
    var DataSourceJSON = andrea.grace.views.dataSources.DataSourceJSON;
    var DataSourceJSONP = andrea.grace.views.dataSources.DataSourceJSONP;
    var File = andrea.grace.views.dataSources.File;
    var Taobao = andrea.grace.views.dataSources.Taobao;
    var Jingdong = andrea.grace.views.dataSources.Jingdong;
    var Customize = andrea.grace.views.dataSources.Customize;
    var Sample = andrea.grace.views.dataSources.Sample;
    var DataDiscoveryModel = grace.models.DataDiscoveryModel;
    var SerializeManager = grace.managers.SerializeManager;

    var _LAYOUT = {
        'sources' : {
            'container' : {
                'numCells' : {
                    'horizontal' : 2,
                    'vertical' : 1
                },
                'gap' : {
                    'horizontal' : 10,
                    'vertical' : 10
                },
                'cell' : {
                    'width' : 140,
                    'height' : 100
                }
            },
            'file' : [0, 0, 2, 1]
        },
        'guide' : {
        }
    };
    _LAYOUT.sources.samples = _LAYOUT.sources.samples || {};

    andrea.blink.declare('andrea.grace.DataSource');
    var DataSource = grace.DataSource = function(div) {
        DataSource.superclass.constructor.apply(this, arguments);

        this._$main = $('#divDataSourceMain', this._dom);
        this._$main.empty();
        this._$main.css({
            'height' : this._$dom.height() - 48 - 66
        });

        this._$header = $('#divHeader', this._dom);
        this._$header.on('click', function() {
            window.location.href = grace.Settings.home;
        });

        this._loading = null;

        this._dsMap = {};

        this._json = null;
        this._file = null;
        this._taobao = null;
        this._jingdong = null;

        // Create container
        var layoutContainer = _LAYOUT.sources.container;
        var $container = this._generateCell(0, 0, layoutContainer.numCells.horizontal, layoutContainer.numCells.vertical).addClass('grace-dataSource-main-container').appendTo(this._$main);
        $container.css({
            'position' : 'absolute',
            'left' : (this._$main.width() - $container.width()) / 2,
            'top' : (this._$main.height() - $container.height()) / 2
        });
        if (_LAYOUT.guide.video) {
            var videoSize = {
                'width' : 480,
                'height' : 270
            };
            var $videoContainer = $('<div/>').appendTo(this._$main);
            $videoContainer.css({
                'position' : 'absolute',
                'left' : (this._$main.width() - 800) / 2,
                'top' : Math.max(12, (this._$main.height() - $container.height()) / 2 - 60)
            });
            $container.css({
                'left' : parseFloat($container.css('left')) + videoSize.width / 2 + 6,
                'top' : (this._$main.height() - $container.height()) / 2 + 0
            });

            var $video = $('<video controls/>');
            $video.addClass('video-js vjs-default-skin vjs-big-play-centered');
            $video.attr({
                'id' : 'videoGuide',
                'preload' : 'none',
                'width' : videoSize.width,
                'height' : videoSize.height,
                'poster' : './DataDiscovery/assets/videos/guide_poster.jpg',
                'data-setup' : '{}'
            });
            var $source = $('<source/>').appendTo($video);
            $source.attr({
                'src' : './DataDiscovery/assets/videos/guide.mp4',
                'type' : 'video/mp4'
            });

            $video.appendTo($videoContainer);
        }

        if ($.browser.webkit) {
            // Chrome, Safari
            this._createChildren($container);
        } else {
            // Browser fail
            alertify.reset();
            alertify.set({
                'delay' : 1000 * 60 * 60
            });
            alertify.error('为了交互体验，请通过谷歌浏览器访问！');

            var $chrome = this._generateCell(0, 0, 3, 2).appendTo($container);
            $chrome.text('下载谷歌浏览器...').addClass('grace-dataSource-chrome');
            $chrome.css('line-height', $chrome.height() + 'px');
            $chrome.on('click', $.proxy(function(event) {
                window.location = grace.Settings.chrome.localURL;
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
        if (hashPairs.dataSource && this._dsMap[hashPairs.dataSource]) {
            // Data source
            var ds = this._dsMap[hashPairs.dataSource];
            ds.loadURL(hashPairs);
        } else if (hashPairs.collab) {
            // Collaboration
            SerializeManager.instance().deserialize(hashPairs.collab);
        }

        this._hookupAPI();
    };
    andrea.blink.extend(DataSource, andrea.blink.mvc.View);

    DataSource.prototype.destroy = function() {
        if (this._loading) {
            this._loading.close();
            this._loading = null;
        }
        if (_LAYOUT.guide.video) {
            videojs('videoGuide').dispose();
        }
    };
    DataSource.prototype._hookupAPI = function() {
        andrea.blink.declare('andrea.grace._api.dataSource.dataProvider');
        andrea.grace._api.dataSource.dataProvider.load = $.proxy(function(dataProvider) {
            // Do not support dsInfo
            _.defer($.proxy(this._dpReady, this), dataProvider, null);
        }, this);
    };
    DataSource.prototype._dpReady = function(dataProvider, dsInfo) {
        this.dispatchEvent(new DataSourceEvent(DataSourceEvent.DATA_PROVIDER_READY, this, {
            'dataProvider' : dataProvider,
            'dsInfo' : dsInfo
        }));
    };
    DataSource.prototype._listen = function(ds) {
        ds.addEventListener(DataSourceEvent.STATE_CHANGED, function(event) {
            if (ds.state() === DataSourceBase.STATE_LOADING) {
                var progress = ds.progress();
                if (!this._loading) {
                    if (progress !== null) {
                        this._loading = new Loading($('<div/>'), '');
                    } else {
                        this._loading = new Loading($('<div/>'));
                    }
                    this._loading.open(this._$main, true);
                }
                if (progress !== null) {
                    this._loading.percent(progress);
                }
            } else {
                if (this._loading) {
                    this._loading.close();
                    this._loading = null;
                }
            }
        }, this);
        ds.addEventListener(DataSourceEvent.DATA_PROVIDER_READY, function(event) {
            this._dpReady(event.data.dataProvider, event.data.dsInfo);
        }, this);
        return ds;
    };
    DataSource.prototype._createChildren = function($container) {
        var create = $.proxy(function(clazz, layout, settings) {
            var div = null;
            if (layout) {
                div = this._generateCell(layout[0], layout[1], layout[2], layout[3], $container);
            }
            var ds = new clazz(div, settings);
            this._listen(ds);

            if (ds.keyword()) {
                this._dsMap[ds.keyword()] = ds;
            }
            return ds;
        }, this);

        create(DataSourceJSON, _LAYOUT.sources.json);
        create(DataSourceJSONP, _LAYOUT.sources.jsonp);
        create(File, _LAYOUT.sources.file);
        create(Taobao, _LAYOUT.sources.taobao);
        create(Jingdong, _LAYOUT.sources.jingdong);
        create(Customize, _LAYOUT.sources.customize);
        create(Sample, _LAYOUT.sources.samples.superMarket, {
            'name' : 'SuperMarket',
            'json' : grace.Settings.data.superMarket.json,
            'captions' : ['样例', '超市销售'],
            'description' : '时间、空间、产品、客户等多维度查看及分析超市的销售状况。',
            'download' : grace.Settings.data.superMarket.excel
        });
        create(Sample, _LAYOUT.sources.samples.worldBank, {
            'name' : 'WorldBank',
            'json' : grace.Settings.data.worldBank.json,
            'captions' : ['样例', '世界银行'],
            'description' : '世界银行公布的各国数据指标。涵盖股市、金融、商业等。',
            'download' : grace.Settings.data.worldBank.excel
        });
    };
    DataSource.prototype._generateCell = function(x, y, w, h, $container) {
        var layoutContainer = _LAYOUT.sources.container;
        var gap = layoutContainer.gap;
        var cell = layoutContainer.cell;
        var $div = $('<div/>');
        $div.css({
            'width' : cell.width * w + gap.horizontal * (w - 1) + 'px',
            'height' : cell.height * h + gap.vertical * (h - 1) + 'px',
            'left' : x * (cell.width + gap.horizontal) + 'px',
            'top' : y * (cell.height + gap.vertical) + 'px'
        });

        $div.appendTo($container);
        return $div;
    };
})();
(function() {
    var grace = andrea.grace;
    var PageTransition = grace.helpers.PageTransition;
    var DataSourceEvent = grace.views.analysisContainer.events.DataSourceEvent;
    var Log = grace.managers.Log;
    var URLUtil = grace.utils.URLUtil;
    var DataDiscoveryModel = grace.models.DataDiscoveryModel;
    var SerializeManager = grace.managers.SerializeManager;

    andrea.blink.declare("andrea.grace.Grace");
    var Grace = grace.Grace = function(dependentJSs, dependentCSSs) {
        var hashPairs = URLUtil.hashPairs();
        Log.user = hashPairs.andrea_user ? hashPairs.andrea_user : 'user';
        Log.interaction('open', JSON.stringify($.browser));

        $($.proxy(function() {
            // Load dependency js files for DataDiscovery
            LazyLoad.js(dependentJSs, $.proxy(function() {
                if (dependentCSSs && dependentCSSs.length) {
                    LazyLoad.css(dependentCSSs, $.proxy(this._jsReady, this));
                } else {
                    this._jsReady();
                }
            }, this));
            //
            this._$dataSource = $('#divDataSource');
            this._$dataDiscovery = $("#divDataDiscovery");
            $('#divMain', this._$dataDiscovery).bind("selectstart", function() {
                return false;
            });

            var dataSource = this._dataSource = new grace.DataSource(this._$dataSource[0]);
            dataSource.addEventListener(DataSourceEvent.DATA_PROVIDER_READY, this._dataSourceDataSourceReadyHandler, this);
        }, this));

        this._dataSource = null;
        this._$dataSource = null;
        this._$dataDiscovery = null;

        this._lazyLoading = true;
        this._dp = null;
        this._dsInfo = null;

        this._startup();
    };
    // ------------------------------------
    // Private methods
    // ------------------------------------
    Grace.prototype._startup = function() {
    };
    // Goto DataDiscovery
    Grace.prototype._dataSourceDataSourceReadyHandler = function(event) {
        this._dp = event.data.dataProvider;
        this._dsInfo = event.data.dsInfo;
        this._gotoDataDiscovery();
    };
    Grace.prototype._jsReady = function() {
        ZeroClipboard.config({
            'moviePath' : grace.Settings.zeroClipboard.moviePath
        });

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
        SerializeManager.instance().saveDataSource(this._dsInfo);
        dataDiscovery.rowBasedDataProvider(this._dp.rows, this._dp.columnDescriptors, this._dp.source);

        // Play animation
        var pt = new PageTransition({
            '$page' : this._$dataSource,
            'classes' : ['pt-page-scaleDownCenter']
        }, {
            '$page' : this._$dataDiscovery,
            'classes' : ['pt-page-scaleUpCenter'],
            'delay' : 180
        }, $.proxy(function() {
            this._$dataSource.css({
                'z-index' : -1,
                'width' : '0px',
                'height' : '0px',
                'overflow' : 'hidden'
            });
            // Could not set display to none here, since save file swf will be unloaded when display = none.
            // this._$dataSource.css('display', 'none');

            dataDiscovery.loadCollaboration();
        }, this));
        _.defer(function() {
            pt.play();
        });
    };
})();
