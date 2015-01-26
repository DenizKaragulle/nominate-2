define([
	"dojo/Evented",
	"dojo/_base/declare",
	"dojo/_base/kernel",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/dom-class",
	"dojo/Deferred",
	"dojo/promise/all",
	"esri/arcgis/utils",
	"esri/urlUtils",
	"esri/request",
	"esri/config",
	"esri/lang",
	"esri/IdentityManager",
	"esri/arcgis/Portal",
	"esri/arcgis/OAuthInfo",
	"config/defaults",
	"dojo/string"
], function (Evented, declare, kernel, array, lang, domClass, Deferred, all, arcgisUtils, urlUtils, esriRequest, esriConfig, esriLang, IdentityManager, esriPortal, ArcGISOAuthInfo, defaults, string) {
	return declare([Evented], {

		config: {},
		orgConfig: {},
		appConfig: {},
		urlConfig: {},
		customUrlConfig: {},
		commonConfig: {},
		portal: {},
		item: {},

		constructor: function (templateConfig) {
			// template settings
			var defaultTemplateConfig = {
				webmapID: "b95a9fb4dec5443f9e0ea0fcb4859c67"
			};
			this.templateConfig = lang.mixin(defaultTemplateConfig, templateConfig);
			// config will contain application and user defined info for the application such as i18n strings the web map id and application id, any url parameters and any application specific configuration information.
			this.config = defaults;
		},

		startup: function () {
			var deferred = this._init();
			deferred.then(lang.hitch(this, function (config) {
				// optional ready event to listen to
				this.emit("ready", config);
			}), lang.hitch(this, function (error) {
				// optional error event to listen to
				this.emit("error", error);
			}));
			return deferred;
		},

		_init: function () {
			var deferred = new Deferred();
			all({
				portal: this._createWebMap(this.templateConfig.webmapID)
			}).then(lang.hitch(this, function (response) {
						deferred.resolve(response);
						// mix in commonconfig and appconfig before fetching groupInfo and groupItems so that GroupID Configured from Application configuration panel is honoured.
						//lang.mixin(this.config, this.commonConfig, this.appConfig);
					}), deferred.reject);
			return deferred.promise;
		},

		// create a map based on the input web map id
		_createWebMap: function (itemInfo) {
			var deferred = new Deferred();
			arcgisUtils.createMap(itemInfo, "map", {
				mapOptions: {
					// Optionally define additional map config here for example you can
					// turn the slider off, display info windows, disable wraparound 180, slider position and more.
				}
			}).then(lang.hitch(this, function (response) {
						deferred.resolve(response);
						// Once the map is created we get access to the response which provides important info
						// such as the map, operational layers, popup info and more. This object will also contain
						// any custom options you defined for the template. In this example that is the 'theme' property.
						// Here' we'll use it to update the application to match the specified color theme.
						// console.log(this.config);
						//		this.map = response.map;
						// remove loading class from body
						//domClass.remove(document.body, "app-loading");
						// Start writing my code
						//this.item = response;
						// map has been created. You can start using it.
						// If you need map to be loaded, listen for it's load event.
					}), this.reportError);
			return deferred.promise;
		},

		_queryDisplayItem: function () {
			var deferred = new Deferred();
			arcgisUtils.getItem(this.templateConfig.webmapID).then(lang.hitch(this, function (itemInfo) {
				// ArcGIS.com allows you to set an application extent on the application item. Overwrite the
				// existing web map extent with the application item extent when set.
				deferred.resolve(itemInfo);
			}), function (error) {
				if (!error) {
					error = new Error("Error retrieving display item.");
				}
				deferred.reject(error);
			});
			return deferred.promise;
		},

		reportError: function (error) {
			// remove loading class from body
			//domClass.remove(document.body, "app-loading");
			//domClass.add(document.body, "app-error");
			// an error occurred - notify the user. In this example we pull the string from the
			// resource.js file located in the nls folder because we've set the application up
			// for localization. If you don't need to support multiple languages you can hardcode the
			// strings here and comment out the call in index.html to get the localization strings.
			// set message
			/*var node = dom.byId("loading_message");
			 if (node) {
			 if (this.config && this.config.i18n) {
			 node.innerHTML = this.config.i18n.map.error + ": " + error.message;
			 } else {
			 node.innerHTML = "Unable to create map: " + error.message;
			 }
			 }*/
		},

		// Sample function
		_getItem: function (response) {
			return response;
		}
	});
});
