define([
	"dijit/Dialog",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/Deferred",
	"dojo/dom-construct",
	"dojo/query",
	"esri/Color",
	"esri/geometry/Point",
	"esri/graphic",
	"esri/layers/FeatureLayer",
	"esri/symbols/SimpleMarkerSymbol",
	"esri/tasks/query",
	"esri/tasks/QueryTask"
], function (Dialog, array, declare, lang, Deferred, domConstruct, query, Color, Point, Graphic, FeatureLayer, SimpleMarkerSymbol, Query, QueryTask) {

	return declare(null, {

		instance : null,
		defaults : null,

		NOMINATE_BTN_ID : null,
		nominateBtnID : null,

		nominatedItems : null,
		selectedRowID : null,
		nominateAdminFeatureLayer : null,
		nominateBtnNode : null,

		constructor: function (defaults) {
			this.defaults = defaults;

			this.NOMINATE_BTN_ID = "nominate-btn-";
			this.nominateBtnID = "";
			this.nominatedItems = [];
			this.selectedRowID = 0;
			// FS used to hold status of items
			this.nominateAdminFeatureLayer = new FeatureLayer(this.defaults.NOMINATE_ADMIN_FEATURE_SERVICE_URL);
			this.nominateBtnNode = {};
		},

		loadNominatedItemsInMemory : function () {
			var deferred = new Deferred();
			var query = new Query();
			query.returnGeometry = false;
			query.outFields = ["*"];
			// TODO more than 2000?
			query.where = "1=1";
			var queryTask = new QueryTask(this.defaults.NOMINATE_ADMIN_FEATURE_SERVICE_URL);
			queryTask.execute(query).then(function (results) {
				deferred.resolve(results);
			});
			return deferred.promise;
		}
	});
});