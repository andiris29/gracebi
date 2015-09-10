package {
	import andrea.taoSDK.TOP;
	import andrea.taoSDK.loader.PagingTOPLoaderEvent;
	import andrea.taoSDK.loader.trades.SoldGet;

	import flash.display.Sprite;
	import flash.events.Event;
	import flash.external.ExternalInterface;

	import iris.external.JS;

	public class CrossDomainAccessor extends Sprite {
		private var _readyCallback:String;
		private var _dataCallback:String;
		private var _completeCallback:String;

		public function CrossDomainAccessor() {
			var flashVars:Object = this.loaderInfo.parameters;
			_readyCallback = flashVars.readyCallback;
			_dataCallback = flashVars.dataCallback;
			_completeCallback = flashVars.completeCallback;

			TOP.appKey = '21613035';
			TOP.appSecret = '0cdf701594faeb88d2dd5c564bbbe5ce';

			if (ExternalInterface.available) {
				ExternalInterface.addCallback('setAccessToken', function(accessToken:String):void {
					TOP.accessToken = accessToken;
				});
				ExternalInterface.addCallback('load', function(count:int, fields:String):void {
					var sg:SoldGet = new SoldGet({
							'fields': fields,
							'type': ['fixed', 'auction', 'guarantee_trade', 'step', 'independent_simple_trade', 'independent_shop_trade',
								'auto_delivery', 'ec', 'cod', 'game_equipment', 'shopex_trade', 'netcn_trade', 'external_trade',
								'instant_trade', 'b2c_cod', 'hotel_trade', 'super_market_trade', 'super_market_cod_trade', 'taohua',
								'waimai', 'nopaid', 'step', 'eticket', 'tmall_i18n'].join(',')
						}, 1, count);
					sg.addEventListener(PagingTOPLoaderEvent.SUCCESS_ONE_PAGE, function(event:Event):void {
						JS.callWithEncoded(_dataCallback, sg.lastResponse);
					});
					sg.addEventListener(PagingTOPLoaderEvent.FINISH, function(event:Event):void {
						JS.call(_completeCallback);
					});
					sg.load();
				});
				JS.call(_readyCallback, true);
			}
		}
	}
}
