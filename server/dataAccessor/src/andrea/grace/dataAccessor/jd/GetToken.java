package andrea.grace.dataAccessor.jd;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.io.IOUtils;

public class GetToken {
	private HttpServletRequest _request;

	private String _appKey;
	private String _secret;

	public GetToken(HttpServletRequest request, String appKey, String secret) {
		_request = request;

		_appKey = appKey;
		_secret = secret;
	}

	public String run() throws IOException {
		String redirect_uri = _request.getParameter("redirect_uri");
		redirect_uri = URLEncoder.encode(redirect_uri, "utf-8");

		String url = _request.getParameter("oauth") + "/token?grant_type=authorization_code&client_id=" + _appKey
				+ "&client_secret=" + _secret + "&scope=read&redirect_uri=" + redirect_uri + "&code="
				+ _request.getParameter("code") + "&state=" + _request.getParameter("state");
		URL uri = new URL(url);
		HttpURLConnection conn = (HttpURLConnection) uri.openConnection();
		conn.setRequestProperty("Accept-Charset", "utf-8");
		conn.setRequestMethod("POST");
		InputStream is = conn.getInputStream();
		StringWriter writer = new StringWriter();

		IOUtils.copy(is, writer, "utf-8");
		String json = writer.toString();
		return json;
	}

}
