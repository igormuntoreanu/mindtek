sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("mindtek.controller.Portfolio", {
		onInit: function () {
			this.byId("portfolioPage").addEventDelegate({
				onAfterShow: this.onPortfolioShown
			}, this);

			var oData = {
				selected: {
					key: "jem",
					title: "Journal Entry Monitor",
					floorplan: "List Report Object Page",
					icon: "sap-icon://accounting-document-verification",
					description: "A Fiori List Report for monitoring SAP journal entries: company code, fiscal year, posting date, document status, filters and list-to-detail navigation."
				},
				apps: [
					{
						key: "jem",
						title: "Journal Entry Monitor",
						floorplan: "List Report Object Page",
						icon: "sap-icon://accounting-document-verification",
						description: "A Fiori List Report for monitoring SAP journal entries: company code, fiscal year, posting date, document status, filters and list-to-detail navigation."
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

		/**
		 * Show the Work intro first. GridList otherwise focuses the first
		 * tile and the page heading scrolls out of view.
		 */
		onPortfolioShown: function () {
			var oPage = this.byId("portfolioPage");
			var oTitle = this.byId("portfolioPageTitle");
			if (oTitle && oTitle.getDomRef()) {
				oTitle.getDomRef().setAttribute("tabindex", "-1");
				oTitle.getDomRef().focus({ preventScroll: true });
			}
			if (oPage) {
				oPage.scrollTo(0, 0);
			}
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
