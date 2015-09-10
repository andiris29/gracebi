(function() {
	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.actions.ChangeDataProviderAction");

	var ColumnType = sap.viz.container.grace.constants.ColumnType;
	var AppConst = sap.viz.container.grace.constants.AppConst;
	var DataProviderType = vc.grace.constants.DataProviderType;
	var DataProvider = vc.grace.models.DataProvider;
	var Column = vc.grace.models.Column;

	var ChangeDataProviderAction = vc.grace.actions.ChangeDataProviderAction = function() {
		ChangeDataProviderAction.superclass.constructor.apply(this, arguments);
	};
	vc.extend(ChangeDataProviderAction, vc.common.mvc.Action);

	ChangeDataProviderAction.prototype.execute = function(parameters) {
		ChangeDataProviderAction.superclass.execute.apply(this, arguments);

		var graceModel = this._getModel(AppConst.MODEL_GRACE);
		var dp = new DataProvider();

		if (parameters.type === DataProviderType.ROW_BASED) {
			var rowBasedDP = parameters.dataProvider
			var idToName = parameters.idToName;
			var columnID;
			var column;
			if (rowBasedDP.length > 0) {
				var row0 = rowBasedDP[0];

				for (columnID in row0) {
					dp.datas[columnID] = [];

					column = new Column();
					column.id = columnID;
					column.name = idToName[columnID];
					if (columnID.indexOf("dim_") === 0 || isNaN(row0[columnID])) {
						column.type = ColumnType.DIMENSION;
					} else {
						column.type = ColumnType.MEASURE;
					}
					dp.columns.push(column);
					dp.idToColumn[columnID] = column;
				}

				for (var i = rowBasedDP.length - 1; i >= 0; i--) {
					for (var j = dp.columns.length - 1; j >= 0; j--) {
						var row = rowBasedDP[i];
						columnID = dp.columns[j].id;
						var columnType = dp.columns[j].type;

						var data = row[columnID];
						if (columnType === ColumnType.DIMENSION) {
							dp.datas[columnID][i] = data;
						} else if (columnType === ColumnType.MEASURE) {
							if (isNaN(data)) {
								dp.datas[columnID][i] = 0;
							} else {
								dp.datas[columnID][i] = Number(data);
							}
						}
					}
				}
			}
		}

		graceModel.dataProvider = dp;
		// Send notification
		this._notify(AppConst.NOTIFICATION_DATA_PROVIDER_CHANGED);
	};
})();
