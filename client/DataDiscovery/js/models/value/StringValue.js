(function() {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.models.value.StringValue");
    var StringValue = grace.models.value.StringValue = function(raw, value) {
        StringValue.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(StringValue, andrea.grace.models.value.ValueBase);

    StringValue.prototype.caption = function() {
        return this._value;
    };
})();
