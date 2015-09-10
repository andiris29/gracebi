package iris.external {
	import flash.external.ExternalInterface;

	public class Document {
		private static var _instance:Document;

		public static function instance():Document {
			if (!_instance) {
				_instance = new Document();
			}
			return _instance;
		}

		public function Document() {
		}

		public function get cookie() {
			return JS.get('document.cookie');
		}

		public function get location() {
			return JS.get('document.location');
		}

		public function get host() {
			var location:Object = JS.get('document.location');
			if (location) {
				return location.host;
			} else {
				return null;
			}
		}
	}
}
