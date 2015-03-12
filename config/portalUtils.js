define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/Deferred"
], function (array, declare, Deferred) {

	return declare(null, {

		portal: null,
		portalUser: null,
		portalQueryParams: null,
		fullName : null,

		constructor: function (portal) {
			this.portal = portal;
			this.portalUser = portal.getPortalUser();
			this.portalQueryParams = {
				q: "owner:" + this.portalUser.username,
				num: 1000
			};
			this.fullName = this.portalUser.fullName;
			console.log("------ PortalUtils -------");
		},

		getItem : function (selectedRowID) {
			var deferred = new Deferred();
			this.portalUser.getItem(selectedRowID).then(function (item) {
				deferred.resolve(item);
			});
			return deferred.promise;
		},

		setUserFullName: function (fullName) {
			this.fullName = fullName;
		}
	});
});