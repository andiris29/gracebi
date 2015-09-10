(function() {
    var grace = andrea.grace;

    var Log = grace.managers.Log;
    var DataSourceBase = andrea.grace.views.dataSources.DataSourceBase;

    andrea.blink.declare('andrea.grace.views.dataSources.Sample');
    var Sample = andrea.grace.views.dataSources.Sample = function(div, settings) {
        Sample.superclass.constructor.apply(this, arguments);

        this._settings = settings;
        this._createChildren();
    };
    andrea.blink.extend(Sample, andrea.grace.views.dataSources.DataSourceBase);

    Sample.prototype._createChildren = function() {
        var settings = this._settings;

        var $container = this._$dom;
        $container.on('click', $.proxy(function(event) {
            this._loadEg(settings.json, settings.name);
        }, this));

        this._generateButton($container, {
            'color' : '#e74c3c',
            'captions' : settings.captions,
            'link' : {
                'text' : '下载原始数据…',
                'url' : settings.download
            }
        });
    };
    Sample.prototype._loadEg = function(jsonPath, name) {
        this.state(DataSourceBase.STATE_LOADING);

        grace.api.dataSource.load('json', {
            'url' : jsonPath
        });
        Log.interaction('dataSource', ['sample', name].join(','));
    };
})();
