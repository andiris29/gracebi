(function() {
    var grace = andrea.grace;
    var PageTransition = grace.helpers.PageTransition;
    var DataSourceEvent = grace.views.analysisContainer.events.DataSourceEvent;

    andrea.blink.declare("andrea.grace.Grace");
    var Grace = grace.Grace = function(dependencyFiles) {
        // Static
        Grace._instance = this;

        $(window).load($.proxy(function() {
            // Load dependency js files for DataDiscovery
            LazyLoad.js(dependencyFiles, $.proxy(this._jsReady, this));
            //
            this._$dataSource = $('#divDataSource');
            this._$dataDiscovery = $("#divDataDiscovery");
            $(this._$dataDiscovery).bind("selectstart", function() {
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
    Grace.flashHoverCallback = function(hover) {
        var dataSource = Grace._instance._dataSource;
        return dataSource.flashHoverHandler.apply(dataSource, arguments);
    };
    Grace.flashStartProccessCallback = function(hover) {
        var dataSource = Grace._instance._dataSource;
        return dataSource.flashStartProccessHandler.apply(dataSource, arguments);
    };
    Grace.flashDataCallback = function(rows, columnDescriptors) {
        var dataSource = Grace._instance._dataSource;
        return dataSource.flashDataHandler.apply(dataSource, arguments);
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
        // Draw data discovery
        var dataDiscovery = new grace.DataDiscovery(this._$dataDiscovery[0]);
        dataDiscovery.rowBasedDataProvider(this._dp.rows, this._dp.columnDescriptors, this._dp.source);

        // Play animation
        var pt = new PageTransition({
            '$page' : this._$dataSource,
            'classes' : []
        }, {
            '$page' : this._$dataDiscovery,
            'classes' : ['pt-page-moveFromTop', 'pt-page-onTop', 'pt-page-delay300']
        }, $.proxy(function() {
            this._$dataSource.detach();
        }, this));
        pt.play();
    };
})();
