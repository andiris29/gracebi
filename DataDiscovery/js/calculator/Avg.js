(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.calculator.Avg");

	var Avg = grace.calculator.Avg = function() {
		this._sumTimes100 = 0;
		this._count = 0;
	};
	andrea.blink.extend(Avg, grace.calculator.supportClasses.ICalculator);

	Avg.prototype.addFactor = function(value) {
		if (!isNaN(value)) {
			this._sumTimes100 += Math.round(value * 100);
		}
		this._count++;
	};
	Avg.prototype.calculate = function() {
		return Math.round(this._sumTimes100 / this._count) / 100;
	};
})();
