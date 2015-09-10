package iris.excelas.v2007.supportClasses {
	import iris.excelas.v2007.Excel;

	/**
	 * abstract
	 */
	public class ExcelElement {
		protected var _onwer:Excel;
		protected var _parent:ExcelElement;
		protected var _content:XML;

		public function ExcelElement(onwer:Excel, parent:ExcelElement, content:XML) {
			_onwer = onwer;
			_parent = parent;
			_content = content;
		}
	}
}
