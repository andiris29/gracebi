(function() {
    var grace = andrea.grace;

    var ConverterType = grace.utils.ConverterType;
    var DateValue = grace.models.value.DateValue;
    var NullValue = grace.models.value.NullValue;
    var BooleanValue = grace.models.value.BooleanValue;
    var NumberValue = grace.models.value.NumberValue;
    var StringValue = grace.models.value.StringValue;

    andrea.blink.declare('andrea.grace.utils.DataConvertUtil');
    var DataConvertUtil = grace.utils.DataConvertUtil;

    DataConvertUtil.match = function(raw, tryExcel) {
        var value = null;
        var type = null;
        if (raw) {
            value = DataConvertUtil._convertNumber(raw);
            // We can't identify a number or a date exactly in excel date format, so we narrow down the date range to
            // 1990/1/1 - 2030/12/31
            if (value.notNull()) {
                if (tryExcel && (value.value() >= 32874 && value.value() <= 47848 )) {
                    value = DataConvertUtil._convertDateInExcel(raw);
                    type = ConverterType.DATE_IN_EXCEL;
                } else {
                    type = ConverterType.NUMBER;
                }
            }
            if (!value.notNull()) {
                value = DataConvertUtil._convertDateInText(raw);
                type = ConverterType.DATE_IN_TEXT;
            }
            if (!value.notNull()) {
                value = DataConvertUtil._convertBoolean(raw);
                type = ConverterType.BOOLEAN;
            }
            if (!value.notNull()) {
                value = DataConvertUtil._convertString(raw);
                type = ConverterType.STRING;
            }
        } else {
            type = ConverterType.ANY;
            value = NullValue.instance();
        }
        return {
            'type' : type,
            'value' : value
        };
    };
    DataConvertUtil.getConverter = function(type, raw) {
        if (type === ConverterType.BOOLEAN) {
            return DataConvertUtil._convertBoolean;
        } else if (type === ConverterType.NUMBER) {
            return DataConvertUtil._convertNumber;
        } else if (type === ConverterType.DATE_IN_TEXT) {
            return DataConvertUtil._convertDateInText;
        } else if (type === ConverterType.DATE_IN_EXCEL) {
            return DataConvertUtil._convertDateInExcel;
        } else if (type === ConverterType.DATE_IN_MS) {
            return DataConvertUtil._convertDateInMS;
        } else if (type === ConverterType.STRING) {
            return DataConvertUtil._convertString;
        } else {
            return null;
        }
    };
    DataConvertUtil._convertString = function(raw) {
        if (raw != null) {
            return new StringValue(raw, _.str.trim(raw.toString()));
        } else {
            return NullValue.instance();
        }
    };
    DataConvertUtil._convertBoolean = function(raw) {
        if (raw === false) {
            return new BooleanValue.falseInstance();
        } else if (raw === true) {
            return new BooleanValue.trueInstance();
        } else {
            return NullValue.instance();
        }
    };

    DataConvertUtil._convertNumber = function(raw) {
        if (raw != null) {
            var s = _.str.trim(raw.toString());
            if (!isNaN(s)) {
                return new NumberValue(raw, Number(s));
            } else {
                if (s.length > 1 && s.substr(s.length - 1, 1) === '%') {
                    s = s.substr(0, s.length - 1);
                    if (!isNaN(s)) {
                        return new NumberValue(raw, Number(s));
                    }
                }
            }
        } else {
            return NullValue.instance();
        }
        return NullValue.instance();
    };

    DataConvertUtil._convertDateInMS = function(raw) {
        if (!raw) {
            return NullValue.instance();
        }
        return new DateValue(raw, new Date(raw));
    };
    /**
     *
     * @param {Object} raw
     */
    DataConvertUtil._convertDateInText = function(raw) {
        if (!raw) {
            return NullValue.instance();
        }
        var s = _.str.trim(raw.toString());
        if (s.length < 6 || isNaN(s.substr(0, 1)) || isNaN(s.substr(s.length - 1, 1))) {
            return NullValue.instance();
        }
        s = s.replace(/[年月日_-]/g, '/');
        if (s.indexOf('/') === -1) {
            return NullValue.instance();
        }
        var cache = DateValue.instance(raw);
        if (cache) {
            return cache;
        }
        var formatHMS;
        if (s.indexOf(' ') !== -1) {
            if (s.indexOf(':') === -1) {
                return NullValue.instance();
            } else {
                if (s.indexOf(':') === s.lastIndexOf(':')) {
                    formatHMS = 'H:m';
                } else {
                    formatHMS = 'H:m:s';
                }
            }
        }
        var date = null;
        if (DataConvertUtil._preferDateTest) {
            date = Date.parseString(s, DataConvertUtil._preferDateTest);
        }
        var formats;
        var parts = s.split('/');
        if (parts.length === 3) {
            formats = ConverterType.getDateFormats();
        } else if (parts.length === 2) {
            formats = ConverterType.getMonthFormats();
        }
        for (var i = formats.length - 1; i >= 0 && !date; i--) {
            var test = formats[i];
            if (formatHMS) {
                test = test + ' ' + formatHMS;
            }
            date = Date.parseString(s, test);
            if (date) {
                DataConvertUtil._preferDateTest = test;
                break;
            }
        }
        // console.log(date);
        if (date) {
            return new DateValue(raw, date);
        } else {
            return NullValue.instance();
        }
    };
    DataConvertUtil._preferDateTest = null;

    /**
     *
     * @param {Object} raw
     */
    DataConvertUtil._convertDateInExcel = function(raw) {
        if (!raw) {
            return NullValue.instance();
        }
        var s = _.str.trim(raw.toString());
        if (isNaN(s)) {
            return NullValue.instance();
        }
        var cache = DateValue.instance(raw);
        if (cache) {
            return cache;
        }

        excelTime = parseFloat(s);
        // Adjust excelTime overflow
        if (excelTime > DataConvertUtil._WRONG_DATE_IN_EXCEL_FORMAT)
            excelTime = excelTime - 1;

        var excelBaseMS = DataConvertUtil._EXCEL_BASE_TIME - DataConvertUtil._DAY_IN_MILLISECONDS;
        var dateMSUTC = excelBaseMS + excelTime * DataConvertUtil._DAY_IN_MILLISECONDS;

        var date = new Date();
        date.setTime(dateMSUTC + DataConvertUtil._getTimezoneOffsetMS());
        return new DateValue(raw, date);
    };
    // Date.UTC(1900, 0);
    DataConvertUtil._EXCEL_BASE_TIME = -2208988800000;
    // February 29th 1900, There is no 'February 29' in 1900, wrong set in Excel Date
    DataConvertUtil._WRONG_DATE_IN_EXCEL_FORMAT = 60;
    // milliseconds of 1 day, 24 * 60 * 60 * 1000
    DataConvertUtil._DAY_IN_MILLISECONDS = 86400000;

    DataConvertUtil._TIMEZONE_OFFSET_MS = 0;
    DataConvertUtil._createAndReadTimezoneOffset = function() {
        // Create
        DataConvertUtil._TIMEZONE_OFFSET_MS = new Date().getTimezoneOffset() * 60 * 1000;
        // Redirect the get method to Read
        DataConvertUtil._getTimezoneOffsetMS = DataConvertUtil._readTimezoneOffset;
        // Read
        return DataConvertUtil._readTimezoneOffset();
    };
    DataConvertUtil._readTimezoneOffset = function() {
        return DataConvertUtil._TIMEZONE_OFFSET_MS;
    };
    // Default get method is Write
    DataConvertUtil._getTimezoneOffsetMS = DataConvertUtil._createAndReadTimezoneOffset;
})();
