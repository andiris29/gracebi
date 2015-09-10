package dataFileParsers {

	public interface IParser {
		function set raw(value:*):void;
		function parse():void;

		function get rawValues2d():Array;
		function get columnDescriptors():Array;
	}
}
