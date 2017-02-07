/**
 * @author K Satish Kuamr.--->
 */
sap.ui.define([
	"com/charterglobal/PurchaseOrderApproval/controller/BaseController",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/json/JSONModel"

], function(BaseController, MessageToast, History, DateFormat, JSONModel) {
	"use strict";
	return BaseController.extend("com.charterglobal.PurchaseOrderApproval.controller.PurchaseOrderDetail", {
		onInit: function() {

			var router = this.getOwnerComponent().getRouter();
			var target = router.getTarget("PurchaseOrderDetail");
			target.attachDisplay(this.onDisplay, this);
		},
		/** Fires evey time view is displayed.
		 *
		 * @param oEvent
		 */
		onDisplay: function(oEvent) {
			var selectedDeatils = sap.ui.getCore().getModel('SelectedIndexDetails');
			this.getView().setModel(selectedDeatils);
		},
		onAcceptOrder: function() {

			var self = this;

			var dialog = new sap.m.Dialog({
				title: 'Confirmation',
				type: 'Message',
				content: new sap.m.Text({
					text: 'Are you sure you want to release the order?'
				}),
				beginButton: new sap.m.Button({
					text: 'Ok',
					press: function() {
						self.SubmitUserOptions("05");
						dialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		onRejectOrder: function() {
			var self = this;
			var dialog = new sap.m.Dialog({
				title: 'Confirmation',
				type: 'Message',
				content: [
					new sap.m.Text({
						text: 'Are you sure you want to reject the order?'
					}),
					new sap.m.TextArea('submitDialogTextarea', {
						liveChange: function(oEvent) {
							var sText = oEvent.getParameter('value');
							var parent = oEvent.getSource().getParent();

							parent.getBeginButton().setEnabled(sText.length > 0);
						},
						width: '100%',
						placeholder: 'Add note (required)'
					})
				],
				beginButton: new sap.m.Button({
					text: 'Ok',
					enabled: false,
					press: function() {
						// var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
						// MessageToast.show('Note is: ' + sText);
						self.SubmitUserOptions("08");
						dialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		SubmitUserOptions: function(kToken) {
			var managerName = sap.ui.getCore().getModel('username');
			var poNumber = this.byId("__poNumber").getText();
			this.onServiceCall(managerName, kToken, poNumber);
		},
		onServiceCall: function(userName, token, poNumber) {

			var self = this;
			var urlPrefix = this.getServiceDestination();
			var serviceUrl = urlPrefix + "/sap/opu/odata/SAP/ZFA_PO_RELEASE_SRV/ReleasePOSet?$filter=Username eq '" + userName +
				"'and PONumber eq '" + poNumber + "'and POStatus eq '" + token + "'";

			$.ajax({
				url: serviceUrl,
				type: "GET",
				async: true
			}).done(function(data) {
				self.printSuccessMessage(data, token, poNumber);
			}).fail(function(error) {
				self.printErrorMessage(error);
			});
		},
		/**
		 * Convenience method for formatting the date.
		 * @author Basant Sharma
		 * @public
		 * @param {timestamp} [value] the date timestamp
		 * @returns {value} the formatted value for the date
		 */
		formatDate: function(value) {
			if (value) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd-MM-yyyy"
				});
				return oDateFormat.format(this.cleanDate(value));
				// var d = new Date(sDate);
				// return sDate.toDateString() + ' ' + sDate.toTimeString();
			} else {
				return value;
			}
		},

		/**
		 * Convenience method for converting timestamp to date.
		 * @author Basant Sharma
		 * @public
		 * @param {string} [str] Unfiltered date
		 * @returns the formatted date like Date {Fri Dec 23 2016 05:30:00 GMT+0530 (India Standard Time)}
		 */
		cleanDate: function(str) {
			return new Date(+str.replace(/\/Date\((\d+)\)\//, '$1'));
		},
		onMoveBack: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("PurchaseOrderList", true);
			}

		},
		printErrorMessage: function(errorMsg) {
			var errorMessage = "Operation failed. Please try again !";
			var dialog = new sap.m.Dialog({
				title: 'Error',
				type: 'Message',
				state: 'Error',
				content: new sap.m.Text({
					text: errorMessage
				}),
				beginButton: new sap.m.Button({
					text: 'OK',
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		printSuccessMessage: function(successMsg, kToken, poNum) {
			var self = this;
			var promptMessage = "";
			if (kToken === "05") {
				promptMessage = "Purchase order " + poNum + " released successfully.";
			} else {
				promptMessage = "Purchase order " + poNum + " is rejected";
			}
			var dialog = new sap.m.Dialog({
				title: 'Success',
				type: 'Message',
				state: 'Success',
				content: new sap.m.Text({
					text: promptMessage
				}),
				beginButton: new sap.m.Button({
					text: 'OK',
					press: function() {
						dialog.close();
						self.onMoveBack();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		}

	});
});