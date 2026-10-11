sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/Device"
], function (BaseController, JSONModel, MessageToast, Device) {
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
			Device.media.attachHandler(this._syncTileLayout, this, Device.media.RANGESETS.SAP_STANDARD);

			Promise.resolve(this.getResourceBundle()).then(function (oBundle) {
				this._setPortfolioModel(oBundle);
			}.bind(this));
		},

		onExit: function () {
			Device.media.detachHandler(this._syncTileLayout, this, Device.media.RANGESETS.SAP_STANDARD);
		},

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
		_setPortfolioModel: function (oBundle) {
			var aDefs = [
				{
					key: "jem",
					titleKey: "portfolioJemTitle",
					floorplanKey: "portfolioJemFloorplan",
					descriptionKey: "portfolioJemDescription",
					icon: "sap-icon://accounting-document-verification",
					url: this._showcaseUrl(
						"http://localhost:8081/index.html",
						"https://mindtek-ltd.com/journalentry-monitor/"
					)
				},
				{
					key: "alp",
					titleKey: "portfolioJemAlpTitle",
					floorplanKey: "portfolioJemAlpFloorplan",
					descriptionKey: "portfolioJemAlpDescription",
					icon: "sap-icon://bar-chart",
					url: this._showcaseUrl(
						"http://localhost:8082/index.html",
						"https://mindtek-ltd.com/journalentry-monitor-alp/"
					)
				},
				{
					key: "ovp",
					titleKey: "portfolioOvpTitle",
					floorplanKey: "portfolioOvpFloorplan",
					descriptionKey: "portfolioOvpDescription",
					icon: "sap-icon://overview-chart",
					url: this._showcaseUrl(
						"http://localhost:8083/index.html",
						"https://mindtek-ltd.com/sales-overview/"
					)
				},
				{
					key: "worklist",
					titleKey: "portfolioWorklistTitle",
					floorplanKey: "portfolioWorklistFloorplan",
					descriptionKey: "portfolioWorklistDescription",
					icon: "sap-icon://approvals",
					url: this._showcaseUrl(
						"http://localhost:8084/index.html",
						"https://mindtek-ltd.com/purchaseorder-worklist/"
					)
				},
				{
					key: "freestyle",
					titleKey: "portfolioFreestyleTitle",
					floorplanKey: "portfolioFreestyleFloorplan",
					descriptionKey: "portfolioFreestyleDescription",
					icon: "sap-icon://grid",
					url: ""
				},
				{
					key: "feop",
					titleKey: "portfolioFeopTitle",
					floorplanKey: "portfolioFeopFloorplan",
					descriptionKey: "portfolioFeopDescription",
					icon: "sap-icon://form",
					url: ""
				}
			];

			var aApps = aDefs.map(function (oDef) {
				var bLive = !!oDef.url;
				return {
					key: oDef.key,
					title: oBundle.getText(oDef.titleKey),
					floorplan: oBundle.getText(oDef.floorplanKey),
					description: oBundle.getText(oDef.descriptionKey),
					icon: oDef.icon,
					url: oDef.url,
					status: oBundle.getText(bLive ? "portfolioLive" : "portfolioComingSoon"),
					ariaLabel: bLive ? oBundle.getText("portfolioOpensNewTab") : ""
				};
			});
			var aLive = aApps.filter(function (oApp) {
				return !!oApp.url;
			});
			var aSoon = aApps.filter(function (oApp) {
				return !oApp.url;
			});

			this.getView().setModel(new JSONModel({
				phone: this._isPhoneWidth(),
				apps: aLive.concat(aSoon)
			}), "portfolio");
		},

		_isPhoneWidth: function () {
			return Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD).name === "Phone";
		},

		/**
		 * Phone uses GenericTile line mode so the six apps stay in a short scroll.
		 * Desktop and tablet keep the standard tile size in a wrapping row.
		 */
		_syncTileLayout: function () {
			var oModel = this.getView().getModel("portfolio");
			if (!oModel) {
				return;
			}
			oModel.setProperty("/phone", this._isPhoneWidth());
		},

		/**
		 * Show the Work intro first so the page heading stays in view.
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
			var oApp = oEvent.getSource().getBindingContext("portfolio").getObject();
			if (this._openShowcaseApp(oApp)) {
				return;
			}
			Promise.resolve(this.getResourceBundle()).then(function (oBundle) {
				MessageToast.show(oBundle.getText("portfolioComingSoonMessage"));
			});
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
