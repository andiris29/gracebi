package iris.excelas.expose {

	public interface ISheet {
		function get numRows():int;
		function get minRowIndex():int;
		function get maxRowIndex():int;
		
		function getRowByIndex(index:int):IRow;
	}
}
