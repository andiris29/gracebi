(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.actions.ChangeDataProviderAction");

    var ConverterType = grace.utils.ConverterType;
    var DataType = grace.constants.DataType;
    var AnalysisType = andrea.grace.constants.AnalysisType;
    var AppConst = andrea.grace.constants.AppConst;
    var Analysis = grace.models.vo.Analysis;
    var DataProvider = grace.models.DataProvider;
    var DataConvertUtil = grace.utils.DataConvertUtil;
    var Stopwatch = grace.utils.Stopwatch;

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

        var watch = new Stopwatch('ChangeDataProviderAction, ' + numRows + '*' + numColumns, true);
        // Parse columnDescriptors
        var analyses = [];
        for ( j = 0; j < numColumns; j++) {
            var a/*Analysis*/ = new Analysis();
            a.index = j;
            var c = columnDescriptors[j];
            a.name = c.name;
            a.analysisType = c.analysisType;
            analyses[j] = a;
        }
        // Parse rows
        var values2d = [];
        var values = null;
        var value = null;
        var dataTypeCandidates = [];
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

                converter = dataTypeCandidates[j];
                if (!converter) {
                    dataTypeCandidates[j] = converter = {
                        'numByType' : {
                        }
                    };
                    converter.       numByType[ConverterType.ANY] = 0;

                }

                // Convert raw to value
                var type = analyses[j].converterType;
                if (type) {
                    // Explicit data type, eg: data from server / excel
                    if (!converter.fn) {
                        converter.fn = DataConvertUtil.getConverter(type);
                    }
                    value = converter.fn.call(null, cell);
                } else {
                    // Non-explicit data type, eg: data from csv, excel
                    var tryExcelDate = fromExcel;
                    if (converter.numByType && converter.numByType[ConverterType.NUMBER] && converter.numByType[ConverterType.NUMBER] > 3) {
                        tryExcelDate = false;
                    }
                    var match = DataConvertUtil.match(cell, tryExcelDate);
                    type = match.type;
                    value = match.value;

                    if (!converter.numByType[type]) {
                        converter.numByType[type] = 0;
                    }
                    converter.numByType[type]++;                }
                values2d[i][j] = value;
            }
        }
        console.log('[' + watch.type + '] parse: ' + watch.lap());

        // Rinse
        for ( j = 0; j < numColumns; j++) {
            a = analyses[j];
            if (!a.name) {
                a.name = "列" + (j + 1);
            }
            // Set dataType
            if (!a.dataType) {
                var allMatching = false;
                var allValidMatching = false;
                var majorConvertType = null;
                converter = dataTypeCandidates[j];
                if (converter.numByType) {
                    for (type in converter.numByType) {
                        var numOfType = converter.numByType[type];
                        var numOfAny = converter.numByType[ConverterType.ANY];
                        if (type === ConverterType.ANY) {
                            continue;
                        }
                        if (numOfType / (numRows - numOfAny) > .5) {
                            if (type === ConverterType.EXCEL_DATE || type === ConverterType.DATE) {
                                a.dataType = DataType.DATE;
                            } else if (type === ConverterType.NUMBER) {
                                a.dataType = DataType.NUMBER;
                            } else if (type === ConverterType.STRING) {
                                a.dataType = DataType.STRING;
                            }
                            if (numOfType / numRows === 1) {
                                allMatching = true;
                            } else {
                                majorConvertType = type;
                                if ((numOfType + numOfAny) / numRows === 1) {
                                    allValidMatching = true;
                                }
                            }
                            break;
                        }
                    }
                }
                if (!a.dataType) {
                    a.dataType = DataType.STRING;
                }
                if (!allMatching) {
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
            // Set analysisType
            if (!a.analysisType) {
                if (a.dataType === DataType.NUMBER) {
                    a.analysisType = AnalysisType.MEASURE;
                } else {
                    a.analysisType = AnalysisType.DIMENSION;
                }
            }
        }
        console.log('[' + watch.type + '] rinse: ' + watch.lap());

        // Set data provider and additional info in analysis
        var dp = new DataProvider(values2d);
        for ( j = 0; j < numColumns; j++) {
            a = analyses[j];

            var cuv = dp.getCUniqueValues(j);
            a.numUniqueValue = cuv.length;
            if (a.dataType === DataType.DATE) {
                var cuv = _.without(cuv, null);
                var dates = _.sortBy(cuv, function(d) {
                    return d.getTime();
                });
                var from = dates[0];
                var to = dates[dates.length - 1];
                a.dateSpan = to.getTime() - from.getTime();
            }
        }

        var model = this._getModel(AppConst.MODEL_GRACE);
        model.setDataProvider(raw, analyses, dp);
        console.log('[' + watch.type + '] setDataProvider: ' + watch.lap());
    };

})();
