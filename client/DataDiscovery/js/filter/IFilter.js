(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.filter.IFilter");

    var IFilter = grace.filter.IFilter = function() {
    };
    IFilter.prototype.filter = function(value) {
        return false;
    };
    IFilter.prototype.type = function() {
        return undefined;
    };
    IFilter.toJSON = function(instance) {
        var type = instance.type();

        if (type === 'RangeFilter') {
            return grace.filter.RangeFilter.toJSON(instance);
        } else if (type === 'TextFilter') {
            return grace.filter.TextFilter.toJSON(instance);
        }
    };
    IFilter.fromJSON = function(json) {
        var type = json.type;

        if (type === 'RangeFilter') {
            return grace.filter.RangeFilter.fromJSON(json);
        } else if (type === 'TextFilter') {
            return grace.filter.TextFilter.fromJSON(json);
        }
    };
})();
