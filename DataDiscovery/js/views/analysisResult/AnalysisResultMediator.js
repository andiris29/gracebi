(function($) {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisResult.AnalysisResultMediator");

    var AppConst = grace.constants.AppConst;

    /**
     * App Mediator.
     */
    var AnalysisResultMediator = grace.views.analysisResult.AnalysisResultMediator = function(view) {
        AnalysisResultMediator.superclass.constructor.apply(this, arguments);

        this._view = view;
        this._model = null;
    };

    andrea.blink.extend(AnalysisResultMediator, andrea.blink.mvc.ViewMediator);

    AnalysisResultMediator.prototype.init = function() {
        var _this = this;
        var model = this._model = this._getModel(AppConst.MODEL_GRACE);

        this._subscribe(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED, function(notification) {
            _this._view.render(model.vizType(), model.dataProvider, model.analysisDimesions(), model.analysisDatas());

            model.invalidateShelvedAnalysis();
        });
        _this._view.render(model.vizType(), model.dataProvider, model.analysisDimesions(), model.analysisDatas());
    };
})(jQuery);
