(function() {
	var vc = sap.viz.container;
	vc.declare("sap.viz.container.grace.calculator.Max");

	var CalculatorType = vc.grace.calculator.CalculatorType;

	var Max = vc.grace.calculator.Max = function() {
		this._max = 0;

		this.type = CalculatorType.MAX;
	};
	Max.prototype.addMeasure = function(value) {
		if (!isNaN(value)) {
			this._max = Math.max(this._max, value);
		}
	};
	Max.prototype.calculate = function() {
		return this._max;
	};
})();
