(function() {
	var vc = sap.viz.container;

	vc.declare("sap.viz.container.grace.calculator.CalculatorType");

	var CalculatorType = vc.grace.calculator.CalculatorType;

	CalculatorType.SUM = "SUM";
	CalculatorType.MAX = "MAX";
	CalculatorType.AVG = "AVG";
	// TODO

	CalculatorType.format = function(name, type) {
		if (type) {
			return name + "(" + type + ")";
		} else {
			return name;
		}
	}
})();
