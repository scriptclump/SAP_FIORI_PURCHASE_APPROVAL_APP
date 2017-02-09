/**
 * Base Controller for entire Application.
 * All the common functions are here for global access
 * @author Basant Sharma
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"com/charterglobal/PurchaseOrderApproval/devlogon"
], function(Controller, JSONModel, MessageToast, DevLogon) {
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
				console.log('direct acsess');
			    //oRouter.navTo('login');
			}
		},

		/**
		 * Getting confirmation for logout & perform logout action
		 * @author Basant Sharma
		 * @public
		 * @returns performLogout funtion call
		 */
		onLogout: function() {
			var self = this;

			var dialog = new sap.m.Dialog({
				title: 'Confirmation',
				type: 'Message',
				content: new sap.m.Text({
					text: 'Are you sure you want to logout?'
				}),
				beginButton: new sap.m.Button({
					text: 'Ok',
					press: function() {
						self.performLogout();
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
		
		/**
		 * Clear session data from browser and device
		 * @author Basant Sharma
		 * @public
		 * @returns redirect to login screen
		 */
		performLogout: function(){
			var oRouter = this.getRouter();
			var isDesktop = sap.ui.Device.system.desktop;
			if (!isDesktop) {
				var successCallback = function(value) {
					console.log("Success: " + JSON.stringify(value));
					oRouter.navTo('login');
				};
				var errorCallback = function(error) {
					console.log("An error occurred: " + JSON.stringify(error));
					oRouter.navTo('login');
				};
				this.unRegisterFromPush();
				var store = new sap.EncryptedStorage("localStore");
				store.removeItem("localUserName", successCallback, errorCallback);
			} else {
				sap.ui.getCore().setModel(null, "username");
				oRouter.navTo('login');
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
			var devicetoken = result.replace(/['"]+/g, '');
			sap.Push.updateWithDeviceToken(devicetoken, jQuery.proxy(this.devicetokenSent, this));
		},
		regFailure: function(errorInfo) {
			var dialog = new sap.m.BusyDialog({});
			dialog.close();
			MessageToast.show("Error while registering to Push Notifications, PLease try later.  " + JSON.stringify(errorInfo));
		},
		devicetokenSent: function() {
			this.subscriptionToECCForEvent();
		},
		subscriptionToECCForEvent: function() {
			var cntrl = this;
			var dialog = new sap.m.BusyDialog({});
			var appContext = sap.ui.getCore().getModel("appContext");
			var url = appContext.applicationEndpointURL + "/sap/opu/odata/SAP/ZFA_PO_PUSH_REGISTRATION_SRV";
			var appConcId = appContext.applicationConnectionId;
			var userName = sap.ui.getCore().getModel('username');
			var requestBody = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
				"<atom:entry xmlns:atom=\"http://www.w3.org/2005/Atom\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\">" +
				"<atom:content type=\"application/xml\">" +
				"<m:properties>" +
				"<d:Username>" + userName + "</d:Username>" +
				"<d:DeliveryAddress>" + appConcId + "</d:DeliveryAddress>" +
				"</m:properties>" +
				"</atom:content>" +
				"</atom:entry>";
			var subdata = $.ajax({
				type: "GET",
				url: url,
				headers: {
					'X-CSRF-Token': 'FETCH'
				},
				error: function() {
					dialog.close();
					MessageToast.show("Something went wrong, Please try after sometime.");
				},
				success: function() {
					var csrfToken = subdata.getResponseHeader('x-csrf-token');
					var url1 = url + '/POPUSHRegSet';
					$.ajax({
						type: "POST",
						url: url1,
						data: requestBody,
						headers: {
							'Content-Type': 'application/atom+xml',
							'accept': 'application/xml',
							'charset': 'UTF-8',
							'X-CSRF-Token': csrfToken,
							'X-SMP-APPCID': appConcId
						},
						dataType: 'xml',
						error: function() {
							dialog.close();
							MessageToast.show("Something went wrong, Please try after sometime.");
						},
						success: function() {
							var store = new sap.EncryptedStorage("localStore");
							store.setItem("localUserName", userName);
							dialog.close();
							var oRouter = cntrl.getRouter();
							oRouter.navTo('dashboard');
						}
					});
				}
			});
		},

		processNotification: function(notification) {
			//alert("Received a notifcation: " + JSON.stringify(notification));
			this.checkAnddisplayNotification(notification);
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
					var dstr = "\"data\"";
					var i2 = payLoad.indexOf(dstr);

					var orderID = payLoad.substring((payLoad.indexOf("\"Text\"") + 9), (payLoad.indexOf("\"foreground\"") - 4));
					var alertText = payLoad.substring((i1 + 2), (i2 - 22));
					var messageText = alertText + " with " + orderID;

					if (i1 > 0 && i2 > 0 && (i2 > i1)) {
						basectlr.displayNotification(messageText);
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
		 * @  UNRegisterFromPush
		 */
		unRegisterFromPush: function(callbackFunction) {
			var deviceos = sap.ui.Device.os.name;
			//alert("deviceos: " + deviceos);
			if (deviceos === "Android" || deviceos === "iOS") {
				sap.Push.unregisterForNotificationTypes(function() {
					//alert("Unregistration success ... ");
					DevLogon.doDeleteRegistration();
					//callbackFunction("Success");
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

				var dialog = new sap.m.Dialog({
					title: 'Notification Alert!',
					type: 'Message',
					content: new sap.m.Text({
						text: notificationText
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
			}
		},
		didClickOnBannar: function() {

			var cntrl = this;
			var userName = sap.ui.getCore().getModel('username');

			if (userName === undefined || userName === "") {
				var oRouter = this.getRouter();
				var isDesktop = sap.ui.Device.system.desktop;
				if (!isDesktop) {
					var store = new sap.EncryptedStorage("localStore");
					var successCallback = function(value) {
						if (value === null) {
							oRouter.navTo('login');
						} else {
							sap.ui.getCore().setModel(value, "username");
							cntrl.redirectToDetailScreen();
						}
					};
					var errorCallback = function(error) {
						console.log("An error occurred: " + JSON.stringify(error));
						oRouter.navTo('login');
					};
					store.getItem("localUserName", successCallback, errorCallback);
				}
			}

		},
		redirectToDetailScreen: function() {

			var userName = sap.ui.getCore().getModel('username');
			var urlPrefix = this.getServiceDestination();
			var serviceUrl =
				urlPrefix + "/sap/opu/odata/SAP/ZFA_PO_ORDERS_SRV/POHeaderSet/?$filter=(Username eq '" + userName +
				"')&$expand=POItemSet&$format=json";
			$.ajax({
				url: serviceUrl,
				type: "GET",
				async: true,
				dataType: "json"
			}).done(function(data) {

				var poItems = data.getProperty("/");
				for (var i = 0; i < poItems.length; i++) {
					var obj = poItems[i];

					console.log(poItems[i].PONumber);
				}

			}).fail(function(error) {
				MessageToast.show(error.responseJSON.error.message.value);
			});

		}

	});
});
