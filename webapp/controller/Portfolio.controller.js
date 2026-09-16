sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("mindtek.controller.Portfolio", {
		_showcaseUrl: function (sLocal, sPublished) {
			var sHost = window.location.hostname;
			if (sHost === "localhost" || sHost === "127.0.0.1") {
				return sLocal;
			}
			return sPublished;
		},

		onInit: function () {
			this.byId("portfolioPage").addEventDelegate({
				onAfterShow: this.onPortfolioShown
			}, this);

			var sListReportUrl = this._showcaseUrl(
				"http://localhost:8081/index.html",
				"https://igormuntoreanu.github.io/mindtek-journalentry-monitor/"
			);
			var sAlpUrl = this._showcaseUrl(
				"http://localhost:8082/index.html",
				"https://igormuntoreanu.github.io/mindtek-journalentry-monitor-alp/"
			);

			var oJem = {
				key: "jem",
				title: "Journal Entry Monitor",
				floorplan: "List Report + Object Page",
				icon: "sap-icon://accounting-document-verification",
				description: "A read-only Fiori Elements List Report for SAP universal journal line items: company code, G/L account, cost center, amounts and reversed items.",
				url: sListReportUrl
			};

			var oData = {
				selected: oJem,
				apps: [
					oJem,
					{
						key: "ovp",
						title: "Sales Overview",
						floorplan: "Overview Page",
						icon: "sap-icon://overview-chart",
						description: "An Overview Page with cards and analytical tiles summarising key sales KPIs at a glance.",
						url: ""
					},
					{
						key: "alp",
						title: "Journal Entry Monitor",
						floorplan: "Analytical List Page + Object Page",
						icon: "sap-icon://bar-chart",
						description: "The Analytical List Page variant of the journal entry monitor, with KPIs, a chart and a table over the same SAP universal journal line items.",
						url: sAlpUrl
					},
					{
						key: "worklist",
						title: "Approvals Worklist",
						floorplan: "Worklist",
						icon: "sap-icon://approvals",
						description: "A Worklist floorplan for processing and approving pending tasks in one place.",
						url: ""
					},
					{
						key: "freestyle",
						title: "Warehouse Cockpit",
						floorplan: "Freestyle / Custom",
						icon: "sap-icon://grid",
						description: "A custom freestyle SAPUI5 application tailored to warehouse operations.",
						url: ""
					},
					{
						key: "feop",
						title: "Supplier Registration",
						floorplan: "Form Entry Object Page",
						icon: "sap-icon://form",
						description: "A Form Entry Object Page for structured supplier onboarding.",
						url: ""
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
			this._openShowcaseApp(oApp);
		},

		onPortfolioAction: function () {
			var oApp = this.getView().getModel("portfolio").getProperty("/selected");
			if (this._openShowcaseApp(oApp)) {
				return;
			}
			this.onNavToContact();
		},

		_openShowcaseApp: function (oApp) {
			if (oApp && oApp.url) {
				window.open(oApp.url, "_blank", "noopener,noreferrer");
				return true;
			}
			return false;
		}
	});
});
