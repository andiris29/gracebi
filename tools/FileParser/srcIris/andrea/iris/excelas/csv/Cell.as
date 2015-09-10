package andrea.iris.excelas.csv {
	import andrea.iris.excelas.expose.ICell;
	import andrea.iris.flash.utils.StringUtil;

	public class Cell implements ICell {
		private var _value:String;

		public function Cell(content:String) {
			if (content.match(/"$/) && content.match(/^"/)) {
				content = content.replace(/"$/, '').replace(/^"/, '');
			}
			_value = StringUtil.trim(content);
		}

		public function get value():String {
			return _value;
		}

		public function getStringValue():String {
			return this.value;
		}
	}
}
