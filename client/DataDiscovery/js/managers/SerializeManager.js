(function($) {
    var grace = andrea.grace;
    andrea.blink.declare('andrea.grace.managers.SerializeManager');

    var SerializeUtil = grace.utils.SerializeUtil;
    var Log = grace.managers.Log;

    var SerializeManager = grace.managers.SerializeManager = function() {
        this._serializing = {};
        this._deserializing = null;

        this._requestedSerializations = [];
    };
    SerializeManager._instance = null;

    SerializeManager.instance = function() {
        if (!SerializeManager._instance) {
            SerializeManager._instance = new SerializeManager();
        }
        return SerializeManager._instance;
    };

    SerializeManager.prototype.serializable = function() {
        return this._serializing.dsInfo !== null && this._serializing.dsInfo !== undefined;
    };

    SerializeManager.prototype.serialize = function(layout, callback) {
        if (!this._serializing.dsInfo) {
            this._requestedSerializations.push(arguments);
            return;
        }

        _.extend(this._serializing, {
            'layout' : layout
        });

        $.ajax({
            'url' : grace.Settings.nodeServer + '/collaboration/create',
            'type' : 'POST',
            'data' : {
                'collaboration' : JSON.stringify(this._serializing)
            }
        }).done($.proxy(function(data) {
            data = JSON.parse(data);
            callback(data.sn);
        }, this)).fail($.proxy(function() {
            Log.console('serialize collaboration fail.');
        }, this));
    };

    SerializeManager.prototype.deserialize = function(collaborationSN) {
        $.ajax({
            'url' : grace.Settings.nodeServer + '/collaboration/get',
            'dataType' : 'jsonp',
            'data' : {
                'sn' : collaborationSN
            }
        }).done($.proxy(function(data) {
            this._deserializing = data.collaboration;

            grace.api.config.dataDiscovery.layout = this._deserializing.layout;
            grace.api.dataSource.load(this._deserializing.dsInfo);
        }, this)).fail($.proxy(function() {
            Log.console('deserialize visualization fail.');
        }, this));
    };

    SerializeManager.prototype.loadVizContext = function(callback) {
        if (this._deserializing) {
            var ShelvedAnalysis = grace.models.vo.ShelvedAnalysis;

            var loaded = {
                'vizType' : this._deserializing.vizType,
                'analysisDimesions' : SerializeUtil.batchFromJSON(this._deserializing.analysisDimesions, ShelvedAnalysis.fromJSON),
                'analysisDatas' : SerializeUtil.batchFromJSON(this._deserializing.analysisDatas, ShelvedAnalysis.fromJSON),
                'analysisFilters' : SerializeUtil.batchFromJSON(this._deserializing.analysisFilters, ShelvedAnalysis.fromJSON)
            };
            if (this._deserializing.title) {
                var array = document.title.split(' - ');
                array[array.length - 1] = this._deserializing.title;
                document.title = array.join(' - ');

                var HighChartsOption = grace.views.analysisResult.viz.highCharts.supportClasses.HighChartsOption;
                HighChartsOption.title = this._deserializing.title;
            }

            callback(loaded);
        }
    };

    SerializeManager.prototype.saveDataSource = function(dsInfo) {
        this._serializing.dsInfo = dsInfo;

        if (this._serializing.dsInfo && this._requestedSerializations.length) {
            _.each(this._requestedSerializations, $.proxy(function(args) {
                this.serialize.apply(this, args);
            }, this));
            this._requestedSerializations = [];
        }
    };

    SerializeManager.prototype.saveVizContext = function(vizType, analysisDimesions, analysisDatas, analysisFilters, title) {
        var ShelvedAnalysis = grace.models.vo.ShelvedAnalysis;
        _.extend(this._serializing, {
            'vizType' : vizType,
            'analysisDimesions' : SerializeUtil.batchToJSON(analysisDimesions, ShelvedAnalysis.toJSON),
            'analysisDatas' : SerializeUtil.batchToJSON(analysisDatas, ShelvedAnalysis.toJSON),
            'analysisFilters' : SerializeUtil.batchToJSON(analysisFilters, ShelvedAnalysis.toJSON),
            'title' : title
        });
    };

    SerializeManager.prototype.saveViz = function(viz) {
        this._serializing.viz = viz;
    };
})(jQuery);
