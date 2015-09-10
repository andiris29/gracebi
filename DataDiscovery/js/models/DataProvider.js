(function($) {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.models.DataProvider");

    /**
     *
     */
    var DataProvider = grace.models.DataProvider = function(values2d) {
        this._values2d/*Array.<Array.<*>>*/ = values2d;
        this.numRows = 0;
        this.numColumns = 0;
        this._columnBasedValues2d/*Array.<Array.<*>>*/ = null;
        this._columnBasedUniqueValues2d/*Array.<Array.<*>>*/ = null;

        this._build();
    };
    andrea.blink.extend(DataProvider, andrea.blink.mvc.Model);

    DataProvider.prototype.getRow = function(index) {
        return this._values2d[index];
    };

    DataProvider.prototype._build = function() {
        var i, j;
        var values;

        var cbUVMapping = [];

        this._columnBasedValues2d = [];
        this._columnBasedUniqueValues2d = [];

        this.numRows = this._values2d.length;
        this.numColumns = this._values2d[0].length;

        values = this.getRow(0);
        for ( j = 0; j < values.length; j++) {
            this._columnBasedValues2d[j] = [];
            this._columnBasedUniqueValues2d[j] = [];
            cbUVMapping[j] = [];
        }
        for ( i = 0; i < this.numRows; i++) {
            values = this.getRow(i);
            for ( j = 0; j < values.length; j++) {
                var v = values[j];
                this._columnBasedValues2d[j].push(v);
                if (!cbUVMapping[j][v]) {
                    cbUVMapping[j][v] = true;
                    this._columnBasedUniqueValues2d[j].push(v);
                }
            }
        }
    };
    DataProvider.prototype.getCValues = function(columnIndex) {
        return _.clone(this._columnBasedValues2d[columnIndex]);
    };
    DataProvider.prototype.getCUniqueValues = function(columnIndex) {
        // TODO Work with drill/group operation
        return _.clone(this._columnBasedUniqueValues2d[columnIndex]);
    };
    DataProvider.prototype.getCUniqueValuesBySA = function(sa) {
        return this.getCUniqueValues(sa.source.index);
    };
})(jQuery);
