(function() {
	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.constants.ColumnType");

	var ColumnType = vc.grace.constants.ColumnType;

	ColumnType.DIMENSION = "dimension";
	ColumnType.MEASURE = "measure";

	ColumnType.getDetails = function(type) {
		var detail = {};
		if (type === ColumnType.DIMENSION) {
			detail.iconClass = "ui-icon-bullet";
		} else if (type === ColumnType.MEASURE) {
			detail.iconClass = "ui-icon-flag";
		}
		return detail;
	}
})();
