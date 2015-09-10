(function() {
    var grace = andrea.grace;

    var DataSourceBase = andrea.grace.views.dataSources.DataSourceBase;
    var MoreButton = grace.views.components.MoreButton;
    var Log = grace.managers.Log;

    andrea.blink.declare('andrea.grace.views.dataSources.DataSourceJSONP');
    var DataSourceJSONP = andrea.grace.views.dataSources.DataSourceJSONP = function(div) {
        DataSourceJSONP.superclass.constructor.apply(this, arguments);

        this._more = null;

        this._hookupAPI();
    };
    andrea.blink.extend(DataSourceJSONP, andrea.grace.views.dataSources.DataSourceBase);

    DataSourceJSONP.prototype.loadURL = function(hashPairs) {
        this._load(hashPairs);
    };
    DataSourceJSONP.prototype.keyword = function() {
        return 'jsonp';
    };
    /**
     * @param {Object} options
     * 	url: *
     */
    DataSourceJSONP.prototype._load = function(options) {
        if (options.url) {
            this.state(DataSourceBase.STATE_LOADING);

            this._options = options;
            $.ajax({
                'url' : options.url,
                'dataType' : 'jsonp'
            }).done($.proxy(function(json) {
                this._dpReady(json);
            }, this));
        }
    };
    DataSourceJSONP.prototype._hookupAPI = function() {
        andrea.blink.declare('andrea.grace._api.dataSource.jsonp');
        andrea.grace._api.dataSource.jsonp.load = $.proxy(function(options) {
            _.defer($.proxy(this._load, this), options);
        }, this);
    };
})();
