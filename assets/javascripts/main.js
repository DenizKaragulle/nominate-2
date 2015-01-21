require([
	"put-selector/put",
	"dojo/store/Memory",
	"dojo/store/Observable",
	"dgrid/extensions/Pagination",
	"dgrid/OnDemandGrid",
	"dgrid/Keyboard",
	"dgrid/Selection",
	"dijit/Dialog",
	"dijit/Editor",
	"dijit/_editor/plugins/LinkDialog",
	"dijit/_editor/plugins/TextColor",
	"dijit/_editor/plugins/ViewSource",
	"dijit/_editor/plugins/FontChoice",
	"dijit/form/Button",
	"dijit/form/CheckBox",
	"dijit/ProgressBar",
	"dijit/Tooltip",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/fx",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/date",
	"dojo/Deferred",
	"dojo/dom",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/html",
	"dojo/keys",
	"dojo/number",
	"dojo/on",
	"dojo/query",
	"dojo/string",
	"esri/arcgis/Portal",
	"esri/arcgis/OAuthInfo",
	"esri/IdentityManager",
	"esri/arcgis/utils",
	"esri/config",
	"esri/map",
	"esri/request",
	"dojo/parser",
	"dojo/ready",
	"config/defaults",
	"config/details",
	"config/credits",
	"config/tags",
	"config/performance",
	"config/profile",
	"config/tooltips",
	"config/scoring",
	"esri/dijit/Tags",
	"dojo/NodeList-traverse"
], function (put, Memory, Observable, Pagination, OnDemandGrid, Keyboard, Selection, Dialog, Editor, LinkDialog, TextColor, ViewSource, FontChoice, Button, CheckBox, ProgressBar, Tooltip, array, declare, fx, lang, aspect, date, Deferred, dom, domAttr, domClass, domConstruct, domStyle, html, keys, number, on, query, string, arcgisPortal, ArcGISOAuthInfo, esriId, arcgisUtils, config, Map, esriRequest, parser, ready, defaults, details, credits, tags, performanceConfig, profileConfig, tooltipsConfig, scoring, Tags) {

	parser.parse();

	var map;
	var layers;
	//
	var dgrid;
	var itemStore;
	var renderRow;
	//
	var selectedRow;
	var selectedRowID;
	var previousSelectedRow;
	var previousSelectedRowID;
	// Nodes
	var signInNode = "";
	var detailsNode = "";
	var creditsNode = "";
	var tagsNode = "";
	var performanceNode = "";
	var profileNode = "";
	var nodeList = [];

	var ribbonHeaderTitle = "";
	var ribbonHeaderUser = "";
	var ribbonHeaderNumItemsNode = "";
	var searchInputNode = "";
	var dropdownSortNode = "";
	var dropdownItemFilterNode = "";
	var helpButtonNode = "";

	var progressBarAnchorNode = "";
	var categoryNodes = [];
	// div dimensions
	var COLLAPSE_ROW_HEIGHT = 125;
	var EXPAND_ROW_HEIGHT = 900;
	// element id/name
	var SIGNIN_BUTTON_ID = "sign-in";
	var EXPANDED_ROW_NAME = "expanded-row-";
	//var SAVE_BUTTON_NAME = "btn-";
	var TAB_CONTAINER_NAME = "tc-";
	var TAB_CONTAINER_TITLE = "title-";
	var TAB_CONTAINER_DESC = "desc-";
	var TAB_CONTAINER_SNIPPET = "snippet-";
	var TAB_CONTAINER_LICENSE = "license-";
	var TAB_CONTAINER_CREDITS = "credits-";
	var TAB_CONTAINER_CATEGORY = "category-";
	var TAB_CONTAINER_TAGS = "tags-";
	var TAB_CONTAINER_USERNAME = "username-";
	var TAB_CONTAINER_USERDESCRIPTION = "userdesc-";

	var portalUrl;
	var portal;
	var portalUser;
	var owner;

	// Dijit Editor for the description section
	var descriptionEditor;
	// Dijit Editor for the access and user constraints editor
	var accessUseConstraintsEditor;
	//
	var detailsNodeClickHandler;
	var creditsNodeClickHandler;
	var tagsNodeClickHandler;
	var performanceNodeClickHandler;
	var profileNodeClickHandler;
	//
	var overallScoreGraphic;
	var score = 78;
	//
	var checkBoxID_values = [];
	var tagStore;
	var tagsDijit;
	var newTag;

	var imageSizes = {
		"PROFILE": [150, 150],
		"SMALL": [200, 133],
		"LARGE": [286, 190],
		"XLARGE": [450, 300]
	};

	var updatedItems = {
		"PROFILE": [],
		"SMALL": [],
		"LARGE": [],
		"XLARGE": []
	};

	ready(function () {

		run();

		renderRow = function (object, data, cell) {
			var itemTitle = object.title;
			var thumbnailUrl = formatThumbnailUrl(object);
			var type = validateStr(object.type);
			var modifiedDate = formatDate(object.modified);
			var views = validateStr(object.numViews);
			var access = object.access;
			var randomStatus = Math.floor((Math.random() * 4) + 0);

			var status = defaults.CURRENT_STATUS[randomStatus].label;
			var statusLabel = defaults.CURRENT_STATUS[randomStatus].label;
			var statusColor = defaults.CURRENT_STATUS[randomStatus].color;
			var statusClass = defaults.CURRENT_STATUS[randomStatus].class;

			var n = domConstruct.create("div", {
				innerHTML: '<div class="row">' +
						'	<div class="column-3">' +
						'		<div class="thumbnail">' +
						'			<img class="item-thumbnail-' + object.id + '" src="' + thumbnailUrl + '" />' +
						'		</div>' +
						'	</div>' +

						'	<div class="column-18">' +
						'		<div class="item-title title-' + object.id + '">' + itemTitle + '</div>' +
						'		<div class="item-meta-data">' +
						'			<span class="item-type">' + type + '</span> - <span class="item-access">Sharing:' + access + ' - Updated ' + modifiedDate + '</span>' +
						'		</div>' +
						'		<div class="item-number-views">' + views + ' views</div>' +
						'	</div>' +

						'	<div class="column-3">' +
						'		<div>' + status + '</div>' +
						'	</div>' +
						'</div>'
			});
			cell.appendChild(n);
		};

		detailsNodeClickHandler = function (selectedRowID, _categoryNodes, _nodeList, _titleID, _snippetID, _descID, _detailsNode) {
			destroyNodes(_categoryNodes);
			array.forEach(_nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4", "active column-4");
					detailsContentPane(selectedRowID, _titleID, _snippetID, _descID);
				}
			});
			domClass.replace(_detailsNode, "active column-4 details", "column-4 details");
		};

		creditsNodeClickHandler = function (selectedRowID, _categoryNodes, _nodeList, _item, _accessID, _creditID, _creditsNode) {
			destroyNodes(_categoryNodes);
			array.forEach(_nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4", "active column-4");
					useCreditsContentPane(selectedRowID, _accessID, _creditID);
				}
			});
			domClass.replace(_creditsNode, "active column-4 credits", "column-4 credits");
		};

		tagsNodeClickHandler = function (_selectedRowID, _categoryNodes, _nodeList, _categoryID, _tagsID, _tagsNode) {
			destroyNodes(categoryNodes);
			categoryNodes = [];
			array.forEach(defaults.ATLAS_TAGS, function (atlasTag) {
				categoryNodes.push(atlasTag.id + previousSelectedRowID);
			});
			array.forEach(_nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4", "active column-4");
					tagsContentPane(_selectedRowID, _categoryID, _tagsID);
				}
			});
			domClass.replace(_tagsNode, "active column-4 tags", "column-4 tags");
		};

		performanceNodeClickHandler = function (_categoryNodes, _nodeList, _item, _popUps, _mapDrawTime, _layers, _performanceNode) {
			destroyNodes(_categoryNodes);
			array.forEach(nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4", "active column-4");
					performanceContentPane(_item, _popUps, _mapDrawTime, _layers);
				}
			});
			domClass.replace(_performanceNode, "active column-4 performance", "column-4 performance");
		};

		profileNodeClickHandler = function (_selectedRowID, _categoryNodes, _nodeList, _userNameID, _userDescriptionID, _profileNode) {
			destroyNodes(_categoryNodes);
			array.forEach(_nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4", "active column-4");
					loadProfileContentPane(_selectedRowID, _userNameID, _userDescriptionID);
				}
			});
			domClass.replace(_profileNode, "active column-4 profile", "column-4 profile");
		};

		function run() {
			// sign in node
			signInNode = query(".intro")[0];
			// homepage header message
			signInNode.innerHTML = defaults.INTRO_TEXT_1;
			// ribbon header
			ribbonHeaderTitle = query(".ribbon-header-title")[0];
			ribbonHeaderUser = query(".ribbon-header-user")[0];
			ribbonHeaderNumItemsNode = dom.byId("ribbon-header-num-items");
			ribbonHeaderTitle.innerHTML = defaults.HEADER_TEXT_PUBLIC;

			searchInputNode = query(".search-items")[0];
			dropdownSortNode = query(".dropdown-item-sort")[0];
			dropdownItemFilterNode = query(".dropdown-item-filter")[0];
			helpButtonNode = query(".help-button")[0];

			portalUrl = document.location.protocol + '//www.arcgis.com';
			portal = new arcgisPortal.Portal(portalUrl);

			on(portal, "ready", function (p) {
				on(dom.byId(SIGNIN_BUTTON_ID), "click", signIn);

				on(query(".filter-list"), "click", function (event) {
					var checkedListItem = query(".filter-check");
					domAttr.set(checkedListItem, "class", "filter-list");
					domClass.remove(checkedListItem[0], "icon-check filter-check");
					domStyle.set(checkedListItem, "margin-left", "20px");
					query(".filter-list").style("margin-left", "20px");
					domAttr.set(this, "class", "filter-list icon-check filter-check");
					domStyle.set(this, "margin-left", "2px");

					var target = domAttr.get(this, "data-value");
					applyFilter(target);
				});

				on(query(".sort-items"), "click", function (event) {
					var checkedListItem = query(".icon-check");
					domAttr.set(checkedListItem, "class", "sort-items");
					domClass.remove(checkedListItem[0], "icon-check");
					domStyle.set(checkedListItem, "margin-left", "20px");
					query(".sort-items").style("margin-left", "20px");
					domAttr.set(this, "class", "sort-items icon-check");
					domStyle.set(this, "margin-left", "2px");

					var target = domAttr.get(this, "data-value");
					applySort(target);
				});
			});

			on(query(".icon-help")[0], "click", function () {
				var helpDialog = new Dialog({
        			title: "HELP",
        			content: "<div>Not implemented yet</div>",
        			style: "width: 300px"
    			});
				helpDialog.show();
			});
		}

		function signIn() {
			portal.signIn().then(function (user) {
				// update the header row
				updateHeader();

				portalUser = portal.getPortalUser();
				owner = portalUser.username;

				var params = {
					q: "owner:" + owner,
					num: 1000
				};
				portal.queryItems(params).then(function (result) {
					// total number of items
					var numItems = result.total;
					// update the ribbon header
					// remove the globe icon from the ribbon header title
					domAttr.set(query(".ribbon-header-title").parent()[0], "class", "");
					var HEADER_BLOCK_PRIVATE_NAME = " (" + portalUser.fullName + " - " + owner + ")"
					ribbonHeaderTitle.innerHTML = defaults.HEADER_BLOCK_PRIVATE;
					ribbonHeaderUser.innerHTML = HEADER_BLOCK_PRIVATE_NAME;
					// update the text and icon
					ribbonHeaderNumItemsNode.innerHTML = " " + numItems + " Items";
					domAttr.set(ribbonHeaderNumItemsNode, "class", "icon-stack");

					if (numItems > 0) {
						// dgrid columns
						var dgridColumns = [
							{
								label: "",
								field: "thumbnailUrl",
								renderCell: renderRow
							}
						];
						// dgrid memory store
						//itemStore = new Observable(new Memory({
						//	data: result.results
						//}));
						itemStore = new Memory({
							data: result.results
						});
						// dgrid
						dgrid = new (declare([OnDemandGrid, Pagination]))({
							store: itemStore,
							rowsPerPage: 6,
							pagingLinks: true,
							pagingTextBox: false,
							firstLastArrows: true,
							columns: dgridColumns,
							showHeader: false
						}, "dgrid");
						dgrid.startup();

						// item title click handler
						on(dgrid.domNode, ".item-title:click", function (event) {
							// selected row
							selectedRow = dgrid.row(event).element;
							// selected row ID
							selectedRowID = domAttr.get(selectedRow, "id").split("dgrid-row-")[1];
							// get row width
							var selectedNodeWidth = domStyle.get(selectedRow, "width") - 10;
							// set row height
							domStyle.set(selectedRow, "height", "600px");

							if (previousSelectedRow) {
								// collapse the previously selected row height
								updateNodeHeight(previousSelectedRow, COLLAPSE_ROW_HEIGHT);
								var categoryNodes = [];
								array.forEach(defaults.ATLAS_TAGS, function (atlasTag) {
									categoryNodes.push(atlasTag.id + previousSelectedRowID);
								});
								domConstruct.destroy(EXPANDED_ROW_NAME + previousSelectedRowID);
								if (previousSelectedRowID === selectedRowID) {
									previousSelectedRowID = "";
									previousSelectedRow = null;
								} else {
									// expand selected row height
									updateNodeHeight(selectedRow, EXPAND_ROW_HEIGHT);
									previousSelectedRow = selectedRow;
								}
							} else {
								updateNodeHeight(selectedRow, EXPAND_ROW_HEIGHT);
								previousSelectedRow = selectedRow;
							}

							if (previousSelectedRowID !== selectedRowID && previousSelectedRow !== null) {
								previousSelectedRowID = selectedRowID;
								// unique id's
								var rowID = EXPANDED_ROW_NAME + selectedRowID;
								var tcID = TAB_CONTAINER_NAME + selectedRowID;
								var titleID = TAB_CONTAINER_TITLE + selectedRowID;
								var descID = TAB_CONTAINER_DESC + selectedRowID;
								var snippetID = TAB_CONTAINER_SNIPPET + selectedRowID;
								var accessID = TAB_CONTAINER_LICENSE + selectedRowID;
								var creditID = TAB_CONTAINER_CREDITS + selectedRowID;
								var categoryID = TAB_CONTAINER_CATEGORY + selectedRowID;
								var tagsID = TAB_CONTAINER_TAGS + selectedRowID;
								var userNameID = TAB_CONTAINER_USERNAME + selectedRowID;
								var userDescriptionID = TAB_CONTAINER_USERDESCRIPTION + selectedRowID;
								// create the map
								portalUser.getItem(selectedRowID).then(function (item) {
									domConstruct.place(
											"<div id='" + rowID + "' class='container' style='width: " + selectedNodeWidth + "px;'>" +
													"	<div class='content-container'>" +
													"		<div class='row'>" +
													"			<div class='column-21 pre-3'>" +
													"				<div id='map-mask' class='loader'>" +
													"					<span class='side side-left'><span class='fill'></span></span>" +
													"					<span class='side side-right'><span class='fill'></span></span>" +
													"					<p class='loading-word'>Loading...</p>" +
													"				</div>" +
													"				<div id='map'></div>" +
													"			</div>" +
													"		</div>" +

													"		<div class='row'>" +
													"			<div class='column-21 pre-3'>" +
													"				<div class='current-score-header'>" + defaults.CURRENT_SCORE_HEADER_TEXT + "</div>" +
													"			</div>" +
													"		</div>" +

													"		<div class='row'>" +
													"			<div class='column-15 pre-3'>" +
													"				<div class='current-score-graphic-container'></div>" +
													"			</div>" +
													"			<div class='column-2'>" +
													"				<div class='current-score-number'>78</div>" +
													"			</div>" +
													"			<div class='column-3 right' style='margin-top: -15px !important;'>" +
													"				<button id='nominate-btn' class='btn icon-email custom-btn'> NOMINATE </button>" +
													"			</div>" +
													"		</div>" +

													"		<div class='row'>" +
													"			<div class='column-15 pre-3'>" +
													"				<div class='expanded-item-text'>" + defaults.OVERALL_TXT + "</div>" +
													"			</div>" +
													"		</div>" +

													"		<div class='row'>" +
													"			<div class='column-18 pre-3'>" +
													"				<div id='" + tcID + "'></div>" +
													"			</div>" +
													"		</div>" +
													"	</div>" +
													"</div>",
											selectedRow.firstElementChild, "last");

									progressBarAnchorNode = query(".current-score-graphic-container")[0];

									createContentButtonGroup(tcID);

									// initialize content area with details data
									destroyNodes(categoryNodes);
									array.forEach(nodeList, function (node) {
										if (domClass.contains(node, "active")) {
											domClass.replace(node, "column-4", "active column-4");
											detailsContentPane(selectedRowID, titleID, snippetID, descID);
										}
									});
									domClass.replace(detailsNode, "active column-4", "column-4");

									if (item.type === "Web Map") {
										var mapDrawBegin = performance.now();
										var mapDrawComplete;
										// Web Map, Feature Service, Map Service, Image Service, Web Mapping Application
										arcgisUtils.createMap(selectedRowID, "map").then(function (response) {
											layers = response.itemInfo.itemData.operationalLayers;
											map = response.map;

											// make sure map is loaded
											if (map.loaded) {
												mapDrawComplete = performance.now();
												var mapDrawTime = (mapDrawComplete - mapDrawBegin);
												fadeLoader();
												var popUps = processPopupData(map);
												on(performanceNode, "click", lang.partial(performanceNodeClickHandler, categoryNodes, nodeList, item, popUps, mapDrawTime, layers, performanceNode));
											}
										});
									} else {
										fadeLoader();
										// hide the map div
										domStyle.set("map", "display", "none");
										on(performanceNode, "click", lang.partial(performanceNodeClickHandler, categoryNodes, nodeList, item, "", "", layers, performanceNode));
									}
									on(detailsNode, "click", lang.partial(detailsNodeClickHandler, selectedRowID, categoryNodes, nodeList, titleID, snippetID, descID, detailsNode));
									on(creditsNode, "click", lang.partial(creditsNodeClickHandler, selectedRowID, categoryNodes, nodeList, item, accessID, creditID, creditsNode));
									on(tagsNode, "click", lang.partial(tagsNodeClickHandler, selectedRowID, categoryNodes, nodeList, categoryID, tagsID, tagsNode));
									on(profileNode, "click", lang.partial(profileNodeClickHandler, selectedRowID, categoryNodes, nodeList, userNameID, userDescriptionID, profileNode));

									// overall score graphic
									if (dijit.byId("overall-score-graphic")) {
										dijit.byId("overall-score-graphic").destroy();
									}
									overallScoreGraphic = new ProgressBar({
										id: "overall-score-graphic",
										style: {
											"width": "100%",
											"height": "5px"
										},
										value: score
									}).placeAt(progressBarAnchorNode).startup();
									domConstruct.place("<div class='current-score-passing-marker'>" +
											"<span class='current-overall-gr-number'> 80</span>" +
											"<span class='current-overall-gr-label'>required score</span>" +
											"</div>", progressBarAnchorNode, "before");
								});
							}
						});
					} else {
						console.log("no results");
					}
				});
			});
		}

		function detailsContentPane(selectedRowID, titleID, snippetID, descID) {
			portalUser.getItem(selectedRowID).then(function (item) {
				// item title
				var itemTitle = validateItemTitle(item.title);
				var itemTitle_clean = itemTitle;
				// item summary
				var itemSummary = validateStr(item.snippet);
				var itemSummary_clean = itemSummary;
				// item description
				var itemDescription = validateStr(item.description);
				var itemDescription_clean = itemDescription;
				// thumbnail url
				var thumbnailUrl = formatThumbnailUrl(item);
				var thumbnailUrl_clean = thumbnailUrl;

				// load the content
				loadContent(details.DETAILS_CONTENT);

				// nodes
				var editSaveBtnNode = query(".edit-save-btn")[0],
						cancelBtnNode = query(".cancel-btn")[0],
						itemThumbnailNode = query(".thumbnailUrl")[0],
						itemTitleNode = query(".title-textbox")[0],
						itemSummaryNode = query(".summary-textbox")[0],
						itemDescriptionNode = query(".description-editor")[0],
						itemThumbnailTooltipNode = query(".thumbnail-tooltip")[0],
						itemTitleTooltipNode = query(".title-tooltip")[0],
						itemSummaryTooltipNode = query(".summary-tooltip")[0],
						itemDescriptionTooltipNode = query(".description-tooltip")[0],
						titleScoreNodeContainer = query(".details-title-score-gr")[0],
						titleScoreNumeratorNode = query(".details-title-score-num")[0],
						titleScoreDenominatorNode = query(".details-title-score-denom")[0],
						summaryScoreNodeContainer = query(".details-summary-score-gr")[0],
						summaryScoreNumeratorNode = query(".details-summary-score-num")[0],
						summaryScoreDenominatorNode = query(".details-summary-score-denom")[0],
						descScoreNodeContainer = query(".details-desc-score-gr")[0],
						descScoreNumeratorNode = query(".details-desc-score-num")[0],
						descScoreDenominatorNode = query(".details-desc-score-denom")[0],
						itemThumbnailListener;


				// set the thumbnail
				domAttr.set(itemThumbnailNode, "src", thumbnailUrl);
				domAttr.set(itemThumbnailNode, "class", "expanded-item-thumbnail thumbnailUrl expanded-item-thumbnail-" + item.id);
				// set the title
				domAttr.set(itemTitleNode, "id", titleID);
				domConstruct.create("div", { innerHTML: itemTitle }, itemTitleNode, "first");
				// set the summary
				domAttr.set(itemSummaryNode, "id", snippetID);
				domAttr.set(itemSummaryNode, "value", itemSummary);
				domConstruct.create("div", { innerHTML: itemSummary }, itemSummaryNode, "first");
				// set the description
				domAttr.set(itemDescriptionNode, "id", descID);
				if (itemDescription === "") {
					domConstruct.place("<span></span>", "description-editor-widget", "first");
				} else {
					domConstruct.place("<span>" + itemDescription + "</span>", "description-editor-widget", "first");
				}

				//tooltips
				createTooltip(itemThumbnailTooltipNode, tooltipsConfig.ITEM_THUMBNAIL_TOOLTIP_CONTENT);
				createTooltip(itemTitleTooltipNode, tooltipsConfig.ITEM_TITLE_TOOLTIP_CONTENT);
				createTooltip(itemSummaryTooltipNode, tooltipsConfig.ITEM_SUMMARY_TOOLTIP_CONTENT);
				createTooltip(itemDescriptionTooltipNode, tooltipsConfig.ITEM_DESCRIPTION_TOOLTIP_CONTENT);

				titleScoreDenominatorNode.innerHTML = scoring.SECTION_MAX;
				summaryScoreDenominatorNode.innerHTML = scoring.SECTION_MAX;
				descScoreDenominatorNode.innerHTML = scoring.SECTION_MAX;
				validateTextInput(itemTitle, titleScoreNodeContainer, titleScoreNumeratorNode, scoring.ITEM_TITLE_MIN_LENGTH, scoring.ITEM_TITLE_CONTENT);
				validateTextInput(itemSummary, summaryScoreNodeContainer, summaryScoreNumeratorNode, scoring.ITEM_SUMMARY_MIN_LENGTH, scoring.ITEM_SUMMARY_CONTENT);
				validateTextInput(itemDescription, descScoreNodeContainer, descScoreNumeratorNode, scoring.ITEM_DESC_MIN_LENGTH, scoring.ITEM_DESC_CONTENT);

				on(editSaveBtnNode, "click", function () {
					if (editSaveBtnNode.innerHTML === " EDIT ") {
						// EDIT clicked
						// update EDIT/SAVE button
						updateEditSaveButton(editSaveBtnNode, " SAVE ", cancelBtnNode, "block");
						domStyle.set(query(".expanded-item-thumbnail")[0], "cursor", "pointer");

						// update thumbnail
						domStyle.set(query(".edit-thumbnail-msg")[0], "display", "block");

						// update title
						domConstruct.empty(itemTitleNode);
						domConstruct.create("input", { class: "edit-title", value: itemTitle }, itemTitleNode, "first");
						domAttr.set(itemTitleNode, "data-dojo-type", "dijit/form/TextBox");
						domAttr.set(itemTitleNode, "id", titleID);

						// update summary
						domConstruct.empty(itemSummaryNode);
						domConstruct.create("input", { class: "edit-summary", value: itemSummary }, itemSummaryNode, "first");
						domAttr.set(itemSummaryNode, "data-dojo-type", "dijit/form/TextBox");
						domAttr.set(itemSummaryNode, "id", snippetID);

						// update description
						if (dijit.byId("description-editor-widget")) {
							dijit.byId("description-editor-widget").destroy();
							domAttr.remove(itemDescriptionNode, "id");
							domConstruct.create("div", {
								id: "description-editor-widget",
								innerHTML: itemDescription
							}, itemDescriptionNode, "first");
						}
						// create the Editor for the description
						descriptionEditor = new Editor({
							plugins: [
								'bold',
								'italic',
								'underline',
								'foreColor',
								'hiliteColor',
								'|',
								'justifyLeft',
								'justifyCenter',
								'justifyRight',
								'justifyFull',
								'|',
								'insertOrderedList',
								'insertUnorderedList',
								'|',
								'indent',
								'outdent',
								'|',
								'createLink',
								'unlink',
								'removeFormat',
								'|',
								'undo',
								'redo',
								'|',
								'viewSource'
							],
							innerHTML: itemDescription
						}, dom.byId("description-editor-widget"));
						descriptionEditor.startup();

						// update thumbnail
						itemThumbnailListener = on(query(".expanded-item-thumbnail"), "click", lang.hitch(this, function (event) {
							portalUser.getItem(selectedRowID).then(lang.hitch(this, function (userItem) {
								uploadItemThumbnail(userItem, "SMALL");
							}));
						}));
					} else {
						itemThumbnailListener.remove();

						// SAVE clicked
						itemTitle = query(".edit-title")[0].value;
						itemSummary = query(".edit-summary")[0].value;
						itemDescription = dijit.byId("description-editor-widget").value;

						// write to AGOL
						portalUser.getItem(selectedRowID).then(function (results) {
							var _userItemUrl = results.userItemUrl;
							esriRequest({
								url: _userItemUrl + "/update",
								content: {
									f: "json",
									title: itemTitle,
									snippet: itemSummary,
									description: itemDescription
								}
							}, {
								usePost: true
							}).then(function (response) {
								if (response.success) {
									html.set(query(".title-" + selectedRowID)[0], itemTitle);
									itemTitle_clean = itemTitle;
									itemSummary_clean = itemSummary;
									itemDescription_clean = itemDescription;
									updateEditSaveButton(editSaveBtnNode, " EDIT ", cancelBtnNode, "none");
								} else {
									console.log("Details not updated");
								}
							});
						});

						// update thumbnail
						domStyle.set(query(".edit-thumbnail-msg")[0], "display", "none");
						domStyle.set(query(".expanded-item-thumbnail")[0], "cursor", "inherit");

						// update the title
						domConstruct.empty(itemTitleNode);
						domConstruct.create("div", { innerHTML: itemTitle }, itemTitleNode, "first");
						domAttr.remove(itemTitleNode, "data-dojo-type");
						domAttr.set(itemTitleNode, "id", titleID);

						// update the summary
						domConstruct.empty(itemSummaryNode);
						domConstruct.create("div", { innerHTML: itemSummary }, itemSummaryNode, "first");
						domAttr.remove(itemSummaryNode, "data-dojo-type");
						domAttr.set(itemSummaryNode, "id", snippetID);

						// update the description
						// empty the contents
						if (dijit.byId("description-editor-widget")) {
							dijit.byId("description-editor-widget").destroy();
							domAttr.remove(itemDescriptionNode, "id");
							domConstruct.create("div", {
								id: "description-editor-widget",
								innerHTML: itemDescription
							}, itemDescriptionNode, "first");
						}

						if (itemDescription === "") {
							domConstruct.place("<span></span>", "description-editor-widget", "first");
						} else {
							//domConstruct.place("<span>" + itemDescription + "</span>", "description-editor-widget", "first");
						}
					}
					validateTextInput(itemTitle, titleScoreNodeContainer, titleScoreNumeratorNode, scoring.ITEM_TITLE_MIN_LENGTH, scoring.ITEM_TITLE_CONTENT);
					validateTextInput(itemSummary, summaryScoreNodeContainer, summaryScoreNumeratorNode, scoring.ITEM_SUMMARY_MIN_LENGTH, scoring.ITEM_SUMMARY_CONTENT);
					validateTextInput(itemDescription, descScoreNodeContainer, descScoreNumeratorNode, scoring.ITEM_DESC_MIN_LENGTH, scoring.ITEM_DESC_CONTENT);
				});

				on(cancelBtnNode, "click", function () {
					itemThumbnailListener.remove();
					// update thumbnail cursor/message
					domStyle.set(query(".edit-thumbnail-msg")[0], "display", "none");
					domStyle.set(query(".expanded-item-thumbnail")[0], "cursor", "inherit");

					// update the title
					domConstruct.empty(itemTitleNode);
					domConstruct.create("div", { innerHTML: itemTitle_clean }, itemTitleNode, "first");
					domAttr.remove(itemTitleNode, "data-dojo-type");
					domAttr.set(itemTitleNode, "id", titleID);

					// update the summary
					domConstruct.empty(itemSummaryNode);
					domConstruct.create("div", { innerHTML: itemSummary_clean }, itemSummaryNode, "first");
					domAttr.remove(itemSummaryNode, "data-dojo-type");
					domAttr.set(itemSummaryNode, "id", snippetID);

					// update the description
					// empty the contents
					if (dijit.byId("description-editor-widget")) {
						dijit.byId("description-editor-widget").destroy();
					}

					domAttr.remove(itemDescriptionNode, "id");
					domConstruct.create("div", {
						id: "description-editor-widget"
					}, itemDescriptionNode, "first");

					if (itemDescription === "") {
						domConstruct.place("<span></span>", "description-editor-widget", "first");
					} else {
						domConstruct.place("<span>" + itemDescription_clean + "</span>", "description-editor-widget", "first");
					}

					domAttr.set(editSaveBtnNode, "innerHTML", " EDIT ");
					domStyle.set(cancelBtnNode, "display", "none");

					validateTextInput(itemTitle_clean, titleScoreNodeContainer, titleScoreNumeratorNode, scoring.ITEM_TITLE_MIN_LENGTH, scoring.ITEM_TITLE_CONTENT);
					validateTextInput(itemSummary_clean, summaryScoreNodeContainer, summaryScoreNumeratorNode, scoring.ITEM_SUMMARY_MIN_LENGTH, scoring.ITEM_SUMMARY_CONTENT);
					validateTextInput(itemDescription_clean, descScoreNodeContainer, descScoreNumeratorNode, scoring.ITEM_DESC_MIN_LENGTH, scoring.ITEM_DESC_CONTENT);
				});
			});
		}

		function useCreditsContentPane(selectedRowID, accessAndUseConstraintsID, creditID) {
			portalUser.getItem(selectedRowID).then(function (item) {
				var itemCredits = validateStr(item.accessInformation);
				var itemCredits_clean = itemCredits;
				var accessAndUseConstraints = validateStr(item.licenseInfo);
				var accessAndUseConstraints_clean = accessAndUseConstraints;

				// load the content
				loadContent(credits.ACCESS_CREDITS_CONTENT);

				domAttr.set(query(".creditsID-textbox")[0], "id", creditID);
				domConstruct.create("div", { innerHTML: itemCredits }, query(".creditsID-textbox")[0], "first");

				domAttr.set(query(".accessAndUseConstraintsEditor")[0], "id", accessAndUseConstraintsID);
				if (accessAndUseConstraints === "") {
					domConstruct.place("<span></span>", "access-editor-widget", "first");
				} else {
					domConstruct.place("<span>" + accessAndUseConstraints + "</span>", "access-editor-widget", "first");
				}

				var accessConstraintsTooltipNode = query(".access-constraints-tooltip")[0];
				var creditsTooltipNode = query(".credits-tooltip")[0];
				createTooltip(accessConstraintsTooltipNode, tooltipsConfig.CREDITS_TOOLTIP_CONTENT);
				createTooltip(creditsTooltipNode, tooltipsConfig.ACCESS_TOOLTIP_CONTENT);

				var editSaveBtnNode = query(".edit-save-btn")[0];
				var cancelBtnNode = query(".cancel-btn")[0];
				var itemCreditsNode = query(".creditsID-textbox")[0];
				var accessAndUseConstraintsEditorNode = query(".accessAndUseConstraintsEditor")[0];
				var creditsScoreNodeContainer = query(".credits-score-gr")[0];
				var creditsScoreNumeratorNode = query(".credits-score-num")[0];
				var creditsScoreDenominatorNode = query(".credits-score-denom")[0];

				creditsScoreDenominatorNode.innerHTML = scoring.SECTION_MAX;
				validateTextInput(itemCredits, creditsScoreNodeContainer, creditsScoreNumeratorNode, scoring.ITEM_CREDITS_MIN_NUM_WORDS, scoring.ITEM_CREDITS_CONTENT);
				//validateTextInput(itemSummary, summaryScoreNodeContainer, summaryScoreNumeratorNode, scoring.ITEM_SUMMARY_MIN_LENGTH, scoring.ITEM_SUMMARY_CONTENT);

				on(editSaveBtnNode, "click", function () {
					//var itemCreditsNode = query(".creditsID-textbox")[0];
					//var accessAndUseConstraintsEditorNode = query(".accessAndUseConstraintsEditor")[0];

					if (editSaveBtnNode.innerHTML === " EDIT ") {
						domAttr.set(editSaveBtnNode, "innerHTML", " SAVE ");
						domStyle.set(cancelBtnNode, "display", "block");
						// credits
						domConstruct.empty(itemCreditsNode);
						domConstruct.create("input", { class: "edit-credits", value: itemCredits }, itemCreditsNode, "first");
						domAttr.set(itemCreditsNode, "data-dojo-type", "dijit/form/TextBox");
						domAttr.set(itemCreditsNode, "id", creditID);

						// access and user constraints
						if (dijit.byId("access-editor-widget")) {
							dijit.byId("access-editor-widget").destroy();
							domAttr.remove(accessAndUseConstraintsEditorNode, "id");
							domConstruct.create("div", {
								id: "access-editor-widget",
								innerHTML: accessAndUseConstraints
							}, accessAndUseConstraintsEditorNode, "first");
						}
						accessUseConstraintsEditor = new Editor({
							plugins: [
								'bold',
								'italic',
								'underline',
								'foreColor',
								'hiliteColor',
								'|',
								'justifyLeft',
								'justifyCenter',
								'justifyRight',
								'justifyFull',
								'|',
								'insertOrderedList',
								'insertUnorderedList',
								'|',
								'indent',
								'outdent',
								'|',
								'createLink',
								'unlink',
								'removeFormat',
								'|',
								'undo',
								'redo',
								'|',
								'viewSource'
							],
							innerHTML: accessAndUseConstraints
						}, dom.byId("access-editor-widget"));
						accessUseConstraintsEditor.startup();
					} else {
						// credits
						itemCredits = query(".edit-credits")[0].value;
						accessAndUseConstraints = dijit.byId("access-editor-widget").value;

						domConstruct.empty(itemCreditsNode);
						domConstruct.create("div", { innerHTML: itemCredits }, itemCreditsNode, "first");
						domAttr.remove(itemCreditsNode, "data-dojo-type");
						domAttr.set(itemCreditsNode, "id", creditID);

						portalUser.getItem(selectedRowID).then(function (results) {
							var _userItemUrl = results.userItemUrl;
							esriRequest({
								url: _userItemUrl + "/update",
								content: {
									f: "json",
									licenseInfo: accessAndUseConstraints,
									accessInformation: itemCredits
								}
							}, {
								usePost: true
							}).then(function (response) {
										if (response.success) {
											domAttr.set(editSaveBtnNode, "innerHTML", " EDIT ");
											domStyle.set(cancelBtnNode, "display", "none");
										} else {
											console.log("ERROR");
										}
									});
						});

						if (dijit.byId("access-editor-widget")) {
							dijit.byId("access-editor-widget").destroy();
						}

						domAttr.remove(accessAndUseConstraintsEditorNode, "id");
						domConstruct.create("div", {
							id: "access-editor-widget"
						}, accessAndUseConstraintsEditorNode, "first");

						if (accessAndUseConstraints === "") {
							domConstruct.place("<span></span>", "access-editor-widget", "first");
						} else {
							domConstruct.place("<span>" + accessAndUseConstraints + "</span>", "access-editor-widget", "first");
						}

						validateTextInput(itemCredits, creditsScoreNodeContainer, creditsScoreNumeratorNode, scoring.ITEM_CREDITS_MIN_NUM_WORDS, scoring.ITEM_CREDITS_CONTENT);
					}
				});

				on(cancelBtnNode, "click", function () {
					domConstruct.empty(itemCreditsNode);
					domConstruct.create("div", { innerHTML: itemCredits_clean }, itemCreditsNode, "first");
					domAttr.remove(itemCreditsNode, "data-dojo-type");
					domAttr.set(itemCreditsNode, "id", creditID);

					if (dijit.byId("access-editor-widget")) {
						dijit.byId("access-editor-widget").destroy();
					}

					domAttr.remove(accessAndUseConstraintsEditorNode, "id");
					domConstruct.create("div", {
						id: "access-editor-widget"
					}, accessAndUseConstraintsEditorNode, "first");

					if (accessAndUseConstraints === "") {
						domConstruct.place("<span></span>", "access-editor-widget", "first");
					} else {
						domConstruct.place("<span>" + accessAndUseConstraints_clean + "</span>", "access-editor-widget", "first");
					}

					domAttr.set(editSaveBtnNode, "innerHTML", " EDIT ");
					domStyle.set(cancelBtnNode, "display", "none");

					validateTextInput(itemCredits_clean, creditsScoreNodeContainer, creditsScoreNumeratorNode, scoring.ITEM_CREDITS_MIN_NUM_WORDS, scoring.ITEM_CREDITS_CONTENT);
				});
			});
		}

		function tagsContentPane(_selectedRowID, categoryID, tagsID) {
			checkBoxID_values = [];

			portalUser.getItem(_selectedRowID).then(function (item) {
				// load the content
				loadContent(tags.TAGS_CONTENT);

				var editSaveBtnNode = query(".edit-save-btn")[0];
				var cancelBtnNode = query(".cancel-btn")[0];
				var tagsTooltipNode = query(".tags-tooltip")[0];
				createTooltip(tagsTooltipNode, tooltipsConfig.TAGS_TOOLTIP_CONTENT);

				// tags
				var itemTags = item.tags;
				var itemTags_clean = itemTags;

				// create the existing tags
				domConstruct.create("div", { class: "existing-tags" }, query(".tag-container")[0], "first");
				styleTags(itemTags, query(".existing-tags")[0]);

				// create the Living Atlas checkboxes/categories
				array.forEach(defaults.ATLAS_TAGS, function (atlasTag) {
					domConstruct.place("<div><input id='" + atlasTag.id + selectedRowID + "' /> " + atlasTag.tag + "</div>", dom.byId("tagCategories"), "last");
					addCheckbox(itemTags, atlasTag.id + selectedRowID, atlasTag.tag);
				});

				// tags store
				tagStore = new Memory({
					idProperty: 'tag',
					data: [].concat(itemTags)
				});

				on(editSaveBtnNode, "click", function () {
					if (editSaveBtnNode.innerHTML === " EDIT ") {
						// EDIT mode
						updateEditSaveButton(editSaveBtnNode, " SAVE ", cancelBtnNode, "block");

						// remove non-editing tag nodes
						domConstruct.empty(query(".existing-tags")[0]);

						// enable living atlas checkboxes
						toggleCheckboxes(checkBoxID_values, "disabled", false);

						if (dijit.byId("tag-widget")) {
							// destroy the Tags Dijit if it exists
							itemTags_clean = tagsDijit.values;
							dijit.byId("tag-widget").destroy();
							//domConstruct.create("div", { id:"tag-widget" }, query(".tag-container")[0], "first");
						} else {
							if (tagsDijit !== undefined) {
								tagStore = new Memory({
									idProperty: 'tag',
									data: [].concat(itemTags_clean)
								});
							}
						}
						tagsDijit = new Tags({
							placeholder: 'Add tag(s)',
							noDataMsg: 'No results found.',
							matchParam: 'all',
							idProperty: 'tag',
							gridId: 'grid1',
							filterId: 'filter1',
							minWidth: '300px',
							maxWidth: '400px',
							store: tagStore
						}, "tag-widget");
						// prepopulate the widget with values from the list
						tagsDijit.prepopulate(tagStore.data);

						on(tagsDijit._inputTextBox, "keyup", function (evt) {
							newTag = "";
							if (keys.ENTER === evt.keyCode) {
								newTag = tagsDijit.values[tagsDijit.values.length - 1];

								array.forEach(defaults.ATLAS_TAGS, function (atlasTag) {
									if (atlasTag.tag.toUpperCase() === newTag.toUpperCase()) {
										var widgetId = atlasTag.id + selectedRowID;
										dijit.byId(widgetId).setAttribute("checked", true);
									}
								});
							}
						});

						on(query(".select2-search-choice-close"), "click", function (evt) {
							var removeTag = evt.target.parentNode.title;
							array.forEach(defaults.ATLAS_TAGS, function (atlasTag) {
								if (atlasTag.tag.toUpperCase() === removeTag.toUpperCase()) {
									var widgetId = atlasTag.id + selectedRowID;
									dijit.byId(widgetId).setAttribute("checked", false);
								}
							});
						});
					} else {
						// SAVE mode
						var _userItemUrl = item.userItemUrl;
						array.forEach(defaults.ATLAS_TAGS, function (atlasTag) {
							if (newTag !== undefined) {
								if (atlasTag.tag.toUpperCase() === newTag.toUpperCase()) {
									var widgetId = atlasTag.id + selectedRowID;
									dijit.byId(widgetId).setAttribute("checked", true);
								}
							}
						});

						esriRequest({
							url: _userItemUrl + "/update",
							content: {
								f: "json",
								tags: "" + tagsDijit.values
							}
						}, {
							usePost: true
						}).then(function (response) {
									if (response.success) {
										if (dijit.byId("tag-widget")) {
											itemTags_clean = tagsDijit.values;
											domConstruct.create("div", {
												class: "existing-tags"
											}, query(".tag-container")[0], "first");
											tagsDijit.addStyledTags(tagsDijit.values, query(".existing-tags")[0]);

											dijit.byId("tag-widget").destroy();
											domConstruct.create("div", {
												id: "tag-widget"
											}, query(".tag-container")[0], "first");
										}
										// disable living atlas checkboxes
										toggleCheckboxes(checkBoxID_values, "disabled", true);
										updateEditSaveButton(editSaveBtnNode, " EDIT ", cancelBtnNode, "none");
									} else {
										console.log("ERROR");
									}
								});
					}
				});

				on(cancelBtnNode, "click", function () {
					newTag = "";
					if (dijit.byId("tag-widget")) {
						domConstruct.create("div", {
							class: "existing-tags"
						}, query(".tag-container")[0], "first");
						tagsDijit.addStyledTags(itemTags_clean, query(".existing-tags")[0]);

						dijit.byId("tag-widget").destroy();
						domConstruct.create("div", {
							id: "tag-widget"
						}, query(".tag-container")[0], "first");

						tagStore = new Memory({
							idProperty: 'tag',
							data: [].concat(itemTags_clean)
						});
					}
					// disable living atlas checkboxes
					toggleCheckboxes(checkBoxID_values, "disabled", true);
					updateEditSaveButton(editSaveBtnNode, " EDIT ", cancelBtnNode, "none");
				});
			});
		}

		function performanceContentPane(item, popUps, mapDrawTime, layers) {
			// load the content
			loadContent(performanceConfig.PERFORMANCE_CONTENT);

			// tooltip nodes
			var mapLayersTooltipNode = query(".map-layers-tooltip")[0],
					sharingNode = query(".sharing-tooltip")[0],
					drawTimeTooltipNode = query(".draw-time-tooltip")[0],
					popupsTooltipNode = query(".popups-tooltip")[0];

			var mdt = parseInt(processMapDrawTime(mapDrawTime));
			if (mdt < defaults.drawTime.BEST) {
				domStyle.set(query(".performance-text-very-slow")[0], "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(query(".performance-text-slow")[0], "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(query(".performance-text-good")[0], "color", "#005E95");
			} else if (mdt < defaults.drawTime.BETTER) {
				domStyle.set(query(".performance-text-very-slow")[0], "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(query(".performance-text-slow")[0], "color", "#005E95");
				domStyle.set(query(".performance-text-good")[0], "color", "rgba(0, 122, 194, 0.24)");
			} else if (mdt < defaults.drawTime.GOOD) {
				domStyle.set(query(".performance-text-very-slow")[0], "color", "#005E95");
				domStyle.set(query(".performance-text-slow")[0], "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(query(".performance-text-good")[0], "color", "rgba(0, 122, 194, 0.24)");
			}

			createTooltip(mapLayersTooltipNode, tooltipsConfig.PERFORMANCE_MAP_LAYERS_TOOLTIP_CONTENT);
			createTooltip(sharingNode, tooltipsConfig.PERFORMANCE_SHARING_TOOLTIP_CONTENT);
			createTooltip(drawTimeTooltipNode, tooltipsConfig.PERFORMANCE_DRAW_TIME_TOOLTIP_CONTENT);
			createTooltip(popupsTooltipNode, tooltipsConfig.PERFORMANCE_POP_UPS_TOOLTIP_CONTENT);

			/*if (layers !== undefined && layers.length < 1) {
			 domConstruct.create("div", {
			 innerHTML: "No available layers",
			 style: {
			 "margin-left": "5px",
			 "paddingLeft": "0px"
			 }
			 }, "layers-list", "first");
			 } else {
			 var ul = domConstruct.create("ul", {
			 style: {
			 "margin-left": "5px",
			 "paddingLeft": "0px"
			 }
			 }, "layers-list", "first");
			 array.forEach(layers, function (layer) {
			 domConstruct.create("li", {
			 innerHTML: layer.title,
			 style: {
			 "list-style-type": "none"
			 }
			 }, ul);
			 });
			 }*/
		}

		function loadProfileContentPane(selectedRowID, _userNameID, _userDescriptionID) {
			portalUser.getItem(selectedRowID).then(function (item) {
				// item full name
				var _userFullName = validateStr(item.portal.getPortalUser().fullName);
				var _userFullName_clean = _userFullName;
				// item user description
				var _userDescription = validateStr(item.portal.getPortalUser().description);
				var _userDescription_clean = _userDescription;
				// item user thumbnail
				var _userThumbnailUrl = item.portal.getPortalUser().thumbnailUrl;
				var _userThumbnailUrl_clean = _userThumbnailUrl;

				// load the content
				loadContent(profileConfig.PROFILE_CONTENT);

				// nodes
				var editSaveBtnNode = query(".edit-save-btn")[0],
						cancelBtnNode = query(".cancel-btn")[0],
						profileThumbnailNode = query(".profileThumbnailUrl")[0],
						profileUserFullNameNode = query(".name-textbox")[0],
						profileUserDescriptionNode = query(".user-description-textbox")[0],
						profileThumbnailTooltipNode = query(".profile-thumbnail-tooltip")[0],
						profileFullNameTooltipNode = query(".user-full-name-tooltip")[0],
						profileDescriptionTooltipNode = query(".user-description-tooltip")[0],
						userNameScoreNodeContainer = query(".profile-name-score-gr")[0],
						userNameScoreNumeratorNode = query(".profile-name-score-num")[0],
						userNameScoreDenominatorNode = query(".profile-name-score-denom")[0],
						profileThumbnailListener;

				// set the thumbnail
				domAttr.set(profileThumbnailNode, "src", _userThumbnailUrl);
				// set the user full name
				domAttr.set(profileUserFullNameNode, "id", _userNameID);
				domConstruct.create("div", { innerHTML: _userFullName }, profileUserFullNameNode, "first");
				// set the user description
				domAttr.set(profileUserDescriptionNode, "id", _userDescriptionID);
				domConstruct.create("div", { innerHTML: _userDescription }, profileUserDescriptionNode, "first");

				// tooltips
				createTooltip(profileThumbnailTooltipNode, tooltipsConfig.USER_PROFILE_THUMBNAIL_TOOLTIP_CONTENT);
				createTooltip(profileFullNameTooltipNode, tooltipsConfig.USER_PROFILE_FULL_NAME_TOOLTIP_CONTENT);
				createTooltip(profileDescriptionTooltipNode, tooltipsConfig.USER_PROFILE_DESCRIPTION_TOOLTIP_CONTENT);

				userNameScoreDenominatorNode.innerHTML = scoring.SECTION_MAX;
				validateTextInput(_userFullName, userNameScoreNodeContainer, userNameScoreNumeratorNode, scoring.USER_NAME_MIN_NUM_WORDS, scoring.USER_NAME_CONTENT);

				on(editSaveBtnNode, "click", function () {
					if (editSaveBtnNode.innerHTML === " EDIT ") {
						// "EDIT" clicked
						// update EDIT/SAVE button
						updateEditSaveButton(editSaveBtnNode, " SAVE ", cancelBtnNode, "block");
						domStyle.set(query(".expanded-item-thumbnail")[0], "cursor", "pointer");

						// update user full name
						domConstruct.empty(profileUserFullNameNode);
						domConstruct.create("input", { class: "edit-user-full-name", value: _userFullName }, profileUserFullNameNode, "first");
						domAttr.set(profileUserFullNameNode, "data-dojo-type", "dijit/form/TextBox");
						domAttr.set(profileUserFullNameNode, "id", _userNameID);

						// update user description
						domConstruct.empty(profileUserDescriptionNode);
						domConstruct.create("input", { class: "edit-user-description", value: _userDescription }, profileUserDescriptionNode, "first");
						domAttr.set(profileUserDescriptionNode, "data-dojo-type", "dijit/form/TextBox");
						domAttr.set(profileUserDescriptionNode, "id", _userDescriptionID);

						domStyle.set(query(".edit-profile-thumbnail-msg")[0], "display", "block");

						// update user thumbnail
						profileThumbnailListener = on(query(".profileThumbnailUrl"), "click", lang.hitch(this, function (event) {
							portalUser.getItem(selectedRowID).then(lang.hitch(this, function (userItem) {
								uploadUserProfileThumbnail(userItem, "PROFILE").then(lang.hitch(this, function (userItem) {
									console.log("DONE")
								}));
							}));
						}));
					} else {
						// "SAVE" clicked
						profileThumbnailListener.remove();
						_userFullName = query(".edit-user-full-name")[0].value;
						_userDescription = query(".edit-user-description")[0].value;

						domStyle.set(query(".edit-profile-thumbnail-msg")[0], "display", "none");
						domStyle.set(query(".expanded-item-thumbnail")[0], "cursor", "inherit");

						portalUser.getItem(selectedRowID).then(function (results) {
							//var _portalUrl = results.portal.portalUrl;
							//var _community = "community/users/";
							//var _portalUser = results.owner;
							esriRequest({
								url: "https://www.arcgis.com/sharing/rest/community/users/" + results.owner + "/update",
								content: {
									f: "json",
									fullname: _userFullName,
									description: _userDescription
								}
							}, {
								usePost: true
							}).then(function (response) {
										if (response.success) {
											domConstruct.empty(profileUserFullNameNode);
											domConstruct.create("div", { innerHTML: _userFullName }, profileUserFullNameNode, "first");
											domAttr.remove(profileUserFullNameNode, "data-dojo-type");
											domAttr.set(profileUserFullNameNode, "id", _userNameID);

											domConstruct.empty(profileUserDescriptionNode);
											domConstruct.create("div", { innerHTML: _userDescription }, profileUserDescriptionNode, "first");
											domAttr.remove(profileUserDescriptionNode, "data-dojo-type");
											domAttr.set(profileUserDescriptionNode, "id", _userDescriptionID);

											_userFullName_clean = _userFullName;
											_userDescription_clean = _userDescription;

											updateEditSaveButton(editSaveBtnNode, " EDIT ", cancelBtnNode, "none");
											validateTextInput(_userFullName_clean, userNameScoreNodeContainer, userNameScoreNumeratorNode, scoring.USER_NAME_MIN_NUM_WORDS, scoring.USER_NAME_CONTENT);
										} else {
											console.log("Profile not updated");
										}
									});
						});
					}
				});

				on(cancelBtnNode, "click", function () {
					profileThumbnailListener.remove();
					domStyle.set(query(".expanded-item-thumbnail")[0], "cursor", "inherit");

					domStyle.set(query(".edit-profile-thumbnail-msg")[0], "display", "none");
					domConstruct.empty(profileUserFullNameNode);
					domConstruct.create("div", { innerHTML: _userFullName_clean }, profileUserFullNameNode, "first");
					domAttr.remove(profileUserFullNameNode, "data-dojo-type");
					domAttr.set(profileUserFullNameNode, "id", _userNameID);

					domConstruct.empty(profileUserDescriptionNode);
					domConstruct.create("div", { innerHTML: _userDescription_clean }, profileUserDescriptionNode, "first");
					domAttr.remove(profileUserDescriptionNode, "data-dojo-type");
					domAttr.set(profileUserDescriptionNode, "id", _userDescriptionID);
					domAttr.set(editSaveBtnNode, "innerHTML", " EDIT ");
					domStyle.set(cancelBtnNode, "display", "none");

					validateTextInput(_userFullName_clean, userNameScoreNodeContainer, userNameScoreNumeratorNode, scoring.USER_NAME_MIN_NUM_WORDS, scoring.USER_NAME_CONTENT);
				});
			});
		}


		function countWords(s) {
			// exclude white space
			s = s.replace(/(^\s*)|(\s*$)/gi, "");
			s = s.replace(/[ ]{2,}/gi, " ");
			// exclude newline with a space at beginning
			s = s.replace(/\n /, "\n");
			return s.split(" ").length;
		}

		function validateTextInput(inputText, containerNode, numeratorNode, minChars, prohibitedWords) {
			if (validateNumWords(inputText, minChars)) {
				validateContent(inputText, prohibitedWords, containerNode, numeratorNode);
			} else {
				numeratorNode.innerHTML = scoring.SECTION_MIN;
				domClass.replace(containerNode, "score-graphic-fail", "score-graphic-pass");
			}
		}

		function validateNumWords(score, numWordRequired) {
			var strippedString = score.replace(/(<([^>]+)>)/ig,"");
			var nWords = 0;
			if (strippedString.length > 0) {
				nWords = countWords(strippedString);
			}
			if (nWords < numWordRequired) {
				return false;
			} else {
				return true;
			}
		}

		function validateContent(inputValue, searchValues, nodeContainer, numeratorNode) {
			if (array.some(searchValues, function (searchValue) {
				return parseInt(inputValue.search(searchValue)) >= 0;
			})) {
				// yes
				numeratorNode.innerHTML = scoring.SECTION_PASSING;
				domClass.replace(nodeContainer, "score-graphic-pass", "score-graphic-fail");
			} else {
				// no
				numeratorNode.innerHTML = scoring.SECTION_MAX;
				domClass.replace(nodeContainer, "score-graphic-pass", "score-graphic-fail");
			}
		}

		function styleTags(tags, srcNodeRef) {
			domClass.add(dom.byId(srcNodeRef), 'select2-container select2-container-multi');
			var list = domConstruct.create('ul', null, dom.byId(srcNodeRef));
			// add style to the list of tags
			domClass.add(list, 'select2-choices');
			domStyle.set(list, 'border', 'none');
			array.forEach(tags, function (item, i) {
				var listItemNode = domConstruct.create('li', null, list);
				domStyle.set(listItemNode, 'padding', '3px 5px 3px 5px');
				// add style to new tag
				domClass.add(listItemNode, 'select2-search-resultSet');
				var listItemDivNode = domConstruct.create('div', {
					title: item
				}, listItemNode);
				html.set(listItemDivNode, item);
			});
		}

		function loadContent(content) {
			domConstruct.destroy("section-content");
			var node = query(".content-container")[0];
			domConstruct.place(content, node, "last");
		}

		function createTooltip(node, content) {
			var userDescriptionTooltip = new Tooltip({
				connectId: [node],
				style: {
					width: "10px"
				},
				label: content
			});
		}

		function uploadItemThumbnail(item, imageSizeName) {
			var deferred = new Deferred();
			var previewDlg = new Dialog({
				title: item.title,
				className: "upload-thumbnail-dialog"
			});
			previewDlg.show();
			// update thumbnail dialog
			/*var previewDlg = new Dialog({
			 id:"update-thumbnail-dialog",
			 title: item.title,
			 content:"<div class='container thumbnail-dialog'>" +
			 "	<div class='row thumbnail-dialog-row'>" +
			 "		<div class='column-24'>" +
			 "			<div>Specify the image to use as the thumbnail.<\/div>" +
			 "		<\/div>" +
			 "	<\/div>" +
			 "	<div class='row thumbnail-dialog-row'>" +
			 "		<div class='column-4'>" +
			 "			<div>Image: <\/div>" +
			 "		<\/div>" +
			 "		<div class='column-20'>" +
			 "			<input id='thumbnail-file-updload-btn' name='myFile' type='file'>" +
			 "		<\/div>" +
			 "	<\/div>" +
			 "	<div class='row thumbnail-dialog-row'>" +
			 "		<div class='column-24'>" +
			 "			<div>For best results, the image should be 200 pixels wide by 133 pixels high. Other sizes will be adjusted to fit. Acceptable image formats are: PNG, GIF and JPEG.<\/div>" +
			 "		<\/div>" +
			 "	<\/div>" +
			 "	<div class='row thumbnail-dialog-row'>" +
			 "		<div class='column-6 right'>" +
			 "			<button class='btn cancel-thumbnail-dialog-btn'> Cancel <\/button>" +
			 "		<\/div>" +
			 "		<div class='column-4 right'>" +
			 "			<button class='btn ok-thumbnail-dialog-btn'> OK <\/button>" +
			 "		<\/div>" +
			 "	<\/div>" +
			 "<\/div>",
			 style:"width: 450px"
			 });
			 previewDlg.show();*/

			var dialogContent = put(previewDlg.containerNode, "div.dijitDialogPaneContentArea");
			var actionBar = put(previewDlg.containerNode, "div.dijitDialogPaneActionBar");
			var uploadThumbBtn = new Button({
				label: "Upload Thumbnail"
			}, put(actionBar, "div"));
			domClass.add(uploadThumbBtn.domNode, "dijitHidden");
			var cancelBtn = new Button({
				label: "Cancel",
				onClick: lang.hitch(previewDlg, previewDlg.hide)
			}, put(actionBar, "div"));
			var msgPane = put(dialogContent, "div.msgPane", "Upload alternate image:");
			var form = put(dialogContent, "form", {
				"method": "post",
				"enctype": "multipart/form-data"
			});
			var fileInput = put(form, "input", {
				type: "file",
				name: (imageSizeName === "LARGE") ? "largeThumbnail" : "thumbnail"
			});

			on(fileInput, "change", lang.hitch(this, function (evt) {
				var imgFile = fileInput.files[0];
				// The FileReader object lets web applications asynchronously read the contents of files (or raw data
				// buffers) stored on the user's computer, using File or Blob objects to specify the file or data to read.
				var reader = new FileReader();
				// Starts reading the contents of the specified Blob, once finished, the result attribute contains a
				// data: URL representing the file's data.
				reader.readAsDataURL(imgFile);
				// A handler for the load event. This event is triggered each time the reading operation is successfully
				// completed.
				reader.onload = function (_file) {
					domClass.add(fileInput, "dijitHidden");
					var imgNode = put(dialogContent, "img");
					imgNode.onload = function () {
						msgPane.innerHTML = "Valid file selected";
						put(dialogContent, "div.imageSizeLabel", lang.replace("Image size: {0}px by {1}px", [this.width, this.height]));
						if ((this.width === imageSizes[imageSizeName][0]) && (this.height === imageSizes[imageSizeName][1])) {
							domClass.remove(uploadThumbBtn.domNode, "dijitHidden");
							// upload button selected
							uploadThumbBtn.on("click", lang.hitch(this, function (evt) {
								domClass.add(uploadThumbBtn.domNode, "dijitHidden");
								updateItemThumbnail(item, form).then(lang.hitch(this, function (evt) {
									portalUser.getItem(item.id).then(lang.hitch(this, function (userItem) {
										// If the store is updated the dGrid is refreshed and the expanded content is lost
										itemStore.put(userItem);
										domAttr.set(query(".item-thumbnail-" + selectedRowID)[0], "src", userItem.thumbnailUrl);
										domAttr.set(query(".expanded-item-thumbnail-" + selectedRowID)[0], "src", userItem.thumbnailUrl);
										updatedItems[imageSizeName].push(item.id);
										msgPane.innerHTML = "Item updated with thumbnail";
										previewDlg.hide();
									}), lang.hitch(this, function (error) {
										console.warn(error);
										msgPane.innerHTML = error.message;
									}));
								}), lang.hitch(this, function (error) {
									console.warn(error);
									msgPane.innerHTML = error.message;
								}));
							}));
						} else {
							msgPane.innerHTML = lang.replace("Invalid image size; it must be {0}px by {1}px", imageSizes[imageSizeName]);
							//domClass.remove(fileInput, "dijitHidden");
						}
					};
					imgNode.src = _file.target.result;
				};
			}));
			return deferred.promise;
		}

		function uploadUserProfileThumbnail(item, imageSizeName) {
			var deferred = new Deferred();
			var previewDlg = new Dialog({
				title: item.title,
				className: "upload-thumbnail-dialog"
			});
			previewDlg.show();
			var dialogContent = put(previewDlg.containerNode, "div.dijitDialogPaneContentArea");
			var actionBar = put(previewDlg.containerNode, "div.dijitDialogPaneActionBar");
			var uploadThumbBtn = new Button({
				label: "Upload Thumbnail"
			}, put(actionBar, "div"));
			domClass.add(uploadThumbBtn.domNode, "dijitHidden");
			var cancelBtn = new Button({
				label: "Cancel",
				onClick: lang.hitch(previewDlg, previewDlg.hide)
			}, put(actionBar, "div"));
			var msgPane = put(dialogContent, "div.msgPane", "Upload alternate image:");
			var form = put(dialogContent, "form", {
				"method": "post",
				"enctype": "multipart/form-data"
			});
			var fileInput = put(form, "input", {
				type: "file",
				name: (imageSizeName === "LARGE") ? "largeThumbnail" : "thumbnail"
			});

			on(fileInput, "change", lang.hitch(this, function (evt) {
				var imgFile = fileInput.files[0];
				// The FileReader object lets web applications asynchronously read the contents of files (or raw data
				// buffers) stored on the user's computer, using File or Blob objects to specify the file or data to read.
				var reader = new FileReader();
				// Starts reading the contents of the specified Blob, once finished, the result attribute contains a
				// data: URL representing the file's data.
				reader.readAsDataURL(imgFile);
				// A handler for the load event. This event is triggered each time the reading operation is successfully
				// completed.
				reader.onload = function (_file) {
					domClass.add(fileInput, "dijitHidden");
					var imgNode = put(dialogContent, "img");
					imgNode.onload = function () {
						msgPane.innerHTML = "Valid file selected";
						put(dialogContent, "div.imageSizeLabel", lang.replace("Image size: {0}px by {1}px", [this.width, this.height]));
						if ((this.width === imageSizes[imageSizeName][0]) && (this.height === imageSizes[imageSizeName][1])) {
							domClass.remove(uploadThumbBtn.domNode, "dijitHidden");
							// upload button selected
							uploadThumbBtn.on("click", lang.hitch(this, function (evt) {
								domClass.add(uploadThumbBtn.domNode, "dijitHidden");
								updateUserProfileThumbnail(item, form).then(lang.hitch(this, function (evt) {
									previewDlg.hide();
								}), lang.hitch(this, function (error) {
									console.warn(error);
									msgPane.innerHTML = error.message;
								})).then(lang.hitch(this, function (evt) {

								}));
							}));
						} else {
							msgPane.innerHTML = lang.replace("Invalid image size; it must be {0}px by {1}px", imageSizes[imageSizeName]);
							//domClass.remove(fileInput, "dijitHidden");
						}
					};
					imgNode.src = _file.target.result;
				};
			}));
			return deferred.promise;
		}

		function updateItemThumbnail(userItem, form) {
			// Item
			// http://www.arcgis.com/sharing/rest/content/users/cmahlke/items/b95a9fb4dec5443f9e0ea0fcb4859c67/update
			// profile
			// https://www.arcgis.com/sharing/rest/community/users/cmahlke/update

			//console.log(lang.replace("{userItemUrl}/update", userItem));
			//console.log(lang.replace("{userContentUrl}/update", userItem));

			var deferred = new Deferred();
			// http://www.arcgis.com/sharing/rest/content/users/cmahlke/a5662275444c446a92ab2dc3ef131ab3/items/b19c8ecd6b4c4bc8b704c4381950a437/update
			// http://www.arcgis.com/sharing/rest/content/users/cmahlke/items/b95a9fb4dec5443f9e0ea0fcb4859c67/update
			// https://www.arcgis.com/sharing/rest/community/users/cmahlke/update
			// UPDATE LARGE THUMBNAIL //
			esriRequest({
				url: lang.replace("{userItemUrl}/update", userItem),
				form: form,
				content: {
					f: "json"
				},
				handleAs: "json"
			}).then(deferred.resolve, deferred.reject);
			return deferred.promise;
		}

		function updateUserProfileThumbnail(userItem, form) {
			// Item
			// http://www.arcgis.com/sharing/rest/content/users/cmahlke/items/b95a9fb4dec5443f9e0ea0fcb4859c67/update
			// profile
			// https://www.arcgis.com/sharing/rest/community/users/cmahlke/update
			console.log(lang.replace("{url}/update", portalUser));

			var deferred = new Deferred();
			// http://www.arcgis.com/sharing/rest/content/users/cmahlke/a5662275444c446a92ab2dc3ef131ab3/items/b19c8ecd6b4c4bc8b704c4381950a437/update
			// http://www.arcgis.com/sharing/rest/content/users/cmahlke/items/b95a9fb4dec5443f9e0ea0fcb4859c67/update
			// https://www.arcgis.com/sharing/rest/community/users/cmahlke/update
			// UPDATE LARGE THUMBNAIL //
			esriRequest({
				//url: lang.replace("{userItemUrl}/update", userItem),
				url: lang.replace("{url}/update", portalUser),
				form: form,
				content: {
					f: "json"
				},
				handleAs: "json"
			}).then(deferred.resolve, deferred.reject);
			return deferred.promise;
		}

		function applySort(value) {
			if (value === "title") {
				dgrid.set("sort", value, false);
			} else if (value === "type") {
				dgrid.set("sort", value, false);
				dgrid.set('sort', [
					{ attribute: value, descending: false },
					{ attribute: "title", descending: false }
				]);
			} else if (value === "numViews") {
				dgrid.set("sort", value, true);
			} else if (value === "modified") {
				dgrid.set("sort", value, true);
			} else if (value === "status") {
				//dgrid.set("sort", value, true);
			} else if (value === "access") {
				dgrid.set("sort", value, false);
			} else {
				dgrid.set("sort", value);
			}
		}

		function applyFilter(value) {
			var params = {};
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

			portal.queryItems(params).then(function (result) {
				itemStore.data = result.results;
				dgrid.refresh();
			});
		}

		function destroyNodes(categoryNodes) {
			//
			if (dijit.byId("access-constraints-editor")) {
				dijit.byId("access-constraints-editor").destroy();
			}
			if (dijit.byId("description-editor")) {
				dijit.byId("description-editor").destroy();
			}

			if (dijit.byId("update-thumbnail-dialog")) {
				dijit.byId("update-thumbnail-dialog").destroy();
			}

			//if (dijit.byId("overall-score-graphic")) {
			//	dijit.byId("overall-score-graphic").destroy();
			//}
			if (dijit.byId(TAB_CONTAINER_LICENSE + previousSelectedRowID))
				dijit.byId(TAB_CONTAINER_LICENSE + previousSelectedRowID).destroy();
			if (dijit.byId(TAB_CONTAINER_DESC + previousSelectedRowID))
				dijit.byId(TAB_CONTAINER_DESC + previousSelectedRowID).destroy();
			domConstruct.destroy(query(".additional-tags")[0]);
			array.forEach(categoryNodes, function (category) {
				if (dijit.byId(category))
					dijit.byId(category).destroy();
			});
		}

		function updateHeader() {
			// homepage header message
			signInNode.innerHTML = "";
			//var headerRow = query(".intro").closest(".column-24");
			//domClass.replace(headerRow[0], "column-19", "column-24");
			domStyle.set(searchInputNode, "display", "block");
			domStyle.set(dropdownSortNode, "display", "block");
			domStyle.set(dropdownItemFilterNode, "display", "block");
			domStyle.set(helpButtonNode, "display", "block");

			var signInRow = query(".sign-in-row")[0];
			domStyle.set(signInRow, "display", "none");
			var gridPanel = dom.byId("dgrid");
			domStyle.set(gridPanel, "display", "block");
		}

		function updateEditSaveButton(_editSaveBtnNode, _label, _cancelBtnNode, _display) {
			domAttr.set(_editSaveBtnNode, "innerHTML", _label);
			domStyle.set(_cancelBtnNode, "display", _display);
		}

		function updateNodeHeight(node, height) {
			domStyle.set(node, "height", height + "px");
		}

		function createContentButtonGroup(id) {
			domConstruct.place(
					'<div class="row btn-group-container">' +
							'	<div class="btn-group column-24 icon-edit-btn-group">' +
							'		<a class="active column-4 details icon-edit"> ' + defaults.DETAILS + '</a>' +
							'		<a class="column-4 credits icon-check"> ' + defaults.USE_CREDITS + '</a>' +
							'		<a class="column-4 tags icon-edit"> ' + defaults.TAGS + '</a>' +
							'		<a class="column-4 performance icon-edit"> ' + defaults.PERFORMANCE + '</a>' +
							'		<a class="column-4 profile icon-edit"> ' + defaults.MY_PROFILE + '</a>' +
							'	</div>' +
							'</div>', id, "last");

			detailsNode = query(".details")[0];
			creditsNode = query(".credits")[0];
			tagsNode = query(".tags")[0];
			performanceNode = query(".performance")[0];
			profileNode = query(".profile")[0];
			nodeList = [detailsNode, creditsNode, tagsNode, performanceNode, profileNode];
		}

		function addCheckbox(itemTags, id, atlasTag) {
			var checkBox;
			if (array.some(itemTags, function (tag) {
				return tag.toUpperCase() === atlasTag.toUpperCase();
			})) {
				// Check = TRUE
				checkBox = new CheckBox({
					name: "checkBox",
					disabled: true,
					value: atlasTag,
					checked: true,
					onChange: function (b) {
						if (this.checked) {
							tagStore.data.push(this.get("value"));
							tagsDijit.clearTags();
							tagsDijit.prepopulate(tagStore.data);
						} else {
							var position = array.indexOf(tagStore.data, this.value);
							tagStore.data.splice(position, 1);
							tagsDijit.clearTags();
							tagsDijit.prepopulate(tagStore.data);
						}
					}
				}, id).startup();
			} else {
				// Check = FALSE
				checkBox = new CheckBox({
					name: "checkBox",
					disabled: true,
					value: atlasTag,
					checked: false,
					onChange: function (b) {
						if (this.checked) {
							tagStore.data.push(this.get("value"));
							tagsDijit.clearTags();
							tagsDijit.prepopulate(tagStore.data);
						} else {
							var position = array.indexOf(tagStore.data, this.value);
							tagStore.data.splice(position, 1);
							tagsDijit.clearTags();
							tagsDijit.prepopulate(tagStore.data);
						}
					}
				}, id).startup();
			}
			checkBoxID_values.push(id);
		}

		function toggleCheckboxes(checkBoxID_values, attr, value) {
			// enable/disable living atlas checkboxes
			array.forEach((checkBoxID_values), function (id) {
				dijit.byId(id).setAttribute(attr, value);
			});
		}

		function validateStr(str) {
			if (str === null || "") {
				return "";
			} else {
				return str;
			}
		}

		function validateItemTitle(str) {
			if (str === null || "") {
				score = score - 10;
				return "";
			} else {
				score = score + 10;
				return str;
			}
		}

		function formatDate(date) {
			var d = new Date(date);
			var month = defaults.MONTHS[d.getMonth()];
			if (d.isNaN) {
				return "";
			} else {
				return month + " " + d.getDate() + ", " + d.getFullYear();
			}
		}

		function formatThumbnailUrl(obj) {
			var thumbnailUrl = "";
			if (obj.largeThumbnail !== null) {
				thumbnailUrl = obj.largeThumbnail;
			} else if (obj.thumbnailUrl !== null) {
				thumbnailUrl = obj.thumbnailUrl;
			} else {
				thumbnailUrl = location.protocol + "//" + location.hostname + location.pathname + "assets/images/nullThumbnail.png";
			}
			return thumbnailUrl;
		}

		function processSharing(item) {
			return item.access
		}

		function processMapDrawTime(val) {
			var temp = (val / 1000) % 60;
			var seconds = number.format(temp, {
				places: 5
			});
			if (seconds) {
				return seconds + " seconds";
			} else {
				return "N/A";
			}
		}

		function processPopupData(map) {
			if (map.popupManager.enabled) {
				return "Popups are enabled"
			} else {
				return "Popups are disabled"
			}
		}

		function fadeLoader() {
			var loaderNode = dom.byId("map-mask");
			domStyle.set(loaderNode, "opacity", "1");
			var fadeArgs = {
				node: "map-mask",
				duration: 1000
			};
			fx.fadeOut(fadeArgs).play();
		}

		function fadeInSectionContent() {
			var section = dom.byId("section-content");
			fx.animateProperty({
				node: section,
				properties: {
					opacity: {
						start: 0,
						end: 1
					}
				},
				duration: 500
			}).play();
		}
	});
});
