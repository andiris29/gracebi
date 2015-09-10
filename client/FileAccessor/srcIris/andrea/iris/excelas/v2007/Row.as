package andrea.iris.excelas.v2007 {

	import flash.utils.Dictionary;
	
	import andrea.iris.excelas.expose.ICell;
	import andrea.iris.excelas.expose.IRow;
	import andrea.iris.excelas.v2007.supportClasses.ExcelElement;
	import andrea.iris.excelas.v2007.utils.ExcelUtil;

	/**
	 * ssml:rowReference
	 * 		http://www.schemacentral.com/sc/ooxml/e-ssml_rowReference-1.html
	 */
	public class Row extends ExcelElement implements IRow {
		private var _sheet:Sheet;

		private var _rowReference:String;

		private var _minCellIndex:int;
		private var _maxCellIndex:int;
		private var _numCells:int;

		public function Row(onwer:Excel, sheet:Sheet, content:XML, rowReference:String) {
			super(onwer, sheet, content);

			_sheet = sheet;
			_rowReference = rowReference;

			_cellDict = new Dictionary();
			_minCellIndex = int.MAX_VALUE;
			_maxCellIndex = 0;
			_numCells = 0;

			var cellXMLList:XMLList = _content.c;

			var slr:int = _rowReference.length;

			for (var i:int = 0; i < cellXMLList.length(); i++) {
				var cellXML:XML = cellXMLList[i];

				// A1, B1
				var reference:String = cellXML.@r;
				var columnReference:String = reference.substr(0, reference.length - slr);

				var cell:ICell = new Cell(_onwer, this, cellXML, columnReference);
				var s:String = cell.getStringValue();
				if (s != null && s != '') {
					_cellDict[columnReference] = cell;
					var columnIndex:int = ExcelUtil.getColumnIndex(columnReference);
					_minCellIndex = Math.min(_minCellIndex, columnIndex);
					_maxCellIndex = Math.max(_maxCellIndex, columnIndex);
					_numCells++;
				}
			}
		}

		public function get rowReference():String {
			return _rowReference;
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

		private var _cellDict:Dictionary;

		public function get cellDict():Dictionary {
			return _cellDict;
		}

		// ------------------------------------
		// get
		// ------------------------------------
		/**
		 * @param columnReference start from "A"
		 */
		public function getCell(columnReference:String):ICell {
			return _cellDict[columnReference];
		}

		public function getCellByIndex(index:int):ICell {
			var columnReference:String = ExcelUtil.getColumnReference(index);
			return getCell(columnReference);
		}

	}
}
