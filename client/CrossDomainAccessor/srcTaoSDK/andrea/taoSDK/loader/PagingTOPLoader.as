package andrea.taoSDK.loader {
	import flash.events.EventDispatcher;

	[Event(type = "andrea.taoSDK.loader.PagingTOPLoaderEvent", name = "successOnePage")]
	[Event(type = "andrea.taoSDK.loader.PagingTOPLoaderEvent", name = "fail")]
	[Event(type = "andrea.taoSDK.loader.PagingTOPLoaderEvent", name = "finish")]
	public class PagingTOPLoader extends EventDispatcher {
		private var _method:String;
		private var _sysSettings:Object;
		private var _appParameters:Object;

		private var _lastResponse:Object;

		public function get lastResponse():Object {
			return _lastResponse;
		}

		private var _responses:Array;

		public function get responses():Array {
			return _responses;
		}

		private var _from:int;
		private var _to:int;
		private var _step:int;
		private var _current:int;

		public function PagingTOPLoader(method:String, appParameters:Object, pagingSettings:Object, sysSettings:Object = null) {
			_method = method;
			_appParameters = appParameters;
			_sysSettings = sysSettings || {};

			_from = Math.max(1, pagingSettings.from);
			_to = Math.max(1, pagingSettings.to);
			_step = pagingSettings.step;
			// From must be divisible by step
			_current = Math.floor((_from - 1) / _step) * _step + 1;
		}

		public function load():void {
			// Initialize response
			_lastResponse = null;
			_responses = [];
			// Start loading
			_loadPage();
		}

		private function _loadPage():void {
			var appParameters:Object = JSON.parse(JSON.stringify(_appParameters));
			appParameters.page_no = Math.floor((_from - 1) / _step) + 1;
			appParameters.page_size = _step;
			var loader:TOPLoader = new TOPLoader(_method, appParameters, _sysSettings);
			loader.addEventListener(TOPLoaderEvent.SUCCESS, _loaderSuccessHandler);
			loader.addEventListener(TOPLoaderEvent.FAIL, _loaderFailHandler);
			loader.load();
		}

		private function _loaderSuccessHandler(event:TOPLoaderEvent):void {
			var loader:TOPLoader = event.currentTarget as TOPLoader;
			var response:Object = loader.response;
			// Save response
			_lastResponse = response;
			_responses.push(response);
			// Check numbers
			var total:int = _parseTotal(response);
			_current += _step;

			// Dispatch event
			this.dispatchEvent(new PagingTOPLoaderEvent(PagingTOPLoaderEvent.SUCCESS_ONE_PAGE));

			if (_current <= total) {
				_loadPage();
			} else {
				this.dispatchEvent(new PagingTOPLoaderEvent(PagingTOPLoaderEvent.FINISH));
			}
		}

		private function _parseTotal(response:Object):int {
			if (response.total_results) {
				return Number(response.total_results);
			} else {
				var content:Object = null;
				for (var key:String in response) {
					if (!content) {
						content = response[key];
					} else {
						throw new Error('Can not found total_results.');
					}
				}
				if (content.total_results) {
					return Number(content.total_results);
				} else {
					throw new Error('Can not found total_results.');
				}
			}
		}

		private function _loaderFailHandler(event:TOPLoaderEvent):void {
			this.dispatchEvent(new PagingTOPLoaderEvent(PagingTOPLoaderEvent.FAIL));
		}
	}
}
