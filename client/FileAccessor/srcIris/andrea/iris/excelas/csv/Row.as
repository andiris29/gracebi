package andrea.iris.excelas.csv {
	import andrea.iris.excelas.expose.ICell;
	import andrea.iris.excelas.expose.IRow;

	public class Row implements IRow {
		private var _cells:Array;

		private var _minCellIndex:int;
		private var _maxCellIndex:int;
		private var _numCells:int;

		public function Row(content:String) {
			var a:Array = content.split(',');

			_cells = [];
			for (var i:int = 0; i < a.length; i++) {
				var cell:ICell = new Cell(a[i]);

				_cells.push(cell);
				_minCellIndex = Math.min(_minCellIndex, i);
				_maxCellIndex = Math.max(_maxCellIndex, i);
				_numCells++;
			}
		}

		public function get minCellIndex():int {
			return _minCellIndex;
		}

		public function get maxCellIndex():int {
			return _maxCellIndex;
		}

		public function get numCells():int {
			return _numCells;
		}

		public function getCellByIndex(index:int):ICell {
			return _cells[index];
		}
	}
}
