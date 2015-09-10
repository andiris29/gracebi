(function() {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.utils.ConverterType');

    var ConverterType = grace.utils.ConverterType;

    ConverterType.ANY = 'any';
    ConverterType.STRING = 'string';
    ConverterType.NUMBER = 'number';
    ConverterType.EXCEL_DATE = 'excelDate';
    ConverterType.DATE = 'date';

    ConverterType._dateFormats = (function() {
        var array = [];
        array.push('yyyy/MM/dd');
        array.push('yyyy/M/d');
        array.push('yy/MM/dd');
        array.push('yy/M/d');
        array.push('MM/dd/yyyy');
        array.push('M/d/yyyy');
        array.push('MM/dd/yy');
        array.push('M/d/yy');
        array.reverse();
        return array;
    })();
    ConverterType.getDateFormats = function() {
        return ConverterType._dateFormats;
    }
})();
