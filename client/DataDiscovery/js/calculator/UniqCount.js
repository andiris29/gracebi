(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.calculator.UniqCount");

	var UniqCount = grace.calculator.UniqCount = function() {
		this._count = 0;
		this._mapping = {};
	};
	andrea.blink.extend(UniqCount, grace.calculator.supportClasses.ICalculator);

	UniqCount.prototype.addFactor = function(value) {
		if (!this._mapping[value]) {
			this._mapping[value] = true;
			this._count++;
		}
	};
	UniqCount.prototype.calculate = function() {
		return this._count;
	};
})();
