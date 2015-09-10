package {
	import andrea.grace.fileAccessor.parser.ExcelParser;
	import andrea.grace.fileAccessor.parser.IParser;

	import flash.display.Graphics;
	import flash.display.Sprite;
	import flash.display.Stage;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.MouseEvent;
	import flash.net.FileFilter;
	import flash.net.FileReference;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.ui.ContextMenu;

	import iris.excelas.csv.Excel;
	import iris.excelas.events.ExcelEvent;
	import iris.excelas.expose.IExcel;
	import iris.excelas.v2003.Excel;
	import iris.excelas.v2007.Excel;
	import iris.external.JS;
	import iris.log.Stopwatch;

	/**
	 * flashVars
	 * 	width: Number
	 * 	height: Number
	 * 	dataCallback: String
	 */

	public class FileAccessor extends Sprite {
		private var _this:FileAccessor;

		private var _hoverCallback:String;
		private var _cancelCallback:String;
		private var _clickCallback:String;
		private var _dataCallback:String;

		private var _logFileURL:String;

		public function FileAccessor() {
			_this = this;
			// Read flash variables
			var flashVars:Object = this.loaderInfo.parameters;

			var w:int = flashVars.width ? flashVars.width : 100;
			var h:int = flashVars.height ? flashVars.height : 22;
			var alpha:Number = flashVars.alpha ? flashVars.alpha : 1;

			_hoverCallback = flashVars.hoverCallback;
			_clickCallback = flashVars.clickCallback;
			_cancelCallback = flashVars.cancelCallback;
			_dataCallback = flashVars.dataCallback;
			_logFileURL = flashVars.logFileURL || 'http://127.0.0.1:8080/graceLogger/file';
			// Setup application
			var stage:Stage = this.stage;
			stage.align = StageAlign.TOP_LEFT;
			stage.scaleMode = StageScaleMode.NO_SCALE;
			stage.stageWidth = w;
			stage.stageHeight = h;

			this.contextMenu = new ContextMenu();
			this.contextMenu.hideBuiltInItems();

			if (_hoverCallback) {
				this.addEventListener(MouseEvent.ROLL_OVER, function(event:MouseEvent):void {
					JS.call(_hoverCallback, true);
				});
				this.addEventListener(MouseEvent.ROLL_OUT, function(event:MouseEvent):void {
					JS.call(_hoverCallback, false);
				});
			}
			// Draw UI
			var ui:Sprite = this.addChild(new Sprite()) as Sprite;
			ui.buttonMode = ui.useHandCursor = true;
			var g:Graphics = ui.graphics;
			g.beginFill(0x000000, alpha);
			g.drawRect(0, 0, w, h);
			g.endFill();
			// User interactive
			ui.addEventListener(MouseEvent.CLICK, function():void {
				var file:FileReference = new FileReference();
				var watch:Stopwatch = new Stopwatch('FileAccessor');
				JS.call(_clickCallback);
				file.addEventListener(Event.SELECT, function():void {
					watch.start();
					file.load();
				});
				file.addEventListener(Event.COMPLETE, function():void {
					// Save file
					if (_logFileURL) {
						var request:URLRequest = new URLRequest();

						request.url = _logFileURL + '?name=' + encodeURI(file.name);
						request.data = file.data;
						request.contentType = "application/octet-stream";
						request.method = URLRequestMethod.POST;
						var loader:URLLoader = new URLLoader();
						loader.dataFormat = URLLoaderDataFormat.BINARY;
						loader.addEventListener(IOErrorEvent.IO_ERROR, function(event:IOErrorEvent):void {
							JS.log('IOError when save file: ' + event.toString());
						});
						loader.load(request);
					}
					// Parse file
					JS.log('[' + watch.type + '] load ' + file.name + ': ' + watch.lap());
					var parser:IParser;
					var excel:IExcel;
					if (file.name.indexOf(".xlsx") != -1) {
						excel = new iris.excelas.v2007.Excel();
					} else if (file.name.indexOf(".xls") != -1) {
						excel = new iris.excelas.v2003.Excel();
					} else if (file.name.indexOf(".csv") != -1) {
						excel = new iris.excelas.csv.Excel();
					}
					// Load
					excel.addEventListener(ExcelEvent.LOAD_COMPLETE, function(event:ExcelEvent):void {
						JS.log('[' + watch.type + '] load excel: ' + watch.lap());
					});
					excel.addEventListener(ExcelEvent.EXCEL_READY, function(event:ExcelEvent):void {
						JS.log('[' + watch.type + '] parse excel: ' + watch.lap());
					});
//					try {
					excel.loadSynchronous(file.data);
//					} catch (error:Error) {
//						// TODO Handle error
//					}
					// Parse
					parser = new ExcelParser();
					parser.target = excel;
					parser.parse();
					JS.log('[' + watch.type + '] parse graceDataSource: ' + watch.lap());
					var viaString:Boolean = JS.callWithEncoded(_dataCallback, file.name, parser.rawValues2d, parser.columnDescriptors);
					JS.log('[' + watch.type + '] call js with string: ' + watch.lap());
					if (!viaString) {
						JS.log('[' + watch.type + '] call js with string(fail): ' + watch.lap());
						JS.call(_dataCallback, file.name, parser.rawValues2d, parser.columnDescriptors);
						JS.log('[' + watch.type + '] call js with object: ' + watch.lap());
					}
				});
				file.addEventListener(Event.CANCEL, function(event:Event):void {
					JS.call(_cancelCallback);
				});
				file.browse([new FileFilter("数据文件(excel, csv)", "*.xlsx;*.xls;*.csv")]);
			});
		}

	}
}
