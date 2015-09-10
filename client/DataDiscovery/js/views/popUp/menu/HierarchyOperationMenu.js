(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.views.popUp.menu.HierarchyOperationMenu');
    var MenuEvent = grace.views.popUp.menu.MenuEvent;

    var HierarchyOperationMenu = grace.views.popUp.menu.HierarchyOperationMenu = function(dom) {
        HierarchyOperationMenu.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(HierarchyOperationMenu, grace.views.popUp.menu.PopUpMenu);

    HierarchyOperationMenu.prototype._createMenu = function(operationGroups, $dom) {
        var _this = this;

        var clickHandler = function(event) {
            $li = $(event.currentTarget);
            _this.dispatchEvent(new MenuEvent(MenuEvent.ITEM_SELECTED, _this, {
                'operation' : $li.data('__operation')
            }));
            _this.close();
        }
        var $ul = $('<ul/>').appendTo($dom);

        var i, j;
        var o;
        var operations;

        // Hierarchy style
        if (operationGroups.length === 1) {
            operations = operationGroups[0].operations();
            for ( i = 0; i < operations.length; i++) {
                var $li = $('<li/>').appendTo($ul);
                var $a = $('<a/>').appendTo($li);
                // Operation
                o = operations[i];
                $li.data({
                    '__operation' : o
                }).click(clickHandler);
                $a.text(o.name);
            }
        } else {
            for ( i = 0; i < operationGroups.length; i++) {
                var $li = $('<li/>').appendTo($ul);
                var $a = $('<a/>').appendTo($li);
                // Sample operation
                operations = operationGroups[i].operations();

                o = operations[0];
                if (operations.length === 1) {
                    $li.data({
                        '__operation' : o
                    }).click(clickHandler);
                    $a.text(o.name);
                } else {
                    // Menu folder
                    $a.text(o.classificationName + ' \uf0da');
                    // Sub menu
                    this._createMenu([operationGroups[i]], $li);
                }
            }
        }
    }
})(jQuery);
