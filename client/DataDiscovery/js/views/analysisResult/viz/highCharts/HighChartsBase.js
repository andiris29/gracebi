(function($) {
    var grace = andrea.grace;

    var HighChartsOption = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption;
    var VizType = grace.constants.VizType;
    var VizBase = grace.views.analysisResult.viz.VizBase;

    /**
     * chartType: column, bar, line, area
     * vizType:
     */
    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.HighChartsBase");
    var HighChartsBase = grace.views.analysisResult.viz.highCharts.HighChartsBase = function(dom, chartType, vizType) {
        HighChartsBase.superclass.constructor.apply(this, arguments);

        this._chartType = chartType;
        this._vizType = vizType;
    };
    andrea.blink.extend(HighChartsBase, VizBase);

    HighChartsBase.prototype.highConfig = function() {
        return HighChartsOption.genMain(this._chartType);
    };
    HighChartsBase.prototype._setVisualized = function(dataProvider, seriesSA, categorySA, dataSAs, isSeriesByDatas) {
        // Set visualized
        HighChartsOption._setVisualized(seriesSA);
        HighChartsOption._setVisualized(categorySA);
        HighChartsOption._setVisualized(dataSAs);
    };
    HighChartsBase.prototype.render = function(dataProvider, dimesionSAs, dataSAs) {
        var highConfig = HighChartsOption.genMain(this._chartType);

        // Get data config args
        var dataConfigArgs = {
            'array' : this.dataConfigArgs(dataProvider, dimesionSAs, dataSAs)
        };
        var toObject = function(dataProvider, seriesSA, categorySA, dataSAs, isSeriesByDatas, turboThreshold) {
            dataConfigArgs.object = {
                'dataProvider' : dataProvider,
                'seriesSA' : seriesSA,
                'categorySA' : categorySA,
                'dataSAs' : dataSAs,
                'isSeriesByDatas' : isSeriesByDatas,
                'turboThreshold' : turboThreshold
            }
        }
        toObject.apply(this, dataConfigArgs.array);
        // Set visualized
        this._setVisualized.apply(this, dataConfigArgs.array);
        // Check outdate
        var outdate = HighChartsBase.checkOutdate(this._vizType, dataConfigArgs);
        if (!outdate.render) {
            return false;
        }
        // Data config
        var dataConfig = HighChartsOption.dataConfig.apply(null, dataConfigArgs.array);
        // High config
        this.completeHighConfig(highConfig, dataConfig, dataProvider, dimesionSAs, dataSAs);

        highConfig.plotOptions = highConfig.plotOptions || {};
        highConfig.plotOptions.series = highConfig.plotOptions.series || {};
        highConfig.plotOptions.series.turboThreshold = dataConfigArgs.object.turboThreshold;
        highConfig.plotOptions.series.stickyTracking = false;
        if (!outdate.animation) {
            highConfig.plotOptions.series.animation = false;
        }
        if (dataConfig.allPositive) {
            highConfig.xAxis = highConfig.xAxis || {};
            highConfig.xAxis.min = 0;
            if (!highConfig.yAxis) {
                highConfig.yAxis = {};
                highConfig.yAxis.min = 0;
            } else {
                for (var i = 0; i < highConfig.yAxis.length; i++) {
                    highConfig.yAxis[i].min = 0;
                }
            }
        }
        $(this._dom).highcharts(highConfig);
        return true;
    };
    HighChartsBase.prototype.dataConfigArgs = function(dataProvider, dimesionSAs, dataSAs) {
    };
    HighChartsBase.prototype.completeHighConfig = function(highConfig, dataConfig, dataProvider, dimesionSAs, dataSAs) {
    };
    HighChartsBase.checkOutdate = function(vizType, dataConfigArgs) {        var clone = function(value) {
            if (value != null) {
                return JSON.parse(JSON.stringify(value));
            } else {
                return null;
            }
        }        var current = {
            'vizType' : vizType,
            'numRows' : dataConfigArgs.object.dataProvider.numRows,
            'seriesSA' : clone(dataConfigArgs.object.seriesSA),
            'categorySA' : clone(dataConfigArgs.object.categorySA),
            'dataSAs' : clone(dataConfigArgs.object.dataSAs),
            'isSeriesByDatas' : dataConfigArgs.object.isSeriesByDatas
        };
        var cache = VizBase._renderingCache;
        var outdate;
        if (!cache) {
            outdate = {
                'render' : true,
                'animation' : true
            }
        } else if (!_.isEqual(cache, current)) {
            outdate = {
                'render' : true,
                'animation' : cache.numRows === current.numRows
            }
        } else {
            outdate = {
                'render' : false
            };
        }
        if (outdate.render) {
            VizBase._renderingCache = current;
        }
        return outdate;
    };
})(jQuery);

