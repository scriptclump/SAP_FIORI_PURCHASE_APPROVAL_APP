/**
 * Base Controller for entire Application.
 * All the common functions are here for global access
 * @author Basant Sharma
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function(Controller, MessageToast) {
	"use strict";

	return Controller.extend("com.charterglobal.PurchaseOrderApproval.controller.BaseController", {

		/**
		 * Convenience method for accessing the router.
		 * @author Basant Sharma
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @author Basant Sharma
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @author Basant Sharma
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @author Basant Sharma
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Convenience method for accessing the router.
		 * @author Basant Sharma
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		checkLogin: function() {
			var oRouter = this.getRouter();
			var loggedInUserName = sap.ui.getCore().getModel("username");

			if (loggedInUserName === "" || loggedInUserName === undefined) {
				//oRouter.navTo('login');
			} else {
				oRouter.navTo('Dashboard');
			}
		},

		/**
		 * Service destination as per appContext.
		 * @author Basant Sharma
		 * @public
		 * @returns urlPrefix URL to prefix the services as per appContext
		 */
		getServiceDestination: function() {
			var appContext = sap.ui.getCore().getModel("appContext");
			var urlPrefix = "";
			if (appContext !== undefined) {
				urlPrefix = appContext.applicationEndpointURL;
			} else {
				urlPrefix = "/destinations/sap_erp";
			}
			return urlPrefix;
		},
		/**
		 * 
		 * @
		 * @  PUSH NOTIFICATION METHODS
		 * @
		 */
		registerForPush: function() {

			var gcmSenderId = ""; //sap.ui.getCore().getModel("configModel").getProperty("/senderId");

			var deviceos = sap.ui.Device.os.name;
			var nTypes;

			if (deviceos === "Android") {
				nTypes = sap.Push.notificationType.SOUNDS | sap.Push.notificationType.ALERT | sap.Push.notificationType.BADGE;
				// sap.Push.registerForNotificationTypes(nTypes, function() {
				// 	alert("registration success ... ");
				// 	callbackFunction("Success");
				// }, function() {
				// 	alert("registration failed ... ");
				// 	callbackFunction("Failed");
				// }, function(payLoad) {
				// 	alert("received notification ... "+JSON.stringify(payLoad));
				// 	callbackFunction("Notification", payLoad);
				// }, gcmSenderId); //GCM Sender ID, null for APNS
			} else if (deviceos === "iOS") {
				nTypes = sap.Push.notificationType.SOUNDS | sap.Push.notificationType.ALERT | sap.Push.notificationType.BADGE;
				sap.Push.registerForNotificationTypes(nTypes, jQuery.proxy(this.regSuccess, this), jQuery.proxy(this.regFailure, this), jQuery.proxy(
					this.processNotification, this), null);
				//
			} else {
				//desktop
			}

		},
		regSuccess: function(result) {

			console.log("Successfully registered: " + JSON.stringify(result));
			var devicetoken = result.replace(/['"]+/g, '');
			//alert(devicetoken);
			sap.Push.updateWithDeviceToken(devicetoken, jQuery.proxy(this.devicetokenSent, this));
		},
		devicetokenSent: function(result) {
			alert("device token sent to hcpms" + JSON.stringify(result));
		},
		regFailure: function(errorInfo) {
			alert("Error while registering.  " + JSON.stringify(errorInfo));
			console.log("Error while registering.  " + JSON.stringify(errorInfo));
		},
		processNotification: function(notification) {
			// alert("in processNotification: " + JSON.stringify(notification));
			var notificationData = JSON.stringify(notification);
			var text1 = notificationData.notification.alert;
			var text2 = notificationData.notification.alert.data;
			var messageText = text1 + text2;
			var dialog = new sap.m.Dialog({
				title: 'Notification Alert!',
				type: 'Message',
				content: new sap.m.Text({
					text: messageText
				}),
				beginButton: new sap.m.Button({
					text: 'Ok',
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
			//this.checkAnddisplayNotification(notification);
			
		},
		checkAnddisplayNotification: function(payLoad) {
			var basectlr = this;
			var deviceos = sap.ui.Device.os.name;
			if (deviceos === "Android") {
				if (payLoad !== undefined && payLoad.payload !== undefined && payLoad.payload.alert !== undefined) {
					var notificationText = payLoad.payload.alert;
					basectlr.displayNotification(notificationText);
				}
			} else if (deviceos === "iOS") {
				if (payLoad !== undefined && payLoad !== "") {
					var astr = "\"alert\"";

					var i1 = payLoad.indexOf(astr) + astr.length;
					alert("i1:" + i1);
					var dstr = "\"data\"";
					var i2 = payLoad.indexOf(dstr);
					alert("i2:" + i2);
					var alertText = payLoad.substring((i1 + 2), (i2 - 3));
					alert(alertText);
					if (i1 > 0 && i2 > 0 && (i2 > i1)) {
						basectlr.displayNotification(alertText);
					}
				}
			} else {
				alert("Notification received for unsupported device");
			}

		},
		/**
		 * 
		 * @
		 * @  PUSH NOTIFICATION METHOD
		 * @  unRegisterFromPush
		 */
		unRegisterFromPush: function(callbackFunction) {
			var deviceos = sap.ui.Device.os.name;
			//alert("deviceos: " + deviceos);
			if (deviceos === "Android" || deviceos === "iOS") {
				sap.Push.unregisterForNotificationTypes(function() {
					//alert("Unregistration success ... ");
					callbackFunction("Success");
				}); //GCM Sender ID, null for APNS
			} else {
				var appContext = sap.ui.getCore().getModel("appContext");
				if (appContext === undefined) {
					callbackFunction("Desktop");
				} else {
					callbackFunction("Unsupported");
				}
			}

		},
		displayNotification: function(notificationText) {
			
			if (notificationText !== undefined && notificationText !== "") {
				var notificationDialog = sap.ui.getCore().byId('notificationDialog');
				if (notificationDialog === undefined) {
					var basectlr = this;
					var dialog = sap.ui.xmlfragment("com.charterglobal.PurchaseOrderApproval.view.PushNotificationDialog", basectlr);
					var notificationTextModel = sap.ui.getCore().getModel("notificationText");
					notificationTextModel.setProperty("/notificationText", notificationText);
					//set null to refreshText field
					notificationTextModel.setProperty("/refreshText", "");
					dialog.setModel(notificationTextModel);
					dialog.open();
				} else {
					var dialogText = sap.ui.getCore().byId('notificationDialogText');
					dialogText.setText(dialogText.getText() + "\n\n" + notificationText);
				}
			}
		}
	});
});