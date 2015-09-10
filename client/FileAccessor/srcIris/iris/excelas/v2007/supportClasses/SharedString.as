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
				try {
					var xts:XMLList = si..t;
					var ts:Array = [];
					for (var i:int = 0; i < xts.length(); i++) {
						ts.push(xts[i].text().toString());
					}
					_dictionary[index] = ts.join('');
				} catch (error:Error) {
					_dictionary[index] = '';
				}
			}
			return _dictionary[index];
		}
	}
}
