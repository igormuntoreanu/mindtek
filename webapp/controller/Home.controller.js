sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("mindtek.controller.Home", {
		onScrollToServices: function () {
			var oSection = this.getView().byId("servicesSection");
			if (oSection && oSection.getDomRef()) {
				oSection.getDomRef().scrollIntoView({ behavior: "smooth", block: "start" });
			}
		}
	});
});
