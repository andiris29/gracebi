package andrea.grace.dataAccessor.jd;

import javax.servlet.http.HttpServletRequest;

import com.jd.open.api.sdk.JdException;

public class AccessData {
	private HttpServletRequest _request;

	private String _appKey;
	private String _secret;

	public AccessData(HttpServletRequest request, String appKey, String secret) {
		_request = request;

		_appKey = appKey;
		_secret = secret;
	}

	public String run() throws JdException {
		String json;
		// Access jd
		json = "{" + _search("WAIT_SELLER_STOCK_OUT") + "," + _search("SEND_TO_DISTRIBUTION_CENER") + ","
				+ _search("DISTRIBUTION_CENTER_RECEIVED") + "," + _search("WAIT_GOODS_RECEIVE_CONFIRM") + ","
				+ _search("RECEIPTS_CONFIRM") + "," + _search("WAIT_SELLER_DELIVERY") + "," + _search("FINISHED_L")
				+ "," + _search("TRADE_CANCELED") + "," + _search("LOCKED") + "}";
		return json;
	}

	private String _search(String orderState) throws JdException {
		OrderSearch search = new OrderSearch(_request.getParameter("api"), _request.getParameter("token"), _appKey,
				_secret);

		return "'"
				+ orderState
				+ "':"
				+ search.search(orderState, _request.getParameter("optional_fields"),
						_request.getParameter("start_date"), _request.getParameter("end_date"));
	}
}
