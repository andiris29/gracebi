(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.filter.IFilter");

    var IFilter = grace.filter.IFilter = function() {
    };
    IFilter.prototype.filter = function(value) {
        return false;
    };
})();
