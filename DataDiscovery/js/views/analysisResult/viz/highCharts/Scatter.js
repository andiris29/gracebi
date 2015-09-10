(function($) {
    var grace = andrea.grace;

    var HighChartsOption = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption;
    var VizType = grace.constants.VizType;

    /**
     * chartType: column, bar, line, area
     * vizType
     */
    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.Scatter");
    var Scatter = grace.views.analysisResult.viz.highCharts.Scatter = function(dom, chartType, vizType) {
        Scatter.superclass.constructor.apply(this, arguments);

        this._chartType = chartType;
        this._vizType = vizType;
    };
    andrea.blink.extend(Scatter, grace.views.analysisResult.viz.VizBase);

    Scatter.prototype.render = function(dataProvider, dimesions, datas) {
        Scatter.superclass.render.apply(this, arguments);

        var i, j;
        var highConfig = HighChartsOption.genMain(this._chartType);
        var dataSAs;
        if (this._vizType === VizType.SCATTER) {
            dataSAs = datas.slice(0, 2);
        } else if (this._vizType === VizType.BUBBLE) {
            dataSAs = datas.slice(0, 3);
        }
        var dataConfig;
        if (dimesions.length === 1) {
            dataConfig = HighChartsOption.dataConfig(dataProvider, null, dimesions[0], dataSAs);
        } else {
            dataConfig = HighChartsOption.dataConfig(dataProvider, dimesions[0], dimesions[1], dataSAs);
        }
        highConfig.xAxis = {
            "title" : {
                "text" : HighChartsOption.saToDisplay(datas[0])
            },
            'startOnTick' : true,
            'endOnTick' : true
        };
        highConfig.yAxis = {};
        if (datas.length > 1) {
            highConfig.yAxis.title = {
                "text" : HighChartsOption.saToDisplay(datas[1])
            }
        }
        var pointFormat;
        var array = [];
        if (dimesions.length === 1) {
            array.push('<b>' + HighChartsOption.saToDisplayAbbr(dimesions[0]) + ': </b>{point.name}');
        } else if (dimesions.length === 2) {
            array.push('<b>' + HighChartsOption.saToDisplayAbbr(dimesions[0]) + ': </b>{series.name}');
            array.push('<b>' + HighChartsOption.saToDisplayAbbr(dimesions[1]) + ': </b>{point.name}');
        }
        array.push('    ' + HighChartsOption.saToDisplayAbbr(datas[0]) + ': {point.x}');
        if (datas.length > 1) {
            array.push('    ' + HighChartsOption.saToDisplayAbbr(datas[1]) + ': {point.y}');
        }
        if (datas.length > 2) {
            array.push('    ' + HighChartsOption.saToDisplayAbbr(datas[2]) + ': {point.z}');
        }
        pointFormat = array.join("<br/>");
        var headerFormat;        headerFormat = '';
        // TODO Merge to tooltip
        highConfig.plotOptions = {
            "series" : {
                "tooltip" : {
                    "pointFormat" : pointFormat,
                    "headerFormat" : headerFormat
                }
            }
        };
        highConfig.tooltip = {
            hideDelay : 240
        };
        // Edit the common data config
        var highSeries;
        var highSeriesData;
        var highPoint;
        // Combine serieses, remove category
        // s*n, c*m, d*1 -> s*n, d*m
        highSeries = [];
        for ( i = 0; i < dataConfig.series.length; i++) {
            var s = dataConfig.series[i];
            var categories = s.data;
            highSeriesData = [];
            for ( j = 0; j < categories.length; j++) {
                var c = categories[j]
                var d = c.data;
                highPoint = {
                    'name' : c.name,
                    'x' : d[0],
                    'y' : d[1] != null ? d[1] : 1,
                    'z' : d[2] != null ? d[2] : 1
                }
                highSeriesData.push(highPoint);
            }
            highSeries.push({
                'name' : s.name,
                'data' : highSeriesData
            })
        }
        highConfig.series = highSeries;        var multiSeries = highConfig.series.length > 1;
        highConfig = _.defaults(highConfig, HighChartsOption.genLegend(multiSeries));

        if (highConfig.series.length > 50 || (highConfig.series.length * highConfig.series[0].data.length > 1000)) {
            this._addMessage('W001');

            var _this = this;
            _.delay(function() {
                $(_this._dom).highcharts(highConfig);
                this._removeMessages();
            }, 300);
        } else {
            $(this._dom).highcharts(highConfig);
        }
    }
})(jQuery);
