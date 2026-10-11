/**
 * Save each route as static HTML so Google receives the page text without
 * having to execute OpenUI5. GitHub Pages cannot show a different page to
 * bots, so people and crawlers get the same snapshot, and the script in
 * that HTML still starts the interactive app.
 */
const fs = require("fs");
const http = require("http");
const path = require("path");

const DIST = path.join(__dirname, "..", "dist");
const PORT = 4173;
const ROUTES = [
	{ hash: "#/", file: "index.html", text: "Hands-on SAP technical delivery" },
	{ hash: "#/about", file: "about/index.html", text: "About MindTek" },
	{ hash: "#/people", file: "people/index.html", text: "Our People" },
	{ hash: "#/work", file: "work/index.html", text: "Work" },
	{ hash: "#/contact", file: "contact/index.html", text: "Request a quote" }
];

function contentType(filePath) {
	var ext = path.extname(filePath).toLowerCase();
	return ({
		".html": "text/html; charset=utf-8",
		".js": "text/javascript; charset=utf-8",
		".css": "text/css; charset=utf-8",
		".json": "application/json",
		".xml": "application/xml",
		".txt": "text/plain; charset=utf-8",
		".jpg": "image/jpeg",
		".jpeg": "image/jpeg",
		".png": "image/png",
		".ico": "image/x-icon",
		".svg": "image/svg+xml",
		".properties": "text/plain; charset=utf-8",
		".woff2": "font/woff2",
		".woff": "font/woff"
	})[ext] || "application/octet-stream";
}

function startServer(shellHtml) {
	return new Promise(function (resolve) {
		var server = http.createServer(function (req, res) {
			var urlPath = decodeURIComponent(req.url.split("?")[0]);
			if (urlPath === "/" || urlPath === "/index.html") {
				res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
				res.end(shellHtml);
				return;
			}
			var filePath = path.normalize(path.join(DIST, urlPath));
			if (!filePath.startsWith(DIST)) {
				res.writeHead(403);
				res.end();
				return;
			}
			if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
				res.writeHead(404);
				res.end();
				return;
			}
			res.writeHead(200, { "Content-Type": contentType(filePath) });
			fs.createReadStream(filePath).pipe(res);
		});
		server.listen(PORT, "127.0.0.1", function () {
			resolve(server);
		});
	});
}

async function launchBrowser() {
	var puppeteer;
	try {
		puppeteer = require("puppeteer");
	} catch (e) {
		puppeteer = require("puppeteer-core");
	}
	var executablePath = process.env.CHROME_PATH;
	if (!executablePath && typeof puppeteer.executablePath === "function") {
		try {
			executablePath = puppeteer.executablePath();
		} catch (e) {
			executablePath = "/usr/local/bin/google-chrome";
		}
	}
	return puppeteer.launch({
		headless: true,
		executablePath: executablePath,
		args: ["--no-sandbox", "--disable-dev-shm-usage"]
	});
}

async function main() {
	var shellPath = path.join(DIST, "index.html");
	if (!fs.existsSync(shellPath)) {
		throw new Error("dist/index.html is missing. Run ui5 build first.");
	}
	var shellHtml = fs.readFileSync(shellPath);
	var server = await startServer(shellHtml);
	var browser = await launchBrowser();
	try {
		for (var i = 0; i < ROUTES.length; i++) {
			var route = ROUTES[i];
			var page = await browser.newPage();
			await page.goto("http://127.0.0.1:" + PORT + "/" + route.hash, {
				waitUntil: "networkidle0",
				timeout: 120000
			});
			await page.waitForFunction(function (sText) {
				return document.body && document.body.innerText.indexOf(sText) !== -1;
			}, { timeout: 60000 }, route.text);
			var html = await page.content();
			html = html.replaceAll("http://127.0.0.1:" + PORT + "/", "/");
			html = html.replaceAll("http://localhost:" + PORT + "/", "/");
			var outFile = path.join(DIST, route.file);
			fs.mkdirSync(path.dirname(outFile), { recursive: true });
			fs.writeFileSync(outFile, html);
			await page.close();
			console.log("prerendered " + route.file);
		}
	} finally {
		await browser.close();
		await new Promise(function (resolve) {
			server.close(resolve);
		});
	}
}

main().catch(function (oError) {
	console.error(oError);
	process.exit(1);
});
