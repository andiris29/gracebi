(function() {
	var vc = sap.viz.container;
	vc.declare("sap.viz.container.grace.calculator.Sum");

	var CalculatorType = vc.grace.calculator.CalculatorType;
	var Sum = vc.grace.calculator.Sum = function() {
		this._sumTimes100 = 0;

		this.type = CalculatorType.SUM;
	};

	Sum.prototype.addMeasure = function(value) {
		if (!isNaN(value)) {
			this._sumTimes100 += Math.round(value * 100);
		}
	};
	Sum.prototype.calculate = function() {
		return this._sumTimes100 / 100;
	};
})();
