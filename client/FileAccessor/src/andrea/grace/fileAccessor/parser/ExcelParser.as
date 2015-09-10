package andrea.grace.fileAccessor.parser {
	import flash.events.EventDispatcher;
	import flash.geom.Rectangle;

	import iris.excelas.expose.ICell;
	import iris.excelas.expose.IExcel;
	import iris.excelas.expose.IRow;
	import iris.excelas.expose.ISheet;

	public class ExcelParser extends EventDispatcher implements IParser {
		private var _this:ExcelParser;

		public function ExcelParser() {
			_this = this;
		}

		private var _excel:IExcel;

		private var _rawValues2d:Array;
		private var _columnDescriptors:Array;

		public function set target(value:*):void {
			_excel = value as IExcel;
		}

		public function get rawValues2d():Array {
			return _rawValues2d;
		}

		public function get columnDescriptors():Array {
			return _columnDescriptors;
		}

		/**
		 *
		 */
		public function parse():void {
			_rawValues2d = [];
			_columnDescriptors = [];

			// ------------------------------------
			// Find data rectangle
			// ------------------------------------
			var dr:Rectangle = new Rectangle();

			var i:int, j:int, k:int;
			var row:IRow;
			var cell:ICell;
			// Skip all empty rows
			// Find most popular column from & to
			var rowRanges:Object = {};
			var key:String;
			for (k = 0; k < _excel.numSheets; k++) {
				var sheet:ISheet = _excel.getSheetByIndex(k);
				if (!sheet || sheet.numRows === 0) {
					continue;
				}
				for (i = sheet.minRowIndex; i <= sheet.maxRowIndex; i++) {
					row = sheet.getRowByIndex(i);
					if (!row || row.numCells === 0) {
						continue;
					}
					key = k + '_' + row.minCellIndex + '-' + row.maxCellIndex;
					if (!rowRanges[key]) {
						rowRanges[key] = 0;
					}
					// Size: Row multiplier column width
					rowRanges[key] += row.maxCellIndex - row.minCellIndex + 1;
				}
			}
			var popularKey:String;
			var popularSize:int = 0;
			for (key in rowRanges) {
				var count:int = rowRanges[key];
				if (count >= popularSize) {
					popularSize = count;
					popularKey = key;
				}
			}
			sheet = _excel.getSheetByIndex(popularKey.split('_')[0]);
			var popular:Array = popularKey.split('_')[1].split('-');

			// Poplura columns
			var pr:Rectangle = new Rectangle(popular[0], 0, popular[1] - popular[0], 1);
			// Find popular rows
			var rectangleStart:Boolean = false;

			dr.left = pr.left;
			dr.width = pr.width;
			var headerIndex:int = -1;
			for (i = sheet.minRowIndex; i <= sheet.maxRowIndex; i++) {
				row = sheet.getRowByIndex(i);
				// Empty row
				if (!row || row.numCells === 0) {
					if (rectangleStart) {
						dr.height++;
					}
					continue;
				}
				// Matched, allow 1 deviation
				if (_like(row.minCellIndex, pr.left, 1) && _like(row.maxCellIndex, pr.right, 1)) {
					if (!rectangleStart) {
						rectangleStart = true;
						dr.top = i;
						dr.height = 0;
					}

					if (headerIndex === -1 && _hasNumber(row)) {
						headerIndex = Math.max(sheet.minRowIndex, i - 1);
					}

					dr.height++;
				} else {
					// Data rectangle too small, ignore it and recount
					if (dr.height * pr.width / popularSize < .1) {
						rectangleStart = false;
					}
					// Left and right both fail, skip it
					else if (!_like(row.minCellIndex, pr.left, 2) && !_like(row.maxCellIndex, pr.right, 2)) {

					} else {
						dr.height++;
					}
				}
			}
			if (headerIndex !== -1 && dr.top !== headerIndex) {
				dr.top = headerIndex;
			}
			// Set header
			row = sheet.getRowByIndex(dr.top);
			dr.top++;
			for (j = dr.left; j <= dr.right; j++) {
				cell = row ? row.getCellByIndex(j) : null;
				if (cell) {
					_columnDescriptors[j - dr.left] = {'name': cell.getStringValue()}
				} else {
					_columnDescriptors[j - dr.left] = {'name': '列 ' + (j + 1)}
				}
			}

			// Set data
			for (i = dr.top; i <= dr.bottom; i++) {
				row = sheet.getRowByIndex(i);
				if (!row || row.numCells === 0) {
					continue;
				}
				var values:Array = [];
				for (j = dr.left; j <= dr.right; j++) {
					cell = row.getCellByIndex(j);
					if (cell) {
						values[j - dr.left] = cell.getStringValue();
					}
				}
				_rawValues2d.push(values);
			}
		}

		private function _like(n1:Number, n2:Number, deviation:uint):Boolean {
			return n1 >= n2 - deviation && n1 <= n2 + deviation;
		}

		private function _hasNumber(row:IRow):Boolean {
			for (var i:int = row.minCellIndex; i <= row.maxCellIndex; i++) {
				var cell:ICell = row.getCellByIndex(i);
				if (cell && !isNaN(Number(cell.getStringValue()))) {
					return true;
				}
			}
			return false;
		}
	}
}
