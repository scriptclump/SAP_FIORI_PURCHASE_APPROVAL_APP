/**
 * @author K Satish Kumar 
 */
sap.ui.define([
	'jquery.sap.global',
	'PurchaseOrdersApproval/controller/BaseController',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/Sorter',
	"sap/m/MessageToast",
	"sap/ui/core/routing/History",
	"sap/ui/core/format/DateFormat",
	'sap/ui/model/json/JSONModel'
], function(jQuery, BaseController, Filter, FilterOperator, Sorter, MessageToast, History, DateFormat, JSONModel) {
	"use strict";

	var ListController = BaseController.extend("PurchaseOrdersApproval.controller.PurchaseOrderList", {

		onInit: function(evt) {

			var cntrl = this;
			var userName = sap.ui.getCore().getModel('username');
			var serviceUrl =
				"/destinations/sap_erp/sap/opu/odata/SAP/ZFA_PO_ORDERS_SRV/POHeaderSet/?$filter=(Username eq '"+userName+"')&$expand=POItemSet&$format=json";
			$.ajax({
				url: serviceUrl,
				type: "GET",
				async: true,
				dataType: "json"
			}).done(function(data) {
				var dataModel = new JSONModel(data);
				cntrl.getView().setModel(dataModel);
			}).fail(function(error) {
				MessageToast.show(error.responseJSON.error.message.value);
			});
		},
		onSearch: function(oEvt) {

			// add filter for search
			var textFilterArr = [];
			var combinedFilter;
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				textFilterArr.push(new Filter("VendorName", FilterOperator.Contains, sQuery));
				textFilterArr.push(new Filter("PONumber", FilterOperator.Contains, sQuery));
				textFilterArr.push(new Filter("DocumentDate", FilterOperator.Contains, sQuery));

				if (textFilterArr.length > 0) {
					combinedFilter = new Filter(textFilterArr);
				}
			}
			// update list binding
			this.byId("idList").getBinding("items").filter(combinedFilter);

		},
		onRefreshOrdersData: function() {

		},
		onSortPressed: function(oEvent) {

			var sortOrder = sap.ui.getCore().getModel("sortOrderDescending");
			var sortBy = [];
			sortBy.push(new Sorter('DocumentDate', sortOrder));
			this.byId("idList").getBinding("items").sort(sortBy);
			sap.ui.getCore().setModel(!sortOrder, "sortOrderDescending");
		},
		onListItemPress: function(indexItem) {

			var cntrl = this;
			var oItem, oCtx;
			oItem = indexItem.getSource();
			oCtx = oItem.getBindingContext();
			var orderDetails = oCtx.getProperty(oCtx.getPath());
			var modelData = new JSONModel(orderDetails);
			var orderDetailModel = sap.ui.getCore();
			orderDetailModel.setModel(modelData, 'SelectedIndexDetails');
			cntrl.onMoveToNext();

		},
		onMoveToNext: function() {
			var oRouter = this.getRouter();
			oRouter.navTo("PurchaseOrderDetail");
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
				oRouter.navTo("Dashboard", true);
			}

		}
	});
	return ListController;

});