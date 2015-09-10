(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.calculator.Count");

	var Count = grace.calculator.Count = function() {
		this._count = 0;
	};
	andrea.blink.extend(Count, grace.calculator.supportClasses.ICalculator);

	Count.prototype.addFactor = function(value) {
		this._count++;
	};
	Count.prototype.calculate = function() {
		return this._count;
	};
})();
