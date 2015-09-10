package andrea.taoSDK.loader {
	import com.greensock.events.LoaderEvent;
	import com.greensock.loading.DataLoader;
	import com.greensock.loading.LoaderMax;
	import com.greensock.loading.core.LoaderCore;
	import com.hurlant.crypto.hash.MD5;
	
	import flash.events.EventDispatcher;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	import flash.system.Capabilities;
	import flash.utils.ByteArray;
	
	import mx.formatters.DateFormatter;
	
	import andrea.taoSDK.TOP;

	[Event(type = "andrea.taoSDK.loader.TOPLoaderEvent", name = "success")]
	[Event(type = "andrea.taoSDK.loader.TOPLoaderEvent", name = "fail")]
	/**
	 * API Tool
	 * 	http://api.taobao.com/apitools/apiTools.htm
	 * SessionKey
	 * 	http://open.taobao.com/doc/detail.htm?id=120
	 * 	http://open.taobao.com/doc/detail.htm?id=105
	 * 		http://container.open.taobao.com/container?appkey={appkey}&encode=utf-8
	 */
	public class TOPLoader extends EventDispatcher {
		// ------------------------------------
		// Static
		// ------------------------------------

		// yyyy-MM-dd HH:mm:ss
		private static const TIMESTAMP_FORMATTER:DateFormatter = (function():DateFormatter
		{
			var df:DateFormatter = new DateFormatter();
			df.formatString = "YYYY-MM-DD JJ:NN:SS";

			return df;
		}).apply();
		// xml, json
		private static const REPONSE_FORMAT:String = "json";
		public static const CHAR_SET:String = "UTF-8";
		// http://my.open.taobao.com/app/manage_license.htm?appId=386426

		// 2.0
		private static const API_VERSION:String = "2.0";
		// md5, hmac
		private static const SIGN_METHOD:String = "md5";

		private static var _queue:LoaderMax = (function():LoaderMax {
			var q:LoaderMax = LoaderMax.getLoader(TOP.HOST);
			if (!q) {
				q = new LoaderMax();
				q.name = TOP.HOST;
				// playerType
				if (Capabilities.playerType == "Desktop")
					q.maxConnections = 2;
				else if (Capabilities.playerType == "PlugIn")
					q.maxConnections = 2;
				else if (Capabilities.playerType == "ActiveX")
					q.maxConnections = 6;
			}
			q.vars.auditSize = false;
			q.autoLoad = true;

			return q;
		})();

		// ------------------------------------
		// Variable declareation
		// ------------------------------------
		private var _method:String;
		private var _sysSettings:Object;
		private var _appParameters:Object;

		private var _response:Object;

		// ------------------------------------
		// Public methods
		// ------------------------------------
		public function TOPLoader(method:String, appParameters:Object, sysSettings:Object = null) {
			super();

			_method = method;
			_appParameters = appParameters;
			_sysSettings = sysSettings || {};

			_response = null;
		}

		public function get response():Object {
			return _response;
		}

		public function load():void {
			var v:URLVariables = new URLVariables();
			var key:String;
			// App level parameters
			for (key in _appParameters) {
				v[key] = _appParameters[key];
			}
			// System level parameters
			v.method = _method;
			v.timestamp = TIMESTAMP_FORMATTER.format(new Date());
			v.format = REPONSE_FORMAT;
			v.app_key = TOP.appKey;
			v.v = API_VERSION;
			v.sign_method = SIGN_METHOD;
			if (_sysSettings.authorize) {
				v.session = TOP.accessToken;
			}
			// Sign variables
			// signVariables 1: sort key
			var keys:Array = [];
			for (key in v) {
				keys.push(key);
			}
			keys.sort();
			// signVariables 2: concatenate key, value
			var s:String = "";
			s = s + TOP.appSecret;
			for each (key in keys) {
				s = s + key + v[key];
			}
			s = s + TOP.appSecret;
			// signVariables 3: hash
			var input:ByteArray = new ByteArray();
			input.writeMultiByte(s, CHAR_SET);
			var output:ByteArray = new MD5().hash(input);
			// signVariables 4: sign
			var sign:String = "";
			output.position = 0;
			while (output.bytesAvailable > 0) {
				var hex:String = output.readUnsignedByte().toString(16);
				if (hex.length == 1)
					hex = "0" + hex;
				sign = sign + hex;
			}
			v.sign = sign.toUpperCase();

			var r:URLRequest = new URLRequest(TOP.URL);
			r.method = URLRequestMethod.POST;
			r.data = v;

			var l:DataLoader = new DataLoader(r);
			l.addEventListener(LoaderEvent.IO_ERROR, l_errorHandler);
			l.addEventListener(LoaderEvent.ERROR, l_errorHandler);
			l.addEventListener(LoaderEvent.COMPLETE, l_completeHandler);
			_queue.append(l);
		}

		// ------------------------------------
		// Protected & Private methods
		// ------------------------------------
		/**
		 * Should be override by implementation class
		 */
		protected function completeHandler():void {
		}

		private function l_errorHandler(event:LoaderEvent):void {
			this.dispatchEvent(new TOPLoaderEvent(TOPLoaderEvent.FAIL));
		}

		private function l_completeHandler(event:LoaderEvent):void {
			var s:String = _queue.getContent((event.currentTarget as LoaderCore).name);
			_response = JSON.parse(s);

			this.completeHandler();
			this.dispatchEvent(new TOPLoaderEvent(TOPLoaderEvent.SUCCESS));
		}

	}
}
