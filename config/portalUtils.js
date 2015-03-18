define([
	"esri/tasks/query",
	"esri/tasks/QueryTask",
	"dojo/_base/array",
	"dojo/_base/declare",
<<<<<<< HEAD
	"dojo/_base/lang",
	"dojo/Deferred",
	"config/defaults"
], function (Query, QueryTask, array, declare, lang, Deferred, defaults) {

	return declare(null, {

		portal:null,
		portalUser:null,
		portalQueryParams:null,
		fullName:null,
		IS_CURATOR:null,
=======
	"dojo/Deferred"
], function (array, declare, Deferred) {

	return declare(null, {

		portal: null,
		portalUser: null,
		portalQueryParams: null,
		fullName : null,
>>>>>>> 9edef40c989e7189242228381b4d2a74e0843637

		constructor:function (portal) {
			this.portal = portal;
			this.portalUser = portal.getPortalUser();
			this.portalQueryParams = {
<<<<<<< HEAD
				q:"owner:" + this.portalUser.username,
				num:100
			};
			this.fullName = this.portalUser.fullName;
=======
				q: "owner:" + this.portalUser.username,
				num: 1000
			};
			this.fullName = this.portalUser.fullName;
			console.log("------ PortalUtils -------");
>>>>>>> 9edef40c989e7189242228381b4d2a74e0843637
		},

		getItem:function (selectedRowID) {
			var deferred = new Deferred();
			this.portalUser.getItem(selectedRowID).then(function (item) {
				deferred.resolve(item);
			});
			return deferred.promise;
		},

<<<<<<< HEAD
		setUserFullName:function (fullName) {
			this.fullName = fullName;
		},

		getListOfCurators:function () {
			var deferred = new Deferred();
			var query = new Query();
			query.returnGeometry = false;
			query.outFields = ["*"];
			query.where = "1=1";
			var queryTask = new QueryTask(defaults.CURATOR_LIST_ADMIN_FEATURE_SERVICE_URL);
			queryTask.execute(query).then(function (results) {
				deferred.resolve(results);
			});
			return deferred.promise;
		},

		queryPortal:function (items) {
			var defs = [];
			var d = new Deferred();
			var nItems = items.length;
			array.forEach(items, lang.hitch(this, function (item, i) {
				var deferred = new Deferred();
				var params = {
					q:'id:' + item.attributes["itemID"],
					num:100
				};
				this.portal.queryItems(params).then(function (result) {
					console.debug(result.results[0]);
					deferred.resolve(result.results[0]);
				});
				defs.push(deferred.promise);
				if (i === nItems - 1) {
					d.resolve(defs);
				}
			}));
			return d.promise;
=======
		setUserFullName: function (fullName) {
			this.fullName = fullName;
>>>>>>> 9edef40c989e7189242228381b4d2a74e0843637
		}
	});
});