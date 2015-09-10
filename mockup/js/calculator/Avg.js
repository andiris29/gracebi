(function() {
	var vc = sap.viz.container;
	vc.declare("sap.viz.container.grace.calculator.Avg");

	var CalculatorType = vc.grace.calculator.CalculatorType;
	var Avg = vc.grace.calculator.Avg = function() {
		this._sumTimes100 = 0;
		this._count = 0;

		this.type = CalculatorType.AVG;
	};

	Avg.prototype.addMeasure = function(value) {
		if (!isNaN(value)) {
			this._sumTimes100 += Math.round(value * 100);
		}
		this._count++;
	};
	Avg.prototype.calculate = function() {
		return Math.round(this._sumTimes100 / this._count) / 100;
	};
})();
