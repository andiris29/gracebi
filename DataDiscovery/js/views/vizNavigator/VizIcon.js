(function($) {
    var grace = andrea.grace;
    var VizIconEvent = grace.views.popUp.VizIconEvent;

    andrea.blink.declare("andrea.grace.views.vizNavigator.VizIcon");
    var VizIcon = grace.views.vizNavigator.VizIcon = function(dom, settings) {
        VizIcon.superclass.constructor.apply(this, arguments);

        this._$dom = $(this._dom);

        this._enabled = false;
        this._selected = false;

        this._data = settings.data;

        this._basicClass = settings.basicClass;
        this._enabledClass = settings.enabledClass;
        this._selectedClass = settings.selectedClass;
        // Initialize
        var _this = this;
        this._$dom.addClass(this._basicClass).click(function() {
            _this.dispatchEvent(new VizIconEvent(VizIconEvent.CLICK, _this));
        });

        if (this._data.icon) {
            this._$dom.css({
                'background-image' : 'url("' + this._data.icon + '")'
            });
        } else if (this._data.title) {
            this._$dom.text(this._data.title);
        }

        this._$dom.attr({
            'title' : this._data.title
        });
    };
    andrea.blink.extend(VizIcon, andrea.blink.mvc.View);

    VizIcon.prototype.type = function() {
        return this._data.type;
    };
    VizIcon.prototype.enabled = function(value) {
        if (arguments.length > 0) {
            if (this._enabled !== value) {
                this._enabled = value;

                if (this._enabled) {
                    if (!this.selected()) {
                        this._$dom.addClass(this._enabledClass);
                    } else {
                        this._$dom.removeClass(this._enabledClass);
                    }
                } else {
                    this._$dom.removeClass(this._enabledClass);
                }
            }
            return this;
        } else {
            return this._enabled;
        }
    };
    VizIcon.prototype.selected = function(value) {
        if (arguments.length > 0) {
            if (this._selected !== value) {
                this._selected = value;
                if (this._selected) {
                    this._$dom.addClass(this._selectedClass);
                    this._$dom.removeClass(this._enabledClass);
                } else {
                    this._$dom.removeClass(this._selectedClass);
                    if (this.enabled()) {
                        this._$dom.addClass(this._enabledClass);
                    }
                }
            }
            return this;
        } else {
            return this._selected;
        }
    };

    VizIcon.prototype.update = function(numDimensions, numMeasures) {
        var required = this._data.required;
        this.enabled(numDimensions >= required.numDimensions && numMeasures >= required.numMeasures);
    };
})(jQuery);
