(function($) {
    var grace = andrea.grace;

    var FilterEvent = grace.views.popUp.filter.FilterEvent;

    andrea.blink.declare('andrea.grace.views.popUp.filter.PopUpTextFilter');
    var PopUpTextFilter = grace.views.popUp.filter.PopUpTextFilter = function(dom, dataProvider) {
        PopUpTextFilter.superclass.constructor.apply(this, arguments);
        this._$dom.addClass('grace-text-filter');
        this._classVisible = 'grace-text-filter-visible';
        this._dataProvider = dataProvider;
    };
    andrea.blink.extend(PopUpTextFilter, grace.views.popUp.HoverPopUpBase);

    PopUpTextFilter.create = function(dataProvider) {
        var filter = new PopUpTextFilter($('<div/>')[0], dataProvider);
        filter._createChildren();
        return filter;
    }

    PopUpTextFilter.prototype._createChildren = function() {
        var _this = this;
        var dp = this._dataProvider;

        var $ulAll = $('<ul/>').appendTo(this._$dom);

        var i;
        var value;

        var genLI = function(checked, text) {
            var $li = $('<li/>');
            var id = _.uniqueId('checkbox_');
            var $input = $('<input type="checkbox"/>').appendTo($li).attr({
                'id' : id,
                'checked' : checked
            });
            var $label = $('<label/>').appendTo($li).attr({
                'for' : id
            }).addClass('grace-text-ellipsis');
            $('<span/>').appendTo($label).attr({
                'usage' : 'icon'
            });
            $('<span/>').appendTo($label).text(text);

            $li.on('change', function(event) {
                var value;
                $li = $(this);
                var $itemLIs = $('li[__all="false"]', $ulAll);

                var checked = isChecked($li);
                var all = $li.attr('__all') === 'true';

                if (all) {
                    // Select all
                    for ( i = 0; i < $itemLIs.length; i++) {
                        $li = $itemLIs.eq(i);
                        value = $li.data('__item');
                        // Update model
                        _this._dataProvider.checked(value, checked);
                        // Update ui
                        $('input', $li).attr('checked', checked);
                    }
                } else {
                    value = $li.data('__item');
                    if (value.notNull()) {
                        // Update model
                        _this._dataProvider.checked(value, checked);
                        // Update ui
                        updateAllCheck();
                    }
                }
                _this.dispatchEvent(new FilterEvent(FilterEvent.ITEM_SELECTED, _this));
            });
            return $li;
        }
        var isChecked = function($li) {
            return $('input', $li).attr('checked') === 'checked';
        }
        var updateAllCheck = function() {
            var $itemLIs = $('li[__all="false"]', $ulAll);
            var allChecked = true;
            for ( i = 0; i < $itemLIs.length; i++) {
                var $li = $itemLIs.eq(i);
                allChecked = allChecked && isChecked($li);
            }
            $('input', $('li[__all="true"]', $ulAll)).attr('checked', allChecked);
        }
        var $li;
        // Select all
        $li = genLI(true, '全选');
        $li.attr('__all', true).appendTo($ulAll);
        $('<div/>').appendTo($ulAll);
        // List
        var $ulList = $('<ul/>').appendTo($('<li/>').appendTo($ulAll).addClass('grace-text-filter-li-ascontainer')).addClass('fancy-scrollbar');
        for ( i = 0; i < dp.length(); i++) {
            value = dp.getItemAt(i);
            $li = genLI(dp.checked(value), dp.getCaption(value));
            $li.attr('__all', false).data('__item', value);
            $li.appendTo($ulList);
        }
        // Null
        var valueNull = dp.getNullItem();
        if (valueNull) {
            $li = genLI(dp.checked(valueNull), dp.getCaption(valueNull));
            $li.attr('__all', false).appendTo($ulAll);
            $('<div/>').appendTo($ulAll);
        }
        // Update ui
        _.defer(function() {
            $ulAll.removeClass('grace-text-filter-animation');
            $ulAll.width($ulList.width())
            _.defer(function() {
                $ulAll.addClass('grace-text-filter-animation');
            })
        })
        updateAllCheck();
    }
})(jQuery);
