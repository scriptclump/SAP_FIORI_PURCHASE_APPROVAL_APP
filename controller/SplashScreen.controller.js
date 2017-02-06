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
			var isDesktop = sap.ui.Device.system.desktop;
			if (!isDesktop) {
				var store = new sap.EncryptedStorage("localStore");
				var successCallback = function(value) {
					if (value === null) {
						oRouter.navTo('login');
					} else {
						sap.ui.getCore().setModel(value, "username");
						oRouter.navTo('dashboard');
					}
				};
				var errorCallback = function(error) {
					console.log("An error occurred: " + JSON.stringify(error));
					oRouter.navTo('login');
				};
				store.getItem("localUserName", successCallback, errorCallback);
			} else {
					oRouter.navTo('login');
			}

		},

		onInit: function(evt) {

		}
	});
	return SplashController;

});