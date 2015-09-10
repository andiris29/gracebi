(function($) {
    var grace = andrea.grace;

    var MenuEvent = grace.views.popUp.menu.MenuEvent;

    andrea.blink.declare('andrea.grace.views.popUp.menu.PopUpMenu');
    var PopUpMenu = grace.views.popUp.menu.PopUpMenu = function(dom) {
        PopUpMenu.superclass.constructor.apply(this, arguments);

        this._$dom.addClass('grace-menu');
        this._classVisible = 'grace-menu-visible';
        this._dataProvider = null;
    };
    andrea.blink.extend(PopUpMenu, grace.views.popUp.HoverPopUpBase);

    PopUpMenu.create = function(dataProvider) {
        var menu = new PopUpMenu($('<div/>'));
        menu._createChildren(dataProvider);
        return menu;
    }
    /**
     *
     * @param {Array} value [{
     * 	text: xxx,
     * 	callback: function() {}
     * }]
     */
    PopUpMenu.prototype._createChildren = function(dataProvider) {
        this._dataProvider = dataProvider;

        this._createMenu(this._dataProvider, $(this._dom))
    }
    PopUpMenu.prototype._createMenu = function(dataProvider, $dom) {
        var _this = this;

        var clickHandler = function(event) {
            $li = $(event.currentTarget);
            _this.dispatchEvent(new MenuEvent(MenuEvent.ITEM_SELECTED, _this, {
                'item' : $li.data('__item')
            }));
            _this.close();
        }
        var $ul = $('<ul/>').appendTo($dom);

        var i, j;
        var o;
        // Flattern style
        for ( i = 0; i < dataProvider.length(); i++) {
            if (i !== 0) {
                $('<div/>').appendTo($ul);
            }
            for ( j = 0; j < dataProvider.groupLength(i); j++) {
                var $li = $('<li/>').appendTo($ul);
                var $a = $('<a/>').appendTo($li);
                o = dataProvider.getItem(i, j);
                $li.data({
                    '__item' : o
                }).click(clickHandler);
                $a.text(o.name);
            }
        }
    }
})(jQuery);
