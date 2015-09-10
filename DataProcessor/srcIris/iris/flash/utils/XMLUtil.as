package iris.flash.utils {
	import flash.utils.ByteArray;

	import iris.contants.Charset;

	public class XMLUtil {
		public static function translateBytes(bytes:ByteArray):XML {
			return translate(StringUtil.bytesToString(bytes, Charset.UTF_8));
		}

		public static function translate(s:String):XML {
			return new XML(formatE4X(s));
		}

		public static function formatE4X(s:String):String {
			return s.replace("xmlns=", "xmlns:ns=");
		}
	}
}
