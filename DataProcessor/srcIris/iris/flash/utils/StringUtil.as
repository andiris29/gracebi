package iris.flash.utils {
	import flash.utils.ByteArray;

	import mx.utils.StringUtil;

	import iris.contants.Char;

	public class StringUtil {
		public static function substitute(s:String, ... replacement):String {
			var args:Array = replacement;
			args.splice(0, 0, s);
			return mx.utils.StringUtil.substitute.apply(null, args);
		}

		public static function bytesToString(byteArray:ByteArray, charset:String):String {
			var s:String = null;
			if (byteArray != null) {
				byteArray.position = 0;
				s = byteArray.readMultiByte(byteArray.length, charset);
			}
			return s;
		}

		public static function stringToBytes(string:String, charset:String):ByteArray {
			var byteArray:ByteArray;
			if (string != null) {
				byteArray = new ByteArray();
				byteArray.writeMultiByte(string, charset);
			}
			return byteArray;
		}

		public static function intercept(s:String, startTag:String, endTag:String, includeStartTag:Boolean, includeEndTag:Boolean):String {
			var result:String;
			// find index
			var startIndex:int = findStartIndex(s, startTag);
			var endIndex:int = findEntIndex(s, endTag, startTag);
			// intercept
			if (!includeStartTag)
				startIndex = startIndex + startTag.length;
			if (includeEndTag)
				endIndex = endIndex + endTag.length;

			result = s.substring(startIndex, endIndex);

			return result;
		}

		public static function interceptAll(s:String, startTag:String, endTag:String, includeStartTag:Boolean, includeEndTag:Boolean):Array {
			var array:Array = [];
			while (true) {
				try {
					var tempResult:String = intercept(s, startTag, endTag, includeStartTag, includeEndTag);
					array.push(tempResult);
					if (!includeStartTag)
						tempResult = startTag + tempResult;
					if (!includeEndTag)
						tempResult = tempResult + endTag;
					s = s.replace(tempResult, "");
				} catch (error:Error) {
					break;
				}
			}
			return array;
		}

		public static function drop(s:String, startTag:String, endTag:String, includeStartTag:Boolean, includeEndTag:Boolean, dropAll:Boolean):String {
			var result:String = s;

			var isFirst:Boolean = true;
			while (isFirst || dropAll) {
				var string:String = result;
				// find index
				var startIndex:int;
				var endIndex:int;
				try {
					startIndex = findStartIndex(string, startTag);
					endIndex = findEntIndex(string, endTag, startTag, startIndex);
				} catch (error:Error) {
					// all droped
					break;
				}
				// drop
				if (includeStartTag)
					result = string.substring(0, startIndex + startTag.length);
				else
					result = string.substring(0, startIndex);

				if (includeEndTag)
					result = result + string.substring(endIndex);
				else
					result = result + string.substring(endIndex + endTag.length);

				isFirst = false;
			}

			return result;
		}

		private static function findStartIndex(s:String, sTag:String):int {
			var sIdx:int;
			if (sTag == "")
				sIdx = 0;
			else
				sIdx = s.indexOf(sTag);

			if (sIdx == -1)
				throw new Error("invalide StartTag: " + sTag);

			return sIdx;
		}

		private static function findEntIndex(s:String, eTag:String, sTag:String = "", sIdx:int = -1):int {
			var eIdx:int;
			if (eTag == "")
				eIdx = s.length;
			else {
				if (sTag == "")
					eIdx = s.indexOf(eTag);
				else {
					if (sIdx == -1)
						sIdx = findStartIndex(s, sTag);
					eIdx = s.indexOf(eTag, sIdx + sTag.length);
				}
			}

			if (eIdx == -1)
				throw new Error("invalide EndIndex: " + eTag);

			return eIdx;
		}

		public static function interceptNumber(string:String):String {
			var s:String = "";

			var seeked:Boolean = false;
			for (var i:int = 0; i < string.length; i++) {
				var c:Number = string.charCodeAt(i);
				// 0-9 .
				var isValid:Boolean = ((c >= 48 && c <= 57) || c == 46);

				if (isValid)
					s = s + String.fromCharCode(c);
				else if (s != "")
					break;
			}
			return s;
		}

		public static function compare(s1:String, s2:String):int {
			var l:int = Math.min(s1.length, s2.length);

			if (s1.substr(0, l) == s2.substring(0, l)) {
				return s1.length - s2.length;
			} else {
				for (var i:int; i < l; i++) {
					var c1:int = s1.charCodeAt(i);
					var c2:int = s2.charCodeAt(i);
					if (c1 == c2)
						continue;
					else
						return c1 - c2;
				}
			}
			return 0;
		}

		/**
		 *
		 * @param s:String
		 * @param filler:String
		 * @param maxLength:int
		 * @param isPrefix:Boolean
		 * 		true:xxxS, false: Sxxx
		 */
		public static function fill(s:String, filler:String, maxLength:int, isPrefix:Boolean):String {
			while (s.length < maxLength) {
				if (isPrefix)
					s = filler + s;
				else
					s = s + filler;
			}
			return s;
		}

		/**
		 *
		 *
		 */
		public static function translateInt(int:String):String {
			if (int == "1")
				return "一";
			else if (int == "2")
				return "二";
			else if (int == "3")
				return "三";
			else if (int == "4")
				return "四";
			else if (int == "5")
				return "五";
			else if (int == "6")
				return "六";
			else if (int == "7")
				return "七";
			else if (int == "8")
				return "八";
			else if (int == "9")
				return "九";
			return null;
		}

		/**
		 * Dos和windows采用回车+换行CR/LF表示下一行
		 * 		CR用符号'r'表示, ASCII代码是13, 十六进为0x0D
		 * 		LF用符号'n'表示, ASCII代码是10, 十六制为0x0A
		 */
		public static function alterCRLF(s:String):String {
			s = s.replace(new RegExp(Char.ENTER + Char.NEWLINE, "g"), Char.NEWLINE);
			return s;
		}

		/**
		 *
		 */
		public static function isEmpty(s:String):Boolean {
			return s == null || trim(s) == "";
		}

		// ------------------------------------
		// delegate mx.utils.StringUtil
		// ------------------------------------
		public static function trim(str:String):String {
			return mx.utils.StringUtil.trim(str);
		}
	}
}
