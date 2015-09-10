(function() {
    var grace = andrea.grace;
    var PageTransition = grace.helpers.PageTransition;
    var DataSourceEvent = grace.views.analysisContainer.events.DataSourceEvent;
    var Log = grace.managers.Log;
    var URLUtil = grace.utils.URLUtil;

    andrea.blink.declare("andrea.grace.Grace");
    var Grace = grace.Grace = function(dependencyFiles) {
        var hashPairs = URLUtil.hashPairs();
        Log.user = hashPairs.andrea_user ? hashPairs.andrea_user : 'user';
        Log.interaction('open', JSON.stringify($.browser));
        // Static
        Grace._instance = this;

        $($.proxy(function() {
            // Load dependency js files for DataDiscovery
            LazyLoad.js(dependencyFiles, $.proxy(this._jsReady, this));
            //
            this._$dataSource = $('#divDataSource');
            this._$dataDiscovery = $("#divDataDiscovery");
            $('#divMain', this._$dataDiscovery).bind("selectstart", function() {
                return false;
            });

            var dataSource = this._dataSource = new grace.DataSource(this._$dataSource[0]);
            dataSource.addEventListener(DataSourceEvent.DATA_SOURCE_READY, this._dataSourceDataSourceReadyHandler, this);
        }, this));

        this._dataSource = null;
        this._$dataSource = null;
        this._$dataDiscovery = null;

        this._lazyLoading = true;
        this._dp = null;

    };
    // ------------------------------------
    // Static for flash
    // ------------------------------------
    Grace._instance = null;

    Grace._flashCallback = function(context, handler, args) {
        _.defer($.proxy(function() {
            this[handler].apply(this, arguments[0]);
        }, context), args);
    };
    // File accessor callbacks
    Grace.faHoverCallback = function(hover) {
        Grace._flashCallback(Grace._instance._dataSource, 'faHoverHandler', arguments);
    };
    Grace.faClickCallback = function(hover) {
        Grace._flashCallback(Grace._instance._dataSource, 'faClickHandler', arguments);
    };
    Grace.faCancelCallback = function(rows, columnDescriptors) {
        Grace._flashCallback(Grace._instance._dataSource, 'faCancelHandler', arguments);
    };
    Grace.faDataCallback = function(rows, columnDescriptors) {
        Grace._flashCallback(Grace._instance._dataSource, 'faDataHandler', arguments);
        return true;
    };
    // Cross domain accessor callbacks
    Grace.cdaReadyCallback = function() {
        Grace._flashCallback(Grace._instance._dataSource, 'cdaReadyHandler', arguments);
    };
    Grace.cdaDataCallback = function(response) {
        Grace._flashCallback(Grace._instance._dataSource, 'cdaDataHandler', arguments);
    };
    Grace.cdaCompleteCallback = function() {
        Grace._flashCallback(Grace._instance._dataSource, 'cdaCompleteHandler', arguments);
    };
    // ------------------------------------
    // Private methods
    // ------------------------------------
    // Goto DataDiscovery
    Grace.prototype._dataSourceDataSourceReadyHandler = function(event) {
        this._dp = event.data;
        this._gotoDataDiscovery();
    }
    Grace.prototype._jsReady = function() {
        this._lazyLoading = false;
        this._gotoDataDiscovery();
    };
    Grace.prototype._gotoDataDiscovery = function() {
        if (!this._dp) {
            return;
        }
        if (this._lazyLoading) {
            return;
        }
        this._dataSource.destroy();
        // Draw data discovery
        var dataDiscovery = new grace.DataDiscovery(this._$dataDiscovery[0]);
        dataDiscovery.rowBasedDataProvider(this._dp.rows, this._dp.columnDescriptors, this._dp.source);

        // Play animation
        var pt = new PageTransition({
            '$page' : this._$dataSource,
            'classes' : ['pt-page-scaleDownCenter']
        }, {
            '$page' : this._$dataDiscovery,            'classes' : ['pt-page-scaleUpCenter'],
            'delay' : 180
        }, $.proxy(function() {
            this._$dataSource.css('z-index', -1);
        }, this));
        _.defer(function() {
            pt.play();
        });
    };
})();
