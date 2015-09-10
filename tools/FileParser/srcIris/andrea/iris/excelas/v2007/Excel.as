package andrea.iris.excelas.v2007 {
	import deng.fzip.FZip;

	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.net.URLRequest;
	import flash.utils.ByteArray;
	import flash.utils.Dictionary;
	import flash.utils.IDataInput;

	import andrea.iris.excelas.events.ExcelEvent;
	import andrea.iris.excelas.expose.IExcel;
	import andrea.iris.excelas.expose.ISheet;
	import andrea.iris.excelas.v2007.supportClasses.SharedString;
	import andrea.iris.flash.utils.XMLUtil;
	
	[Event(name = "loadComplete", type = "andrea.iris.excelas.events.ExcelEvent")]
	[Event(name = "excelReady", type = "andrea.iris.excelas.events.ExcelEvent")]
	/**
	 * Standard ECMA-376 (Office Open XML File Formats)
	 * 		http://www.ecma-international.org/publications/standards/Ecma-376.htm
	 * XML Vocabulary Information
	 * 		http://www.schemacentral.com/sc/ooxml/ss.html
	 */
	public class Excel extends EventDispatcher implements IExcel {
		private var _fzip:FZip;

		/**
		 * source: IDataInput(ByteArray) / URLRequest(String)
		 */
		public function load(source:*):void {
			if (source is IDataInput)
				loadSynchronous(source as IDataInput);
			else
				loadAsynchronous(source);
		}

		public function loadSynchronous(source:IDataInput):void {
			_fzip = new FZip();
			_fzip.addEventListener(Event.COMPLETE, fzip_completeHandler);

			var bytes:ByteArray;
			if (source is ByteArray)
				bytes = source as ByteArray;
			else {
				bytes = new ByteArray();
				while (source.bytesAvailable > 0) {
					bytes.writeUnsignedInt(source.readUnsignedInt());
				}
			}

			_fzip.loadBytes(bytes);
		}

		public function loadAsynchronous(source:*):void {
			_fzip = new FZip();
			_fzip.addEventListener(Event.COMPLETE, fzip_completeHandler);

			var request:URLRequest;
			if (source is URLRequest)
				request = source as URLRequest;
			if (source is String)
				request = new URLRequest(source as String);

			_fzip.load(request);
		}

		private function fzip_completeHandler(event:Event):void {
			this.dispatchEvent(new ExcelEvent(ExcelEvent.LOAD_COMPLETE));

			var sheetList:XMLList = XMLUtil.translateBytes(_fzip.getFileByName("xl/workbook.xml").content).sheets[0].sheet;

			_sheets = [];
			_sheetDict = new Dictionary();
			_numSheets = sheetList.length();

			for (var i:int = 0; i < _numSheets; i++) {
				var sheet:XML = (sheetList[i] as XML);

				var sheetId:String = sheet.@sheetId;
				var name:String = sheet.@name;

				var content:XML = XMLUtil.translateBytes(_fzip.getFileByName("xl/worksheets/sheet" + (i + 1) + ".xml").content);

				_sheetDict[sheetId] = new Sheet(this, content, name);
				_sheets.push(_sheetDict[sheetId]);
			}

			this.dispatchEvent(new ExcelEvent(ExcelEvent.EXCEL_READY));
		}
		private var _sheets:Array;
		private var _sheetDict:Dictionary;

		public function get sheetDict():Dictionary {
			return _sheetDict;
		}

		private var _sharedString:SharedString;

		public function get sharedString():SharedString {
			if (_sharedString == null)
				_sharedString = new SharedString(XMLUtil.translateBytes(_fzip.getFileByName("xl/sharedStrings.xml").content));
			return _sharedString;
		}

		private var _numSheets:int;

		public function get numSheets():int {
			return _numSheets;
		}

		// ------------------------------------
		// get
		// ------------------------------------
		/**
		 * @ index: 0,1,2...
		 */
		public function getSheetByIndex(index:int):ISheet {
			return _sheets[index];
		}

		/**
		 * @ sheetId: 1,2,3...
		 */
		public function getSheetBySheetId(sheetId:int):Sheet {
			return _sheetDict[sheetId];
		}

		public function getSheetByName(name:String):Sheet {
			var sheet:Sheet;

			for each (sheet in _sheetDict) {
				if (sheet.name == name)
					break;
			}

			return sheet;
		}

	}
}
