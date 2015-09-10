(function() {
    var grace = andrea.grace;
    var MoreButton = grace.views.components.MoreButton;
    var DataSourceEvent = grace.views.analysisContainer.events.DataSourceEvent;
    var URLUtil = grace.utils.URLUtil;
    var AnalysisType = grace.constants.AnalysisType;
    var Taobao = grace.constants.Taobao;
    var ConverterType = grace.utils.ConverterType;
    var Loading = grace.views.popUp.Loading;
    var Stopwatch = grace.utils.Stopwatch;
    var Log = grace.managers.Log;

    andrea.blink.declare('andrea.grace.DataSource');
    var DataSource = grace.DataSource = function(div) {
        DataSource.superclass.constructor.apply(this, arguments);

        this._$main = $('#divDataSourceMain', this._$dom);
        this._$main.empty();

        this._loading = null;

        this._btnAnalysis = null;
        this._$btnAnalysis = null;

        this._watch
        this._cdaReady = false;
        this._cdsNumTrades = 0;

        this._dp = null;

        // Create container
        var $container = this._genCell(0, 0, 3, 2).addClass('grace-dataSource-main-container').appendTo(this._$main);
        $container.css({
            'position' : 'absolute',
            'left' : (this._$main.width() - $container.width()) / 2,
            'top' : (this._$main.height() - $container.height()) / 2
        });

        if ($.browser.webkit) {
            // Chrome, Safari
            this._createChildren($container);
        } else {
            // Browser fail
            var $chrome = this._genCell(0, 0, 3, 2).appendTo($container);
            $chrome.text('请通过谷歌浏览器使用易分析！').addClass('grace-dataSource-chrome')
            $chrome.css('line-height', $chrome.height() + 'px');
            $chrome.on('click', $.proxy(function(event) {
                window.location = grace.Settings.chrome.localURL
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
        if (hashPairs.dataSource === 'taobao') {
            this._gotoTaobao();
        }
    };
    andrea.blink.extend(DataSource, andrea.blink.mvc.View);

    DataSource.prototype._gotoTaobao = function() {
        var hashPairs = URLUtil.hashPairs();
        var cdaSettings = grace.Settings.crossDomainAccessor;

        if (hashPairs.access_token && hashPairs.taobao_user_id && hashPairs.taobao_user_nick) {
            // Taobao OAuth redirect
            this._watch = new Stopwatch([hashPairs.taobao_user_id, hashPairs.taobao_user_nick].join(','), true);
            this._addLoading('', 0);
            this._getCrossDomainAccessor($.proxy(function(cda) {
                cda.setAccessToken(hashPairs.access_token);
                var fields = [];
                for (var i = 0; i < this._dp.columnDescriptors.length; i++) {
                    fields.push(this._dp.columnDescriptors[i].id)
                }
                Log.interaction('dataSource', ['taobao', hashPairs.taobao_user_id, hashPairs.taobao_user_nick].join(','));
                cda.load(cdaSettings.taobao.trade.maxResults, fields.join(','));
                Log.performance('loadTaobaoTrades', [this._watch.type, 'loadSWF', this._watch.lap()].join(','));
            }, this));
        } else if (hashPairs.error) {
            Log.interaction('authorizeError', [hashPairs.error, hashPairs.error_description.replace(/,/g, '|')]);
            if (hashPairs.error === 'invalid_client') {
                var shop = prompt('留下您的 店铺。(店铺网址/店铺名称 均可)\n应用尚未正式发布需要手动设置授权。');
                var contact = prompt('留下您的 联系方式。以便完成授权之后通知您。\n(邮箱/QQ/微博 均可)');
                Log.interaction('authorize', [shop, contact]);
                if (shop && contact) {
                    alert('您的店铺已保存，完成授权预计需要一天，请稍候。\n完成后会通知到您。');
                } else if (shop) {
                    alert('您的店铺已保存，完成授权预计需要一天，请稍候。');
                }
            }
        } else {
            // Taobao OAuth
            var urlVariables = [];
            urlVariables.push(['client_id', cdaSettings.taobao.appKey].join('='));
            urlVariables.push(['response_type', 'token'].join('='));
            urlVariables.push(['redirect_uri', cdaSettings.taobao.redirect + '?dataSource=taobao'].join('='));
            window.location.href = 'https://oauth.taobao.com/authorize?' + urlVariables.join('&');
        }
    };
    DataSource.prototype.destroy = function() {
        this._loading.close();
    }
    DataSource.prototype.faHoverHandler = function(hover) {
        if (hover) {
            this._btnAnalysis.showP2();
        } else {
            this._btnAnalysis.showP1();
        }
    };
    DataSource.prototype.faClickHandler = function(hover) {
        this._addLoading();
    };
    DataSource.prototype.faCancelHandler = function() {
        this._removeLoading();
    };

    DataSource.prototype.faDataHandler = function(name, rows, columnDescriptors) {
        // Write some log for eg
        if (grace.Settings.debug.egJS) {
            var egJS = grace.Settings.debug.egJS;
            var lines = [];
            lines.push('(function() {');
            lines.push('var grace = andrea.grace;');
            lines.push('andrea.blink.declare("andrea.grace.eg.' + egJS + '");');
            lines.push('var ' + egJS + ' = grace.eg.' + egJS + ' = function() {');
            lines.push('this.columnDescriptors = \'' + columnDescriptors.replace(/\'/g, '\\\'') + '\';');
            lines.push('this.rows = \'' + rows.replace(/\'/g, '\\\'') + '\';');
            lines.push('}');
            lines.push('})();');
            console.log(lines.join('\n'));
        }
        Log.interaction('dataSource', ['file', this._decode(name)].join(','));
        this._stringDataHandler(rows, columnDescriptors);
    };
    DataSource.prototype.cdaReadyHandler = function() {
        this._cdaReady = true;

        var columnDescriptors = [];
        var genColumn = function(id, name, converterType, analysisType) {
            return {
                'id' : id,
                'name' : name,
                'converterType' : converterType,
                'analysisType' : analysisType
            }
        }
        columnDescriptors.push(genColumn('status', '交易状态', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('type', '交易类型', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('created', '交易创建时间', ConverterType.DATE, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('buyer_nick', '买家昵称', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('receiver_state', '收货人省份', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('receiver_city', '收货人城市', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('has_yfx', '包含运费险', ConverterType.BOOLEAN, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('shipping_type', '物流方式', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('trade_from', '交易来源', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('orders.title', '商品标题', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('orders.logistics_company', '快递公司', ConverterType.STRING, AnalysisType.DIMENSION));

        columnDescriptors.push(genColumn('orders.price', '商品价格', ConverterType.NUMBER, AnalysisType.MEASURE));
        columnDescriptors.push(genColumn('orders.num', '购买数量', ConverterType.NUMBER, AnalysisType.MEASURE));
        columnDescriptors.push(genColumn('orders.total_fee', '应付金额', ConverterType.NUMBER, AnalysisType.MEASURE));
        this._dp = {
            'rows' : [],
            'columnDescriptors' : columnDescriptors,
            'source' : 'taobao'
        };
    };
    DataSource.prototype.cdaDataHandler = function(response) {
        Log.performance('loadTaobaoTrades', [this._watch.type, 'loadData', this._watch.lap()].join(','));
        var i, j, k;
        response = this._decode(response);
        var trades = response.trades_sold_get_response.trades.trade;
        var rows = this._dp.rows;
        var columnDescriptors = this._dp.columnDescriptors;
        this._cdsNumTrades += trades.length;
        for ( i = 0; i < trades.length; i++) {
            var t = trades[i];
            var orders = t.orders.order;
            for ( j = 0; j < orders.length; j++) {
                var o = orders[j];
                var row = [];
                for ( k = columnDescriptors.length - 1; k >= 0; k--) {
                    var cd = columnDescriptors[k];
                    var id = cd.id;
                    var path = id.split('.');
                    if (path[0] === 'orders') {
                        id = path[1];
                        row[k] = Taobao.toCaption(o[id], 'order', id);
                    } else {
                        id = path[0];
                        row[k] = Taobao.toCaption(t[id], 'trade', id);
                    }
                }
                rows.push(row);
            }
        }

        var cdaSettings = grace.Settings.crossDomainAccessor;
        var dataPercent = this._cdsNumTrades / Math.min(cdaSettings.taobao.trade.maxResults, response.trades_sold_get_response.total_results);
        this._loading.percent(dataPercent);
    };
    DataSource.prototype.cdaCompleteHandler = function() {
        Log.performance('loadTaobaoTrades', [this._watch.type, 'loadComplete', this._watch.lap(true), this._watch.total()].join(','));
        this._dpReady();
    };
    DataSource.prototype._getCrossDomainAccessor = function(callback) {
        var check = $.proxy(function() {
            var $cda = $('#CrossDomainAccessor');
            if ($cda[0] && this._cdaReady) {
                callback($cda[0]);
            } else {
                _.delay(check, 500);
            }
        }, this);
        check();
    }
    DataSource.prototype._stringDataHandler = function(rows, columnDescriptors) {
        this._dp = {
            'rows' : _.isString(rows) ? this._decode(rows) : rows,
            'columnDescriptors' : _.isString(columnDescriptors) ? this._decode(columnDescriptors) : columnDescriptors,
            'source' : 'excel'
        };
        this._dpReady();
    };
    DataSource.prototype._encode = function(o) {
        var s = JSON.stringify(o);
        s = s.replace(/%/g, '%25');
        s = s.replace(/\\/g, '%5C');
        s = s.replace(/\"/g, '%22');
        return s;
    };
    DataSource.prototype._decode = function(s) {
        s = s.replace(/%22/g, '\"');
        s = s.replace(/%5C/g, '\\');
        s = s.replace(/%25/g, '%');
        return JSON.parse(s);
    };
    DataSource.prototype._addLoading = function(label, percent) {
        this._loading = new Loading($('<div/>'), label, percent);
        this._loading.open(this._$main, true);
    };
    DataSource.prototype._removeLoading = function() {
        this._loading.close();
    };

    DataSource.prototype._loadEg = function(jsPath, jsClassName) {
        this._addLoading();
        LazyLoad.js([jsPath], $.proxy(function() {
            var eg = new grace.eg[jsClassName]();
            Log.interaction('dataSource', ['sample', jsClassName].join(','));
            this._stringDataHandler(eg.rows, eg.columnDescriptors);
        }, this));
    };
    DataSource.prototype._dpReady = function() {
        this.dispatchEvent(new DataSourceEvent(DataSourceEvent.DATA_SOURCE_READY, this, this._dp));
    };
    DataSource.prototype._createChildren = function($container) {
        var $swf;
        var w, h;
        // Analysis excel
        var $btnAnalysis = this._$btnAnalysis = this._createButtonAnalysis(this._genCell(0, 0, 2, 1), $container);

        $swf = $('<div/>').appendTo($container);
        w = $btnAnalysis.width();
        h = $btnAnalysis.height();
        var faSettings = grace.Settings.fileAccessor;
        this._embedFlash($('<div/>').appendTo($swf), faSettings.name, faSettings.swfURL, 'transparent', w, h, {
            'alpha' : 0,
            'width' : w,
            'height' : h,
            'hoverCallback' : 'andrea.grace.Grace.faHoverCallback',
            'clickCallback' : 'andrea.grace.Grace.faClickCallback',
            'cancelCallback' : 'andrea.grace.Grace.faCancelCallback',
            'dataCallback' : 'andrea.grace.Grace.faDataCallback',
            'logFileURL' : grace.Settings.logFile.url
        });
        $swf.css({
            'z-index' : 10000,
            'position' : 'absolute',
            'left' : parseFloat($btnAnalysis.css('left')) + 1,
            'top' : parseFloat($btnAnalysis.css('top')) + 1,
            'width' : w,
            'height' : h
        });
        // Taobao
        var cdaSettings = grace.Settings.crossDomainAccessor;
        this._createButton(this._genCell(0, 1, 1, 1), $container, {
            'color' : '#ff692f',
            'captions' : ['淘宝', '销售分析'],
            'description' : '分析卖家的近3个月销售数据。'
        }).on('click', $.proxy(function(event) {
            this._gotoTaobao();
        }, this));
        $swf = $('<div/>').appendTo($container);
        w = h = 1;
        this._embedFlash($('<div/>').appendTo($swf), cdaSettings.name, cdaSettings.swfURL, 'window', w, h, {
            'readyCallback' : 'andrea.grace.Grace.cdaReadyCallback',
            'dataCallback' : 'andrea.grace.Grace.cdaDataCallback',
            'completeCallback' : 'andrea.grace.Grace.cdaCompleteCallback'
        });
        $swf.css('visibility', 'hidden');
        // Customize data source
        this._createButton(this._genCell(1, 1, 1, 1), $container, {
            'color' : '#3498db',
            'captions' : ['定制', '我的数据源…'],
            'description' : '创建专属于您的数据源。请邮件至andiris29@gmail.com'
        }).on('click', $.proxy(function(event) {
            window.location.href = 'mailto:andiris29@gmail.com?subject=添加定制数据源&body=<请描述您的数据源（如数据库地址、网页地址等）。作者会在至多2个工作日内给您回复。';
        }, this));
        // Eg 1
        this._createButton(this._genCell(2, 0, 1, 1), $container, {
            'name' : 'SuperMarket',
            'color' : '#e74c3c',
            'captions' : ['样例', '超市销售'],
            'description' : '时间、空间、产品、客户等多维度查看及分析超市的销售状况。',
            'link' : {
                'text' : '下载数据…',
                'url' : grace.Settings.data.superMarket.excel
            }
        }).on('click', $.proxy(function(event) {
            this._loadEg(grace.Settings.data.superMarket.js, 'SuperMarket');
        }, this));
        // Eg 2
        this._createButton(this._genCell(2, 1, 1, 1), $container, {
            'color' : '#e74c3c',
            'captions' : ['样例', '世界银行'],
            'description' : '世界银行公布的各国数据指标。涵盖股市、金融、商业等。',
            'link' : {
                'text' : '下载数据…',
                'url' : grace.Settings.data.worldBank.excel
            }
        }).on('click', $.proxy(function(event) {
            this._loadEg(grace.Settings.data.worldBank.js, 'WorldBank');
        }, this));
    };
    DataSource.prototype._genCell = function(x, y, w, h) {
        var gap = {
            'horizontal' : 30,
            'vertical' : 20
        };
        var cell = {
            'width' : 160,
            'height' : 100
        };
        var $div = $('<div/>');
        $div.css({
            'width' : cell.width * w + gap.horizontal * (w - 1) + 'px',
            'height' : cell.height * h + gap.vertical * (h - 1) + 'px',
            'left' : x * (cell.width + gap.horizontal) + 'px',
            'top' : y * (cell.height + gap.vertical) + 'px'
        });
        return $div;
    };
    DataSource.prototype._embedFlash = function($ph, name, swfURL, wmode, w, h, flashvars) {
        var uid = _.uniqueId('flashContent_');

        var params = {};
        params.quality = 'high';
        params.bgcolor = '#ffffff';
        params.allowscriptaccess = 'sameDomain';
        params.allowfullscreen = 'true';
        params.wmode = wmode;
        var attributes = {};
        attributes.id = name;
        attributes.name = name;
        attributes.align = 'middle';

        $ph.attr('id', uid);
        swfobject.embedSWF(swfURL, uid, w, h, '11.0.0', null, flashvars, params, attributes);
    };

    DataSource.prototype._createButtonAnalysis = function($cell, $parent) {
        var $dom = $cell.addClass('grace-dataSource-main-analysis');
        var $more = $('<div/>').appendTo($dom).addClass('grace-dataSource-main-analysis-more');
        // P1
        var $p1 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-analysis-p1').css('line-height', $cell.height() + 'px');
        $('<span/>').appendTo($p1).text('数据文件');
        // P2
        var $p2 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-analysis-p2');
        $('<div/>').appendTo($p2).addClass('grace-dataSource-main-analysis-p2-ribbon');
        $('<div/>').appendTo($p2).addClass('grace-dataSource-main-analysis-p2-text').text('分析数据文件').css('line-height', $cell.height() + 'px');
        var $type = $('<div/>').appendTo($p2).addClass('grace-dataSource-main-analysis-p2-type');
        $('<div/>').appendTo($type).addClass('grace-dataSource-main-analysis-p2-type-icon');
        $('<div/>').appendTo($type).addClass('grace-dataSource-main-analysis-p2-type-text').text('2007,2003,CSV');
        // More button
        this._btnAnalysis = new MoreButton($more[0]);

        $dom.appendTo($parent);
        return $dom;
    };
    /**
     *
     * @param {Object} settings {
     * 	   color,
     *     caption,
     *     description
     * }
     */
    DataSource.prototype._createButton = function($cell, $parent, settings) {
        var $dom = $cell.addClass('grace-dataSource-main-example').appendTo($parent);
        var $more = $('<div/>').appendTo($dom).addClass('grace-dataSource-main-example-more');
        // P1
        var $p1 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-example-p1').css('background-color', settings.color);
        var $caption = $('<div/>').appendTo($p1).addClass('grace-dataSource-main-example-p1-caption');
        _.each(settings.captions, function(caption) {
            $('<span/>').appendTo($caption).text(caption);
            $('<br/>').appendTo($caption).css('line-height', 30 + 'px');
        });
        $caption.children().last().detach();
        $caption.css({
            'top' : ($cell.height() - $caption.height()) / 2,
            'left' : ($cell.width() - $caption.width()) / 2
        })
        // P2
        var $p2 = $('<div/>').appendTo($more).addClass('grace-dataSource-main-example-p2');
        $('<div/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-ribbon').css('background-color', settings.color);
        $('<div/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-icon');
        $('<div/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-text').text(settings.description);

        if (settings.link) {
            var $download = $('<a/>').appendTo($p2).addClass('grace-dataSource-main-example-p2-download');
            $download.text(settings.link.text).css('color', settings.color);
            $download.attr({
                'target' : '_blank',
                'href' : settings.link.url,
                'title' : '右键，另存为…'
            });
            $download.on('click', function(event) {
                event.stopPropagation();
            });
        }
        // More button
        new MoreButton($more[0]);

        return $dom;
    };
})();
