// Config api
andrea.blink.declare('grace.api.config');
grace.api.config = grace.Config;
// Data source api
andrea.blink.declare('grace.api.dataSource');

grace.api.dataSource.load = function(arg1, arg2) {
    var type, info;
    if (arguments.length === 1) {
        info = arg1;
        type = info.dataSource;
    } else if (arguments.length >= 2) {
        type = arg1;
        info = _.extend({
            'dataSource' : type
        }, arg2);
    }

    if (type === 'dataProvider') {
        // @formatter:off
        // grace.api.dataSource.load('dataProvider', {
        //     'rows' : [["大公司","Janice Fletcher","中区","伊利诺伊州","Addison","41057","未指定","办公用品","标签","Avery 49","空运","小箱","1.32","5.9","2","2.88","0.5","0.01"],["大公司","Bonnie Potter","西区","华盛顿","Anacortes","40366","高","办公用品","笔&美术用品","SANFORD Liquid Accent™ Tank-Style Highlighters","加急空运","纸袋","4.5599999999999996","13.01","4","2.84","0.93","0.01"]],
        //     'columnDescriptors': [{"name":"客户分类"},{"name":"客户名称"},{"name":"地区"},{"name":"州或省"},{"name":"城市"},{"name":"订单日期"},{"name":"订单优先级"},{"name":"产品类别"},{"name":"产品子类别"},{"name":"产品名称"},{"name":"送货方式"},{"name":"包装方式"},{"name":"利润"},{"name":"销售额"},{"name":"销量"},{"name":"单价"},{"name":"运费"},{"name":"折扣"}],
        //     'source': 'excel'
        // });
        // @formatter:on
        andrea.grace._api.dataSource.dataProvider.load(info);
    } else if (type === 'file') {
        // grace.api.dataSource.load('file', {
        //     'url' : 'http://127.0.0.1:8020/andrea.graceBI/client/DataDiscovery/data/SuperMarket.xlsx?v1'
        // });
        andrea.grace._api.dataSource.file.load(info);
    } else if (type === 'json') {
        // grace.api.dataSource.load('json', {
        //     'url' : 'http://127.0.0.1:8020/andrea.graceBI/tools/FileParser/test/SuperMarket.json?v1'
        // });
        andrea.grace._api.dataSource.json.load(info);
    } else if (type === 'jsonp') {
        // grace.api.dataSource.load('jsonp', {
        //     'url' : 'http://127.0.0.1:30001/analysis/interactionLogs/1fenxi'
        // });
        andrea.grace._api.dataSource.jsonp.load(info);
    } else if (type === 'jingdong') {
        // grace.api.dataSource.load('jingdong', {
        // 'access_token' : 'd1f2cc4f-16e0-413e-873f-239cc56e9346'
        // });
        andrea.grace._api.dataSource.jingdong.load(info);
    } else if (type === 'taobao') {
        // grace.api.dataSource.load('taobao', {
        // 'taobao_user_nick' : '魅蓝樱',
        // 'taobao_user_id' : '1684064002' // Optional
        // });
        andrea.grace._api.dataSource.taobao.load(info);
    }
};

// Data discovery api
andrea.blink.declare('grace.api.dataDiscovery');

// TODO Add dataDiscovery APIs
