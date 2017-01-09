/**
 * @author K Satish Kuamr.--->
 */
sap.ui.define([
	"PurchaseOrdersApproval/controller/BaseController",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/json/JSONModel"
], function(BaseController, MessageToast, History, DateFormat, JSONModel) {
	"use strict";
	return BaseController.extend("PurchaseOrdersApproval.controller.PurchaseOrderDetail", {
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
			MessageToast.show('Accepted');
			// var mangerName = "MANAGER1";
			// var poNumber = "4500022511";
			// 			var serviceUrl =
			// 	"/destinations/sap/opu/odata/SAP/ZFA_PO_RELEASE_SRV/ReleasePOSet?$filter=Username eq"+mangerName+" and PONumber eq"+poNumber+"and POStatus eq '05'";
			// this.onServiceCall(serviceUrl);

		},
		onRejectOrder: function() {
			MessageToast.show('Rejected');
			// var mangerName = "MANAGER1";
			// var poNumber = "4500022511";
			// var serviceUrl =
			// 	"/destinations/sap/opu/odata/SAP/ZFA_PO_RELEASE_SRV/ReleasePOSet?$filter=Username eq"+mangerName+"and PONumber eq"+poNumber+"and POStatus eq '08'";
			// this.onServiceCall(serviceUrl);

		},
		onServiceCall: function(serviceUrl) {
			$.ajax({
				url: serviceUrl,
				type: "GET",
				async: true,
				dataType: "json"
			}).done(function(data) {
				MessageToast.show("success");
			}).fail(function(error) {
				MessageToast.show(error.responseJSON.error.message.value);
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

		}

	});
});