package andrea.taoSDK.loader.trades {
	import andrea.taoSDK.loader.PagingTOPLoader;

	/**
	 * http://api.taobao.com/apidoc/api.htm?spm=0.0.0.0.XsDtLj&path=cid:5-apiId:46
	 */
	public class SoldGet extends PagingTOPLoader {
		public function SoldGet(appParameters:Object, from:int, to:int) {
			super('taobao.trades.sold.get', appParameters, {
					'from': from,
					'to': to,
					'step': 100
				}, {
					'authorize': true
				});
		}
	}
}
