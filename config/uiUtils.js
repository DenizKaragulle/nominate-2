define([
	"dijit/Tooltip",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/dom-attr",
	"dojo/query",
	"config/defaults"
], function (Tooltip, array, declare, domAttr, query, defaults) {

	return declare(null, {

		instance:null,

		constructor:function () {

		},

		startup:function () {
			//this.instance = 1;
		},

		createTooltips: function (nodes, content) {
			array.forEach(nodes, function (node, i) {
				var userDescriptionTooltip = new Tooltip({
					connectId: [node],
					style: {
						width: "10px"
					},
					label: content[i]
				});
			});
		}
	});
});