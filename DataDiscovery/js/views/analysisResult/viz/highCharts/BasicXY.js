(function($) {
    var grace = andrea.grace;

    var HighChartsOption = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption;
    var VizType = grace.constants.VizType;

    /**
     * chartType: column, bar, line, area
     * vizType:
     */
    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.BasicXY");
    var BasicXY = grace.views.analysisResult.viz.highCharts.BasicXY = function(dom, chartType, vizType) {
        BasicXY.superclass.constructor.apply(this, arguments);

        this._chartType = chartType;
        this._vizType = vizType;
    };
    andrea.blink.extend(BasicXY, grace.views.analysisResult.viz.VizBase);

    BasicXY.prototype.render = function(dataProvider, dimesions, datas) {
        BasicXY.superclass.render.apply(this, arguments);

        var highConfig = HighChartsOption.genMain(this._chartType);        var dataConfig;
        var dataSAs;
        if (dimesions.length > 1) {
            dataSAs = datas.slice(0, 1);
            dataConfig = HighChartsOption.dataConfig(dataProvider, dimesions[1], dimesions[0], dataSAs);        } else {
            dataSAs = datas;
            dataConfig = HighChartsOption.dataConfig(dataProvider, null, dimesions[0], dataSAs, true);
        }
        highConfig.xAxis = {};
        if (dimesions && dimesions[0]) {
            highConfig.xAxis.title = {
                "text" : HighChartsOption.saToDisplayAbbr(dimesions[0])
            }
        } else {
            highConfig.xAxis.title = {
                "text" : null
            }
        }
        if (dataConfig.categories) {
            highConfig.xAxis.categories = dataConfig.categories;
            highConfig.xAxis.labels = {
                "rotation" : -45,
                "align" : 'right'
            }
        } else {
            highConfig.xAxis.categories = [""];
        }
        var genYAxis = function(title) {
            return {
                "title" : {
                    "text" : title
                },
                'min' : 0
            }
        }
        if (dataSAs.length === 1) {
            highConfig.yAxis = genYAxis(HighChartsOption.saToDisplay(datas[0]));
            // }
            // // TODO Move data to secodary axis
            // else if (dataSAs.length === 2) {
            // highConfig.yAxis = [genYAxis(datas[0]), genYAxis(datas[1])];
            // highConfig.yAxis[1].opposite = true;
        } else {
            highConfig.yAxis = genYAxis(null);
        }

        // Edit the common data config
        for (var i = 0; i < dataConfig.series.length; i++) {
            var categories = dataConfig.series[i].data;
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
            shared : true,
            useHTML : true,
            hideDelay : 240
        };
        if (multiSeries) {
            highConfig.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' + '<td style="padding:0"><b>{point.y}</b></td></tr>'
        } else {
            highConfig.tooltip.pointFormat = '<tr>' + '<td style="padding:0"><b>{point.y}</b></td></tr>'
        }
        if (this._vizType) {
            if (this._vizType === VizType.RADAR) {
                highConfig.chart.polar = true;
                highConfig.xAxis.labels = {
                    "rotation" : 0,
                    "align" : 'center'
                }
            } else if (this._vizType === VizType.STACKED_BAR || this._vizType === VizType.STACKED_COLUMN) {
                highConfig.plotOptions = {
                    "series" : {
                        "stacking" : 'normal'
                    }
                }
            }
        }

        var sl = highConfig.series.length;
        var cl = highConfig.series[0].data.length;
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
            minSize = cl * 16;
        } else if (this._vizType === VizType.LINE || this._vizType === VizType.AREA) {
            minSize = sl * cl * 4;
        }

        if (minSize > this._$dom[sizeProp]()) {
            this._$dom[sizeProp](minSize);
        }
        //
        $(this._dom).highcharts(highConfig);
    }
})(jQuery);
