package andrea.taoSDK.loader {
	import flash.events.Event;

	public class PagingTOPLoaderEvent extends Event {
		public function PagingTOPLoaderEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false) {
			super(type, bubbles, cancelable);
		}
		public static const SUCCESS_ONE_PAGE:String = 'successOnePage';

		public static const FINISH:String = 'finish';
		public static const FAIL:String = 'fail';
	}
}
