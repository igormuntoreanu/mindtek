sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"mindtek/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("mindtek.Component", {
		metadata: {
			manifest: "json"
		},

		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// initialize the router
			this.getRouter().initialize();

			// Keep old #/portfolio bookmarks working; replace the hash with #/work.
			this.getRouter().getRoute("portfolio").attachPatternMatched(function () {
				this.getRouter().navTo("work", {}, true);
			}, this);
		}
	});
});
