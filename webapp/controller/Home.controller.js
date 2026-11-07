sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("mindtek.controller.Home", {
		onInit: function () {
			var oModel = new JSONModel({ showAll: false });
			this.getView().setModel(oModel, "experience");
			this._oExperienceModel = oModel;

			var oToggle = this.byId("experienceToggle");
			oToggle.addEventDelegate({
				onAfterRendering: function () {
					var oDom = oToggle.getDomRef();
					if (oDom) {
						oDom.setAttribute("aria-expanded", this._oExperienceModel.getProperty("/showAll") ? "true" : "false");
					}
				}
			}, this);

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

		onToggleExperience: function () {
			var bShow = !this._oExperienceModel.getProperty("/showAll");
			this._oExperienceModel.setProperty("/showAll", bShow);
			var oToggle = this.byId("experienceToggle");
			Promise.resolve(this.getResourceBundle()).then(function (oBundle) {
				oToggle.setText(oBundle.getText(bShow ? "experienceShowFewer" : "experienceShowMore"));
				var oDom = oToggle.getDomRef();
				if (oDom) {
					oDom.setAttribute("aria-expanded", bShow ? "true" : "false");
				}
			});
		}
	});
});
