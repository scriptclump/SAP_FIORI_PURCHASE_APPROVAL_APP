/**
 * All the login related functionality
 * @author Basant Sharma
 */
sap.ui.define([
	"com/charterglobal/PurchaseOrderApproval/controller/BaseController",
	"sap/m/MessageToast"
], function(BaseController, MessageToast) {
	"use strict";
	return BaseController.extend("com.charterglobal.PurchaseOrderApproval.controller.Login", {

		onInit: function() {},
		/**
		 * Checks SAP user login credentials
		 * @public
		 * @author Basant Sharma
		 */
		onLogin: function() {
			var dialog = new sap.m.BusyDialog({

			});
			dialog.open();
			var oRouter = this.getRouter();
			var cntrl = this;
			var str = this.byId("__username").getValue();
			str = str.toUpperCase();
			var username = str.trim();
			var password = this.byId("__password").getValue();
			if (this._formValidation(username, password)) {
				var urlPrefix = this.getServiceDestination();
				var serviceUrl = urlPrefix + "/sap/opu/odata/SAP/ZFA_PO_USER_LOGIN_SRV/UserLoginSet?$filter=(Username eq '" + username +
					"' and Password eq '" + password + "')";
				$.ajax({
					url: serviceUrl,
					type: "GET",
					async: true,
					dataType: "json"
				}).done(function() {
					sap.ui.getCore().setModel(username, "username");
					if (!sap.ui.Device.system.desktop) {
						//Subscribing for Push
						cntrl.registerForPush();
					} else {
						dialog.close();
						// Push reg is not applicable for browser, So navigating directly to dashboard page
						oRouter.navTo('dashboard');
					}
				}).fail(function(data) {
					MessageToast.show(data.responseJSON.error.message.value);
				});
			}
		},

		/**
		 * Form validation in login screen
		 * @private
		 * @author Basant Sharma
		 * @return boolean
		 */
		_formValidation: function(sUsername, sPassword) {
			if (sUsername.trim() === '') {
				MessageToast.show('Please enter the username');
				this.byId("__username").setValue();
				return false;
			}
			if (sPassword.trim() === '') {
				MessageToast.show('Please enter the password');
				this.byId("__password").setValue();
				return false;
			}
			return true;
		}
	});
});