package {
	import andrea.grace.fileAccessor.parser.ExcelParser;
	import andrea.grace.fileAccessor.parser.IParser;
	import andrea.iris.excelas.csv.Excel;
	import andrea.iris.excelas.events.ExcelEvent;
	import andrea.iris.excelas.expose.IExcel;
	import andrea.iris.excelas.v2003.Excel;
	import andrea.iris.excelas.v2007.Excel;
	import andrea.iris.external.JS;
	import andrea.iris.log.Stopwatch;

	import flash.display.Graphics;
	import flash.display.Sprite;
	import flash.display.Stage;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.MouseEvent;
	import flash.events.SecurityErrorEvent;
	import flash.external.ExternalInterface;
	import flash.net.FileFilter;
	import flash.net.FileReference;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.ui.ContextMenu;
	import flash.utils.ByteArray;

	/**
	 * flashVars
	 * 	width: Number
	 * 	height: Number
	 * 	dataCallback: String
	 */

	public class FileAccessor extends Sprite {
		private var _readyCallback:String;
		private var _hoverCallback:String;
		private var _cancelCallback:String;
		private var _selectCallback:String;
		private var _clickCallback:String;
		private var _dataCallback:String;
		private var _saveCallback:String;

		private var _saveURL:String;

		private var _watch:Stopwatch;

		public function FileAccessor() {
			// Read flash variables
			var flashVars:Object = this.loaderInfo.parameters;

			var w:int = flashVars.width ? flashVars.width : 100;
			var h:int = flashVars.height ? flashVars.height : 22;
			var alpha:Number = flashVars.alpha ? flashVars.alpha : 1;

			_readyCallback = flashVars.readyCallback;
			_hoverCallback = flashVars.hoverCallback;
			_clickCallback = flashVars.clickCallback;
			_cancelCallback = flashVars.cancelCallback;
			_selectCallback = flashVars.selectCallback;
			_dataCallback = flashVars.dataCallback;
			_saveURL = flashVars.saveURL; // || 'http://127.0.0.1:8080/andrea.graceBI/server/dataSource/file';
			_saveCallback = flashVars.saveCallback;
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
				_watch = new Stopwatch('FileAccessor_local');
				JS.call(_clickCallback);
				file.addEventListener(Event.SELECT, function():void {
					_watch.start();
					JS.call(_selectCallback);
					file.load();
				});
				file.addEventListener(Event.COMPLETE, function():void {
					_parse(file.name, file.data);
				});
				file.addEventListener(Event.CANCEL, function(event:Event):void {
					JS.call(_cancelCallback);
				});
				file.browse([new FileFilter("数据文件(excel, csv)", "*.xlsx;*.xls;*.csv")]);
			});

			if (ExternalInterface.available) {
				ExternalInterface.addCallback('load', function(url:String):void {
					_watch = new Stopwatch('FileAccessor_remote');
					_watch.start();

					var request:URLRequest = new URLRequest(url);
					var loader:URLLoader = new URLLoader();
					loader.dataFormat = URLLoaderDataFormat.BINARY;
					loader.addEventListener(IOErrorEvent.IO_ERROR, function(event:IOErrorEvent):void {
						JS.log('IOError when load file: ' + event.toString());
					});
					loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, function(event:SecurityErrorEvent):void {
						JS.log('SecurityError when load file: ' + event.toString());
					});
					loader.addEventListener(Event.COMPLETE, function(event:Event):void {
						var name:String = url;
						var slash:int = url.lastIndexOf('/');
						var query:int = url.lastIndexOf('?');
						if (slash !== -1) {
							if (query !== -1) {
								name = url.substring(slash + 1, query);
							} else {
								name = url.substring(slash + 1);
							}
						}
						if (loader.data is ByteArray) {
							_parse(name, loader.data as ByteArray);
						} else {
							JS.log('Response type error when load file: ' + event.toString());
						}
					});
					loader.load(request);
				});
				JS.call(_readyCallback, true);
			}
		}

		private function _parse(name:String, data:ByteArray):void {
			// Save file
			if (_saveURL) {
				var request:URLRequest = new URLRequest();

				request.url = _saveURL + '?name=' + encodeURI(name);
				request.data = data;
				request.contentType = "application/octet-stream";
				request.method = URLRequestMethod.POST;
				var loader:URLLoader = new URLLoader();
//				loader.dataFormat = URLLoaderDataFormat.BINARY;
				loader.addEventListener(IOErrorEvent.IO_ERROR, function(event:IOErrorEvent):void {
					JS.log('IOError when save file: ' + event.toString());
				});
				loader.addEventListener(Event.COMPLETE, function(event:Event):void {
					if (_saveCallback) {
						JS.call(_saveCallback, loader.data);
					}
				});
				loader.load(request);
			}
			// Parse file
			JS.log('[' + _watch.type + '] load ' + name + ': ' + _watch.lap());
			var parser:IParser;
			var excel:IExcel;
			if (name.indexOf(".xlsx") != -1) {
				excel = new andrea.iris.excelas.v2007.Excel();
			} else if (name.indexOf(".xls") != -1) {
				excel = new andrea.iris.excelas.v2003.Excel();
			} else if (name.indexOf(".csv") != -1) {
				excel = new andrea.iris.excelas.csv.Excel();
			}
			// Load
			excel.addEventListener(ExcelEvent.LOAD_COMPLETE, function(event:ExcelEvent):void {
				JS.log('[' + _watch.type + '] load excel: ' + _watch.lap());
			});
			excel.addEventListener(ExcelEvent.EXCEL_READY, function(event:ExcelEvent):void {
				JS.log('[' + _watch.type + '] parse excel: ' + _watch.lap());
			});
			//					try {
			excel.loadSynchronous(data);
			//					} catch (error:Error) {
			//						// TODO Handle error
			//					}
			// Parse
			parser = new ExcelParser();
			parser.target = excel;
			parser.parse();
			JS.log('[' + _watch.type + '] parse graceDataSource: ' + _watch.lap());
			var viaString:Boolean = JS.callWithEncoded(_dataCallback, name, parser.rawValues2d, parser.columnDescriptors);
			JS.log('[' + _watch.type + '] call js with string: ' + _watch.lap());
			if (!viaString) {
				JS.log('[' + _watch.type + '] call js with string(fail): ' + _watch.lap());
				JS.call(_dataCallback, name, parser.rawValues2d, parser.columnDescriptors);
				JS.log('[' + _watch.type + '] call js with object: ' + _watch.lap());
			}
		}

	}
}
