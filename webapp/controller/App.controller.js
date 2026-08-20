sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("mindtek.controller.App", {
		onInit: function () {
			var oNavModel = new JSONModel({
				currentRoute: "home"
			});
			this.getOwnerComponent().setModel(oNavModel, "nav");

			this.getRouter().attachRouteMatched(function (oEvent) {
				oNavModel.setProperty("/currentRoute", oEvent.getParameter("name"));
			}, this);
		},

		onAfterRendering: function () {
			// Guarantee the header logos navigate home on a real click, independent
			// of the Image control's tap/press synthesis (which can be unreliable
			// inside toolbars on some browsers). onNavToHome guards against the
			// double navigation that would occur when both press and this handler
			// fire.
			var aLogos = ["appShellBarLogoLeft", "appShellBarLogoRight"],
				i;
			for (i = 0; i < aLogos.length; i++) {
				var oLogo = this.getView().byId(aLogos[i]);
				if (oLogo) {
					oLogo.attachBrowserEvent("click", this.onNavToHome, this);
				}
			}
		}
	});
});
