(function() {
    var grace = andrea.grace;
    var PageTransition = grace.helpers.PageTransition;
    var DataSourceEvent = grace.views.analysisContainer.events.DataSourceEvent;
    var Log = grace.managers.Log;
    var URLUtil = grace.utils.URLUtil;
    var DataDiscoveryModel = grace.models.DataDiscoveryModel;
    var SerializeManager = grace.managers.SerializeManager;

    andrea.blink.declare("andrea.grace.Grace");
    var Grace = grace.Grace = function(dependentJSs, dependentCSSs) {
        var hashPairs = URLUtil.hashPairs();
        Log.user = hashPairs.andrea_user ? hashPairs.andrea_user : 'user';
        Log.interaction('open', JSON.stringify($.browser));

        $($.proxy(function() {
            // Load dependency js files for DataDiscovery
            LazyLoad.js(dependentJSs, $.proxy(function() {
                if (dependentCSSs && dependentCSSs.length) {
                    LazyLoad.css(dependentCSSs, $.proxy(this._jsReady, this));
                } else {
                    this._jsReady();
                }
            }, this));
            //
            this._$dataSource = $('#divDataSource');
            this._$dataDiscovery = $("#divDataDiscovery");
            $('#divMain', this._$dataDiscovery).bind("selectstart", function() {
                return false;
            });

            var dataSource = this._dataSource = new grace.DataSource(this._$dataSource[0]);
            dataSource.addEventListener(DataSourceEvent.DATA_PROVIDER_READY, this._dataSourceDataSourceReadyHandler, this);
        }, this));

        this._dataSource = null;
        this._$dataSource = null;
        this._$dataDiscovery = null;

        this._lazyLoading = true;
        this._dp = null;
        this._dsInfo = null;

        this._startup();
    };
    // ------------------------------------
    // Private methods
    // ------------------------------------
    Grace.prototype._startup = function() {
    };
    // Goto DataDiscovery
    Grace.prototype._dataSourceDataSourceReadyHandler = function(event) {
        this._dp = event.data.dataProvider;
        this._dsInfo = event.data.dsInfo;
        this._gotoDataDiscovery();
    };
    Grace.prototype._jsReady = function() {
        ZeroClipboard.config({
            'moviePath' : grace.Settings.zeroClipboard.moviePath
        });

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
        SerializeManager.instance().saveDataSource(this._dsInfo);
        dataDiscovery.rowBasedDataProvider(this._dp.rows, this._dp.columnDescriptors, this._dp.source);

        // Play animation
        var pt = new PageTransition({
            '$page' : this._$dataSource,
            'classes' : ['pt-page-scaleDownCenter']
        }, {
            '$page' : this._$dataDiscovery,
            'classes' : ['pt-page-scaleUpCenter'],
            'delay' : 180
        }, $.proxy(function() {
            this._$dataSource.css({
                'z-index' : -1,
                'width' : '0px',
                'height' : '0px',
                'overflow' : 'hidden'
            });
            // Could not set display to none here, since save file swf will be unloaded when display = none.
            // this._$dataSource.css('display', 'none');

            dataDiscovery.loadCollaboration();
        }, this));
        _.defer(function() {
            pt.play();
        });
    };
})();
