(function() {
    var grace = andrea.grace;
    andrea.blink.declare("andrea.grace.filter.TextFilter");

    var TextFilter = grace.filter.TextFilter = function(optionValues, nullable) {
        var options = this._options = {};
        _.each(optionValues, function(value) {
            options[value.caption()] = true;
        });

        this.nullable = nullable;
    };
    andrea.blink.extend(TextFilter, grace.filter.IFilter);

    TextFilter.prototype.type = function() {
        return 'TextFilter';
    };
    /**
     *
     * @param {Object} value
     * @return The result of filter
     * 	true: use normally
     * 	false: will be skip
     */
    TextFilter.prototype.filter = function(value) {
        return this._options[value.caption()];
    };

    TextFilter.prototype.addOption = function(value) {
        this._options[value.caption()] = true;
    };
    TextFilter.prototype.removeOption = function(value) {
        this._options[value.caption()] = false;
    };

    TextFilter.toJSON = function(instance) {
        return {
            'type' : instance.type(),
            'options' : instance._options,
            'nullable' : instance.nullable
        };
    };
    TextFilter.fromJSON = function(json) {
        var instance = new TextFilter([], json.quantifiedType);
        instance._options = json.options;
        return instance;
    };
})();
