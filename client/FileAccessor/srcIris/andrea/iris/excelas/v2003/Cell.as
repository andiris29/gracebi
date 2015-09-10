package andrea.iris.excelas.v2003 {
	import com.as3xls.xls.Cell;

	import andrea.iris.excelas.expose.ICell;

	public class Cell implements ICell {
		private var _as3xls:com.as3xls.xls.Cell;

		public function Cell(as3xls:com.as3xls.xls.Cell) {
			_as3xls = as3xls;
		}

		public function get value():String {
			return _as3xls.value;
		}

		public function getStringValue():String {
			return _as3xls.value ? _as3xls.value : '';
		}
	}
}
