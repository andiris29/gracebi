package andrea.iris.excelas.csv {
	import flash.events.EventDispatcher;
	import flash.utils.ByteArray;
	import flash.utils.IDataInput;

	import andrea.iris.excelas.events.ExcelEvent;
	import andrea.iris.excelas.expose.IExcel;
	import andrea.iris.excelas.expose.ISheet;

	public class Excel extends EventDispatcher implements IExcel {
		public function Excel() {
		}
		private var _sheet:Sheet;

		public function loadSynchronous(source:IDataInput):void {
			var bytes:ByteArray = source as ByteArray;

			bytes.position = 0;
			_sheet = new Sheet(source.readMultiByte(source.bytesAvailable, 'ms2312'));

			if (_sheet.numRows === 1) {
				bytes.position = 0;
				_sheet = new Sheet(source.readMultiByte(source.bytesAvailable, 'utf-8'));
			}

			this.dispatchEvent(new ExcelEvent(ExcelEvent.EXCEL_READY));
		}

		public function get numSheets():int {
			return 1;
		}

		public function getSheetByIndex(index:int):ISheet {
			if (index === 0) {
				return _sheet;
			} else {
				return null;
			}
		}
	}
}
