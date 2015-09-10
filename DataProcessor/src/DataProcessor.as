package {
	import flash.display.Graphics;
	import flash.display.Sprite;
	import flash.display.Stage;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.net.FileFilter;
	import flash.net.FileReference;
	import flash.ui.ContextMenu;

	import dataFileParsers.ExcelParser;
	import dataFileParsers.IParser;

	import iris.excelas.csv.Excel;
	import iris.excelas.events.ExcelEvent;
	import iris.excelas.expose.IExcel;
	import iris.excelas.v2007.Excel;
	import iris.external.JS;
	import iris.log.Stopwatch;

	/**
	 * flashVars
	 * 	width: Number
	 * 	height: Number
	 * 	dataCallback: String
	 */

	public class DataProcessor extends Sprite {
		private var _this:DataProcessor;
		private var _dataCallback:String;
		private var _hoverCallback:String;
		private var _startProccessCallback:String;

		public function DataProcessor() {
			_this = this;
			// Read flash variables
			var flashVars:Object = this.loaderInfo.parameters;

			var w:int = flashVars.width ? flashVars.width : 100;
			var h:int = flashVars.height ? flashVars.height : 22;
			var alpha:Number = flashVars.alpha ? flashVars.alpha : 1;

			_dataCallback = flashVars.dataCallback;
			_hoverCallback = flashVars.hoverCallback;
			_startProccessCallback = flashVars.startProccessCallback;
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
				var watch:Stopwatch = new Stopwatch('DataProcessor');
				file.addEventListener(Event.SELECT, function():void {
					watch.start();
					JS.call(_startProccessCallback);
					file.load();
					JS.log('[' + watch.type + '] load file: ' + watch.lap());
				});
				file.addEventListener(Event.COMPLETE, function():void {
					var parser:IParser;
					var excel:IExcel;
					if (file.name.indexOf(".xlsx") != -1) {
						// Load excel
						excel = new iris.excelas.v2007.Excel();
						excel.addEventListener(ExcelEvent.UNZIP_COMPLETE, function(event:ExcelEvent):void {
							JS.log('[' + watch.type + '] unzip xlsx: ' + watch.lap());
						});
						excel.addEventListener(ExcelEvent.EXCEL_READY, function(event:ExcelEvent):void {
							JS.log('[' + watch.type + '] load xlsx: ' + watch.lap());
						});
						excel.loadSynchronous(file.data);
						// Parse
						parser = new ExcelParser();
						parser.raw = excel;
					} else if (file.name.indexOf(".csv") != -1) {
						// Load csv
						excel = new iris.excelas.csv.Excel();
						excel.addEventListener(ExcelEvent.EXCEL_READY, function(event:ExcelEvent):void {
							JS.log('[' + watch.type + '] load xlsx: ' + watch.lap());
						});
						excel.loadSynchronous(file.data);
						// Parse
						parser = new ExcelParser();
						parser.raw = excel;
					}
					parser.parse();
					JS.log('[' + watch.type + '] parse xlsx: ' + watch.lap());
					var viaString:Boolean = JS.call(_dataCallback, _this.encode(parser.rawValues2d), _this.encode(parser.columnDescriptors));
					if (!viaString) {
						JS.log('[' + watch.type + '] call js(via string fail): ' + watch.lap());
						JS.call(_dataCallback, parser.rawValues2d, parser.columnDescriptors);
					}
					JS.log('[' + watch.type + '] call js: ' + watch.lap());
				});
				file.browse([new FileFilter("数据文件（Excel, csv）", "*.xlsx;*.csv")]);
			});
		}

		private function encode(o:Object):String {
			var s:String = JSON.stringify(o);
			s = s.replace(/%/g, '%25');
			s = s.replace(/\\"/g, '%22');
			return s;
		}
	}
}
