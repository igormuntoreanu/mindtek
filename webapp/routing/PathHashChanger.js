sap.ui.define([
	"sap/ui/core/routing/HashChanger",
	"sap/ui/core/routing/HashChangerBase"
], function (HashChanger, HashChangerBase) {
	"use strict";

	/**
	 * Keeps the UI5 route in the URL path (/work) rather than the hash (#/work).
	 * Old #/route links still open the right page and are rewritten to the path.
	 */
	function hashFromLocation() {
		var sLegacy = window.location.hash.replace(/^#\/?/, "");
		if (sLegacy) {
			return sLegacy;
		}
		return window.location.pathname
			.replace(/(^|\/)index\.html$/, "")
			.replace(/^\/+|\/+$/g, "");
	}

	function pathFor(sHash) {
		return "/" + (sHash || "");
	}

	return HashChanger.extend("mindtek.routing.PathHashChanger", {
		constructor: function () {
			HashChanger.apply(this, arguments);
			this._onPopState = this._onPopState.bind(this);
		},

		init: function () {
			if (this._initialized) {
				return false;
			}
			this._initialized = true;
			this._sHash = hashFromLocation();
			var sPath = pathFor(this._sHash);
			if (window.location.pathname !== sPath || window.location.hash) {
				window.history.replaceState(window.history.state, "", sPath + window.location.search);
			}
			window.addEventListener("popstate", this._onPopState);
			this.fireHashChanged(this._sHash);
			return true;
		},

		getHash: function () {
			return this._sHash === undefined ? hashFromLocation() : this._sHash;
		},

		setHash: function (sHash) {
			var sOld = this.getHash();
			HashChangerBase.prototype.setHash.apply(this, arguments);
			if (sHash === sOld) {
				return;
			}
			this._sHash = sHash;
			window.history.pushState({ route: sHash }, "", pathFor(sHash));
			this.fireHashChanged(sHash, sOld);
		},

		replaceHash: function (sHash) {
			var sOld = this.getHash();
			HashChangerBase.prototype.replaceHash.apply(this, arguments);
			if (sHash === sOld) {
				return;
			}
			this._sHash = sHash;
			window.history.replaceState({ route: sHash }, "", pathFor(sHash));
			this.fireHashChanged(sHash, sOld);
		},

		_onPopState: function () {
			var sNew = hashFromLocation();
			var sOld = this._sHash;
			if (sNew === sOld) {
				return;
			}
			this._sHash = sNew;
			this.fireHashChanged(sNew, sOld);
		},

		destroy: function () {
			window.removeEventListener("popstate", this._onPopState);
			HashChanger.prototype.destroy.apply(this, arguments);
		}
	});
});
