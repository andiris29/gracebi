package andrea.iris.excelas.expose {
	import flash.events.IEventDispatcher;
	import flash.utils.IDataInput;

	public interface IExcel extends IEventDispatcher {
		function loadSynchronous(source:IDataInput):void;

		function get numSheets():int;
		function getSheetByIndex(index:int):ISheet;
	}
}
