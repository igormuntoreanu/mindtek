sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("mindtek.controller.Home", {
		onInit: function () {},

		onAfterRendering: function () {
			// Auto-advance the "How We Work" wizard in a loop for showcase visuals
			// (4s per step). The wizard is forward-linear (nextStep only), so we only
			// ever call nextStep() while NOT on the last step (calling it there would
			// fire the "complete" event and navigate away); on the last step we
			// discard all progress back to the first step and continue. If the user
			// taps any step, the auto-play pauses for one minute, then resumes from
			// the step the user is on.
			var oWizard = this.getView().byId("approachWizard");
			if (!oWizard || this._oTimer) {
				return;
			}
			var aSteps = oWizard.getSteps();
			this._oWizard = oWizard;
			this._iPauseUntil = 0;
			this._oUserStep = null;

			// The wizard focuses the first focusable element on every step change
			// (goToStep -> _focusFirstStepElement), which scrolls the whole page to
			// the wizard during the auto-play. Disable that focus so the page stays
			// put while the wizard cycles.
			oWizard._focusFirstStepElement = function () {};

			// User manually navigated to a step -> pause the auto-play for 1 minute
			// and remember that step so we can resume from it.
			this._onNavigationChange = function (oEvent) {
				this._iPauseUntil = Date.now() + 60000;
				var oStep = oEvent.getParameter("step");
				if (oStep && aSteps.indexOf(oStep) >= 0) {
					this._oUserStep = oStep;
				}
				this._updateApproachButton();
			}.bind(this);
			oWizard.attachEvent("navigationChange", this._onNavigationChange);

			this._updateApproachButton();

			this._oTimer = setInterval(function () {
				if (this._iPauseUntil && Date.now() < this._iPauseUntil) {
					return;
				}
				this._iPauseUntil = 0;

				// Resume from the step the user tapped: reposition only (no advance),
				// so the user's step is shown for one full cycle before moving on.
				if (this._oUserStep) {
					var oResumeStep = this._oUserStep;
					this._oUserStep = null;
					if (aSteps.indexOf(oResumeStep) >= 0) {
						oWizard.discardProgress(oResumeStep);
						oWizard.goToStep(oResumeStep);
					}
					this._updateApproachButton();
					return;
				}

				// The wizard's actual current step (getCurrentStep returns its id).
				var sCurrentId = oWizard.getCurrentStep();
				var iCurrentIndex = -1;
				for (var i = 0; i < aSteps.length; i++) {
					if (aSteps[i].getId() === sCurrentId) {
						iCurrentIndex = i;
						break;
					}
				}

				if (iCurrentIndex >= 0 && iCurrentIndex < aSteps.length - 1) {
					oWizard.nextStep();
				} else {
					oWizard.discardProgress(aSteps[0]);
					oWizard.goToStep(aSteps[0]);
				}
				this._updateApproachButton();
			}.bind(this), 4000);
		},

		onExit: function () {
			if (this._oTimer) {
				clearInterval(this._oTimer);
				this._oTimer = null;
			}
			if (this._oWizard && this._onNavigationChange) {
				this._oWizard.detachEvent("navigationChange", this._onNavigationChange);
			}
		},

		/**
		 * Returns the 0-based index of the step that is currently shown.
		 * The wizard's internal progress navigator tracks the visible step (it also
		 * reflects backward taps), unlike getCurrentStep() which stays at the
		 * furthest-reached step.
		 */
		_getVisibleStepIndex: function () {
			var oWizard = this._oWizard || this.getView().byId("approachWizard");
			if (!oWizard || !oWizard._getProgressNavigator) {
				return 0;
			}
			return oWizard._getProgressNavigator().getCurrentStep() - 1;
		},

		/**
		 * Keeps the wizard's next/finish button (one per step, inside the step
		 * content) in sync with the shown step. The wizard's built-in per-step
		 * button disappears after a backward tap (it is only rendered on the
		 * last-activated step), so we use our own buttons instead.
		 */
		_updateApproachButton: function () {
			var oWizard = this._oWizard || this.getView().byId("approachWizard");
			if (!oWizard) {
				return;
			}
			var aSteps = oWizard.getSteps();
			var iIndex = this._getVisibleStepIndex();
			var oButton = this.getView().byId("approachNextButton" + (iIndex + 1));
			if (!oButton) {
				return;
			}
			var bLast = iIndex >= aSteps.length - 1;
			var oBundle = this.getResourceBundle();
			oButton.setText(bLast ? oBundle.getText("wizardFinish") : oBundle.getText("wizardStep", [iIndex + 2]));
		},

		/**
		 * Press handler for the persistent wizard button: advances one step, or
		 * starts the conversation when the last step is shown.
		 */
		onApproachNextButton: function () {
			var oWizard = this._oWizard || this.getView().byId("approachWizard");
			if (!oWizard) {
				return;
			}
			var aSteps = oWizard.getSteps();
			var iIndex = this._getVisibleStepIndex();
			if (iIndex >= 0 && iIndex < aSteps.length - 1) {
				// nextStep() advances from the FURTHEST-reached step, so if the user
				// navigated backwards we must first reset the progress to the visible
				// step — otherwise nextStep() would advance (or finish) from the
				// wrong position.
				var oStep = aSteps[iIndex];
				oWizard.discardProgress(oStep);
				oWizard.goToStep(oStep);
				oWizard.nextStep();
				this._updateApproachButton();
			} else {
				this.onWizardComplete();
			}
		},

		onScrollToServices: function () {
			var oSection = this.getView().byId("servicesSection");
			if (oSection && oSection.getDomRef()) {
				oSection.getDomRef().scrollIntoView({ behavior: "smooth", block: "start" });
			}
		},

		onWizardComplete: function () {
			this.getRouter().navTo("contact");
		}
	});
});
