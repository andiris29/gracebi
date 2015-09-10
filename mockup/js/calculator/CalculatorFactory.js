(function() {
	var vc = sap.viz.container;
	vc.declare("sap.viz.container.grace.calculator.CalculatorFactory");

	var CalculatorType = vc.grace.calculator.CalculatorType;

	var CalculatorFactory = vc.grace.calculator.CalculatorFactory;

	CalculatorFactory.create = function(type) {
		if (type === CalculatorType.SUM) {
			return new vc.grace.calculator.Sum();
		} else if (type === CalculatorType.MAX) {
			return new vc.grace.calculator.Max();
		} else if (type === CalculatorType.AVG) {
			return new vc.grace.calculator.Avg();
		}
	}
})();
