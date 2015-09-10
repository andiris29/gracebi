(function() {
	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.views.ui.ColumnList");

	var ColumnType = vc.grace.constants.ColumnType;
	var ColumnContainerType = vc.grace.constants.ColumnContainerType;

	var ColumnList = vc.grace.views.ui.ColumnList = function(dom) {
		ColumnList.superclass.constructor.apply(this, arguments);

		this._type = ColumnContainerType.LIST;

		var div = $('<div style="display: inline-block;"><div/>').appendTo(this._divHeader);
		div.append('<span class="ui-button-icon-primary ui-icon ui-icon-bullet" style="float: left;"></span>');
		div.append('<span class="ui-button-text" style="float: left; margin-right: 4px"">维度</span>');
		div.append('<span class="ui-button-icon-primary ui-icon ui-icon-flag" style="float: left;"></span>');
		div.append('<span class="ui-button-text" style="float: left;">指标</span>');

		$(this._ul).css({
			"height" : $(document).height() - 28 - 29 - 24 - 6 - 6 + "px"
		});
	};
	sap.viz.container.extend(ColumnList, vc.grace.views.ui.ColumnContainerBase);

})();
