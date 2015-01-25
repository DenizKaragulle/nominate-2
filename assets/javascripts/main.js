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

	var progressBarNode = "";
	var categoryNodes = [];
	// div dimensions
	var COLLAPSE_ROW_HEIGHT = 125;
	var EXPAND_ROW_HEIGHT = 900;
	// element id/name
	var SIGNIN_BUTTON_ID = "sign-in";
	var EXPANDED_ROW_NAME = "expanded-row-";
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
	var portalUserThumbnailUrl = "";

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
	// Overall score
	//
	var currentOverallScoreNode;
	// graphic
	var overallScoreGraphic;
	// overall score
	var overAllCurrentScore = 0;
	// SECTION SCORES
	var MAX_SCORE = 0;
	// Item Details
	var ITEM_DETAILS_MAX_SCORE = 0,
			ITEM_THUMBNAIL_MAX_SCORE = 0,
			ITEM_TITLE_MAX_SCORE = 0,
			ITEM_SUMMARY_MAX_SCORE = 0,
			ITEM_DESC_MAX_SCORE = 0;
	// Use/Constraints
	var ITEM_USE_CONSTRAINS_MAX_SCORE = 0,
			ITEM_CREDIT_MAX_SCORE = 0,
			ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE = 0;
	// Tags
	var TAGS_MAX_SCORE = 0;
	// Performance
	var PERFORMANCE_MAX_SCORE = 0,
			PERFORMANCE_SHARING_MAX_SCORE = 0,
			PERFORMANCE_POPUPS_MAX_SCORE = 0,
			PERFORMANCE_DRAW_TIME_MAX_SCORE = 0,
			PERFORMANCE_LAYER_COUNT_MAX_SCORE = 0;
	// User Profile
	var USER_PROFILE_MAX_SCORE = 0,
			USER_PROFILE_THUMBNAIL = 0,
			USER_PROFILE_FULLNAME = 0,
			USER_PROFILE_DESCRIPTION = 0;

	var itemDetailsScore = 0;
	var itemThumbnailScore = 0;
	var itemTitleScore = 0;
	var itemSummaryScore = 0;
	var itemDescriptionScore = 0;
	// Use and Constraints
	var creditsAndAccessScore = 0;
	var itemCreditsScore = 0;
	var itemAccessAndUseConstraintsScore = 0;
	// Tags
	var itemTagsScore = 0;
	// Performance
	var performanceScore = 0;
	var mapDrawTimeScore = 0;
	var nLayersScore = 0;
	var popupsScore = 0;
	var sharingScore = 0;
	// User Profile
	var userProfileScore = 0;
	var userThumbnailScore = 0;
	var userNameScore = 0;
	var userDescriptionScore = 0;
	//
	var checkBoxID_values = [];
	var tagStore;
	var tagsDijit;
	var newTag;
	//
	var HAS_PERFORMANCE_CONTENT = false;

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
					console.log("CALLING detailsContentPane");
					domClass.replace(node, "column-4", "active column-4");
					detailsContentPane(selectedRowID, _titleID, _snippetID, _descID);
				}
			});
			domClass.replace(_detailsNode, "active column-4 details-tab-node", "column-4 details-tab-node");
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
					console.log("CALLING tagsContentPane");
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
					performanceContentPane(_item, popupsScore, _mapDrawTime, _layers);
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
				portalUserThumbnailUrl = portalUser.thumbnailUrl;
				if (portalUserThumbnailUrl === null) {
					portalUserThumbnailUrl = "https://cdn.arcgis.com/cdn/5777/js/arcgisonline/css/images/no-user-thumb.jpg";
				}

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

						// set the maximum score values for each section and overall max score
						initScoreMaxValues();

						// item title click handler
						on(dgrid.domNode, ".item-title:click", function (event) {
							// selected row
							selectedRow = dgrid.row(event).element;
							console.log("selectedRow: " + selectedRow);
							// selected row ID
							selectedRowID = domAttr.get(selectedRow, "id").split("dgrid-row-")[1];
							// get row width
							var selectedNodeWidth = domStyle.get(selectedRow, "width") - 10;
							// set row height
							domStyle.set(selectedRow, "height", "600px");

							if (previousSelectedRow) {
								// collapse the previously selected row height
								updateNodeHeight(previousSelectedRow, COLLAPSE_ROW_HEIGHT);
								categoryNodes = [];
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

								portalUser.getItem(selectedRowID).then(function (item) {
									domConstruct.place(
											"<div id='" + rowID + "' class='container' style='width: " + selectedNodeWidth + "px;'>" +
												//
												"	<div class='content-container'>" +
												"		<div class='row'>" +
												"			<div class='column-21 pre-3'>" +
												"				<div id='map-mask' class='loader'>" +
												"					<span class='side side-left'><span class='fill'></span></span>" +
												"					<span class='side side-right'><span class='fill'></span></span>" +
												"				</div>" +
												"				<div id='map'></div>" +
												"			</div>" +
												"		</div>" +

												"		<div class='row'>" +
												"			<div class='column-21 pre-3'>" +
												"				<div class='current-score-header'>" + defaults.CURRENT_SCORE_HEADER_TEXT + "</div>" +
												"			</div>" +
												"		</div>" +
												// Scoring
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
												//
												"		<div class='row'>" +
												"			<div class='column-15 pre-3'>" +
												"				<div class='expanded-item-text'>" + defaults.OVERALL_TXT + "</div>" +
												"			</div>" +
												"		</div>" +
												// Tab Container
												"		<div class='row'>" +
												"			<div class='column-18 pre-3'>" +
												"				<div id='" + tcID + "'></div>" +
												"			</div>" +
												"		</div>" +
												"	</div>" +
												"</div>",
											selectedRow.firstElementChild, "last");

									currentOverallScoreNode = query(".current-score-number")[0];
									progressBarNode = query(".current-score-graphic-container")[0];

									// create button group
									initContentButtonGroup(tcID);

									// initialize content area with details data
									destroyNodes(categoryNodes);
									//array.forEach(nodeList, function (node) {
									//	if (domClass.contains(node, "active")) {
									//		domClass.replace(node, "column-4", "active column-4");
											detailsContentPane(selectedRowID, titleID, snippetID, descID);
									//	}
									//});
									//domClass.replace(detailsNode, "active column-4 details-tab-node", "column-4 details-tab-node");

									if (item.type === "Web Map") {
										var mapDrawBegin = performance.now(),
											mapDrawComplete;
										// Web Map, Feature Service, Map Service, Image Service, Web Mapping Application
										arcgisUtils.createMap(selectedRowID, "map").then(function (response) {
											console.log(response);
											layers = response.itemInfo.itemData.operationalLayers;
											map = response.map;

											// make sure map is loaded
											if (map.loaded) {
												mapDrawComplete = performance.now();
												var mapDrawTime = (mapDrawComplete - mapDrawBegin);
												fadeLoader();

												// set performance scores
												mapDrawTimeScore = setMapDrawTimeScore(mapDrawTime);
												nLayersScore = setNumLayersScore(layers);
												popupsScore = setPopupScore(layers);
												sharingScore = setSharingScore(item);
												performanceScore = mapDrawTimeScore + nLayersScore + popupsScore + sharingScore;
												// set style on performance button
												setPassFailStyleOnTabNode(performanceScore, performanceNode, PERFORMANCE_MAX_SCORE);
												// initialize the scores
												initScores(item, portalUser);
												HAS_PERFORMANCE_CONTENT = true;
												// update the overall score
												updateOverallScore();

												on(performanceNode, "click", lang.partial(performanceNodeClickHandler, categoryNodes, nodeList, item, popupsScore, mapDrawTime, layers, performanceNode));
											}
										});
									} else {
										fadeLoader();
										// hide the map div
										domStyle.set("map", "display", "none");
										on(performanceNode, "click", lang.partial(performanceNodeClickHandler, categoryNodes, nodeList, item, "", "", layers, performanceNode));
										// initialize the scores
										initScores(item, portalUser);
										HAS_PERFORMANCE_CONTENT = false;
										// update the overall score;
										updateOverallScore();
									}
									on(detailsNode, "click", lang.partial(detailsNodeClickHandler, selectedRowID, categoryNodes, nodeList, titleID, snippetID, descID, detailsNode));
									on(creditsNode, "click", lang.partial(creditsNodeClickHandler, selectedRowID, categoryNodes, nodeList, item, accessID, creditID, creditsNode));
									on(tagsNode, "click", lang.partial(tagsNodeClickHandler, selectedRowID, categoryNodes, nodeList, categoryID, tagsID, tagsNode));
									on(profileNode, "click", lang.partial(profileNodeClickHandler, selectedRowID, categoryNodes, nodeList, userNameID, userDescriptionID, profileNode));

									// overall score graphic
									if (dijit.byId("overall-score-graphic")) {
										dijit.byId("overall-score-graphic").destroy();
									}
									if (dijit.byId("overall-score-graphic") === undefined) {
										overallScoreGraphic = new ProgressBar({
											id: "overall-score-graphic",
											style: {
												"width": "100%",
												"height": "5px"
											},
											value: overAllCurrentScore
										}).placeAt(progressBarNode).startup();
									}

									var barAttr = domStyle.get(query(".dijitProgressBarLabel")[0]);
									var externalBarWidth = domStyle.get(query(".dijitProgressBarLabel")[0], "width");
									var internalBarWidth = domStyle.get(query(".dijitProgressBarFull")[0], "width");
									console.log(barAttr);
									console.log(externalBarWidth);
									console.log(internalBarWidth);

									// draw the minimum score marker
									initPassingMarker();
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
				var itemTitle = validateStr(item.title);
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
						// tooltip nodes
						itemThumbnailTooltipNode = query(".thumbnail-tooltip")[0],
						itemTitleTooltipNode = query(".title-tooltip")[0],
						itemSummaryTooltipNode = query(".summary-tooltip")[0],
						itemDescriptionTooltipNode = query(".description-tooltip")[0],
						// sections scores
						thumbnailScoreNodeContainer = query(".item-thumbnail-score-gr")[0],
						thumbnailScoreNumeratorNode = query(".item-thumbnail-score-num")[0],
						thumbnailScoreDenominatorNode = query(".item-thumbnail-score-denom")[0],
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
				createTooltips([itemThumbnailTooltipNode, itemTitleTooltipNode, itemSummaryTooltipNode, itemDescriptionTooltipNode],
						[tooltipsConfig.ITEM_THUMBNAIL_TOOLTIP_CONTENT, tooltipsConfig.ITEM_TITLE_TOOLTIP_CONTENT, tooltipsConfig.ITEM_SUMMARY_TOOLTIP_CONTENT, tooltipsConfig.ITEM_DESCRIPTION_TOOLTIP_CONTENT]);

				// set denominator
				thumbnailScoreDenominatorNode.innerHTML = ITEM_THUMBNAIL_MAX_SCORE;
				titleScoreDenominatorNode.innerHTML = ITEM_TITLE_MAX_SCORE;
				summaryScoreDenominatorNode.innerHTML = ITEM_SUMMARY_MAX_SCORE;
				descScoreDenominatorNode.innerHTML = ITEM_DESC_MAX_SCORE;

				// set numerator
				itemThumbnailScore = setThumbnailScore(item);
				itemTitleScore = setItemTitleScore(item.title);
				itemSummaryScore = setItemSummaryScore(item.snippet);
				itemDescriptionScore = setItemDescriptionScore(item.description);
				thumbnailScoreNumeratorNode.innerHTML = itemThumbnailScore;
				titleScoreNumeratorNode.innerHTML = itemTitleScore;
				summaryScoreNumeratorNode.innerHTML = itemSummaryScore;
				descScoreNumeratorNode.innerHTML = itemDescriptionScore;

				// update section style score graphics
				updateSectionScoreStyle(itemThumbnailScore, ITEM_THUMBNAIL_MAX_SCORE, thumbnailScoreNodeContainer);
				updateSectionScoreStyle(itemTitleScore, ITEM_TITLE_MAX_SCORE, titleScoreNodeContainer);
				updateSectionScoreStyle(itemSummaryScore, ITEM_SUMMARY_MAX_SCORE, summaryScoreNodeContainer);
				updateSectionScoreStyle(itemDescriptionScore, ITEM_DESC_MAX_SCORE, descScoreNodeContainer);

				// section overall score
				itemDetailsScore = itemThumbnailScore + itemTitleScore + itemSummaryScore + itemDescriptionScore;
				updateSectionScore(itemDetailsScore, detailsNode, ITEM_DETAILS_MAX_SCORE);
				updateOverallScore();

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
							plugins: defaults.EDITOR_PLUGINS,
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
											// set numerator
											itemThumbnailScore = setThumbnailScore(results);
											itemTitleScore = setItemTitleScore(itemTitle);
											itemSummaryScore = setItemSummaryScore(itemSummary);
											itemDescriptionScore = setItemDescriptionScore(itemDescription);
											thumbnailScoreNumeratorNode.innerHTML = itemThumbnailScore;
											titleScoreNumeratorNode.innerHTML = itemTitleScore;
											summaryScoreNumeratorNode.innerHTML = itemSummaryScore;
											descScoreNumeratorNode.innerHTML = itemDescriptionScore;

											// update section style score graphics
											updateSectionScoreStyle(itemThumbnailScore, ITEM_THUMBNAIL_MAX_SCORE, thumbnailScoreNodeContainer);
											updateSectionScoreStyle(itemTitleScore, ITEM_TITLE_MAX_SCORE, titleScoreNodeContainer);
											updateSectionScoreStyle(itemSummaryScore, ITEM_SUMMARY_MAX_SCORE, summaryScoreNodeContainer);
											updateSectionScoreStyle(itemDescriptionScore, ITEM_DESC_MAX_SCORE, descScoreNodeContainer);

											// section overall score
											itemDetailsScore = itemThumbnailScore + itemTitleScore + itemSummaryScore + itemDescriptionScore;
											updateSectionScore(itemDetailsScore, detailsNode, ITEM_DETAILS_MAX_SCORE);
											updateOverallScore();
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

					// set numerator
					//itemThumbnailScore = setThumbnailScore(results);
					itemTitleScore = setItemTitleScore(itemTitle_clean);
					itemSummaryScore = setItemSummaryScore(itemSummary_clean);
					itemDescriptionScore = setItemDescriptionScore(itemDescription_clean);
					thumbnailScoreNumeratorNode.innerHTML = itemThumbnailScore;
					titleScoreNumeratorNode.innerHTML = itemTitleScore;
					summaryScoreNumeratorNode.innerHTML = itemSummaryScore;
					descScoreNumeratorNode.innerHTML = itemDescriptionScore;

					// update section style score graphics
					updateSectionScoreStyle(itemThumbnailScore, ITEM_THUMBNAIL_MAX_SCORE, thumbnailScoreNodeContainer);
					updateSectionScoreStyle(itemTitleScore, ITEM_TITLE_MAX_SCORE, titleScoreNodeContainer);
					updateSectionScoreStyle(itemSummaryScore, ITEM_SUMMARY_MAX_SCORE, summaryScoreNodeContainer);
					updateSectionScoreStyle(itemDescriptionScore, ITEM_DESC_MAX_SCORE, descScoreNodeContainer);

					// section overall score
					itemDetailsScore = itemThumbnailScore + itemTitleScore + itemSummaryScore + itemDescriptionScore;
					updateSectionScore(itemDetailsScore, detailsNode, ITEM_DETAILS_MAX_SCORE);
					updateOverallScore();
				});
			});
		}

		function useCreditsContentPane(selectedRowID, accessAndUseConstraintsID, creditID) {
			portalUser.getItem(selectedRowID).then(function (item) {
				var itemCredits = validateStr(item.accessInformation),
						itemCredits_clean = itemCredits,
						accessAndUseConstraints = validateStr(item.licenseInfo),
						accessAndUseConstraints_clean = accessAndUseConstraints;

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

				var editSaveBtnNode = query(".edit-save-btn")[0];
				var cancelBtnNode = query(".cancel-btn")[0];
				// tooltips
				var accessConstraintsTooltipNode = query(".access-constraints-tooltip")[0];
				var creditsTooltipNode = query(".credits-tooltip")[0];
				//
				var itemCreditsNode = query(".creditsID-textbox")[0];
				var accessAndUseConstraintsEditorNode = query(".accessAndUseConstraintsEditor")[0];
				var creditsScoreNodeContainer = query(".credits-score-gr")[0];
				var creditsScoreNumeratorNode = query(".credits-score-num")[0];
				var creditsScoreDenominatorNode = query(".credits-score-denom")[0];
				var accessScoreNodeContainer = query(".access-score-gr")[0];
				var accessScoreNumeratorNode = query(".access-score-num")[0];
				var accessScoreDenominatorNode = query(".access-score-denom")[0];

				createTooltips([accessConstraintsTooltipNode, creditsTooltipNode], [tooltipsConfig.CREDITS_TOOLTIP_CONTENT, tooltipsConfig.ACCESS_TOOLTIP_CONTENT]);

				// set denominator
				creditsScoreDenominatorNode.innerHTML = ITEM_CREDIT_MAX_SCORE;
				accessScoreDenominatorNode.innerHTML = ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE;

				// set numerator
				itemCreditsScore = setCredtisScore(item.accessInformation);
				itemAccessAndUseConstraintsScore = setAccessAndUseConstraintsScore(item.licenseInfo);
				creditsScoreNumeratorNode.innerHTML = itemCreditsScore;
				accessScoreNumeratorNode.innerHTML = itemAccessAndUseConstraintsScore;

				// update section style score graphics
				updateSectionScoreStyle(itemCreditsScore, ITEM_CREDIT_MAX_SCORE, creditsScoreNodeContainer);
				updateSectionScoreStyle(itemAccessAndUseConstraintsScore, ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE, accessScoreNodeContainer);

				creditsAndAccessScore = itemCreditsScore + itemAccessAndUseConstraintsScore;
				updateSectionScore(creditsAndAccessScore, creditsNode, ITEM_USE_CONSTRAINS_MAX_SCORE);
				updateOverallScore();

				on(editSaveBtnNode, "click", function () {
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
							plugins: defaults.EDITOR_PLUGINS,
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

						// set numerator
						itemCreditsScore = setCredtisScore(itemCredits);
						itemAccessAndUseConstraintsScore = setAccessAndUseConstraintsScore(accessAndUseConstraints);
						creditsScoreNumeratorNode.innerHTML = itemCreditsScore;
						accessScoreNumeratorNode.innerHTML = itemAccessAndUseConstraintsScore;

						// update section style score graphics
						updateSectionScoreStyle(itemCreditsScore, ITEM_CREDIT_MAX_SCORE, creditsScoreNodeContainer);
						updateSectionScoreStyle(itemAccessAndUseConstraintsScore, ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE, accessScoreNodeContainer);

						creditsAndAccessScore = itemCreditsScore + itemAccessAndUseConstraintsScore;
						updateSectionScore(creditsAndAccessScore, creditsNode, ITEM_USE_CONSTRAINS_MAX_SCORE);
						updateOverallScore();
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

					// set numerator
					itemCreditsScore = setCredtisScore(itemCredits_clean);
					itemAccessAndUseConstraintsScore = setAccessAndUseConstraintsScore(accessAndUseConstraints_clean);
					creditsScoreNumeratorNode.innerHTML = itemCreditsScore;
					accessScoreNumeratorNode.innerHTML = itemAccessAndUseConstraintsScore;

					// update section style score graphics
					updateSectionScoreStyle(itemCreditsScore, ITEM_CREDIT_MAX_SCORE, creditsScoreNodeContainer);
					updateSectionScoreStyle(itemAccessAndUseConstraintsScore, ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE, accessScoreNodeContainer);

					creditsAndAccessScore = itemCreditsScore + itemAccessAndUseConstraintsScore;
					updateSectionScore(creditsAndAccessScore, creditsNode, ITEM_USE_CONSTRAINS_MAX_SCORE);
					updateOverallScore();
				});
			});
		}

		function tagsContentPane(_selectedRowID, categoryID, tagsID) {
			checkBoxID_values = [];
			portalUser.getItem(_selectedRowID).then(function (item) {
				// load the content
				loadContent(tags.TAGS_CONTENT);

				var editSaveBtnNode = query(".edit-save-btn")[0],
						cancelBtnNode = query(".cancel-btn")[0],
						// nodes
						tagsScoreNodeContainer = query(".tags-score-gr")[0],
						tagsScoreNumeratorNode = query(".tags-score-num")[0],
						tagsScoreDenominatorNode = query(".tags-score-denom")[0],
						// tooltips
						tagsTooltipNode = query(".tags-tooltip")[0];

				createTooltips([tagsTooltipNode], [tooltipsConfig.TAGS_TOOLTIP_CONTENT]);

				// tags
				var itemTags = item.tags;
				var itemTags_clean = itemTags;

				// set denominator
				tagsScoreDenominatorNode.innerHTML = TAGS_MAX_SCORE;

				// set the numerator and update score
				//itemTagsScore = validateTags(itemTagsScore, itemTags, tagsScoreNodeContainer, tagsScoreNumeratorNode, scoring.TAGS_PENALTY_WORDS);
				itemTagsScore = validateItemTags(itemTags);
				tagsScoreNumeratorNode.innerHTML = itemTagsScore;
				// section overall score
				updateSectionScore(itemTagsScore, tagsNode, TAGS_MAX_SCORE);
				updateOverallScore();

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
										// set the numerator and update score
										itemTagsScore = validateItemTags(tagsDijit.values);
										tagsScoreNumeratorNode.innerHTML = itemTagsScore;
										// section overall score
										updateSectionScore(itemTagsScore, tagsNode, TAGS_MAX_SCORE);
										updateOverallScore();

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

					// set the numerator and update score
					itemTagsScore = validateItemTags(itemTags_clean);
					tagsScoreNumeratorNode.innerHTML = itemTagsScore;
					// section overall score
					updateSectionScore(itemTagsScore, tagsNode, TAGS_MAX_SCORE);
					updateOverallScore();

					// disable living atlas checkboxes
					toggleCheckboxes(checkBoxID_values, "disabled", true);
					updateEditSaveButton(editSaveBtnNode, " EDIT ", cancelBtnNode, "none");
				});
			});
		}

		function performanceContentPane(item, popupScore, mapDrawTime, layers) {
			// load the content
			loadContent(performanceConfig.PERFORMANCE_CONTENT);

			// tooltip nodes
			var mapLayersTooltipNode = query(".map-layers-tooltip")[0],
					sharingNode = query(".sharing-tooltip")[0],
					drawTimeTooltipNode = query(".draw-time-tooltip")[0],
					popupsTooltipNode = query(".popups-tooltip")[0];

			var mdtScoreContainerNode = query(".mdt-score-gr")[0],
					nLayersScoreContainerNode = query(".num-layers-score-gr")[0],
					popupsScoreContainerNode = query(".popups-score-gr")[0],
					sharingContainerNode = query(".sharing-score-gr")[0];

			var mdtNumeratorNode = query(".mdt-score-num")[0],
					layerCountNumeratorNode = query(".num-layers-score-num")[0],
					popupsNumeratorNode = query(".popups-score-num")[0],
					sharingNumeratorNode = query(".sharing-score-num")[0];
			var mdtDenominatorNode = query(".mdt-score-denom")[0],
					layerCountDenominatorNode = query(".num-layers-score-denom")[0],
					popupsDenominatorNode = query(".popups-score-denom")[0],
					sharingDenominatorNode = query(".sharing-score-denom")[0];
			var mdtGoodNode = query(".performance-text-very-slow")[0],
					mdtBetterNode = query(".performance-text-slow")[0],
					mdtBestNode = query(".performance-text-good")[0];
			var nLayersGoodNode = query(".num-layers-good")[0],
					nLayersBetterNode = query(".num-layers-better")[0],
					nLayersBestNode = query(".num-layers-best")[0];
			var sharingGoodNode = query(".performance-sharing-good")[0],
					sharingBetterNode = query(".performance-sharing-better")[0],
					sharingBestNode = query(".performance-sharing-best")[0];

			var mdt = parseInt(processMapDrawTime(mapDrawTime));
			if (mdt < defaults.drawTime.BEST) {
				domStyle.set(mdtGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(mdtBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(mdtBestNode, "color", "#0079C1");
				// score
				domStyle.set(mdtScoreContainerNode, "border", "1px solid #0079C1");
				domStyle.set(mdtNumeratorNode, "color", "#0079C1");
				domStyle.set(mdtDenominatorNode, "color", "#0079C1");
				mapDrawTimeScore = scoring.PERFORMANCE_DRAW_TIME_BEST;
			} else if (mdt < defaults.drawTime.BETTER) {
				domStyle.set(mdtGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(mdtBetterNode, "color", "#0079C1");
				domStyle.set(mdtBestNode, "color", "rgba(0, 122, 194, 0.24)");
				// score
				domStyle.set(mdtScoreContainerNode, "border", "1px solid #0079C1");
				domStyle.set(mdtNumeratorNode, "color", "#0079C1");
				domStyle.set(mdtDenominatorNode, "color", "#0079C1");
				mapDrawTimeScore = scoring.PERFORMANCE_DRAW_TIME_BETTER;
			} else if (mdt < defaults.drawTime.GOOD) {
				domStyle.set(mdtGoodNode, "color", "#0079C1");
				domStyle.set(mdtBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(mdtBestNode, "color", "rgba(0, 122, 194, 0.24)");
				// score
				domStyle.set(mdtScoreContainerNode, "border", "1px solid #C86A4A");
				domStyle.set(mdtNumeratorNode, "color", "#C86A4A");
				domStyle.set(mdtDenominatorNode, "color", "#C86A4A");
				mapDrawTimeScore = scoring.PERFORMANCE_DRAW_TIME_GOOD;
			}

			if (layers !== undefined) {
				var nLayers = layers.length;
				if (nLayers > 10) {
					// GOOD
					domStyle.set(nLayersGoodNode, "color", "#005E95");
					domStyle.set(nLayersBetterNode, "color", "rgba(0, 122, 194, 0.24)");
					domStyle.set(nLayersBestNode, "color", "rgba(0, 122, 194, 0.24)");
					// score graphic
					domStyle.set(nLayersScoreContainerNode, "border", "1px solid #C86A4A");
					domStyle.set(layerCountNumeratorNode, "color", "#C86A4A");
					domStyle.set(layerCountDenominatorNode, "color", "#C86A4A");
					nLayersScore = scoring.PERFORMANCE_LAYER_COUNT_GOOD;
				} else if (nLayers <= 10 && nLayers >= 2) {
					// BETTER
					domStyle.set(nLayersGoodNode, "color", "rgba(0, 122, 194, 0.24)");
					domStyle.set(nLayersBetterNode, "color", "#005E95");
					domStyle.set(nLayersBestNode, "color", "rgba(0, 122, 194, 0.24)");
					// score
					domStyle.set(nLayersScoreContainerNode, "border", "1px solid #005E95");
					domStyle.set(layerCountNumeratorNode, "color", "#005E95");
					domStyle.set(layerCountDenominatorNode, "color", "#005E95");
					nLayersScore = scoring.PERFORMANCE_LAYER_COUNT_BETTER;
				} else if (nLayers >= 0 && nLayers < 2) {
					// BEST
					domStyle.set(nLayersGoodNode, "color", "rgba(0, 122, 194, 0.24)");
					domStyle.set(nLayersBetterNode, "color", "rgba(0, 122, 194, 0.24)");
					domStyle.set(nLayersBestNode, "color", "#005E95");
					// score
					domStyle.set(nLayersScoreContainerNode, "border", "1px solid #005E95");
					domStyle.set(layerCountNumeratorNode, "color", "#005E95");
					domStyle.set(layerCountDenominatorNode, "color", "#005E95");
					nLayersScore = scoring.PERFORMANCE_LAYER_COUNT_BEST;
				}
			}

			//popupsScore = 5;
			domStyle.set(popupsNumeratorNode, "color", "#005E95");
			domStyle.set(popupsDenominatorNode, "color", "#005E95");

			var sharing = item.access;
			if (sharing === "private") {
				// GOOD
				sharingScore = scoring.PERFORMANCE_SHARING_PRIVATE;
				domStyle.set(sharingContainerNode, "border", "1px solid #C86A4A");
				domStyle.set(sharingNumeratorNode, "color", "#C86A4A");
				domStyle.set(sharingDenominatorNode, "color", "#C86A4A");
				domStyle.set(sharingGoodNode, "color", "#005E95");
				domStyle.set(sharingBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(sharingBestNode, "color", "rgba(0, 122, 194, 0.24)");
			} else if (sharing === "org" || sharing === "shared") {
				// BETTER
				sharingScore = scoring.PERFORMANCE_SHARING_ORG;
				domStyle.set(sharingContainerNode, "border", "1px solid #005E95");
				domStyle.set(sharingNumeratorNode, "color", "#005E95");
				domStyle.set(sharingDenominatorNode, "color", "#005E95");
				domStyle.set(sharingGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(sharingBetterNode, "color", "#005E95");
				domStyle.set(sharingBestNode, "color", "rgba(0, 122, 194, 0.24)");
			} else {
				// BEST
				sharingScore = scoring.PERFORMANCE_SHARING_PUBLIC;
				domStyle.set(sharingContainerNode, "border", "1px solid #005E95");
				domStyle.set(sharingNumeratorNode, "color", "#005E95");
				domStyle.set(sharingDenominatorNode, "color", "#005E95");
				domStyle.set(sharingGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(sharingBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(sharingBestNode, "color", "#005E95");
			}

			createTooltips([mapLayersTooltipNode, sharingNode, drawTimeTooltipNode,popupsTooltipNode], [tooltipsConfig.PERFORMANCE_MAP_LAYERS_TOOLTIP_CONTENT, tooltipsConfig.PERFORMANCE_SHARING_TOOLTIP_CONTENT, tooltipsConfig.PERFORMANCE_DRAW_TIME_TOOLTIP_CONTENT, tooltipsConfig.PERFORMANCE_POP_UPS_TOOLTIP_CONTENT]);

			mdtNumeratorNode.innerHTML = mapDrawTimeScore;
			layerCountNumeratorNode.innerHTML = nLayersScore;
			popupsNumeratorNode.innerHTML = popupScore;
			sharingNumeratorNode.innerHTML = sharingScore;
			mdtDenominatorNode.innerHTML = layerCountDenominatorNode.innerHTML = popupsDenominatorNode.innerHTML = sharingDenominatorNode.innerHTML = scoring.PERFORMANCE_MAX;

			updateSectionScoreStyle(popupScore, PERFORMANCE_POPUPS_MAX_SCORE, popupsScoreContainerNode);
			//updateSectionScore(itemDetailsScore, detailsNode, ITEM_DETAILS_MAX_SCORE);
			//updateOverallScore();
		}

		function loadProfileContentPane(selectedRowID, _userNameID, _userDescriptionID) {
			portalUser.getItem(selectedRowID).then(function (item) {
				// item full name
				var _userFullName = validateStr(portalUser.fullName);
				var _userFullName_clean = _userFullName;
				// item user description
				var _userDescription = validateStr(portalUser.description);
				var _userDescription_clean = _userDescription;
				// item user thumbnail
				var _userThumbnailUrl = portalUserThumbnailUrl;
				var _userThumbnailUrl_clean = _userThumbnailUrl;

				// load the content
				loadContent(profileConfig.PROFILE_CONTENT);

				// nodes
				var editSaveBtnNode = query(".edit-save-btn")[0],
						cancelBtnNode = query(".cancel-btn")[0],

						profileThumbnailNode = query(".profileThumbnailUrl")[0],
						profileUserFullNameNode = query(".name-textbox")[0],
						profileUserDescriptionNode = query(".user-description-textbox")[0],

						userThumbnailNodeContainer = query(".profile-thumbnail-score-gr")[0],
						userThumbnailNumeratorNode = query(".profile-thumbnail-score-num")[0],
						userThumbnailDenominatorNode = query(".profile-thumbnail-score-denom")[0],

						userNameScoreNodeContainer = query(".profile-name-score-gr")[0],
						userNameScoreNumeratorNode = query(".profile-name-score-num")[0],
						userNameScoreDenominatorNode = query(".profile-name-score-denom")[0],

						userDescriptionScoreNodeContainer = query(".profile-description-score-gr")[0],
						userDescriptionScoreNumeratorNode = query(".profile-description-score-num")[0],
						userDescriptionScoreDenominatorNode = query(".profile-description-score-denom")[0],

						profileThumbnailTooltipNode = query(".profile-thumbnail-tooltip")[0],
						profileFullNameTooltipNode = query(".user-full-name-tooltip")[0],
						profileDescriptionTooltipNode = query(".user-description-tooltip")[0],
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
				createTooltips([profileThumbnailTooltipNode, profileFullNameTooltipNode, profileDescriptionTooltipNode], [tooltipsConfig.USER_PROFILE_THUMBNAIL_TOOLTIP_CONTENT, tooltipsConfig.USER_PROFILE_FULL_NAME_TOOLTIP_CONTENT, tooltipsConfig.USER_PROFILE_DESCRIPTION_TOOLTIP_CONTENT]);

				// set denominator
				userThumbnailDenominatorNode.innerHTML = USER_PROFILE_THUMBNAIL;
				userNameScoreDenominatorNode.innerHTML = USER_PROFILE_FULLNAME;
				userDescriptionScoreDenominatorNode.innerHTML = USER_PROFILE_DESCRIPTION;

				// score content
				userThumbnailScore = 7;//setThumbnailScore(portalUser.thumbnail);
				userNameScore = setUserProfileFullNameScore(portalUser.fullName);
				userDescriptionScore = setUserDescriptionScore(portalUser.description);
				userThumbnailNumeratorNode.innerHTML = userThumbnailScore;
				userNameScoreNumeratorNode.innerHTML = userNameScore;
				userDescriptionScoreNumeratorNode.innerHTML = userDescriptionScore;

				// update section style score graphics
				updateSectionScoreStyle(userThumbnailScore, USER_PROFILE_THUMBNAIL, userThumbnailNodeContainer);
				updateSectionScoreStyle(userNameScore, USER_PROFILE_FULLNAME, userNameScoreNodeContainer);
				updateSectionScoreStyle(userDescriptionScore, USER_PROFILE_DESCRIPTION, userDescriptionScoreNodeContainer);

				userProfileScore = userThumbnailScore + userNameScore + userDescriptionScore;
				updateSectionScore(userProfileScore, profileNode, USER_PROFILE_MAX_SCORE);
				updateOverallScore();

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
							uploadUserProfileThumbnail("PROFILE");
						}));
					} else {
						// "SAVE" clicked
						profileThumbnailListener.remove();
						_userFullName = query(".edit-user-full-name")[0].value;
						_userDescription = query(".edit-user-description")[0].value;

						domStyle.set(query(".edit-profile-thumbnail-msg")[0], "display", "none");
						domStyle.set(query(".expanded-item-thumbnail")[0], "cursor", "inherit");

						portalUser.getItem(selectedRowID).then(function (results) {
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

											// score content
											userThumbnailScore = 0;//setUserProfileThumbnailScore()
											userNameScore = setUserProfileFullNameScore(_userFullName_clean);
											userDescriptionScore = setUserDescriptionScore(_userDescription_clean);
											userNameScoreNumeratorNode.innerHTML = userNameScore;
											userDescriptionScoreNumeratorNode.innerHTML = userDescriptionScore;

											// update section style score graphics
											updateSectionScoreStyle(userNameScore, USER_PROFILE_FULLNAME, userNameScoreNodeContainer);
											updateSectionScoreStyle(userDescriptionScore, USER_PROFILE_DESCRIPTION, userDescriptionScoreNodeContainer);

											userProfileScore = userThumbnailScore + userNameScore + userDescriptionScore;
											updateSectionScore(userProfileScore, profileNode, USER_PROFILE_MAX_SCORE);
											updateOverallScore();
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

					userThumbnailScore = 0;//setUserProfileThumbnailScore()
					userNameScore = setUserProfileFullNameScore(_userFullName_clean);
					userDescriptionScore = setUserDescriptionScore(_userDescription_clean);
					userNameScoreNumeratorNode.innerHTML = userNameScore;
					userDescriptionScoreNumeratorNode.innerHTML = userDescriptionScore;

					// update section style score graphics
					updateSectionScoreStyle(userNameScore, USER_PROFILE_FULLNAME, userNameScoreNodeContainer);
					updateSectionScoreStyle(userDescriptionScore, USER_PROFILE_DESCRIPTION, userDescriptionScoreNodeContainer);

					userProfileScore = userThumbnailScore + userNameScore + userDescriptionScore;
					updateSectionScore(userProfileScore, profileNode, USER_PROFILE_MAX_SCORE);
					updateOverallScore();
				});
			});
		}


		function validateThumbnailUrl(thumbnail, sectionScore, containerNode, numeratorNode) {
			if (thumbnail === null) {
				return 0;
			} else {
				var index = thumbnail.lastIndexOf("/") + 1;
				var filename = thumbnail.substr(index);
				filename = filename.split("?")[0];
				if (filename === "nullThumbnail.png" || filename === "ago_downloaded.png" || filename === "no-user-thumb.jpg") {
					// thumbnail does not exist
					sectionScore = scoring.ITEM_THUMBNAIL_NONE;
					numeratorNode.innerHTML = sectionScore;
					domClass.replace(containerNode, "score-graphic-fail", "score-graphic-pass");
					return sectionScore;
				} else {
					sectionScore = scoring.ITEM_THUMBNAIL_CUSTOM;
					numeratorNode.innerHTML = sectionScore;
					domClass.replace(containerNode, "score-graphic-pass", "score-graphic-fail");
					return sectionScore;
				}
			}
		}


		function initScores(item, portalUser) {
			// details
			itemThumbnailScore = setThumbnailScore(item);
			itemTitleScore = setItemTitleScore(item.title);
			itemSummaryScore = setItemSummaryScore(item.snippet);
			itemDescriptionScore = setItemDescriptionScore(item.description);
			itemDetailsScore = itemThumbnailScore + itemTitleScore + itemSummaryScore + itemDescriptionScore;
			setPassFailStyleOnTabNode(itemDetailsScore, detailsNode, ITEM_DETAILS_MAX_SCORE);
			// use/constrains
			itemCreditsScore = setCredtisScore(item.accessInformation);
			itemAccessAndUseConstraintsScore = setAccessAndUseConstraintsScore(item.licenseInfo);
			creditsAndAccessScore = itemCreditsScore + itemAccessAndUseConstraintsScore;
			setPassFailStyleOnTabNode(creditsAndAccessScore, creditsNode, ITEM_USE_CONSTRAINS_MAX_SCORE);
			// tags
			itemTagsScore = validateItemTags(item.tags);
			setPassFailStyleOnTabNode(itemTagsScore, tagsNode, TAGS_MAX_SCORE);
			// performance
			//
			setPassFailStyleOnTabNode(performanceScore, performanceNode, PERFORMANCE_MAX_SCORE);
			// user profile
			userThumbnailScore = 7;//setThumbnailScore(portalUser);
			userNameScore = setUserProfileFullNameScore(portalUser.fullName);
			userDescriptionScore = setUserDescriptionScore(portalUser.description);
			userProfileScore = userThumbnailScore + userNameScore + userDescriptionScore;
			setPassFailStyleOnTabNode(userProfileScore, profileNode, USER_PROFILE_MAX_SCORE);
			// update the overall score and score graphic
			updateOverallScore();
		}

		function updateOverallScore() {
			var TMP_MAX_SCORE = 0;
			// update the score
			if (HAS_PERFORMANCE_CONTENT) {
				TMP_MAX_SCORE = MAX_SCORE;
				overAllCurrentScore = Math.floor((itemDetailsScore + creditsAndAccessScore + itemTagsScore + performanceScore + userProfileScore) / MAX_SCORE * 100);
			} else {
				TMP_MAX_SCORE = MAX_SCORE - PERFORMANCE_MAX_SCORE;
				overAllCurrentScore = Math.floor((itemDetailsScore + creditsAndAccessScore + itemTagsScore + userProfileScore) / TMP_MAX_SCORE * 100);
			}
			if (overAllCurrentScore >= TMP_MAX_SCORE) {
				domStyle.set(currentOverallScoreNode, "color", "#005E95");
			} else {
				domStyle.set(currentOverallScoreNode, "color", "#C86A4A");
			}
			// update the score label
			currentOverallScoreNode.innerHTML = overAllCurrentScore;
			if (dijit.byId("overall-score-graphic") !== undefined) {
				dijit.byId("overall-score-graphic").update({
					value: overAllCurrentScore
				});
				dijit.byId("overall-score-graphic").set("value", overAllCurrentScore);
			}
		}

		function updateSectionScore(score, node, max) {
			var classAttrs = domAttr.get(node, "class");
			score = Math.floor(score / max * 100);
			if (score >= scoring.SCORE_THRESHOLD) {
				// PASS
				classAttrs = classAttrs.replace("icon-edit", "active icon-check");
				domAttr.set(node, "class", classAttrs);
				domStyle.set(node, "color", "#007ac2");
				domStyle.set(node, "border", "1px solid #007ac2");
			} else {
				// FAIL
				classAttrs = classAttrs.replace("icon-check", "active icon-edit");
				domAttr.set(node, "class", classAttrs);
				domStyle.set(node, "color", "#C86A4A");
				domStyle.set(node, "border", "1px solid #C86A4A");
			}
		}

		/*function validateTags(sectionScore, tags, containerNode, numeratorNode, penaltyWords) {
			var score = 0;
			if (tags.length >= scoring.TAGS_HAS_TAGS) {
				score = 1;
				if (tags.length > 3) {
					score = score + 2;
				}

				var tempTags = [];
				array.forEach(tags, function (tag) {
					tempTags.push(tag.toLowerCase());
				});

				if (array.some(penaltyWords, function (penaltyWord) {
					return tempTags.indexOf(penaltyWord.toLowerCase()) !== -1;
				})) {
					// PASS with penalty
					//sectionScore = scoring.SECTION_PASSING;
					//numeratorNode.innerHTML = sectionScore;
					console.log("FAIL");
					domClass.replace(containerNode, "score-graphic-fail", "score-graphic-pass");
					return score;
				} else {
					// PASS
					//sectionScore = scoring.SECTION_MAX;
					//numeratorNode.innerHTML = sectionScore;
					console.log("PASS");
					score = score + 1;
					domClass.replace(containerNode, "score-graphic-pass", "score-graphic-fail");
					return score;
				}
			} else {
				// FAIL
				//sectionScore = scoring.TAGS_HAS_NO_TAGS;
				score = 0;
				//numeratorNode.innerHTML = sectionScore;
				// update style of section scoring graphic
				domClass.replace(containerNode, "score-graphic-fail", "score-graphic-pass");
				console.log("FAIL");
				return score;
			}
		}*/



		function updateSectionScoreStyle(itemScore, max, node) {
			if ((itemScore / max * 100) >= 80) {
				domClass.replace(node, "score-graphic-pass", "score-graphic-fail");
			} else {
				domClass.replace(node, "score-graphic-fail", "score-graphic-pass");
			}
		}

		// set item thumbnail score
		function setThumbnailScore(item) {
			var score = 0;
			var thumbnail = null;
			var largeThumbnail = item.largeThumbnail;
			if (largeThumbnail !== null) {
				// large thumbnail
				thumbnail = largeThumbnail;
				score = scoring.ITEM_THUMBNAIL_LARGE;
			} else {
				// normal thumbnail
				thumbnail = item.thumbnail;
			}
			if (thumbnail === null || thumbnail === undefined) {
				score = 0;
				return score;
			} else {
				var index = thumbnail.lastIndexOf("/") + 1;
				var filename = thumbnail.substr(index);
				filename = filename.split("?")[0];
				if (filename === "nullThumbnail.png" || filename === "ago_downloaded.png" || filename === "no-user-thumb.jpg") {
					return 0;
				} else {
					return score + scoring.ITEM_THUMBNAIL_CUSTOM;
				}
			}
		}

		// set the item title score
		function setItemTitleScore(itemTitle) {
			var score = 0;
			var strippedString = itemTitle.replace(/(<([^>]+)>)/ig, "");
			var nWords = getNumWords(strippedString);
			if (nWords > scoring.ITEM_TITLE_MIN_LENGTH) {
				score = scoring.ITEM_TITLE_MIN_LENGTH;
			}
			score = score + hasBadWords(itemTitle, scoring.ITEM_TITLE_BAD_WORDS, scoring.ITEM_TITLE_NO_BAD_WORDS);
			score = score + hasBadCharacters(itemTitle, "_", scoring.ITEM_TITLE_NO_UNDERSCORE);
			score = score + isUpperCase(itemTitle);
			return score;
		}

		// set item summary score
		function setItemSummaryScore(itemSummary) {
			var score = 0;
			if (itemSummary === "" || itemSummary === null) {
				score = 0;
			} else {
				score = scoring.ITEM_SUMMARY_MUST_EXIST;
				var strippedString = itemSummary.replace(/(<([^>]+)>)/ig, "");
				var nWords = getNumWords(strippedString);
				if (nWords >= scoring.ITEM_SUMMARY_MIN_NUM_WORDS) {
					score = score + scoring.ITEM_SUMMARY_MIN_LENGTH;
				}
				score = score + hasBadWords(strippedString, scoring.ITEM_SUMMARY_CONTENT, scoring.ITEM_SUMMARY_NO_BAD_WORDS);
				score = score + hasBadCharacters(strippedString, "_", scoring.ITEM_SUMMARY_NO_UNDERSCORE);
			}
			return score;
		}

		// set item description score
		function setItemDescriptionScore(itemDescription) {
			var score = 0;
			if (itemDescription === "" || itemDescription === null) {
				score = 0;
			} else {
				score = score + scoring.ITEM_DESCRIPTION_MUST_EXIST;
				var strippedString = itemDescription.replace(/(<([^>]+)>)/ig, "");
				var nWords = getNumWords(strippedString);
				if (nWords >= scoring.ITEM_DESC_MIN_LENGTH) {
					score = score + scoring.ITEM_DESCRIPTION_MIN_LENGTH;
				}
				if (itemDescription.search("href") > -1) {
					score = score + scoring.ITEM_DESCRIPTION_LINK;
				}
			}
			return score;
		}

		// set item access and use constraints score
		function setAccessAndUseConstraintsScore(itemAccessAndConstraints) {
			var score = 0;
			if (itemAccessAndConstraints === "" || itemAccessAndConstraints === null) {
				score = 0;
			} else {
				score = score + scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_WORDS;
				var strippedString = itemAccessAndConstraints.replace(/(<([^>]+)>)/ig, "");
				var nWords = getNumWords(strippedString);
				if (nWords >= scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_BONUS_WORDS) {
					score = score + scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_MIN_WORDS;
				}
				if (itemAccessAndConstraints.search("href") > -1) {
					score = score + scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_VALID_LINK;
				}
			}
			return score;
		}

		// set credit score
		function setCredtisScore(itemCredit) {
			var score = 0;
			if (itemCredit === "" || itemCredit === null) {
				score = 0;
			} else {
				score = scoring.ITEM_CREDITS_HAS_WORDS;
			}
			return score;
		}

		// validate tags
		function validateItemTags(tags) {
			var score = 0;
			var badWords = scoring.TAGS_PENALTY_WORDS;
			var nTags = tags.length;
			if (nTags >= scoring.TAGS_HAS_TAGS) {
				// at least one tag exist +1
				score = scoring.TAGS_HAS_TAGS;
				// case insensitive
				var tempTags = [];
				array.forEach(tags, function (tag) {
					tempTags.push(tag.toLowerCase());
				});
				// check if any tags are bad words
				if (array.some(badWords, function (badWord) {
					return tempTags.indexOf(badWord.toLowerCase()) !== -1;
				})) {
					// FAIL
				} else {
					// PASS +2
					score = score + scoring.TAGS_HAS_NO_BAD_WORDS;
				}

				// check if there are more than 3 tags
				if (nTags > 3) {
					score = score + scoring.TAGS_HAS_CUSTOM_TAGS_MIN;
				}
				var hasAtlasTag = false;
				array.forEach(defaults.ATLAS_TAGS, function (atlas_tag) {
					array.forEach(tempTags, function (tag) {
						if (tag === atlas_tag.tag.toLowerCase()) {
							hasAtlasTag = true;
						}
					});
				});

				if (hasAtlasTag) {
					score = score + scoring.TAGS_HAS_ATLAS_TAGS;
				}
			} else {
				score = 0;
			}
			console.log("TAGS score: " + score);
			return score;
		}

		function setUserProfileFullNameScore(userName) {
			var score = 0;
			if (userName === "" || userName === null) {
				score = 0;
			} else {
				score = score + scoring.USER_PROFILE_HAS_FULLNAME_MIN_NUM_WORDS;
				score = score + hasBadCharacters(userName, "_", scoring.USER_PROFILE_FULLNAME_HAS_NO_UNDERSCORE);
			}
			return score;
		}

		function setUserDescriptionScore(userDescription) {
			var score = 0;
			if (userDescription === "" || userDescription === null) {
				score = 0;
			} else {
				// has text +1
				score = scoring.USER_PROFILE_DESCRIPTION_HAS_DESCRIPTION;
				// has link 1
				var strippedString = userDescription.replace(/(<([^>]+)>)/ig, "");
				score = score + hasUrl(strippedString, scoring.USER_PROFILE_DESCRIPTION_HAS_LINK);
				var nWords = getNumWords(strippedString);
				if (nWords > 10) {
					// > 10 +1
					score = score + scoring.USER_PROFILE_DESCRIPTION_HAS_MIN_NUM_WORDS;
				}
				var nSentences = userDescription.match( /[^\.!\?]+[\.!\?]+/g).length;
				if (nSentences >= 2) {
					// 2 min sentence +2
					score = score + scoring.USER_PROFILE_DESCRIPTION_HAS_MIN_NUM_SENTENCES;
				}

				var emails = extractEmails(userDescription);
				if (emails !== null) {
					// has email +2
					score = score + scoring.USER_PROFILE_DESCRIPTION_HAS_EMAIL;
				}
			}
			return score;
		}

		function extractEmails(text) {
			return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
		}

		function hasUrl(str, bonus) {
			var pattern = new RegExp("((?:(http|https|Http|Https|rtsp|Rtsp):\\/\\/(?:(?:[a-zA-Z0-9\\$\\-\\_\\.\\+\\!\\*\\'\\(\\)"
					+ "\\,\\;\\?\\&\\=]|(?:\\%[a-fA-F0-9]{2})){1,64}(?:\\:(?:[a-zA-Z0-9\\$\\-\\_"
					+ "\\.\\+\\!\\*\\'\\(\\)\\,\\;\\?\\&\\=]|(?:\\%[a-fA-F0-9]{2})){1,25})?\\@)?)?"
					+ "((?:(?:[a-zA-Z0-9][a-zA-Z0-9\\-]{0,64}\\.)+"   // named host
					+ "(?:"   // plus top level domain
					+ "(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])"
					+ "|(?:biz|b[abdefghijmnorstvwyz])"
					+ "|(?:cat|com|coop|c[acdfghiklmnoruvxyz])"
					+ "|d[ejkmoz]"
					+ "|(?:edu|e[cegrstu])"
					+ "|f[ijkmor]"
					+ "|(?:gov|g[abdefghilmnpqrstuwy])"
					+ "|h[kmnrtu]"
					+ "|(?:info|int|i[delmnoqrst])"
					+ "|(?:jobs|j[emop])"
					+ "|k[eghimnrwyz]"
					+ "|l[abcikrstuvy]"
					+ "|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])"
					+ "|(?:name|net|n[acefgilopruz])"
					+ "|(?:org|om)"
					+ "|(?:pro|p[aefghklmnrstwy])"
					+ "|qa"
					+ "|r[eouw]"
					+ "|s[abcdeghijklmnortuvyz]"
					+ "|(?:tel|travel|t[cdfghjklmnoprtvwz])"
					+ "|u[agkmsyz]"
					+ "|v[aceginu]"
					+ "|w[fs]"
					+ "|y[etu]"
					+ "|z[amw]))"
					+ "|(?:(?:25[0-5]|2[0-4]" // or ip address
					+ "[0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\\.(?:25[0-5]|2[0-4][0-9]"
					+ "|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\\.(?:25[0-5]|2[0-4][0-9]|[0-1]"
					+ "[0-9]{2}|[1-9][0-9]|[1-9]|0)\\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}"
					+ "|[1-9][0-9]|[0-9])))"
					+ "(?:\\:\\d{1,5})?)" // plus option port number
					+ "(\\/(?:(?:[a-zA-Z0-9\\;\\/\\?\\:\\@\\&\\=\\#\\~"  // plus option query params
					+ "\\-\\.\\+\\!\\*\\'\\(\\)\\,\\_])|(?:\\%[a-fA-F0-9]{2}))*)?"); // fragment locator
			if (!pattern.test(str)) {
				return 0;
			} else {
				return bonus;
			}
		}

		function getNumWords(s) {
			// exclude white space
			s = s.replace(/(^\s*)|(\s*$)/gi, "");
			s = s.replace(/[ ]{2,}/gi, " ");
			// exclude newline with a space at beginning
			s = s.replace(/\n /, "\n");
			return s.split(" ").length;
		}

		function validateNumWords(inputText, minNumWords) {
			var nWords = 0;
			if (inputText.length > 0) {
				nWords = getNumWords(inputText);
			}

			if (nWords < minNumWords) {
				return false;
			} else {
				return true;
			}
		}

		function hasBadWords(inputText, badWords, bonus) {
			if (array.some(badWords, function (badWord) {
				return inputText.search(badWord) >= 0;
			})) {
				// yes
				return 0;
			} else {
				// no
				return bonus;
			}
		}

		function hasBadCharacters(inputText, badChars, bonus) {
			if (inputText.indexOf(badChars) == -1) {
				return bonus;
			} else {
				return 0;
			}
		}

		function isUpperCase(str) {
			if (str === str.toUpperCase()) {
				return 0;
			} else {
				return scoring.ITEM_TITLE_NO_ALL_CAPS;
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

		function createTooltips(nodes, content) {
			array.forEach(nodes, function (node, i) {
				var userDescriptionTooltip = new Tooltip({
					connectId:[node],
					style:{
						width:"10px"
					},
					label:content[i]
				});
			});
		}

		function uploadItemThumbnail(item, imageSizeName) {
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

		function uploadUserProfileThumbnail(imageSizeName) {
			var deferred = new Deferred();
			var previewDlg = new Dialog({
				title: "Update Thumbnail",
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
								updateUserProfileThumbnail(form).then(lang.hitch(this, function (response) {
									previewDlg.hide();
									if (response) {
										esriRequest({
											url: lang.replace("{url}", portalUser),
											content: {
												f: "json"
											},
											handleAs: "json"
										}).then(lang.hitch(this, function (obj) {
													portalUserThumbnailUrl = portalUserThumbnailUrl.substring(0, portalUserThumbnailUrl.lastIndexOf("/"));
													portalUserThumbnailUrl = portalUserThumbnailUrl + "/" + obj.thumbnail;
													domAttr.set(query(".profileThumbnailUrl")[0], "src", portalUserThumbnailUrl);
												}));
									}
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

		function updateUserProfileThumbnail(form) {
			//console.log(lang.replace("{url}/update", portalUser));
			var deferred = new Deferred();
			esriRequest({
				url: lang.replace("{url}/update", portalUser),
				form: form,
				content: {
					f: "json"
				},
				handleAs: "json"
			}).then(deferred.resolve, deferred.reject);
			return deferred.promise;
		}

		function validateStr(str) {
			if (str === null || "") {
				return "";
			} else {
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

		function setMapDrawTimeScore(val) {
			var temp = (val / 1000) % 60;
			var seconds = number.format(temp, {
				places: 5
			});

			if (seconds < defaults.drawTime.BEST) {
				return scoring.PERFORMANCE_DRAW_TIME_BEST;
			} else if (seconds < defaults.drawTime.BETTER) {
				return scoring.PERFORMANCE_DRAW_TIME_BETTER;
			} else if (seconds < defaults.drawTime.GOOD) {
				return scoring.PERFORMANCE_DRAW_TIME_GOOD;
			} else {
				return 0;
			}
		}

		function setPopupScore(layers) {
			var score = 0;
			var isCustomPopup = false;
			array.forEach(layers, function (layer) {
				var popupInfo;
				if (layer.featureCollection !== undefined) {
					popupInfo = layer.featureCollection.layers[0].popupInfo;
					if (popupInfo.description !== null) {
						isCustomPopup = true;
						score = scoring.PERFORMANCE_POPUPS_CUSTOM;
					}
				} else {
					score = 0;
				}
			});
			return score;
		}

		function setNumLayersScore(layers) {
			if (layers !== undefined) {
				var nLayers = layers.length;
				if (nLayers > scoring.LAYER_COUNT_MAX) {
					return scoring.PERFORMANCE_LAYER_COUNT_GOOD;
				} else if (nLayers > scoring.LAYER_COUNT_MIN && nLayers <= scoring.LAYER_COUNT_MAX) {
					return scoring.PERFORMANCE_LAYER_COUNT_BETTER;
				} else if (nLayers === scoring.LAYER_COUNT_MIN) {
					return scoring.PERFORMANCE_LAYER_COUNT_BEST;
				} else {
					return 0;
				}
			}
		}

		function setSharingScore(item) {
			var sharing = item.access;
			if (sharing === "private") {
				return scoring.PERFORMANCE_SHARING_PRIVATE;
			} else if (sharing === "org" || sharing === "shared") {
				return scoring.PERFORMANCE_SHARING_ORG;
			} else {
				return scoring.PERFORMANCE_SHARING_PUBLIC;
			}
		}

		function setPassFailStyleOnTabNode(score, node, sectionThreshold) {
			var average = Math.floor(score/sectionThreshold * 100);
			var classAttrs = domAttr.get(node, "class");
			if (average >= 80) {
				classAttrs = classAttrs.replace("icon-edit", "icon-check");
				domAttr.set(node, "class", classAttrs);
				domStyle.set(node, "color", "#007ac2");
				domStyle.set(node, "border", "1px solid #007ac2");
			} else {
				classAttrs = classAttrs.replace("icon-check", "icon-edit");
				domAttr.set(node, "class", classAttrs);
				domStyle.set(node, "color", "#C86A4A");
				domStyle.set(node, "border", "1px solid #C86A4A");
			}
		}

		function initPassingMarker() {
			domConstruct.place("<div class='current-score-passing-marker'>" +
					"<span class='current-overall-gr-number'> 80</span>" +
					"<span class='current-overall-gr-label'>required score</span>" +
					"</div>", progressBarNode, "before");
		}

		function initContentButtonGroup(id) {
			domConstruct.place(
					'<div class="row btn-group-container">' +
					'	<div class="btn-group column-24 icon-edit-btn-group">' +
					'		<a class="column-4 details-tab-node icon-edit"> ' + defaults.DETAILS + '</a>' +
					'		<a class="column-4 credits icon-edit"> ' + defaults.USE_CREDITS + '</a>' +
					'		<a class="column-4 tags icon-edit"> ' + defaults.TAGS + '</a>' +
					'		<a class="column-4 performance icon-edit"> ' + defaults.PERFORMANCE + '</a>' +
					'		<a class="column-4 profile icon-edit"> ' + defaults.MY_PROFILE + '</a>' +
					'	</div>' +
					'</div>', id, "last");

			detailsNode = query(".details-tab-node")[0];
			creditsNode = query(".credits")[0];
			tagsNode = query(".tags")[0];
			performanceNode = query(".performance")[0];
			profileNode = query(".profile")[0];
			nodeList = [detailsNode, creditsNode, tagsNode, performanceNode, profileNode];
		}

		function initScoreMaxValues() {
			// Details
			ITEM_THUMBNAIL_MAX_SCORE = scoring.ITEM_THUMBNAIL_NONE + scoring.ITEM_THUMBNAIL_CUSTOM + scoring.ITEM_THUMBNAIL_LARGE;
			ITEM_TITLE_MAX_SCORE = scoring.ITEM_TITLE_NO_BAD_WORDS + scoring.ITEM_TITLE_NO_UNDERSCORE + scoring.ITEM_TITLE_MIN_LENGTH + scoring.ITEM_TITLE_NO_ALL_CAPS;
			ITEM_SUMMARY_MAX_SCORE = scoring.ITEM_SUMMARY_MUST_EXIST + scoring.ITEM_SUMMARY_NO_BAD_WORDS + scoring.ITEM_SUMMARY_NO_UNDERSCORE + scoring.ITEM_SUMMARY_MIN_LENGTH;
			ITEM_DESC_MAX_SCORE = scoring.ITEM_DESCRIPTION_MUST_EXIST + scoring.ITEM_DESCRIPTION_MIN_LENGTH + scoring.ITEM_DESCRIPTION_LINK;
			ITEM_DETAILS_MAX_SCORE = ITEM_THUMBNAIL_MAX_SCORE + ITEM_TITLE_MAX_SCORE + ITEM_SUMMARY_MAX_SCORE + ITEM_DESC_MAX_SCORE;
			// Use/Credits
			ITEM_CREDIT_MAX_SCORE = scoring.ITEM_CREDITS_HAS_WORDS;
			ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE = scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_WORDS + scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_MIN_WORDS + scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_BONUS_WORDS + scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_VALID_LINK;
			ITEM_USE_CONSTRAINS_MAX_SCORE = ITEM_CREDIT_MAX_SCORE + ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE;
			// Tags
			TAGS_MAX_SCORE = scoring.TAGS_HAS_TAGS + scoring.TAGS_HAS_ATLAS_TAGS + scoring.TAGS_HAS_CUSTOM_TAGS_MIN + scoring.TAGS_HAS_NO_BAD_WORDS;
			// Performance
			PERFORMANCE_SHARING_MAX_SCORE = scoring.PERFORMANCE_MAX;
			PERFORMANCE_POPUPS_MAX_SCORE = scoring.PERFORMANCE_POPUPS_ENABLED + scoring.PERFORMANCE_POPUPS_CUSTOM;
			PERFORMANCE_DRAW_TIME_MAX_SCORE = scoring.PERFORMANCE_MAX;
			PERFORMANCE_LAYER_COUNT_MAX_SCORE = scoring.PERFORMANCE_MAX;
			PERFORMANCE_MAX_SCORE = PERFORMANCE_SHARING_MAX_SCORE + PERFORMANCE_POPUPS_MAX_SCORE + PERFORMANCE_DRAW_TIME_MAX_SCORE + PERFORMANCE_LAYER_COUNT_MAX_SCORE;
			// User Profile
			USER_PROFILE_THUMBNAIL = scoring.USER_PROFILE_HAS_THUMBNAIL + scoring.USER_PROFILE_HAS_LARGE_THUMBNAIL;
			USER_PROFILE_FULLNAME = scoring.USER_PROFILE_HAS_FULLNAME_MIN_NUM_WORDS + scoring.USER_PROFILE_FULLNAME_HAS_NO_UNDERSCORE;
			USER_PROFILE_DESCRIPTION = scoring.USER_PROFILE_DESCRIPTION_HAS_DESCRIPTION + scoring.USER_PROFILE_DESCRIPTION_HAS_MIN_NUM_SENTENCES + scoring.USER_PROFILE_DESCRIPTION_HAS_MIN_NUM_WORDS + scoring.USER_PROFILE_DESCRIPTION_HAS_LINK + scoring.USER_PROFILE_DESCRIPTION_HAS_EMAIL;
			USER_PROFILE_MAX_SCORE = USER_PROFILE_THUMBNAIL + USER_PROFILE_FULLNAME + USER_PROFILE_DESCRIPTION;

			MAX_SCORE = ITEM_DETAILS_MAX_SCORE + ITEM_USE_CONSTRAINS_MAX_SCORE + TAGS_MAX_SCORE + PERFORMANCE_MAX_SCORE + USER_PROFILE_MAX_SCORE;
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

		function destroyNodes(_categoryNodes) {
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
			array.forEach(_categoryNodes, function (category) {
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

		function addCheckbox(itemTags, id, atlasTag) {
			console.log(itemTags);
			console.log(id);
			console.log(atlasTag);
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

		function fadeLoader() {
			var loaderNode = dom.byId("map-mask");
			domStyle.set(loaderNode, "opacity", "1");
			var fadeArgs = {
				node: "map-mask",
				duration: 1000
			};
			fx.fadeOut(fadeArgs).play();
		}
	});
});
