define([
	"dijit/Tooltip",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/fx",
	"dojo/dom",
	"dojo/dom-attr",
	"dojo/dom-style",
	"dojo/query",
	"config/defaults"
], function (Tooltip, array, declare, fx, dom, domAttr, domStyle, query, defaults) {

	return declare(null, {

		instance: null,

		constructor: function () {

		},

		startup: function () {
			//this.instance = 1;
		},

		toggleCheckboxes: function (checkBoxID_values, attr, value) {
			// enable/disable living atlas checkboxes
			array.forEach((checkBoxID_values), function (id) {
				if (dijit.byId(id)) {
					dijit.byId(id).setAttribute(attr, value);
				}
			});
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
		},

		fadeLoader: function () {
			var loaderNode = dom.byId("map-mask");
			domStyle.set(loaderNode, "opacity", "1");
			var fadeArgs = {
				node:"map-mask",
				duration:1000
			};
			fx.fadeOut(fadeArgs).play();
		},

		updateEditSaveButton: function (_editSaveBtnNode, _label, _cancelBtnNode, _display) {
			domAttr.set(_editSaveBtnNode, "innerHTML", _label);
			domStyle.set(_cancelBtnNode, "display", _display);
		},

		updateNodeHeight: function (node, height) {
			domStyle.set(node, "height", height + "px");
		},

		formatDate: function (date) {
			var d = new Date(date);
			var month = defaults.MONTHS[d.getMonth()];
			if (d.isNaN) {
				return "";
			} else {
				return month + " " + d.getDate() + ", " + d.getFullYear();
			}
		},

		formatThumbnailUrl: function (obj) {
			var thumbnailUrl = "";
			if (obj.largeThumbnail !== null) {
				thumbnailUrl = obj.largeThumbnail;
			} else if (obj.thumbnailUrl !== null) {
				thumbnailUrl = obj.thumbnailUrl;
			} else {
				thumbnailUrl = location.protocol + "//" + location.hostname + location.pathname + "assets/images/nullThumbnail.png";
			}
			return thumbnailUrl;
		},

		updateHeader: function () {
			// homepage header message
			query(".intro")[0].innerHTML = "";

			var searchInputNode = query(".search-items")[0];
			var dropdownSortNode = query(".dropdown-item-sort")[0];
			var dropdownItemFilterNode = query(".dropdown-item-filter")[0];
			var helpButtonNode = query(".help-button")[0];

			domStyle.set(searchInputNode, "display", "block");
			domStyle.set(dropdownSortNode, "display", "block");
			domStyle.set(dropdownItemFilterNode, "display", "block");
			domStyle.set(helpButtonNode, "display", "block");

			var signInRow = query(".sign-in-row")[0];
			domStyle.set(signInRow, "display", "none");
			var gridPanel = dom.byId("dgrid");
			domStyle.set(gridPanel, "display", "block");
		},

		disableNominateButton: function (btnNode) {
			var classAttrs = domAttr.get(btnNode, "class");
			classAttrs = classAttrs.replace("enabled", "disabled");
			domAttr.set(btnNode, "class", classAttrs);
		},

		enableNominateButton: function (btnNode) {
			var classAttrs = domAttr.get(btnNode, "class");
			classAttrs = classAttrs.replace("disabled", "enabled");
			domAttr.set(btnNode, "class", classAttrs);
		}
	});
});