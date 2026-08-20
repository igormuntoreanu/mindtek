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
		 * @returns {Promise<sap.base.i18n.ResourceBundle>} the resource bundle
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		onNavToHome: function () {
			// Guard against double navigation (the logo can fire both the Image press
			// and a native click fallback).
			if (this._bNavToHomePending) {
				return;
			}
			this._bNavToHomePending = true;
			var that = this;
			setTimeout(function () {
				that._bNavToHomePending = false;
			}, 300);
			this.getRouter().navTo("home");
		},

		onNavToPortfolio: function () {
			this.getRouter().navTo("portfolio");
		},

		onNavToAbout: function () {
			this.getRouter().navTo("about");
		},

		onNavToContact: function () {
			this.getRouter().navTo("contact");
		},

		onOpenSocialLink: function (oEvent) {
			var sUrl = oEvent.getSource().data("url");
			if (sUrl && sUrl !== "#") {
				window.open(sUrl, "_blank", "noopener,noreferrer");
			}
		}
	});
});
