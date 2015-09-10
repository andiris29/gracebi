package andrea.iris.excelas.v2007 {

	import flash.utils.Dictionary;

	import andrea.iris.excelas.expose.ICell;
	import andrea.iris.excelas.expose.IRow;
	import andrea.iris.excelas.expose.ISheet;
	import andrea.iris.excelas.v2007.supportClasses.ExcelElement;
	import andrea.iris.excelas.v2007.utils.ExcelUtil;

	/**
	 * ssml:sheetData
	 * 		http://www.schemacentral.com/sc/ooxml/e-ssml_sheetData-1.html
	 */
	public class Sheet extends ExcelElement implements ISheet {
		private var _name:String;

		private var _rowDict:Dictionary;
		private var _minRowIndex:int;
		private var _maxRowIndex:int;
		private var _numRows:int;

		public function Sheet(onwer:Excel, content:XML, name:String) {
			super(onwer, null, content);

			_name = name;

			_rowDict = new Dictionary();
			_minRowIndex = int.MAX_VALUE;
			_maxRowIndex = 0;
			_numRows = 0;

			var rowXMLList:XMLList = _content.sheetData[0].row;

			var l:int = rowXMLList.length();
			for (var i:int = 0; i < l; i++) {
				var rowReferenceXML:XML = rowXMLList[i];

				var reference:String = rowReferenceXML.@r;

				_rowDict[reference] = new Row(_onwer, this, rowReferenceXML, reference);

				var index:int = ExcelUtil.getRowIndex(reference);
				_minRowIndex = Math.min(_minRowIndex, index);
				_maxRowIndex = Math.max(_maxRowIndex, index);
				_numRows++;
			}
		}

		public function get name():String {
			return _name;
		}

		public function get rowDict():Dictionary {
			return _rowDict;
		}

		public function get minRowIndex():int {
			return _minRowIndex;
		}

		public function get maxRowIndex():int {
			return _maxRowIndex;
		}

		public function get numRows():int {
			return _numRows;
		}

		// ------------------------------------
		// get
		// ------------------------------------

		/**
		 * @param rowReference start from 1
		 */
		public function getRow(rowReference:int):IRow {
			return _rowDict[rowReference];
		}

		public function getRowByIndex(index:int):IRow {
			return _rowDict[index + 1];
		}

		public function getCell(rowReference:int, columnReference:String):ICell {
			var cell:ICell;
			var row:Row = this.getRow(rowReference) as Row;
			if (row)
				cell = row.getCell(columnReference);
			return cell;
		}

	}
}
