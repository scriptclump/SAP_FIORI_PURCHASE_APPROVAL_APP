/**
 * All the login related functionality
 * @author Basant Sharma
 */
sap.ui.define([
	"com/charterglobal/PurchaseOrderApproval/controller/BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function(BaseController, MessageToast, JSONModel) {
	"use strict";
	return BaseController.extend("com.charterglobal.PurchaseOrderApproval.controller.Login", {

		onInit: function() {

		},
		/**
		 * Checks SAP user login credentials
		 * @public
		 * @author Basant Sharma
		 */
		onLogin: function() {
			var oRouter = this.getRouter();
			var str = this.byId("__username").getValue();
			var username = str.trim(str.toUpperCase());
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
				}).done(function(data) {
					sap.ui.getCore().setModel(username, "username");
					var store = new sap.EncryptedStorage("localStore");
					store.setItem("localUserName", username);
					oRouter.navTo('dashboard');
				}).fail(function(data) {
					MessageToast.show(data.responseJSON.error.message.value);
					//	oRouter.navTo('dashboard');
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