package iris.excelas.v2007.supportClasses {

	public class SharedString {
		private var _content:XML;
		private var _dictionary:Object;

		public function SharedString(content:XML) {
			_content = content;
			_dictionary = {};
		}

		public function getText(index:int):String {
			if (!_dictionary[index]) {
				var si:XML = _content.si[index];
				_dictionary[index] = si.t[0].text().toString();
			}
			return _dictionary[index];
		}
	}
}
