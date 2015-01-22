/*
 | Copyright 2014 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
/*global define,document,location,require */
/*jslint sloppy:true,nomen:true,plusplus:true */
/*
 | Copyright 2014 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
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
	"esri/tasks/GeometryService",
	"config/defaults",
	"dojo/string"
], function (Evented, declare, kernel, array, lang, domClass, Deferred, all, arcgisUtils, urlUtils, esriRequest, esriConfig, esriLang, IdentityManager, esriPortal, ArcGISOAuthInfo, GeometryService, defaults, string) {
	return declare([Evented], {

		config:{},
		orgConfig:{},
		appConfig:{},
		urlConfig:{},
		customUrlConfig:{},
		commonConfig:{},

		constructor:function (templateConfig) {
			// template settings
			var defaultTemplateConfig = {
				queryForWebmap:true
			};
			this.templateConfig = lang.mixin(defaultTemplateConfig, templateConfig);
			// config will contain application and user defined info for the application such as i18n strings the web map id and application id, any url parameters and any application specific configuration information.
			this.config = defaults;
			// Gets parameters from the URL, convert them to an object and remove HTML tags.
			this.urlObject = this._createUrlParamsObject();
		},

		startup:function () {
			var deferred = this._init();
			deferred.then(lang.hitch(this, function (config) {
				// optional ready event to listen to
				this.emit("ready", config);
			}), lang.hitch(this, function (error) {
				// optional error event to listen to
				this.emit("error", error);
			}));
			return deferred;
		}
	});
});
