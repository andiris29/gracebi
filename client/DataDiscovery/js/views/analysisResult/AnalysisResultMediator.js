(function($) {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisResult.AnalysisResultMediator");

    var AppConst = grace.constants.AppConst;
    var Log = grace.managers.Log;

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

        var logFmt = function(shelvedAnalyses) {
            var names = [];
            _.each(shelvedAnalyses, function(sa) {
                names.push(sa.source.name);
            });
            return [shelvedAnalyses.length, names.join('|')].join(',');
        }
        this._subscribe(AppConst.NOTIFICATION_VIZ_CONTEXT_CHANGED, function(notification) {
            Log.interaction('analysis', [logFmt(model.analysisDimesions()), logFmt(model.analysisDatas()), logFmt(model.analysisFilters())].join(','));
            _this._view.render(model.vizType(), model.dataProvider, model.analysisFilters(), model.analysisDimesions(), model.analysisDatas());

            model.invalidateShelvedAnalysis();
        });
        _this._view.render(model.vizType(), model.dataProvider, model.analysisFilters(), model.analysisDimesions(), model.analysisDatas());
    };
})(jQuery);
