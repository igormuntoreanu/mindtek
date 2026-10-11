sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("mindtek.controller.Home", {
		onInit: function () {
			this.byId("homePage").addEventDelegate({
				onAfterShow: this._showFromTop
			}, this);
		},

		/**
		 * Open on the hero. A focused control lower on the page makes the
		 * phone browser scroll the first view down.
		 */
		_showFromTop: function () {
			var oPage = this.byId("homePage");
			var oTitle = this.byId("heroTitle");
			if (oTitle && oTitle.getDomRef()) {
				oTitle.getDomRef().setAttribute("tabindex", "-1");
				oTitle.getDomRef().focus({ preventScroll: true });
			}
			if (oPage) {
				oPage.scrollTo(0, 0);
			}
		},

		onScrollToServices: function () {
			var oSection = this.getView().byId("servicesSection");
			if (oSection && oSection.getDomRef()) {
				oSection.getDomRef().scrollIntoView({ behavior: "smooth", block: "start" });
			}
		}
	});
});
