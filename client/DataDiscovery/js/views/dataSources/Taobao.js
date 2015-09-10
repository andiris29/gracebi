(function() {
    var grace = andrea.grace;

    var URLUtil = grace.utils.URLUtil;
    var Log = grace.managers.Log;
    var Stopwatch = grace.utils.Stopwatch;
    var TaobaoAPI = grace.constants.TaobaoAPI;
    var ConverterType = grace.utils.ConverterType;
    var AnalysisType = grace.constants.AnalysisType;
    var DataSourceBase = andrea.grace.views.dataSources.DataSourceBase;

    // var _cdaSettings = grace.Settings.crossDomainAccessor;
    var _taobaoSettings = grace.Settings.dataSource.taobao;
    var _topEnvironment = _taobaoSettings.environments[_taobaoSettings.environment];

    andrea.blink.declare('andrea.grace.views.dataSources.Taobao');
    var Taobao = andrea.grace.views.dataSources.Taobao = function(div) {
        Taobao.superclass.constructor.apply(this, arguments);

        this._watch = null;

        this._hookupAPI();
        this._createChildren();
    };
    andrea.blink.extend(Taobao, andrea.grace.views.dataSources.DataSourceBase);

    Taobao.prototype.loadURL = function(hashPairs) {
        if (hashPairs.taobao_user_nick) {
            this.state(DataSourceBase.STATE_LOADING);
            this._load(hashPairs);
        } else if (hashPairs.code && hashPairs.codeOverdue !== 'true') {
            this.state(DataSourceBase.STATE_LOADING);
            $.ajax({
                'url' : grace.Settings.javaServer + '/java/taobao/oauth?method=token',
                'dataType' : 'jsonp',
                'data' : {
                    'code' : hashPairs.code,
                    'state' : hashPairs.state,
                    'appKey' : _topEnvironment.appKey,
                    'redirect_uri' : _topEnvironment.redirect
                }
            }).done($.proxy(function(data) {
                Log.interaction('dataSource', ['taobao', JSON.stringify(data)].join(','));
                window.location.hash = 'codeOverdue=true';
                this._load(data);
            }, this)).fail($.proxy(function() {
                Log.console('taobao token fail.');
            }, this));
        } else if (hashPairs.error) {
            Log.interaction('authorizeError', [hashPairs.error, hashPairs.error_description.replace(/,/g, '|')]);
            if (hashPairs.error === 'invalid_client') {
                alertify.prompt('请留下您的店铺或联系方式：', function(e, str) {
                    if (e) {
                        var shop = str;
                        Log.interaction('authorize', [shop, '', 'taobao']);
                        alertify.alert('您的信息已保存，谢谢。');
                    } else {
                    }
                });
            }
        }
    };
    Taobao.prototype.keyword = function() {
        return 'taobao';
    };
    Taobao.prototype._hookupAPI = function() {
        andrea.blink.declare('andrea.grace._api.dataSource.taobao');

        andrea.grace._api.dataSource.taobao.load = $.proxy(function(options) {
            _.defer($.proxy(this._load, this), options);
        }, this);
    };

    Taobao.prototype._load = function(options) {
        this._options = options;

        this._watch = new Stopwatch([options.taobao_user_id, options.taobao_user_nick].join(','), true);
        Log.interaction('dataSource', ['taobao', options.taobao_user_id, options.taobao_user_nick].join(','));

        $.ajax({
            'url' : _taobaoSettings.serviceURL,
            'dataType' : 'jsonp',
            'data' : {
                'nick' : options.taobao_user_nick
            }
        }).done($.proxy(function(data) {
            Log.performance('loadTaobaoTrades', [this._watch.type, 'loadData', this._watch.lap()].join(','));

            var i, j, k;
            var trades = data;
            var rows = [];
            var columnDescriptors = this._generateColumnDescriptors();

            for ( i = 0; i < trades.length; i++) {
                var t = trades[i];
                var orders = t.orders;
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
            Log.performance('loadTaobaoTrades', [this._watch.type, 'parseComplete', this._watch.lap(true), this._watch.total()].join(','));
            this._dpReady({
                'rows' : rows,
                'columnDescriptors' : columnDescriptors,
                'source' : 'taobao'
            });
        }, this));

    };
    Taobao.prototype._createChildren = function() {
        var $container = this._$dom.clone().appendTo(this._$dom);
        $container.on('click', $.proxy(function(event) {
            this._authorize();
        }, this));

        this._generateButton($container, {
            'color' : '#ff692f',
            'captions' : ['淘宝/天猫', '卖家']
        });
    };
    Taobao.prototype._authorize = function() {
        // Taobao OAuth
        var urlVariables = [];
        urlVariables.push(['client_id', _topEnvironment.appKey].join('='));
        urlVariables.push(['response_type', 'code'].join('='));
        urlVariables.push(['redirect_uri', _topEnvironment.redirect + '?dataSource=taobao'].join('='));
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
        columnDescriptors.push(genColumn('created', '交易创建时间', ConverterType.DATE_IN_TEXT, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('status', '交易状态', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('receiver_state', '收货人省份', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('receiver_city', '收货人城市', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('has_yfx', '包含运费险', ConverterType.BOOLEAN, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('trade_from', '交易来源', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('orders.title', '商品标题', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('orders.logistics_company', '快递公司', ConverterType.STRING, AnalysisType.DIMENSION));

        columnDescriptors.push(genColumn('orders.total_fee', '交易金额', ConverterType.NUMBER, AnalysisType.MEASURE));
        columnDescriptors.push(genColumn('orders.price', '商品单价', ConverterType.NUMBER, AnalysisType.MEASURE));
        columnDescriptors.push(genColumn('orders.num', '商品数量', ConverterType.NUMBER, AnalysisType.MEASURE));

        return columnDescriptors;
    };
})();
