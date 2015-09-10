package iris.contants {

	public class RegExpression {

		// /sdks/4.1.0/frameworks/flash-unicode-table.xml
		public static const NUMBER:String = "0-9";
		public static const LOWER_CASE:String = "a-z";
		public static const UPPER_CASE:String = "A-Z";
		//		public static const SPACE:String = "\u20";
		//		public static const CHINESE_ALL:String = "\u4E00-\u9FA5";
		public static const CHINESE_ALL:String = "一-龥";
		//		public static const CHINESE_ALL:String = "\u3000-\u303F\u3105-\u312C\u31A0-\u31BF\u4E00-\u9FAF\uFF01-\uFF60\uF900-\uFAFF\u201C-\u201D\u2018-\u2019\u2014\u2026\uFFE5\u00B7";
		//		public static const CHINESE_SIMPLIFIED:String = "\u4E00-\u4E01\u4E03\u4E07-\u4E0E\u4E10-\u4E11\u4E13-\u4E16\u4E18-\u4E1E\u4E22\u4E24-\u4E25\u4E27-\u4E28\u4E2A-\u4E2D\u4E30\u4E32\u4E34\u4E36\u4E38-\u4E3B\u4E3D-\u4E3F\u4E43\u4E45\u4E47-\u4E49\u4E4B-\u4E50\u4E52-\u4E54\u4E56\u4E58-\u4E59\u4E5C-\u4E61\u4E66\u4E69\u4E70-\u4E71\u4E73\u4E7E\u4E86\u4E88-\u4E89\u4E8B-\u4E8F\u4E91-\u4E95\u4E98\u4E9A-\u4E9B\u4E9F-\u4EA2\u4EA4-\u4EA9\u4EAB-\u4EAE\u4EB2-\u4EB3\u4EB5\u4EBA-\u4EBB\u4EBF-\u4EC7\u4EC9-\u4ECB\u4ECD-\u4ECE\u4ED1\u4ED3-\u4ED9\u4EDD-\u4EDF\u4EE1\u4EE3-\u4EE5\u4EE8\u4EEA-\u4EEC\u4EF0\u4EF2-\u4EF3\u4EF5-\u4EF7\u4EFB\u4EFD\u4EFF\u4F01\u4F09-\u4F0A\u4F0D-\u4F11\u4F17-\u4F1B\u4F1E-\u4F20\u4F22\u4F24-\u4F27\u4F2A-\u4F2B\u4F2F-\u4F30\u4F32\u4F34\u4F36\u4F38\u4F3A\u4F3C-\u4F3D\u4F43\u4F46\u4F4D-\u4F51\u4F53\u4F55\u4F57-\u4F60\u4F63-\u4F65\u4F67\u4F69\u4F6C\u4F6F-\u4F70\u4F73-\u4F74\u4F76\u4F7B-\u4F7C\u4F7E-\u4F7F\u4F83-\u4F84\u4F88-\u4F89\u4F8B\u4F8D\u4F8F\u4F91\u4F94\u4F97\u4F9B\u4F9D\u4FA0\u4FA3\u4FA5-\u4FAA\u4FAC\u4FAE-\u4FAF\u4FB5\u4FBF\u4FC3-\u4FC5\u4FCA\u4FCE-\u4FD1\u4FD7-\u4FD8\u4FDA\u4FDC-\u4FDF\u4FE1\u4FE3\u4FE6\u4FE8-\u4FEA\u4FED-\u4FEF\u4FF1\u4FF3\u4FF8\u4FFA\u4FFE\u500C-\u500D\u500F\u5012\u5014\u5018-\u501A\u501C\u501F\u5021\u5025-\u5026\u5028-\u502A\u502C-\u502E\u503A\u503C\u503E\u5043\u5047-\u5048\u504C\u504E-\u504F\u5055\u505A\u505C\u5065\u506C\u5076-\u5077\u507B\u507E-\u5080\u5085\u5088\u508D\u50A3\u50A5\u50A7-\u50A9\u50AC\u50B2\u50BA-\u50BB\u50CF\u50D6\u50DA\u50E6-\u50E7\u50EC-\u50EE\u50F3\u50F5\u50FB\u5106-\u5107\u510B\u5112\u5121\u513F-\u5141\u5143-\u5146\u5148-\u5149\u514B\u514D\u5151\u5154-\u5156\u515A\u515C\u5162\u5165\u5168\u516B-\u516E\u5170-\u5171\u5173-\u5179\u517B-\u517D\u5180-\u5182\u5185\u5188-\u5189\u518C-\u518D\u5192\u5195-\u5197\u5199\u519B-\u519C\u51A0\u51A2\u51A4-\u51A5\u51AB-\u51AC\u51AF-\u51B3\u51B5-\u51B7\u51BB-\u51BD\u51C0\u51C4\u51C6-\u51C7\u51C9\u51CB-\u51CC\u51CF\u51D1\u51DB\u51DD\u51E0-\u51E1\u51E4\u51EB\u51ED\u51EF-\u51F0\u51F3\u51F5-\u51F6\u51F8-\u51FD\u51FF-\u5203\u5206-\u5208\u520A\u520D-\u520E\u5211-\u5212\u5216-\u521B\u521D\u5220\u5224\u5228-\u5229\u522B\u522D-\u522E\u5230\u5233\u5236-\u523B\u523D\u523F-\u5243\u524A\u524C-\u524D\u5250-\u5251\u5254\u5256\u525C\u525E\u5261\u5265\u5267\u5269-\u526A\u526F\u5272\u527D\u527F\u5281-\u5282\u5288\u5290\u5293\u529B\u529D-\u52A3\u52A8-\u52AD\u52B1-\u52B3\u52BE-\u52BF\u52C3\u52C7\u52C9\u52CB\u52D0\u52D2\u52D6\u52D8\u52DF\u52E4\u52F0\u52F9-\u52FA\u52FE-\u5300\u5305-\u5306\u5308\u530D\u530F-\u5310\u5315-\u5317\u5319-\u531A\u531D\u5320-\u5321\u5323\u5326\u532A\u532E\u5339-\u533B\u533E-\u533F\u5341\u5343\u5345\u5347-\u534A\u534E-\u534F\u5351-\u5353\u5355-\u5357\u535A\u535C\u535E-\u5364\u5366-\u5367\u5369\u536B\u536E-\u5371\u5373-\u5375\u5377-\u5378\u537A\u537F\u5382\u5384-\u5386\u5389\u538B-\u538D\u5395\u5398\u539A\u539D\u539F\u53A2-\u53A3\u53A5-\u53A6\u53A8-\u53A9\u53AE\u53B6\u53BB\u53BF\u53C1-\u53C2\u53C8-\u53CD\u53D1\u53D4\u53D6-\u53D9\u53DB\u53DF-\u53E0\u53E3-\u53E6\u53E8-\u53F3\u53F5-\u53F9\u53FB-\u53FD\u5401\u5403-\u5404\u5406\u5408-\u540A\u540C-\u5413\u5415-\u5417\u541B\u541D-\u5421\u5423\u5426-\u5429\u542B-\u542F\u5431-\u5432\u5434-\u5435\u5438-\u5439\u543B-\u543C\u543E\u5440\u5443\u5446\u5448\u544A-\u544B\u5450\u5452-\u5459\u545B-\u545C\u5462\u5464\u5466\u5468\u5471-\u5473\u5475-\u5478\u547B-\u547D\u5480\u5482\u5484\u5486\u548B-\u548C\u548E-\u5490\u5492\u5494-\u5496\u5499-\u549B\u549D\u54A3-\u54A4\u54A6-\u54AD\u54AF\u54B1\u54B3-\u54B4\u54B8\u54BB\u54BD\u54BF-\u54C2\u54C4\u54C6-\u54C9\u54CC-\u54D5\u54D7\u54D9-\u54DA\u54DC-\u54DF\u54E5-\u54EA\u54ED-\u54EE\u54F2-\u54F3\u54FA\u54FC-\u54FD\u54FF\u5501\u5506-\u5507\u5509\u550F-\u5511\u5514\u551B\u5520\u5522-\u5524\u5527\u552A\u552C\u552E-\u5531\u5533\u5537\u553C\u553E-\u553F\u5541\u5543-\u5544\u5546\u5549-\u554A\u5550\u5555-\u5556\u555C\u5561\u5564-\u5567\u556A\u556C-\u556E\u5575-\u5578\u557B-\u557C\u557E\u5580-\u5584\u5587-\u558B\u558F\u5591\u5594\u5598-\u5599\u559C-\u559D\u559F\u55A7\u55B1\u55B3\u55B5\u55B7\u55B9\u55BB\u55BD-\u55BE\u55C4-\u55C5\u55C9\u55CC-\u55CD\u55D1-\u55D4\u55D6\u55DC-\u55DD\u55DF\u55E1\u55E3-\u55E6\u55E8\u55EA-\u55EC\u55EF\u55F2-\u55F3\u55F5\u55F7\u55FD-\u55FE\u5600-\u5601\u5608-\u5609\u560C\u560E-\u560F\u5618\u561B\u561E-\u561F\u5623-\u5624\u5627\u562C-\u562D\u5631-\u5632\u5634\u5636\u5639\u563B\u563F\u564C-\u564E\u5654\u5657-\u5659\u565C\u5662\u5664\u5668-\u566C\u5671\u5676\u567B-\u567C\u5685-\u5686\u568E-\u568F\u5693\u56A3\u56AF\u56B7\u56BC\u56CA\u56D4\u56D7\u56DA-\u56DB\u56DD-\u56E2\u56E4\u56EB\u56ED\u56F0-\u56F1\u56F4-\u56F5\u56F9-\u56FA\u56FD-\u56FF\u5703-\u5704\u5706\u5708-\u570A\u571C\u571F\u5723\u5728-\u572A\u572C-\u5730\u5733\u5739-\u573B\u573E\u5740\u5742\u5747\u574A\u574C-\u5751\u5757\u575A-\u5761\u5764\u5766\u5768-\u576B\u576D\u576F\u5773\u5776-\u5777\u577B-\u577C\u5782-\u5786\u578B-\u578C\u5792-\u5793\u579B\u57A0-\u57A4\u57A6-\u57A7\u57A9\u57AB\u57AD-\u57AE\u57B2\u57B4\u57B8\u57C2-\u57C3\u57CB\u57CE-\u57CF\u57D2\u57D4-\u57D5\u57D8-\u57DA\u57DD\u57DF-\u57E0\u57E4\u57ED\u57EF\u57F4\u57F8-\u57FA\u57FD\u5800\u5802\u5806-\u5807\u580B\u580D\u5811\u5815\u5819\u581E\u5820-\u5821\u5824\u582A\u5830\u5835\u5844\u584C-\u584D\u5851\u5854\u5858\u585E\u5865\u586B-\u586C\u587E\u5880-\u5881\u5883\u5885\u5889\u5892-\u5893\u5899-\u589A\u589E-\u589F\u58A8-\u58A9\u58BC\u58C1\u58C5\u58D1\u58D5\u58E4\u58EB-\u58EC\u58EE\u58F0\u58F3\u58F6\u58F9\u5902\u5904\u5907\u590D\u590F\u5914-\u5916\u5919-\u591A\u591C\u591F\u5924-\u5925\u5927\u5929-\u592B\u592D-\u592F\u5931\u5934\u5937-\u593A\u593C\u5941-\u5942\u5944\u5947-\u5949\u594B\u594E-\u594F\u5951\u5954-\u5958\u595A\u5960\u5962\u5965\u5973-\u5974\u5976\u5978-\u5979\u597D\u5981-\u5984\u5986-\u5988\u598A\u598D\u5992-\u5993\u5996-\u5997\u5999\u599E\u59A3-\u59A5\u59A8-\u59AB\u59AE-\u59AF\u59B2\u59B9\u59BB\u59BE\u59C6\u59CA-\u59CB\u59D0-\u59D4\u59D7-\u59D8\u59DA\u59DC-\u59DD\u59E3\u59E5\u59E8\u59EC\u59F9\u59FB\u59FF\u5A01\u5A03-\u5A09\u5A0C\u5A11\u5A13\u5A18\u5A1C\u5A1F-\u5A20\u5A23\u5A25\u5A29\u5A31-\u5A32\u5A34\u5A36\u5A3C\u5A40\u5A46\u5A49-\u5A4A\u5A55\u5A5A\u5A62\u5A67\u5A6A\u5A74-\u5A77\u5A7A\u5A7F\u5A92\u5A9A-\u5A9B\u5AAA\u5AB2-\u5AB3\u5AB5\u5AB8\u5ABE\u5AC1-\u5AC2\u5AC9\u5ACC\u5AD2\u5AD4\u5AD6\u5AD8\u5ADC\u5AE0-\u5AE1\u5AE3\u5AE6\u5AE9\u5AEB\u5AF1\u5B09\u5B16-\u5B17\u5B32\u5B34\u5B37\u5B40\u5B50-\u5B51\u5B53-\u5B55\u5B57-\u5B5D\u5B5F\u5B62-\u5B66\u5B69-\u5B6A\u5B6C\u5B70-\u5B71\u5B73\u5B75\u5B7A\u5B7D\u5B80-\u5B81\u5B83-\u5B85\u5B87-\u5B89\u5B8B-\u5B8C\u5B8F\u5B93\u5B95\u5B97-\u5B9E\u5BA0-\u5BA6\u5BAA-\u5BAB\u5BB0\u5BB3-\u5BB6\u5BB8-\u5BB9\u5BBD-\u5BBF\u5BC2\u5BC4-\u5BC7\u5BCC\u5BD0\u5BD2-\u5BD3\u5BDD-\u5BDF\u5BE1\u5BE4-\u5BE5\u5BE8\u5BEE\u5BF0\u5BF8-\u5BFC\u5BFF\u5C01\u5C04\u5C06\u5C09-\u5C0A\u5C0F\u5C11\u5C14-\u5C16\u5C18\u5C1A\u5C1C-\u5C1D\u5C22\u5C24-\u5C25\u5C27\u5C2C\u5C31\u5C34\u5C38-\u5C42\u5C45\u5C48-\u5C4B\u5C4E-\u5C51\u5C55\u5C59\u5C5E\u5C60-\u5C61\u5C63\u5C65-\u5C66\u5C6E-\u5C6F\u5C71\u5C79-\u5C7A\u5C7F\u5C81-\u5C82\u5C88\u5C8C-\u5C8D\u5C90-\u5C91\u5C94\u5C96-\u5C9C\u5CA2-\u5CA3\u5CA9\u5CAB-\u5CAD\u5CB1\u5CB3\u5CB5\u5CB7-\u5CB8\u5CBD\u5CBF\u5CC1\u5CC4\u5CCB\u5CD2\u5CD9\u5CE1\u5CE4-\u5CE6\u5CE8\u5CEA\u5CED\u5CF0\u5CFB\u5D02-\u5D03\u5D06-\u5D07\u5D0E\u5D14\u5D16\u5D1B\u5D1E\u5D24\u5D26-\u5D27\u5D29\u5D2D-\u5D2E\u5D34\u5D3D-\u5D3E\u5D47\u5D4A-\u5D4C\u5D58\u5D5B\u5D5D\u5D69\u5D6B-\u5D6C\u5D6F\u5D74\u5D82\u5D99\u5D9D\u5DB7\u5DC5\u5DCD\u5DDB\u5DDD-\u5DDE\u5DE1-\u5DE2\u5DE5-\u5DE9\u5DEB\u5DEE-\u5DEF\u5DF1-\u5DF4\u5DF7\u5DFD-\u5DFE\u5E01-\u5E03\u5E05-\u5E06\u5E08\u5E0C\u5E0F-\u5E11\u5E14-\u5E16\u5E18-\u5E1D\u5E26-\u5E27\u5E2D-\u5E2E\u5E31\u5E37-\u5E38\u5E3B-\u5E3D\u5E42\u5E44-\u5E45\u5E4C\u5E54-\u5E55\u5E5B\u5E5E\u5E61-\u5E62\u5E72-\u5E74\u5E76\u5E78\u5E7A-\u5E7D\u5E7F-\u5E80\u5E84\u5E86-\u5E87\u5E8A-\u5E8B\u5E8F-\u5E91\u5E93-\u5E97\u5E99-\u5E9A\u5E9C\u5E9E-\u5EA0\u5EA5-\u5EA7\u5EAD\u5EB3\u5EB5-\u5EB9\u5EBE\u5EC9-\u5ECA\u5ED1-\u5ED3\u5ED6\u5EDB\u5EE8\u5EEA\u5EF4\u5EF6-\u5EF7\u5EFA\u5EFE-\u5F04\u5F08\u5F0A-\u5F0B\u5F0F\u5F11\u5F13\u5F15\u5F17-\u5F18\u5F1B\u5F1F-\u5F20\u5F25-\u5F27\u5F29-\u5F2A\u5F2D\u5F2F\u5F31\u5F39-\u5F3A\u5F3C\u5F40\u5F50\u5F52-\u5F53\u5F55-\u5F58\u5F5D\u5F61-\u5F62\u5F64\u5F66\u5F69-\u5F6A\u5F6C-\u5F6D\u5F70-\u5F71\u5F73\u5F77\u5F79\u5F7B-\u5F7C\u5F80-\u5F82\u5F84-\u5F85\u5F87-\u5F8C\u5F90\u5F92\u5F95\u5F97-\u5F99\u5F9C\u5FA1\u5FA8\u5FAA\u5FAD-\u5FAE\u5FB5\u5FB7\u5FBC-\u5FBD\u5FC3-\u5FC6\u5FC9\u5FCC-\u5FCD\u5FCF-\u5FD2\u5FD6-\u5FD9\u5FDD\u5FE0-\u5FE1\u5FE4\u5FE7\u5FEA-\u5FEB\u5FED-\u5FEE\u5FF1\u5FF5\u5FF8\u5FFB\u5FFD-\u6006\u600A\u600D-\u600F\u6012\u6014-\u6016\u6019\u601B-\u601D\u6020-\u6021\u6025-\u602B\u602F\u6035\u603B-\u603C\u603F\u6041-\u6043\u604B\u604D\u6050\u6052\u6055\u6059-\u605A\u605D\u6062-\u6064\u6067-\u606D\u606F-\u6070\u6073\u6076\u6078-\u607D\u607F\u6083-\u6084\u6089\u608C-\u608D\u6092\u6094\u6096\u609A-\u609B\u609D\u609F-\u60A0\u60A3\u60A6\u60A8\u60AB-\u60AD\u60AF\u60B1-\u60B2\u60B4\u60B8\u60BB-\u60BC\u60C5-\u60C6\u60CA-\u60CB\u60D1\u60D5\u60D8\u60DA\u60DC-\u60DD\u60DF-\u60E0\u60E6-\u60E9\u60EB-\u60F0\u60F3-\u60F4\u60F6\u60F9-\u60FA\u6100-\u6101\u6106\u6108-\u6109\u610D-\u610F\u6115\u611A\u611F-\u6120\u6123-\u6124\u6126-\u6127\u612B\u613F\u6148\u614A\u614C\u614E\u6151\u6155\u615D\u6162\u6167-\u6168\u6170\u6175\u6177\u618B\u618E\u6194\u619D\u61A7-\u61A9\u61AC\u61B7\u61BE\u61C2\u61C8\u61CA-\u61CB\u61D1-\u61D2\u61D4\u61E6\u61F5\u61FF\u6206\u6208\u620A-\u6212\u6215-\u6218\u621A-\u621B\u621F\u6221-\u6222\u6224-\u6225\u622A\u622C\u622E\u6233-\u6234\u6237\u623D-\u6241\u6243\u6247-\u6249\u624B-\u624E\u6251-\u6254\u6258\u625B\u6263\u6266-\u6267\u6269-\u6270\u6273\u6276\u6279\u627C\u627E-\u6280\u6284\u6289-\u628A\u6291-\u6293\u6295-\u6298\u629A-\u629B\u629F-\u62A2\u62A4-\u62A5\u62A8\u62AB-\u62AC\u62B1\u62B5\u62B9\u62BB-\u62BD\u62BF\u62C2\u62C4-\u62CA\u62CC-\u62CE\u62D0\u62D2-\u62D4\u62D6-\u62DC\u62DF\u62E2-\u62E3\u62E5-\u62E9\u62EC-\u62EF\u62F1\u62F3-\u62F4\u62F6-\u62F7\u62FC-\u62FF\u6301-\u6302\u6307-\u6309\u630E\u6311\u6316\u631A-\u631B\u631D-\u6325\u6328\u632A-\u632B\u632F\u6332\u6339-\u633A\u633D\u6342-\u6343\u6345-\u6346\u6349\u634B-\u6350\u6355\u635E-\u635F\u6361-\u6363\u6367\u6369\u636D-\u636E\u6371\u6376-\u6377\u637A-\u637B\u6380\u6382\u6387-\u638A\u638C\u638E-\u6390\u6392\u6396\u6398\u63A0\u63A2-\u63A3\u63A5\u63A7-\u63AA\u63AC-\u63AE\u63B0\u63B3-\u63B4\u63B7-\u63B8\u63BA\u63BC\u63BE\u63C4\u63C6\u63C9\u63CD-\u63D0\u63D2\u63D6\u63DE\u63E0-\u63E1\u63E3\u63E9-\u63EA\u63ED\u63F2\u63F4\u63F6\u63F8\u63FD\u63FF-\u6402\u6405\u640B-\u640C\u640F-\u6410\u6413-\u6414\u641B-\u641C\u641E\u6420-\u6421\u6426\u642A\u642C-\u642D\u6434\u643A\u643D\u643F\u6441\u6444-\u6448\u644A\u6452\u6454\u6458\u645E\u6467\u6469\u646D\u6478-\u647A\u6482\u6484-\u6485\u6487\u6491-\u6492\u6495-\u6496\u6499\u649E\u64A4\u64A9\u64AC-\u64AE\u64B0\u64B5\u64B7-\u64B8\u64BA\u64BC\u64C0\u64C2\u64C5\u64CD-\u64CE\u64D0\u64D2\u64D7-\u64D8\u64DE\u64E2\u64E4\u64E6\u6500\u6509\u6512\u6518\u6525\u652B\u652E-\u652F\u6534-\u6536\u6538-\u6539\u653B\u653E-\u653F\u6545\u6548-\u6549\u654C\u654F\u6551\u6555-\u6556\u6559\u655B\u655D-\u655E\u6562-\u6563\u6566\u656B-\u656C\u6570\u6572\u6574\u6577\u6587\u658B-\u658C\u6590-\u6591\u6593\u6597\u6599\u659B-\u659C\u659F\u65A1\u65A4-\u65A5\u65A7\u65A9\u65AB\u65AD\u65AF-\u65B0\u65B9\u65BC-\u65BD\u65C1\u65C3-\u65C6\u65CB-\u65CC\u65CE-\u65CF\u65D2\u65D6-\u65D7\u65E0\u65E2\u65E5-\u65E9\u65EC-\u65F1\u65F6-\u65F7\u65FA\u6600\u6602-\u6603\u6606\u660A\u660C\u660E-\u660F\u6613-\u6615\u6619\u661D\u661F-\u6620\u6625\u6627-\u6628\u662D\u662F\u6631\u6634-\u6636\u663C\u663E\u6641\u6643\u664B-\u664C\u664F\u6652-\u6657\u665A\u665F\u6661\u6664\u6666\u6668\u666E-\u6670\u6674\u6676-\u6677\u667A\u667E\u6682\u6684\u6687\u668C\u6691\u6696-\u6697\u669D\u66A7-\u66A8\u66AE\u66B4\u66B9\u66BE\u66D9\u66DB-\u66DD\u66E6\u66E9\u66F0\u66F2-\u66F4\u66F7\u66F9\u66FC\u66FE-\u6700\u6708-\u670B\u670D\u6710\u6714-\u6715\u6717\u671B\u671D\u671F\u6726\u6728\u672A-\u672D\u672F\u6731\u6734-\u6735\u673A\u673D\u6740\u6742-\u6743\u6746\u6748-\u6749\u674C\u674E-\u6751\u6753\u6756\u675C\u675E-\u6761\u6765\u6768-\u676A\u676D\u676F-\u6770\u6772-\u6773\u6775\u6777\u677C\u677E-\u677F\u6781\u6784\u6787\u6789\u678B\u6790\u6795\u6797-\u6798\u679A\u679C-\u679E\u67A2-\u67A3\u67A5\u67A7-\u67A8\u67AA-\u67AB\u67AD\u67AF-\u67B0\u67B3\u67B5-\u67B8\u67C1\u67C3-\u67C4\u67CF-\u67D4\u67D8-\u67DA\u67DC-\u67DE\u67E0\u67E2\u67E5\u67E9\u67EC\u67EF-\u67F1\u67F3-\u67F4\u67FD\u67FF-\u6800\u6805\u6807-\u680C\u680E-\u680F\u6811\u6813\u6816-\u6817\u681D\u6821\u6829-\u682A\u6832-\u6833\u6837-\u6839\u683C-\u683E\u6840-\u6846\u6848-\u684A\u684C\u684E\u6850-\u6851\u6853-\u6855\u6860-\u6869\u686B\u6874\u6876-\u6877\u6881\u6883\u6885-\u6886\u688F\u6893\u6897\u68A2\u68A6-\u68A8\u68AD\u68AF-\u68B0\u68B3\u68B5\u68C0\u68C2\u68C9\u68CB\u68CD\u68D2\u68D5\u68D8\u68DA\u68E0\u68E3\u68EE\u68F0-\u68F1\u68F5\u68F9-\u68FA\u68FC\u6901\u6905\u690B\u690D-\u690E\u6910\u6912\u691F-\u6920\u6924\u692D\u6930\u6934\u6939\u693D\u693F\u6942\u6954\u6957\u695A\u695D-\u695E\u6960\u6963\u6966\u696B\u696E\u6971\u6977-\u6979\u697C\u6980\u6982\u6984\u6986-\u6989\u698D\u6994-\u6995\u6998\u699B-\u699C\u69A7-\u69A8\u69AB\u69AD\u69B1\u69B4\u69B7\u69BB\u69C1\u69CA\u69CC\u69CE\u69D0\u69D4\u69DB\u69DF-\u69E0\u69ED\u69F2\u69FD\u69FF\u6A0A\u6A17-\u6A18\u6A1F\u6A21\u6A28\u6A2A\u6A2F\u6A31\u6A35\u6A3D-\u6A3E\u6A44\u6A47\u6A50\u6A58-\u6A59\u6A5B\u6A61\u6A65\u6A71\u6A79\u6A7C\u6A80\u6A84\u6A8E\u6A90-\u6A91\u6A97\u6AA0\u6AA9\u6AAB-\u6AAC\u6B20-\u6B24\u6B27\u6B32\u6B37\u6B39-\u6B3A\u6B3E\u6B43\u6B46-\u6B47\u6B49\u6B4C\u6B59\u6B62-\u6B67\u6B6A\u6B79\u6B7B-\u6B7C\u6B81-\u6B84\u6B86-\u6B87\u6B89-\u6B8B\u6B8D\u6B92-\u6B93\u6B96\u6B9A-\u6B9B\u6BA1\u6BAA\u6BB3-\u6BB5\u6BB7\u6BBF\u6BC1-\u6BC2\u6BC5\u6BCB\u6BCD\u6BCF\u6BD2-\u6BD7\u6BD9\u6BDB\u6BE1\u6BEA-\u6BEB\u6BEF\u6BF3\u6BF5\u6BF9\u6BFD\u6C05-\u6C07\u6C0D\u6C0F-\u6C11\u6C13-\u6C16\u6C18-\u6C1B\u6C1F\u6C21-\u6C22\u6C24\u6C26-\u6C2A\u6C2E-\u6C30\u6C32\u6C34-\u6C35\u6C38\u6C3D\u6C40-\u6C42\u6C46-\u6C47\u6C49-\u6C4A\u6C50\u6C54-\u6C55\u6C57\u6C5B-\u6C61\u6C64\u6C68-\u6C6A\u6C70\u6C72\u6C74\u6C76\u6C79\u6C7D-\u6C7E\u6C81-\u6C83\u6C85-\u6C86\u6C88-\u6C89\u6C8C\u6C8F-\u6C90\u6C93-\u6C94\u6C99\u6C9B\u6C9F\u6CA1\u6CA3-\u6CA7\u6CA9-\u6CAB\u6CAD-\u6CAE\u6CB1-\u6CB3\u6CB8-\u6CB9\u6CBB-\u6CBF\u6CC4-\u6CC5\u6CC9-\u6CCA\u6CCC\u6CD0\u6CD3-\u6CD7\u6CDB\u6CDE\u6CE0-\u6CE3\u6CE5\u6CE8\u6CEA-\u6CEB\u6CEE-\u6CF1\u6CF3\u6CF5-\u6CF8\u6CFA-\u6CFE\u6D01\u6D04\u6D07\u6D0B-\u6D0C\u6D0E\u6D12\u6D17\u6D19-\u6D1B\u6D1E\u6D25\u6D27\u6D2A-\u6D2B\u6D2E\u6D31-\u6D33\u6D35\u6D39\u6D3B-\u6D3E\u6D41\u6D43\u6D45-\u6D48\u6D4A-\u6D4B\u6D4D-\u6D4F\u6D51-\u6D54\u6D59-\u6D5A\u6D5C\u6D5E\u6D60\u6D63\u6D66\u6D69-\u6D6A\u6D6E-\u6D6F\u6D74\u6D77-\u6D78\u6D7C\u6D82\u6D85\u6D88-\u6D89\u6D8C\u6D8E\u6D91\u6D93-\u6D95\u6D9B\u6D9D-\u6DA1\u6DA3-\u6DA4\u6DA6-\u6DAB\u6DAE-\u6DAF\u6DB2\u6DB5\u6DB8\u6DBF-\u6DC0\u6DC4-\u6DC7\u6DCB-\u6DCC\u6DD1\u6DD6\u6DD8-\u6DD9\u6DDD-\u6DDE\u6DE0-\u6DE1\u6DE4\u6DE6\u6DEB-\u6DEC\u6DEE\u6DF1\u6DF3\u6DF7\u6DF9\u6DFB-\u6DFC\u6E05\u6E0A\u6E0C-\u6E0E\u6E10-\u6E11\u6E14\u6E16-\u6E17\u6E1A\u6E1D\u6E20-\u6E21\u6E23-\u6E25\u6E29\u6E2B\u6E2D\u6E2F\u6E32\u6E34\u6E38\u6E3A\u6E43-\u6E44\u6E4D-\u6E4E\u6E53-\u6E54\u6E56\u6E58\u6E5B\u6E5F\u6E6B\u6E6E\u6E7E-\u6E7F\u6E83\u6E85-\u6E86\u6E89\u6E8F-\u6E90\u6E98\u6E9C\u6E9F\u6EA2\u6EA5\u6EA7\u6EAA\u6EAF\u6EB1-\u6EB2\u6EB4\u6EB6-\u6EB7\u6EBA-\u6EBB\u6EBD\u6EC1-\u6EC2\u6EC7\u6ECB\u6ECF\u6ED1\u6ED3-\u6ED5\u6ED7\u6EDA\u6EDE-\u6EE2\u6EE4-\u6EE6\u6EE8-\u6EE9\u6EF4\u6EF9\u6F02\u6F06\u6F09\u6F0F\u6F13-\u6F15\u6F20\u6F24\u6F29-\u6F2B\u6F2D\u6F2F\u6F31\u6F33\u6F36\u6F3E\u6F46-\u6F47\u6F4B\u6F4D\u6F58\u6F5C\u6F5E\u6F62\u6F66\u6F6D-\u6F6E\u6F72\u6F74\u6F78\u6F7A\u6F7C\u6F84\u6F88-\u6F89\u6F8C-\u6F8E\u6F9C\u6FA1\u6FA7\u6FB3\u6FB6\u6FB9\u6FC0\u6FC2\u6FC9\u6FD1-\u6FD2\u6FDE\u6FE0-\u6FE1\u6FEE-\u6FEF\u7011\u701A-\u701B\u7023\u7035\u7039\u704C\u704F\u705E\u706B-\u706D\u706F-\u7070\u7075-\u7076\u7078\u707C\u707E-\u7080\u7085\u7089-\u708A\u708E\u7092\u7094-\u7096\u7099\u709C-\u709D\u70AB-\u70AF\u70B1\u70B3\u70B7-\u70B9\u70BB-\u70BD\u70C0-\u70C3\u70C8\u70CA\u70D8-\u70D9\u70DB\u70DF\u70E4\u70E6-\u70E9\u70EB-\u70ED\u70EF\u70F7\u70F9\u70FD\u7109-\u710A\u7110\u7113\u7115-\u7116\u7118-\u711A\u7126\u712F-\u7131\u7136\u7145\u714A\u714C\u714E\u715C\u715E\u7164\u7166-\u7168\u716E\u7172-\u7173\u7178\u717A\u717D\u7184\u718A\u718F\u7194\u7198-\u7199\u719F-\u71A0\u71A8\u71AC\u71B3\u71B5\u71B9\u71C3\u71CE\u71D4-\u71D5\u71E0\u71E5\u71E7\u71EE\u71F9\u7206\u721D\u7228\u722A\u722C\u7230-\u7231\u7235-\u7239\u723B\u723D\u723F\u7247-\u7248\u724C-\u724D\u7252\u7256\u7259\u725B\u725D\u725F\u7261-\u7262\u7266-\u7267\u7269\u726E-\u726F\u7272\u7275\u7279-\u727A\u727E-\u7281\u7284\u728A-\u728B\u728D\u728F\u7292\u729F\u72AC-\u72AD\u72AF-\u72B0\u72B4\u72B6-\u72B9\u72C1-\u72C4\u72C8\u72CD-\u72CE\u72D0\u72D2\u72D7\u72D9\u72DE\u72E0-\u72E1\u72E8-\u72E9\u72EC-\u72F4\u72F7-\u72F8\u72FA-\u72FC\u7301\u7303\u730A\u730E\u7313\u7315-\u7317\u731B-\u731E\u7321-\u7322\u7325\u7329-\u732C\u732E\u7331\u7334\u7337-\u7339\u733E-\u733F\u734D\u7350\u7352\u7357\u7360\u736C-\u736D\u736F\u737E\u7384\u7387\u7389\u738B\u738E\u7391\u7396\u739B\u739F\u73A2\u73A9\u73AB\u73AE-\u73B0\u73B2-\u73B3\u73B7\u73BA-\u73BB\u73C0\u73C2\u73C8-\u73CA\u73CD\u73CF-\u73D1\u73D9\u73DE\u73E0\u73E5\u73E7\u73E9\u73ED\u73F2\u7403\u7405-\u7406\u7409-\u740A\u740F-\u7410\u741A-\u741B\u7422\u7425-\u7426\u7428\u742A\u742C\u742E\u7430\u7433-\u7436\u743C\u7441\u7455\u7457\u7459-\u745C\u745E-\u745F\u746D\u7470\u7476-\u7477\u747E\u7480-\u7481\u7483\u7487\u748B\u748E\u7490\u749C\u749E\u74A7-\u74A9\u74BA\u74D2\u74DC\u74DE\u74E0\u74E2-\u74E4\u74E6\u74EE-\u74EF\u74F4\u74F6-\u74F7\u74FF\u7504\u750D\u750F\u7511\u7513\u7518-\u751A\u751C\u751F\u7525\u7528-\u7529\u752B-\u752D\u752F-\u7533\u7535\u7537-\u7538\u753A-\u753B\u753E\u7540\u7545\u7548\u754B-\u754C\u754E-\u754F\u7554\u7559-\u755C\u7565-\u7566\u756A\u7572\u7574\u7578-\u7579\u757F\u7583\u7586\u758B\u758F\u7591-\u7592\u7594\u7596-\u7597\u7599-\u759A\u759D\u759F-\u75A1\u75A3-\u75A5\u75AB-\u75AC\u75AE-\u75B5\u75B8-\u75B9\u75BC-\u75BE\u75C2-\u75C5\u75C7-\u75CA\u75CD\u75D2\u75D4-\u75D6\u75D8\u75DB\u75DE\u75E2-\u75E4\u75E6-\u75E8\u75EA-\u75EB\u75F0-\u75F1\u75F4\u75F9\u75FC\u75FF-\u7601\u7603\u7605\u760A\u760C\u7610\u7615\u7617-\u7619\u761B\u761F-\u7620\u7622\u7624-\u7626\u7629-\u762B\u762D\u7630\u7633-\u7635\u7638\u763C\u763E-\u7640\u7643\u764C-\u764D\u7654\u7656\u765C\u765E\u7663\u766B\u766F\u7678\u767B\u767D-\u767E\u7682\u7684\u7686-\u7688\u768B\u768E\u7691\u7693\u7696\u7699\u76A4\u76AE\u76B1-\u76B2\u76B4\u76BF\u76C2\u76C4-\u9CE2\u9E1F-\u9E23\u9E25-\u9E26\u9E28-\u9E2D\u9E2F\u9E31-\u9E33\u9E35-\u9E3A\u9E3D-\u9E3F\u9E41-\u9E4C\u9E4E-\u9E4F\u9E51\u9E55\u9E57-\u9E58\u9E5A-\u9E5C\u9E5E\u9E63-\u9E64\u9E66-\u9E6D\u9E70-\u9E71\u9E73\u9E7E-\u9E7F\u9E82\u9E87-\u9E88\u9E8B\u9E92-\u9E93\u9E9D\u9E9F\u9EA6\u9EB4\u9EB8\u9EBB\u9EBD-\u9EBE\u9EC4\u9EC9\u9ECD-\u9ECF\u9ED1\u9ED4\u9ED8\u9EDB-\u9EDD\u9EDF-\u9EE0\u9EE2\u9EE5\u9EE7\u9EE9-\u9EEA\u9EEF\u9EF9\u9EFB-\u9EFC\u9EFE\u9F0B\u9F0D-\u9F0E\u9F10\u9F13\u9F17\u9F19\u9F20\u9F22\u9F2C\u9F2F\u9F37\u9F39\u9F3B\u9F3D-\u9F3E\u9F50-\u9F51\u9F7F-\u9F80\u9F83-\u9F8C\u9F99-\u9F9B\u9F9F-\u9FA0\u3000-\u303F\uFF01-\uFF60\u201C-\u201D\u2018-\u2019\u2014\u2026\uFFE5\u00B7";
	}
}
