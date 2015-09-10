package andrea.iris.excelas.v2003 {
	import com.as3xls.xls.Sheet;

	import andrea.iris.excelas.expose.IRow;
	import andrea.iris.excelas.expose.ISheet;

	public class Sheet implements ISheet {
		private var _as3xls:com.as3xls.xls.Sheet;
		private var _rows:Array;

		public function Sheet(as3xls:com.as3xls.xls.Sheet) {
			_as3xls = as3xls;
			_rows = [];

			for (var i:int = 0; i < _as3xls.values.length; i++) {
				_rows.push(new Row(_as3xls.values.getItemAt(i) as Array));
			}
		}

		public function get numRows():int {
			return _as3xls.values.length;
		}

		public function get minRowIndex():int {
			return 0;
		}

		public function get maxRowIndex():int {
			return _as3xls.values.length;
		}

		public function getRowByIndex(index:int):IRow {
			return _rows[index];
		}
	}
}
