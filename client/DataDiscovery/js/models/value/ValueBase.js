(function() {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.models.value.ValueBase");
    // TODO Remove value param, Pass date temporary. Integrate with DataConvertUtil
    var ValueBase = grace.models.value.ValueBase = function(raw, value) {
        this._raw = raw;
        this._value = value;

        this._quantified = null;
        this._caption = null;
    };
    ValueBase.prototype.raw = function() {
        return this._raw;
    };
    ValueBase.prototype.value = function() {
        return this._value;
    };
    ValueBase.prototype.notNull = function() {
        return true;
    };
    ValueBase.prototype.quantified = function() {
        throw new Error('StringValue does not quantifiable.');
    };
    ValueBase.prototype.caption = function() {
    };
    ValueBase.prototype.toString = function() {
        return this._value.toString();
    };
})();
