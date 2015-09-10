(function() {
    var grace = andrea.grace;
    var MoreButton = grace.views.components.MoreButton;
    var DataSourceEvent = grace.views.analysisContainer.events.DataSourceEvent;
    var URLUtil = grace.utils.URLUtil;
    var Loading = grace.views.popUp.Loading;
    var Log = grace.managers.Log;

    var DataSourceBase = andrea.grace.views.dataSources.DataSourceBase;
    var DataSourceJSON = andrea.grace.views.dataSources.DataSourceJSON;
    var DataSourceJSONP = andrea.grace.views.dataSources.DataSourceJSONP;
    var File = andrea.grace.views.dataSources.File;
    var Taobao = andrea.grace.views.dataSources.Taobao;
    var Jingdong = andrea.grace.views.dataSources.Jingdong;
    var Customize = andrea.grace.views.dataSources.Customize;
    var Sample = andrea.grace.views.dataSources.Sample;
    var DataDiscoveryModel = grace.models.DataDiscoveryModel;
    var SerializeManager = grace.managers.SerializeManager;

    var _LAYOUT = {
        'sources' : {
            'container' : {
                'numCells' : {
                    'horizontal' : 2,
                    'vertical' : 3
                },
                'gap' : {
                    'horizontal' : 10,
                    'vertical' : 10
                },
                'cell' : {
                    'width' : 140,
                    'height' : 100
                }
            },
            // 1fenxi
            // 'file' : [0, 0, 2, 1],
            // 'taobao' : [0, 1, 1, 1],
            // 'jingdong' : [1, 1, 1, 1],
            // 'customize' : [3, 1, 1, 1],
            // taobao
            // 'taobao' : [0, 0, 2, 1],
            // 'file' : [0, 1, 1, 1],
            // jingdong
            'taobao' : [0, 2, 1, 1],
            'jingdong' : [1, 2, 1, 1],
            'file' : [1, 1, 1, 1],

            'samples' : {
                'superMarket' : [0, 0, 1, 1],
                'worldBank' : [1, 0, 1, 1]
            }
        },
        'guide' : {
            'video' : {
                'src' : '',
                'poster' : '',
                'width' : '',
                'height' : ''
            }
        }
    };
    _LAYOUT.sources.samples = _LAYOUT.sources.samples || {};

    andrea.blink.declare('andrea.grace.DataSource');
    var DataSource = grace.DataSource = function(div) {
        DataSource.superclass.constructor.apply(this, arguments);

        this._$main = $('#divDataSourceMain', this._dom);
        this._$main.empty();
        this._$main.css({
            'height' : this._$dom.height() - 48 - 66
        });

        this._$header = $('#divHeader', this._dom);
        this._$header.on('click', function() {
            window.location.href = grace.Settings.home;
        });

        this._loading = null;

        this._dsMap = {};

        this._json = null;
        this._file = null;
        this._taobao = null;
        this._jingdong = null;

        // Create container
        var layoutContainer = _LAYOUT.sources.container;
        var $container = this._generateCell(0, 0, layoutContainer.numCells.horizontal, layoutContainer.numCells.vertical).addClass('grace-dataSource-main-container').appendTo(this._$main);
        $container.css({
            'position' : 'absolute',
            'left' : (this._$main.width() - $container.width()) / 2,
            'top' : (this._$main.height() - $container.height()) / 2
        });
        if (_LAYOUT.guide.video) {
            var videoSize = {
                'width' : 480,
                'height' : 270
            };
            var $videoContainer = $('<div/>').appendTo(this._$main);
            $videoContainer.css({
                'position' : 'absolute',
                'left' : (this._$main.width() - 800) / 2,
                'top' : Math.max(12, (this._$main.height() - $container.height()) / 2 - 60)
            });
            $container.css({
                'left' : parseFloat($container.css('left')) + videoSize.width / 2 + 6,
                'top' : (this._$main.height() - $container.height()) / 2 + 0
            });

            var $video = $('<video controls/>');
            $video.addClass('video-js vjs-default-skin vjs-big-play-centered');
            $video.attr({
                'id' : 'videoGuide',
                'preload' : 'none',
                'width' : videoSize.width,
                'height' : videoSize.height,
                'poster' : './DataDiscovery/assets/videos/guide_poster.jpg',
                'data-setup' : '{}'
            });
            var $source = $('<source/>').appendTo($video);
            $source.attr({
                'src' : './DataDiscovery/assets/videos/guide.mp4',
                'type' : 'video/mp4'
            });

            $video.appendTo($videoContainer);
        }

        if ($.browser.webkit) {
            // Chrome, Safari
            this._createChildren($container);
        } else {
            // Browser fail
            alertify.reset();
            alertify.set({
                'delay' : 1000 * 60 * 60
            });
            alertify.error('请通过谷歌浏览器使用易分析！');

            var $chrome = this._generateCell(0, 0, 3, 2).appendTo($container);
            $chrome.text('下载谷歌浏览器...').addClass('grace-dataSource-chrome');
            $chrome.css('line-height', $chrome.height() + 'px');
            $chrome.on('click', $.proxy(function(event) {
                window.location = grace.Settings.chrome.localURL;
            }, this));

            var $download = $('<a/>').appendTo($container).addClass('grace-dataSource-chrome-official');
            $download.text('官方下载…').css('color', '#ffffff');
            $download.attr({
                'target' : '_blank',
                'href' : grace.Settings.chrome.officialURL
            }).on('click', function(event) {
                event.stopPropagation();
            });
        }
        // Parse URL
        var hashPairs = URLUtil.hashPairs();
        if (hashPairs.dataSource && this._dsMap[hashPairs.dataSource]) {
            // Data source
            var ds = this._dsMap[hashPairs.dataSource];
            ds.loadURL(hashPairs);
        } else if (hashPairs.collab) {
            // Collaboration
            SerializeManager.instance().deserialize(hashPairs.collab);
        }

        this._hookupAPI();
    };
    andrea.blink.extend(DataSource, andrea.blink.mvc.View);

    DataSource.prototype.destroy = function() {
        if (this._loading) {
            this._loading.close();
            this._loading = null;
        }
        if (_LAYOUT.guide.video) {
            videojs('videoGuide').dispose();
        }
    };
    DataSource.prototype._hookupAPI = function() {
        andrea.blink.declare('andrea.grace._api.dataSource.dataProvider');
        andrea.grace._api.dataSource.dataProvider.load = $.proxy(function(dataProvider) {
            // Do not support dsInfo
            _.defer($.proxy(this._dpReady, this), dataProvider, null);
        }, this);
    };
    DataSource.prototype._dpReady = function(dataProvider, dsInfo) {
        this.dispatchEvent(new DataSourceEvent(DataSourceEvent.DATA_PROVIDER_READY, this, {
            'dataProvider' : dataProvider,
            'dsInfo' : dsInfo
        }));
    };
    DataSource.prototype._listen = function(ds) {
        ds.addEventListener(DataSourceEvent.STATE_CHANGED, function(event) {
            if (ds.state() === DataSourceBase.STATE_LOADING) {
                var progress = ds.progress();
                if (!this._loading) {
                    if (progress !== null) {
                        this._loading = new Loading($('<div/>'), '');
                    } else {
                        this._loading = new Loading($('<div/>'));
                    }
                    this._loading.open(this._$main, true);
                }
                if (progress !== null) {
                    this._loading.percent(progress);
                }
            } else {
                if (this._loading) {
                    this._loading.close();
                    this._loading = null;
                }
            }
        }, this);
        ds.addEventListener(DataSourceEvent.DATA_PROVIDER_READY, function(event) {
            this._dpReady(event.data.dataProvider, event.data.dsInfo);
        }, this);
        return ds;
    };
    DataSource.prototype._createChildren = function($container) {
        var create = $.proxy(function(clazz, layout, settings) {
            var div = null;
            if (layout) {
                div = this._generateCell(layout[0], layout[1], layout[2], layout[3], $container);
            }
            var ds = new clazz(div, settings);
            this._listen(ds);

            if (ds.keyword()) {
                this._dsMap[ds.keyword()] = ds;
            }
            return ds;
        }, this);

        create(DataSourceJSON, _LAYOUT.sources.json);
        create(DataSourceJSONP, _LAYOUT.sources.jsonp);
        create(File, _LAYOUT.sources.file);
        create(Taobao, _LAYOUT.sources.taobao);
        create(Jingdong, _LAYOUT.sources.jingdong);
        create(Customize, _LAYOUT.sources.customize);
        create(Sample, _LAYOUT.sources.samples.superMarket, {
            'name' : 'SuperMarket',
            'json' : grace.Settings.data.superMarket.json,
            'captions' : ['[演示] 大型超市', '销售数据'],
            'description' : '时间、空间、产品、客户等多维度查看及分析超市的销售状况。',
            'download' : grace.Settings.data.superMarket.excel
        });
        create(Sample, _LAYOUT.sources.samples.worldBank, {
            'name' : 'WorldBank',
            'json' : grace.Settings.data.worldBank.json,
            'captions' : ['[演示] 世界银行', '各国数据指标'],
            'description' : '世界银行公布的各国数据指标。涵盖股市、金融、商业等。',
            'download' : grace.Settings.data.worldBank.excel
        });
    };
    DataSource.prototype._generateCell = function(x, y, w, h, $container) {
        var layoutContainer = _LAYOUT.sources.container;
        var gap = layoutContainer.gap;
        var cell = layoutContainer.cell;
        var $div = $('<div/>');
        $div.css({
            'width' : cell.width * w + gap.horizontal * (w - 1) + 'px',
            'height' : cell.height * h + gap.vertical * (h - 1) + 'px',
            'left' : x * (cell.width + gap.horizontal) + 'px',
            'top' : y * (cell.height + gap.vertical) + 'px'
        });

        $div.appendTo($container);
        return $div;
    };
})();
