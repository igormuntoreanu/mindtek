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

			Promise.resolve(this.getResourceBundle()).then(function (oBundle) {
				this._setPortfolioModel(oBundle);
			}.bind(this));
		},

		_setPortfolioModel: function (oBundle) {
			var aDefs = [
				{
					key: "jem",
					titleKey: "portfolioJemTitle",
					benefitKey: "portfolioJemBenefit",
					floorplanKey: "portfolioJemFloorplan",
					url: this._showcaseUrl(
						"http://localhost:8081/index.html",
						"https://mindtek-ltd.com/journalentry-monitor/"
					)
				},
				{
					key: "alp",
					titleKey: "portfolioJemAlpTitle",
					benefitKey: "portfolioJemAlpBenefit",
					floorplanKey: "portfolioJemAlpFloorplan",
					url: this._showcaseUrl(
						"http://localhost:8082/index.html",
						"https://mindtek-ltd.com/journalentry-monitor-alp/"
					)
				},
				{
					key: "ovp",
					titleKey: "portfolioOvpTitle",
					benefitKey: "portfolioOvpBenefit",
					floorplanKey: "portfolioOvpFloorplan",
					url: this._showcaseUrl(
						"http://localhost:8083/index.html",
						"https://mindtek-ltd.com/sales-overview/"
					)
				},
				{
					key: "worklist",
					titleKey: "portfolioWorklistTitle",
					benefitKey: "portfolioWorklistBenefit",
					floorplanKey: "portfolioWorklistFloorplan",
					url: this._showcaseUrl(
						"http://localhost:8084/index.html",
						"https://mindtek-ltd.com/purchaseorder-worklist/"
					)
				},
				{
					key: "freestyle",
					titleKey: "portfolioFreestyleTitle",
					benefitKey: "portfolioFreestyleBenefit",
					floorplanKey: "portfolioFreestyleFloorplan",
					url: this._showcaseUrl(
						"http://localhost:8086/index.html",
						"https://mindtek-ltd.com/warehouse-cockpit/"
					)
				},
				{
					key: "feop",
					titleKey: "portfolioFeopTitle",
					benefitKey: "portfolioFeopBenefit",
					floorplanKey: "portfolioFeopFloorplan",
					url: this._showcaseUrl(
						"http://localhost:8085/index.html",
						"https://mindtek-ltd.com/supplier-registration/"
					)
				}
			];

			this.getView().setModel(new JSONModel({
				apps: aDefs.map(function (oDef) {
					return {
						key: oDef.key,
						title: oBundle.getText(oDef.titleKey),
						benefit: oBundle.getText(oDef.benefitKey),
						floorplan: oBundle.getText(oDef.floorplanKey),
						url: oDef.url
					};
				})
			}), "portfolio");
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
		}
	});
});
