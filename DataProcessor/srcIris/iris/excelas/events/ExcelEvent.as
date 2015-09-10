package iris.excelas.events {
	import flash.events.Event;

	public class ExcelEvent extends Event {
		public function ExcelEvent(type:String) {
			super(type);
		}
		
		public static const UNZIP_COMPLETE:String = "unzipComplete";
		public static const EXCEL_READY:String = "excelReady";
	}
}
