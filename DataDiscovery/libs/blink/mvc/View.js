(function() {

    var blink = andrea.blink;

    blink.declare("andrea.blink.mvc.View");

    var View = andrea.blink.mvc.View = function(dom) {
        View.superclass.constructor.apply(this, arguments);
        this.__className = "andrea.blink.mvc.View";

        this._dom = dom;
        this._$dom = $(dom);

        this._explicitWidth = null;
        this._explicitHeight = null;
        this._measuredWidth = 0;
        this._measuredHeight = 0;
    };

    blink.extend(andrea.blink.mvc.View, andrea.blink.events.EventDispatcher);

    View.prototype.dom = function() {
        return this._dom;
    };

    View.prototype.size = function(value) {
        if (arguments.length > 0) {
            var invalidate = false;
            if (value.width != null && this._explicitWidth !== value.width) {
                this._explicitWidth = value.width;
                invalidate = true;
            }
            if (value.height != null && this._explicitHeight !== value.height) {
                this._explicitHeight = value.height;
                invalidate = true;
            }
            if (invalidate) {
                this.invalidateSize();
            }
            return this;
        } else {
            if (this._explicitWidth == null || this._explicitHeight == null) {
                this._measuredWidth = $(this._dom).outerWidth();
                this._measuredHeight = $(this._dom).outerHeight();
            }
            return {
                width : this._explicitWidth != null ? this._explicitWidth : this._measuredWidth,
                height : this._explicitHeight != null ? this._explicitHeight : this._measuredHeight,
            }
        }
    };
    View.prototype.invalidateSize = function() {
        this._validateSize();
    };
    View.prototype._validateSize = function() {

    };
})();
