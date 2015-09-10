import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.URL;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;

// http://localhost:8080/logger
public class FileServlet extends HttpServlet {
	private static final long serialVersionUID = -5872550381598468246L;

	private String _folder;

	public void init() throws ServletException {
		super.init();

		_folder = this.getServletContext().getRealPath("/files");
	}

	/**
	 * Get json
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String name = request.getParameter("name");

		if (name != null) {
			// Read json
			URL url = new URL(name);
			InputStream inputStream = url.openStream();

			StringWriter writer = new StringWriter();
			IOUtils.copy(inputStream, writer, "utf-8");
			String json = writer.toString();

			// Write response
			response.setCharacterEncoding("utf-8");
			response.setHeader("content-type", "text/html;charset=utf-8");
			PrintWriter out = response.getWriter();

			String callback = request.getParameter("callback");
			out.println(callback + "(" + json + ");");
			out.close();
		}
	}

	/**
	 * Save file&json
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String name = request.getParameter("name");

		String fileNative = null;
		String jsonURL = null;

		File file;
		int i = 1;
		while (true) {
			int endIndex = name.lastIndexOf(".");
			String main = null;
			String suffix = null;
			if (endIndex != -1) {
				main = name.substring(0, endIndex);
				suffix = name.substring(endIndex + 1);
			} else {
				main = name;
			}

			if (i > 1) {
				main = main + "_" + i;
			}

			String fileName = null;
			if (endIndex != -1) {
				fileName = main + "." + suffix;
			} else {
				fileName = main;
			}

			// Manual equal here!!!
			fileNative = _folder + "/" + fileName;

			file = new File(fileNative);
			file.getParentFile().mkdirs();
			if (file.exists()) {
				i++;
			} else {
				jsonURL = request.getRequestURL() + "s/" + main + ".json";
				break;
			}
		}
		// Write file
		BufferedInputStream inputStream = new BufferedInputStream(request.getInputStream());
		FileOutputStream outputStream = new FileOutputStream(file);
		byte[] bytes = new byte[1024];
		int v;
		while ((v = inputStream.read(bytes)) > 0) {
			outputStream.write(bytes, 0, v);
		}
		outputStream.flush();
		outputStream.close();
		inputStream.close();
		// Write response
		response.setCharacterEncoding("utf-8");
		response.setHeader("content-type", "text/html;charset=utf-8");
		PrintWriter out = response.getWriter();

		out.print("{\"json\":\"" + jsonURL + "\"}");
		out.close();
		// Write json
		Runtime runtime = Runtime.getRuntime();
		synchronized (runtime) {
			String[] cmdArray = new String[2];
			cmdArray[0] = "C:/Program Files (x86)/FileParser/FileParser.exe";
			cmdArray[1] = fileNative;
			runtime.exec(cmdArray);
		}
	}
}
