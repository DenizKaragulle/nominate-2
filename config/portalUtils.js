define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/Deferred",
	"esri/arcgis/Portal"
], function (array, declare, Deferred, arcgisPortal) {

	return declare(null, {

		instance: null,
		portal: null,
		portalUser: null,

		constructor: function (portal) {
			this.portal = portal;
			this.portalUser = portal.getPortalUser();
		},

		getItem : function (selectedRowID) {
			var deferred = new Deferred();
			this.portalUser.getItem(selectedRowID).then(function (item) {
				deferred.resolve(item);
			});
			return deferred.promise;
		}
	});
});