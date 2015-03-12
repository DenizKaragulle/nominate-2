define([
	"esri/tasks/query",
	"esri/tasks/QueryTask",
	"dijit/Tooltip",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/fx",
	"dojo/Deferred",
	"dojo/dom",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/query",
	"config/defaults",
	"config/scoring"
], function (Query, QueryTask, Tooltip, array, declare, fx, Deferred, dom, domAttr, domClass, domConstruct, domStyle, query, defaults, scoring) {

	return declare(null, {

		// Ribbon header number of items node
		ribbonHeaderNumItemsNode: null,
		// "Nominate" button node
		nominateBtnNode: null,

		constructor: function () {
			this.ribbonHeaderNumItemsNode = dom.byId("ribbon-header-num-items");
			this.setNodeContent(".intro", defaults.INTRO_TEXT_1);
			this.setNodeContent(".ribbon-header-title", defaults.HEADER_TEXT_PUBLIC);
		},

		showNode: function (node) {
			domStyle.set(node, "display", "block");
		},

		hideNode : function (node) {
			if (node) {
				domStyle.set(node, "display", "none");
			}
		},

		setActiveTab: function (newSelectedTab, oldSelectedTab, props) {
			var _old = domAttr.get(oldSelectedTab, "class").split(" ");
			var _new = domAttr.get(newSelectedTab, "class").split(" ");
			var _tmpOld = "";
			array.forEach(_old, function (attr) {
				if (attr !== "active") {
					_tmpOld = _tmpOld + " " + attr;
				}
			});
			domAttr.set(oldSelectedTab, "class", _tmpOld.trim());

			var _tmpNew = "";
			array.forEach(_new, function (attr) {
				if (attr !== "active") {
					_tmpNew = _tmpNew + " " + attr;
				}
			});
			domAttr.set(newSelectedTab, "class", _tmpNew.trim() + " active");
		},

		loadContent : function (content) {
			domConstruct.destroy("section-content");
			var node = query(".content-container")[0];
			domConstruct.place(content, node, "last");
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
				node: "map-mask",
				duration: 1000
			};
			fx.fadeOut(fadeArgs).play();
		},

		updateEditSaveButton: function (editSaveBtnNode, label, cancelBtnNode, display) {
			domAttr.set(editSaveBtnNode, "innerHTML", label);
			domStyle.set(cancelBtnNode, "display", display);
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
		},

		initPassingMarker: function (progressBarNode) {
			domConstruct.place("<div class='current-score-passing-marker'>" +
					"<span class='current-overall-gr-number'> " + scoring.SCORE_THRESHOLD + "</span>" +
					"<span class='current-overall-gr-label'>required score</span>" +
					"</div>", progressBarNode, "before");
		},

		updateSectionScoreStyle: function (itemScore, max, node) {
			if ((itemScore / max * scoring.MAXIMUM_SCORE) >= scoring.SCORE_THRESHOLD) {
				domClass.replace(node, "score-graphic-pass", "score-graphic-fail");
			} else {
				domClass.replace(node, "score-graphic-fail", "score-graphic-pass");
			}
		},

		setPassFailStyleOnTabNode: function (score, node, sectionThreshold) {
			var average = Math.floor(score / sectionThreshold * scoring.MAXIMUM_SCORE);
			var classAttrs = domAttr.get(node, "class");
			if (average >= scoring.SCORE_THRESHOLD) {
				classAttrs = classAttrs.replace("icon-edit", "icon-check");
				domAttr.set(node, "class", classAttrs);
				domStyle.set(node, "color", "#007ac2");
				domStyle.set(node, "border", "1px solid #007ac2");
			} else {
				classAttrs = classAttrs.replace("icon-check", "icon-edit");
				domAttr.set(node, "class", classAttrs);
				domStyle.set(node, "color", scoring.FAIL_COLOR);
				domStyle.set(node, "border", "1px solid #C86A4A");
			}
		},

		setNodeContent: function (str, content) {
			var node = query(str)[0];
			node.innerHTML = content;
		},

		updateRibbonHeaderTitle : function () {
			domAttr.set(query(".ribbon-header-title").parent()[0], "class", "");
			this.setNodeContent(".ribbon-header-title", defaults.HEADER_BLOCK_PRIVATE);
		},

		nodeMouseEnterHandler: function (node) {
			domClass.add(node, "hoverClass");
		},

		nodeMouseLeaveHandler: function (node) {
			domClass.remove(node, "hoverClass");
		},

		/**
		 *
		 * @param itemID
		 * @return {*}
		 */
		getFeature: function (itemID) {
			var deferred = new Deferred();
			var query = new Query();
			query.returnGeometry = false;
			query.outFields = ["*"];
			query.where = "itemID = '" + itemID + "'";
			var queryTask = new QueryTask(defaults.NOMINATE_ADMIN_FEATURE_SERVICE_URL);
			queryTask.execute(query).then(function (results) {
				deferred.resolve(results);
			});
			return deferred.promise;
		}
	});
});