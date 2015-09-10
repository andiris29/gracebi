(function() {
    var grace = andrea.grace;

    var DataSourceBase = andrea.grace.views.dataSources.DataSourceBase;
    var MoreButton = grace.views.components.MoreButton;
    var Log = grace.managers.Log;

    andrea.blink.declare('andrea.grace.views.dataSources.DataSourceJSON');
    var DataSourceJSON = andrea.grace.views.dataSources.DataSourceJSON = function(div) {
        DataSourceJSON.superclass.constructor.apply(this, arguments);

        this._more = null;

        this._hookupAPI();
    };
    andrea.blink.extend(DataSourceJSON, andrea.grace.views.dataSources.DataSourceBase);

    DataSourceJSON.prototype.loadURL = function(hashPairs) {
        this._load(hashPairs);
    };
    DataSourceJSON.prototype.keyword = function() {
        return 'json';
    };
    /**
     * @param {Object} options
     * 	url: *.json
     */
    DataSourceJSON.prototype._load = function(options) {
        if (options.url) {
            this.state(DataSourceBase.STATE_LOADING);

            this._options = options;
            $.ajax({
                'url' : options.url,
                'dataType' : 'json'
            }).done($.proxy(function(json) {
                this._dpReady(json);
            }, this));
        }
    };
    DataSourceJSON.prototype._hookupAPI = function() {
        andrea.blink.declare('andrea.grace._api.dataSource.json');
        andrea.grace._api.dataSource.json.load = $.proxy(function(options) {
            _.defer($.proxy(this._load, this), options);
        }, this);
    };
})();
