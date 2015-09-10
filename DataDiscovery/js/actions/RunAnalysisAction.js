(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.actions.RunAnalysisAction");

    var AppConst = andrea.grace.constants.AppConst;
    var ShelfType = grace.constants.ShelfType;
    var ShelvedAnalysis = grace.models.vo.ShelvedAnalysis;

    var RunAnalysisAction = grace.actions.RunAnalysisAction = function() {
        RunAnalysisAction.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(RunAnalysisAction, andrea.blink.mvc.Action);

    /**
     * Create and update ShelvedAnalysis
     */
    RunAnalysisAction.prototype.execute = function(parameters) {
        RunAnalysisAction.superclass.execute.apply(this, arguments);

        var i;
        var ACT = ShelfType;
        var model = this._getModel(AppConst.MODEL_GRACE);

        if (ACT.des(parameters.shelfType) && parameters.shelvedContexts) {
            // Analysis shelf change
            var shelfType = parameters.shelfType;
            var shelvedContexts = parameters.shelvedContexts;
            var shelvedAnalyses = [];
            for ( i = 0; i < shelvedContexts.length; i++) {
                var ctx = shelvedContexts[i];
                var sa/*ShelvedAnalysis*/ = model.getShelvedAnalysis(ctx.shelvedAnalysisID);
                if (!sa) {
                    sa = new ShelvedAnalysis(ctx.shelvedAnalysisID, model.getAnalysis(ctx.analysisID));
                }
                sa.operationGroup = ctx.operationGroup;

                shelvedAnalyses.push(sa);
            }

            if (shelfType === ACT.DES_DIM) {
                if (!_.isEqual(shelvedAnalyses, model.analysisDimesions())) {
                    model.analysisDimesions(shelvedAnalyses);
                }
            } else if (shelfType === ACT.DES_VALUE) {
                if (!_.isEqual(shelvedAnalyses, model.analysisDatas())) {
                    model.analysisDatas(shelvedAnalyses);
                }
            }
        } else if (parameters.vizType) {
            // Viz navigator change
            model.vizType(parameters.vizType);
        }
    };

})();
