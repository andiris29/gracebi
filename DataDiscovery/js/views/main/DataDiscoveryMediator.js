(function($) {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.DataDiscoveryMediator");

    var AppConst = grace.constants.AppConst;
    /**
     * App Mediator.
     */
    var DataDiscoveryMediator = andrea.grace.DataDiscoveryMediator = function() {
        DataDiscoveryMediator.superclass.constructor.apply(this, arguments);
    };

    andrea.blink.extend(DataDiscoveryMediator, andrea.blink.mvc.ViewMediator);

    DataDiscoveryMediator.prototype.rowBasedDataProvider = function(rows, columnDescriptors, source) {
        this._action(AppConst.ACTION_CHANGE_DATA_PROVIDER, {
            'rows' : rows,
            'columnDescriptors' : columnDescriptors,
            'source' : source
        });
    };

})(jQuery);
