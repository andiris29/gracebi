package iris.excelas.v2003 {
	import com.as3xls.xls.ExcelFile;
	import com.as3xls.xls.Sheet;

	import flash.events.EventDispatcher;
	import flash.events.IEventDispatcher;
	import flash.utils.ByteArray;
	import flash.utils.IDataInput;

	import iris.excelas.events.ExcelEvent;
	import iris.excelas.expose.IExcel;
	import iris.excelas.expose.ISheet;

	[Event(name = "loadComplete", type = "iris.excelas.events.ExcelEvent")]
	[Event(name = "excelReady", type = "iris.excelas.events.ExcelEvent")]
	public class Excel extends EventDispatcher implements IExcel {
		private var _as3xls:ExcelFile;
		private var _sheets:Array;

		public function Excel(target:IEventDispatcher = null) {
			super(target);
		}

		public function loadSynchronous(source:IDataInput):void {
			_as3xls = new ExcelFile();
			_as3xls.loadFromByteArray(source as ByteArray);
			this.dispatchEvent(new ExcelEvent(ExcelEvent.LOAD_COMPLETE));

			_sheets = [];
			for (var i:int = 0; i < _as3xls.sheets.length; i++) {
				_sheets.push(new iris.excelas.v2003.Sheet(_as3xls.sheets.getItemAt(i) as com.as3xls.xls.Sheet));
			}
			this.dispatchEvent(new ExcelEvent(ExcelEvent.EXCEL_READY));
		}

		public function get numSheets():int {
			return _as3xls.sheets.length;
		}

		public function getSheetByIndex(index:int):ISheet {
			return _sheets[index];
		}
	}
}
