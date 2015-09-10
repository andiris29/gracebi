(function() {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.models.value.BooleanValue");
    var BooleanValue = grace.models.value.BooleanValue = function(raw, value) {
        BooleanValue.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(BooleanValue, andrea.grace.models.value.ValueBase);

    BooleanValue._falseInstance = new BooleanValue(false, false);
    BooleanValue._trueInstance = new BooleanValue(true, true);

    BooleanValue.falseInstance = function() {
        return BooleanValue._falseInstance;
    }
    BooleanValue.trueInstance = function() {
        return BooleanValue._trueInstance;
    }

    BooleanValue.prototype.caption = function() {
        if (this._value) {
            return '是';
        } else {
            return '否';
        }
    };
})();
