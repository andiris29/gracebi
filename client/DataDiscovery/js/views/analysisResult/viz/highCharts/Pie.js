(function($) {
    var grace = andrea.grace;

    var VizType = grace.constants.VizType;
    var HighChartsOption = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption;
    var CalculatorFactory = grace.calculator.supportClasses.CalculatorFactory;

    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.Pie");
    var Pie = grace.views.analysisResult.viz.highCharts.Pie = function(dom) {
        Pie.superclass.constructor.apply(this, [dom, 'pie', VizType.PIE]);
    };
    andrea.blink.extend(Pie, grace.views.analysisResult.viz.highCharts.HighChartsBase);

    Pie.prototype.dataConfigArgs = function(dataProvider, dimesionSAs, dataSAs) {
        var turboThreshold = grace.Settings.dataDiscovery.highcharts.turboThreshold.pie;
        return [dataProvider, null, dimesionSAs[0], dataSAs.slice(0, 1), false, turboThreshold];
    };
    Pie.prototype.completeHighConfig = function(highConfig, dataConfig, dataProvider, dimesionSAs, dataSAs) {
        highConfig.xAxis = {
            "title" : {
                "text" : dimesionSAs[0].source.name
            },
            "categories" : dataConfig.categories
        }
        // Edit the common data config
        for (var i = 0; i < dataConfig.series.length; i++) {
            var categories = dataConfig.series[i].data;
            for (var j = 0; j < categories.length; j++) {
                categories[j].y = categories[j].data[0];
            }
        }
        highConfig.series = dataConfig.series;

        highConfig.tooltip = {
            hideDelay : 240
        };        highConfig.plotOptions = {
            "series" : {
                "dataLabels" : {
                    "enabled" : true,
                    "formatter" : function() {
                        return '<b>' + this.point.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                    }
                }
            }
        };

        if (highConfig.series.length > 50) {
            this._addMessage('W001');

            var _this = this;
            _.delay(function() {
                // $(_this._dom).highcharts(highConfig);
                this._removeMessages();
            }, 300);
        } else {
            // $(this._dom).highcharts(highConfig);
        }
    }
})(jQuery);
