(function() {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.models.value.NumberValue");
    var NumberValue = grace.models.value.NumberValue = function(raw, value) {
        NumberValue.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(NumberValue, andrea.grace.models.value.ValueBase);

    NumberValue.prototype.quantified = function() {
        return this._value;
    };
    NumberValue.prototype.caption = function() {
        if (this._caption === null) {
            var n = this._value;
            if (n != parseInt(n)) {
                this._caption = $.number(n, 2);
            } else {
                this._caption = $.number(n, 0);
            }
        }
        return this._caption;
    };
})();
