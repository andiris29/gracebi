(function($) {

	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.views.VizContainerMediator");

	var AppConst = vc.grace.constants.AppConst;
	var DataProviderType = vc.grace.constants.DataProviderType;
	var ColumnContainerEvent = vc.grace.views.events.ColumnContainerEvent;
	var ColumnType = vc.grace.constants.ColumnType;
	var CalculatorFactory = vc.grace.calculator.CalculatorFactory;
	var CalculatorType = vc.grace.calculator.CalculatorType;
	/**
	 * App Mediator.
	 */
	var VizContainerMediator = vc.grace.views.VizContainerMediator = function(view) {
		VizContainerMediator.superclass.constructor.apply(this, arguments);

		this._view = view;
	};

	vc.extend(VizContainerMediator, vc.common.mvc.ViewMediator);

	VizContainerMediator.prototype.init = function() {
		var _this = this;

		var invalidate = false;
		this._subscribe(AppConst.NOTIFICATION_SELECTED_COLUMNS_CHANGED, function(notification) {
			if (!invalidate) {
				setTimeout(function() {
					invalidate = false;
					_this._columnMetadatasChangedHandler(notification);
				}, 1000 / 24);
			}
			invalidate = true;
		});
		this._subscribe(AppConst.NOTIFICATION_DATA_PROVIDER_CHANGED, function(notification) {
			_this._dataProviderChangedHandler(notification);
		});
	}
	VizContainerMediator.prototype._dataProviderChangedHandler = function(notification) {
		this._view.removeAll();
	}
	/**
	 * @protected
	 */
	VizContainerMediator.prototype._columnMetadatasChangedHandler = function(notification) {
		var gm = this._getModel(AppConst.MODEL_GRACE);

		var markerColumns = [];
		var xAxisColumns = [];
		var yAxisColumns = [];
		var yAxisCalculators = [];

		var i, j;
		var metadata;
		var column;
		// X axis
		for ( i = 0; i < Math.min(gm.columnMetadatas.xAxis.length, 2); i++) {
			metadata = gm.columnMetadatas.xAxis[i];

			column = gm.getColumn(metadata.id);
			if (column.type === ColumnType.DIMENSION) {
				xAxisColumns.push(column);
			} else {
				// TODO
				console.log("column type error");
			}
		}
		// Marker
		for ( i = 0; i < Math.min(gm.columnMetadatas.marker.length, 1); i++) {
			metadata = gm.columnMetadatas.marker[i];

			column = gm.getColumn(metadata.id);
			if (column.type === ColumnType.DIMENSION) {
				markerColumns.push(column);
			} else {
				// TODO
				console.log("column type error");
			}
		}
		// Y axis
		for ( i = 0; i < Math.min(gm.columnMetadatas.yAxis.length, 3); i++) {
			metadata = gm.columnMetadatas.yAxis[i];

			column = gm.getColumn(metadata.id);
			if (column.type === ColumnType.MEASURE) {
				yAxisColumns.push(column);
				yAxisCalculators.push(CalculatorFactory.create(metadata.calculatorType));
			} else {
				// TODO
				console.log("column type error");
			}
		}
		var dp = gm.dataProvider;
		var length = dp.getLength();

		// analysisAxis
		var aa = [];
		if (xAxisColumns.length > 0) {
			aa.push(this._genAA(xAxisColumns, 1))
		}
		if (markerColumns.length > 0) {
			aa.push(this._genAA(markerColumns, 2))
		}
		// measureValuesGroup
		var mvg = [];
		if (yAxisColumns.length > 0) {
			mvg = this._genMVG(yAxisColumns, yAxisCalculators);
		}
		// TODO Validate the columns count

		// Traversal data
		var xAxisDistincts = {};
		var xAxisDistinct = null;
		var xAxisIndex = 0;

		var markerDistinct = {};
		var markerIndex = 0;

		for ( i = 0; i < length; i++) {
			// X axis
			xAxisDistinct = xAxisDistincts;
			for ( j = 0; j < xAxisColumns.length; j++) {
				column = xAxisColumns[j];
				value = dp.datas[column.id][i];
				if (xAxisDistinct[value] == null) {
					if (j === xAxisColumns.length - 1) {
						xAxisDistinct[value] = aa[0].data[0].values.length;

						for ( k = 0; k < xAxisColumns.length; k++) {
							aa[0].data[k].values.push(dp.datas[xAxisColumns[k].id][i]);
						}
					} else {
						xAxisDistinct[value] = {};
					}
				}
				if (j === xAxisColumns.length - 1) {
					xAxisIndex = xAxisDistinct[value];
				}

				xAxisDistinct = xAxisDistinct[value];
			}
			// Marker
			for ( j = 0; j < markerColumns.length; j++) {
				column = markerColumns[j];
				value = dp.datas[column.id][i];
				if (markerDistinct[value] == null) {
					markerDistinct[value] = aa[1].data[0].values.length;
					aa[1].data[0].values.push(value);
				}
				markerIndex = markerDistinct[value];
			}
			// Y Axis
			for ( j = 0; j < yAxisColumns.length; j++) {
				column = yAxisColumns[j];
				var calculator = yAxisCalculators[j];
				value = dp.datas[column.id][i];

				if (!mvg[j].data[0].values[markerIndex]) {
					mvg[j].data[0].values[markerIndex] = [];
				}
				if (!mvg[j].data[0].values[markerIndex][xAxisIndex]) {
					mvg[j].data[0].values[markerIndex][xAxisIndex] = CalculatorFactory.create(calculator.type);
				}
				mvg[j].data[0].values[markerIndex][xAxisIndex].addMeasure(value);
			}
		}
		// Truncate
		var maxAA0 = 200;
		var maxAA1 = 35;
		var truncatedAA0 = false;
		var truncatedAA1 = false;
		if (aa.length == 2) {
			if (aa[1].data[0].values.length > maxAA1) {
				truncatedAA1 = true;
				aa[1].data[0].values.splice(maxAA1);
				for ( i = 0; i < mvg[0].data.length; i++) {
					mvg[0].data[i].values.splice(maxAA1);
				}
			}
		}

		if (aa[0].data[0].values.length > maxAA0) {
			truncatedAA0 = true;
			for ( i = 0; i < aa[0].data.length; i++) {
				aa[0].data[i].values.splice(maxAA0);
			}
			for ( i = 0; i < mvg.length; i++) {
				for ( j = 0; j < mvg[i].data[0].values.length; j++) {
					mvg[i].data[0].values[j].splice(maxAA0);
				}
			}
		}
		// Calculte
		for ( i = 0; i < yAxisColumns.length; i++) {
			var values = mvg[i].data[0].values;
			for ( j = 0; j < (aa.length > 1 ? aa[1].data[0].values.length : 1); j++) {
				for ( k = 0; k < aa[0].data[0].values.length; k++) {
					if (!values[j]) {
						values[j] = [];
					}
					if (!values[j][k]) {
						values[j][k] = 0;
					} else {
						values[j][k] = values[j][k].calculate();
					}
				}
			}
		}

		// TODO Sort dimensions by x axis

		// Update
		this._view.changeViz({
			data : {
				"analysisAxis" : aa,
				"measureValuesGroup" : mvg
			}
		});
		// TODO Update chart title for truncatedAA0, truncatedAA1	}
	VizContainerMediator.prototype._genAA = function(columns, index) {
		var aa = null;

		var aaData = null;
		for (var i = 0; i < columns.length; i++) {
			var column = columns[i];
			if (i === 0) {
				aaData = [];
				aa = {
					"index" : index,
					"data" : aaData
				}
			}
			aaData.push({
				"type" : "Dimension",
				"name" : column.name,
				"values" : []
			});
		}
		return aa;
	}
	VizContainerMediator.prototype._genMVG = function(columns, calculators) {
		var mvg = [];

		var mv = null;
		var mvData = null;
		for (var i = 0; i < columns.length; i++) {
			var column = columns[i];
			var calculator = calculators[i];			mvData = [];
			mv = {
				"index" : i + 1,
				"data" : mvData
			}			mvData.push({
				"type" : "Measure",
				"name" : CalculatorType.format(column.name, calculator.type),
				"values" : []
			});

			mvg.push(mv);
		}
		return mvg;
	}
	VizContainerMediator._VIZ_CAPACITY = {
		// [aa1, aa2, m]
		"viz/column" : [[1, 2], [0, 1], [1, 1]],
		"viz/stacked_column" : [[1, 2], [0, 1], [1, 1]],
		"viz/dual_column" : [[1, 2], [0, 1], [2, 2]],
		"viz/3d_column" : [[1, 2], [0, 1], [1, 1]],
		"viz/line" : [[1, 2], [0, 1], [1, 1]],
		"viz/area" : [[1, 2], [0, 1], [1, 1]],
		// "viz/combination" :
		"viz/dual_line" : [[1, 2], [0, 1], [2, 2]],
		"viz/dual_combination" : [[1, 2], [0, 1], [2, 2]],
		"viz/pie" : [[1, 2], [0, 0], [1, 1]],
		"viz/donut" : [[1, 2], [0, 0], [1, 1]],
		"viz/pie_with_depth" : [[1, 2], [0, 0], [2, 2]],
		// "viz/geobubble"
		// "viz/choropleth"
		// "viz/geopie"
		"viz/scatter" : [[1, 2], [0, 1], [2, 2]],
		"viz/bubble" : [[1, 2], [0, 1], [3, 3]],
		// "viz/scatter_matrix"
		"viz/treemap" : [[1, 2], [0, 0], [1, 2]],
		"viz/heatmap" : [[1, 2], [0, 0], [1, 2]],
		// "viz/table"
		"viz/radar" : [[2, 2], [0, 1], [1, 1]],
		// "viz/boxplot"
		// "viz/waterfall"
		"viz/tagcloud" : [[1, 1], [0, 0], [1, 2]],
	};
})(jQuery);
