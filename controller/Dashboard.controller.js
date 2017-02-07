/**
 * All the dashboard related functionality
 * @author Basant Sharma
 */
sap.ui.define([
	"com/charterglobal/PurchaseOrderApproval/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat"
], function(BaseController, JSONModel, MessageToast, DateFormat) {
	"use strict";

	return BaseController.extend("com.charterglobal.PurchaseOrderApproval.controller.Dashboard", {
		/**
		 * Initialise web service data into pie chart and view.
		 * @author Basant Sharma
		 * @public
		 */
		onInit: function() {
			var router = this.getOwnerComponent().getRouter();
			var target = router.getTarget("dashboard");
			target.attachDisplay(this.onDisplay, this);
				var table = new sap.m.Table();
			table.addStyleClass("myCustomTable");
		},
		/** Fires evey time view is displayed.
		 *
		 * @param oEvent
		 */
		onDisplay: function(oEvent) {
			
			var table = new sap.m.Table();
			table.addStyleClass("myCustomTable");
			
			var dialog = new sap.m.BusyDialog({

			});
			dialog.open();
			var cntrl = this;
			var userName = sap.ui.getCore().getModel('username');
			var urlPrefix = this.getServiceDestination();
			var serviceUrl = urlPrefix + "/sap/opu/odata/sap/zfa_po_dash_board_srv/PODashboardSet?$filter=(Username eq '"+userName+"')";
			$.ajax({
				url: serviceUrl,
				type: "GET",
				async: true,
				dataType: "json"
			}).done(function(data) {
				dialog.close();
				// var oVizFrame = cntrl.oVizFrame = cntrl.getView().byId("oVizFrame");
				// //cntrl.getView().byId("totalPendingOrders").setValue("140");
				// oVizFrame.setVizProperties({
				// 	legend: {
				// 		title: {
				// 			visible: false
				// 		}
				// 	},
				// 	title: {
				// 		visible: false
				// 	}
				// });

				var dataModel = new JSONModel(data);
				//oVizFrame.setModel(dataModel);
				var totalPendingOrders = 0;
				for (var i = 0; i < dataModel.oData.d.results.length; i++) {
					totalPendingOrders += dataModel.oData.d.results[i].NoOfDocs;
				}
				cntrl.byId("totalPendingOrders").setValue(totalPendingOrders);
				cntrl.getView().setModel(dataModel);
				var UpdatedAt = cntrl.formatTime(dataModel.oData.d.results[0].UpdatedAt);
				var UpdatedOn = cntrl.formatDate(dataModel.oData.d.results[0].UpdatedOn);
				var lastRefreshAt =  UpdatedOn + ' ' + UpdatedAt;
				sap.ui.getCore().setModel( lastRefreshAt, "lastRefreshAt");
			}).fail(function(data) {
				MessageToast.show(data.responseJSON.error.message.value);
			});
		},
		
		/**
		 * Navigate to next screen.
		 * @author Basant Sharma
		 * @public
		 */
		tilePress: function() {
			var oRouter = this.getRouter();
			oRouter.navTo('PurchaseOrderList');
		},
		
		/**
		 * Convenience method for formatting the date.
		 * @author Basant Sharma
		 * @public
		 * @param {timestamp} [value] the date timestamp
		 * @returns {value} the formatted value for the date
		 */
		formatDate : function (value) {
			if (value) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "dd-MM-yyyy"}); 
				return oDateFormat.format(this.cleanDate(value));
				// var d = new Date(sDate);
				// return sDate.toDateString() + ' ' + sDate.toTimeString();
			} else {
				return value;
			}
		},
		
		formatTime : function (value) {
			if (value) {
				var formattedTime = value.substr(2, 2) + ':' + value.substr(5, 2) + ':' + value.substr(8, 2);
				return formattedTime;
				//return oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "hh:mm:ss"}); 
				//return oDateFormat.format(this.cleanDate(value));
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
		cleanDate: function (str) {
		  return new Date(+str.replace(/\/Date\((\d+)\)\//, '$1'));
		}

	});

});