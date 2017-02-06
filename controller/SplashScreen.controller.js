/**
 * @author K Satish Kumar 
 */
sap.ui.define([
	'com/charterglobal/PurchaseOrderApproval/controller/BaseController'

], function(BaseController) {
	"use strict";

	var SplashController = BaseController.extend("com.charterglobal.PurchaseOrderApproval.controller.SplashScreen", {

		onAfterRendering: function() {
			var oRouter = this.getRouter();
			var store = new sap.EncryptedStorage("localStore");
			var successCallback = function(value) {
				alert("Value is " + value);
				if (value === null) {
					oRouter.navTo('login');
				} else {
					sap.ui.getCore().setModel(value, "username");
					oRouter.navTo('dashboard');
				}
			};
			var errorCallback = function(error) {
				alert("An error occurred: " + JSON.stringify(error));
				oRouter.navTo('login');
			};
			store.getItem("localUserName", successCallback, errorCallback);
		},

		onInit: function(evt) {
			
		}
	});
	return SplashController;

});