(function() {
	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.views.ui.ColumnXAxis");

	var ColumnType = vc.grace.constants.ColumnType;
	var ColumnContainerType = vc.grace.constants.ColumnContainerType;

	var ColumnXAxis = vc.grace.views.ui.ColumnXAxis = function(dom) {
		ColumnXAxis.superclass.constructor.apply(this, arguments);

		this._type = ColumnContainerType.X_AXIS;

		var div = $('<div style="display: inline-block;"><div/>').appendTo(this._divHeader)
		div.append('<span class="ui-button-icon-primary ui-icon ui-icon-bullet" style="float: left;"></span>');
		div.append('<span class="ui-button-text" style="float: left;">维度*1~2(X 轴)</span>');

		$(this._ul).css({
			"height" : 60 + "px"
		});
	};
	sap.viz.container.extend(ColumnXAxis, vc.grace.views.ui.ColumnContainerBase);
})();
