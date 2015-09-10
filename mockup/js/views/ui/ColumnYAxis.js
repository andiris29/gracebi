(function() {
	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.views.ui.ColumnYAxis");

	var ColumnType = vc.grace.constants.ColumnType;
	var ColumnContainerType = vc.grace.constants.ColumnContainerType;

	var ColumnYAxis = vc.grace.views.ui.ColumnYAxis = function(dom) {
		ColumnYAxis.superclass.constructor.apply(this, arguments);

		this._type = ColumnContainerType.Y_AXIS;

		var div = $('<div style="display: inline-block;"><div/>').appendTo(this._divHeader);
		div.append('<span class="ui-button-icon-primary ui-icon ui-icon-flag" style="float: left;"></span>');
		div.append('<span class="ui-button-text" style="float: left;">指标*1~3(Y 轴)</span>');

		$(this._ul).css({
			"height" : 90 + "px"
		});
	};
	sap.viz.container.extend(ColumnYAxis, vc.grace.views.ui.ColumnContainerBase);
})();
