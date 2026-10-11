sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("mindtek.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the i18n resource bundle.
		 * @returns {sap.base.i18n.ResourceBundle|Promise<sap.base.i18n.ResourceBundle>} the resource bundle
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		onNavToHome: function () {
			this.getRouter().navTo("home");
		},

		onNavToWork: function () {
			this.getRouter().navTo("work");
		},

		onNavToPortfolio: function () {
			this.getRouter().navTo("work");
		},

		onNavToAbout: function () {
			this.getRouter().navTo("about");
		},

		onNavToPeople: function () {
			this.getRouter().navTo("people");
		},

		onNavToContact: function () {
			this.getRouter().navTo("contact");
		},

		/**
		 * Footer links use real hrefs so a crawler can follow them. In the
		 * app, stay on the current page and let the router change the view.
		 */
		onSeoNav: function (oEvent) {
			oEvent.preventDefault();
			var sRoute = oEvent.getSource().data("route");
			if (sRoute) {
				this.getRouter().navTo(sRoute);
			}
		},

		onOpenSocialLink: function (oEvent) {
			// Placeholder hrefs stay "#" until verified company social URLs exist.
			var sUrl = oEvent.getSource().data("url");
			if (sUrl && sUrl !== "#") {
				window.open(sUrl, "_blank", "noopener,noreferrer");
			}
		}
	});
});
