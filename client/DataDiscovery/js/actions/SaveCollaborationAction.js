(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.actions.SaveCollaborationAction");

    var AppConst = andrea.grace.constants.AppConst;
    var Log = grace.managers.Log;
    var SerializeManager = grace.managers.SerializeManager;

    var SaveCollaborationAction = grace.actions.SaveCollaborationAction = function() {
        SaveCollaborationAction.superclass.constructor.apply(this, arguments);
    };
    andrea.blink.extend(SaveCollaborationAction, andrea.blink.mvc.Action);

    SaveCollaborationAction.prototype.execute = function(parameters) {
        SaveCollaborationAction.superclass.execute.apply(this, arguments);

        var model = this._getModel(AppConst.MODEL_GRACE);

        model.hackNotify(AppConst.NOTIFICATION_ACTION_SAVE_COLLABORATION_START);
        SerializeManager.instance().saveVizContext(model._vizType, model.analysisDimesions(), model.analysisDatas(), model.analysisFilters(), parameters.title);
        SerializeManager.instance().serialize(parameters.layout, function(sn) {
            model.hackNotify(AppConst.NOTIFICATION_ACTION_SAVE_COLLABORATION_COMPLETE, {
                'sn' : sn
            });
        });
    };

})();
