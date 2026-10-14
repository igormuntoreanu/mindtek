sap.ui.define([
	"sap/ui/core/routing/HashChanger",
	"mindtek/routing/PathHashChanger"
], function (HashChanger, PathHashChanger) {
	"use strict";

	// The router reads the hash changer when the component starts, so swap it in before ComponentSupport runs.
	HashChanger.replaceHashChanger(new PathHashChanger());
	sap.ui.require(["sap/ui/core/ComponentSupport"]);
});
