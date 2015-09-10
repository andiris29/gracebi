package iris.external {
	import flash.external.ExternalInterface;
	import flash.net.URLRequest;
	import flash.net.navigateToURL;

	public class Window {
		private static var _instance:Window;

		public static function instance():Window {
			if (!_instance) {
				_instance = new Window();
			}
			return _instance;
		}

		public function Window() {
		}

		public function open(url:String, window:String = "", option:String = ""):void {
			try {
				JS.eval("window.open(" + url + ", " + window + ", " + option + ");");
			} catch (error:Error) {
				navigateToURL(new URLRequest(url), window);
			}
		}
	}
}
