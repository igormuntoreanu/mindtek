sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function (BaseController, MessageBox, JSONModel) {
	"use strict";

	return BaseController.extend("mindtek.controller.Contact", {
		onInit: function () {
			this.getView().setModel(new JSONModel({
				name: "",
				workEmail: "",
				company: "",
				projectType: "",
				requirement: ""
			}), "form");

			this.byId("contactPage").addEventDelegate({
				onAfterShow: this.onAfterShow
			}, this);
		},

		/**
		 * sap.m.NavContainer / sap.m.App autoFocus lands on the first focusable
		 * control of the page. Focus Name explicitly so the enquiry form is ready.
		 */
		onAfterShow: function () {
			var oNameInput = this.byId("nameInput");
			if (oNameInput) {
				oNameInput.focus();
			}
		},

		onSubmitRequest: function () {
			var oFormData = this.getView().getModel("form").getData();
			var that = this;

			Promise.resolve(this.getResourceBundle()).then(function (oResourceBundle) {
				that._submitWithBundle(oResourceBundle, oFormData);
			});
		},

		_submitWithBundle: function (oResourceBundle, oFormData) {
			if (!oFormData.name || !oFormData.workEmail || !oFormData.requirement) {
				MessageBox.warning(oResourceBundle.getText("validationErrorMessage"), {
					title: oResourceBundle.getText("validationErrorTitle")
				});
				return;
			}

			var sCompanyEmail = oResourceBundle.getText("companyContactEmail");
			var sSubject = oResourceBundle.getText("emailSubject");
			var sBody = [
				"Name: " + oFormData.name,
				"Work Email: " + oFormData.workEmail,
				"Company: " + (oFormData.company || "-"),
				"Project Type: " + (oFormData.projectType || "-"),
				"",
				"Requirement:",
				oFormData.requirement
			].join("\n");

			window.location.href = "mailto:" + sCompanyEmail +
				"?subject=" + encodeURIComponent(sSubject) +
				"&body=" + encodeURIComponent(sBody);

			MessageBox.information(
				oResourceBundle.getText("submitInfoMessage", [oFormData.name, sCompanyEmail]),
				{ title: oResourceBundle.getText("submitInfoTitle") }
			);
		},

		onClearForm: function () {
			this.getView().getModel("form").setData({
				name: "",
				workEmail: "",
				company: "",
				projectType: "",
				requirement: ""
			});
			this.byId("nameInput").focus();
		}
	});
});
