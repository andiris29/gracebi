(function($) {
    var grace = andrea.grace;

    var HighChartsOption = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption;
    var VizType = grace.constants.VizType;
    var ColorUtil = grace.utils.ColorUtil;

    /**
     * chartType: column, bar, line, area
     * vizType
     */
    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.Scatter");
    var Scatter = grace.views.analysisResult.viz.highCharts.Scatter = function(dom, chartType, vizType) {
        Scatter.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(Scatter, grace.views.analysisResult.viz.highCharts.HighChartsBase);

    Scatter.prototype.render = function(dataProvider, dimesionSAs, dataSAs) {
        if (dataSAs.length >= 3) {
            this._chartType = 'bubble'
        } else {
            this._chartType = 'scatter'
        }
        return Scatter.superclass.render.apply(this, arguments);
    };
    Scatter.prototype.dataConfigArgs = function(dataProvider, dimesionSAs, dataSAs) {
        dataSAs = dataSAs.slice(0, 3);
        var turboThreshold = grace.Settings.dataDiscovery.highcharts.turboThreshold.scatter;
        if (dimesionSAs.length === 1) {
            return [dataProvider, null, dimesionSAs[0], dataSAs, false, turboThreshold];
        } else {
            return [dataProvider, dimesionSAs[0], dimesionSAs[1], dataSAs, false, turboThreshold];
        }
    };
    Scatter.prototype.completeHighConfig = function(highConfig, dataConfig, dataProvider, dimesionSAs, dataSAs) {
        var i, j;
        highConfig.xAxis = {
            "title" : {
                "text" : HighChartsOption.saToDisplay(dataSAs[0])
            },
            'startOnTick' : true,
            'endOnTick' : true
        };
        highConfig.yAxis = {};
        var yTitle = dataSAs.length > 1 ? HighChartsOption.saToDisplay(dataSAs[1]) : null;
        highConfig.yAxis.title = {
            'text' : yTitle
        }
        highConfig.yAxis.labels = {
            'enabled' : yTitle !== null
        }

        var pointFormat;
        var array = [];
        if (dimesionSAs.length === 1) {
            array.push('<b>' + HighChartsOption.saToDisplayAbbr(dimesionSAs[0]) + ': </b>{point.name}');
        } else if (dimesionSAs.length === 2) {
            array.push('<b>' + HighChartsOption.saToDisplayAbbr(dimesionSAs[0]) + ': </b>{series.name}');
            array.push('<b>' + HighChartsOption.saToDisplayAbbr(dimesionSAs[1]) + ': </b>{point.name}');
        }
        array.push('    ' + HighChartsOption.saToDisplayAbbr(dataSAs[0]) + ': {point.x}');
        if (dataSAs.length > 1) {
            array.push('    ' + HighChartsOption.saToDisplayAbbr(dataSAs[1]) + ': {point.y}');
        }
        if (dataSAs.length > 2) {
            array.push('    ' + HighChartsOption.saToDisplayAbbr(dataSAs[2]) + ': {point.z}');
        }
        pointFormat = array.join("<br/>");
        var headerFormat;
        headerFormat = '';

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
        var colors = Highcharts.getOptions().colors;
        for ( i = 0; i < dataConfig.series.length; i++) {
            var s = dataConfig.series[i];
            var categories = s.data;
            highSeriesData = [];
            for ( j = 0; j < categories.length; j++) {
                var c = categories[j]
                var d = c.data;
                if (d.length === 1 && d[0] === 0) {
                    continue;
                } else if (d.length === 2 && d[0] === 0 && d[1] === 0) {
                    continue;
                } else if (d.length === 3 && d[0] === 0 && d[1] === 0 && d[2] === 0) {
                    continue;
                }
                highPoint = {
                    'name' : c.name,
                    'x' : d[0],
                    'y' : d[1] != null ? d[1] : 1,
                    'z' : d[2] != null ? d[2] : 1
                }
                highSeriesData.push(highPoint);
            }
            var rgb = ColorUtil.hexToRgb(colors[i % colors.length]);
            highSeries.push({
                'name' : s.name,
                'data' : highSeriesData,
                'color' : 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', .65)'
            })
        }
        highConfig.series = highSeries;

        var multiSeries = highConfig.series.length > 1;
        highConfig = _.defaults(highConfig, HighChartsOption.genLegend(multiSeries));

        if (highConfig.series.length > 50 || (highConfig.series.length * highConfig.series[0].data.length > 1000)) {
            this._addMessage('W001');

            _.delay($.proxy(function() {
                // $(this._dom).highcharts(highConfig);
                this._removeMessages();
            }, this), 300);
        } else {
            // $(this._dom).highcharts(highConfig);
        }
    }
})(jQuery);
