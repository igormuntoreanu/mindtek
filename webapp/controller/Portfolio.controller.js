sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("mindtek.controller.Portfolio", {
		onInit: function () {
			var oData = {
				selected: {
					key: "lrop",
					title: "Travel Management",
					floorplan: "List Report Object Page",
					icon: "sap-icon://table-view",
					description: "A Fiori List Report and Object Page showcasing list-detail patterns, search, filters and navigation."
				},
				apps: [
					{
						key: "lrop",
						title: "Travel Management",
						floorplan: "List Report Object Page",
						icon: "sap-icon://table-view",
						description: "A Fiori List Report and Object Page showcasing list-detail patterns, search, filters and navigation."
					},
					{
						key: "ovp",
						title: "Sales Overview",
						floorplan: "Overview Page",
						icon: "sap-icon://overview-chart",
						description: "An Overview Page with cards and analytical tiles summarising key sales KPIs at a glance."
					},
					{
						key: "alp",
						title: "Inventory Analytics",
						floorplan: "Analytical List Page",
						icon: "sap-icon://bar-chart",
						description: "An Analytical List Page with charts and a smart filter bar for inventory analysis."
					},
					{
						key: "worklist",
						title: "Approvals Worklist",
						floorplan: "Worklist",
						icon: "sap-icon://approvals",
						description: "A Worklist floorplan for processing and approving pending tasks in one place."
					},
					{
						key: "freestyle",
						title: "Warehouse Cockpit",
						floorplan: "Freestyle / Custom",
						icon: "sap-icon://grid",
						description: "A custom freestyle SAPUI5 application tailored to warehouse operations."
					},
					{
						key: "feop",
						title: "Supplier Registration",
						floorplan: "Form Entry Object Page",
						icon: "sap-icon://form",
						description: "A Form Entry Object Page for structured supplier onboarding."
					}
				]
			};
			this.getView().setModel(new JSONModel(oData), "portfolio");
		},

		onOpenApp: function (oEvent) {
			var oItem = oEvent.getParameter("listItem");
			if (!oItem) {
				return;
			}
			var oApp = oItem.getBindingContext("portfolio").getObject();
			this.getView().getModel("portfolio").setProperty("/selected", oApp);
		}
	});
});
