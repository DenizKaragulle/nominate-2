define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang"
], function (array, declare, lang) {

	return declare(null, {

		instance: null,
		portal: null,
		dGrid: null,

		constructor: function (portal, grid) {
			this.portal = portal;
			this.dgrid = grid;
		},

		startup: function () {
			//this.instance = 1;
		},

		applySort: function (value) {
			if (value === "title") {
				this.dgrid.set("sort", value, false);
			} else if (value === "type") {
				this.dgrid.set("sort", value, false);
				this.dgrid.set("sort", [
					{
						attribute: value,
						descending: false
					},
					{
						attribute: "title",
						descending: false
					}
				]);
			} else if (value === "numViews") {
				this.dgrid.set("sort", value, true);
			} else if (value === "modified") {
				this.dgrid.set("sort", value, true);
			} else if (value === "status") {
				//dgrid.set("sort", value, true);
			} else if (value === "access") {
				this.dgrid.set("sort", value, false);
			} else {
				this.dgrid.set("sort", value);
			}
		},

		applyFilter: function (value) {
			var params = {};
			var owner = this.portal.user.username;
			if (value === "all-items") {
				params = {
					q: "owner:" + owner,
					num: 1000
				};
			} else if (value === "Web Map") {
				params = {
					q: "owner:" + owner + ' Web Map -type:"web mapping application" -type:"Layer Package" (type:"Project Package" OR type:"Windows Mobile Package" OR type:"Map Package" OR type:"Basemap Package" OR type:"Mobile Basemap Package" OR type:"Mobile Map Package" OR type:"Pro Map" OR type:"Project Package" OR type:"Web Map" OR type:"CityEngine Web Scene" OR type:"Map Document" OR type:"Globe Document" OR type:"Scene Document" OR type:"Published Map" OR type:"Explorer Map" OR type:"ArcPad Package" OR type:"Map Template") -type:"Code Attachment" -type:"Featured Items" -type:"Symbol Set" -type:"Color Set" -type:"Windows Viewer Add In" -type:"Windows Viewer Configuration"  -type:"Code Attachment" -type:"Featured Items" -type:"Symbol Set" -type:"Color Set" -type:"Windows Viewer Add In" -type:"Windows Viewer Configuration"',
					num: 1000
				};
			} else {
				params = {
					q: "owner:" + owner + " type: " + value,
					num: 1000
				};
			}

			this.portal.queryItems(params).then(lang.hitch(this, function (result) {
				this.dgrid.store.data = result.results;
				this.dgrid.refresh();
			}));
		}
	});
});