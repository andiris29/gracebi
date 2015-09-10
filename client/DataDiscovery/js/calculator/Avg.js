(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.calculator.Avg");

    var Avg = grace.calculator.Avg = function() {
        this._sumAlternate = 0;
        this._count = 0;
    };
    andrea.blink.extend(Avg, grace.calculator.supportClasses.ICalculator);

    Avg.prototype.addFactor = function(value) {
        if (!isNaN(value)) {
            this._sumAlternate += Math.round(value * 1000000);
        }
        this._count++;
    };
    Avg.prototype.calculate = function() {
        if (this._count === 0) {
            return 0;
        } else {
            return Math.round(this._sumAlternate / this._count) / 1000000;
        }
    };
})();
