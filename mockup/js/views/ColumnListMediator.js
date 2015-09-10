(function($) {

	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.views.ColumnListMediator");

	var AppConst = vc.grace.constants.AppConst;
	var DataProviderType = vc.grace.constants.DataProviderType;
	var ColumnType = sap.viz.container.grace.constants.ColumnType;
	/**
	 * App Mediator.
	 */
	var ColumnListMediator = vc.grace.views.ColumnListMediator = function() {
		ColumnListMediator.superclass.constructor.apply(this, arguments);
	};

	vc.extend(ColumnListMediator, vc.grace.views.ColumnContainerMediatorBase);

	ColumnListMediator.prototype.init = function() {
		ColumnListMediator.superclass.init.apply(this, arguments);
	}

	ColumnListMediator.prototype._dataProviderChangedHandler = function() {
		ColumnListMediator.superclass._dataProviderChangedHandler.apply(this, arguments);

		var gm = this._getModel(AppConst.MODEL_GRACE);
		for (var i = 0; i < gm.dataProvider.columns.length; i++) {
			var column = gm.dataProvider.columns[i];
			if (column.type === ColumnType.DIMENSION) {
				this._view.appendColumn(column.id, column.name, column.type);
			}
		}
		// TODO refactor to sort column
		for (var i = 0; i < gm.dataProvider.columns.length; i++) {
			var column = gm.dataProvider.columns[i];
			if (column.type === ColumnType.MEASURE) {
				this._view.appendColumn(column.id, column.name, column.type);
			}
		}

	}
})(jQuery);
