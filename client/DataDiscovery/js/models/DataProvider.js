(function($) {
    var grace = andrea.grace;

    var NullValue = grace.models.value.NullValue;

    /**
     *
     */
    andrea.blink.declare("andrea.grace.models.DataProvider");
    var DataProvider = grace.models.DataProvider = function(values2d) {
        this._values2d/*Array.<Array.<*>>*/ = values2d;
        this.numRows = 0;
        this.numColumns = 0;

        this._columnBased = null;

        this._build();
    };
    andrea.blink.extend(DataProvider, andrea.blink.mvc.Model);

    DataProvider.prototype._build = function() {
        var i, j;
        var values;

        var cbUVMapping = [];

        this._columnBased = {
            'values2d' : [],
            'uniqueValues2d' : [],
            'notNullValue2d' : [],
            'notNullUniqueValues2d' : [],
            'hasNull2d' : []
        };

        this.numRows = this._values2d.length;
        this.numColumns = this.numRows > 0 ? this._values2d[0].length : 0;

        for ( j = 0; j < this.numColumns; j++) {
            this._columnBased.values2d[j] = [];
            this._columnBased.uniqueValues2d[j] = [];
            this._columnBased.notNullValue2d[j] = [];
            this._columnBased.notNullUniqueValues2d[j] = [];
            this._columnBased.hasNull2d[j] = false;
            cbUVMapping[j] = [];
        }
        for ( i = 0; i < this.numRows; i++) {
            values = this.getRValues(i);
            for ( j = 0; j < this.numColumns; j++) {
                var v = values[j];
                var vs = v.toString();

                // Has null
                this._columnBased.hasNull2d[j] = this._columnBased.hasNull2d[j] || !v.notNull();
                // Values 2d
                this._columnBased.values2d[j].push(v);
                if (v.notNull()) {
                    this._columnBased.notNullValue2d[j].push(v);
                }
                if (!cbUVMapping[j][vs]) {
                    cbUVMapping[j][vs] = true;
                    if (v.notNull()) {
                        this._columnBased.uniqueValues2d[j].push(v);
                        this._columnBased.notNullUniqueValues2d[j].push(v);
                    }
                }
            }
        }
        for ( j = 0; j < this.numColumns; j++) {
            if (this._columnBased.hasNull2d[j]) {
                this._columnBased.uniqueValues2d[j].push(NullValue.instance());
            }
        }
    };
    DataProvider.prototype.getRValues = function(index) {
        return this._values2d[index];
    };
    DataProvider.prototype.getCValues = function(index, unique, notNull) {
        if (unique && notNull) {
            return this._columnBased.notNullUniqueValues2d[index];
        } else if (!unique && notNull) {
            return this._columnBased.notNullValue2d[index];
        } else if (unique && !notNull) {
            return this._columnBased.uniqueValues2d[index];
        } else if (!unique && !notNull) {
            return this._columnBased.values2d[index];
        }
    };
    DataProvider.prototype.isCHasNull = function(index) {
        return this._columnBased.hasNull2d[index];
    };
})(jQuery);
