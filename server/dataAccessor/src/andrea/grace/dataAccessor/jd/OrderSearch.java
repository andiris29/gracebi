package andrea.grace.dataAccessor.jd;

import com.jd.open.api.sdk.DefaultJdClient;
import com.jd.open.api.sdk.JdClient;
import com.jd.open.api.sdk.JdException;
import com.jd.open.api.sdk.domain.order.OrderResult;
import com.jd.open.api.sdk.request.order.OrderSearchRequest;
import com.jd.open.api.sdk.response.order.OrderSearchResponse;

public class OrderSearch {

	private JdClient _client;

	public OrderSearch(String api, String token, String appKey, String secret) {
		_client = new DefaultJdClient(api, token, appKey, secret);
	}

	private String _optionalFields;
	private String _startDate;
	private String _endDate;
	private String _orderState;

	public String search(String orderState, String optionalFields, String startDate, String endDate) throws JdException {
		_optionalFields = optionalFields;
		_startDate = startDate;
		_endDate = endDate;
		_orderState = orderState;

		int page = 1;
		int pageSize = 3;

		String result = "";
		while (true) {
			OrderSearchResponse jdResponse = _search(page, pageSize);
			OrderResult jdResult = jdResponse.getOrderInfoResult();
			String s = jdResponse.getMsg();
			if (result.equals("")) {
				result = "[" + s;
			} else {
				result = result + "," + s;
			}

			if (jdResult == null || page * pageSize >= jdResult.getOrderTotal()) {
				break;
			}
			page++;
		}
		result = result + "]";
		return result;
	}

	private OrderSearchResponse _search(int page, int pageSize) throws JdException {
		OrderSearchRequest jdRequest = new OrderSearchRequest();
		jdRequest.setStartDate(_startDate);
		jdRequest.setEndDate(_endDate);
		jdRequest.setOrderState(_orderState);
		jdRequest.setPage(String.valueOf(page));
		jdRequest.setPageSize(String.valueOf(pageSize));
		jdRequest.setOptionalFields(_optionalFields);
		OrderSearchResponse jdResponse = _client.execute(jdRequest);

		return jdResponse;
	}
}
