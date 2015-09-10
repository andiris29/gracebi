(function() {
    var grace = andrea.grace;

    andrea.blink.declare("andrea.grace.constants.Taobao");

    /**
     * TODO Remove this class
     * It seems no needed
     */
    var Taobao = grace.constants.Taobao = {
        'trade' : {
        }
    };

    Taobao.trade.status = {
        'TRADE_NO_CREATE_PAY' : '未创建支付宝交易',
        'WAIT_BUYER_PAY' : '等待买家付款',
        'SELLER_CONSIGNED_PART' : '卖家部分发货',
        // 即:买家已付款
        'WAIT_SELLER_SEND_GOODS' : '等待卖家发货',
        // 即:卖家已发货
        'WAIT_BUYER_CONFIRM_GOODS' : '等待买家确认收货',
        // 货到付款专用
        'TRADE_BUYER_SIGNED' : '买家已签收',
        'TRADE_FINISHED' : '交易成功',
        'TRADE_CLOSED' : '退款成功，交易关闭',
        'TRADE_CLOSED_BY_TAOBAO' : '未付款，交易关闭'
    }

    Taobao.trade.type = {
        'fixed' : '一口价',
        'auction' : '拍卖',
        'guarantee_trade' : '一口价、拍卖',
        'auto_delivery' : '自动发货',
        'independent_simple_trade' : '旺店入门版交易',
        'independent_shop_trade' : '旺店标准版交易',
        'ec' : '直冲',
        'cod' : '货到付款',
        'fenxiao' : '分销',
        'game_equipment' : '游戏装备',
        'shopex_trade' : 'ShopEX交易',
        'netcn_trade' : '万网交易',
        'external_trade' : '统一外部交易',
        'step' : '万人团'
    };
    Taobao.trade.shipping_type = {
        'free' : '卖家包邮',
        'post' : '平邮',
        'express' : '快递',
        'ems' : 'EMS',
        'virtual' : '虚拟发货',
        '25' : '次日必达',
        '26' : '预约配送'
    };

    Taobao.trade.trade_from = {
        'WAP' : '手机',
        'HITAO' : '嗨淘',
        'TOP' : 'TOP平台',
        'TAOBAO' : '普通淘宝',
        'JHS' : '聚划算'
    };
    Taobao.isKey = function(type, id) {
        return Taobao[type] != null && Taobao[type][id] != null;
    }
    Taobao.toCaption = function(key, type, id) {
        if (Taobao.isKey(type, id)) {
            if (id === 'trade_from') {
                var ids = id.split(',');
                if (ids.length > 1) {
                    var captions = [];
                    _.each(ids, function(id) {
                        captions.push(Taobao.toCaption(key, type, id));
                    })
                    return captions.join('，');
                }
            }
            return Taobao[type][id][key];
        } else {
            return key
        }
    };
})();
