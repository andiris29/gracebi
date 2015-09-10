package iris.external {

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

		public function get cookie():String {
			return JS.get('document.cookie');
		}

		public function get location():String {
			return JS.get('document.location');
		}

		public function get host():String {
			var location:Object = JS.get('document.location');
			if (location) {
				return location.host;
			} else {
				return null;
			}
		}
	}
}
