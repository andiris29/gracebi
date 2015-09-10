package dataFileParsers {
	import flash.events.EventDispatcher;
	import flash.geom.Rectangle;
	import flash.utils.ByteArray;

	import iris.excelas.events.ExcelEvent;
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

		public function set raw(value:*):void {
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
			var popularRowCount:int = 0;
			for (key in rowRanges) {
				var count:int = rowRanges[key];
				if (count >= popularRowCount) {
					popularRowCount = count;
					popularKey = key;
				}
			}
			sheet = _excel.getSheetByIndex(popularKey.split('_')[0]);
			var popular:Array = popularKey.split('_')[1].split('-');

			var pr:Rectangle = new Rectangle(popular[0], 0, popular[1] - popular[0], 1);
			// Find rectangle with popular column from & to
			var rectangleStart:Boolean = false;

			dr.left = pr.left;
			dr.width = pr.width;
			for (i = sheet.minRowIndex; i <= sheet.maxRowIndex; i++) {
				row = sheet.getRowByIndex(i);
				if (!row || row.numCells === 0) {
					if (rectangleStart) {
						dr.height++;
					}
					continue;
				}
				if (row.minCellIndex === pr.left && row.maxCellIndex === pr.right) {
					if (!rectangleStart) {
						rectangleStart = true;
						dr.top = i;
						dr.height = 0;
					}
					dr.height++;
				} else {
					if (dr.height >= 3 && Math.abs(row.minCellIndex - pr.left) <= 1 && Math.abs(row.maxCellIndex - pr.right) <= 1) {

					} else {
						rectangleStart = false;
					}
				}
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
	}
}
