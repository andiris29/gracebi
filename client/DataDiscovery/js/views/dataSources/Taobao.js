(function() {
    var grace = andrea.grace;

    var URLUtil = grace.utils.URLUtil;
    var Log = grace.managers.Log;
    var Stopwatch = grace.utils.Stopwatch;
    var TaobaoAPI = grace.constants.TaobaoAPI;
    var ConverterType = grace.utils.ConverterType;
    var AnalysisType = grace.constants.AnalysisType;

    andrea.blink.declare('andrea.grace.views.dataSources.Taobao');
    var Taobao = andrea.grace.views.dataSources.Taobao = function(div) {
        Taobao.superclass.constructor.apply(this, arguments);

        this._watch = null;
        this._cdaNumTrades = 0;

        this._rows = [];
        this._columnDescriptors = this._generateColumnDescriptors();

        this._hookupAPI();
        this._createChildren();
    };
    andrea.blink.extend(Taobao, andrea.grace.views.dataSources.DataSourceBase);

    Taobao.prototype.loadURL = function(hashPairs) {
        var cdaSettings = grace.Settings.crossDomainAccessor;
        if (hashPairs.access_token && hashPairs.taobao_user_id && hashPairs.taobao_user_nick) {
            this._options = hashPairs;
            // Taobao OAuth redirect
            this._watch = new Stopwatch([hashPairs.taobao_user_id, hashPairs.taobao_user_nick].join(','), true);
            this.progress(0);
            this._getSWF('#CrossDomainAccessor', $.proxy(function(swf) {
                swf.setAccessToken(hashPairs.access_token);
                var fields = [];
                for (var i = 0; i < this._columnDescriptors.length; i++) {
                    fields.push(this._columnDescriptors[i].id);
                }
                Log.interaction('dataSource', ['taobao', hashPairs.taobao_user_id, hashPairs.taobao_user_nick].join(','));
                swf.load(cdaSettings.taobao.trade.maxResults, fields.join(','));
                Log.performance('loadTaobaoTrades', [this._watch.type, 'loadSWF', this._watch.lap()].join(','));
            }, this));
        } else if (hashPairs.error) {
            Log.interaction('authorizeError', [hashPairs.error, hashPairs.error_description.replace(/,/g, '|')]);
            if (hashPairs.error === 'invalid_client') {
                var shop = prompt('留下您的 店铺。(店铺网址/店铺名称 均可)\n应用尚未正式发布需要手动设置授权。');
                var contact = prompt('留下您的 联系方式。以便完成授权之后通知您。\n(邮箱/QQ/微博 均可)');
                Log.interaction('authorize', [shop, contact, 'taobao']);
                if (shop && contact) {
                    alert('您的店铺已保存，完成授权预计需要一天，请稍候。\n完成后会通知到您。');
                } else if (shop) {
                    alert('您的店铺已保存，完成授权预计需要一天，请稍候。');
                }
            }
        }
    };
    Taobao.prototype.keyword = function() {
        return 'taobao';
    };
    Taobao.prototype._hookupAPI = function() {
        andrea.blink.declare('andrea.grace._api.dataSource.taobao');

        andrea.grace._api.dataSource.taobao.cdaReadyCallback = $.proxy(function() {
            _.defer($.proxy(this._swfReadyHandler, this));
        }, this);
        andrea.grace._api.dataSource.taobao.cdaDataCallback = $.proxy(function(response) {
            _.defer($.proxy(this._cdaDataHandler, this), response);
        }, this);
        andrea.grace._api.dataSource.taobao.cdaCompleteCallback = $.proxy(function() {
            _.defer($.proxy(this._cdaCompleteHandler, this));
        }, this);
    };
    Taobao.prototype._createChildren = function() {
        var $container = this._$dom.clone().appendTo(this._$dom);
        $container.on('click', $.proxy(function(event) {
            this._authorize();
        }, this));

        var cdaSettings = grace.Settings.crossDomainAccessor;
        this._generateButton($container, {
            'color' : '#ff692f',
            'captions' : ['淘宝|天猫', '卖家']
        });
        // SWF
        var $swf = $('<div/>').appendTo($container);
        var w, h;
        w = h = 1;
        this._embedSWF($('<div/>').appendTo($swf), cdaSettings.name, cdaSettings.swfURL, 'window', w, h, {
            'appKey' : cdaSettings.taobao.appKey,
            'readyCallback' : 'andrea.grace._api.dataSource.taobao.cdaReadyCallback',
            'dataCallback' : 'andrea.grace._api.dataSource.taobao.cdaDataCallback',
            'completeCallback' : 'andrea.grace._api.dataSource.taobao.cdaCompleteCallback'
        });
        $swf.css('visibility', 'hidden');
    };
    Taobao.prototype._authorize = function() {
        var cdaSettings = grace.Settings.crossDomainAccessor;
        // Taobao OAuth
        var urlVariables = [];
        urlVariables.push(['client_id', cdaSettings.taobao.appKey].join('='));
        urlVariables.push(['response_type', 'token'].join('='));
        urlVariables.push(['redirect_uri', cdaSettings.taobao.redirect + '?dataSource=taobao'].join('='));
        window.location.href = 'https://oauth.taobao.com/authorize?' + urlVariables.join('&');
    };
    Taobao.prototype._generateColumnDescriptors = function() {
        var columnDescriptors = [];
        var genColumn = function(id, name, converterType, analysisType) {
            return {
                'id' : id,
                'name' : name,
                'converterType' : converterType,
                'analysisType' : analysisType
            };
        };
        columnDescriptors.push(genColumn('status', '交易状态', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('type', '交易类型', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('created', '交易创建时间', ConverterType.DATE_IN_TEXT, AnalysisType.DIMENSION));
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

        return columnDescriptors;
    };
    Taobao.prototype._cdaDataHandler = function(response) {
        Log.performance('loadTaobaoTrades', [this._watch.type, 'loadData', this._watch.lap()].join(','));
        var i, j, k;
        response = this._decode(response);

        if (response.trades_sold_get_response.total_results > 0) {
            var trades = response.trades_sold_get_response.trades.trade;
            var rows = this._rows;
            var columnDescriptors = this._columnDescriptors;
            this._cdaNumTrades += trades.length;
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
                            row[k] = TaobaoAPI.toCaption(o[id], 'order', id);
                        } else {
                            id = path[0];
                            row[k] = TaobaoAPI.toCaption(t[id], 'trade', id);
                        }
                    }
                    rows.push(row);
                }
            }

            var cdaSettings = grace.Settings.crossDomainAccessor;
            var dataPercent = this._cdaNumTrades / Math.min(cdaSettings.taobao.trade.maxResults, response.trades_sold_get_response.total_results);
            this.progress(dataPercent);
        }
    };
    Taobao.prototype._cdaCompleteHandler = function() {
        Log.performance('loadTaobaoTrades', [this._watch.type, 'loadComplete', this._watch.lap(true), this._watch.total()].join(','));
        this._dpReady({
            'rows' : this._rows,
            'columnDescriptors' : this._columnDescriptors,
            'source' : 'taobao'
        });
    };
})();
