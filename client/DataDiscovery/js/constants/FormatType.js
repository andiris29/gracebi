(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.constants.FormatType");
    var FormatType = grace.constants.FormatType;

    FormatType.NONE = "none";
    FormatType.NUMBER = 'number';

    FormatType.DATE_YYYYMMDD = 'yyyy/MM/dd';
    FormatType.DATE_YYYYMD = 'yyyy/M/d';
    FormatType.DATE_YYMMDD = 'yy/MM/dd';
    FormatType.DATE_YYMD = 'yy/M/d';
    FormatType.DATE_MMDDYYYY = 'MM/dd/yyyy';
    FormatType.DATE_MDYYYY = 'M/d/yyyy';
    FormatType.DATE_MMDDYY = 'MM/dd/yy';
    FormatType.DATE_MDYY = 'M/d/yy';

    FormatType.EXCEL_DATE = 'excelDate';

    FormatType.DATE_FORMATS = (function() {
        var array = [];
        array.push(FormatType.DATE_YYYYMMDD);
        array.push(FormatType.DATE_YYYYMD);
        array.push(FormatType.DATE_YYMMDD);
        array.push(FormatType.DATE_YYMD);
        array.push(FormatType.DATE_MMDDYYYY);
        array.push(FormatType.DATE_MDYYYY);
        array.push(FormatType.DATE_MMDDYY);
        array.push(FormatType.DATE_MDYY);
        array.reverse();
        return array;
    })();
})();
