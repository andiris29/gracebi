package iris.excelas.csv {
	import iris.excelas.expose.ICell;

	public class Cell implements ICell {
		private var _value:String;

		public function Cell(content:String) {
			_value = content;
		}

		public function getStringValue():String {
			return _value;
		}
	}
}
