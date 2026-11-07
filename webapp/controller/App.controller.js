sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (BaseController, JSONModel, Device) {
	"use strict";

	var NAV_LINKS = [
		{ id: "navHomeLink", routes: ["home"] },
		{ id: "navAboutLink", routes: ["about"] },
		{ id: "navPeopleLink", routes: ["people"] },
		{ id: "navWorkLink", routes: ["work", "portfolio"] },
		{ id: "navHomeMenuLink", routes: ["home"] },
		{ id: "navAboutMenuLink", routes: ["about"] },
		{ id: "navPeopleMenuLink", routes: ["people"] },
		{ id: "navWorkMenuLink", routes: ["work", "portfolio"] }
	];

	return BaseController.extend("mindtek.controller.App", {
		onInit: function () {
			this.getView().addStyleClass("sapUiSizeCozy");
			this._initCookieBanner();

			var oNavModel = new JSONModel({
				currentRoute: "home"
			});
			this.getOwnerComponent().setModel(oNavModel, "nav");
			this._oNavModel = oNavModel;

			this._oLayoutModel = new JSONModel({
				phone: false,
				tablet: false,
				desktop: true,
				range: "Desktop"
			});
			this.getOwnerComponent().setModel(this._oLayoutModel, "layout");
			this._syncLayout();
			Device.media.attachHandler(this._syncLayout, this, Device.media.RANGESETS.SAP_STANDARD);

			NAV_LINKS.forEach(function (oItem) {
				var oLink = this.byId(oItem.id);
				if (!oLink) {
					return;
				}
				oLink.addEventDelegate({
					onAfterRendering: function () {
						this._applyNavCurrent(oLink, oItem.routes);
					}
				}, this);
			}, this);

			var oPopover = this.byId("navPopover");
			var oMenuButton = this.byId("navMenuButton");
			oMenuButton.addEventDelegate({
				onAfterRendering: function () {
					var oDom = oMenuButton.getDomRef();
					if (oDom && !oDom.getAttribute("aria-expanded")) {
						oDom.setAttribute("aria-expanded", "false");
					}
				}
			});
			oPopover.attachBeforeOpen(function () {
				var oDom = oMenuButton.getDomRef();
				if (oDom) {
					oDom.setAttribute("aria-expanded", "true");
				}
			});
			oPopover.attachAfterClose(function () {
				var oDom = oMenuButton.getDomRef();
				if (oDom) {
					oDom.setAttribute("aria-expanded", "false");
				}
			});

			this.getRouter().attachRouteMatched(function (oEvent) {
				var sRoute = oEvent.getParameter("name");
				oNavModel.setProperty("/currentRoute", sRoute);
				this._syncNavState();
				this._applySeo(sRoute);
			}, this);
		},

		onExit: function () {
			Device.media.detachHandler(this._syncLayout, this, Device.media.RANGESETS.SAP_STANDARD);
		},

		_syncLayout: function () {
			var oRange = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD) || {};
			var sName = oRange.name || "Desktop";
			this._oLayoutModel.setData({
				phone: sName === "Phone",
				tablet: sName === "Tablet",
				desktop: sName === "Desktop",
				range: sName
			});
		},

		_syncNavState: function () {
			NAV_LINKS.forEach(function (oItem) {
				var oLink = this.byId(oItem.id);
				if (oLink) {
					this._applyNavCurrent(oLink, oItem.routes);
				}
			}, this);
		},

		/**
		 * The current page is a link state, not a second emphasised button.
		 * aria-current="page" is the accessible name for that state.
		 */
		_applyNavCurrent: function (oLink, aRoutes) {
			var sRoute = this._oNavModel.getProperty("/currentRoute");
			var bCurrent = aRoutes.indexOf(sRoute) !== -1;
			oLink.toggleStyleClass("mindtek-nav-current", bCurrent);
			var oDom = oLink.getDomRef();
			if (!oDom) {
				return;
			}
			if (bCurrent) {
				oDom.setAttribute("aria-current", "page");
			} else {
				oDom.removeAttribute("aria-current");
			}
		},

		onToggleNavMenu: function () {
			var oPopover = this.byId("navPopover");
			if (oPopover.isOpen()) {
				oPopover.close();
				return;
			}
			oPopover.openBy(this.byId("navMenuButton"));
		},

		onNavMenuSelect: function (oEvent) {
			this.onSeoNav(oEvent);
			this.byId("navPopover").close();
		},

		onSkipToMain: function (oEvent) {
			oEvent.preventDefault();
			var oApp = this.byId("app");
			var oPage = oApp && oApp.getCurrentPage && oApp.getCurrentPage();
			if (!oPage || !oPage.findAggregatedObjects) {
				return;
			}
			var aTitles = oPage.findAggregatedObjects(true, function (oControl) {
				return oControl.isA && oControl.isA("sap.m.Title") && oControl.getLevel && oControl.getLevel() === "H1";
			});
			var oTitle = aTitles && aTitles[0];
			var oDom = oTitle && oTitle.getDomRef();
			if (!oDom) {
				return;
			}
			if (!oDom.getAttribute("tabindex")) {
				oDom.setAttribute("tabindex", "-1");
			}
			oDom.focus();
		},

		/**
		 * One title, description and canonical URL per route. The canonical
		 * keeps the trailing slash because GitHub Pages serves /about/ and
		 * redirects /about to it.
		 */
		_seoPages: {
			home: {
				title: "MindTek | Direct SAP expertise",
				description: "UK SAP consultancy. Work directly with senior SAP experts on Fiori, UI5, ABAP and integration.",
				path: "/"
			},
			about: {
				title: "About | MindTek",
				description: "Direct, accountable SAP delivery, supported by AI agents and reviewed by experts.",
				path: "/about/"
			},
			people: {
				title: "People | MindTek",
				description: "Meet the SAP development and project delivery professionals you will work with directly.",
				path: "/people/"
			},
			work: {
				title: "Work | MindTek",
				description: "Interactive SAP UI5 demos built with fictional data.",
				path: "/work/"
			},
			portfolio: {
				title: "Work | MindTek",
				description: "Interactive SAP UI5 demos built with fictional data.",
				path: "/work/"
			},
			contact: {
				title: "Contact | MindTek",
				description: "Discuss your SAP project directly with an expert.",
				path: "/contact/"
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
		 * Keep each page at the top after navigation so the page heading stays in view.
		 */
		onAfterNavigate: function (oEvent) {
			var oTo = oEvent.getParameter("to");
			if (oTo && typeof oTo.scrollTo === "function") {
				oTo.scrollTo(0, 0);
			}
		}
	});
});
