(function() {
	var vc = sap.viz.container;
	vc.declare("sap.viz.container.grace.testingData.SampleTOPTrade");

	var SampleTOPTrade = vc.grace.testingData.SampleTOPTrade = function() {
		var dp = [];
		for (var i = 0; i < 10000; i++) {
			var created = genDate(-90 + Math.floor(90 / 10000 * i));
			var trade = {
				"status" : genSelection(["没有创建支付宝交易", "等待买家付款", "买家已付款", "卖家已发货", "交易成功", "退款成功", "交易关闭"]),
				"created" : genDateString(created, 0),
				"grace_created" : genMonthString(created, 0),
				"consign_time" : genDateString(created, genUint(3) - 1),
				"end_time" : genDateString(created, genUint(7)),
				"buyer_nick" : "buyer_" + genUint(1000),
				"buyer_area" : genSelection(["安徽", "福建", "甘肃", "广东", "贵州", "海南", "河北", "黑龙江", "河南", "湖北", "湖南", "江苏", "江西", "吉林", "辽宁", "青海", "陕西", "山东", "山西", "四川", "云南", "浙江", "广西", "内蒙古", "宁夏", "新疆", "西藏", "北京", "重庆", "上海", "天津", "香港", "澳门", "台湾"]),
				"has_yfx" : genSelection(["有", "无"]),
				"has_buyer_message" : genSelection(["有", "无"]),

				"sum_total_fee" : genUint(10000) / 100,
				"sum_num" : genUint(5),
				"avg_price" : genUint(2000) / 100,				"sum_discount_fee" : genUint(100) / 100,
				"sum_point_fee" : genUint(100),
			}
			dp.push(trade);
		}

		this.dataProvider = dp;
		this.idToName = {
			"sum_num" : "购买数量",
			"status" : "交易状态",
			"avg_price" : "商品单价",
			"sum_discount_fee" : "优惠金额",
			"sum_point_fee" : "使用积分",
			"sum_total_fee" : "交易金额",
			"created" : "交易创建日期",
			"grace_created" : "交易创建(月)",
			"end_time" : "交易结束日期",
			"buyer_nick" : "买家昵称",
			"buyer_area" : "买家区域",
			"has_yfx" : "有否运费险",
			"has_buyer_message" : "有否买家留言",
			"consign_time" : "卖家发货日期"

		};
	};
	var currentTime = new Date().getTime();
	var genUint = function(max) {
		return Math.floor(Math.random() * max + 1);
	}
	var genSelection = function(options) {
		return options[genUint(options.length) - 1];
	}
	var genDate = function(dayOffset) {
		var d = new Date();
		d.setDate(d.getDate() + dayOffset);
		return d;
	}
	var genDateString = function(d, dayOffset) {
		d.setDate(d.getDate() + dayOffset);
		return d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();
	}
	var genMonthString = function(d, dayOffset) {
		d.setDate(d.getDate() + dayOffset);
		return d.getFullYear() + "/" + (d.getMonth() + 1);
	}
	var eg = {
		"trades_sold_get_response" : {
			"trades" : {
				"trade" : [{
					"buyer_obtain_point_fee" : 0,
					"buyer_area" : "浙江省杭州市",
					"consign_time" : "2000-01-01 00:00:00",
					"receiver_zip" : "223700",
					"has_buyer_message" : "true",
					"receiver_address" : "淘宝城911号",
					"pic_path" : "http://img08.taobao.net/bao/uploaded/i8/T1jVXXXePbXXaoPB6a_091917.jpg",
					"adjust_fee" : "200.07",
					"type" : "fixed(一口价)",
					"buyer_rate" : "true",
					"receiver_phone" : "13819175372",
					"title" : "麦包包",
					"created" : "2000-01-01 00:00:00",
					"alipay_no" : "2009112081173831",
					"total_fee" : "200.07",
					"num_iid" : 3424234,
					"seller_flag" : 1,
					"tid" : 2231958349,
					"receiver_state" : "浙江省",
					"seller_nick" : "我在测试",
					"commission_fee" : "200.07",
					"discount_fee" : "200.07",
					"payment" : "200.07",
					"status" : "TRADE_NO_CREATE_PAY",
					"receiver_city" : "杭州市",
					"shipping_type" : "free",
					"cod_fee" : "12.07",
					"cod_status" : "EW_CREATED(订单已创建)",
					"pay_time" : "2000-01-01 00:00:00",
					"received_payment" : "200.07",
					"receiver_mobile" : "13512501826",
					"post_fee" : "200.07",
					"receiver_name" : "东方不败",
					"modified" : "2000-01-01 00:00:00",
					"buyer_nick" : "我在测试",
					"receiver_district" : "西湖区",
					"point_fee" : 0,
					"seller_rate" : "true",
					"num" : 1,
					"price" : "200.07",
					"real_point_fee" : 0,
					"end_time" : "2000-01-01 00:00:00",
					"orders" : {
						"order" : [{
							"refund_id" : 2231958349,
							"outer_iid" : "152e442aefe88dd41cb0879232c0dcb0",
							"discount_fee" : "200.07",
							"payment" : "200.07",
							"status" : "TRADE_NO_CREATE_PAY",
							"pic_path" : "http://img08.taobao.net/bao/uploaded/i8/T1jVXXXePbXXaoPB6a_091917.jpg",
							"sku_properties_name" : "颜色:桔色;尺码:M",
							"adjust_fee" : "1.01",
							"outer_sku_id" : "81893848",
							"cid" : 123456,
							"buyer_rate" : "true",
							"item_meal_name" : "M8原装电池:便携支架:M8专用座充:莫凡保护袋",
							"seller_rate" : "true",
							"num" : 10,
							"title" : "山寨版测试机器",
							"item_meal_id" : 2564854632,
							"price" : "200.07",
							"oid" : 2231958349,
							"total_fee" : "200.07",
							"num_iid" : 2342344,
							"refund_status" : "SUCCESS(退款成功)",
							"sku_id" : "5937146",
							"seller_type" : "B（商城商家）"
						}]
					},
					"alipay_id" : "2011082299567459"
				}]
			},
			"total_results" : 100
		}
	};
})();
