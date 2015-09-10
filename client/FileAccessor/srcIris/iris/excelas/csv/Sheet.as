package iris.excelas.csv {
	import iris.excelas.expose.IRow;
	import iris.excelas.expose.ISheet;
	import iris.flash.utils.StringUtil;

	public class Sheet implements ISheet {
		private var _rows:Array;

		public function Sheet(content:String) {
			var a1:Array = content.split('\r\n');
			var a2:Array = content.split('\n');

			var a:Array = a1.length >= a2.length ? a1 : a2;

			_rows = [];
			for (var i:int = 0; i < a.length; i++) {
				var s:String = a[i];
				s = StringUtil.trim(s);
				if (s === '') {
					continue;
				}
				_rows.push(new Row(s));
			}
		}

		public function get numRows():int {
			return _rows.length;
		}

		public function get minRowIndex():int {
			return 0;
		}

		public function get maxRowIndex():int {
			return Math.max(0, _rows.length - 1);
		}

		public function getRowByIndex(index:int):IRow {
			return _rows[index];
		}
	}
}
