package iris.excelas.v2007 {
	import iris.excelas.expose.ICell;
	import iris.excelas.v2007.supportClasses.ExcelElement;

	/**
	 * ssml:c
	 * 		http://www.schemacentral.com/sc/ooxml/e-ssml_c-2.html
	 */
	public class Cell extends ExcelElement implements ICell {
		private var _formula:String;
		private var _value:String;

		// Cell Data Type	Default value is "n".
		private var _type:String;

		private static const TYPE_BOOLEAN:String = "b";
		private static const TYPE_NUMBER:String = "n";
		private static const TYPE_ERROR:String = "e";
		private static const TYPE_SHARED_STRING:String = "s";
		private static const TYPE_STRING:String = "str";
		private static const TYPE_INLINE_STRING:String = "inlineStr";
		// Style Index	Default value is "0".
		private var _style:uint;
		private static const STYLE_UNASSIGNED:uint = 0;
		private static const STYLE_DATE:uint = 10;
		private static const STYLE_TIME:uint = 5;

		private var _columnReference:String;

		public function get columnReference():String {
			return _columnReference;
		}
		private var _row:Row;

		public function Cell(onwer:Excel, row:Row, content:XML, columnReference:String) {
			super(onwer, row, content);

			_row = row;
			_columnReference = columnReference;

//			_value = _parseXL(content.v, false, '');
//			_type = _parseXL(content.@t, true, TYPE_NUMBER);
//			_style = _parseXL(content.@s, true, STYLE_UNASSIGNED);
//			_formula = _parseXL(content.f, false);
		}

		private function _parseXL(xl:XMLList, isAttr:Boolean, defaultResult:String = null):String {
			var text:String = xl ? (isAttr ? xl : xl.text()) : '';
			if (text !== '') {
				return text;
			}
			return defaultResult;
		}

		public function get value():String {
			if (_value == null) {
				_value = _parseXL(_content.v, false, '');
			}
			return _value;
		}

		public function get type():String {
			if (_type == null) {
				_type = _parseXL(_content.@t, true, TYPE_NUMBER);
			}
			return _type;
		}

//		private const _RN:RegExp = new RegExp(Char.ENTER + Char.NEWLINE, "g");

		public function getStringValue():String {
			var s:String;
			if (this.type === TYPE_SHARED_STRING)
				s = _onwer.sharedString.getText(int(this.value));
			else
				s = this.value;

//			if (s != null)
//				s = s.replace(_RN, Char.NEWLINE);

			return s;
		}

		public function getNumberValue():Number {
			return Number(this.value);
		}

		private static var _dateOffset:Number = -1;

		private static function dateOffset():Number {
			if (_dateOffset == -1) {
				_dateOffset = new Date(1899, 11, 30, 0, 0, 0, 0).getTime()
					- new Date(1970, 0, 1, 0, 0, 0, 0).getTime()
					+ new Date().timezoneOffset * 60 * 1000;
			}
			return _dateOffset;
		}

		public function getDateValue():Date {
			var n:Number = Number(_value);
			n = n * 24 * 60 * 60 * 1000 + dateOffset;

			var d:Date = new Date();
			d.setTime(n);

			return d;
		}

		public function getFormula():String {
			return _formula;
		}
	}
}
