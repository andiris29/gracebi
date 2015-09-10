(function() {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.models.value.NullValue");
    var NullValue = grace.models.value.NullValue = function(raw, value) {
        NullValue.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(NullValue, andrea.grace.models.value.ValueBase);

    NullValue._instance = new NullValue();
    NullValue.instance = function() {
        return NullValue._instance;
    }

    NullValue.prototype.notNull = function() {
        return false;
    };
    NullValue.prototype.quantified = function() {
        return 0;
    };
    NullValue.prototype.caption = function() {
        return '{空值}';
    };
    NullValue.prototype.toString = function() {
        return '';
    };
})();
