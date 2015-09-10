(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.views.popUp.OperationMenu');
    var MenuEvent = grace.views.popUp.MenuEvent;

    var OperationMenu = grace.views.popUp.OperationMenu = function(dom) {
        OperationMenu.superclass.constructor.apply(this, arguments);

        this._classVisible = 'grace-menu-visible';

        this._operationGroups = null;
    };
    andrea.blink.extend(OperationMenu, grace.views.popUp.PopUpBase);

    OperationMenu.create = function(operationGroups) {
        var menu = new OperationMenu($('<div/>'));
        var $dom = menu.dom();
        $dom.addClass('grace-menu');
        menu._createChildren(operationGroups);

        return menu;    }
    OperationMenu.prototype.open = function($dock) {
        OperationMenu.superclass.open.apply(this, arguments)

        var _this = this;

        var $dom = $(this._dom);
        // Event lisenter
        var inside = true;
        var closeOutside = function() {
            // 100ms for move to submenu
            setTimeout(function() {
                if (!inside) {
                    _this.close();
                }
            }, 240)
        }
        var hoverIn = function() {
            inside = true;
        };
        var hoverOut = function() {
            inside = false;
            closeOutside();
        };
        $dock.hover(hoverIn, hoverOut);
        $(this._dom).hover(hoverIn, hoverOut);
    }
    /**
     *
     * @param {Array} value [{
     * 	text: xxx,
     * 	callback: function() {}
     * }]
     */
    OperationMenu.prototype._createChildren = function(operationGroups) {
        this._operationGroups = operationGroups;

        this._createMenu(this._operationGroups, $(this._dom))    }
    OperationMenu.prototype._createMenu = function(operationGroups, $dom) {
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
        // Flattern style
        for ( i = 0; i < operationGroups.length; i++) {
            operations = operationGroups[i].operations();
            if (i !== 0) {
                $('<div/>').appendTo($ul);
            }
            for ( j = 0; j < operations.length; j++) {
                var $li = $('<li/>').appendTo($ul);
                var $a = $('<a/>').appendTo($li);
                o = operations[j];
                $li.data({
                    '__operation' : o
                }).click(clickHandler);
                $a.text(o.name);
            }
        }
        // Hierarchy style
        // if (operationGroups.length === 1) {
        // operations = operationGroups[0].operations();
        // for ( i = 0; i < operations.length; i++) {
        // var $li = $('<li/>').appendTo($ul);
        // var $a = $('<a/>').appendTo($li);
        // // Operation
        // o = operations[i];
        // $li.data({
        // '__operation' : o
        // }).click(clickHandler);
        // $a.text(o.name);
        // }
        // } else {
        // for ( i = 0; i < operationGroups.length; i++) {
        // var $li = $('<li/>').appendTo($ul);
        // var $a = $('<a/>').appendTo($li);
        // // Sample operation
        // operations = operationGroups[i].operations();
        //
        // o = operations[0];
        // if (operations.length === 1) {
        // $li.data({
        // '__operation' : o
        // }).click(clickHandler);
        // $a.text(o.name);
        // } else {
        // // Menu folder
        // $a.text(o.classificationName + ' \uf0da');
        // // Sub menu
        // this._createMenu([operationGroups[i]], $li);
        // }
        // }
        // }
    }
})(jQuery);
