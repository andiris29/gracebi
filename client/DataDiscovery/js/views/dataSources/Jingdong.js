(function() {
    var grace = andrea.grace;

    var URLUtil = grace.utils.URLUtil;
    var DataSourceBase = andrea.grace.views.dataSources.DataSourceBase;
    var Log = grace.managers.Log;
    var Stopwatch = grace.utils.Stopwatch;
    var JingdongAPI = grace.constants.JingdongAPI;
    var ConverterType = grace.utils.ConverterType;
    var AnalysisType = grace.constants.AnalysisType;

    andrea.blink.declare('andrea.grace.views.dataSources.Jingdong');
    var Jingdong = andrea.grace.views.dataSources.Jingdong = function(div) {
        Jingdong.superclass.constructor.apply(this, arguments);

        this._watch = null;
        this._accessToken = null;

        this._rows = [];
        this._columnDescriptors = this._generateColumnDescriptors();

        this._hookupAPI();
        this._createChildren();
    };
    andrea.blink.extend(Jingdong, andrea.grace.views.dataSources.DataSourceBase);

    Jingdong.prototype.loadURL = function(hashPairs) {
        var jingdong = grace.Settings.dataSource.jingdong;
        if (hashPairs.code && hashPairs.codeOverdue !== 'true') {
            this._options = hashPairs;
            $.ajax({
                'url' : grace.Settings.javaServer + '/dataAccessor/jd?method=token',
                'dataType' : 'jsonp',
                'data' : {
                    'oauth' : jingdong.oauth,
                    'code' : hashPairs.code,
                    'state' : hashPairs.state,
                    'appKey' : jingdong.appKey,
                    'redirect_uri' : jingdong.redirect + '?dataSource=jd'
                }
            }).done($.proxy(function(data) {
                Log.interaction('dataSource', ['jingdong', JSON.stringify(data)].join(','));
                window.location.hash = 'codeOverdue=true';
                this._accessToken = data.access_token;
                this._loadOrders();
                this._logUser();
            }, this)).fail($.proxy(function() {
                Log.console('jingdong token fail.');
            }, this));

            this.state(DataSourceBase.STATE_LOADING);
        } else if (hashPairs.error) {
        }
    };
    Jingdong.prototype.keyword = function() {
        return 'jd';
    };
    Jingdong.prototype._hookupAPI = function() {
        andrea.blink.declare('andrea.grace._api.dataSource.jingdong');

        andrea.grace._api.dataSource.jingdong.load = $.proxy(function(options) {
            _.defer($.proxy(this._load, this), options);
        }, this);
    };
    Jingdong.prototype._load = function(options) {
        this.state(DataSourceBase.STATE_LOADING);

        var jingdong = grace.Settings.dataSource.jingdong;
        jingdong.appKey = options.appKey || jingdong.appKey;

        this._accessToken = options.access_token;
        this._loadOrders();

    };
    Jingdong.prototype._logUser = function(userID) {
        var jingdong = grace.Settings.dataSource.jingdong;

        $.ajax({
            'url' : grace.Settings.nodeServer + '/node/jd/user/create',
            'dataType' : 'jsonp',
            'data' : {
                'app_key' : jingdong.appKey,
                'access_token' : this._accessToken,
                'user_id' : userID
            }
        });
    };
    Jingdong.prototype._loadOrders = function() {
        this._watch = new Stopwatch(['jingdong'].join(','), true);

        var jingdong = grace.Settings.dataSource.jingdong;
        var end = new Date();
        var start = new Date();
        start.setMonth(start.getMonth() - 1);

        var optional_fields = [];
        // Get vernder_id for log db
        optional_fields.push('vender_id');
        var complex = {};
        _.each(this._columnDescriptors, function(column) {
            var ids = column.id.split('.');
            var id = ids[0];
            if (ids.length === 1) {
                optional_fields.push(id);
            } else {
                if (!complex[id]) {
                    if (id === 'consignee_info') {
                        optional_fields.push(id);
                    } else {
                        optional_fields.push(id + '_list');
                    }
                    complex[id] = true;
                }
            }
        });

        $.ajax({
            'url' : grace.Settings.javaServer + '/dataAccessor/jd?method=access',
            'data' : {
                'api' : jingdong.api,
                'token' : this._accessToken,
                'appKey' : jingdong.appKey,
                'start_date' : start.format('yyyy-MM-dd HH:mm:ss'),
                'end_date' : end.format('yyyy-MM-dd HH:mm:ss'),
                'optional_fields' : optional_fields.join(',')
            },
            'dataType' : 'jsonp'
        }).done($.proxy(function(data) {
            _.each(data, $.proxy(function(responses) {
                _.each(responses, $.proxy(function(response) {
                    this._dataHandler(response);
                }, this));
            }, this));

            if (this._rows.length === 0) {
                var contact = prompt('您还不是卖家吧？或者请您留下您的联系方式。');
                Log.interaction('authorize', ['jingdong', contact]);
                this.state(DataSourceBase.STATE_NORMAL);
            } else {
                this._completeHandler();
            }
        }, this));
    };
    Jingdong.prototype._createChildren = function() {
        var $container = this._$dom.clone().appendTo(this._$dom);
        $container.on('click', $.proxy(function(event) {
            this._authorize();
        }, this));

        this._generateButton($container, {
            'color' : '#00569b',
            'captions' : ['京东卖家']
        });
    };
    Jingdong.prototype._authorize = function() {
        var jingdong = grace.Settings.dataSource.jingdong;
        // Jingdong OAuth
        var urlVariables = [];
        urlVariables.push(['client_id', jingdong.appKey].join('='));
        urlVariables.push(['response_type', 'code'].join('='));
        urlVariables.push(['redirect_uri', jingdong.redirect + '?dataSource=jd'].join('='));
        window.location.href = jingdong.oauth + '/authorize?' + urlVariables.join('&');
    };
    Jingdong.prototype._generateColumnDescriptors = function() {
        var columnDescriptors = [];
        var genColumn = function(id, name, converterType, analysisType) {
            return {
                'id' : id,
                'name' : name,
                'converterType' : converterType,
                'analysisType' : analysisType
            };
        };
        columnDescriptors.push(genColumn('order_start_time', '下单时间', ConverterType.DATE_IN_TEXT, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('order_state', '订单状态', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('pay_type', '支付方式', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('item_info.sku_name', '商品名称+SKU', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('order_end_time', '结单时间', ConverterType.DATE_IN_TEXT, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('consignee_info.province', '收货人省份', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('coupon_detail.coupon_type', '优惠类型', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('order_state_remark', '订单状态说明', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('delivery_type', '送货（日期）类型', ConverterType.STRING, AnalysisType.DIMENSION));
        columnDescriptors.push(genColumn('item_info.gift_point', '赠送积分', ConverterType.STRING, AnalysisType.DIMENSION));

        columnDescriptors.push(genColumn('order_total_price', '总金额', ConverterType.NUMBER, AnalysisType.MEASURE));
        columnDescriptors.push(genColumn('order_payment', '应付金额', ConverterType.NUMBER, AnalysisType.MEASURE));
        columnDescriptors.push(genColumn('order_seller_price', '货款金额', ConverterType.NUMBER, AnalysisType.MEASURE));
        columnDescriptors.push(genColumn('seller_discount', '优惠金额', ConverterType.NUMBER, AnalysisType.MEASURE));
        columnDescriptors.push(genColumn('freight_price', '运费', ConverterType.NUMBER, AnalysisType.MEASURE));
        columnDescriptors.push(genColumn('item_info.item_total', '商品名数量', ConverterType.NUMBER, AnalysisType.MEASURE));

        return columnDescriptors;
    };
    Jingdong.prototype._dataHandler = function(response) {
        var k;

        if (response.error_response) {
            Log.interaction('dataHandler', ['jingdong', 'error_response', response.error_response.en_desc]);
            return;
        }

        response = response.order_search_response;
        if (response && response.order_search) {
            Log.interaction('dataHandler', ['jingdong', 'order_search', response.order_search.order_total]);

            var userID = null;
            var columnDescriptors = this._columnDescriptors;
            var rows = this._rows;

            var orders = response.order_search.order_info_list;
            _.each(orders, function(o) {
                userID = userID || o.vender_id;
                var items = o.item_info_list;
                _.each(items, function(i) {
                    var row = [];
                    for ( k = columnDescriptors.length - 1; k >= 0; k--) {
                        var cd = columnDescriptors[k];
                        var id = cd.id;
                        var path = id.split('.');
                        if (path[0] === 'item_info_list') {
                            id = path[1];
                            row[k] = JingdongAPI.toCaption(i[id], 'item', id);
                        } else if (path[0] === 'consignee_info') {
                            id = path[1];
                            row[k] = JingdongAPI.toCaption(o.consignee_info[id], 'consignee', id);
                        } else if (path[0] === 'coupon_detail_list') {
                            id = path[1];
                            row[k] = JingdongAPI.toCaption(o.coupon_detail_list[0][id], 'coupon', id);
                        } else {
                            id = path[0];
                            row[k] = JingdongAPI.toCaption(o[id], 'order', id);
                        }
                    }
                    rows.push(row);
                });
            });
            if (userID) {
                this._logUser(userID);
            }
        }
    };
    Jingdong.prototype._completeHandler = function() {
        Log.performance('loadJingdongOrders', [this._watch.type, 'loadComplete', this._watch.lap(true), this._watch.total()].join(','));
        this._dpReady({
            'rows' : this._rows,
            'columnDescriptors' : this._columnDescriptors,
            'source' : 'jingdong'
        });
    };
})();
