(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.actions.ChangeDataProviderAction");

    var ConverterType = grace.utils.ConverterType;
    var ValueType = grace.constants.ValueType;
    var NullValue = grace.models.value.NullValue;
    var AnalysisType = andrea.grace.constants.AnalysisType;
    var AppConst = andrea.grace.constants.AppConst;
    var Analysis = grace.models.vo.Analysis;
    var DataProvider = grace.models.DataProvider;
    var DataConvertUtil = grace.utils.DataConvertUtil;
    var Stopwatch = grace.utils.Stopwatch;
    var Log = grace.managers.Log;

    var ChangeDataProviderAction = grace.actions.ChangeDataProviderAction = function() {
        ChangeDataProviderAction.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(ChangeDataProviderAction, andrea.blink.mvc.Action);

    ChangeDataProviderAction.prototype.execute = function(parameters) {
        ChangeDataProviderAction.superclass.execute.apply(this, arguments);

        var raw = {
            'columnDescriptors' : parameters.columnDescriptors,
            'rows' : parameters.rows,
            'source' : parameters.source
        };

        var i, j;
        var fromExcel = raw.source === 'excel';
        var columnDescriptors = raw.columnDescriptors;
        var rows = raw.rows;
        var numRows = rows.length;
        var numColumns = columnDescriptors.length;

        Log.interaction('parseColumnRows', [numColumns, numRows].join(','));
        if (numRows === 0) {
            return;
        }

        var watch = new Stopwatch([numColumns, numRows].join(','), true);
        // Parse columnDescriptors
        var analyses = [];
        for ( j = 0; j < numColumns; j++) {
            var c = columnDescriptors[j];
            var a/*Analysis*/ = new Analysis(c.id);
            a.index = j;
            a.name = c.name;
            a.analysisType = c.analysisType;
            analyses[j] = a;
        }
        // Parse rows
        var values2d = [];
        var values = null;
        var value = null;
        var valueTypeCandidates = [];
        /**
         * For static {
         *  fn
         * }
         *
         * For dynamic {
         *  numByType
         *  numTotal
         * }
         */
        var converter;
        for ( i = numRows - 1; i >= 0; i--) {
            values2d[i] = [];
            var row = rows[i];
            for ( j = numColumns - 1; j >= 0; j--) {
                var cell/*String*/ = row[j];

                converter = valueTypeCandidates[j];
                if (!converter) {
                    valueTypeCandidates[j] = converter = {
                        'numByType' : {
                        }
                    };
                    converter.numByType[ConverterType.ANY] = 0;
                }

                // Convert raw to value
                var type = columnDescriptors[j].converterType;
                if (type) {
                    // Explicit data type, eg: data from server
                    if (cell != null) {
                        if (!converter.fn) {
                            converter.fn = DataConvertUtil.getConverter(type);
                        }
                        value = converter.fn.call(null, cell);
                    } else {
                        value = NullValue.instance();
                        type = ConverterType.ANY;
                    }
                } else {
                    // Non-explicit data type, eg: data from csv, excel
                    var tryExcelDate = fromExcel;
                    if (converter.numByType && converter.numByType[ConverterType.NUMBER] && converter.numByType[ConverterType.NUMBER] > 3) {
                        tryExcelDate = false;
                    }
                    var match = DataConvertUtil.match(cell, tryExcelDate);
                    type = match.type;
                    value = match.value;
                }
                if (!converter.numByType[type]) {
                    converter.numByType[type] = 0;
                }
                converter.numByType[type]++;

                values2d[i][j] = value;
            }
        }
        Log.performance('parseDataProvider', [watch.type, 'parse', watch.lap()].join(','));

        // Rinse
        for ( j = 0; j < numColumns; j++) {
            a = analyses[j];
            if (!a.name) {
                a.name = "列" + (j + 1);
            }
            // Set valueType
            if (!a.valueType()) {
                var allMatching = false;
                var allValidMatching = false;
                var majorConvertType = null;
                converter = valueTypeCandidates[j];
                if (converter.numByType) {
                    for (type in converter.numByType) {
                        var numOfType = converter.numByType[type];
                        var numOfAny = converter.numByType[ConverterType.ANY];

                        if (numOfType / numRows === 1) {
                            allMatching = true;
                        }
                        if (type === ConverterType.ANY) {
                            continue;
                        }
                        // Set data type when numOfType is greater than 50%
                        if (numOfType / (numRows - numOfAny) > .5) {
                            if (type === ConverterType.EXCEL_DATE || type === ConverterType.DATE) {
                                a.valueType(ValueType.DATE);
                            } else if (type === ConverterType.NUMBER) {
                                a.valueType(ValueType.NUMBER);
                            } else if (type === ConverterType.STRING) {
                                a.valueType(ValueType.STRING);
                            }
                            // Check valid matching
                            if (!allMatching) {
                                majorConvertType = type;
                                if ((numOfType + numOfAny) / numRows === 1) {
                                    allValidMatching = true;
                                }
                            }
                            break;
                        }
                    }
                }
                if (!a.valueType()) {
                    a.valueType(ValueType.STRING);
                }
                if (!allMatching && majorConvertType) {
                    var fn = DataConvertUtil.getConverter(majorConvertType);
                    for ( i = numRows - 1; i >= 0; i--) {
                        cell = rows[i][j];
                        if (!cell || !allValidMatching) {
                            values2d[i][j] = fn.call(null, cell);
                        }
                    }
                } else {
                }
            }
            // Set valueType
            // Set analysisType
            if (!a.analysisType) {
                if (a.valueType() === ValueType.NUMBER) {
                    a.analysisType = AnalysisType.MEASURE;
                } else {
                    a.analysisType = AnalysisType.DIMENSION;
                }
            }
        }
        Log.performance('parseDataProvider', [watch.type, 'rinse', watch.lap()].join(','));

        // Set data provider and additional info in analysis
        var dp = new DataProvider(values2d);
        var parsedDimensions = [];
        var parsedMeasures = [];
        for ( j = 0; j < numColumns; j++) {
            a = analyses[j];

            // TODO Remove this property
            a.numUniqueValue = dp.getCValues(j, true, false).length;
            if (a.valueType() === ValueType.DATE) {
                var dates = _.sortBy(dp.getCValues(j, true, true), function(dv) {
                    return dv.quantified();
                });
                var from = dates[0];
                var to = dates[dates.length - 1];
                a.dateSpan = to.quantified() - from.quantified();
            }
            if (a.analysisType === AnalysisType.MEASURE) {
                parsedMeasures.push(a.name);
            } else if (a.analysisType === AnalysisType.DIMENSION) {
                parsedDimensions.push(a.name);
            }
        }

        var model = this._getModel(AppConst.MODEL_GRACE);
        model.setDataProvider(raw, analyses, dp);
        Log.performance('parseDataProvider', [watch.type, 'setDataProvider', watch.lap(true), watch.total()].join(','));

        Log.interaction('parsedDimensions', [parsedDimensions].join(','));
        Log.interaction('parsedMeasures', [parsedMeasures].join(','));
    };

})();
