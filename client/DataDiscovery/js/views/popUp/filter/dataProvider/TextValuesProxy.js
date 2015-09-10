(function($) {
    var grace = andrea.grace;
    var NullValue = grace.models.value.NullValue;

    andrea.blink.declare('andrea.grace.views.popUp.filter.dataProvider.TextValuesProxy');
    var TextValuesProxy = grace.views.popUp.filter.dataProvider.TextValuesProxy = function(filter, values, hasNull) {
        this.filter = filter
        // For checkbox list
        this._dp = _.sortBy(values, function(v) {
            return v.caption();
        });
        // For null checkbox
        this._hasNull = hasNull;
    };
    TextValuesProxy.prototype.checked = function(v, checked) {
        if (arguments.length > 1) {
            if (checked) {
                this.filter.addOption(v);
            } else {
                this.filter.removeOption(v);
            }
        } else {
            return this.filter.filter(v);
        }
    }
    TextValuesProxy.prototype.length = function() {
        return this._dp.length;
    };
    TextValuesProxy.prototype.getItemAt = function(i) {
        return this._dp[i];
    };
    TextValuesProxy.prototype.getCaption = function(item) {
        return item.caption();
    };
    TextValuesProxy.prototype.getNullItem = function() {
        if (this._hasNull) {
            NullValue.instance();
        } else {
            return null;
        }
    };
})(jQuery);
