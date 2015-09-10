(function($) {

    var grace = andrea.grace;

    var VizNavigatorEvent = grace.views.popUp.VizNavigatorEvent;
    var AppConst = grace.constants.AppConst;

    /**
     * App Mediator.
     */
    andrea.blink.declare("andrea.grace.views.vizNavigator.VizNavigatorMediator");
    var VizNavigatorMediator = grace.views.vizNavigator.VizNavigatorMediator = function(view) {
        VizNavigatorMediator.superclass.constructor.apply(this, arguments);

        this._view = view;
        this._model = null;
    };

    andrea.blink.extend(VizNavigatorMediator, andrea.blink.mvc.ViewMediator);

    VizNavigatorMediator.prototype.init = function() {
        var _this = this;
        var model = this._model = this._getModel(AppConst.MODEL_GRACE);

        this._view.addEventListener(VizNavigatorEvent.VIZ_CHANGED, function(event) {
            _this._action(AppConst.ACTION_RUN_ANALYSIS, {
                'vizType' : _this._view.selectedType()
            });
        }, this);
        this._subscribe(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED, function(notification) {
            _this._view.update(model.analysisDimesions().length, model.analysisDatas().length);        });
    }
})(jQuery);
