(function() {
	var grace = andrea.grace;

	andrea.blink.declare('andrea.grace.utils.ConverterType');

	var ConverterType = grace.utils.ConverterType;

	ConverterType.ANY = 'any';

	ConverterType.BOOLEAN = 'boolean';
	ConverterType.STRING = 'string';
	ConverterType.NUMBER = 'number';
	ConverterType.DATE_IN_EXCEL = 'dataInExcel';
	ConverterType.DATE_IN_TEXT = 'dateInText';
	ConverterType.DATE_IN_MS = 'dateInMS';

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
	};
	ConverterType._monthFormats = (function() {
		var array = [];
		array.push('yyyy/M');
		array.push('yy/M');
		array.reverse();
		return array;
	})();
	ConverterType.getMonthFormats = function() {
		return ConverterType._monthFormats;
	};
})();
