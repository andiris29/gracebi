import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

// <Context path="/logger" reloadable="true"
// docBase="C:\andiris29\13.SourceForge\antSoftware\personal.andrea.graceBI\trunk\dev\src\Logger"
// workDir="C:\andiris29\13.SourceForge\antSoftware\personal.andrea.graceBI\trunk\dev\src\Logger\work"
// >
// </Context>

// http://localhost:8080/logger
public class LogServlet extends HttpServlet {
	private static Logger log = LogManager.getLogger("grace");
	private static final long serialVersionUID = -5872550381598468246L;

	private static String LINE_SPLITTER = "%LINE_SPLITTER%";

	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		_do(request, response);
	}

	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		_do(request, response);
	}

	private void _do(HttpServletRequest request, HttpServletResponse response)
			throws IOException {
		// Message
		String msg = request.getParameter("msg");
		if (msg == null || msg.equals("")) {
			return;
		}
		String[] msgs = msg.split(LINE_SPLITTER);
		// Level
		String level = request.getParameter("level");

		// Write log
		if (level == null) {

		} else if (level.equals("info")) {
			for (int i = 0; i < msgs.length; i++) {
				log.info(request.getRemoteAddr() + "," + msgs[i]);
			}

		} else if (level.equals("error")) {
			for (int i = 0; i < msgs.length; i++) {
				log.error(request.getRemoteAddr() + "," + msgs[i]);
			}
		}
	}
}
