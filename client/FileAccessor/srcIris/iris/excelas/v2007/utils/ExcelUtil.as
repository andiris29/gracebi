package iris.excelas.v2007.utils {

	public class ExcelUtil {
		/**
		 * A -> 0
		 * AA -> 26
		 */
		private static var _columnRI:Object = {};

		public static function getColumnIndex(reference:String):int {
			if (!_columnRI[reference]) {
				var index:int = 0;
				for (var i:int = 0; i < reference.length; i++) {
					var t:int = reference.charCodeAt(reference.length - 1 - i) - 65 + 1;
					index += t * Math.pow(26, i);
				}

				_columnRI[reference] = index - 1;
			}

			return _columnRI[reference];
		}
		/**
		 * 0 -> A
		 * 26 -> AA
		 */
		private static var _columnIR:Object = {};

		public static function getColumnReference(index:int):String {
			if (!_columnIR[index]) {
				var reference:String = '';
				var t:int = index;
				while (t >= 0) {
					reference = String.fromCharCode(t % 26 + 65) + reference;
					t = (t - t % 26) / 26 - 1;
				}
				_columnIR[index] = reference;
			}

			return _columnIR[index];
		}

		/**
		 * 0 -> 1
		 * 100 -> 101
		 */
		public static function getRowReference(index:int):String {
			return index + 1 + '';
		}

		/**
		 * 1 -> 0
		 * 101 -> 100
		 */
		public static function getRowIndex(reference:String):int {
			return parseInt(reference) - 1;
		}
	}
}
