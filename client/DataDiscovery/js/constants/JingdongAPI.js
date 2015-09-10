(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.constants.JingdongAPI");

    /**
     * TODO Remove this class
     * It seems no needed
     */
    var JingdongAPI = grace.constants.JingdongAPI = {
        'order' : {},
        'coupon' : {}
    };

    JingdongAPI.order.pay_type = {
        '1' : '货到付款',
        '2' : '邮局汇款',
        '3' : '自提',
        '4' : '在线支付',
        '5' : '公司转账',
        '6' : '银行转账'
    };
    JingdongAPI.order.delivery_type = {
        '1' : '只工作日送货',
        '2' : '只双休日、假日送货',
        '3' : '工作日、双休日与假日均可送货',
        '*' : '任意时间'
    };
    JingdongAPI.order.order_state = {
        'WAIT_SELLER_STOCK_OUT' : '等待出库',
        // 只适用于LBP，SOPL商家
        'SEND_TO_DISTRIBUTION_CENER' : '发往配送中心',
        // 只适用于LBP，SOPL商家
        'DISTRIBUTION_CENTER_RECEIVED' : '配送中心已收货',
        'WAIT_GOODS_RECEIVE_CONFIRM' : '等待确认收货',
        // 只适用于LBP，SOPL商家
        'RECEIPTS_CONFIRM' : '收款确认（服务完成）',
        // 只适用于海外购商家，等待境内发货 标签下的订单
        'WAIT_SELLER_DELIVERY' : '等待发货',
        'FINISHED_L' : '完成',
        // 取消的订单不返回收货人基本信息
        'TRADE_CANCELED' : '取消',
        // 锁定的订单不返回收货人基本信息
        'LOCKED' : '已锁定'
    };
    JingdongAPI.coupon.coupon_type = {
        '20' : '套装优惠',
        '28' : '闪团优惠',
        '29' : '团购优惠',
        '30' : '单品促销优惠',
        '34' : '手机红包',
        '35' : '满返满送(返现)',
        '39' : '京豆优惠',
        '41' : '京东券优惠',
        '52' : '礼品卡优惠',
        '100' : '店铺优惠'
    };

    // TODO Move to utils
    JingdongAPI.isKey = function(type, id) {
        return JingdongAPI[type] != null && JingdongAPI[type][id] != null;
    };
    // TODO Handler * as key
    JingdongAPI.toCaption = function(key, type, id) {
        if (JingdongAPI.isKey(type, id)) {
            if (id === 'trade_from') {
                var ids = id.split(',');
                if (ids.length > 1) {
                    var captions = [];
                    _.each(ids, function(id) {
                        captions.push(JingdongAPI.toCaption(key, type, id));
                    });
                    return captions.join('，');
                }
            }
            return JingdongAPI[type][id][key];
        } else {
            return key;
        }
    };
})();
