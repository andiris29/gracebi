package iris.external {
	import flash.external.ExternalInterface;

	public class JS {
		public static function eval(script:String):* {
			if (ExternalInterface.available) {
				return ExternalInterface.call("function(){" + script + "}");
			} else {
				throw new Error('JavaScript disabled.');
			}
		}

		public static function log(... logs:*):void {
			apply('console.log', logs);
		}

		public static function logObject(... objects:*):void {
			eval('console.log(' + log + ')');
		}

		public static function call(method:String, ... args:*):* {
			return apply(method, args);
		}

		public static function callWithEncoded(method:String, ... args:*):* {
			for (var i:int = 0; i < args.length; i++) {
				args[i] = _encode(args[i]);
			}
			return apply(method, args);
		}

		private static function _encode(o:Object):String {
			var s:String = JSON.stringify(o);
			s = s.replace(/%/g, '%25');
			s = s.replace(/\\"/g, '%22');
			return s;
		}

		public static function apply(method:String, args:Array):* {
			args.splice(0, 0, method);
			if (ExternalInterface.available) {
				try {
					return ExternalInterface.call.apply(null, args);
				} catch (error:Error) {
					throw error;
				}
			} else {
				throw new Error('JavaScript disabled.');
			}
		}

		public static function get(key:String):* {
			var value:String;
			if (ExternalInterface.available) {
				try {
					value = eval("return " + key + ";");
				} catch (error:Error) {
					value = null;
				}
			}
			return value;
		}
	}
}
