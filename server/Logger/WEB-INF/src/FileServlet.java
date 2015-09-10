import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

// http://localhost:8080/logger
public class FileServlet extends HttpServlet {
	private static final long serialVersionUID = -5872550381598468246L;

	private String _folder;

	public void init() throws ServletException {
		super.init();

		_folder = this.getServletContext().getRealPath("/files");
	}

	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		String name = request.getParameter("name");

		File file;
		int i = 1;
		while (true) {
			String[] f = name.split("\\.");

			if (i > 1) {
				f[0] = f[0] + "_" + i;
			}

			file = new File(_folder + "/" + StringUtils.join(f, "."));
			file.getParentFile().mkdirs();
			if (file.exists()) {
				i++;
			} else {
				break;
			}
		}

		BufferedInputStream inputStream = new BufferedInputStream(
				request.getInputStream());
		FileOutputStream outputStream = new FileOutputStream(file);
		byte[] bytes = new byte[1024];
		int v;
		while ((v = inputStream.read(bytes)) > 0) {
			outputStream.write(bytes, 0, v);
		}
		outputStream.flush();
		outputStream.close();
		inputStream.close();
	}
}
