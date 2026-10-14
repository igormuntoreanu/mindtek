/**
 * Save each route as static HTML so Google receives the page text without
 * having to execute OpenUI5. GitHub Pages cannot show a different page to
 * bots, so people and crawlers get the same snapshot, and the script in
 * that HTML still starts the interactive app.
 *
 * Each file is the original index.html shell with the route's head tags and
 * a copy of the rendered page in #mindtek-prerender. The shell must keep its
 * data-sap-ui-component placeholder or ComponentSupport never starts the app,
 * and the copy must not keep UI5 ids or they clash with the live controls.
 */
const fs = require("fs");
const http = require("http");
const path = require("path");

const DIST = path.join(__dirname, "..", "dist");
const PORT = 4173;
const ROUTES = [
	{ path: "/", file: "index.html", text: "Hands-on SAP technical delivery" },
	{ path: "/about", file: "about/index.html", text: "About MindTek" },
	{ path: "/people", file: "people/index.html", text: "The directors you brief" },
	{ path: "/work", file: "work/index.html", text: "Working SAP Fiori demo apps" },
	{ path: "/contact", file: "contact/index.html", text: "Request a quote" }
];
const SHELL_PATHS = ROUTES.reduce(function (aPaths, route) {
	return aPaths.concat([route.path, route.path.replace(/\/?$/, "/")]);
}, ["/index.html"]);

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
			if (SHELL_PATHS.indexOf(urlPath) !== -1) {
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

/** Runs in the page. Returns the route's head values and a copy of the rendered app without UI5 ids. */
function captureSnapshot() {
	var oCopy = document.getElementById("container").cloneNode(true);
	oCopy.querySelectorAll("script").forEach(function (oScript) {
		oScript.remove();
	});
	[oCopy].concat(Array.prototype.slice.call(oCopy.querySelectorAll("*"))).forEach(function (oNode) {
		Array.prototype.slice.call(oNode.attributes).forEach(function (oAttr) {
			if (oAttr.name === "id" || oAttr.name === "for" || oAttr.name.indexOf("data-sap-ui") === 0
					|| /^aria-(labelledby|describedby|controls|owns|activedescendant)$/.test(oAttr.name)) {
				oNode.removeAttribute(oAttr.name);
			}
		});
	});
	function meta(sSelector) {
		var oMeta = document.querySelector(sSelector);
		return oMeta ? oMeta.getAttribute("content") : null;
	}
	var oCanonical = document.querySelector('link[rel="canonical"]');
	return {
		body: oCopy.innerHTML,
		styles: Array.prototype.slice.call(document.querySelectorAll('head link[rel="stylesheet"]')).map(function (oLink) {
			return '<link rel="stylesheet" href="' + oLink.getAttribute("href") + '">';
		}),
		title: document.title,
		description: meta('meta[name="description"]'),
		ogTitle: meta('meta[property="og:title"]'),
		ogDescription: meta('meta[property="og:description"]'),
		ogUrl: meta('meta[property="og:url"]'),
		canonical: oCanonical ? oCanonical.getAttribute("href") : null
	};
}

function escapeAttr(sValue) {
	return String(sValue).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function setMeta(sHtml, sAttr, sName, sContent) {
	if (sContent === null || sContent === undefined) {
		return sHtml;
	}
	var oPattern = new RegExp('(<meta\\s+' + sAttr + '="' + sName.replace(/[.:]/g, "\\$&") + '"\\s+content=")[^"]*(")');
	return sHtml.replace(oPattern, function (sAll, sStart, sEnd) {
		return sStart + escapeAttr(sContent) + sEnd;
	});
}

function buildPage(sShell, oSnap) {
	var sHtml = sShell.replace(/<title>[\s\S]*?<\/title>/, function () {
		return "<title>" + escapeAttr(oSnap.title) + "</title>";
	});
	sHtml = setMeta(sHtml, "name", "description", oSnap.description);
	sHtml = setMeta(sHtml, "property", "og:title", oSnap.ogTitle);
	sHtml = setMeta(sHtml, "property", "og:description", oSnap.ogDescription);
	sHtml = setMeta(sHtml, "property", "og:url", oSnap.ogUrl);
	if (oSnap.canonical) {
		sHtml = sHtml.replace(/(<link rel="canonical" href=")[^"]*(")/, function (sAll, sStart, sEnd) {
			return sStart + escapeAttr(oSnap.canonical) + sEnd;
		});
	}
	sHtml = sHtml.replace("</head>", function () {
		return "\t" + oSnap.styles.join("\n\t") + "\n</head>";
	});
	return sHtml.replace(/(<body[^>]*>)/, function (sBody) {
		return sBody + '\n\t<div id="mindtek-prerender" style="height: 100%;">' + oSnap.body + "</div>";
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
			await page.goto("http://127.0.0.1:" + PORT + route.path, {
				waitUntil: "networkidle0",
				timeout: 120000
			});
			await page.waitForFunction(function (sText) {
				return document.body && document.body.innerText.indexOf(sText) !== -1;
			}, { timeout: 60000 }, route.text);
			var snapshot = await page.evaluate(captureSnapshot);
			var html = buildPage(shellHtml.toString("utf8"), snapshot);
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
