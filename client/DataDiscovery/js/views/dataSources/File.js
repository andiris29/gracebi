(function() {
    var grace = andrea.grace;

    var DataSourceBase = andrea.grace.views.dataSources.DataSourceBase;
    var MoreButton = grace.views.components.MoreButton;
    var Log = grace.managers.Log;
    var SerializeManager = grace.managers.SerializeManager;

    andrea.blink.declare('andrea.grace.views.dataSources.File');
    var File = andrea.grace.views.dataSources.File = function(div) {
        File.superclass.constructor.apply(this, arguments);

        this._more = null;

        this._hookupAPI();
        this._createChildren();
    };
    andrea.blink.extend(File, andrea.grace.views.dataSources.DataSourceBase);

    File.prototype.loadURL = function(hashPairs) {
        this._load(hashPairs);
    };
    File.prototype.keyword = function() {
        return 'file';
    };
    File.prototype._load = function(options) {
        if (options.url) {
            this.state(DataSourceBase.STATE_LOADING);

            this._getSWF('#FileAccessor', $.proxy(function(swf) {
                swf.load(options.url);
            }, this));
        }
    };
    File.prototype._hookupAPI = function() {
        andrea.blink.declare('andrea.grace._api.dataSource.file');

        andrea.grace._api.dataSource.file.load = $.proxy(function(options) {
            _.defer($.proxy(this._load, this), options);
        }, this);
        andrea.grace._api.dataSource.file.faReadyCallback = $.proxy(function() {
            _.defer($.proxy(this._swfReadyHandler, this));
        }, this);
        andrea.grace._api.dataSource.file.faHoverCallback = $.proxy(function(hover) {
            _.defer($.proxy(this._faHoverHandler, this), hover);
        }, this);
        andrea.grace._api.dataSource.file.faClickCallback = $.proxy(function() {
            _.defer($.proxy(this._faClickHandler, this));
        }, this);
        andrea.grace._api.dataSource.file.faSelectCallback = $.proxy(function() {
            _.defer($.proxy(this._faSelectCallback, this));
        }, this);
        andrea.grace._api.dataSource.file.faCancelCallback = $.proxy(function() {
            _.defer($.proxy(this._faCancelHandler, this));
        }, this);
        andrea.grace._api.dataSource.file.faDataCallback = $.proxy(function(name, rows, columnDescriptors) {
            _.defer($.proxy(this._faDataHandler, this), name, rows, columnDescriptors);
            return true;
        }, this);
        andrea.grace._api.dataSource.file.faSaveCallback = $.proxy(function(response) {
            _.defer($.proxy(this._faSaveHandler, this), response);
            return true;
        }, this);

    };
    File.prototype._createChildren = function() {
        var $container = this._$dom;
        $container.addClass('grace-dataSource-main-analysis');

        // var $more = $('<div/>').appendTo($container).addClass('grace-dataSource-main-analysis-more');
        // // P1
        // var $p1 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-analysis-p1').css('line-height',
        // $container.height() + 'px');
        // $('<span/>').appendTo($p1).text('数据文件');
        // // P2
        // var $p2 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-analysis-p2');
        // $('<div/>').appendTo($p2).addClass('grace-dataSource-main-analysis-p2-ribbon');
        // $('<div/>').appendTo($p2).addClass('grace-dataSource-main-analysis-p2-text').text('分析数据文件').css('line-height',
        // $container.height() + 'px');
        // var $type = $('<div/>').appendTo($p2).addClass('grace-dataSource-main-analysis-p2-type');
        // $('<div/>').appendTo($type).addClass('grace-dataSource-main-analysis-p2-type-icon');
        // $('<div/>').appendTo($type).addClass('grace-dataSource-main-analysis-p2-type-text').text('2007,2003,CSV');
        // // More button
        // this._more = new MoreButton($more[0]);
        this._generateButton($container, {
            'color' : '#7db500',
            'captions' : ['数据文件...', 'Excel 2003, 2007; CSV']
        });

        var flashVersion = swfobject.getFlashPlayerVersion();
        if (!flashVersion || flashVersion.major < 10) {
            $container.on('click', $.proxy(function(event) {
                alert('请使用PC浏览器进行数据文件分析。');
            }, this));
            $container.css('-webkit-filter', 'grayscale(100%)');
        } else {
            // SWF
            var $swf = $('<div/>').appendTo($container);
            var w = $container.width();
            var h = $container.height();
            var faSettings = grace.Settings.fileAccessor;
            this._embedSWF($('<div/>').appendTo($swf), faSettings.name, faSettings.swfURL, 'transparent', w, h, {
                'alpha' : 0,
                'width' : w,
                'height' : h,
                'readyCallback' : 'andrea.grace._api.dataSource.file.faReadyCallback',
                'hoverCallback' : 'andrea.grace._api.dataSource.file.faHoverCallback',
                'clickCallback' : 'andrea.grace._api.dataSource.file.faClickCallback',
                'selectCallback' : 'andrea.grace._api.dataSource.file.faSelectCallback',
                'cancelCallback' : 'andrea.grace._api.dataSource.file.faCancelCallback',
                'dataCallback' : 'andrea.grace._api.dataSource.file.faDataCallback',
                'saveURL' : grace.Settings.javaServer + '/dataSource/file',
                'saveCallback' : 'andrea.grace._api.dataSource.file.faSaveCallback'
            });
            $swf.css({
                'z-index' : 10000,
                'position' : 'absolute',
                'width' : w,
                'height' : h
            });
        }
    };

    File.prototype._faHoverHandler = function(hover) {
        if (!this._more) {
            return;
        }
        if (hover) {
            this._more.showP2();
        } else {
            this._more.showP1();
        }
    };
    File.prototype._faClickHandler = function() {
        this.state(DataSourceBase.STATE_LOADING);
    };
    File.prototype._faCancelHandler = function() {
        this.state(DataSourceBase.STATE_NORMAL);
    };
    File.prototype._faSelectCallback = function() {
    };

    File.prototype._faDataHandler = function(name, rows, columnDescriptors) {
        Log.interaction('dataSource', ['file', this._decode(name)].join(','));
        this._stringDataReady(rows, columnDescriptors);
    };
    File.prototype._faSaveHandler = function(response) {
        response = JSON.parse(response);

        // Update the dsInfo
        SerializeManager.instance().saveDataSource({
            'dataSource' : 'jsonp',
            'url' : grace.Settings.javaServer + '/dataSource/file?name=' + response.json
        });
    };

})();
