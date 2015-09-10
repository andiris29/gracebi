package iris.excelas.expose {

	public interface IRow {
		function get numCells():int;
		function get minCellIndex():int;
		function get maxCellIndex():int;

		function getCellByIndex(index:int):ICell;
	}
}
