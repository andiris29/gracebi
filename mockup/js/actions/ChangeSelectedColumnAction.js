(function() {
	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.actions.ChangeSelectedColumnAction");

	var ColumnType = sap.viz.container.grace.constants.ColumnType;
	var AppConst = sap.viz.container.grace.constants.AppConst;
	var DataProviderType = vc.grace.constants.DataProviderType;
	var ColumnContainerType = vc.grace.constants.ColumnContainerType;

	var ChangeSelectedColumnAction = vc.grace.actions.ChangeSelectedColumnAction = function() {
		ChangeSelectedColumnAction.superclass.constructor.apply(this, arguments);
	};
	vc.extend(ChangeSelectedColumnAction, vc.common.mvc.Action);

	ChangeSelectedColumnAction.prototype.execute = function(parameters) {
		ChangeSelectedColumnAction.superclass.execute.apply(this, arguments);

		var gm = this._getModel(AppConst.MODEL_GRACE);
		gm.updateSelectedColumns(parameters.type, parameters.columnMetadatas);

		// Send notification
		this._notify(AppConst.NOTIFICATION_SELECTED_COLUMNS_CHANGED);	};
})();
