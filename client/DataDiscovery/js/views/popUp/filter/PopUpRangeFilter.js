(function($) {
    var grace = andrea.grace;

    var FilterEvent = grace.views.popUp.filter.FilterEvent;

    andrea.blink.declare('andrea.grace.views.popUp.filter.PopUpRangeFilter');
    var PopUpRangeFilter = grace.views.popUp.filter.PopUpRangeFilter = function(dom, dataProvider) {
        PopUpRangeFilter.superclass.constructor.apply(this, arguments);

        this._$dom.addClass('grace-range-filter');
        this._classVisible = 'grace-range-filter-visible';
        this._dataProvider = dataProvider;

        this._itemSelectRequested = false;
    };
    andrea.blink.extend(PopUpRangeFilter, grace.views.popUp.HoverPopUpBase);

    PopUpRangeFilter.create = function(dataProvider) {
        var filter = new PopUpRangeFilter($('<div/>')[0], dataProvider);
        filter._createChildren();
        return filter;
    };
    PopUpRangeFilter.prototype.close = function(delay) {
        if (this._itemSelectRequested) {
            this.dispatchEvent(new FilterEvent(FilterEvent.ITEM_SELECTED, this));
        }
        PopUpRangeFilter.superclass.close.apply(this, arguments);
    };
    PopUpRangeFilter.prototype._createChildren = function() {
        var _this = this;
        var dp = this._dataProvider;
        // Labe
        var $label = $('<div/>').addClass('grace-range-filter-label');
        $label.appendTo(this._$dom);
        // Silder
        var $slider = $('<div/>').addClass('grace-range-filter-slider');
        var $sliderUI = $('<div/>').slider({
            range : true,
            min : dp.from(),
            max : dp.to(),
            values : [dp.min(), dp.max()],
            slide : function(event, ui) {
                dp.min(ui.values[0]);
                dp.max(ui.values[1]);
                validateLabel(true);
                itemSelected();
            }
        }).appendTo($slider);
        $slider.appendTo(this._$dom);
        // Update label
        _this._itemSelectRequested = false;
        var itemSelected = function() {
            if (!_this._itemSelectRequested) {
                _this._itemSelectRequested = true;
                _.delay(function() {
                    _this._itemSelectRequested = false;
                    _this.dispatchEvent(new FilterEvent(FilterEvent.ITEM_SELECTED, _this));
                }, 300);
            }
        }
        var validateLabel = function() {
            $label.text([dp.getMinCaption(), dp.getMaxCaption()].join(' - '));
        }
        validateLabel(false);
        // Update model
    }
})(jQuery);
