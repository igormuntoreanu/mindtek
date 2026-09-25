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
				oNavModel.setProperty("/currentRoute", oEvent.getParameter("name"));
			}, this);
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
