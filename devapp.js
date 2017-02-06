jQuery.sap.declare("com.charterglobal.PurchaseOrderApproval.devapp");
jQuery.sap.require("com.charterglobal.PurchaseOrderApproval.devlogon");

com.charterglobal.PurchaseOrderApproval.devapp = {
	smpInfo: {},
	//the variable hold com.charterglobal.PurchaseOrderApproval.devlogon instance
	devLogon: null,

	//Application Constructor
	initialize: function() {
		this.bindEvents();
	},

	//========================================================================
	// Bind Event Listeners
	//========================================================================
	bindEvents: function() {
		//add an event listener for the Cordova deviceReady event.
		document.addEventListener("deviceready", jQuery.proxy(this.onDeviceReady, this), false);
	},

	//========================================================================
	//Cordova Device Ready
	//========================================================================
	onDeviceReady: function() {
		if (window.sap_webide_FacadePreview) {
			startApp();
		} else {
			var that = this;
			$.getJSON(".project.json", function(data) {
				if (data && data.hybrid && data.hybrid.plugins.kapsel.logon.selected) {
					that.smpInfo.server = data.hybrid.msType === 0 ? data.hybrid.hcpmsServer : data.hybrid.server;
					that.smpInfo.port = data.hybrid.msType === 0 ? "443" : data.hybrid.port;
					that.smpInfo.appID = data.hybrid.appid;
				}
				if (that.smpInfo.server && that.smpInfo.server.length > 0) {
					var context = {
						"serverHost": that.smpInfo.server,
						"https": data.hybrid.msType === 0 ? "true" : "false",
						"serverPort": that.smpInfo.port,
						"auth": [{
							"type": "saml2.web.post",
							"config": {
								"saml2.web.post.authchallengeheader.name": "com.sap.cloud.security.login",
								"saml2.web.post.finish.endpoint.uri": "/SAMLAuthLauncher",
								"saml2.web.post.finish.endpoint.redirectparam": "finishEndpointParam"
							}
						}]
					};
					that.devLogon = new com.charterglobal.PurchaseOrderApproval.devlogon();
					that.devLogon.doLogonInit(context, that.smpInfo.appID);
				} else {
					startApp();
				}
			});
		}
	}
};