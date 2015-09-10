(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.calculator.Sum");

	var Sum = grace.calculator.Sum = function() {
		this._sum = 0;
	};
	andrea.blink.extend(Sum, grace.calculator.supportClasses.ICalculator);

	Sum.prototype.addFactor = function(value) {
		value = parseFloat(value);
		if (!isNaN(value)) {
			this._sum = parseFloat((this._sum + value).toFixed(4));
		}
	};
	Sum.prototype.calculate = function() {
		return this._sum;
	};
})();
