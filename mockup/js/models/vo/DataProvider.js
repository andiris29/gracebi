(function($) {

	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.models.DataProvider");

	var ColumnContainerType = vc.grace.constants.ColumnContainerType;
	/**
	 * App Model host all widgets (including chart, cross table and other widget).
	 */
	var DataProvider = vc.grace.models.DataProvider = function() {
		this.columns = [];
		this.idToColumn = {};
		/**
		 * @object
		 *
		 * Column based data
		 * 	{
		 *	 columnID : []
		 * 	}
		 *
		 */
		this.datas = {};
	};

	DataProvider.prototype.getLength = function() {
		return this.datas[this.columns[0].id].length;
	}
})(jQuery);
