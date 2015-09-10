(function() {
    var grace = andrea.grace;

    var ConverterType = grace.utils.ConverterType;

    andrea.blink.declare("andrea.grace.utils.DataConvertUtil");
    var DataConvertUtil = grace.utils.DataConvertUtil;

    DataConvertUtil.match = function(raw, tryExcel) {

        var value = null;
        var type = null;
        if (raw) {
            if (value === null) {
                value = DataConvertUtil._convertNumber(raw);
                // 1990/1/1 - 2030/12/31
                if (tryExcel && (value >= 32874 && value <= 47848 )) {
                    value = DataConvertUtil._convertExcelDate(raw);
                    type = ConverterType.EXCEL_DATE;
                } else {
                    type = ConverterType.NUMBER;
                }
            }
            if (value === null) {
                value = DataConvertUtil._convertDate(raw);
                type = ConverterType.DATE;
            }
            if (value === null) {
                value = DataConvertUtil._convertString(raw);
                type = ConverterType.STRING;
            }
        } else {
            type = ConverterType.ANY;
            value = null;
        }
        return {
            "type" : type,
            "value" : value
        };
    };
    DataConvertUtil.getConverter = function(type) {
        if (type === ConverterType.NUMBER) {
            return DataConvertUtil._convertNumber;
        } else if (type === ConverterType.DATE) {
            return DataConvertUtil._convertDate;
        } else if (type === ConverterType.EXCEL_DATE) {
            return DataConvertUtil._convertExcelDate;
        } else if (type === ConverterType.STRING) {
            return DataConvertUtil._convertString;
        } else {
            return null;
        }
    };
    /**
     *
     * @param {Object} raw
     */
    DataConvertUtil._convertString = function(raw) {
        if (raw != null) {
            return raw.toString().trim();
        } else {
            return '';
        }
    };
    /**
     *
     * @param {Object} raw
     */
    DataConvertUtil._convertNumber = function(raw) {
        if (raw != null) {
            var s = raw.toString().trim();
            if (!isNaN(s)) {
                return Number(s);
            } else {
                if (s.length > 1 && s.substr(s.length - 1, 1) === '%') {
                    s = s.substr(0, s.length - 1);
                    if (!isNaN(s)) {
                        return Number(s);
                    }
                }
            }
        } else {
            return 0;
        }
        return null;
    };
    /**
     *
     * @param {Object} raw
     */
    DataConvertUtil._convertDate = function(raw) {
        if (!raw) {
            return;
        }
        var s = raw.toString().trim();
        if (s.length < 6 || isNaN(s.substr(0, 1)) || isNaN(s.substr(s.length - 1, 1))) {
            return null;
        }
        s = s.replace(/[年月日_-]/g, "/");
        if (s.indexOf("/") === -1) {
            return null;
        }
        var formatHMS;
        if (s.indexOf(" ") !== -1) {
            if (s.indexOf(':') === -1) {
                return null;
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
        var formats = ConverterType.getDateFormats();
        for (var i = formats.length - 1; i >= 0 && !date; i--) {
            var test = formats[i];
            if (formatHMS) {
                test = test + ' ' + formatHMS;
            }
            date = Date.parseString(s, test);
            if (date) {
                DataConvertUtil._preferDateTest = test;
                // break;
            }
        }
        // console.log(date);
        return date;
    }
    DataConvertUtil._preferDateTest = null;

    /**
     *
     * @param {Object} raw
     */
    DataConvertUtil._convertExcelDate = function(raw) {
        if (!raw) {
            return;
        }
        var s = raw.toString().trim();
        if (isNaN(s))
            return null;
        excelTime = parseFloat(s);
        // Adjust excelTime overflow
        if (excelTime > DataConvertUtil._WRONG_DATE_IN_EXCEL_FORMAT)
            excelTime = excelTime - 1;

        var excelBaseMS = DataConvertUtil._EXCEL_BASE_TIME - DataConvertUtil._DAY_IN_MILLISECONDS;
        var dateMSUTC = excelBaseMS + excelTime * DataConvertUtil._DAY_IN_MILLISECONDS;

        var date = new Date();
        date.setTime(dateMSUTC + DataConvertUtil._getTimezoneOffsetMS());
        return date;
    };
    // Date.UTC(1900, 0);
    DataConvertUtil._EXCEL_BASE_TIME = -2208988800000;
    // February 29th 1900, There is no "February 29" in 1900, wrong set in Excel Date
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
