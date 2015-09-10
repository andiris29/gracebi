(function($) {

	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.models.GraceModel");

	var ColumnContainerType = vc.grace.constants.ColumnContainerType;
	/**
	 * App Model host all widgets (including chart, cross table and other widget).
	 */
	var GraceModel = vc.grace.models.GraceModel = function() {
		GraceModel.superclass.constructor.apply(this, arguments);

		this.dataProvider = null;

		/**
		 * {
		 * 	id
		 * 	calculator
		 * }
		 */
		this.columnMetadatas = {
			xAxis : [],
			yAxis : [],
			marker : []
		}
	};
	vc.extend(GraceModel, vc.common.mvc.Model);

	GraceModel.prototype.updateSelectedColumns = function(type, columnMetadatas) {
		if (type === ColumnContainerType.LIST) {
		} else if (type === ColumnContainerType.X_AXIS) {
			this.columnMetadatas.xAxis = columnMetadatas;
		} else if (type === ColumnContainerType.Y_AXIS) {
			this.columnMetadatas.yAxis = columnMetadatas;
		} else if (type === ColumnContainerType.MARKER) {
			this.columnMetadatas.marker = columnMetadatas;
		}
	};
	GraceModel.prototype.getColumn = function(id) {
		return this.dataProvider.idToColumn[id];
	}
})(jQuery);
