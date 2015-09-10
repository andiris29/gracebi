(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.models.value.supportClasses.QuantifiedHelper");

    var DateValue = grace.models.value.DateValue;
    var NumberValue = grace.models.value.NumberValue;

    var QuantifiedHelper = grace.models.value.supportClasses.QuantifiedHelper = {};

    QuantifiedHelper.TYPE_DATE = 'quantified_typeDate';
    QuantifiedHelper.TYPE_NUMBER = 'quantified_typeNumber';

    QuantifiedHelper.fromQuantified = function(type, quantified) {
        if (type === QuantifiedHelper.TYPE_DATE) {
            var d = new Date();
            d.setTime(quantified);
            return new DateValue(quantified.toString(), d);
        } else if (type === QuantifiedHelper.TYPE_NUMBER) {
            return new NumberValue(quantified.toString(), quantified);
        }
    };
})();
