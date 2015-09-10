(function($) {

    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.views.analysisContainer.supportClasses.ShelfBaseMediator");

    var AppConst = grace.constants.AppConst;
    var ShelfEvent = grace.views.analysisContainer.events.ShelfEvent;
    var VizNavigatorEvent = grace.views.popUp.VizNavigatorEvent;

    /**
     * App Mediator.
     */
    var ShelfBaseMediator = grace.views.analysisContainer.supportClasses.ShelfBaseMediator = function(view) {
        ShelfBaseMediator.superclass.constructor.apply(this, arguments);

        this._view = view;
        this._model = null;
    };

    andrea.blink.extend(ShelfBaseMediator, andrea.blink.mvc.ViewMediator);

    ShelfBaseMediator.prototype.init = function() {
        var _this = this;
        this._model = this._getModel(AppConst.MODEL_GRACE);

        this._view.helperGetAnalysis = function(id) {
            return _this._model.getAnalysis(id);
        };
        var runAnalysis = function() {
            _this._action(AppConst.ACTION_RUN_ANALYSIS, {
                'shelfType' : _this._view.type(),
                'shelvedContexts' : _this._view.getShelvedContexts()
            });
        };

        this._view.addEventListener(ShelfEvent.CARD_SHELVED, function(event) {
            runAnalysis();
        }, this);

        this._view.addEventListener(ShelfEvent.HELPER_DROPPED, function(event) {
            var a = _this._model.getAnalysis(event.data.analysisID);
            _this._view.dropAnalysis(a, event.data.$helper, event.data.from, event.data.to);
        });
        this._view.addEventListener(ShelfEvent.CARD_COPIED, function(event) {
            _this._model.hackNotify(AppConst.NOTIFICATION_VIEW_PASTE_TO, {
                'analysis' : event.data.analysis,
                'targetShelfType' : event.data.pasteTo
            });
        });

        this._subscribe(AppConst.NOTIFICATION_VIEW_PASTE_TO, function(notification) {
            if (_this._view.type() === notification.data.targetShelfType) {
                _this._view.addCard(notification.data.analysis);
            }
            runAnalysis();
        });
        this._subscribe(AppConst.NOTIFICATION_DATA_PROVIDER_CHANGED, function(notification) {
            _this._dataProviderChangedHandler(notification);
        });

        this._subscribe(AppConst.NOTIFICATION_VIZ_CONTEXT_APPLIED, function(notification) {
            _this._view.updateShelvedAnalyses(function(id) {
                return _this._model.getShelvedAnalysis(id);
            });
        });

        this._subscribe(AppConst.NOTIFICATION_VIZ_CONTEXT_RESET, function(notification) {
            var analyses = _this._modelAnalyses();

            if (analyses && analyses.length) {
                _.each(analyses, function(sa) {
                    _this._view.addCard(sa.source, sa);
                });

                _this._view.updateShelvedAnalyses(function(id) {
                    return _this._model.getShelvedAnalysis(id);
                });
            }
        });
    };
    ShelfBaseMediator.prototype._modelAnalyses = function() {
        return [];
    };
    /**
     * @protected
     */
    ShelfBaseMediator.prototype._dataProviderChangedHandler = function(notification) {
        this._view.removeAll();
    };
})(jQuery);
