import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import andrea.grace.dataAccessor.jd.AccessData;
import andrea.grace.dataAccessor.jd.GetToken;

import com.jd.open.api.sdk.JdException;

public class JD extends HttpServlet {
	private static final long serialVersionUID = -5872550381598468246L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
		try {
			String method = request.getParameter("method");
			String appKey = request.getParameter("appKey");
			String json;
			if (method.equals("access")) {
				json = new AccessData(request, appKey, _getSecret(appKey)).run();
			} else if (method.equals("token")) {
				json = new GetToken(request, appKey, _getSecret(appKey)).run();
			} else {
				json = "";
			}
			// Write response
			response.setCharacterEncoding("utf-8");
			response.setHeader("content-type", "text/html;charset=utf-8");
			PrintWriter out = response.getWriter();

			String callback = request.getParameter("callback");
			out.println(callback + "(" + json + ");");
		} catch (JdException e) {
			e.printStackTrace();
		}
	}

	private String _getSecret(String appKey) {
		if (appKey.equals("52DAB8C615274D63570E146A20B7646E")) {
			// Sandbox
			return "2dbc011153054b4eb0f47cefbb76fe44";
		} else if (appKey.equals("E5D584C2CC4F6F92DDF43959EEA6CC45")) {
			// Production
			return "98eb9dc40e62486a91c6b0c0b362bcd2";
		} else {
			return "";
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
	}

}
