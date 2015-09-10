(function($) {
	var grace = andrea.grace;

	var HighChartsOption = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption;
	var VizType = grace.constants.VizType;

	/**
	 * chartType: column, bar, line, area
	 * vizType:
	 */
	andrea.blink.declare('andrea.grace.views.analysisResult.viz.highCharts.BasicXY');
	var BasicXY = grace.views.analysisResult.viz.highCharts.BasicXY = function(dom, chartType, vizType) {
		BasicXY.superclass.constructor.apply(this, arguments);

		this._chartType = chartType;
		this._vizType = vizType;

		this._isSeriesByDatas = false;
	};
	andrea.blink.extend(BasicXY, grace.views.analysisResult.viz.highCharts.HighChartsBase);

	BasicXY.prototype.dataConfigArgs = function(dataProvider, dimesionSAs, dataSAs) {
		var dataSAs;
		var turboThreshold = grace.Settings.dataDiscovery.highcharts.turboThreshold.xy;
		if (dimesionSAs.length > 1) {
			dataSAs = dataSAs.slice(0, 1);
			return [dataProvider, dimesionSAs[1], dimesionSAs[0], dataSAs, this._isSeriesByDatas, turboThreshold];
		} else {
			dataSAs = dataSAs;
			this._isSeriesByDatas = true;
			return [dataProvider, null, dimesionSAs[0], dataSAs, this._isSeriesByDatas, turboThreshold];
		}
	};
	BasicXY.prototype.completeHighConfig = function(highConfig, dataConfig, dataProvider, dimesionSAs, dataSAs) {
		highConfig.xAxis = {};
		if (dimesionSAs && dimesionSAs[0]) {
			highConfig.xAxis.title = {
				'text' : HighChartsOption.saToDisplayAbbr(dimesionSAs[0])
			};
		} else {
			highConfig.xAxis.title = {
				'text' : null
			};
		}
		if (dataConfig.categories) {
			highConfig.xAxis.categories = dataConfig.categories;
			highConfig.xAxis.labels = {
				'rotation' : -45,
				'align' : 'right'
			};
		} else {
			highConfig.xAxis.categories = [''];
		}

		highConfig.yAxis = [];
		var genYAxis = function(dataSA) {
			var title;
			if (!dataSA) {
				title = null;
			} else if (this._vizType === VizType.RADAR) {
				title = null;
			} else {
				title = HighChartsOption.saToDisplay(dataSA);
			}
			return {
				'title' : {
					'text' : title
				}
			};
		};
		if (this._isSeriesByDatas) {
			for (var i = 0; i < dataSAs.length; i++) {
				var y = genYAxis.call(this, dataSAs[i]);
				y.opposite = i % 2 === 1;
				highConfig.yAxis.push(y);
			}
		} else {
			highConfig.yAxis.push(genYAxis.call(this, dataSAs.length === 1 ? dataSAs[0] : null));
		}

		// Edit the common data config
		for (var i = 0; i < dataConfig.series.length; i++) {
			var series = dataConfig.series[i];
			if (highConfig.yAxis.length === dataConfig.series.length) {
				series.yAxis = i;
			}
			var categories = series.data;
			for (var j = 0; j < categories.length; j++) {
				categories[j].y = categories[j].data[0];
			}
		}
		highConfig.series = dataConfig.series;

		var multiSeries = highConfig.series.length > 1;
		highConfig = _.defaults(highConfig, HighChartsOption.genLegend(multiSeries));

		highConfig.tooltip = {
			headerFormat : '<span style="font-size:10px">{point.key}</span><table>',
			footerFormat : '</table>',
			shared : this._isSeriesByDatas,
			useHTML : true,
			hideDelay : 240
		};
		if (multiSeries) {
			highConfig.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' + '<td style="padding:0"><b>{point.y}</b></td></tr>';
		} else {
			highConfig.tooltip.pointFormat = '<tr>' + '<td style="padding:0"><b>{point.y}</b></td></tr>';
		}
		if (this._vizType) {
			if (this._vizType === VizType.RADAR) {
				highConfig.chart.polar = true;
				highConfig.xAxis.labels = {
					'rotation' : 0,
					'align' : 'center'
				};
			} else if (this._vizType === VizType.STACKED_BAR || this._vizType === VizType.STACKED_COLUMN) {
				highConfig.plotOptions = {
					'series' : {
						'stacking' : 'normal'
					}
				};
			}
		}

		var sl = highConfig.series.length;
		var cl = sl > 0 ? highConfig.series[0].data.length : 0;
		var minSize;
		var sizeProp;
		if (VizType.horizontal(this._vizType)) {
			sizeProp = 'width';
		} else if (VizType.vertical(this._vizType)) {
			sizeProp = 'height';
		}
		if (this._vizType === VizType.BAR || this._vizType === VizType.COLUMN) {
			minSize = sl * cl * 12;
		} else if (this._vizType === VizType.STACKED_BAR || this._vizType === VizType.STACKED_COLUMN) {
			minSize = cl * 18;
		} else if (this._vizType === VizType.LINE || this._vizType === VizType.AREA) {
			minSize = sl * 6;
		}
		if (sizeProp && minSize > this._$dom[sizeProp]()) {
			this._$dom[sizeProp](minSize);
			this._$highcharts[sizeProp](minSize);
		}
	};
})(jQuery);
