package andrea.iris.excelas.events {
	import flash.events.Event;

	public class ExcelEvent extends Event {
		public function ExcelEvent(type:String) {
			super(type);
		}
		
		public static const LOAD_COMPLETE:String = "loadComplete";
		public static const EXCEL_READY:String = "excelReady";
	}
}
