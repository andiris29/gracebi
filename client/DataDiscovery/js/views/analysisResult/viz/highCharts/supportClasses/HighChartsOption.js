(function() {
    var grace = andrea.grace;

    var OperationGroup = grace.operation.OperationGroup;
    var ValueQuery = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.ValueQuery;

    andrea.blink.declare("andrea.grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption");
    var HighChartsOption = andrea.grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption;

    HighChartsOption.genMain = function(chartType) {
        return {
            chart : {
                type : chartType
            },
            title : {
                text : null
            },
            credits : {
                enabled : false
            }

        }
    }
    HighChartsOption.genLegend = function(enabled) {
        var legend = null;
        if (enabled) {
            legend = {
                layout : 'vertical',
                align : 'left',
                verticalAlign : 'middle'
            }
        } else {
            legend = {
                "enabled" : false
            }
        }
        return {
            "legend" : legend
        }
    }
    HighChartsOption._visualize = function(analyses, index) {
        var sa/*ShelvedAnalysis*/ = null;
        if (index < analyses.length) {
            sa = analyses[index];
            sa.visualized = true;
        }
        return sa;
    }
    HighChartsOption._setVisualized = function(shelvedAnalyses) {
        if (!shelvedAnalyses) {
            return;
        }
        if (!_.isArray(shelvedAnalyses)) {
            shelvedAnalyses = [shelvedAnalyses];
        }
        for (var i = 0; i < shelvedAnalyses.length; i++) {
            var sa = shelvedAnalyses[i];
            sa.visualized = true;
        }
    }
    /**
     *
     */
    HighChartsOption.dataConfig = function(dataProvider, seriesSA, categorySA, dataSAs, isSeriesByDatas, turboThreshold) {
        var i, d, f;
        var og/*OperationGroup*/;
        var sa;
        // Series, category, data index/length
        var si, ci, di;
        var sl, cl, dl;
        // ValueQuery for series, category
        var sq, cq;
        // For data sort
        var sortByData;
        // function(values, indexDataSA)
        var querySeriesIndex;
        // function(values)
        var queryCategoryIndex;

        // Rinse operations
        var ogs = [];
        var sortOperations = [];
        var prepareRinseOperation = function(og) {
            ogs.push(og);

            sortOperations.push(og.ascend());
            sortOperations.push(og.descend());
        }
        if (seriesSA) {
            prepareRinseOperation(seriesSA.operationGroup);
        }
        if (categorySA) {
            prepareRinseOperation(categorySA.operationGroup);
        }
        for ( di = 0; di < dataSAs.length; di++) {
            prepareRinseOperation(dataSAs[0].operationGroup);
        }
        sortOperations = _.without(sortOperations, undefined);
        sortOperations.sort(function(o1, o2) {
            return o1.priority - o2.priority;
        })
        sortOperations.pop();
        _.each(ogs, function(og) {
            _.each(sortOperations, function(o) {
                og.removeOperation(o.id);
            });
        });
        // Series
        if (!seriesSA) {
            if (isSeriesByDatas) {
                querySeriesIndex = function(values, indexDataSA) {
                    return indexDataSA;
                }
                sl = dataSAs.length;
                dl = 1;
            } else {
                querySeriesIndex = function(values, indexDataSA) {
                    return 0;
                }
                sl = 1;
                dl = dataSAs.length;
            }
        } else {
            sq = new ValueQuery(dataProvider, seriesSA, turboThreshold);
            querySeriesIndex = function(values, indexDataSA) {
                return sq.queryIndex(values);
            }
            sl = sq.names().length;
            dl = dataSAs.length;
        }
        // Category
        if (!categorySA) {
            queryCategoryIndex = function(values) {
                return 0;
            }
            cl = 1;
        } else {
            cq = new ValueQuery(dataProvider, categorySA, turboThreshold);
            queryCategoryIndex = function(values) {
                return cq.queryIndex(values);
            }
            cl = cq.names().length;
        }

        // Data for highcharts
        var highSeries = [];
        // Prepare
        for ( si = 0; si < sl; si++) {
            highSeries[si] = {
                "name" : isSeriesByDatas ? HighChartsOption.saToDisplay(dataSAs[si]) : ( sq ? sq.names()[si] : HighChartsOption.saToDisplay(dataSAs[0])),
                "data" : []
            };
            for ( ci = 0; ci < cl; ci++) {
                highSeries[si].data[ci] = {
                    "name" : cq ? cq.names()[ci] : "",
                    "data" : []
                };
                for ( di = 0; di < dl; di++) {
                    d = isSeriesByDatas ? si : di;
                    og = dataSAs[d].operationGroup;
                    highSeries[si].data[ci].data[di] = og.calculator();
                    if (!sortByData && (og.ascend() || og.descend())) {
                        sortByData = {
                            'si' : si,
                            'di' : di,
                            'ascend' : og.ascend()
                        }
                    }
                }
            }
        }

        // Query
        for ( i = 0; i < dataProvider.numRows; i++) {
            var values = dataProvider.getRValues(i);

            // Set
            for ( d = 0; d < dataSAs.length; d++) {
                si = querySeriesIndex(values, d);
                ci = queryCategoryIndex(values);
                di = isSeriesByDatas ? 0 : d;
                if (si === -1 || ci === -1 || di === -1) {
                    continue;
                }
                highSeries[si].data[ci].data[di].addFactor(values[dataSAs[d].source.index].value());
            }
        }
        // Calculate
        var allPositive = true;
        for ( si = 0; si < sl; si++) {
            for ( ci = 0; ci < cl; ci++) {
                for ( di = 0; di < dl; di++) {
                    var calculate = highSeries[si].data[ci].data[di].calculate();
                    highSeries[si].data[ci].data[di] = calculate;
                    allPositive = allPositive && calculate >= 0;
                }
            }
        }

        // Set config
        var config = {
            'allPositive' : allPositive
        };
        if (cq) {
            config.categories = cq.names();
        }
        config.series = highSeries;

        // Apply data sort
        if (sortByData && config.categories) {
            // Array to objects
            var objects = [];
            for ( i = 0; i < cl; i++) {
                o = {
                    'category' : config.categories[i],
                    'series' : []
                };
                for ( si = 0; si < config.series.length; si++) {
                    o.series[si] = config.series[si].data[i];
                }
                objects.push(o);
            }
            // Sort
            objects.sort(function(o1, o2) {
                return o1.series[sortByData.si].data[sortByData.di] - o2.series[sortByData.si].data[sortByData.di];
            });
            if (!sortByData.ascend) {
                objects.reverse();
            }
            // Clear old
            config.categories = [];
            for ( si = 0; si < config.series.length; si++) {
                config.series[si].data = [];
            }
            // Set new, objects to array
            for ( i = 0; i < cl; i++) {
                o = objects[i];
                config.categories.push(o.category);
                for ( si = 0; si < config.series.length; si++) {
                    config.series[si].data.push(o.series[si]);
                }
            }
        }
        return config;
    };

    HighChartsOption.OPERATION_DISPLAY_SPLITTER = " | ";
    // HighChartsOption.OPERATION_DISPLAY_CONNECTIOR = " - ";
    HighChartsOption.OPERATION_DISPLAY_SPLITTER_ABBR = "|";
    // HighChartsOption.OPERATION_DISPLAY_CONNECTIOR_ABBR = "-";

    HighChartsOption.saToDisplay = function(sa) {
        var name = sa.operationGroup.mapNames().join(HighChartsOption.OPERATION_DISPLAY_SPLITTER);
        if (name) {
            return sa.source.name + ' (' + name + ')';
        } else {
            return sa.source.name;
        }
    }
    HighChartsOption.saToDisplayAbbr = function(sa) {
        var abbr = sa.operationGroup.mapAbbrs().join(HighChartsOption.OPERATION_DISPLAY_SPLITTER_ABBR);
        if (abbr) {
            return sa.source.name + '(' + abbr + ')';
        } else {
            return sa.source.name;
        }
    }
})();
