(function() {
	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.views.ui.ColumnMarker");

	var ColumnType = vc.grace.constants.ColumnType;
	var ColumnContainerType = vc.grace.constants.ColumnContainerType;

	var ColumnMarker = vc.grace.views.ui.ColumnMarker = function(dom) {
		ColumnMarker.superclass.constructor.apply(this, arguments);

		this._type = ColumnContainerType.MARKER;

		var div = $('<div style="display: inline-block;"><div/>').appendTo(this._divHeader)
		div.append('<span class="ui-button-icon-primary ui-icon ui-icon-bullet" style="float: left;"></span>');
		div.append('<span class="ui-button-text" style="float: left;">维度*0~1(标记)</span>');

		$(this._ul).css({
			"height" : 60 + "px"
		});
	};
	sap.viz.container.extend(ColumnMarker, vc.grace.views.ui.ColumnContainerBase);
})();
