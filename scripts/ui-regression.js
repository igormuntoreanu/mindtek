/**
 * Focused UI checks for the company site at phone and desktop widths.
 * Expects `ui5 serve` on UI5_URL (default http://localhost:8080).
 * Does not submit the contact form.
 */
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const BASE = process.env.UI5_URL || "http://localhost:8080";
const OUT = process.env.UI_ARTIFACTS || "/opt/cursor/artifacts/after";
const VIEWPORTS = [
	{ name: "360", width: 360, height: 844 },
	{ name: "390", width: 390, height: 844 },
	{ name: "430", width: 430, height: 844 },
	{ name: "1280", width: 1280, height: 900 }
];
const ROUTES = [
	{ path: "/", name: "home", h1: "SAP expertise, delivered directly." },
	{ path: "/about", name: "about", h1: "About MindTek" },
	{ path: "/people", name: "people", h1: "People" },
	{ path: "/work", name: "work", h1: "Work" },
	{ path: "/contact", name: "contact", h1: "Discuss your project" }
];
const LOCAL_DEMOS = [
	"http://localhost:8081/index.html",
	"http://localhost:8082/index.html",
	"http://localhost:8083/index.html",
	"http://localhost:8084/index.html",
	"http://localhost:8086/index.html",
	"http://localhost:8085/index.html"
];

const results = [];

function record(name, ok, detail) {
	results.push({ name: name, ok: !!ok, detail: detail || "" });
	console.log((ok ? "PASS" : "FAIL") + "  " + name + (detail ? "  " + detail : ""));
}

async function launch() {
	var executablePath = process.env.CHROME_PATH || "/usr/bin/google-chrome";
	return puppeteer.launch({
		headless: true,
		executablePath: executablePath,
		args: ["--no-sandbox", "--disable-dev-shm-usage"]
	});
}

async function prepare(page) {
	await page.evaluateOnNewDocument(function () {
		try {
			localStorage.setItem("mindtek_cookie_consent", "accepted");
		} catch (e) {
			/* ignore */
		}
	});
}

async function openRoute(page, routePath) {
	const failed = [];
	const logs = [];
	const onResponse = function (res) {
		if (res.status() >= 400) {
			failed.push(res.status() + " " + res.url());
		}
	};
	const onConsole = function (msg) {
		logs.push(msg.type() + ": " + msg.text());
	};
	const onError = function (err) {
		logs.push("PAGE: " + err.message);
	};
	page.on("response", onResponse);
	page.on("console", onConsole);
	page.on("pageerror", onError);
	await page.goto(BASE + routePath, { waitUntil: "networkidle0", timeout: 90000 });
	await page.waitForFunction(function () {
		var h1 = document.querySelector("h1");
		return h1 && h1.innerText && h1.innerText.length > 1 && h1.innerText.indexOf("~ /") === -1;
	}, { timeout: 30000 });
	await new Promise(function (resolve) { setTimeout(resolve, 400); });
	return {
		failed: failed,
		logs: logs,
		stop: function () {
			page.off("response", onResponse);
			page.off("console", onConsole);
			page.off("pageerror", onError);
		}
	};
}

function ignored404(url) {
	return url.indexOf("Component-preload.js") !== -1;
}

async function measure(page) {
	return page.evaluate(function () {
		var h1 = document.querySelector("h1");
		var shell = document.querySelector(".mindtek-shellbar");
		var offenders = [];
		Array.prototype.forEach.call(document.querySelectorAll("body *"), function (el) {
			var rect = el.getBoundingClientRect();
			if (rect.width < 8 || rect.height < 8) {
				return;
			}
			if (rect.right > window.innerWidth + 1 && rect.left < window.innerWidth - 8) {
				var style = getComputedStyle(el);
				if (style.position === "fixed") {
					return;
				}
				offenders.push((el.id || el.className || el.tagName).toString().slice(0, 80));
			}
		});
		var emphasized = Array.prototype.map.call(
			document.querySelectorAll(".mindtek-shellbar .sapMBtnEmphasized"),
			function (el) { return el.innerText.replace(/\s+/g, " ").trim(); }
		);
		var h1Clip = !!(h1 && (h1.scrollWidth > h1.clientWidth + 1));
		return {
			h1: h1 ? h1.innerText.replace(/\s+/g, " ").trim() : "",
			h1Clip: h1Clip,
			docScroll: document.documentElement.scrollWidth,
			inner: window.innerWidth,
			shellScroll: shell ? shell.scrollWidth : 0,
			shellClient: shell ? shell.clientWidth : 0,
			emphasized: emphasized,
			offenders: offenders.slice(0, 8)
		};
	});
}

async function main() {
	fs.mkdirSync(OUT, { recursive: true });
	const browser = await launch();
	const page = await browser.newPage();
	await prepare(page);

	for (var v = 0; v < VIEWPORTS.length; v++) {
		var viewport = VIEWPORTS[v];
		await page.setViewport({
			width: viewport.width,
			height: viewport.height,
			deviceScaleFactor: viewport.width < 600 ? 2 : 1
		});
		for (var r = 0; r < ROUTES.length; r++) {
			var route = ROUTES[r];
			var watch = await openRoute(page, route.path);
			var box = await measure(page);
			var id = viewport.name + " " + route.name;
			record(id + " heading", box.h1 === route.h1 && !box.h1Clip, "h1=" + box.h1 + " clip=" + box.h1Clip);
			record(id + " no page overflow", box.docScroll <= box.inner + 1 && box.shellScroll <= box.shellClient + 1,
				"doc=" + box.docScroll + " shell=" + box.shellScroll + "/" + box.shellClient + " offenders=" + box.offenders.join("|"));
			record(id + " one header CTA", box.emphasized.length === 1 && box.emphasized[0] === "Discuss your project",
				box.emphasized.join(","));
			var bad = watch.failed.filter(function (entry) { return !ignored404(entry); });
			var badLogs = watch.logs.filter(function (line) {
				return /wrappingType|unknown setting|i18n_en_GB|x@2\.svg|x02\.svg|assets\/icons\/x\.svg/i.test(line);
			});
			record(id + " console", bad.length === 0 && badLogs.length === 0, bad.concat(badLogs).slice(0, 4).join(" | "));
			if (viewport.name === "360" || viewport.name === "1280" ||
					(viewport.name === "390" && route.name === "work") ||
					(viewport.name === "430" && (route.name === "contact" || route.name === "about"))) {
				await page.screenshot({ path: path.join(OUT, viewport.name + "-" + route.name + ".png") });
			}
			watch.stop();
		}
	}

	await page.setViewport({ width: 360, height: 844, deviceScaleFactor: 2 });
	await openRoute(page, "/");
	var menuButton = await page.$(".mindtek-nav-menu-button");
	record("360 menu button", !!menuButton, "");
	if (menuButton) {
		var menuBox = await menuButton.boundingBox();
		record("360 menu target", menuBox && menuBox.width >= 40 && menuBox.height >= 40,
			menuBox ? Math.round(menuBox.width) + "x" + Math.round(menuBox.height) : "missing");
		await menuButton.click();
		await page.waitForSelector(".sapMPopover a", { timeout: 5000 });
		var menu = await page.evaluate(function () {
			return Array.prototype.map.call(document.querySelectorAll(".sapMPopover a"), function (a) {
				var rect = a.getBoundingClientRect();
				return {
					text: a.innerText.trim(),
					href: a.getAttribute("href"),
					current: a.getAttribute("aria-current"),
					h: rect.height
				};
			});
		});
		var work = menu.filter(function (item) { return item.href === "/work/"; })[0];
		record("360 menu keeps Work", !!work && work.h >= 40, JSON.stringify(menu.map(function (item) { return item.text; })));
		record("360 menu current home", menu.some(function (item) { return item.href === "/" && item.current === "page"; }), "");
		await page.screenshot({ path: path.join(OUT, "360-menu.png") });
		await page.keyboard.press("Escape");
	}

	await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
	await openRoute(page, "/about");
	var desktopNav = await page.evaluate(function () {
		return Array.prototype.map.call(document.querySelectorAll(".mindtek-shellbar a.mindtek-nav-link"), function (a) {
			var rect = a.getBoundingClientRect();
			return {
				text: a.innerText.trim(),
				href: a.getAttribute("href"),
				current: a.getAttribute("aria-current"),
				w: rect.width,
				h: rect.height,
				weight: getComputedStyle(a).fontWeight
			};
		});
	});
	record("1280 text nav visible", desktopNav.length === 4 && desktopNav.every(function (item) { return item.w > 20 && item.h >= 40; }),
		desktopNav.map(function (item) { return item.text + ":" + Math.round(item.h); }).join(","));
	record("1280 about is current", desktopNav.some(function (item) { return item.href === "/about/" && item.current === "page"; }), "");
	record("1280 phone menu hidden", (await page.$(".mindtek-nav-menu-button")) === null || !(await page.$eval(".mindtek-nav-menu-button", function (el) {
		return el.getBoundingClientRect().width > 0;
	})), "");

	await openRoute(page, "/contact");
	var contact = await page.evaluate(function () {
		function labelFor(labelStart) {
			var label = Array.prototype.find.call(document.querySelectorAll("label"), function (node) {
				return node.innerText.replace(/\*/g, "").trim().indexOf(labelStart) === 0;
			});
			var target = label && document.getElementById(label.getAttribute("for"));
			return {
				label: label ? label.innerText.replace(/\s+/g, " ").trim() : "",
				forId: label ? label.getAttribute("for") : "",
				matched: !!(target && /INPUT|TEXTAREA|SELECT/.test(target.tagName))
			};
		}
		var email = document.querySelector("a[href^='mailto:']");
		var form = document.querySelector("form, .sapUiForm, .sapUiRespGrid");
		var emailTop = email ? email.getBoundingClientRect().top : 9999;
		var formTop = form ? form.getBoundingClientRect().top : 0;
		var active = document.activeElement;
		return {
			name: labelFor("Name"),
			emailField: labelFor("Work email"),
			company: labelFor("Company"),
			project: labelFor("SAP area"),
			requirement: labelFor("How can we help?"),
			mailto: email ? email.getAttribute("href") : "",
			emailBeforeForm: emailTop < formTop,
			activeId: active ? active.id : "",
			help: (document.body.innerText || "").indexOf("A few lines on the system") !== -1,
			privacy: (document.body.innerText || "").indexOf("We use your details only to respond to your enquiry.") !== -1,
			send: (document.querySelector("[id$='submitFormButton'] .sapMBtnEmphasized, [id$='submitFormButton']") || {}).innerText || "",
			clearType: document.querySelector("[id$='clearFormButton']") ? document.querySelector("[id$='clearFormButton']").className : ""
		};
	});
	record("contact mailto", contact.mailto === "mailto:contact@mindtek-ltd.com" && contact.emailBeforeForm, contact.mailto);
	record("contact labels", contact.name.matched && contact.emailField.matched && contact.company.matched && contact.project.matched && contact.requirement.matched,
		JSON.stringify({ name: contact.name, email: contact.emailField, company: contact.company, project: contact.project, requirement: contact.requirement }));
	record("contact no autofocus", contact.activeId.indexOf("nameInput") === -1, contact.activeId);
	record("contact helper and privacy", contact.help && contact.privacy, "");
	var sendText = await page.$eval("[id$='submitFormButton']", function (el) { return el.innerText.replace(/\s+/g, " ").trim(); });
	var sendEmphasized = await page.$("[id$='submitFormButton'] .sapMBtnEmphasized");
	var clearTransparent = await page.$("[id$='clearFormButton'] .sapMBtnTransparent");
	record("contact actions", sendText === "Send message" && !!sendEmphasized && !!clearTransparent, sendText);
	await page.click("label[id$='nameLabel']");
	var nameFocus = await page.evaluate(function () { return document.activeElement && document.activeElement.id; });
	record("contact label focuses name", nameFocus.indexOf("nameInput") !== -1, nameFocus);

	await page.click("[id$='submitFormButton']");
	await page.waitForSelector(".sapMDialog", { timeout: 5000 });
	var invalid = await page.evaluate(function () {
		function state(idPart) {
			var input = document.querySelector("[id$='" + idPart + "-inner']");
			return input ? input.getAttribute("aria-invalid") : "";
		}
		return {
			href: location.href,
			name: state("nameInput"),
			email: state("workEmailInput"),
			requirement: state("requirementInput"),
			dialog: (document.querySelector(".sapMDialog") || {}).innerText || ""
		};
	});
	record("contact validation stays on page", invalid.href.indexOf("mailto:") === -1, invalid.href);
	record("contact validation message", /Name, Work email and How can we help/.test(invalid.dialog), invalid.dialog.slice(0, 180));
	record("contact value state", invalid.name === "true" && invalid.email === "true" && invalid.requirement === "true",
		[invalid.name, invalid.email, invalid.requirement].join(" | "));
	await page.keyboard.press("Escape");

	await openRoute(page, "/work");
	var work = await page.evaluate(function () {
		var links = Array.prototype.map.call(document.querySelectorAll("a[target='_blank']"), function (a) {
			return { href: a.href, rel: a.getAttribute("rel") || "", text: a.innerText.trim() };
		});
		var body = document.body.innerText;
		return {
			links: links,
			fictional: body.indexOf("Demo with fictional data") !== -1,
			benefit: body.indexOf("Review journal entries and inspect individual records.") !== -1,
			floorplan: body.indexOf("List Report + Object Page") !== -1,
			social: !!document.querySelector("[id$='linkedinButton'], [id$='xButton'], [id$='youtubeButton'], img[src*='x.svg']")
		};
	});
	var hrefs = work.links.map(function (link) { return link.href; }).sort();
	record("work demo urls", LOCAL_DEMOS.slice().sort().join("|") === hrefs.join("|"), hrefs.join(","));
	record("work new tab", work.links.every(function (link) {
		return link.text.indexOf("opens in a new tab") !== -1 && /noopener/.test(link.rel);
	}), work.links.map(function (link) { return link.rel; }).join(","));
	record("work copy", work.fictional && work.benefit && work.floorplan, "");
	record("no placeholder socials", !work.social, "");

	var homeWidths = [360, 390, 430, 1280];
	for (var h = 0; h < homeWidths.length; h++) {
		await page.setViewport({ width: homeWidths[h], height: 844, deviceScaleFactor: homeWidths[h] < 600 ? 2 : 1 });
		await openRoute(page, "/");
		var home = await page.evaluate(function () {
		var homeRoot = document.querySelector("[id$='homeContent']") || document.body;
		var logos = Array.prototype.filter.call(homeRoot.querySelectorAll(".mindtek-client-logo"), function (img) {
			var rect = img.getBoundingClientRect();
			return rect.height > 0 && rect.width > 0 && rect.right <= window.innerWidth + 1;
		});
		var body = homeRoot.innerText;
		var people = homeRoot.querySelector("[id$='peopleSection']");
		var experience = homeRoot.querySelector("[id$='experienceSection']");
		var services = homeRoot.querySelector("[id$='servicesSection']");
		var heroButtons = Array.prototype.map.call(homeRoot.querySelectorAll("[id$='homeHero'] button"), function (button) {
			return button.innerText.replace(/\s+/g, " ").trim();
		});
		var headerCta = document.querySelector(".mindtek-header-cta");
		return {
			logos: logos.length,
			logoNodes: homeRoot.querySelectorAll(".mindtek-client-logo").length,
			order: ["Benefits", "What we deliver", "Ways to engage", "How we work", "Experience across organisations"].every(function (label) {
				return body.indexOf(label) !== -1;
			}),
			peopleBeforeLogos: !!(people && experience && services &&
				services.offsetTop < people.offsetTop && people.offsetTop < experience.offsetTop),
			clientsWord: /Our clients|client logos/i.test(body),
			disclaimer: body.indexOf("do not indicate client relationships with MindTek") !== -1,
			toggle: body.indexOf("Show more organisations") === -1 && body.indexOf("Show fewer") === -1,
			heroButtons: heroButtons,
			headerCta: headerCta ? headerCta.innerText.replace(/\s+/g, " ").trim() : "",
			igor: body.indexOf("Igor Muntoreanu") !== -1 && body.indexOf("Founder and Principal Developer") !== -1,
			neska: body.indexOf("Neska Braga") !== -1 && body.indexOf("Director and Principal Project Manager") !== -1,
			photos: Array.prototype.filter.call(people ? people.querySelectorAll(".sapFAvatarImageHolder") : [], function (holder) {
				var image = getComputedStyle(holder).backgroundImage || "";
				return image.indexOf("mindtek-igor") !== -1 || image.indexOf("mindtek-neska") !== -1;
			}).length
		};
	});
		var widthLabel = String(homeWidths[h]);
		record(widthLabel + " home all logos visible", home.logos === 28 && home.logoNodes === 28, "visible=" + home.logos + " nodes=" + home.logoNodes);
		record(widthLabel + " home section order", home.order && home.disclaimer && home.toggle && home.peopleBeforeLogos && !home.clientsWord, JSON.stringify({
			peopleBeforeLogos: home.peopleBeforeLogos,
			toggle: home.toggle
		}));
		record(widthLabel + " home hero has no contact CTA", home.heroButtons.length === 1 && home.heroButtons[0] === "Explore our work" && home.headerCta === "Discuss your project",
			"hero=" + home.heroButtons.join(",") + " header=" + home.headerCta);
		record(widthLabel + " home shows both people", home.igor && home.neska && home.photos === 2, "photos=" + home.photos);
	}

	await openRoute(page, "/people");
	var people = await page.evaluate(function () {
		var text = document.body.innerText;
		var photos = document.querySelectorAll("img[src*='mindtek-igor'], img[src*='mindtek-neska'], .sapFCardHeader img, .sapFAvatar").length;
		return {
			igor: text.indexOf("Founder and Principal Developer") !== -1 && text.indexOf("16 years") !== -1,
			neska: text.indexOf("Director and Principal Project Manager") !== -1 && text.indexOf("PRINCE2") !== -1,
			opener: text.indexOf("Small team, experienced professionals") !== -1,
			photos: photos
		};
	});
	record("people bios", people.igor && people.neska && people.opener, "photos=" + people.photos);

	var source = fs.readFileSync(path.join(__dirname, "../webapp/controller/Contact.controller.js"), "utf8");
	record("contact payload keys",
		source.indexOf("Name: ") !== -1 &&
		source.indexOf("Work Email: ") !== -1 &&
		source.indexOf("Company: ") !== -1 &&
		source.indexOf("Project Type: ") !== -1 &&
		source.indexOf("Requirement:") !== -1 &&
		source.indexOf("name:") !== -1 &&
		source.indexOf("workEmail:") !== -1 &&
		source.indexOf("projectType:") !== -1 &&
		source.indexOf("requirement:") !== -1,
		"");

	var portfolio = fs.readFileSync(path.join(__dirname, "../webapp/controller/Portfolio.controller.js"), "utf8");
	record("published demo urls unchanged",
		[
			"https://mindtek-ltd.com/journalentry-monitor/",
			"https://mindtek-ltd.com/journalentry-monitor-alp/",
			"https://mindtek-ltd.com/sales-overview/",
			"https://mindtek-ltd.com/purchaseorder-worklist/",
			"https://mindtek-ltd.com/warehouse-cockpit/",
			"https://mindtek-ltd.com/supplier-registration/"
		].every(function (url) { return portfolio.indexOf(url) !== -1; }),
		"");

	await browser.close();
	var failedChecks = results.filter(function (item) { return !item.ok; });
	console.log("\n" + results.length + " checks, " + failedChecks.length + " failed");
	if (failedChecks.length) {
		process.exit(1);
	}
}

main().catch(function (error) {
	console.error(error);
	process.exit(1);
});
