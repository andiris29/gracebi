(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.actions.LoadCollaborationAction");

    var AppConst = andrea.grace.constants.AppConst;
    var Log = grace.managers.Log;
    var SerializeManager = grace.managers.SerializeManager;

    var LoadCollaborationAction = grace.actions.LoadCollaborationAction = function() {
        LoadCollaborationAction.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(LoadCollaborationAction, andrea.blink.mvc.Action);

    LoadCollaborationAction.prototype.execute = function(parameters) {
        LoadCollaborationAction.superclass.execute.apply(this, arguments);

        var model = this._getModel(AppConst.MODEL_GRACE);

        SerializeManager.instance().loadVizContext(function(loaded) {
            model.resetVizContext(loaded.vizType, loaded.analysisDimesions, loaded.analysisDatas, loaded.analysisFilters);
        });
    };

})();
