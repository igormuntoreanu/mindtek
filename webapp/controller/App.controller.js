sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("mindtek.controller.App", {
		onInit: function () {
			this.getView().addStyleClass("sapUiSizeCozy");
			this._initCookieBanner();

			var oNavModel = new JSONModel({
				currentRoute: "home"
			});
			this.getOwnerComponent().setModel(oNavModel, "nav");

			this.getRouter().attachRouteMatched(function (oEvent) {
				var sRoute = oEvent.getParameter("name");
				oNavModel.setProperty("/currentRoute", sRoute);
				this._applySeo(sRoute);
			}, this);
		},

		/**
		 * One title, description and canonical URL per route. Google treats
		 * the hash in /#/about as the same page as /, so the address bar is
		 * updated to a real path such as /about/ as well.
		 */
		_seoPages: {
			home: {
				title: "MindTek Ltd | SAP ABAP, RAP, Fiori and CPI consultancy",
				description: "Hands-on SAP technical delivery. MindTek Ltd analyses, estimates, develops and tests ABAP, RAP, CDS, Fiori, OData, S/4HANA, CAP, CPI and Workflow, with a written scope before work starts.",
				path: "/",
				hash: "#/"
			},
			about: {
				title: "About MindTek Ltd | SAP technical consultancy",
				description: "MindTek Ltd is a small SAP consultancy. You work directly with the people writing the code, from ABAP and RAP through Fiori, integrations and go-live.",
				path: "/about/",
				hash: "#/about"
			},
			people: {
				title: "Our People | SAP consultants at MindTek Ltd",
				description: "Meet Igor Muntoreanu and Neska Braga. The directors you brief are the SAP consultants who estimate, build and deliver the work.",
				path: "/people/",
				hash: "#/people"
			},
			work: {
				title: "SAP Fiori app showcase | MindTek Ltd",
				description: "A launchpad-style showcase of SAP Fiori apps and floorplans, including List Report, Analytical List Page and Overview Page demos.",
				path: "/work/",
				hash: "#/work"
			},
			portfolio: {
				title: "SAP Fiori app showcase | MindTek Ltd",
				description: "A launchpad-style showcase of SAP Fiori apps and floorplans, including List Report, Analytical List Page and Overview Page demos.",
				path: "/work/",
				hash: "#/work"
			},
			contact: {
				title: "Request an SAP quote | MindTek Ltd",
				description: "Tell MindTek Ltd about your SAP requirement. We reply with a written scope and a quote for ABAP, RAP, Fiori, CAP, CPI or a technical review.",
				path: "/contact/",
				hash: "#/contact"
			}
		},

		_applySeo: function (sRoute) {
			var oPage = this._seoPages[sRoute] || this._seoPages.home;
			var sUrl = "https://mindtek-ltd.com" + oPage.path;

			document.title = oPage.title;
			this._setMeta("description", oPage.description);
			this._setMeta("og:title", oPage.title, "property");
			this._setMeta("og:description", oPage.description, "property");
			this._setMeta("og:url", sUrl, "property");

			var oCanonical = document.querySelector('link[rel="canonical"]');
			if (!oCanonical) {
				oCanonical = document.createElement("link");
				oCanonical.setAttribute("rel", "canonical");
				document.head.appendChild(oCanonical);
			}
			oCanonical.setAttribute("href", sUrl);

			var sNext = oPage.path + oPage.hash;
			if (window.location.pathname + window.location.hash !== sNext) {
				window.history.replaceState({ route: sRoute }, "", sNext);
			}
		},

		_setMeta: function (sName, sContent, sAttr) {
			var sKey = sAttr || "name";
			var oMeta = document.querySelector("meta[" + sKey + "='" + sName + "']");
			if (!oMeta) {
				oMeta = document.createElement("meta");
				oMeta.setAttribute(sKey, sName);
				document.head.appendChild(oMeta);
			}
			oMeta.setAttribute("content", sContent);
		},

		/**
		 * Shows the cookie consent bar once per browser unless the user has
		 * already accepted. The site sets no tracking cookies, so accepting just
		 * records the choice in localStorage.
		 */
		_initCookieBanner: function () {
			if (this._bCookieBannerHandled) {
				return;
			}
			this._bCookieBannerHandled = true;

			var sConsent = null;
			try {
				sConsent = window.localStorage.getItem("mindtek_cookie_consent");
			} catch (e) {
				// localStorage unavailable - still show the banner
			}
			if (sConsent === "accepted") {
				this.byId("cookieBanner").setVisible(false);
			}
		},

		onCookieBannerAccept: function () {
			try {
				window.localStorage.setItem("mindtek_cookie_consent", "accepted");
			} catch (e) {
				// ignore storage failures
			}
			this.byId("cookieBanner").setVisible(false);
		},

		onCookieBannerPrivacy: function () {
			this.byId("privacyDialog").open();
		},

		onPrivacyDialogClose: function () {
			this.byId("privacyDialog").close();
		},

		/**
		 * Keep each page at the top after navigation so a GridList tile
		 * cannot hide the page heading.
		 */
		onAfterNavigate: function (oEvent) {
			var oTo = oEvent.getParameter("to");
			if (oTo && typeof oTo.scrollTo === "function") {
				oTo.scrollTo(0, 0);
			}
		}
	});
});
