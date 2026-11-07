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

			["nameInput", "workEmailInput", "requirementInput"].forEach(function (sId) {
				this.byId(sId).attachLiveChange(function (oEvent) {
					oEvent.getSource().setValueState("None");
				});
			}, this);
		},

		onSubmitRequest: function () {
			var oFormData = this.getView().getModel("form").getData();
			var that = this;

			Promise.resolve(this.getResourceBundle()).then(function (oResourceBundle) {
				that._submitWithBundle(oResourceBundle, oFormData);
			});
		},

		_setFieldState: function (oControl, bValid, sMessage) {
			oControl.setValueState(bValid ? "None" : "Error");
			oControl.setValueStateText(bValid ? "" : sMessage);
		},

		/**
		 * Field keys and the mailto body stay as the existing payload.
		 * Validation only adds value state and moves focus to the message,
		 * then back to the first field that needs attention.
		 */
		_submitWithBundle: function (oResourceBundle, oFormData) {
			var oName = this.byId("nameInput");
			var oEmail = this.byId("workEmailInput");
			var oRequirement = this.byId("requirementInput");
			var bName = !!oFormData.name;
			var bEmail = !!oFormData.workEmail;
			var bRequirement = !!oFormData.requirement;

			this._setFieldState(oName, bName, oResourceBundle.getText("formNameError"));
			this._setFieldState(oEmail, bEmail, oResourceBundle.getText("formEmailError"));
			this._setFieldState(oRequirement, bRequirement, oResourceBundle.getText("formRequirementError"));

			if (!bName || !bEmail || !bRequirement) {
				var oFirstInvalid = !bName ? oName : (!bEmail ? oEmail : oRequirement);
				MessageBox.warning(oResourceBundle.getText("validationErrorMessage"), {
					title: oResourceBundle.getText("validationErrorTitle"),
					onClose: function () {
						oFirstInvalid.focus();
					}
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
			this._setFieldState(this.byId("nameInput"), true, "");
			this._setFieldState(this.byId("workEmailInput"), true, "");
			this._setFieldState(this.byId("requirementInput"), true, "");
		}
	});
});
