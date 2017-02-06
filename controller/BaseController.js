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
		
			if(loggedInUserName === "" || loggedInUserName === undefined ){
				//oRouter.navTo('login');
			} else{
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
		}
	});
});