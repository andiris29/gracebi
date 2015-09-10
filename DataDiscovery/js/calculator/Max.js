(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.calculator.Max");

	var Max = grace.calculator.Max = function() {
		this._max = 0;
	};
	andrea.blink.extend(Max, grace.calculator.supportClasses.ICalculator);

	Max.prototype.addFactor = function(value) {
		if (!isNaN(value)) {
			this._max = Math.max(this._max, value);
		}
	};
	Max.prototype.calculate = function() {
		return this._max;
	};
})();
