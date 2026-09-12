sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("mindtek.controller.Home", {
		onInit: function () {
			this.attachNativeClick("heroDiscussButton", this.onNavToContact);
			this.attachNativeClick("closingCtaButton", this.onNavToContact);
			this.attachNativeClick("heroExploreButton", this.onScrollToServices);
			this.attachNativeClick("portfolioTeaserButton", this.onNavToPortfolio);
		},

		onScrollToServices: function () {
			var oSection = this.getView().byId("servicesSection");
			if (oSection && oSection.getDomRef()) {
				oSection.getDomRef().scrollIntoView({ behavior: "smooth", block: "start" });
			}
		}
	});
});
