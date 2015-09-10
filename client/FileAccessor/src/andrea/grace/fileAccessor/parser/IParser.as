package andrea.grace.fileAccessor.parser {

	public interface IParser {
		function set target(value:*):void;
		function parse():void;

		function get rawValues2d():Array;
		function get columnDescriptors():Array;
	}
}
