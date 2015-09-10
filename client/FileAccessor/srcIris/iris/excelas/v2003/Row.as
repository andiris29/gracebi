package iris.excelas.v2003 {
	import com.as3xls.xls.Cell;

	import iris.excelas.expose.ICell;
	import iris.excelas.expose.IRow;

	public class Row implements IRow {
		private var _content:Array;
		private var _cells:Array;

		private var _minCellIndex:int;
		private var _maxCellIndex:int;
		private var _numCells:int;

		public function Row(content:Array) {
			_content = content;
			_cells = [];

			_minCellIndex = int.MAX_VALUE;
			_maxCellIndex = 0;
			_numCells = 0;

			for (var i:int = 0; i < _content.length; i++) {
				var cell:ICell = new iris.excelas.v2003.Cell(_content[i] as com.as3xls.xls.Cell);
				_cells.push(cell);

				var s:String = cell.getStringValue();
				if (s != null && s != '') {
					var columnIndex:int = i;
					_minCellIndex = Math.min(_minCellIndex, columnIndex);
					_maxCellIndex = Math.max(_maxCellIndex, columnIndex);
					_numCells++;
				}
			}
		}

		public function get numCells():int {
			return _numCells;
		}

		public function get minCellIndex():int {
			return _minCellIndex;
		}

		public function get maxCellIndex():int {
			return _maxCellIndex;
		}

		public function getCellByIndex(index:int):ICell {
			return _cells[index];
		}
	}
}
