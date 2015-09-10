package andrea.taoSDK.loader {
	import flash.events.Event;

	public class TOPLoaderEvent extends Event {
		public function TOPLoaderEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false) {
			super(type, bubbles, cancelable);
		}

		public static const SUCCESS:String = 'success';
		public static const FAIL:String = 'fail';
	}
}
