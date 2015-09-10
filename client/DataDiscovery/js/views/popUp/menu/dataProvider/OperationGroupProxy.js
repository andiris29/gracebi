(function($) {
    var grace = andrea.grace;

    andrea.blink.declare('andrea.grace.views.popUp.menu.dataProvider.OperationGroupProxy');
    var OperationGroupProxy = grace.views.popUp.menu.dataProvider.OperationGroupProxy = function(ogs) {
        this._operationGroups = ogs;
    };
    OperationGroupProxy.prototype.length = function() {
        return this._operationGroups.length;
    };
    OperationGroupProxy.prototype.groupLength = function(i) {
        return this._operationGroups[i].operations().length;
    };
    OperationGroupProxy.prototype.getItem = function(i, j) {
        return this._operationGroups[i].operations()[j];
    };
})(jQuery);
