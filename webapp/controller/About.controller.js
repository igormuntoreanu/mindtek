sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("mindtek.controller.About", {
		onInit: function () {
			this.attachNativeClick("aboutCtaButton", this.onNavToContact);
		}
	});
});
