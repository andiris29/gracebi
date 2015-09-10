package andrea.grace.taobao;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.taobao.api.internal.util.WebUtils;

public class OAuth extends HttpServlet {
	private static final long serialVersionUID = -5872550381598468246L;

	private static String _topOAuthURL = "https://oauth.taobao.com/token";

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String method = request.getParameter("method");
		if ("token".equals(method)) {
			_token(request, response);
		} else if ("refresh".equals(method)) {
			_refresh(request, response);
		}
	}

	private void _token(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String topResponse = null;
		try {
			// Get token from TOP
			String code = request.getParameter("code");
			String state = request.getParameter("state");
			String appKey = request.getParameter("appKey");
			String secret = _getSecret(appKey);
			String redirectURI = request.getParameter("redirect_uri");

			Map<String, String> topRequestData = new HashMap<String, String>();
			topRequestData.put("grant_type", "authorization_code");
			topRequestData.put("code", code);
			topRequestData.put("client_id", appKey);
			topRequestData.put("client_secret", secret);
			topRequestData.put("redirect_uri", redirectURI);
			topRequestData.put("view", "web");
			topRequestData.put("state", state);

			topResponse = WebUtils.doPost(_topOAuthURL, topRequestData, 3000, 3000);
		} catch (Exception e) {
			topResponse = e.getMessage();
		}
		// Write response
		_write(request, response, topResponse);
		// Send result to node/mongo
		_toMongo(topResponse);
	}

	private void _refresh(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String token = request.getParameter("token");
		String state = request.getParameter("state");
		String appKey = request.getParameter("appKey");
		String secret = _getSecret(appKey);

		String topResponse = null;
		try {
			Map<String, String> topRequestData = new HashMap<String, String>();
			topRequestData.put("grant_type", "refresh_token");
			topRequestData.put("refresh_token", token);
			topRequestData.put("client_id", appKey);
			topRequestData.put("client_secret", secret);
			topRequestData.put("view", "web");
			topRequestData.put("state", state);
			topResponse = WebUtils.doPost(_topOAuthURL, topRequestData, 3000, 3000);
		} catch (Exception e) {
			topResponse = e.getMessage();
		}
		// Write response
		_write(request, response, topResponse);
		// Send result to node/mongo
		_toMongo(topResponse);
	}

	private void _write(HttpServletRequest request, HttpServletResponse response, String topResponse)
			throws IOException {
		String callback = request.getParameter("callback");

		response.setCharacterEncoding("utf-8");
		response.setHeader("content-type", "text/html;charset=utf-8");
		PrintWriter out = response.getWriter();

		if (callback != null) {
			out.println(callback + "(" + topResponse + ");");
		} else {
			out.println(topResponse);
		}
		out.close();
	}

	private void _toMongo(String topResponse) throws IOException {
		Map<String, String> nodeRequestData = new HashMap<String, String>();
		nodeRequestData.put("oauth", topResponse);
		WebUtils.doPost("http://localhost:30001/customer/fromTOP", nodeRequestData, 3000, 3000);
	}

	private String _getSecret(String appKey) {
		if (appKey.equals("21700680")) {
			// Development
			return "98831154902e1129c977cf7f8c2e2145";
		} else if (appKey.equals("21613035")) {
			// Production
			return "0cdf701594faeb88d2dd5c564bbbe5ce";
		} else if (appKey.equals("21557116")) {
			// Focosee
			return "673790b6f46d07a8e7a11702af6ca8d4";
		} else {
			return "";
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
	}

}
