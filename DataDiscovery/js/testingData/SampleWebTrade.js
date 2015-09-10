(function() {
	var grace = andrea.grace;
	andrea.blink.declare("andrea.grace.testingData.SampleWebTrade");

	var SampleWebTrade = grace.testingData.SampleWebTrade = function() {
		this.idToName = {
			"dim_dateString" : "日期",
			"dim_hourString":"成交时",
			"dim_title" : "商品名称",
			"avg_price" : "单价",
			"sum_quantity" : "交易数量",
			"sum_fee" : "交易金额",
			"dim_sku" : "分类",
			"dim_outOfStock" : "是否下架"
		};
	};
})();