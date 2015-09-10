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
(function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,h=e.reduce,v=e.reduceRight,d=e.filter,g=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,_=Object.keys,j=i.bind,w=function(n){return n instanceof w?n:this instanceof w?(this._wrapped=n,void 0):new w(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=w),exports._=w):n._=w,w.VERSION="1.4.4";var A=w.each=w.forEach=function(n,t,e){if(null!=n)if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a in n)if(w.has(n,a)&&t.call(e,n[a],a,n)===r)return};w.map=w.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e[e.length]=t.call(r,n,u,i)}),e)};var O="Reduce of empty array with no initial value";w.reduce=w.foldl=w.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduce===h)return e&&(t=w.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(O);return r},w.reduceRight=w.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduceRight===v)return e&&(t=w.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=w.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(O);return r},w.find=w.detect=function(n,t,r){var e;return E(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},w.filter=w.select=function(n,t,r){var e=[];return null==n?e:d&&n.filter===d?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&(e[e.length]=n)}),e)},w.reject=function(n,t,r){return w.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},w.every=w.all=function(n,t,e){t||(t=w.identity);var u=!0;return null==n?u:g&&n.every===g?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var E=w.some=w.any=function(n,t,e){t||(t=w.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};w.contains=w.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:E(n,function(n){return n===t})},w.invoke=function(n,t){var r=o.call(arguments,2),e=w.isFunction(t);return w.map(n,function(n){return(e?t:n[t]).apply(n,r)})},w.pluck=function(n,t){return w.map(n,function(n){return n[t]})},w.where=function(n,t,r){return w.isEmpty(t)?r?null:[]:w[r?"find":"filter"](n,function(n){for(var r in t)if(t[r]!==n[r])return!1;return!0})},w.findWhere=function(n,t){return w.where(n,t,!0)},w.max=function(n,t,r){if(!t&&w.isArray(n)&&n[0]===+n[0]&&65535>n.length)return Math.max.apply(Math,n);if(!t&&w.isEmpty(n))return-1/0;var e={computed:-1/0,value:-1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a>=e.computed&&(e={value:n,computed:a})}),e.value},w.min=function(n,t,r){if(!t&&w.isArray(n)&&n[0]===+n[0]&&65535>n.length)return Math.min.apply(Math,n);if(!t&&w.isEmpty(n))return 1/0;var e={computed:1/0,value:1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;e.computed>a&&(e={value:n,computed:a})}),e.value},w.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=w.random(r++),e[r-1]=e[t],e[t]=n}),e};var k=function(n){return w.isFunction(n)?n:function(t){return t[n]}};w.sortBy=function(n,t,r){var e=k(t);return w.pluck(w.map(n,function(n,t,u){return{value:n,index:t,criteria:e.call(r,n,t,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index<t.index?-1:1}),"value")};var F=function(n,t,r,e){var u={},i=k(t||w.identity);return A(n,function(t,a){var o=i.call(r,t,a,n);e(u,o,t)}),u};w.groupBy=function(n,t,r){return F(n,t,r,function(n,t,r){(w.has(n,t)?n[t]:n[t]=[]).push(r)})},w.countBy=function(n,t,r){return F(n,t,r,function(n,t){w.has(n,t)||(n[t]=0),n[t]++})},w.sortedIndex=function(n,t,r,e){r=null==r?w.identity:k(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;u>r.call(e,n[o])?i=o+1:a=o}return i},w.toArray=function(n){return n?w.isArray(n)?o.call(n):n.length===+n.length?w.map(n,w.identity):w.values(n):[]},w.size=function(n){return null==n?0:n.length===+n.length?n.length:w.keys(n).length},w.first=w.head=w.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:o.call(n,0,t)},w.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},w.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},w.rest=w.tail=w.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},w.compact=function(n){return w.filter(n,w.identity)};var R=function(n,t,r){return A(n,function(n){w.isArray(n)?t?a.apply(r,n):R(n,t,r):r.push(n)}),r};w.flatten=function(n,t){return R(n,t,[])},w.without=function(n){return w.difference(n,o.call(arguments,1))},w.uniq=w.unique=function(n,t,r,e){w.isFunction(t)&&(e=r,r=t,t=!1);var u=r?w.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:w.contains(a,r))||(a.push(r),i.push(n[e]))}),i},w.union=function(){return w.uniq(c.apply(e,arguments))},w.intersection=function(n){var t=o.call(arguments,1);return w.filter(w.uniq(n),function(n){return w.every(t,function(t){return w.indexOf(t,n)>=0})})},w.difference=function(n){var t=c.apply(e,o.call(arguments,1));return w.filter(n,function(n){return!w.contains(t,n)})},w.zip=function(){for(var n=o.call(arguments),t=w.max(w.pluck(n,"length")),r=Array(t),e=0;t>e;e++)r[e]=w.pluck(n,""+e);return r},w.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},w.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=w.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},w.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},w.range=function(n,t,r){1>=arguments.length&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=Array(e);e>u;)i[u++]=n,n+=r;return i},w.bind=function(n,t){if(n.bind===j&&j)return j.apply(n,o.call(arguments,1));var r=o.call(arguments,2);return function(){return n.apply(t,r.concat(o.call(arguments)))}},w.partial=function(n){var t=o.call(arguments,1);return function(){return n.apply(this,t.concat(o.call(arguments)))}},w.bindAll=function(n){var t=o.call(arguments,1);return 0===t.length&&(t=w.functions(n)),A(t,function(t){n[t]=w.bind(n[t],n)}),n},w.memoize=function(n,t){var r={};return t||(t=w.identity),function(){var e=t.apply(this,arguments);return w.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},w.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},w.defer=function(n){return w.delay.apply(w,[n,1].concat(o.call(arguments,1)))},w.throttle=function(n,t){var r,e,u,i,a=0,o=function(){a=new Date,u=null,i=n.apply(r,e)};return function(){var c=new Date,l=t-(c-a);return r=this,e=arguments,0>=l?(clearTimeout(u),u=null,a=c,i=n.apply(r,e)):u||(u=setTimeout(o,l)),i}},w.debounce=function(n,t,r){var e,u;return function(){var i=this,a=arguments,o=function(){e=null,r||(u=n.apply(i,a))},c=r&&!e;return clearTimeout(e),e=setTimeout(o,t),c&&(u=n.apply(i,a)),u}},w.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},w.wrap=function(n,t){return function(){var r=[n];return a.apply(r,arguments),t.apply(this,r)}},w.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},w.after=function(n,t){return 0>=n?t():function(){return 1>--n?t.apply(this,arguments):void 0}},w.keys=_||function(n){if(n!==Object(n))throw new TypeError("Invalid object");var t=[];for(var r in n)w.has(n,r)&&(t[t.length]=r);return t},w.values=function(n){var t=[];for(var r in n)w.has(n,r)&&t.push(n[r]);return t},w.pairs=function(n){var t=[];for(var r in n)w.has(n,r)&&t.push([r,n[r]]);return t},w.invert=function(n){var t={};for(var r in n)w.has(n,r)&&(t[n[r]]=r);return t},w.functions=w.methods=function(n){var t=[];for(var r in n)w.isFunction(n[r])&&t.push(r);return t.sort()},w.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},w.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},w.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)w.contains(r,u)||(t[u]=n[u]);return t},w.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)null==n[r]&&(n[r]=t[r])}),n},w.clone=function(n){return w.isObject(n)?w.isArray(n)?n.slice():w.extend({},n):n},w.tap=function(n,t){return t(n),n};var I=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof w&&(n=n._wrapped),t instanceof w&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==t+"";case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;r.push(n),e.push(t);var a=0,o=!0;if("[object Array]"==u){if(a=n.length,o=a==t.length)for(;a--&&(o=I(n[a],t[a],r,e)););}else{var c=n.constructor,f=t.constructor;if(c!==f&&!(w.isFunction(c)&&c instanceof c&&w.isFunction(f)&&f instanceof f))return!1;for(var s in n)if(w.has(n,s)&&(a++,!(o=w.has(t,s)&&I(n[s],t[s],r,e))))break;if(o){for(s in t)if(w.has(t,s)&&!a--)break;o=!a}}return r.pop(),e.pop(),o};w.isEqual=function(n,t){return I(n,t,[],[])},w.isEmpty=function(n){if(null==n)return!0;if(w.isArray(n)||w.isString(n))return 0===n.length;for(var t in n)if(w.has(n,t))return!1;return!0},w.isElement=function(n){return!(!n||1!==n.nodeType)},w.isArray=x||function(n){return"[object Array]"==l.call(n)},w.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){w["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),w.isArguments(arguments)||(w.isArguments=function(n){return!(!n||!w.has(n,"callee"))}),"function"!=typeof/./&&(w.isFunction=function(n){return"function"==typeof n}),w.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},w.isNaN=function(n){return w.isNumber(n)&&n!=+n},w.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},w.isNull=function(n){return null===n},w.isUndefined=function(n){return n===void 0},w.has=function(n,t){return f.call(n,t)},w.noConflict=function(){return n._=t,this},w.identity=function(n){return n},w.times=function(n,t,r){for(var e=Array(n),u=0;n>u;u++)e[u]=t.call(r,u);return e},w.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))};var M={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","/":"&#x2F;"}};M.unescape=w.invert(M.escape);var S={escape:RegExp("["+w.keys(M.escape).join("")+"]","g"),unescape:RegExp("("+w.keys(M.unescape).join("|")+")","g")};w.each(["escape","unescape"],function(n){w[n]=function(t){return null==t?"":(""+t).replace(S[n],function(t){return M[n][t]})}}),w.result=function(n,t){if(null==n)return null;var r=n[t];return w.isFunction(r)?r.call(n):r},w.mixin=function(n){A(w.functions(n),function(t){var r=w[t]=n[t];w.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),D.call(this,r.apply(w,n))}})};var N=0;w.uniqueId=function(n){var t=++N+"";return n?n+t:t},w.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var T=/(.)^/,q={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},B=/\\|'|\r|\n|\t|\u2028|\u2029/g;w.template=function(n,t,r){var e;r=w.defaults({},r,w.templateSettings);var u=RegExp([(r.escape||T).source,(r.interpolate||T).source,(r.evaluate||T).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(B,function(n){return"\\"+q[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,w);var c=function(n){return e.call(this,n,w)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},w.chain=function(n){return w(n).chain()};var D=function(n){return this._chain?w(n).chain():n};w.mixin(w),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];w.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],D.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];w.prototype[n]=function(){return D.call(this,t.apply(this._wrapped,arguments))}}),w.extend(w.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}).call(this);/**
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

		this._explicitWidth = null;
		this._explicitHeight = null;
		this._measuredWidth = 0;
		this._measuredHeight = 0;
	};

	blink.extend(andrea.blink.mvc.View, andrea.blink.events.EventDispatcher);

	View.prototype.dom = function() {
		return this._dom;
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
(function() {
    andrea.blink.declare("andrea.grace");
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.Index");
    var Index = grace.Index = function(dependencyFiles) {
        // DOM Behavior
        $(document).bind("selectstart", function() {
            return false;
        });
        // Static
        Index._instance = this;

        $(window).load($.proxy(function() {
            // Load dependency js files for DataDiscovery
            LazyLoad.js(dependencyFiles, $.proxy(this._jsReady, this));
            //
            this._$index = $('.grace-index');

            var $btnYourData = $('#btnYourData', this._$index);
            var $btnSampleData = $('#btnSampleData', this._$index);
            $btnSampleData.on('click', $.proxy(this._btnSampleDataClickHandler, this));

            this._$dataDiscovery = $('.grace-analysis');
        }, this));

        this._$index = null;
        this._$dataDiscovery = null;

        this._lazyLoading = true;
        this._dp = null;

    };
    // ------------------------------------
    // Static for flash
    // ------------------------------------
    Index._instance = null;
    Index.flashCallback = function(rows, columnDescriptors) {
        return Index._instance._flashDataHandler.apply(Index._instance, arguments);
    };
    // ------------------------------------
    // Private methods
    // ------------------------------------
    // Data for DataDiscovery
    Index.prototype._flashDataHandler = function(rows, columnDescriptors) {
        var decode = function(s) {
            return JSON.parse(decodeURIComponent(s));
        }
        // Defer for performance log
        _.defer($.proxy(this._dpReady, this), {
            'rows' : _.isString(rows) ? decode(rows) : rows,
            'columnDescriptors' : _.isString(columnDescriptors) ? decode(columnDescriptors) : columnDescriptors,
            'source' : 'excel'
        });
        return true;
    }
    Index.prototype._btnSampleDataClickHandler = function() {
        this._dpReady(new grace.testingData.SampleTOPTrade());
    };
    // Goto DataDiscovery
    Index.prototype._dpReady = function(dp) {
        this._dp = dp;
        this._gotoDataDiscovery();
    };
    Index.prototype._jsReady = function() {
        this._lazyLoading = false;
        this._gotoDataDiscovery();
    };
    Index.prototype._gotoDataDiscovery = function() {
        if (!this._dp) {
            return;
        }
        if (this._lazyLoading) {
            return;
        }
        // Draw data discovery
        var dataDiscovery = new grace.DataDiscovery($("#divDataDiscovery")[0]);
        dataDiscovery.rowBasedDataProvider(this._dp.rows, this._dp.columnDescriptors, this._dp.source);

        // Play animation
        var outClass = 'pt-page-scaleDown';
        var inClass = 'pt-page-moveFromTop pt-page-ontop pt-page-delay300';
        var endCurrPage = false;
        var endNextPage = false;

        function animationEndHandler($outpage, $inpage) {
            endCurrPage = false;
            endNextPage = false;
            // resetPage($outpage, $inpage);
            // isAnimating = false;

            // Reset pages
            $outpage.detach();
            $inpage.removeClass(inClass);
        }

        // Play animation
        var animEndEventName = 'webkitAnimationEnd';
        this._$index.addClass(outClass).on(animEndEventName, $.proxy(function() {
            this._$index.off(animEndEventName);
            endCurrPage = true;
            if (endNextPage) {
                animationEndHandler(this._$index, this._$dataDiscovery);
            }
        }, this));

        this._$dataDiscovery.addClass(inClass).on(animEndEventName, $.proxy(function() {
            this._$dataDiscovery.off(animEndEventName);
            endNextPage = true;
            if (endCurrPage) {
                animationEndHandler(this._$index, this._$dataDiscovery);
            }
        }, this));
    };
})();
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

    // TODO Rename to ShelfType
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

	andrea.blink.declare("andrea.grace.constants.DataType");

	var DataType = grace.constants.DataType;

	DataType.STRING = "string";
	DataType.NUMBER = "number";
	DataType.GEO = "geo";
	DataType.DATE = "date";
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

    // 0 category, 0~1 series, 2 data
    VizType.SCATTER = "SCATTER";
    // 0 category, 0~1 series, 3 data
    VizType.BUBBLE = "BUBBLE";

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
                'icon' : icon
            }
        }
        var m = {};
        m[VizType.RECOMMEND] = gen(VizType.RECOMMEND, '推荐', 0, 0, '');

        m[VizType.COLUMN] = gen(VizType.COLUMN, '柱状图', 0, 1, './assets/navigator/column.png', '');
        m[VizType.BAR] = gen(VizType.BAR, '条状图', 0, 1, './assets/navigator/bar.png', '');
        m[VizType.RADAR] = gen(VizType.RADAR, '雷达图', 1, 1, './assets/navigator/radar.png', '');

        m[VizType.SCATTER] = gen(VizType.SCATTER, '散点图', 1, 1, './assets/navigator/scatter.png', '');
        m[VizType.BUBBLE] = gen(VizType.BUBBLE, '气泡图', 1, 3, './assets/navigator/bubble.png', '');

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
        loadType(OperationClassification.CALCULATE, OperationType.CALC_UNIQ_COUNT, '计数（唯一）', '计');
        loadType(OperationClassification.CALCULATE, OperationType.CALC_SUM, '∑ 总和', '∑');
        loadType(OperationClassification.CALCULATE, OperationType.CALC_AVG, '平均值', '均');
        loadType(OperationClassification.CALCULATE, OperationType.CALC_MAX, '最大值', '大');
        loadType(OperationClassification.CALCULATE, OperationType.CALC_MIN, '最小值', '小');
        // SORT
        loadType(OperationClassification.SORT, OperationType.SORT_NONE, '不排序', '');
        loadType(OperationClassification.SORT, OperationType.SORT_ASCEND, '\uf160 升序', '\uf160');
        loadType(OperationClassification.SORT, OperationType.SORT_DESCEND, '\uf161 降序', '\uf161');
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
        loadType(OperationClassification.GROUP, OperationType.GROUP_MONTH, '按月划分 (1 - 12)', '按月');
        loadType(OperationClassification.GROUP, OperationType.GROUP_DATE, '按日划分 (1 - 31)', '按日');
        loadType(OperationClassification.GROUP, OperationType.GROUP_DAY, '按星期划分 (1 - 7)', '按星');
        loadType(OperationClassification.GROUP, OperationType.GROUP_HOUR, '按时划分 (0 - 23)', '按时');
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
        return this.get(OperationType.SORT_ASCEND);
    };
    OperationGroup.prototype.descend = function() {
        return this.get(OperationType.SORT_DESCEND);
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
    };
})(jQuery);
(function() {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.utils.ConverterType');

    var ConverterType = grace.utils.ConverterType;

    ConverterType.ANY = 'any';
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
})();
(function() {
    var grace = andrea.grace;

    var ConverterType = grace.utils.ConverterType;

    andrea.blink.declare("andrea.grace.utils.DataConvertUtil");
    var DataConvertUtil = grace.utils.DataConvertUtil;

    DataConvertUtil.match = function(raw, tryExcel) {

        var value = null;
        var type = null;
        if (raw) {
            if (value === null) {
                value = DataConvertUtil._convertNumber(raw);
                // 1990/1/1 - 2030/12/31
                if (tryExcel && (value >= 32874 && value <= 47848 )) {
                    value = DataConvertUtil._convertExcelDate(raw);
                    type = ConverterType.EXCEL_DATE;
                } else {
                    type = ConverterType.NUMBER;
                }
            }
            if (value === null) {
                value = DataConvertUtil._convertDate(raw);
                type = ConverterType.DATE;
            }
            if (value === null) {
                value = DataConvertUtil._convertString(raw);
                type = ConverterType.STRING;
            }
        } else {
            type = ConverterType.ANY;
            value = null;
        }
        return {
            "type" : type,
            "value" : value
        };
    };
    DataConvertUtil.getConverter = function(type) {
        if (type === ConverterType.NUMBER) {
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
    /**
     *
     * @param {Object} raw
     */
    DataConvertUtil._convertString = function(raw) {
        if (raw != null) {
            return raw.toString().trim();
        } else {
            return '';
        }
    };
    /**
     *
     * @param {Object} raw
     */
    DataConvertUtil._convertNumber = function(raw) {
        if (raw != null) {
            var s = raw.toString().trim();
            if (!isNaN(s)) {
                return Number(s);
            } else {
                if (s.length > 1 && s.substr(s.length - 1, 1) === '%') {
                    s = s.substr(0, s.length - 1);
                    if (!isNaN(s)) {
                        return Number(s);
                    }
                }
            }
        } else {
            return 0;
        }
        return null;
    };
    /**
     *
     * @param {Object} raw
     */
    DataConvertUtil._convertDate = function(raw) {
        if (!raw) {
            return;
        }
        var s = raw.toString().trim();
        if (s.length < 6 || isNaN(s.substr(0, 1)) || isNaN(s.substr(s.length - 1, 1))) {
            return null;
        }
        s = s.replace(/[年月日_-]/g, "/");
        if (s.indexOf("/") === -1) {
            return null;
        }
        var formatHMS;
        if (s.indexOf(" ") !== -1) {
            if (s.indexOf(':') === -1) {
                return null;
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
        var formats = ConverterType.getDateFormats();
        for (var i = formats.length - 1; i >= 0 && !date; i--) {
            var test = formats[i];
            if (formatHMS) {
                test = test + ' ' + formatHMS;
            }
            date = Date.parseString(s, test);
            if (date) {
                DataConvertUtil._preferDateTest = test;
                // break;
            }
        }
        // console.log(date);
        return date;
    }
    DataConvertUtil._preferDateTest = null;

    /**
     *
     * @param {Object} raw
     */
    DataConvertUtil._convertExcelDate = function(raw) {
        if (!raw) {
            return;
        }
        var s = raw.toString().trim();
        if (isNaN(s))
            return null;
        excelTime = parseFloat(s);
        // Adjust excelTime overflow
        if (excelTime > DataConvertUtil._WRONG_DATE_IN_EXCEL_FORMAT)
            excelTime = excelTime - 1;

        var excelBaseMS = DataConvertUtil._EXCEL_BASE_TIME - DataConvertUtil._DAY_IN_MILLISECONDS;
        var dateMSUTC = excelBaseMS + excelTime * DataConvertUtil._DAY_IN_MILLISECONDS;

        var date = new Date();
        date.setTime(dateMSUTC + DataConvertUtil._getTimezoneOffsetMS());
        return date;
    };
    // Date.UTC(1900, 0);
    DataConvertUtil._EXCEL_BASE_TIME = -2208988800000;
    // February 29th 1900, There is no "February 29" in 1900, wrong set in Excel Date
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
			r : parseInt(result[1], 16),
			g : parseInt(result[2], 16),
			b : parseInt(result[3], 16)
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
    Stopwatch.prototype.lap = function() {
        var laps = this._laps;
        laps.push(new Date().getTime());
        if (laps.length > 1) {
            return laps[laps.length - 1] - laps[laps.length - 2];
        } else {
            return laps[0] - this._s;
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
		this._sumTimes100 = 0;
		this._count = 0;
	};
	andrea.blink.extend(Avg, grace.calculator.supportClasses.ICalculator);

	Avg.prototype.addFactor = function(value) {
		if (!isNaN(value)) {
			this._sumTimes100 += Math.round(value * 100);
		}
		this._count++;
	};
	Avg.prototype.calculate = function() {
		return Math.round(this._sumTimes100 / this._count) / 100;
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
(function($) {
	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.managers.PopUpManager");

	var PopUpManager = grace.managers.PopUpManager;

	PopUpManager.createPopUp = function(popUp) {
		var $popUp = $(popUp.dom())
		$popUp.appendTo($("body"));
		return popUp;
	}
	PopUpManager.removePopUp = function(popUp) {
		var $popUp = $(popUp.dom())
		$popUp.detach();
	}
})(jQuery);
(function($) {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.models.vo.Analysis");

    var ShelfType = grace.constants.ShelfType;
    var DataConvertUtil = grace.utils.DataConvertUtil;

    var Analysis = grace.models.vo.Analysis = function() {
        this.id = _.uniqueId("analysisID_");
        this.index = null;
        this.name = null;

        this.dataType = null;

        this.analysisType = null;
        // For dimension
        this.numUniqueValue/*Number*/ = null;
        // For dimension, DATE
        this.dateSpan/*Number*/ = null;
    };
})(jQuery);
(function($) {
    var grace = andrea.grace;

    var DataType = grace.constants.DataType;
    var AnalysisType = grace.constants.AnalysisType;
    var OperationClassification = grace.operation.OperationClassification;

    andrea.blink.declare("andrea.grace.models.vo.ShelvedAnalysis");
    var ShelvedAnalysis = grace.models.vo.ShelvedAnalysis = function(id, source) {
        this.id = id;
        this.source/*Analysis*/ = source;

        this.operationGroup = null;

        this.visualized = false;
        this.numPartialVisualized = 0;
    };
    ShelvedAnalysis.prototype.isDateSeries = function() {
        return this.source.dataType === DataType.DATE && this.operationGroup.hasClassification(OperationClassification.DRILL)
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
})(jQuery);
(function($) {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.models.DataProvider");

    /**
     *
     */
    var DataProvider = grace.models.DataProvider = function(values2d) {
        this._values2d/*Array.<Array.<*>>*/ = values2d;
        this.numRows = 0;
        this.numColumns = 0;
        this._columnBasedValues2d/*Array.<Array.<*>>*/ = null;
        this._columnBasedUniqueValues2d/*Array.<Array.<*>>*/ = null;

        this._build();
    };
    andrea.blink.extend(DataProvider, andrea.blink.mvc.Model);

    DataProvider.prototype.getRow = function(index) {
        return this._values2d[index];
    };

    DataProvider.prototype._build = function() {
        var i, j;
        var values;

        var cbUVMapping = [];

        this._columnBasedValues2d = [];
        this._columnBasedUniqueValues2d = [];

        this.numRows = this._values2d.length;
        this.numColumns = this._values2d[0].length;

        values = this.getRow(0);
        for ( j = 0; j < values.length; j++) {
            this._columnBasedValues2d[j] = [];
            this._columnBasedUniqueValues2d[j] = [];
            cbUVMapping[j] = [];
        }
        for ( i = 0; i < this.numRows; i++) {
            values = this.getRow(i);
            for ( j = 0; j < values.length; j++) {
                var v = values[j];
                this._columnBasedValues2d[j].push(v);
                if (!cbUVMapping[j][v]) {
                    cbUVMapping[j][v] = true;
                    this._columnBasedUniqueValues2d[j].push(v);
                }
            }
        }
    };
    DataProvider.prototype.getCValues = function(columnIndex) {
        return _.clone(this._columnBasedValues2d[columnIndex]);
    };
    DataProvider.prototype.getCUniqueValues = function(columnIndex) {
        // TODO Work with drill/group operation
        return _.clone(this._columnBasedUniqueValues2d[columnIndex]);
    };
    DataProvider.prototype.getCUniqueValuesBySA = function(sa) {
        return this.getCUniqueValues(sa.source.index);
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

        this.raw/*Object*/ = null;
        this.analyses/*Array.<Analysis>*/ = null;
        this.dataProvider = null;

        this._analysisDimesions/*Array.<ShelvedAnalysis>*/ = [];
        this._analysisDatas/*Array.<ShelvedAnalysis>*/ = [];

        this._vizType = VizType.RECOMMEND;
    };
    andrea.blink.extend(DataDiscoveryModel, andrea.blink.mvc.Model);

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

        this._analysisDimesions = [];
        this._analysisDatas = [];

        this._notify(AppConst.NOTIFICATION_DATA_PROVIDER_CHANGED);
    }    /**
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
     */    DataDiscoveryModel.prototype.getAnalyses = function(ids) {
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
        var sa = this._get(id, this._analysisDimesions);
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
    var DataType = grace.constants.DataType;
    var AnalysisType = andrea.grace.constants.AnalysisType;
    var AppConst = andrea.grace.constants.AppConst;
    var Analysis = grace.models.vo.Analysis;
    var DataProvider = grace.models.DataProvider;
    var DataConvertUtil = grace.utils.DataConvertUtil;
    var Stopwatch = grace.utils.Stopwatch;

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

        var watch = new Stopwatch('ChangeDataProviderAction, ' + numRows + '*' + numColumns, true);
        // Parse columnDescriptors
        var analyses = [];
        for ( j = 0; j < numColumns; j++) {
            var a/*Analysis*/ = new Analysis();
            a.index = j;
            var c = columnDescriptors[j];
            a.name = c.name;
            a.analysisType = c.analysisType;
            analyses[j] = a;
        }
        // Parse rows
        var values2d = [];
        var values = null;
        var value = null;
        var dataTypeCandidates = [];
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

                converter = dataTypeCandidates[j];
                if (!converter) {
                    dataTypeCandidates[j] = converter = {
                        'numByType' : {
                        }
                    };
                    converter.       numByType[ConverterType.ANY] = 0;

                }

                // Convert raw to value
                var type = analyses[j].converterType;
                if (type) {
                    // Explicit data type, eg: data from server / excel
                    if (!converter.fn) {
                        converter.fn = DataConvertUtil.getConverter(type);
                    }
                    value = converter.fn.call(null, cell);
                } else {
                    // Non-explicit data type, eg: data from csv, excel
                    var tryExcelDate = fromExcel;
                    if (converter.numByType && converter.numByType[ConverterType.NUMBER] && converter.numByType[ConverterType.NUMBER] > 3) {
                        tryExcelDate = false;
                    }
                    var match = DataConvertUtil.match(cell, tryExcelDate);
                    type = match.type;
                    value = match.value;

                    if (!converter.numByType[type]) {
                        converter.numByType[type] = 0;
                    }
                    converter.numByType[type]++;                }
                values2d[i][j] = value;
            }
        }
        console.log('[' + watch.type + '] parse: ' + watch.lap());

        // Rinse
        for ( j = 0; j < numColumns; j++) {
            a = analyses[j];
            if (!a.name) {
                a.name = "列" + (j + 1);
            }
            // Set dataType
            if (!a.dataType) {
                var allMatching = false;
                var allValidMatching = false;
                var majorConvertType = null;
                converter = dataTypeCandidates[j];
                if (converter.numByType) {
                    for (type in converter.numByType) {
                        var numOfType = converter.numByType[type];
                        var numOfAny = converter.numByType[ConverterType.ANY];
                        if (type === ConverterType.ANY) {
                            continue;
                        }
                        if (numOfType / (numRows - numOfAny) > .5) {
                            if (type === ConverterType.EXCEL_DATE || type === ConverterType.DATE) {
                                a.dataType = DataType.DATE;
                            } else if (type === ConverterType.NUMBER) {
                                a.dataType = DataType.NUMBER;
                            } else if (type === ConverterType.STRING) {
                                a.dataType = DataType.STRING;
                            }
                            if (numOfType / numRows === 1) {
                                allMatching = true;
                            } else {
                                majorConvertType = type;
                                if ((numOfType + numOfAny) / numRows === 1) {
                                    allValidMatching = true;
                                }
                            }
                            break;
                        }
                    }
                }
                if (!a.dataType) {
                    a.dataType = DataType.STRING;
                }
                if (!allMatching) {
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
            // Set analysisType
            if (!a.analysisType) {
                if (a.dataType === DataType.NUMBER) {
                    a.analysisType = AnalysisType.MEASURE;
                } else {
                    a.analysisType = AnalysisType.DIMENSION;
                }
            }
        }
        console.log('[' + watch.type + '] rinse: ' + watch.lap());

        // Set data provider and additional info in analysis
        var dp = new DataProvider(values2d);
        for ( j = 0; j < numColumns; j++) {
            a = analyses[j];

            var cuv = dp.getCUniqueValues(j);
            a.numUniqueValue = cuv.length;
            if (a.dataType === DataType.DATE) {
                var cuv = _.without(cuv, null);
                var dates = _.sortBy(cuv, function(d) {
                    return d.getTime();
                });
                var from = dates[0];
                var to = dates[dates.length - 1];
                a.dateSpan = to.getTime() - from.getTime();
            }
        }

        var model = this._getModel(AppConst.MODEL_GRACE);
        model.setDataProvider(raw, analyses, dp);
        console.log('[' + watch.type + '] setDataProvider: ' + watch.lap());
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

        if (ACT.des(parameters.shelfType) && parameters.shelvedContexts) {
            // Analysis shelf change
            var shelfType = parameters.shelfType;
            var shelvedContexts = parameters.shelvedContexts;
            var shelvedAnalyses = [];
            for ( i = 0; i < shelvedContexts.length; i++) {
                var ctx = shelvedContexts[i];
                var sa/*ShelvedAnalysis*/ = model.getShelvedAnalysis(ctx.shelvedAnalysisID);
                if (!sa) {
                    sa = new ShelvedAnalysis(ctx.shelvedAnalysisID, model.getAnalysis(ctx.analysisID));
                }
                sa.operationGroup = ctx.operationGroup;

                shelvedAnalyses.push(sa);
            }

            if (shelfType === ACT.DES_DIM) {
                if (!_.isEqual(shelvedAnalyses, model.analysisDimesions())) {
                    model.analysisDimesions(shelvedAnalyses);
                }
            } else if (shelfType === ACT.DES_VALUE) {
                if (!_.isEqual(shelvedAnalyses, model.analysisDatas())) {
                    model.analysisDatas(shelvedAnalyses);
                }
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

        this._classVisible = null;
    };
    andrea.blink.extend(PopUpBase, andrea.blink.mvc.View);

    PopUpBase.prototype.open = function($dock) {
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
        PopUpManager.createPopUp(this);

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
(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.views.popUp.MenuEvent");

	var MenuEvent = grace.views.popUp.MenuEvent = function(type, target, data) {
		MenuEvent.superclass.constructor.apply(this, arguments);

	};
	andrea.blink.extend(MenuEvent, andrea.blink.events.Event);

	MenuEvent.ITEM_SELECTED = "itemSelected";
})();
(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.views.popUp.OperationMenu');
    var MenuEvent = grace.views.popUp.MenuEvent;

    var OperationMenu = grace.views.popUp.OperationMenu = function(dom) {
        OperationMenu.superclass.constructor.apply(this, arguments);

        this._classVisible = 'grace-menu-visible';

        this._operationGroups = null;
    };
    andrea.blink.extend(OperationMenu, grace.views.popUp.PopUpBase);

    OperationMenu.create = function(operationGroups) {
        var menu = new OperationMenu($('<div/>'));
        var $dom = menu.dom();
        $dom.addClass('grace-menu');
        menu._createChildren(operationGroups);

        return menu;    }
    OperationMenu.prototype.open = function($dock) {
        OperationMenu.superclass.open.apply(this, arguments)

        var _this = this;

        var $dom = $(this._dom);
        // Event lisenter
        var inside = true;
        var closeOutside = function() {
            // 100ms for move to submenu
            setTimeout(function() {
                if (!inside) {
                    _this.close();
                }
            }, 240)
        }
        var hoverIn = function() {
            inside = true;
        };
        var hoverOut = function() {
            inside = false;
            closeOutside();
        };
        $dock.hover(hoverIn, hoverOut);
        $(this._dom).hover(hoverIn, hoverOut);
    }
    /**
     *
     * @param {Array} value [{
     * 	text: xxx,
     * 	callback: function() {}
     * }]
     */
    OperationMenu.prototype._createChildren = function(operationGroups) {
        this._operationGroups = operationGroups;

        this._createMenu(this._operationGroups, $(this._dom))    }
    OperationMenu.prototype._createMenu = function(operationGroups, $dom) {
        var _this = this;

        var clickHandler = function(event) {
            $li = $(event.currentTarget);
            _this.dispatchEvent(new MenuEvent(MenuEvent.ITEM_SELECTED, _this, {
                'operation' : $li.data('__operation')
            }));
            _this.close();
        }
        var $ul = $('<ul/>').appendTo($dom);

        var i, j;
        var o;
        var operations;
        // Flattern style
        for ( i = 0; i < operationGroups.length; i++) {
            operations = operationGroups[i].operations();
            if (i !== 0) {
                $('<div/>').appendTo($ul);
            }
            for ( j = 0; j < operations.length; j++) {
                var $li = $('<li/>').appendTo($ul);
                var $a = $('<a/>').appendTo($li);
                o = operations[j];
                $li.data({
                    '__operation' : o
                }).click(clickHandler);
                $a.text(o.name);
            }
        }
        // Hierarchy style
        // if (operationGroups.length === 1) {
        // operations = operationGroups[0].operations();
        // for ( i = 0; i < operations.length; i++) {
        // var $li = $('<li/>').appendTo($ul);
        // var $a = $('<a/>').appendTo($li);
        // // Operation
        // o = operations[i];
        // $li.data({
        // '__operation' : o
        // }).click(clickHandler);
        // $a.text(o.name);
        // }
        // } else {
        // for ( i = 0; i < operationGroups.length; i++) {
        // var $li = $('<li/>').appendTo($ul);
        // var $a = $('<a/>').appendTo($li);
        // // Sample operation
        // operations = operationGroups[i].operations();
        //
        // o = operations[0];
        // if (operations.length === 1) {
        // $li.data({
        // '__operation' : o
        // }).click(clickHandler);
        // $a.text(o.name);
        // } else {
        // // Menu folder
        // $a.text(o.classificationName + ' \uf0da');
        // // Sub menu
        // this._createMenu([operationGroups[i]], $li);
        // }
        // }
        // }
    }
})(jQuery);
(function($) {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisContainer.supportClasses.ShelfBase");

    var DataType = grace.constants.DataType;
    var AnalysisType = andrea.grace.constants.AnalysisType;
    var ShelfEvent = grace.views.analysisContainer.events.ShelfEvent;
    var Analysis = grace.models.vo.Analysis;
    var ShelfType = grace.constants.ShelfType;
    var OperationMenu = grace.views.popUp.OperationMenu;
    var PopUpEvent = grace.views.popUp.PopUpEvent;
    var OperationFactory = grace.operation.OperationFactory;
    var MenuEvent = grace.views.popUp.MenuEvent;
    var OperationGroup = grace.operation.OperationGroup;
    var OperationClassification = grace.operation.OperationClassification;
    var OperationPriorityBaseline = grace.operation.OperationPriorityBaseline;
    var OperationType = grace.operation.OperationType;

    var ShelfBase = grace.views.analysisContainer.supportClasses.ShelfBase = function(dom) {
        ShelfBase.superclass.constructor.apply(this, arguments);

        var _this = this;
        // Place holder for card dragging
        this._$ph = $("<div/>").addClass("grace-analysis-card_placeholder");
        //
        this._operationMenu = null;
        /**
         * @protected
         */
        this._type = null;
        this._layout = null;
        this._initialization();

        this.helperGetAnalysis = null;

        $(this._dom).css({
            // "width" : 160 + "px"
        }).addClass("grace-analysis-contaier");

        var $container;
        // Title
        $container = $(this._dom);
        $container = $("<div/>").appendTo($container).addClass("grace-analysis-titleArea grace-analysis-clearfix");
        $container = $("<div/>").appendTo($container).addClass("grace-analysis-title");
        $("<h2/>").appendTo($container).addClass("grace-analysis-title-text");
        $("<a/>").appendTo($container).addClass("grace-analysis-title-icon");

        // Content Cards
        $container = $(this._dom);
        $container = $("<div/>").appendTo($container).addClass("grace-analysis-cardArea");
        var $cards = $("<div/>").appendTo($container).addClass("grace-analysis-cards fancy-scrollbar");
        if (this._layout === "horizontal") {
            $cards.addClass("grace-analysis-cards_noScroll");
        }
        $("<div/>").appendTo($container).addClass("grace-analysis-cardArea-gradientTop");
        $("<div/>").appendTo($container).addClass("grace-analysis-cardArea-gradientBottom");

        //
        $(this._dom).droppable({
            tolerance : 'pointer',
            accept : function(helper) {
                var from = helper.attr("__containerType");
                var to = _this._type;

                var a = _this.helperGetAnalysis(helper.attr("__analysisID"));

                var ACT = ShelfType;
                if (ACT.src(to)) {
                    if (to === ShelfType.SRC_MEA) {
                        if (ACT.src(from) && a.dataType === DataType.NUMBER) {
                            return true;
                        }
                    } else {
                        if (ACT.src(from)) {
                            return true
                        }
                    }
                } else if (ACT.des(to)) {
                    if (to === ShelfType.DES_DIM) {
                        if (a.analysisType === AnalysisType.DIMENSION) {
                            return true;
                        }
                    } else {
                        return true;
                    }
                } else if (ACT.proc(to)) {
                    return true;
                }
                return false;
            },
            activate : function(event) {
                var helper = $(event.currentTarget);
                var from = helper.attr("__containerType");
                var to = _this._type;

                var ACT = ShelfType;
                if (from !== to && ACT.des(to)) {
                    $(this).addClass("grace-analysis-contaier_dropAcceptable");
                }
            },
            deactivate : function(event) {
                $(this).removeClass("grace-analysis-contaier_dropAcceptable");

                _this._$ph.detach();
            },
            drop : function(event, ui) {
                var from = ui.helper.attr("__containerType");
                var to = _this._type;

                _this._$ph.detach();
                ui.helper.attr("__toContainerType", to);

                var shelvedAnalysisID = null;
                if (from === to) {
                    shelvedAnalysisID = ui.helper.attr("__shelvedAnalysisID");
                }
                _this.dispatchEvent(new ShelfEvent(ShelfEvent.HELPER_DROPPED, _this, {
                    "analysisID" : ui.helper.attr("__analysisID"),
                    "$helper" : ui.helper,
                    "from" : from,
                    "to" : to
                }))

                _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_SHELVED, _this, {
                    "shelvedContexts" : _this.getShelvedContexts()
                }));            },
            over : function(event, ui) {
                ui.helper.attr("__overContainerType", _this._type);
                _this._$ph.attr("__toIndex", "");

                var $cards = $(_this._dom).find(".grace-analysis-cards");
                _this._$ph.appendTo($cards).css({
                    "width" : ui.helper.outerWidth() + "px",
                    "height" : ui.helper.outerHeight() + "px"
                });
                if (_this._layout === "horizontal") {
                    _this._$ph.addClass("grace-analysis-card_horizontal");
                }
                ui.helper.on("event-drag", function() {
                    var bases = [];
                    var draggingIndex = -1;
                    _this._traversalCards(function(index) {
                        var $card = $(this);
                        if ($card.attr("__dragging") === "true") {
                            draggingIndex = bases.length;
                        }
                        bases.push({
                            top : $card.offset().top,
                            left : $card.offset().left
                        });
                    }, true, false)
                    var p;
                    if (_this._layout === "vertical") {
                        p = "top";
                    } else if (_this._layout === "horizontal") {
                        p = "left"
                    }
                    var draggingPosition = ui.helper.offset()[p];
                    for ( i = -1; i < bases.length; i++) {
                        var min = i < 0 ? Number.MIN_VALUE : bases[i][p];
                        var max = i === bases.length - 1 ? Number.MAX_VALUE : bases[i + 1][p];

                        if (draggingPosition > min && draggingPosition <= max) {
                            if (_this._$ph.attr("__toIndex") !== i + 1 + "") {
                                _this._$ph.detach();
                                _this._$ph.attr("__toIndex", i + 1);
                                if (draggingIndex === -1 || (draggingIndex !== i + 1 && draggingIndex !== i )) {
                                    $cards.appendAt(_this._$ph, i + 1);
                                }
                            }
                            break;
                        }
                    }
                }).removeClass("grace-analysis-card_draggingHelper_noDrop").addClass("grace-analysis-card_draggingHelper_grabbing");
            },
            out : function(event, ui) {
                var over = ui.helper.attr("__overContainerType");
                if (_this._type === over) {
                    ui.helper.off("event-drag").addClass("grace-analysis-card_draggingHelper_noDrop").removeClass("grace-analysis-card_draggingHelper_grabbing");
                }

                _this._$ph.detach();
            }
        });
    };
    andrea.blink.extend(ShelfBase, andrea.blink.mvc.View);

    ShelfBase.OPERATION_DISPLAY_SPLITTER = " | ";

    ShelfBase.prototype.getShelvedContexts = function() {
        var contexts = [];
        this._traversalCards(function(index) {
            var $this = $(this);
            var ctx = {
                "analysisID" : $this.attr("__analysisID"),
                "shelvedAnalysisID" : $this.attr("__shelvedAnalysisID"),
                "operationGroup" : new OperationGroup(JSON.parse($this.attr("__operationIDs")))
            };

            contexts.push(ctx);
        }, true, true);
        return contexts;
    }
    ShelfBase.prototype._traversalCards = function(callback, ignorePH, ignoreDragging) {
        var $cards = $(this._dom).find(".grace-analysis-cards");
        var children = $cards.children();

        var index = 0;
        for (var i = 0; i < children.length; i++) {
            var card = children[i];
            var $card = $(card);

            if (ignorePH && card === this._$ph[0]) {
                continue;
            }
            if (ignoreDragging && $card.attr("__dragging") === "true") {
                continue;
            }

            callback.call(card, index);
            index++;
        }
    }
    ShelfBase.prototype._setTitle = function(title) {
        var $h2 = $(this._dom).find("h2");
        $h2.text(title);
    }
    ShelfBase.prototype._setRequired = function(required) {
        var $h2 = $(this._dom).find("h2");
        if (required) {
            $h2.addClass("grace-analysis-title-text_required");
        } else {
            $h2.removeClass("grace-analysis-title-text_required");
        }
    }
    ShelfBase.prototype.addSuffix = function(suffix) {
        var $h2 = $(this._dom).find("h2");

        if (suffix) {
            $h2.addClass("grace-analysis-title-text_suffix").attr({
                "__suffix" : suffix
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
        var $card = this._addCardAt(a, parseInt(this._$ph.attr("__toIndex")), $helper, from !== to);
    };

    ShelfBase.prototype.addCard = function(a) {
        this._addCardAt(a);
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

        var $cards = $(this._dom).find(".grace-analysis-cards");
        var $card = $("<div/>").addClass("grace-analysis-card");
        if (this._layout === "horizontal") {
            $card.addClass("grace-analysis-card_horizontal");
        }

        $cards.appendAt($card, index);

        var shelvedAnalysisID;
        if ($helper && !newShelved) {
            shelvedAnalysisID = $helper.attr("__shelvedAnalysisID");
        } else {
            shelvedAnalysisID = _.uniqueId("shelvedAnalysisID_");
        }
        // TODO Use data replace attr
        $card.data({
            '__analysis' : a
        });
        $card.attr({
            "__analysisID" : a.id,
            "__shelvedAnalysisID" : shelvedAnalysisID,
            "__containerType" : this._type
        });

        var $text = $("<div/>").appendTo($card).addClass("grace-analysis-card-text grace-text-ellipsis").text(a.name);
        // Show title only when ellipsis is actiated
        $text.bind('mouseenter', function() {
            var $this = $(this);
            if (this.offsetWidth < this.scrollWidth && !$card.attr('title'))
                $card.attr('title', $this.text());
        });
        // Handler operation
        var $operation;
        var operationIDs;
        if ($helper && $helper.attr("__operationIDs")) {
            operationIDs = JSON.parse($helper.attr("__operationIDs"));
        }
        var info = this._getOperationInfo(a);
        var availableOGs = info.availableOGs;
        var defaultTypes = info.defaultTypes;

        if (ShelfType.des(this._type)) {
            // Add operation drop down for des
            if (availableOGs && availableOGs.length > 0) {
                $operation = $("<span/>").appendTo($card).addClass("grace-analysis-card-operation grace-analysis-card-operation_dropDown");
                $operation.hover(function(event) {
                    _this._createOperationMenu(availableOGs, a, $card, $operation);
                }, null);
            }
        } else if (ShelfType.src(this._type)) {
            // Add operation for src
            $operation = $("<span/>").appendTo($card).addClass("grace-analysis-card-operation grace-analysis-card-operation_add");
            $operation.click(function(event) {
                // var copy = function($card, pasteTo) {
                var pasteTo;
                if (_this._type === ShelfType.SRC_DIM) {
                    pasteTo = ShelfType.DES_DIM;
                } else if (_this._type === ShelfType.SRC_MEA) {
                    pasteTo = ShelfType.DES_VALUE;
                }
                _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_COPIED, _this, {
                    'analysis' : $card.data('__analysis'),
                    "pasteTo" : pasteTo
                }));
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
        if (ShelfType.dim(this._type)) {
            var suffix;
            if (a.dataType === DataType.DATE) {
                suffix = '\uf073';
            } else {
                if (a.numUniqueValue !== null) {
                    suffix = a.numUniqueValue;
                }
            }
            if (suffix) {
                $text.addClass("grace-analysis-card-text_suffix").attr({
                    "__suffix" : suffix
                });
            }
        }
        $card.addClass('grace-analysis-card_asSource');

        // Add style when card in des
        if (ShelfType.des(this._type)) {
            if (this._type === ShelfType.DES_DIM) {
                $card.addClass('grace-analysis-card_asDimension');
            } else if (this._type === ShelfType.DES_VALUE) {
                $card.addClass('grace-analysis-card_asMeasure');
            }
        }

        // Drag
        $card.draggable({
            containment : $('#divDataDiscovery'),
            helper : function(event) {
                var $clone = $(this).clone();
                $clone.width($(this).width()).addClass("grace-analysis-card_draggingHelper");
                $clone.removeClass('grace-analysis-card_asSource grace-analysis-card_asDimension grace-analysis-card_asMeasure');
                $clone.appendTo($("body"));
                return $clone;
            },
            start : function(event, ui) {
                $(this).addClass("grace-analysis-card_disabled").attr({
                    "__dragging" : "true"
                });
                ui.helper.addClass("grace-analysis-card_draggingHelper_grabbing");
            },
            stop : function(event, ui) {
                $(this).removeClass("grace-analysis-card_disabled").attr({
                    "__dragging" : "false"
                });
                ui.helper.removeClass("grace-analysis-card_draggingHelper_grabbing");

                var from = ui.helper.attr("__containerType");
                var to = ui.helper.attr("__toContainerType");

                if (to) {
                    if (ShelfType.like(from, to)) {
                        $(this).detach();
                    }
                } else {
                    if (ShelfType.des(from)) {
                        $(this).detach();
                    }
                }
                // Clear
                ui.helper.off("event-drag");
                //
                _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_SHELVED, _this, {
                    "shelvedContexts" : _this.getShelvedContexts()
                }));
            },
            drag : function(event, ui) {
                ui.helper.trigger("event-drag");
            }
        });
        //
        return $card;
    };
    ShelfBase.prototype._addOperation = function(type, $card) {
        var o = OperationFactory.produce(type, OperationPriorityBaseline.USER_SPECIFICATION);

        var og = new OperationGroup(JSON.parse($card.attr("__operationIDs")));
        og.addOperation(o.id);

        this._setOperations(og.mapIDs(), $card);
    };
    ShelfBase.prototype._setOperations = function(operationIDs, $card) {
        var $text = $card.find(".grace-analysis-card-text");

        var operationIDsStringify = JSON.stringify(operationIDs);
        if (operationIDsStringify) {
            if ($card.attr("__operationIDs") !== operationIDsStringify) {
                $card.attr({
                    "__shelvedAnalysisID" : _.uniqueId("shelvedAnalysisID_"),
                    "__operationIDs" : operationIDsStringify
                });
            }

            var og = new OperationGroup(operationIDs);
            var abbrs = og.mapAbbrs();
            abbrs = _.without(abbrs, '');
            var abbr = abbrs.join(ShelfBase.OPERATION_DISPLAY_SPLITTER);
            if (abbr) {
                $text.addClass("grace-analysis-card-text_prefix").attr({
                    "__prefix" : abbr
                });
            } else {
                $text.removeClass("grace-analysis-card-text_prefix");
            }
        } else {
            $card.removeAttr("__operationIDs");
            $text.removeClass("grace-analysis-card-text_prefix");
        }
    }
    /**
     * Should be overrided
     * @param {Object} $card
     * @param {Object} $operation
     */
    ShelfBase.prototype._createOperationMenu = function(operationGroups, a/*Analysis*/, $card, $operation) {
        if (this._operationMenu) {
            return;
        }
        var _this = this;
        // Update operation when open
        $operation.addClass("grace-analysis-card-operation_hover");
        // Update menu when open
        this._operationMenu = OperationMenu.create(operationGroups);
        this._operationMenu.addEventListener(MenuEvent.ITEM_SELECTED, function(event) {
            var operation = event.data.operation;

            if (operation.classification === OperationClassification.CARD_OPERATION) {
                var copy = function($card, pasteTo) {
                    _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_COPIED, _this, {
                        'analysis' : $card.data('__analysis'),
                        "pasteTo" : pasteTo
                    }));
                }
                if (operation.type === OperationType.CARD_REMOVE) {
                    $card.detach();
                } else if (operation.type === OperationType.CARD_ADD_TO_DIMENSION) {
                    copy($card, ShelfType.DES_DIM)
                } else if (operation.type === OperationType.CARD_ADD_TO_MEASURE) {
                    copy($card, ShelfType.DES_VALUE)
                }
            } else {
                _this._addOperation(operation.type, $card);
            }

            // Dispatch CARD_SHELVED to notify visualization update
            _this.dispatchEvent(new ShelfEvent(ShelfEvent.CARD_SHELVED, _this));
        });

        this._operationMenu.addEventListener(PopUpEvent.POPUP_CLOSED, function(event) {
            // Update operation when close
            $operation.removeClass("grace-analysis-card-operation_hover");
            // Update operation when close
            _this._operationMenu.removeAllEventListeners();
            _this._operationMenu = null;
        }, this);
        this._operationMenu.open($operation);
    }
    ShelfBase.prototype.updateShelvedAnalyses = function(getSA) {
        var _this = this;
        var numVisualized = 0;
        // Count number visualized
        this._traversalCards(function(index) {
            var $card = $(this);
            var sa = getSA($card.attr("__shelvedAnalysisID"));
            if (sa && sa.visualized) {
                numVisualized++;
            }
        }, true, true);

        // Update style
        this._traversalCards(function(index) {
            var $card = $(this);
            var sa = getSA($card.attr("__shelvedAnalysisID"));
            // Grey out
            if (sa) {
                if (numVisualized > 0 && !sa.visualized) {
                    $card.addClass("grace-analysis-card_disabled");
                } else {
                    $card.removeClass("grace-analysis-card_disabled");
                }
                // Operation
                _this._setOperations(sa.operationGroup.mapIDs(), $card);
            }
        }, true, true);
    }

    ShelfBase.prototype.removeAll = function() {
        var $cards = $(this._dom).find(".grace-analysis-cards");
        $cards.empty();
    }
    ShelfBase.prototype._validateSize = function() {
        var size = this.size();

        var h = size.height - 36;
        var $cards = $(this._dom).find(".grace-analysis-cards");
        $cards.css({
            "max-height" : h + "px",
            "height" : h + "px"
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

		var model = this._getModel(AppConst.MODEL_GRACE);
		for (var i = 0; i < model.analyses.length; i++) {
			var a = model.analyses[i];
			if (a.analysisType === AnalysisType.DIMENSION) {
				this._view.addCard(a);
			}
		}

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

		var model = this._getModel(AppConst.MODEL_GRACE);

		this._view.addSuffix(model.dataProvider.numRows);

		for (var i = 0; i < model.analyses.length; i++) {
			var a = model.analyses[i];
			if (a.analysisType === AnalysisType.MEASURE) {
				this._view.addCard(a);
			}
		}

	}
})(jQuery);
(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisContainer.destination.DesDimensionShelf");

    var AnalysisType = grace.constants.AnalysisType;
    var DataType = grace.constants.DataType;
    var ShelfType = grace.constants.ShelfType;
    var OperationClassification = grace.operation.OperationClassification;
    var OperationType = grace.operation.OperationType;
    var OperationGroup = grace.operation.OperationGroup;

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

        if (a.dataType === DataType.DATE) {
            availableOGs = DesDimensionShelf.OGS_DATE;
            defaultTypes = [OperationType.SORT_ASCEND];
            if (a.dateSpan < 86400000 * (365 / 2 + 1)) {
                defaultTypes.push(OperationType.DRILL_DATE);
            } else if (a.dateSpan < 86400000 * (365 * 1)) {
                defaultTypes.push(OperationType.DRILL_WEEK);
            } else if (a.dateSpan < 86400000 * (365 * 5)) {
                defaultTypes.push(OperationType.DRILL_MONTH);
            } else {
                defaultTypes.push(OperationType.DRILL_YEAR);
            }
        } else {
            availableOGs = DesDimensionShelf.OGS_DEFAULT;
            defaultTypes = [OperationType.SORT_NONE];
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
        availableOGs.push(OperationGroup.createByClassification(OperationClassification.SORT, [OperationType.SORT_NONE]));
        availableOGs.push(OperationGroup.createByClassification(OperationClassification.DRILL));
        availableOGs.push(OperationGroup.createByClassification(OperationClassification.GROUP));
        availableOGs.push(OperationGroup.createByTypes([OperationType.CARD_REMOVE]));
        DesDimensionShelf.OGS_DATE = availableOGs;
        // OGS_DEFAULT
        availableOGs = [];
        availableOGs.push(OperationGroup.createByClassification(OperationClassification.SORT));
        availableOGs.push(OperationGroup.createByTypes([OperationType.CARD_REMOVE]));
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
            defaultTypes = [OperationType.CALC_UNIQ_COUNT];
        } else if (a.analysisType === AnalysisType.MEASURE) {
            availableOGs = DesMeasureShelf.OGS_MEASURE;
            defaultTypes = [OperationType.CALC_SUM];
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
        availableOGs.push(OperationGroup.createByTypes([OperationType.CALC_UNIQ_COUNT, OperationType.CALC_COUNT]));
        availableOGs.push(OperationGroup.createByClassification(OperationClassification.SORT));
        availableOGs.push(OperationGroup.createByTypes([OperationType.CARD_REMOVE]));
        DesMeasureShelf.OGS_DIMENSION = availableOGs;
        // OGS_MEASURE
        availableOGs = [];
        availableOGs.push(OperationGroup.createByTypes([OperationType.CALC_SUM, OperationType.CALC_AVG, OperationType.CALC_MAX, OperationType.CALC_MIN]));
        availableOGs.push(OperationGroup.createByClassification(OperationClassification.SORT));
        availableOGs.push(OperationGroup.createByTypes([OperationType.CARD_REMOVE]));
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

		this._setTitle("过滤器");
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

        if (type === VizType.BUBBLE) {
            return new highCharts.Scatter(dom, 'bubble', type);
        } else if (type === VizType.SCATTER) {
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
     * @param {Object} dimesions
     * @param {Object} datas
     *
     */
    VizBase.prototype.render = function(dataProvider, dimesions, datas) {
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

    andrea.blink.declare("andrea.grace.views.analysisResult.viz.placeHolder.VizPH");
    var VizPH = grace.views.analysisResult.viz.placeHolder.VizPH = function(dom, selectedVizType) {
        VizPH.superclass.constructor.apply(this, arguments);

        this._selectedVizType = selectedVizType;
    };
    andrea.blink.extend(VizPH, grace.views.analysisResult.viz.VizBase);

    VizPH.prototype.render = function(dataProvider, dimesions, datas) {
        VizPH.superclass.render.apply(this, arguments);

        var $hint = $('<div/>').appendTo(this._$dom).addClass('grace-result-viz-placeHolder-hint');
        var $line1 = $('<span/>').appendTo($hint);
        $('<br/>').appendTo($hint);
        $('<br/>').appendTo($hint);
        var $line2 = $('<span/>').appendTo($hint);

        if (this._selectedVizType === VizType.RECOMMEND) {
            $line2.text('从纬度、指标开始发现之旅！');
        } else {
            $line1.text('未完成的图形');
            var manifest = VizType.manifest(this._selectedVizType);
            var required = manifest.required;
            var text = manifest.title + ' 需要至少';
            if (required.numDimensions > 0) {
                text = text + required.numDimensions + '个分析纬度，';
            }
            if (required.numMeasures > 0) {
                text = text + required.numMeasures + '个分析指标。';
            }
            $line2.text(text);
        }
        $hint.css({
            'left' : (this._$dom.width() - $hint.width()) / 2 + 'px',
            'top' : (this._$dom.height() - $hint.height()) / 2 + 'px'
        });
    };
})(jQuery);
(function() {
	var grace = andrea.grace;

	andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.supportClasses.ValueToName");
	var ValueToName = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.ValueToName;

	ValueToName.string = function(value) {
		return value;
	};
	ValueToName.number = function(value) {
		return value;
	};
	ValueToName.dateDrillYear = function(value) {
		return value.format('yyyy');
	};
	ValueToName.dateDrillMonth = function(value) {
		return value.format('yyyy/M');
	};
	ValueToName.dateDrillWeek = function(value) {
		var from = value.getMonsday();
		var to = new Date();
		to.setTime(from.getTime() + 7 * 24 * 3600 * 1000);
		return from.format('yyyy/M/d') + '-' + to.format('M/d');
	};
	ValueToName.dateDrillDate = function(value) {
		return value.format('yyyy/M/d');
	};
	ValueToName.dateGroupMonth = function(value) {
		return Date.monthNames[value.getMonth()];
	};
	ValueToName.dateGroupDate = function(value) {
		return Date.dateNames[value.getDate() - 1];
	};
	ValueToName.dateGroupDay = function(value) {
		return Date.dayNames[value.getDay()];
	};
	ValueToName.dateGroupHour = function(value) {
		return Date.hourNames[value.getHours()];
	};
})();
(function() {
    var grace = andrea.grace;

    var DataType = grace.constants.DataType;
    var OperationType = grace.operation.OperationType;
    var ValueToName = grace.views.analysisResult.viz.highCharts.supportClasses.ValueToName;

    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.supportClasses.ValueQuery");
    var ValueQuery = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.ValueQuery = function(dataProvider, shelvedAnalysis) {
        this._dataProvider = dataProvider;
        this._sa = shelvedAnalysis;
        this._a = this._sa.source;

        this._names = null;
        this._valueToName = null;

        this._initialize();
    };
    ValueQuery.NULL_NAME = '-';
    ValueQuery.prototype._initialize = function() {
        var source = this._dataProvider.getCUniqueValues(this._a.index);

        if (this._a.dataType === DataType.STRING) {
            this._valueToName = ValueToName.string;
            this._names = this._generateNames(source);
        } else if (this._a.dataType === DataType.NUMBER) {
            this._valueToName = ValueToName.number;
            this._names = this._generateNames(source);
        } else if (this._a.dataType === DataType.DATE) {
            // Drill
            if (this._sa.operationGroup.has(OperationType.DRILL_YEAR)) {
                this._valueToName = ValueToName.dateDrillYear;
                this._names = this._generateDateDrillNames(source, function(transition, to) {
                    return transition.getFullYear() < to.getFullYear();
                }, function(transition) {
                    transition.setFullYear(transition.getFullYear() + 1);
                });
            } else if (this._sa.operationGroup.has(OperationType.DRILL_MONTH)) {
                this._valueToName = ValueToName.dateDrillMonth;
                this._names = this._generateDateDrillNames(source, function(transition, to) {
                    return transition.getFullYear() * 12 + transition.getMonth() < to.getFullYear() * 12 + to.getMonth();
                }, function(transition) {
                    transition.setMonth(transition.getMonth() + 1);
                });
            } else if (this._sa.operationGroup.has(OperationType.DRILL_WEEK)) {
                this._valueToName = ValueToName.dateDrillWeek;
                this._names = this._generateDateDrillNames(source, function(transition, to) {
                    return Math.floor(transition.getMonsday().getTime() / 7 / 24 / 3600 / 1000) < Math.floor(to.getMonsday().getTime() / 7 / 24 / 3600 / 1000)
                }, function(transition) {
                    transition.setDate(transition.getDate() + 7);
                });
            } else if (this._sa.operationGroup.has(OperationType.DRILL_DATE)) {
                this._valueToName = ValueToName.dateDrillDate;
                this._names = this._generateDateDrillNames(source, function(transition, to) {
                    return Math.floor(transition.getTime() / 24 / 3600 / 1000) < Math.floor(to.getTime() / 24 / 3600 / 1000)
                }, function(transition) {
                    transition.setDate(transition.getDate() + 1);
                });
            }
            // Group
            else if (this._sa.operationGroup.has(OperationType.GROUP_MONTH)) {
                this._valueToName = ValueToName.dateGroupMonth;
                this._names = this._generateSortedNames(source, _.clone(Date.monthNames));
            } else if (this._sa.operationGroup.has(OperationType.GROUP_DATE)) {
                this._valueToName = ValueToName.dateGroupDate;
                this._names = this._generateSortedNames(source, _.clone(Date.dateNames));
            } else if (this._sa.operationGroup.has(OperationType.GROUP_DAY)) {
                this._valueToName = ValueToName.dateGroupDay;
                this._names = this._generateSortedNames(source, _.clone(Date.dayNames));
            } else if (this._sa.operationGroup.has(OperationType.GROUP_HOUR)) {
                this._valueToName = ValueToName.dateGroupHour;
                this._names = this._generateSortedNames(source, _.clone(Date.hourNames));
            }
        }
    }

    ValueQuery.prototype._generateNames = function(source) {
        var sourceWithoutNull = _.without(source, null);
        var hasNull = source.length !== sourceWithoutNull.length;
        // TODO Performance optimize
        if (this._sa.operationGroup.has(OperationType.SORT_ASCEND)) {
            sourceWithoutNull.sort();
        } else if (this._sa.operationGroup.has(OperationType.SORT_DESCEND)) {
            sourceWithoutNull.sort();
            sourceWithoutNull.reverse();
        }

        var names = sourceWithoutNull;
        if (hasNull) {
            names.push(this.valueToName(null));
        }
        return names;
    };
    ValueQuery.prototype._generateDateDrillNames = function(source, loopCondition, loopAfterThought) {
        var sourceWithoutNull = _.without(source, null);
        var hasNull = source.length !== sourceWithoutNull.length;

        var dates = _.sortBy(sourceWithoutNull, function(d) {
            return d.getTime();
        });
        // TODO Refactor it, add these info to model, do not calc every time
        var from = dates[0];
        var to = dates[dates.length - 1];

        var transition = new Date();
        transition.setTime(from.getTime());

        var names = [];
        while (true) {
            names.push(this.valueToName(transition));

            if (!loopCondition(transition, to)) {
                break;
            }
            loopAfterThought(transition);
        }

        return this._generateSortedNames(source, names);
    };
    ValueQuery.prototype._generateSortedNames = function(source, names) {
        var sourceWithoutNull = _.without(source, null);
        var hasNull = source.length !== sourceWithoutNull.length;

        if (this._sa.operationGroup.has(OperationType.SORT_DESCEND)) {
            names.reverse();
        }
        if (hasNull) {
            names.push(this.valueToName(null));
        }
        return names;
    };
    ValueQuery.prototype.queryIndex = function(rValues) {
        var value = rValues[this._a.index];
        var name = this.valueToName(value);
        // TODO Performance optimize
        var index = this._names.indexOf(name);

        if (index === -1) {
            throw new Error("Can't find index!");
        }
        return index;
    };
    ValueQuery.prototype.names = function() {
        return this._names;
    };
    ValueQuery.prototype.valueToName = function(value) {
        if (value) {
            return this._valueToName.call(null, value);
        } else {
            return ValueQuery.NULL_NAME;
        }
    }
})();
(function() {
    var grace = andrea.grace;

    var ColorUtil = grace.utils.ColorUtil;
    var DataType = grace.constants.DataType;
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
    HighChartsOption.dataConfig = function(dataProvider, seriesSA, categorySA, dataSAs, isSeriesByDatas) {
        var i, d;
        var og/*OperationGroup*/;
        // Series, category, data index/length
        var si, ci, di;
        var sl, cl, dl;
        // ValueQuery for series, category
        var sq, cq;
        // For data sort
        var sortByData;
        // function(values, indexDataSA)
        var getSeriesIndex;
        // function(values)
        var getCategoryIndex;

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
                getSeriesIndex = function(values, indexDataSA) {
                    return indexDataSA;
                }
                sl = dataSAs.length;
                dl = 1;
            } else {
                getSeriesIndex = function(values, indexDataSA) {
                    return 0;
                }
                sl = 1;
                dl = dataSAs.length;
            }
        } else {
            sq = new ValueQuery(dataProvider, seriesSA);
            getSeriesIndex = function(values, indexDataSA) {
                return sq.queryIndex(values);
            }
            sl = sq.names().length;
            dl = dataSAs.length;
        }
        // Category
        if (!categorySA) {
            getCategoryIndex = function(values) {
                return 0;
            }
            cl = 1;
        } else {
            cq = new ValueQuery(dataProvider, categorySA);
            getCategoryIndex = function(values) {
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
            var values = dataProvider.getRow(i);

            for ( d = 0; d < dataSAs.length; d++) {
                si = getSeriesIndex(values, d);
                ci = getCategoryIndex(values);
                di = isSeriesByDatas ? 0 : d;

                highSeries[si].data[ci].data[di].addFactor(values[dataSAs[d].source.index]);
            }
        }
        // Calculate
        for ( si = 0; si < sl; si++) {
            for ( ci = 0; ci < cl; ci++) {
                for ( di = 0; di < dl; di++) {
                    highSeries[si].data[ci].data[di] = highSeries[si].data[ci].data[di].calculate();
                }
            }
        }

        // Set config
        var config = {};
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
        // Set visualized
        HighChartsOption._setVisualized(seriesSA);
        HighChartsOption._setVisualized(categorySA);
        HighChartsOption._setVisualized(dataSAs);

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

    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.Pie");

    var HighChartsOption = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption;
    var CalculatorFactory = grace.calculator.supportClasses.CalculatorFactory;

    var Pie = grace.views.analysisResult.viz.highCharts.Pie = function(dom) {
        Pie.superclass.constructor.apply(this, arguments);

        var _this = this;
    };
    andrea.blink.extend(Pie, grace.views.analysisResult.viz.VizBase);

    Pie.prototype.render = function(dataProvider, dimesions, datas) {
        Pie.superclass.render.apply(this, arguments);

        var highConfig = HighChartsOption.genMain('pie');

        var dataConfig = HighChartsOption.dataConfig(dataProvider, null, dimesions[0], datas.slice(0, 1));
        highConfig.xAxis = {
            "title" : {
                "text" : dimesions[0].source.name
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
                $(_this._dom).highcharts(highConfig);
                this._removeMessages();
            }, 300);
        } else {
            $(this._dom).highcharts(highConfig);
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
    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.BasicXY");
    var BasicXY = grace.views.analysisResult.viz.highCharts.BasicXY = function(dom, chartType, vizType) {
        BasicXY.superclass.constructor.apply(this, arguments);

        this._chartType = chartType;
        this._vizType = vizType;
    };
    andrea.blink.extend(BasicXY, grace.views.analysisResult.viz.VizBase);

    BasicXY.prototype.render = function(dataProvider, dimesions, datas) {
        BasicXY.superclass.render.apply(this, arguments);

        var highConfig = HighChartsOption.genMain(this._chartType);        var dataConfig;
        var dataSAs;
        if (dimesions.length > 1) {
            dataSAs = datas.slice(0, 1);
            dataConfig = HighChartsOption.dataConfig(dataProvider, dimesions[1], dimesions[0], dataSAs);        } else {
            dataSAs = datas;
            dataConfig = HighChartsOption.dataConfig(dataProvider, null, dimesions[0], dataSAs, true);
        }
        highConfig.xAxis = {};
        if (dimesions && dimesions[0]) {
            highConfig.xAxis.title = {
                "text" : HighChartsOption.saToDisplayAbbr(dimesions[0])
            }
        } else {
            highConfig.xAxis.title = {
                "text" : null
            }
        }
        if (dataConfig.categories) {
            highConfig.xAxis.categories = dataConfig.categories;
            highConfig.xAxis.labels = {
                "rotation" : -45,
                "align" : 'right'
            }
        } else {
            highConfig.xAxis.categories = [""];
        }
        var genYAxis = function(title) {
            return {
                "title" : {
                    "text" : title
                },
                'min' : 0
            }
        }
        if (dataSAs.length === 1) {
            highConfig.yAxis = genYAxis(HighChartsOption.saToDisplay(datas[0]));
            // }
            // // TODO Move data to secodary axis
            // else if (dataSAs.length === 2) {
            // highConfig.yAxis = [genYAxis(datas[0]), genYAxis(datas[1])];
            // highConfig.yAxis[1].opposite = true;
        } else {
            highConfig.yAxis = genYAxis(null);
        }

        // Edit the common data config
        for (var i = 0; i < dataConfig.series.length; i++) {
            var categories = dataConfig.series[i].data;
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
            shared : true,
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
                    "rotation" : 0,
                    "align" : 'center'
                }
            } else if (this._vizType === VizType.STACKED_BAR || this._vizType === VizType.STACKED_COLUMN) {
                highConfig.plotOptions = {
                    "series" : {
                        "stacking" : 'normal'
                    }
                }
            }
        }

        var sl = highConfig.series.length;
        var cl = highConfig.series[0].data.length;
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
            minSize = cl * 16;
        } else if (this._vizType === VizType.LINE || this._vizType === VizType.AREA) {
            minSize = sl * cl * 8;
        }

        if (minSize > this._$dom[sizeProp]()) {
            this._$dom[sizeProp](minSize);
        }
        //
        $(this._dom).highcharts(highConfig);
    }
})(jQuery);
(function($) {
    var grace = andrea.grace;

    var HighChartsOption = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption;
    var VizType = grace.constants.VizType;

    /**
     * chartType: column, bar, line, area
     * vizType
     */
    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.Scatter");
    var Scatter = grace.views.analysisResult.viz.highCharts.Scatter = function(dom, chartType, vizType) {
        Scatter.superclass.constructor.apply(this, arguments);

        this._chartType = chartType;
        this._vizType = vizType;
    };
    andrea.blink.extend(Scatter, grace.views.analysisResult.viz.VizBase);

    Scatter.prototype.render = function(dataProvider, dimesions, datas) {
        Scatter.superclass.render.apply(this, arguments);

        var i, j;
        var highConfig = HighChartsOption.genMain(this._chartType);
        var dataSAs;
        if (this._vizType === VizType.SCATTER) {
            dataSAs = datas.slice(0, 2);
        } else if (this._vizType === VizType.BUBBLE) {
            dataSAs = datas.slice(0, 3);
        }
        var dataConfig;
        if (dimesions.length === 1) {
            dataConfig = HighChartsOption.dataConfig(dataProvider, null, dimesions[0], dataSAs);
        } else {
            dataConfig = HighChartsOption.dataConfig(dataProvider, dimesions[0], dimesions[1], dataSAs);
        }
        highConfig.xAxis = {
            "title" : {
                "text" : HighChartsOption.saToDisplay(datas[0])
            },
            'startOnTick' : true,
            'endOnTick' : true
        };
        highConfig.yAxis = {};
        if (datas.length > 1) {
            highConfig.yAxis.title = {
                "text" : HighChartsOption.saToDisplay(datas[1])
            }
        }
        var pointFormat;
        var array = [];
        if (dimesions.length === 1) {
            array.push('<b>' + HighChartsOption.saToDisplayAbbr(dimesions[0]) + ': </b>{point.name}');
        } else if (dimesions.length === 2) {
            array.push('<b>' + HighChartsOption.saToDisplayAbbr(dimesions[0]) + ': </b>{series.name}');
            array.push('<b>' + HighChartsOption.saToDisplayAbbr(dimesions[1]) + ': </b>{point.name}');
        }
        array.push('    ' + HighChartsOption.saToDisplayAbbr(datas[0]) + ': {point.x}');
        if (datas.length > 1) {
            array.push('    ' + HighChartsOption.saToDisplayAbbr(datas[1]) + ': {point.y}');
        }
        if (datas.length > 2) {
            array.push('    ' + HighChartsOption.saToDisplayAbbr(datas[2]) + ': {point.z}');
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
        for ( i = 0; i < dataConfig.series.length; i++) {
            var s = dataConfig.series[i];
            var categories = s.data;
            highSeriesData = [];
            for ( j = 0; j < categories.length; j++) {
                var c = categories[j]
                var d = c.data;
                highPoint = {
                    'name' : c.name,
                    'x' : d[0],
                    'y' : d[1] != null ? d[1] : 1,
                    'z' : d[2] != null ? d[2] : 1
                }
                highSeriesData.push(highPoint);
            }
            highSeries.push({
                'name' : s.name,
                'data' : highSeriesData
            })
        }
        highConfig.series = highSeries;        var multiSeries = highConfig.series.length > 1;
        highConfig = _.defaults(highConfig, HighChartsOption.genLegend(multiSeries));

        if (highConfig.series.length > 50 || (highConfig.series.length * highConfig.series[0].data.length > 1000)) {
            this._addMessage('W001');

            var _this = this;
            _.delay(function() {
                $(_this._dom).highcharts(highConfig);
                this._removeMessages();
            }, 300);
        } else {
            $(this._dom).highcharts(highConfig);
        }
    }
})(jQuery);
(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.views.analysisResult.AnalysisResult');

    var VizFactory = grace.views.analysisResult.viz.VizFactory;
    var VizType = grace.constants.VizType;
    var DataType = grace.constants.DataType;

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
     * @param {Array.<ShelvedAnalysis>} dimesions
     * @param {Array.<ShelvedAnalysis>} datas
     */
    AnalysisResult.prototype.render = function(selectedVizType, dataProvider, dimesions, datas) {
        this._renderArgs = arguments;

        // Prepare data
        var clear = function(sa) {
            sa.visualized = false;
            sa.numPartialVisualized = 0;
        }
        _.each(dimesions, clear);
        _.each(datas, clear);

        // TODO Filter dataProvider and create a newer to render

        // Find viz type
        var vizType = null;
        if (selectedVizType === VizType.RECOMMEND) {
            vizType = this._recommend(dataProvider, dimesions, datas);
        } else {
            if (this._valid(selectedVizType, dataProvider, dimesions, datas)) {
                vizType = selectedVizType;
            } else {
                vizType = null;
            }
        }
        // Prepare DOM
        this._$dom.empty();
        var $viz = $('<div/>').appendTo(this._$dom).css({
            'height' : this.size().height + 'px'
        });
        // Render viz
        var viz/*VizBase*/ = VizFactory.produce($viz[0], vizType, selectedVizType);
        viz.render(dataProvider, dimesions, datas);
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

        if (dimesionSAs.length === 0) {
            return VizType.BAR;
        } else {
            var d0 = dimesionSAs[0];
            var d1 = dimesionSAs[1];

            if (d0.isDateSeries()) {
                return VizType.LINE;
            } else {
                if (dataSAs.length === 1 || d0.source.numUniqueValue < 60) {
                    return VizType.COLUMN;
                } else if (dataSAs.length === 2) {
                    return VizType.SCATTER;
                } else if (dataSAs.length >= 3) {
                    return VizType.BUBBLE;
                }
            }
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

        this._subscribe(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED, function(notification) {
            _this._view.render(model.vizType(), model.dataProvider, model.analysisDimesions(), model.analysisDatas());

            model.invalidateShelvedAnalysis();
        });
        _this._view.render(model.vizType(), model.dataProvider, model.analysisDimesions(), model.analysisDatas());
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
            this._$dom.text(this._data.title);
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
            'icons' : [VT.manifest(VT.SCATTER), VT.manifest(VT.BUBBLE)]
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
        this._select(this._defaultViewIcon);    };
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

    var DataType = grace.constants.DataType;
    var AnalysisType = grace.constants.AnalysisType;

    andrea.blink.declare("andrea.grace.testingData.SampleTOPTrade");
    var SampleTOPTrade = grace.testingData.SampleTOPTrade = function() {
        this.columnDescriptors = [];
        this.columnDescriptors.push(_genColDes("购买数量", DataType.STRING, AnalysisType.MEASURE));
        this.columnDescriptors.push(_genColDes("交易状态", DataType.STRING, AnalysisType.DIMENSION));
        this.columnDescriptors.push(_genColDes("商品单价", DataType.STRING, AnalysisType.DIMENSION));
        this.columnDescriptors.push(_genColDes("优惠金额", DataType.STRING, AnalysisType.MEASURE));
        this.columnDescriptors.push(_genColDes("使用积分", DataType.STRING, AnalysisType.DIMENSION));
        this.columnDescriptors.push(_genColDes("交易金额", DataType.STRING, AnalysisType.MEASURE));
        this.columnDescriptors.push(_genColDes("交易创建日期", DataType.DATE, AnalysisType.DIMENSION));
        //this.columnDescriptors.push(_genColDes("交易创建(月)", DataType.STRING, AnalysisType.DIMENSION));
        this.columnDescriptors.push(_genColDes("交易结束日期", DataType.DATE, AnalysisType.DIMENSION));
        this.columnDescriptors.push(_genColDes("买家昵称", DataType.STRING, AnalysisType.DIMENSION));
        this.columnDescriptors.push(_genColDes("买家区域", DataType.STRING, AnalysisType.DIMENSION));
        this.columnDescriptors.push(_genColDes("有否运费险", DataType.STRING, AnalysisType.DIMENSION));
        this.columnDescriptors.push(_genColDes("有否买家留言", DataType.STRING, AnalysisType.DIMENSION));
        this.columnDescriptors.push(_genColDes("卖家发货日期", DataType.DATE, AnalysisType.DIMENSION));

        this.rows = [];
        for (var i = 0; i < 1000; i++) {
            var row = [];
            var created = genDate(-100 + Math.floor(100 / 1000 * i));
            row.push(genUint(5));
            row.push(genSelection(["没有创建支付宝交易", "等待买家付款", "买家已付款", "卖家已发货", "交易成功", "退款成功", "交易关闭"]));
            row.push(genUint(2000) / 100);
            row.push(genUint(100) / 100);
            row.push(genUint(100));
            row.push(genUint(10000) / 100);
            row.push(genDateString(created, 0));
            //row.push(genMonthString(created, 0));
            row.push(genDateString(created, genUint(7)));
            row.push("buyer_" + genUint(1000));
            row.push(genSelection(["安徽", "福建", "甘肃", "广东", "贵州", "海南", "河北", "黑龙江", "河南", "湖北", "湖南", "江苏", "江西", "吉林", "辽宁", "青海", "陕西", "山东", "山西", "四川", "云南", "浙江", "广西", "内蒙古", "宁夏", "新疆", "西藏", "北京", "重庆", "上海", "天津", "香港", "澳门", "台湾"]));
            row.push(genSelection(["有", "无"]));
            row.push(genSelection(["有", "无"]));
            row.push(genDateString(created, genUint(3) - 1));
            this.rows.push(row);
        }
    };
    var currentTime = new Date().getTime();
    var genUint = function(max) {
        return Math.floor(Math.random() * max + 1);
    }
    var genSelection = function(options) {
        return options[genUint(options.length) - 1];
    }
    var genDate = function(dayOffset) {
        var d = new Date();
        d.setDate(d.getDate() + dayOffset);
        return d;
    }
    var genDateString = function(d, dayOffset) {
        d.setDate(d.getDate() + dayOffset);
        d.setHours(_.random(0, 23));
        return d.format('yyyy/M/d H:m:s');
        //return d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();
    }
    var genMonthString = function(d, dayOffset) {
        d.setDate(d.getDate() + dayOffset);
        return d.getFullYear() + "/" + (d.getMonth() + 1);
    }
    var eg = {
        "trades_sold_get_response" : {
            "trades" : {
                "trade" : [{
                    "buyer_obtain_point_fee" : 0,
                    "buyer_area" : "浙江省杭州市",
                    "consign_time" : "2000-01-01 00:00:00",
                    "receiver_zip" : "223700",
                    "has_buyer_message" : "true",
                    "receiver_address" : "淘宝城911号",
                    "pic_path" : "http://img08.taobao.net/bao/uploaded/i8/T1jVXXXePbXXaoPB6a_091917.jpg",
                    "adjust_fee" : "200.07",
                    "type" : "fixed(一口价)",
                    "buyer_rate" : "true",
                    "receiver_phone" : "13819175372",
                    "title" : "麦包包",
                    "created" : "2000-01-01 00:00:00",
                    "alipay_no" : "2009112081173831",
                    "total_fee" : "200.07",
                    "num_iid" : 3424234,
                    "seller_flag" : 1,
                    "tid" : 2231958349,
                    "receiver_state" : "浙江省",
                    "seller_nick" : "我在测试",
                    "commission_fee" : "200.07",
                    "discount_fee" : "200.07",
                    "payment" : "200.07",
                    "status" : "TRADE_NO_CREATE_PAY",
                    "receiver_city" : "杭州市",
                    "shipping_type" : "free",
                    "cod_fee" : "12.07",
                    "cod_status" : "EW_CREATED(订单已创建)",
                    "pay_time" : "2000-01-01 00:00:00",
                    "received_payment" : "200.07",
                    "receiver_mobile" : "13512501826",
                    "post_fee" : "200.07",
                    "receiver_name" : "东方不败",
                    "modified" : "2000-01-01 00:00:00",
                    "buyer_nick" : "我在测试",
                    "receiver_district" : "西湖区",
                    "point_fee" : 0,
                    "seller_rate" : "true",
                    "num" : 1,
                    "price" : "200.07",
                    "real_point_fee" : 0,
                    "end_time" : "2000-01-01 00:00:00",
                    "orders" : {
                        "order" : [{
                            "refund_id" : 2231958349,
                            "outer_iid" : "152e442aefe88dd41cb0879232c0dcb0",
                            "discount_fee" : "200.07",
                            "payment" : "200.07",
                            "status" : "TRADE_NO_CREATE_PAY",
                            "pic_path" : "http://img08.taobao.net/bao/uploaded/i8/T1jVXXXePbXXaoPB6a_091917.jpg",
                            "sku_properties_name" : "颜色:桔色;尺码:M",
                            "adjust_fee" : "1.01",
                            "outer_sku_id" : "81893848",
                            "cid" : 123456,
                            "buyer_rate" : "true",
                            "item_meal_name" : "M8原装电池:便携支架:M8专用座充:莫凡保护袋",
                            "seller_rate" : "true",
                            "num" : 10,
                            "title" : "山寨版测试机器",
                            "item_meal_id" : 2564854632,
                            "price" : "200.07",
                            "oid" : 2231958349,
                            "total_fee" : "200.07",
                            "num_iid" : 2342344,
                            "refund_status" : "SUCCESS(退款成功)",
                            "sku_id" : "5937146",
                            "seller_type" : "B（商城商家）"
                        }]
                    },
                    "alipay_id" : "2011082299567459"
                }]
            },
            "total_results" : 100
        }
    };

    var _genColDes = function(name, dataType, analysisType) {
        return {
            "name" : name,
            // "dataType" : dataType,
            // "analysisType" : analysisType
        }
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
    andrea.blink.declare("andrea.grace.DataDiscovery");

    var App = andrea.blink.mvc.App;
    var AppConst = grace.constants.AppConst;

    var DataDiscovery = grace.DataDiscovery = function(div) {
        this._div = div;
        this._$dom = $(div);

        this._viewSourceDim = null;
        this._viewSourceMea = null;

        this._viewDesDimensionShelf = null;
        this._viewDesMeasureShelf = null;
        this._viewFilterShelf = null;

        this._viewAnalysisResult = null;

        this._viewVizNavigator = null;

        this._startup();
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
        var vGap = parseInt($(this._viewSourceDim.dom()).css("margin-bottom"));
        var hGap = 0;
        // Main
        var marginBody = parseInt($("body").css("margin"));
        var windowHeight = $(window).height() - marginBody * 2;
        var windowWidth = $(window).width() - marginBody * 2;

        var $header = $('#divHeader', this._$dom);
        var $main = $('#divMain', this._$dom);
        var marginMain = parseInt($main.css("margin"));
        var mainHeight = windowHeight - $header.outerHeight() - marginMain * 2;
        var mainWidth = windowWidth - marginMain * 2;
        $main.css({
            "height" : mainHeight + "px",
            "width" : mainWidth + "px"
        });

        // $div = $("#divMain");

        // Col1: source dim, source mea
        $("#divCol1").css({
            "width" : 180 + "px",
            "height" : mainHeight + "px"
        });
        this._viewSourceDim.size({
            "width" : 180,
            "height" : (mainHeight - vGap) / 2 + vGap
        });
        this._viewSourceMea.size({
            "width" : 180,
            "height" : (mainHeight - vGap) / 2 + vGap
        });

        // Col2: proc filter, des marker
        // TODO Enabled Col2 in later release
        $("#divCol2").css({
            "width" : 0 + "px",
            "height" : 0 + "px",
            "visibility" : "hidden"
        });
        // $("#divCol2").css({
        // "width" : 180 + "px",
        // "height" : mainHeight + "px"
        // });
        // this._viewSecondaryDesDimensionShelf.size({
        // "width" : 180,
        // "height" : 35 + 34 * 1
        // });

        // Col3: proc filter, des marker
        w = mainWidth - 180 * 1 - hGap * 2;
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
            "height" : 35 + 34 * 1
        });
        this._viewDesMeasureShelf.size({
            "height" : 35 + 34 * 1
        });
        this._viewAnalysisResult.size({
            "height" : mainHeight - (35 + 34 * 1) * 2
        })
    };
    DataDiscovery.prototype._createChildDiv = function(parent) {
        var div = document.createElement('div');
        if (parent) {
            $(div).appendTo(parent);
        }

        return div;
    };
})();
