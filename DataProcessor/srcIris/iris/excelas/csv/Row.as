package iris.excelas.csv {
	import iris.excelas.expose.ICell;
	import iris.excelas.expose.IRow;

	public class Row implements IRow {
		private var _cells:Array;

		public function Row(content:String) {
			var a:Array = content.split(',');

			_cells = [];
			for (var i:int = 0; i < a.length; i++) {
				_cells.push(new Cell(a[i]));
			}
		}

		public function get numCells():int {
			return _cells.length;
		}

		public function get minCellIndex():int {
			return 0;
		}

		public function get maxCellIndex():int {
			return Math.max(0, _cells.length - 1);
		}

		public function getCellByIndex(index:int):ICell {
			return _cells[index];
		}
	}
}
