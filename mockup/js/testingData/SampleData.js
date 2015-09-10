var sampleData_2d1d2m = {
	'analysisAxis' : [{
		'index' : 1,
		'data' : [{
			'type' : 'Dimension',
			'name' : 'Country',
			'values' : ['China', 'China', 'USA', 'USA', 'Canada', 'Canada']
		}, {
			'type' : 'Dimension',
			'name' : 'Year',
			'values' : ['2001', '2002', '2001', '2002', '2001', '2002']
		}]
	}, {
		'index' : 2,
		'data' : [{
			'type' : 'Dimension',
			'name' : 'Product',
			'values' : ['Car', 'Truck', 'Motorcycle']
		}]
	}],
	'measureValuesGroup' : [{
		'index' : 1,
		'data' : [{
			'type' : 'Measure',
			'name' : 'Profit',
			'values' : [[25, 136, 58, 128, 58, 24], [159, 147, 149, 269, 38, 97], [129, 47, 49, 69, 33, 47]]
		}
		/*, {
		 'type': 'Measure',
		 'name': 'Revenue',
		 'values': [[50, 272, 116, 256, 116, 48], [300, 247, 249, 369, 68, 197], [229, 147, 149, 169, 133, 147]]
		 }*/
		]
	}, {
		'index' : 2,
		'data' : [{
			'type' : 'Measure',
			'name' : 'Cost',
			'values' : [[59, 47, 90, 90, 58, 8], [49, 69, 32, 12, 43, 83], [18, 97, 2, 56, 3, 3]]
		}
		/*,{
		 'type' : 'Measure',
		 'name' : 'Tax',
		 'values' : [[99, 36, 8, 28, 27, 7], [5, 69, 8, 8, 9, 4] , [3, 18, 7, 10, 15, 12]]
		 }*/
		]
	}]
};
var sampleData_1d1d1m = {
	'analysisAxis' : [{
		'index' : 1,
		'data' : [{
			'type' : 'Dimension',
			'name' : 'Country',
			'values' : ['China', 'USA', 'Canada']
		}]
	}, {
		'index' : 2,
		'data' : [{
			'type' : 'Dimension',
			'name' : 'Product',
			'values' : ['Car', 'Truck', 'Motorcycle']
		}]
	}],
	'measureValuesGroup' : [{
		'index' : 1,
		'data' : [{
			'type' : 'Measure',
			'name' : 'Profit',
			'values' : [[25, 136, 58], [159, 147, 149], [129, 47, 49]]
		}]
	}]
};
var sampleData_1d1m = {
	'analysisAxis' : [{
		'index' : 1,
		'data' : [{
			'type' : 'Dimension',
			'name' : 'Country',
			'values' : ['China', 'USA', 'Canada']
		}]
	}],
	'measureValuesGroup' : [{
		'index' : 1,
		'data' : [{
			'type' : 'Measure',
			'name' : 'Profit',
			'values' : [[25, 136, 58]]
		}]
	}]
}; 