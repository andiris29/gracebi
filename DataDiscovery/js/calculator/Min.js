(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.calculator.Min");

	var Min = grace.calculator.Min = function() {
		this._max = Number.MAX_VALUE;
	};
	andrea.blink.extend(Min, grace.calculator.supportClasses.ICalculator);

	Min.prototype.addFactor = function(value) {
		if (!isNaN(value)) {
			this._max = Math.min(this._max, value);
		}
	};
	Min.prototype.calculate = function() {
		return this._max;
	};
})();
