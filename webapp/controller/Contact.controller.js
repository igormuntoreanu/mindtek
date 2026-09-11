sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function (BaseController, MessageBox, JSONModel) {
	"use strict";

	return BaseController.extend("mindtek.controller.Contact", {
		onInit: function () {
			// local, page-scoped model holding the current form input
			this.getView().setModel(new JSONModel({
				name: "",
				workEmail: "",
				company: "",
				projectType: "",
				requirement: ""
			}), "form");

			// sap.m.Select opens a stretched full-screen Dialog on phone-sized
			// viewports. This landing page always wants a compact dropdown.
			this._usePopoverPicker(this.byId("projectTypeSelect"));
		},

		/**
		 * Recreates the Select picker as a Popover when UI5 would have used a Dialog.
		 * @param {sap.m.Select} oSelect the project-type field
		 */
		_usePopoverPicker: function (oSelect) {
			if (!oSelect || oSelect.getPickerType() === "Popover") {
				return;
			}
			oSelect.destroyAggregation("picker");
			oSelect.setPickerType("Popover");
			oSelect.createPicker("Popover");
		},

		onSubmitRequest: function () {
			var oResourceBundle = this.getResourceBundle();
			var oFormData = this.getView().getModel("form").getData();

			if (!oFormData.name || !oFormData.workEmail || !oFormData.requirement) {
				MessageBox.warning(oResourceBundle.getText("validationErrorMessage"), {
					title: oResourceBundle.getText("validationErrorTitle")
				});
				return;
			}

			// Open the visitor's email app with the enquiry pre-filled.
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

			var sMailto = "mailto:" + sCompanyEmail +
				"?subject=" + encodeURIComponent(sSubject) +
				"&body=" + encodeURIComponent(sBody);
			window.location.href = sMailto;

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
		}
	});
});
