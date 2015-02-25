require([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"put-selector/put",
	"dgrid/extensions/Pagination",
	"dgrid/OnDemandGrid",
	"dijit/Dialog",
	"dijit/Editor",
	"dijit/_editor/plugins/LinkDialog",
	"dijit/_editor/plugins/TextColor",
	"dijit/_editor/plugins/ViewSource",
	"dijit/_editor/plugins/FontChoice",
	"dijit/form/Button",
	"dijit/form/CheckBox",
	"dijit/ProgressBar",
	"dijit/registry",
	"dijit/Tree",
	"dijit/tree/ForestStoreModel",
	"dijit/tree/ObjectStoreModel",
	"dojo/aspect",
	"dojo/data/ItemFileReadStore",
	"dojo/date",
	"dojo/Deferred",
	"dojo/dom",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/html",
	"dojo/json",
	"dojo/keys",
	"dojo/number",
	"dojo/on",
	"dojo/parser",
	"dojo/ready",
	"dojo/query",
	"dojo/store/Memory",
	"dojo/string",
	"esri/arcgis/Portal",
	"esri/arcgis/OAuthInfo",
	"esri/IdentityManager",
	"esri/arcgis/utils",
	"esri/Color",
	"esri/config",
	"esri/geometry/Point",
	"esri/graphic",
	"esri/layers/FeatureLayer",
	"esri/layers/ArcGISImageServiceLayer",
	"esri/map",
	"esri/request",
	"esri/tasks/query",
	"esri/tasks/QueryTask",
	"esri/symbols/SimpleMarkerSymbol",
	"config/defaults",
	"config/details",
	"config/gridUtils",
	"config/credits",
	"config/tags",
	"config/tagUtils",
	"config/performance",
	"config/profile",
	"config/tooltips",
	"config/scoring",
	"config/validator",
	/*"esri/dijit/Tags",*/
	"config/CustomTagsWidget",
	"config/uiUtils",
	"config/portalUtils",
	"config/scoringUtils",
	"config/nominateUtils",
	"dojo/NodeList-traverse"
], function (array, declare, lang, put, Pagination, OnDemandGrid, Dialog, Editor, LinkDialog, TextColor, ViewSource, FontChoice, Button, CheckBox,
			 ProgressBar, registry, Tree, ForestStoreModel, ObjectStoreModel, aspect, ItemFileReadStore, date, Deferred,
			 dom, domAttr, domClass, domConstruct, domStyle, html, JSON, keys, number, on, parser, ready, query,
			 Memory, string, arcgisPortal, ArcGISOAuthInfo, esriId, arcgisUtils, Color, config, Point, Graphic,
			 FeatureLayer, ArcGISImageServiceLayer, Map, esriRequest, Query, QueryTask, SimpleMarkerSymbol, defaults, details,
			 GridUtils, credits, tags, TagUtils, performanceConfig, profileConfig, tooltipsConfig, scoring, Validator,
			 CustomTagsWidget, UserInterfaceUtils, PortalUtils, ScoringUtils, NominateUtils) {

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
	var detailsNode = "";
	var creditsNode = "";
	var tagsNode = "";
	var performanceNode = "";
	var profileNode = "";
	var nodeList = [];

	var ribbonHeaderNumItemsNode = "";
	var searchInputNode = "";
	var dropdownSortNode = "";
	var dropdownItemFilterNode = "";
	var helpButtonNode = "";
	var nominateBtnNode = null;
	var progressBarNode = "";
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
	var TAB_CONTAINER_USERNAME = "username-";
	var TAB_CONTAINER_USERDESCRIPTION = "userdesc-";

	var rowID = null;
	var tcID = null;
	var titleID = null;
	var descID = null;
	var snippetID = null;
	var accessID = null;
	var creditID = null;
	var userNameID = null;
	var userDescriptionID = null;

	var portalUrl;
	var portal;
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
	var nominateBtnClickHandler = null;
	// Overall score
	//
	var currentOverallScoreNode;
	// graphic
	var overallScoreGraphic;

	//
	var checkBoxID_values = [];
	var tagStore = null;
	var atlasTagStore = null;
	//var tagsDijit;
	var customTagsWidget = null;
	//
	var HAS_PERFORMANCE_CONTENT = false;
	//
	var portalUtils = null;
	var gridUtils = null;
	var validator = null;
	var userInterfaceUtils = null;
	var tagUtils = null;
	var scoringUtils = null;
	var nominateUtils = null;

	ready(function () {

		run();

		renderRow = function (object, data, cell) {
			// item title
			var itemTitle = object.title;
			// thumbnail url
			var thumbnailUrl = userInterfaceUtils.formatThumbnailUrl(object);
			// item type
			var type = validator.validateStr(object.type);
			// item last modified
			var modifiedDate = userInterfaceUtils.formatDate(object.modified);
			// item number of views
			var views = validator.validateStr(object.numViews);
			// item access
			var access = object.access;
			// item status ("NOMINATED", "UNDER REVIEW", "ACCEPTED")
			var status = "";
			array.forEach(nominateUtils.nominatedItems.features, function (feature) {
				if (object.id === feature.attributes.itemID) {
					status = defaults.CURRENT_STATUS[1].label;
				}
			});

			var n = domConstruct.create("div", {
				innerHTML:'<div class="row">' +
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
						'		<div class="item-nomination-status-' + object.id + '">' + status + '</div>' +
						'	</div>' +
						'</div>'
			});
			cell.appendChild(n);
		};

		detailsNodeClickHandler = function (nodeList, detailsNode) {
			array.forEach(nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4", "active column-4");
					detailsContentPane();
				}
			});
			domClass.replace(detailsNode, "active column-4 details-tab-node", "column-4 details-tab-node");
		};
		creditsNodeClickHandler = function (nodeList, creditsNode) {
			array.forEach(nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4", "active column-4");
					creditsContentPane();
				}
			});
			domClass.replace(creditsNode, "active column-4 credits", "column-4 credits");
		};
		tagsNodeClickHandler = function (nodeList, tagsNode) {
			array.forEach(nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4", "active column-4");
					tagsContentPane();
				}
			});
			domClass.replace(tagsNode, "active column-4 tags", "column-4 tags");
		};
		performanceNodeClickHandler = function (nodeList, response, layers, performanceNode) {
			array.forEach(nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4", "active column-4");
					performanceContentPane(response, layers);
				}
			});
			domClass.replace(performanceNode, "active column-4 performance", "column-4 performance");
		};
		profileNodeClickHandler = function (nodeList, profileNode) {
			array.forEach(nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4", "active column-4");
					profileContentPane();
				}
			});
			domClass.replace(profileNode, "active column-4 profile", "column-4 profile");
		};

		function run() {
			// nominate item utility methods
			nominateUtils = NominateUtils(defaults);
			// user interface utility methods
			userInterfaceUtils = new UserInterfaceUtils();
			userInterfaceUtils.startup();
			// sign in node
			userInterfaceUtils.setNodeContent(".intro", defaults.INTRO_TEXT_1);

			// ribbon header
			ribbonHeaderNumItemsNode = dom.byId("ribbon-header-num-items");
			userInterfaceUtils.setNodeContent(".ribbon-header-title", defaults.HEADER_TEXT_PUBLIC);

			searchInputNode = query(".search-items")[0];
			dropdownSortNode = query(".dropdown-item-sort")[0];
			dropdownItemFilterNode = query(".dropdown-item-filter")[0];
			helpButtonNode = query(".help-button")[0];

			portalUrl = document.location.protocol + '//www.arcgis.com';
			portal = new arcgisPortal.Portal(portalUrl);

			on(portal, "ready", lang.hitch(this, function (p) {
				on(dom.byId(SIGNIN_BUTTON_ID), "click", portalSignInHandler);
				on(searchInputNode, "keydown", searchItemsClickHandler);
				on(query(".filter-list"), "click", filterItemsClickHandler);
				on(query(".sort-items"), "click", sortItemsClickHandler);
				on(query(".icon-help")[0], "click", helpBtnClickHandler);
			}));
		}

		function portalSignInHandler() {
			portal.signIn().then(function (user) {
				portalUtils = new PortalUtils(portal);
				// scoring
				scoringUtils = new ScoringUtils();
				scoringUtils.startup();
				// load the validation rules
				validator = new Validator();
				validator.startup();
				// tag utility methods
				tagUtils = new TagUtils();
				tagUtils.startup();

				// update the header row
				userInterfaceUtils.updateHeader();
				// The username for the user.
				owner = portalUtils.portalUser.username;
				// The url to the thumbnail image for the user.
				portalUserThumbnailUrl = portalUtils.portalUser.thumbnailUrl;
				// If user has no thumbnail, apply the default thumbnail for a user
				if (portalUserThumbnailUrl === null) {
					portalUserThumbnailUrl = "https://cdn.arcgis.com/cdn/5777/js/arcgisonline/css/images/no-user-thumb.jpg";
				}

				// query the user's items
				// TODO What about more than maximum allowable returned items
				var params = {
					q: "owner:" + owner,
					num: 1000
				};
				portal.queryItems(params).then(function (result) {
					// total number of items
					var numItems = result.total;

					// update the ribbon header
					domAttr.set(query(".ribbon-header-title").parent()[0], "class", "");
					userInterfaceUtils.setNodeContent(".ribbon-header-title", defaults.HEADER_BLOCK_PRIVATE);
					var hdrUserNameText = " (" + portalUtils.portalUser.fullName + " - " + owner + ")";
					userInterfaceUtils.setNodeContent(".ribbon-header-user", hdrUserNameText);
					ribbonHeaderNumItemsNode.innerHTML = " " + numItems + " Items";
					domAttr.set(ribbonHeaderNumItemsNode, "class", "icon-stack");

					// Living Atlas tags
					atlasTagStore = new Memory({
						data: defaults.TAGS_STORE,

						// Returns all direct children of this widget
						getChildren: function (object) {
							return this.query({
								parent: object.id
							});
						}
					});

					nominateUtils.loadNominatedItemsInMemory().then(function (results) {
						nominateUtils.nominatedItems = results;

						if (numItems > 0) {
							// dGrid columns
							var dgridColumns = [
								{
									label: "",
									field: "thumbnailUrl",
									renderCell: renderRow
								}
							];
							// dGrid item store
							itemStore = new Memory({
								data: result.results
							});
							// dGrid
							dgrid = new (declare([OnDemandGrid, Pagination]))({
								store:itemStore,
								rowsPerPage:6,
								pagingLinks:true,
								pagingTextBox:false,
								firstLastArrows:true,
								columns:dgridColumns,
								showHeader:false,
								noDataMessage:"No results found"
							}, "dgrid");
							dgrid.startup();

							gridUtils = new GridUtils(portal, dgrid, userInterfaceUtils);
							gridUtils.startup();

							// initialize the maximum possible scores for each section and the overall possible maximum score
							// for all the sections combined
							//scoringUtils.initScoreMaxValues();

							// "Nominate" button edits-complete handler
							on(nominateUtils.nominateAdminFeatureLayer, "edits-complete", nominateCompleteHandler);

							// item title click handler
							on(dgrid.domNode, ".item-title:click", function (event) {
								// selected row
								selectedRow = dgrid.row(event).element;
								// selected row ID
								selectedRowID = domAttr.get(selectedRow, "id").split("dgrid-row-")[1];
								// get row width
								var selectedNodeWidth = domStyle.get(selectedRow, "width") - 10;
								// set row height (expand the row)
								domStyle.set(selectedRow, "height", "600px");

								if (previousSelectedRow) {
									// collapse the previously selected row height
									userInterfaceUtils.updateNodeHeight(previousSelectedRow, COLLAPSE_ROW_HEIGHT);
									domConstruct.destroy(EXPANDED_ROW_NAME + previousSelectedRowID);
									if (previousSelectedRowID === selectedRowID) {
										previousSelectedRowID = "";
										previousSelectedRow = null;
									} else {
										// expand selected row height
										userInterfaceUtils.updateNodeHeight(selectedRow, EXPAND_ROW_HEIGHT);
										previousSelectedRow = selectedRow;
									}
								} else {
									userInterfaceUtils.updateNodeHeight(selectedRow, EXPAND_ROW_HEIGHT);
									previousSelectedRow = selectedRow;
								}

								if (previousSelectedRowID !== selectedRowID && previousSelectedRow !== null) {
									previousSelectedRowID = selectedRowID;
									// unique id's
									rowID = EXPANDED_ROW_NAME + selectedRowID;
									tcID = TAB_CONTAINER_NAME + selectedRowID;
									titleID = TAB_CONTAINER_TITLE + selectedRowID;
									descID = TAB_CONTAINER_DESC + selectedRowID;
									snippetID = TAB_CONTAINER_SNIPPET + selectedRowID;
									accessID = TAB_CONTAINER_LICENSE + selectedRowID;
									creditID = TAB_CONTAINER_CREDITS + selectedRowID;
									userNameID = TAB_CONTAINER_USERNAME + selectedRowID;
									userDescriptionID = TAB_CONTAINER_USERDESCRIPTION + selectedRowID;
									nominateUtils.nominateBtnID = nominateUtils.NOMINATE_BTN_ID + selectedRowID;

									portalUtils.portalUser.getItem(selectedRowID).then(function (item) {
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
														"				<div class='current-score-number'></div>" +
														"				<div id='progressBarMarker'></div>" +
														"			</div>" +
														"			<div class='column-3 right' style='margin-top: -15px !important;'>" +
														"				<button id='" + nominateUtils.nominateBtnID + "' class='btn icon-email custom-btn disabled'> NOMINATE </button>" +
														"			</div>" +
														"		</div>" +

													// Overall Score
														"		<div class='row'>" +
														"			<div class='column-15 pre-3'>" +
														"				<div class='expanded-item-text'>" + defaults.OVERALL_TXT + "</div>" +
														"			</div>" +
														"		</div>" +

													// Button Group (i.e. sections)
														"		<div class='row'>" +
														"			<div class='column-18 pre-3'>" +
														"				<div id='" + tcID + "'></div>" +
														"			</div>" +
														"		</div>" +
														"	</div>" +
														"</div>",
												selectedRow.firstElementChild, "last");

										// get overall score node
										currentOverallScoreNode = query(".current-score-number")[0];
										// get progress bar node
										progressBarNode = query(".current-score-graphic-container")[0];
										// nominate button node
										nominateBtnNode = dom.byId(nominateUtils.nominateBtnID);

										// create button group
										initContentButtonGroup(tcID);

										// initialize content area with details data
										detailsContentPane();
										domClass.replace(detailsNode, "active column-4 details-tab-node", "column-4 details-tab-node");

										if (item.type === "Web Map") {
											var mapDrawBegin = performance.now();
											var mapDrawComplete;
											// Web Map, Feature Service, Map Service, Image Service, Web Mapping Application
											arcgisUtils.createMap(selectedRowID, "map").then(function (response) {
												//console.log(response);
												layers = response.itemInfo.itemData.operationalLayers;
												map = response.map;

												// make sure map is loaded
												if (map.loaded) {
													mapDrawComplete = performance.now();
													var mapDrawTime = (mapDrawComplete - mapDrawBegin);
													userInterfaceUtils.fadeLoader();

													// set performance scores
													scoringUtils.mapDrawTimeScore = validator.setMapDrawTimeScore(mapDrawTime);
													scoringUtils.nLayersScore = validator.setNumLayersScore(response);
													scoringUtils.popupsScore = validator.setPopupScore(response);
													scoringUtils.sharingScore = validator.setSharingScore(item);
													scoringUtils.performanceScore = scoringUtils.mapDrawTimeScore + scoringUtils.nLayersScore + scoringUtils.popupsScore + scoringUtils.sharingScore;
													// set style on performance button
													userInterfaceUtils.setPassFailStyleOnTabNode(scoringUtils.performanceScore, performanceNode, scoringUtils.PERFORMANCE_MAX_SCORE);
													// initialize the scores
													updateScore(item);
													HAS_PERFORMANCE_CONTENT = true;

													on(performanceNode, "click", lang.partial(performanceNodeClickHandler, nodeList, response, layers, performanceNode));
												}
											});
										} else {
											// fade the loader
											userInterfaceUtils.fadeLoader();
											// hide the map div
											domStyle.set("map", "display", "none");
											//
											on(performanceNode, "click", lang.partial(performanceNodeClickHandler, nodeList, "", layers, performanceNode));

											scoringUtils.mapDrawTimeScore = 0;
											scoringUtils.nLayersScore = 0;
											scoringUtils.popupsScore = 0;
											scoringUtils.sharingScore = validator.setSharingScore(item);
											scoringUtils.performanceScore = scoringUtils.mapDrawTimeScore + scoringUtils.nLayersScore + scoringUtils.popupsScore + scoringUtils.sharingScore;

											// initialize the scores
											updateScore(item);
											HAS_PERFORMANCE_CONTENT = false;
										}
										on(detailsNode, "click", lang.partial(detailsNodeClickHandler, nodeList, detailsNode));
										on(creditsNode, "click", lang.partial(creditsNodeClickHandler, nodeList, creditsNode));
										on(tagsNode, "click", lang.partial(tagsNodeClickHandler, nodeList, tagsNode));
										on(profileNode, "click", lang.partial(profileNodeClickHandler, nodeList, profileNode));

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
												value: scoringUtils.overAllCurrentScore
											}).placeAt(progressBarNode).startup();
										}

										//var barAttr = domStyle.get(query(".dijitProgressBarLabel")[0]);
										//var externalBarWidth = domStyle.get(query(".dijitProgressBarLabel")[0], "width");
										//var internalBarWidth = domStyle.get(query(".dijitProgressBarFull")[0], "width");

										// draw the minimum score marker
										userInterfaceUtils.initPassingMarker(progressBarNode);
									});
								}
							});
						}
					});
				});
			});
		}

		function filterItemsClickHandler() {
			var checkedListItem = query(".filter-check");
			domAttr.set(checkedListItem, "class", "filter-list");
			domClass.remove(checkedListItem[0], "icon-check filter-check");
			domStyle.set(checkedListItem, "margin-left", "20px");
			query(".filter-list").style("margin-left", "20px");
			domAttr.set(this, "class", "filter-list icon-check filter-check");
			domStyle.set(this, "margin-left", "2px");
			var target = domAttr.get(this, "data-value");
			gridUtils.applyFilter(target);
		}

		function sortItemsClickHandler() {
			var checkedListItem = query(".icon-check");
			domAttr.set(checkedListItem, "class", "sort-items");
			domClass.remove(checkedListItem[0], "icon-check");
			domStyle.set(checkedListItem, "margin-left", "20px");
			query(".sort-items").style("margin-left", "20px");
			domAttr.set(this, "class", "sort-items icon-check");
			domStyle.set(this, "margin-left", "2px");
			var target = domAttr.get(this, "data-value");
			gridUtils.applySort(target);
		}

		function helpBtnClickHandler() {
			var helpDialog = new Dialog({
				title:"HELP",
				content:"<div>Not implemented yet</div>",
				style:"width: 300px"
			});
			helpDialog.show();
		}

		function searchItemsClickHandler(event) {
			switch (event.keyCode) {
				case keys.ENTER:
					searchBtnClickHandler(event);
					break;
				default:
				//console.log("some other key: " + event.keyCode);
			}
		}

		function searchBtnClickHandler() {
			var searchInputNode = query(".search-input-text-box")[0];
			var searchQueryParams = searchInputNode.value;
			var queryParams = {
				q:"title: " + searchQueryParams,
				num:100
			};

			portalUtils.portalUser.portal.queryItems(queryParams).then(lang.hitch(this, function (response) {
				var searchResults = response.results;
				itemStore.data = searchResults;
				dgrid.refresh();
			}));
		}


		// BEGIN DETAILS
		function detailsContentPane() {
			portalUtils.getItem(selectedRowID).then(loadDetailsContent);
		}

		function loadDetailsContent(item) {
			// item title
			var itemTitle = validator.validateStr(item.title);
			var itemTitle_clean = itemTitle;
			// item summary
			var itemSummary = validator.validateStr(item.snippet);
			var itemSummary_clean = itemSummary;
			// item description
			var itemDescription = validator.validateStr(item.description);
			var itemDescription_clean = itemDescription;
			// thumbnail url
			var thumbnailUrl = userInterfaceUtils.formatThumbnailUrl(item);
			var thumbnailUrl_clean = thumbnailUrl;

			// load the content
			userInterfaceUtils.loadContent(details.DETAILS_CONTENT);

			// nodes
			var editSaveBtnNode = query(".edit-save-btn")[0],
					cancelBtnNode = query(".cancel-btn")[0],
					itemThumbnailNode = query(".thumbnailUrl")[0],
					itemOpenLinkNode = query(".open-item-icon")[0],
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
			domConstruct.create("div", {innerHTML:itemTitle}, itemTitleNode, "first");
			// set the summary
			domAttr.set(itemSummaryNode, "id", snippetID);
			domAttr.set(itemSummaryNode, "value", itemSummary);
			domConstruct.create("div", {innerHTML:itemSummary}, itemSummaryNode, "first");
			// set the description
			domAttr.set(itemDescriptionNode, "id", descID);
			if (itemDescription === "") {
				domConstruct.place("<span></span>", "description-editor-widget", "first");
			} else {
				domConstruct.place("<span>" + itemDescription + "</span>", "description-editor-widget", "first");
			}

			//tooltips
			userInterfaceUtils.createTooltips([itemThumbnailTooltipNode, itemTitleTooltipNode, itemSummaryTooltipNode, itemDescriptionTooltipNode],
					[tooltipsConfig.ITEM_THUMBNAIL_TOOLTIP_CONTENT, tooltipsConfig.ITEM_TITLE_TOOLTIP_CONTENT, tooltipsConfig.ITEM_SUMMARY_TOOLTIP_CONTENT, tooltipsConfig.ITEM_DESCRIPTION_TOOLTIP_CONTENT]);

			// open item link
			on(itemOpenLinkNode, "click", function () {
				window.open("http://www.arcgis.com/home/item.html?id=" + item.id, "_blank");
			});

			// set denominator
			thumbnailScoreDenominatorNode.innerHTML = scoringUtils.ITEM_THUMBNAIL_MAX_SCORE;
			titleScoreDenominatorNode.innerHTML = scoringUtils.ITEM_TITLE_MAX_SCORE;
			summaryScoreDenominatorNode.innerHTML = scoringUtils.ITEM_SUMMARY_MAX_SCORE;
			descScoreDenominatorNode.innerHTML = scoringUtils.ITEM_DESC_MAX_SCORE;

			// set numerator
			scoringUtils.itemThumbnailScore = validator.setThumbnailScore(item);
			scoringUtils.itemTitleScore = validator.setItemTitleScore(item.title);
			scoringUtils.itemSummaryScore = validator.setItemSummaryScore(item.snippet);
			scoringUtils.itemDescriptionScore = validator.setItemDescriptionScore(item.description);
			thumbnailScoreNumeratorNode.innerHTML = scoringUtils.itemThumbnailScore;
			titleScoreNumeratorNode.innerHTML = scoringUtils.itemTitleScore;
			summaryScoreNumeratorNode.innerHTML = scoringUtils.itemSummaryScore;
			descScoreNumeratorNode.innerHTML = scoringUtils.itemDescriptionScore;

			// update section style score graphics
			userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemThumbnailScore, scoringUtils.ITEM_THUMBNAIL_MAX_SCORE, thumbnailScoreNodeContainer);
			userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemTitleScore, scoringUtils.ITEM_TITLE_MAX_SCORE, titleScoreNodeContainer);
			userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemSummaryScore, scoringUtils.ITEM_SUMMARY_MAX_SCORE, summaryScoreNodeContainer);
			userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemDescriptionScore, scoringUtils.ITEM_DESC_MAX_SCORE, descScoreNodeContainer);

			// section overall score
			scoringUtils.itemDetailsScore = scoringUtils.itemThumbnailScore + scoringUtils.itemTitleScore + scoringUtils.itemSummaryScore + scoringUtils.itemDescriptionScore;
			updateSectionScore(scoringUtils.itemDetailsScore, detailsNode, scoringUtils.ITEM_DETAILS_MAX_SCORE);

			on(editSaveBtnNode, "click", function () {
				if (editSaveBtnNode.innerHTML === " EDIT ") {
					// EDIT clicked
					// update EDIT/SAVE button
					userInterfaceUtils.updateEditSaveButton(editSaveBtnNode, " SAVE ", cancelBtnNode, "block");
					domStyle.set(query(".expanded-item-thumbnail")[0], "cursor", "pointer");

					// update thumbnail
					domStyle.set(query(".edit-thumbnail-msg")[0], "display", "block");

					// update title
					domConstruct.empty(itemTitleNode);
					domConstruct.create("input", {class:"edit-title", value:itemTitle}, itemTitleNode, "first");
					domAttr.set(itemTitleNode, "data-dojo-type", "dijit/form/TextBox");
					domAttr.set(itemTitleNode, "id", titleID);

					// update summary
					domConstruct.empty(itemSummaryNode);
					domConstruct.create("input", {
						class:"edit-summary",
						value:itemSummary
					}, itemSummaryNode, "first");
					domAttr.set(itemSummaryNode, "data-dojo-type", "dijit/form/TextBox");
					domAttr.set(itemSummaryNode, "id", snippetID);

					// update description
					if (dijit.byId("description-editor-widget")) {
						dijit.byId("description-editor-widget").destroy();
						domAttr.remove(itemDescriptionNode, "id");
						domConstruct.create("div", {
							id:"description-editor-widget",
							innerHTML:itemDescription
						}, itemDescriptionNode, "first");
					}
					// create the Editor for the description
					descriptionEditor = new Editor({
						plugins:defaults.EDITOR_PLUGINS,
						innerHTML:itemDescription
					}, dom.byId("description-editor-widget"));
					descriptionEditor.startup();

					// update thumbnail
					itemThumbnailListener = on(query(".expanded-item-thumbnail"), "click", lang.hitch(this, function (event) {
						portalUtils.portalUser.getItem(selectedRowID).then(lang.hitch(this, function (userItem) {
							uploadItemThumbnail(userItem, "SMALL");
						}));
					}));
				} else {
					itemThumbnailListener.remove();

					// SAVE clicked
					itemTitle = query(".edit-title")[0].value;
					itemSummary = query(".edit-summary")[0].value;
					itemDescription = dijit.byId("description-editor-widget").value;

					// for some reason, cannot upload empty strings, probably issue on my end
					if (itemDescription.length < 0) {
						itemDescription = " ";
					}

					// write to AGOL
					portalUtils.portalUser.getItem(selectedRowID).then(function (results) {
						var _userItemUrl = results.userItemUrl;
						esriRequest({
							url:_userItemUrl + "/update",
							content:{
								f:"json",
								title:itemTitle,
								snippet:itemSummary,
								description:itemDescription
							}
						}, {
							usePost:true
						}).then(function (response) {
									if (response.success) {
										html.set(query(".title-" + selectedRowID)[0], itemTitle);
										itemTitle_clean = itemTitle;
										itemSummary_clean = itemSummary;
										itemDescription_clean = itemDescription;
										userInterfaceUtils.updateEditSaveButton(editSaveBtnNode, " EDIT ", cancelBtnNode, "none");
										// set numerator
										scoringUtils.itemThumbnailScore = validator.setThumbnailScore(results);
										scoringUtils.itemTitleScore = validator.setItemTitleScore(itemTitle);
										scoringUtils.itemSummaryScore = validator.setItemSummaryScore(itemSummary);
										scoringUtils.itemDescriptionScore = validator.setItemDescriptionScore(itemDescription);
										thumbnailScoreNumeratorNode.innerHTML = scoringUtils.itemThumbnailScore;
										titleScoreNumeratorNode.innerHTML = scoringUtils.itemTitleScore;
										summaryScoreNumeratorNode.innerHTML = scoringUtils.itemSummaryScore;
										descScoreNumeratorNode.innerHTML = scoringUtils.itemDescriptionScore;

										// update section style score graphics
										userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemThumbnailScore, scoringUtils.ITEM_THUMBNAIL_MAX_SCORE, thumbnailScoreNodeContainer);
										userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemTitleScore, scoringUtils.ITEM_TITLE_MAX_SCORE, titleScoreNodeContainer);
										userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemSummaryScore, scoringUtils.ITEM_SUMMARY_MAX_SCORE, summaryScoreNodeContainer);
										userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemDescriptionScore, scoringUtils.ITEM_DESC_MAX_SCORE, descScoreNodeContainer);

										// section overall score
										scoringUtils.itemDetailsScore = scoringUtils.itemThumbnailScore + scoringUtils.itemTitleScore + scoringUtils.itemSummaryScore + scoringUtils.itemDescriptionScore;
										updateSectionScore(scoringUtils.itemDetailsScore, detailsNode, scoringUtils.ITEM_DETAILS_MAX_SCORE);
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
					domConstruct.create("div", {innerHTML:itemTitle}, itemTitleNode, "first");
					domAttr.remove(itemTitleNode, "data-dojo-type");
					domAttr.set(itemTitleNode, "id", titleID);

					// update the summary
					domConstruct.empty(itemSummaryNode);
					domConstruct.create("div", {innerHTML:itemSummary}, itemSummaryNode, "first");
					domAttr.remove(itemSummaryNode, "data-dojo-type");
					domAttr.set(itemSummaryNode, "id", snippetID);

					// update the description
					// empty the contents
					if (dijit.byId("description-editor-widget")) {
						dijit.byId("description-editor-widget").destroy();
						domAttr.remove(itemDescriptionNode, "id");
						domConstruct.create("div", {
							id:"description-editor-widget",
							innerHTML:itemDescription
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
				domConstruct.create("div", {innerHTML:itemTitle_clean}, itemTitleNode, "first");
				domAttr.remove(itemTitleNode, "data-dojo-type");
				domAttr.set(itemTitleNode, "id", titleID);

				// update the summary
				domConstruct.empty(itemSummaryNode);
				domConstruct.create("div", {innerHTML:itemSummary_clean}, itemSummaryNode, "first");
				domAttr.remove(itemSummaryNode, "data-dojo-type");
				domAttr.set(itemSummaryNode, "id", snippetID);

				// update the description
				// empty the contents
				if (dijit.byId("description-editor-widget")) {
					dijit.byId("description-editor-widget").destroy();
				}

				domAttr.remove(itemDescriptionNode, "id");
				domConstruct.create("div", {
					id:"description-editor-widget"
				}, itemDescriptionNode, "first");

				if (itemDescription === "") {
					domConstruct.place("<span></span>", "description-editor-widget", "first");
				} else {
					domConstruct.place("<span>" + itemDescription_clean + "</span>", "description-editor-widget", "first");
				}

				domAttr.set(editSaveBtnNode, "innerHTML", " EDIT ");
				domStyle.set(cancelBtnNode, "display", "none");

				// set numerator
				//scoringUtils.itemThumbnailScore = validator.setThumbnailScore(results);
				scoringUtils.itemTitleScore = validator.setItemTitleScore(itemTitle_clean);
				scoringUtils.itemSummaryScore = validator.setItemSummaryScore(itemSummary_clean);
				scoringUtils.itemDescriptionScore = validator.setItemDescriptionScore(itemDescription_clean);
				thumbnailScoreNumeratorNode.innerHTML = scoringUtils.itemThumbnailScore;
				titleScoreNumeratorNode.innerHTML = scoringUtils.itemTitleScore;
				summaryScoreNumeratorNode.innerHTML = scoringUtils.itemSummaryScore;
				descScoreNumeratorNode.innerHTML = scoringUtils.itemDescriptionScore;

				// update section style score graphics
				userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemThumbnailScore, scoringUtils.ITEM_THUMBNAIL_MAX_SCORE, thumbnailScoreNodeContainer);
				userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemTitleScore, scoringUtils.ITEM_TITLE_MAX_SCORE, titleScoreNodeContainer);
				userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemSummaryScore, scoringUtils.ITEM_SUMMARY_MAX_SCORE, summaryScoreNodeContainer);
				userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemDescriptionScore, scoringUtils.ITEM_DESC_MAX_SCORE, descScoreNodeContainer);

				// section overall score
				scoringUtils.itemDetailsScore = scoringUtils.itemThumbnailScore + scoringUtils.itemTitleScore + scoringUtils.itemSummaryScore + scoringUtils.itemDescriptionScore;
				updateSectionScore(scoringUtils.itemDetailsScore, detailsNode, scoringUtils.ITEM_DETAILS_MAX_SCORE);
				updateOverallScore();
			});
		}
		// END DETAILS


		// CREDITS
		function creditsContentPane() {
			portalUtils.getItem(selectedRowID).then(loadCreditsContent);
		}

		function loadCreditsContent(item) {
			var itemCredits = validator.validateStr(item.accessInformation),
					itemCredits_clean = itemCredits,
					accessAndUseConstraints = validator.validateStr(item.licenseInfo),
					accessAndUseConstraints_clean = accessAndUseConstraints;

			// load the content
			userInterfaceUtils.loadContent(credits.ACCESS_CREDITS_CONTENT);

			domAttr.set(query(".creditsID-textbox")[0], "id", creditID);
			domConstruct.create("div", {innerHTML:itemCredits}, query(".creditsID-textbox")[0], "first");

			domAttr.set(query(".accessAndUseConstraintsEditor")[0], "id", accessID);
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

			userInterfaceUtils.createTooltips([accessConstraintsTooltipNode, creditsTooltipNode], [tooltipsConfig.CREDITS_TOOLTIP_CONTENT, tooltipsConfig.ACCESS_TOOLTIP_CONTENT]);

			// set denominator
			creditsScoreDenominatorNode.innerHTML = scoringUtils.ITEM_CREDIT_MAX_SCORE;
			accessScoreDenominatorNode.innerHTML = scoringUtils.ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE;

			// set numerator
			scoringUtils.itemCreditsScore = validator.setCreditsScore(item.accessInformation);
			scoringUtils.itemAccessAndUseConstraintsScore = validator.setAccessAndUseConstraintsScore(item.licenseInfo);
			creditsScoreNumeratorNode.innerHTML = scoringUtils.itemCreditsScore;
			accessScoreNumeratorNode.innerHTML = scoringUtils.itemAccessAndUseConstraintsScore;

			// update section style score graphics
			userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemCreditsScore, scoringUtils.ITEM_CREDIT_MAX_SCORE, creditsScoreNodeContainer);
			userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemAccessAndUseConstraintsScore, scoringUtils.ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE, accessScoreNodeContainer);

			scoringUtils.creditsAndAccessScore = scoringUtils.itemCreditsScore + scoringUtils.itemAccessAndUseConstraintsScore;
			updateSectionScore(scoringUtils.creditsAndAccessScore, creditsNode, scoringUtils.ITEM_USE_CONSTRAINS_MAX_SCORE);
			updateOverallScore();

			on(editSaveBtnNode, "click", function () {
				if (editSaveBtnNode.innerHTML === " EDIT ") {
					domAttr.set(editSaveBtnNode, "innerHTML", " SAVE ");
					domStyle.set(cancelBtnNode, "display", "block");
					// credits
					if (itemCredits === "<span></span>") {
						itemCredits = "";
					}

					domConstruct.empty(itemCreditsNode);
					domConstruct.create("input", {
						class:"edit-credits",
						value:itemCredits
					}, itemCreditsNode, "first");
					domAttr.set(itemCreditsNode, "data-dojo-type", "dijit/form/TextBox");
					domAttr.set(itemCreditsNode, "id", creditID);

					// access and user constraints
					if (dijit.byId("access-editor-widget")) {
						dijit.byId("access-editor-widget").destroy();
						domAttr.remove(accessAndUseConstraintsEditorNode, "id");
						domConstruct.create("div", {
							id:"access-editor-widget",
							innerHTML:accessAndUseConstraints
						}, accessAndUseConstraintsEditorNode, "first");
					}
					accessUseConstraintsEditor = new Editor({
						plugins:defaults.EDITOR_PLUGINS,
						innerHTML:accessAndUseConstraints
					}, dom.byId("access-editor-widget"));
					accessUseConstraintsEditor.startup();
				} else {
					// credits
					itemCredits = query(".edit-credits")[0].value;
					accessAndUseConstraints = dijit.byId("access-editor-widget").value;

					domConstruct.empty(itemCreditsNode);
					domConstruct.create("div", {innerHTML:itemCredits}, itemCreditsNode, "first");
					domAttr.remove(itemCreditsNode, "data-dojo-type");
					domAttr.set(itemCreditsNode, "id", creditID);

					portalUtils.portalUser.getItem(selectedRowID).then(function (results) {
						var _userItemUrl = results.userItemUrl;

						if (itemCredits.length === 0) {
							//console.log("itemCredits: " + itemCredits);
							//console.log("itemCredits: " + JSON.stringify(itemCredits).trim());
							itemCredits = "<span></span>";
						}

						if (accessAndUseConstraints.length === 0) {
							accessAndUseConstraints = "<span></span>";
						}

						esriRequest({
							url:_userItemUrl + "/update",
							content:{
								f:"json",
								licenseInfo:accessAndUseConstraints,
								accessInformation:itemCredits
							}
						}, {
							usePost:true
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
						id:"access-editor-widget"
					}, accessAndUseConstraintsEditorNode, "first");

					if (accessAndUseConstraints === "") {
						domConstruct.place("<span></span>", "access-editor-widget", "first");
					} else {
						domConstruct.place("<span>" + accessAndUseConstraints + "</span>", "access-editor-widget", "first");
					}

					// set numerator
					scoringUtils.itemCreditsScore = validator.setCreditsScore(itemCredits);
					scoringUtils.itemAccessAndUseConstraintsScore = validator.setAccessAndUseConstraintsScore(accessAndUseConstraints);
					creditsScoreNumeratorNode.innerHTML = scoringUtils.itemCreditsScore;
					accessScoreNumeratorNode.innerHTML = scoringUtils.itemAccessAndUseConstraintsScore;

					// update section style score graphics
					userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemCreditsScore, scoringUtils.ITEM_CREDIT_MAX_SCORE, creditsScoreNodeContainer);
					userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemAccessAndUseConstraintsScore, scoringUtils.ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE, accessScoreNodeContainer);

					scoringUtils.creditsAndAccessScore = scoringUtils.itemCreditsScore + scoringUtils.itemAccessAndUseConstraintsScore;
					updateSectionScore(scoringUtils.creditsAndAccessScore, creditsNode, scoringUtils.ITEM_USE_CONSTRAINS_MAX_SCORE);
					updateOverallScore();
				}
			});

			on(cancelBtnNode, "click", function () {
				domConstruct.empty(itemCreditsNode);
				domConstruct.create("div", {innerHTML:itemCredits_clean}, itemCreditsNode, "first");
				domAttr.remove(itemCreditsNode, "data-dojo-type");
				domAttr.set(itemCreditsNode, "id", creditID);

				if (dijit.byId("access-editor-widget")) {
					dijit.byId("access-editor-widget").destroy();
				}

				domAttr.remove(accessAndUseConstraintsEditorNode, "id");
				domConstruct.create("div", {
					id:"access-editor-widget"
				}, accessAndUseConstraintsEditorNode, "first");

				if (accessAndUseConstraints === "") {
					domConstruct.place("<span></span>", "access-editor-widget", "first");
				} else {
					domConstruct.place("<span>" + accessAndUseConstraints_clean + "</span>", "access-editor-widget", "first");
				}

				domAttr.set(editSaveBtnNode, "innerHTML", " EDIT ");
				domStyle.set(cancelBtnNode, "display", "none");

				// set numerator
				scoringUtils.itemCreditsScore = validator.setCreditsScore(itemCredits_clean);
				scoringUtils.itemAccessAndUseConstraintsScore = validator.setAccessAndUseConstraintsScore(accessAndUseConstraints_clean);
				creditsScoreNumeratorNode.innerHTML = scoringUtils.itemCreditsScore;
				accessScoreNumeratorNode.innerHTML = scoringUtils.itemAccessAndUseConstraintsScore;

				// update section style score graphics
				userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemCreditsScore, scoringUtils.ITEM_CREDIT_MAX_SCORE, creditsScoreNodeContainer);
				userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemAccessAndUseConstraintsScore, scoringUtils.ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE, accessScoreNodeContainer);

				scoringUtils.creditsAndAccessScore = scoringUtils.itemCreditsScore + scoringUtils.itemAccessAndUseConstraintsScore;
				updateSectionScore(scoringUtils.creditsAndAccessScore, creditsNode, scoringUtils.ITEM_USE_CONSTRAINS_MAX_SCORE);
				updateOverallScore();
			});
		}
		// END CREDITS


		// BEGIN TAGS
		function tagsContentPane() {
			portalUtils.getItem(selectedRowID).then(loadTagsContent);
		}

		function loadTagsContent(item) {
			checkBoxID_values = [];
			// load the content
			userInterfaceUtils.loadContent(tags.TAGS_CONTENT);

			// nodes
			var editSaveBtnNode = query(".edit-save-btn")[0];
			var cancelBtnNode = query(".cancel-btn")[0];
			var tagsTooltipNode = query(".tags-tooltip")[0];
			var tagsScoreNodeContainer = query(".tags-score-gr")[0];
			var tagsScoreNumeratorNode = query(".tags-score-num")[0];
			var tagsScoreDenominatorNode = query(".tags-score-denom")[0];
			// tooltips
			userInterfaceUtils.createTooltips([tagsTooltipNode], [tooltipsConfig.TAGS_TOOLTIP_CONTENT]);

			// tags
			var itemTags = item.tags;
			var itemTags_clean = itemTags;

			// validate score
			scoringUtils.itemTagsScore = validator.validateItemTags(itemTags);
			// set numerator
			tagsScoreNumeratorNode.innerHTML = scoringUtils.itemTagsScore;
			// set denominator
			tagsScoreDenominatorNode.innerHTML = scoringUtils.TAGS_MAX_SCORE;
			// update section score
			updateSectionScore(scoringUtils.itemTagsScore, tagsNode, scoringUtils.TAGS_MAX_SCORE);
			// update section score style
			userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemTagsScore, scoringUtils.TAGS_MAX_SCORE, tagsScoreNodeContainer);
			// update overall score
			updateOverallScore();

			// create the existing tags (un-editable)
			domConstruct.create("div", {
				class:"existing-tags"
			}, query(".tag-container")[0], "first");
			tagUtils.styleTags(itemTags, query(".existing-tags")[0]);

			// existing tags store
			tagStore = new Memory({
				idProperty:"tag",
				data:[].concat(itemTags)
			});

			// destroy the Tags dijit and the Tree dijit
			if (customTagsWidget) {
				dijit.byId("tag-widget").destroy();
				customTagsWidget = null;
				dijit.byId("tags-tree").destroy();
			}
			// tags dijit
			customTagsWidget = new CustomTagsWidget({
				placeholder:"Add tag(s)",
				noDataMsg:"No results found.",
				matchParam:"all",
				idProperty:"tag",
				gridId:"grid1",
				filterId:"filter1",
				minWidth:"300px",
				maxWidth:"400px",
				store:tagStore
			}, "tag-widget");
			customTagsWidget.prepopulate(tagStore.data);
			// hide dijit until editing mode
			domStyle.set("tag-widget", "display", "none");

			// Create the model
			var treeModel = new ObjectStoreModel({
				store:atlasTagStore,
				query:{
					id:"categories"
				},
				// Overridable function to tell if an item has or may have children.
				// Controls whether or not +/- expando icon is shown.
				mayHaveChildren:function (object) {
					return "type" in object;
				}
			});

			// Create the Tree.
			var tree = new Tree({
				id:"tags-tree",
				model:treeModel,
				showRoot:false,
				_createTreeNode:function (args) {
					var tnode = new dijit._TreeNode(args);
					tnode.labelNode.innerHTML = args.item.name;
					if (args.item.parent !== "categories") {
						var cb = new CheckBox({
							id:args.item.name,
							value:args.item.name,
							disabled:true,
							onChange:function (selected) {
								var tagLabel = this.value;
								if (selected) {
									if (tagStore.data.indexOf(tagLabel) === -1) {
										tagStore.data.push(tagLabel);
									}
								} else {
									tagStore.data.splice(tagStore.data.indexOf(tagLabel), 1);
								}
								customTagsWidget.clearTags();
								customTagsWidget.prepopulate(tagStore.data);
							}
						});
						cb.placeAt(tnode.labelNode, "first");
						checkBoxID_values.push(args.item.name);
					}
					return tnode;
				},
				onLoad:function () {
					//console.log("LOADED");
					tagUtils.updateTreePath(tree, treeModel, customTagsWidget.values);
				},
				onClick:function (item, node, evt) {
					//console.log(item);
				},
				onOpen:function (item, node) {
					var name = item.name;
					if (editSaveBtnNode.innerHTML === " EDIT ") {
						userInterfaceUtils.toggleCheckboxes(checkBoxID_values, "disabled", true);
					} else {
						userInterfaceUtils.toggleCheckboxes(checkBoxID_values, "disabled", false);
					}

					if (registry.byId(name)) {
						registry.byId(name).set("checked", true);
					}
				}
			});
			tree.placeAt("tree");
			tree.startup();

			aspect.after(tree, "onOpen", function (item) {
				var lastValueAdded = customTagsWidget.values[customTagsWidget.values.length - 1];
				if (registry.byId(lastValueAdded)) {
					registry.byId(lastValueAdded).set("checked", true);
				}
			});

			/*on(query(".expandBtn")[0], "click", function (event) {
			 tree.expandAll();
			 });

			 on(query(".collapseBtn")[0], "click", function (event) {
			 tree.collapseAll();
			 });*/

			customTagsWidget.on("deletenode", function (tag) {
				if (registry.byId(tag)) {
					// deleting an Atlas Tag
					registry.byId(tag).set("checked", false);
				} else {
					// deleting a custom tag
					tagStore.data.splice(tagStore.data.indexOf(tag), 1);
				}
			});

			customTagsWidget.on("addnode", function (tag) {
				if (tagStore.data.indexOf(tag) === -1) {
					tagStore.data.push(tag);
				}
				// expand tree if needed
				tagUtils.updateTreePath(tree, treeModel, customTagsWidget.values);
			});

			on(editSaveBtnNode, "click", function () {
				if (editSaveBtnNode.innerHTML === " EDIT ") {
					// EDIT mode
					userInterfaceUtils.updateEditSaveButton(editSaveBtnNode, " SAVE ", cancelBtnNode, "block");
					// remove non-editing tag nodes
					// domConstruct.empty(query(".existing-tags")[0]);
					domStyle.set(query(".existing-tags")[0], "display", "none");
					// display the tags dijit
					domStyle.set("tag-widget", "display", "block");
					// enable living atlas checkboxes
					userInterfaceUtils.toggleCheckboxes(checkBoxID_values, "disabled", false);
				} else {
					// SAVE mode
					var _userItemUrl = item.userItemUrl;
					esriRequest({
						url:_userItemUrl + "/update",
						content:{
							f:"json",
							tags:"" + tagStore.data
						}
					}, {
						usePost:true
					}).then(function (response) {
								if (response.success) {
									itemTags_clean = tagStore.data;
									domConstruct.empty(query(".existing-tags")[0]);
									tagUtils.styleTags(tagStore.data, query(".existing-tags")[0]);
									domStyle.set(query(".existing-tags")[0], "display", "block");
									domStyle.set("tag-widget", "display", "none");
									// set the numerator and update score
									scoringUtils.itemTagsScore = validator.validateItemTags(tagStore.data);
									tagsScoreNumeratorNode.innerHTML = scoringUtils.itemTagsScore;
									// section overall score
									updateSectionScore(scoringUtils.itemTagsScore, tagsNode, scoringUtils.TAGS_MAX_SCORE);
									userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemTagsScore, scoringUtils.TAGS_MAX_SCORE, tagsScoreNodeContainer);
									updateOverallScore();

									// disable living atlas checkboxes
									userInterfaceUtils.toggleCheckboxes(checkBoxID_values, "disabled", true);
									userInterfaceUtils.updateEditSaveButton(editSaveBtnNode, " EDIT ", cancelBtnNode, "none");
								} else {
									console.log("ERROR");
								}
							});
				}
			});

			on(cancelBtnNode, "click", function () {
				domStyle.set(query(".existing-tags")[0], "display", "block");
				domStyle.set("tag-widget", "display", "none");

				// set the numerator and update score
				scoringUtils.itemTagsScore = validator.validateItemTags(itemTags_clean);
				tagsScoreNumeratorNode.innerHTML = scoringUtils.itemTagsScore;
				// section overall score
				updateSectionScore(scoringUtils.itemTagsScore, tagsNode, scoringUtils.TAGS_MAX_SCORE);
				userInterfaceUtils.updateSectionScoreStyle(scoringUtils.itemTagsScore, scoringUtils.TAGS_MAX_SCORE, tagsScoreNodeContainer);
				updateOverallScore();
				// disable living atlas checkboxes
				userInterfaceUtils.toggleCheckboxes(checkBoxID_values, "disabled", true);
				userInterfaceUtils.updateEditSaveButton(editSaveBtnNode, " EDIT ", cancelBtnNode, "none");
			});
		}
		// END TAGS


		// BEGIN PERFORMANCE
		function performanceContentPane(response, layers) {
			// load the content
			userInterfaceUtils.loadContent(performanceConfig.PERFORMANCE_CONTENT);

			// tooltip nodes
			var mapLayersTooltipNode = query(".map-layers-tooltip")[0],
					sharingNode = query(".sharing-tooltip")[0],
					drawTimeTooltipNode = query(".draw-time-tooltip")[0],
					popupsTooltipNode = query(".popups-tooltip")[0];
			// create tooltips
			userInterfaceUtils.createTooltips([mapLayersTooltipNode, sharingNode, drawTimeTooltipNode, popupsTooltipNode], [tooltipsConfig.PERFORMANCE_MAP_LAYERS_TOOLTIP_CONTENT, tooltipsConfig.PERFORMANCE_SHARING_TOOLTIP_CONTENT, tooltipsConfig.PERFORMANCE_DRAW_TIME_TOOLTIP_CONTENT, tooltipsConfig.PERFORMANCE_POP_UPS_TOOLTIP_CONTENT]);

			// map draw time nodes
			var mdtScoreContainerNode = query(".mdt-score-gr")[0],
					mdtNumeratorNode = query(".mdt-score-num")[0],
					mdtDenominatorNode = query(".mdt-score-denom")[0];
			var mdtGoodNode = query(".performance-text-very-slow")[0],
					mdtBetterNode = query(".performance-text-slow")[0],
					mdtBestNode = query(".performance-text-good")[0];
			if (scoringUtils.mapDrawTimeScore === scoring.PERFORMANCE_DRAW_TIME_BEST_SCORE) {
				domStyle.set(mdtGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(mdtBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(mdtBestNode, "color", "#0079C1");
			} else if (scoringUtils.mapDrawTimeScore === scoring.PERFORMANCE_DRAW_TIME_BETTER_SCORE) {
				domStyle.set(mdtGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(mdtBetterNode, "color", "#0079C1");
				domStyle.set(mdtBestNode, "color", "rgba(0, 122, 194, 0.24)");
			} else if (scoringUtils.mapDrawTimeScore === scoring.PERFORMANCE_DRAW_TIME_GOOD_SCORE) {
				domStyle.set(mdtGoodNode, "color", "#0079C1");
				domStyle.set(mdtBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(mdtBestNode, "color", "rgba(0, 122, 194, 0.24)");
			}

			// number of map layers
			var nLayersScoreContainerNode = query(".num-layers-score-gr")[0],
					layerCountNumeratorNode = query(".num-layers-score-num")[0],
					layerCountDenominatorNode = query(".num-layers-score-denom")[0];
			var nLayersGoodNode = query(".num-layers-good")[0],
					nLayersBetterNode = query(".num-layers-better")[0],
					nLayersBestNode = query(".num-layers-best")[0];
			if (scoringUtils.nLayersScore === scoring.LAYER_COUNT_GOOD_SCORE) {
				// GOOD
				domStyle.set(nLayersGoodNode, "color", scoring.PASS_COLOR);
				domStyle.set(nLayersBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(nLayersBestNode, "color", "rgba(0, 122, 194, 0.24)");
			} else if (scoringUtils.nLayersScore === scoring.LAYER_COUNT_BETTER_SCORE) {
				// BETTER
				domStyle.set(nLayersGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(nLayersBetterNode, "color", scoring.PASS_COLOR);
				domStyle.set(nLayersBestNode, "color", "rgba(0, 122, 194, 0.24)");
			} else if (scoringUtils.nLayersScore === scoring.LAYER_COUNT_BEST_SCORE) {
				// BEST
				domStyle.set(nLayersGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(nLayersBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(nLayersBestNode, "color", scoring.PASS_COLOR);
			} else {
				// NO LAYERS
				domStyle.set(nLayersGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(nLayersBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(nLayersBestNode, "color", "rgba(0, 122, 194, 0.24)");
			}

			scoringUtils.popupsScore = validator.setPopupScore(response);
			// popups
			var popupsScoreContainerNode = query(".popups-score-gr")[0],
					popupsNumeratorNode = query(".popups-score-num")[0],
					popupsDenominatorNode = query(".popups-score-denom")[0];
			var popupsNoneNode = query(".performance-popups-none")[0],
					popupsDefaultNode = query(".performance-popups-default")[0],
					popupsCustomNode = query(".performance-popups-custom")[0];

			if (scoringUtils.popupsScore === 7) {
				domStyle.set(popupsNoneNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(popupsDefaultNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(popupsCustomNode, "color", scoring.PASS_COLOR);
			} else if (scoringUtils.popupsScore === 2) {
				domStyle.set(popupsNoneNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(popupsDefaultNode, "color", scoring.PASS_COLOR);
				domStyle.set(popupsCustomNode, "color", "rgba(0, 122, 194, 0.24)");
			} else {
				domStyle.set(popupsNoneNode, "color", scoring.PASS_COLOR);
				domStyle.set(popupsDefaultNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(popupsCustomNode, "color", "rgba(0, 122, 194, 0.24)");
			}

			// sharing
			var sharingContainerNode = query(".sharing-score-gr")[0],
					sharingNumeratorNode = query(".sharing-score-num")[0],
					sharingDenominatorNode = query(".sharing-score-denom")[0];
			var sharingGoodNode = query(".performance-sharing-good")[0],
					sharingBetterNode = query(".performance-sharing-better")[0],
					sharingBestNode = query(".performance-sharing-best")[0];
			if (scoringUtils.sharingScore === scoring.PERFORMANCE_SHARING_PRIVATE_SCORE) {
				// GOOD
				domStyle.set(sharingGoodNode, "color", scoring.PASS_COLOR);
				domStyle.set(sharingBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(sharingBestNode, "color", "rgba(0, 122, 194, 0.24)");
			} else if (scoringUtils.sharingScore === scoring.PERFORMANCE_SHARING_ORG_SCORE) {
				// BETTER
				domStyle.set(sharingGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(sharingBetterNode, "color", scoring.PASS_COLOR);
				domStyle.set(sharingBestNode, "color", "rgba(0, 122, 194, 0.24)");
			} else {
				// BEST
				domStyle.set(sharingGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(sharingBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(sharingBestNode, "color", scoring.PASS_COLOR);
			}

			// set the numerators
			mdtNumeratorNode.innerHTML = scoringUtils.mapDrawTimeScore;
			layerCountNumeratorNode.innerHTML = scoringUtils.nLayersScore;
			popupsNumeratorNode.innerHTML = scoringUtils.popupsScore;
			sharingNumeratorNode.innerHTML = scoringUtils.sharingScore;
			// set the denominators
			mdtDenominatorNode.innerHTML = layerCountDenominatorNode.innerHTML = popupsDenominatorNode.innerHTML = sharingDenominatorNode.innerHTML = scoring.PERFORMANCE_MAX;

			// update the section styles
			userInterfaceUtils.updateSectionScoreStyle(scoringUtils.mapDrawTimeScore, scoringUtils.PERFORMANCE_DRAW_TIME_MAX_SCORE, mdtScoreContainerNode);
			userInterfaceUtils.updateSectionScoreStyle(scoringUtils.nLayersScore, scoringUtils.PERFORMANCE_LAYER_COUNT_MAX_SCORE, nLayersScoreContainerNode);
			userInterfaceUtils.updateSectionScoreStyle(scoringUtils.popupsScore, scoringUtils.PERFORMANCE_POPUPS_MAX_SCORE, popupsScoreContainerNode);
			userInterfaceUtils.updateSectionScoreStyle(scoringUtils.sharingScore, scoringUtils.PERFORMANCE_SHARING_MAX_SCORE, sharingContainerNode);
		}
		// END PERFORMANCE

		// BEGIN PROFILE
		function profileContentPane() {
			portalUtils.getItem(selectedRowID).then(loadProfileContent);
		}

		function loadProfileContent(item) {
			// item full name
			var _userFullName = validator.validateStr(portalUtils.portalUser.fullName);
			var _userFullName_clean = _userFullName;
			// item user description
			var _userDescription = validator.validateStr(portalUtils.portalUser.description);
			var _userDescription_clean = _userDescription;
			// item user thumbnail
			var _userThumbnailUrl = portalUserThumbnailUrl;
			var _userThumbnailUrl_clean = _userThumbnailUrl;

			// load the content
			userInterfaceUtils.loadContent(profileConfig.PROFILE_CONTENT);

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
			domAttr.set(profileUserFullNameNode, "id", userNameID);
			domConstruct.create("div", {innerHTML:_userFullName}, profileUserFullNameNode, "first");
			// set the user description
			domAttr.set(profileUserDescriptionNode, "id", userDescriptionID);
			domConstruct.create("div", {innerHTML:_userDescription}, profileUserDescriptionNode, "first");

			// tooltips
			userInterfaceUtils.createTooltips([profileThumbnailTooltipNode, profileFullNameTooltipNode, profileDescriptionTooltipNode], [tooltipsConfig.USER_PROFILE_THUMBNAIL_TOOLTIP_CONTENT, tooltipsConfig.USER_PROFILE_FULL_NAME_TOOLTIP_CONTENT, tooltipsConfig.USER_PROFILE_DESCRIPTION_TOOLTIP_CONTENT]);

			// set denominator
			userThumbnailDenominatorNode.innerHTML = scoringUtils.USER_PROFILE_THUMBNAIL;
			userNameScoreDenominatorNode.innerHTML = scoringUtils.USER_PROFILE_FULLNAME;
			userDescriptionScoreDenominatorNode.innerHTML = scoringUtils.USER_PROFILE_DESCRIPTION;

			// score content
			scoringUtils.userThumbnailScore = 7;//validator.setThumbnailScore(portalUtils.portalUser.thumbnail);
			scoringUtils.userNameScore = validator.setUserProfileFullNameScore(portalUtils.portalUser.fullName);
			scoringUtils.userDescriptionScore = validator.setUserDescriptionScore(portalUtils.portalUser.description);
			userThumbnailNumeratorNode.innerHTML = scoringUtils.userThumbnailScore;
			userNameScoreNumeratorNode.innerHTML = scoringUtils.userNameScore;
			userDescriptionScoreNumeratorNode.innerHTML = scoringUtils.userDescriptionScore;

			// update section style score graphics
			userInterfaceUtils.updateSectionScoreStyle(scoringUtils.userThumbnailScore, scoringUtils.USER_PROFILE_THUMBNAIL, userThumbnailNodeContainer);
			userInterfaceUtils.updateSectionScoreStyle(scoringUtils.userNameScore, scoringUtils.USER_PROFILE_FULLNAME, userNameScoreNodeContainer);
			userInterfaceUtils.updateSectionScoreStyle(scoringUtils.userDescriptionScore, scoringUtils.USER_PROFILE_DESCRIPTION, userDescriptionScoreNodeContainer);

			scoringUtils.userProfileScore = scoringUtils.userThumbnailScore + scoringUtils.userNameScore + scoringUtils.userDescriptionScore;
			updateSectionScore(scoringUtils.userProfileScore, profileNode, scoringUtils.USER_PROFILE_MAX_SCORE);
			updateOverallScore();

			on(editSaveBtnNode, "click", function () {
				if (editSaveBtnNode.innerHTML === " EDIT ") {
					// "EDIT" clicked
					// update EDIT/SAVE button
					userInterfaceUtils.updateEditSaveButton(editSaveBtnNode, " SAVE ", cancelBtnNode, "block");
					domStyle.set(query(".expanded-item-thumbnail")[0], "cursor", "pointer");

					// update user full name
					domConstruct.empty(profileUserFullNameNode);
					domConstruct.create("input", {
						class:"edit-user-full-name",
						value:_userFullName
					}, profileUserFullNameNode, "first");
					domAttr.set(profileUserFullNameNode, "data-dojo-type", "dijit/form/TextBox");
					domAttr.set(profileUserFullNameNode, "id", userNameID);

					// update user description
					domConstruct.empty(profileUserDescriptionNode);
					domConstruct.create("input", {
						class:"edit-user-description",
						value:_userDescription
					}, profileUserDescriptionNode, "first");
					domAttr.set(profileUserDescriptionNode, "data-dojo-type", "dijit/form/TextBox");
					domAttr.set(profileUserDescriptionNode, "id", userDescriptionID);

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

					portalUtils.portalUser.getItem(selectedRowID).then(function (results) {
						esriRequest({
							url:"https://www.arcgis.com/sharing/rest/community/users/" + results.owner + "/update",
							content:{
								f:"json",
								fullname:_userFullName,
								description:_userDescription
							}
						}, {
							usePost:true
						}).then(function (response) {
									if (response.success) {
										domConstruct.empty(profileUserFullNameNode);
										domConstruct.create("div", {innerHTML:_userFullName}, profileUserFullNameNode, "first");
										domAttr.remove(profileUserFullNameNode, "data-dojo-type");
										domAttr.set(profileUserFullNameNode, "id", userNameID);

										domConstruct.empty(profileUserDescriptionNode);
										domConstruct.create("div", {innerHTML:_userDescription}, profileUserDescriptionNode, "first");
										domAttr.remove(profileUserDescriptionNode, "data-dojo-type");
										domAttr.set(profileUserDescriptionNode, "id", userDescriptionID);

										_userFullName_clean = _userFullName;
										_userDescription_clean = _userDescription;

										userInterfaceUtils.updateEditSaveButton(editSaveBtnNode, " EDIT ", cancelBtnNode, "none");

										// score content
										scoringUtils.userThumbnailScore = 0;//setUserProfileThumbnailScore()
										scoringUtils.userNameScore = validator.setUserProfileFullNameScore(_userFullName_clean);
										scoringUtils.userDescriptionScore = validator.setUserDescriptionScore(_userDescription_clean);
										userNameScoreNumeratorNode.innerHTML = scoringUtils.userNameScore;
										userDescriptionScoreNumeratorNode.innerHTML = scoringUtils.userDescriptionScore;

										// update section style score graphics
										userInterfaceUtils.updateSectionScoreStyle(scoringUtils.userNameScore, scoringUtils.USER_PROFILE_FULLNAME, userNameScoreNodeContainer);
										userInterfaceUtils.updateSectionScoreStyle(scoringUtils.userDescriptionScore, scoringUtils.USER_PROFILE_DESCRIPTION, userDescriptionScoreNodeContainer);

										scoringUtils.userProfileScore = scoringUtils.userThumbnailScore + scoringUtils.userNameScore + scoringUtils.userDescriptionScore;
										updateSectionScore(scoringUtils.userProfileScore, profileNode, scoringUtils.USER_PROFILE_MAX_SCORE);
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
				domConstruct.create("div", {innerHTML:_userFullName_clean}, profileUserFullNameNode, "first");
				domAttr.remove(profileUserFullNameNode, "data-dojo-type");
				domAttr.set(profileUserFullNameNode, "id", userNameID);

				domConstruct.empty(profileUserDescriptionNode);
				domConstruct.create("div", {innerHTML:_userDescription_clean}, profileUserDescriptionNode, "first");
				domAttr.remove(profileUserDescriptionNode, "data-dojo-type");
				domAttr.set(profileUserDescriptionNode, "id", userDescriptionID);
				domAttr.set(editSaveBtnNode, "innerHTML", " EDIT ");
				domStyle.set(cancelBtnNode, "display", "none");

				scoringUtils.userThumbnailScore = 0;//setUserProfileThumbnailScore()
				scoringUtils.userNameScore = validator.setUserProfileFullNameScore(_userFullName_clean);
				scoringUtils.userDescriptionScore = validator.setUserDescriptionScore(_userDescription_clean);
				userNameScoreNumeratorNode.innerHTML = scoringUtils.userNameScore;
				userDescriptionScoreNumeratorNode.innerHTML = scoringUtils.userDescriptionScore;

				// update section style score graphics
				userInterfaceUtils.updateSectionScoreStyle(scoringUtils.userNameScore, scoringUtils.USER_PROFILE_FULLNAME, userNameScoreNodeContainer);
				userInterfaceUtils.updateSectionScoreStyle(scoringUtils.userDescriptionScore, scoringUtils.USER_PROFILE_DESCRIPTION, userDescriptionScoreNodeContainer);

				scoringUtils.userProfileScore = scoringUtils.userThumbnailScore + scoringUtils.userNameScore + scoringUtils.userDescriptionScore;
				updateSectionScore(scoringUtils.userProfileScore, profileNode, scoringUtils.USER_PROFILE_MAX_SCORE);
				updateOverallScore();
			});
		}
		// END PROFILE


		function updateScore(item) {
			// details
			scoringUtils.itemThumbnailScore = validator.setThumbnailScore(item);
			scoringUtils.itemTitleScore = validator.setItemTitleScore(item.title);
			scoringUtils.itemSummaryScore = validator.setItemSummaryScore(item.snippet);
			scoringUtils.itemDescriptionScore = validator.setItemDescriptionScore(item.description);
			scoringUtils.itemDetailsScore = scoringUtils.itemThumbnailScore + scoringUtils.itemTitleScore + scoringUtils.itemSummaryScore + scoringUtils.itemDescriptionScore;
			userInterfaceUtils.setPassFailStyleOnTabNode(scoringUtils.itemDetailsScore, detailsNode, scoringUtils.ITEM_DETAILS_MAX_SCORE);
			// use/constrains
			scoringUtils.itemCreditsScore = validator.setCreditsScore(item.accessInformation);
			scoringUtils.itemAccessAndUseConstraintsScore = validator.setAccessAndUseConstraintsScore(item.licenseInfo);
			scoringUtils.creditsAndAccessScore = scoringUtils.itemCreditsScore + scoringUtils.itemAccessAndUseConstraintsScore;
			userInterfaceUtils.setPassFailStyleOnTabNode(scoringUtils.creditsAndAccessScore, creditsNode, scoringUtils.ITEM_USE_CONSTRAINS_MAX_SCORE);
			// tags
			scoringUtils.itemTagsScore = validator.validateItemTags(item.tags);
			userInterfaceUtils.setPassFailStyleOnTabNode(scoringUtils.itemTagsScore, tagsNode, scoringUtils.TAGS_MAX_SCORE);
			// performance
			//
			userInterfaceUtils.setPassFailStyleOnTabNode(scoringUtils.performanceScore, performanceNode, scoringUtils.PERFORMANCE_MAX_SCORE);
			// user profile
			scoringUtils.userThumbnailScore = 7;//validator.setThumbnailScore(portalUtils.portalUser);
			scoringUtils.userNameScore = validator.setUserProfileFullNameScore(portalUtils.portalUser.fullName);
			scoringUtils.userDescriptionScore = validator.setUserDescriptionScore(portalUtils.portalUser.description);
			scoringUtils.userProfileScore = scoringUtils.userThumbnailScore + scoringUtils.userNameScore + scoringUtils.userDescriptionScore;
			userInterfaceUtils.setPassFailStyleOnTabNode(scoringUtils.userProfileScore, profileNode, scoringUtils.USER_PROFILE_MAX_SCORE);
			// update the overall score and score graphic
			updateOverallScore();
		}

		function updateOverallScore() {
			// update the overall current score
			scoringUtils.updateOverallCurrentScore(scoringUtils.itemDetailsScore, scoringUtils.creditsAndAccessScore, scoringUtils.itemTagsScore, scoringUtils.performanceScore, scoringUtils.userProfileScore, scoringUtils.MAX_SCORE, scoring.MAXIMUM_SCORE);
			updateOverallScoreGraphic(scoringUtils.overAllCurrentScore);
		}

		function updateOverallScoreGraphic(totalScore) {
			var classAttrs = domAttr.get(nominateBtnNode, "class");
			if (totalScore >= scoring.SCORE_THRESHOLD) {
				// PASS
				// set the overall score color to pass
				domStyle.set(currentOverallScoreNode, "color", scoring.PASS_COLOR);
				if (array.some(nominateUtils.nominatedItems.features, function (feature) {
					return selectedRowID === feature.attributes.itemID;
				})) {
					// Item has been already nominated
					userInterfaceUtils.disableNominateButton(nominateBtnNode);
				} else {
					// Item has not been nominated
					// enable the "Nominate" button
					userInterfaceUtils.enableNominateButton(nominateBtnNode);
					// add the event handler for the "Nominate" button
					nominateBtnClickHandler = on(nominateBtnNode, "click", function () {
						//nominateBtnDialog.show();
						isItemNominated(selectedRowID).then(nominate);
					});
				}
			} else {
				// FAIL
				domStyle.set(currentOverallScoreNode, "color", scoring.FAIL_COLOR);
				classAttrs = classAttrs.replace("enabled", "disabled");
				domAttr.set(nominateBtnNode, "class", classAttrs);
				if (nominateBtnClickHandler !== null) {
					nominateBtnClickHandler.remove();
				}
			}

			// update the overall score label
			currentOverallScoreNode.innerHTML = totalScore + "/" + scoring.MAXIMUM_SCORE;
			if (dijit.byId("overall-score-graphic") !== undefined) {
				dijit.byId("overall-score-graphic").update({
					value: totalScore
				});
				dijit.byId("overall-score-graphic").set("value", totalScore);
			}
		}


		function nominate(count) {
			if (count < 1) {
				portalUtils.portalUser.getItem(selectedRowID).then(function (item) {
					// item had never been nominated
					var dateTime = new Date();
					var pt = new Point({
						"x":-13024380.422813008,
						"y":4028802.0261344062,
						"spatialReference":{
							"wkid":102100
						}
					});
					var sms = new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_CIRCLE).setColor(new Color([255, 0, 0, 0.5]));
					var attr = {
						"Latitude":"4028802.0261344062",
						"Longitude":"-13024380.422813008",
						"itemID":item.id,
						"itemOwnerID":item.owner,
						"ContactEmail":portalUtils.portalUser.email,
						"ContactPhone":"",
						"OnineStatus":"In Review",
						"NominatedDate":dateTime,
						"LastContactDate":"",
						"LastContactComments":"",
						"AcceptedDate":"",
						"FlaggedDate":"",
						"RemovedDate":"",
						"OriginalNominatedDate":dateTime,
						"OriginalAcceptedDate":"",
						"InitialContactDate":"",
						"CreationDate":"",
						"Creator":"",
						"EditDate":"",
						"Editor":"",
						"itemName":item.title,
						"itemURL":item.itemUrl
					};
					var graphic = new Graphic(pt, sms, attr);
					nominateUtils.nominateAdminFeatureLayer.applyEdits([graphic], null, null);
				});
			}
		}

		function isItemNominated(id) {
			var queryTask = new QueryTask("http://services1.arcgis.com/4yjifSiIG17X0gW4/arcgis/rest/services/nomcur/FeatureServer/0");
			var query = new Query();
			query.returnGeometry = false;
			query.outFields = ["*"];
			query.where = "itemID = '" + id + "'";
			var deferred = new Deferred();
			queryTask.executeForCount(query).then(lang.hitch(this, function (count) {
				deferred.resolve(count);
			}));
			return deferred.promise;
		}

		function nominateCompleteHandler(complete) {
			if (complete.adds[0].success) {
				// update the status label of the item in the dGrid to "Nominated"
				var itemStatusNode = query(".item-nomination-status-" + selectedRowID)[0];
				domConstruct.place(defaults.CURRENT_STATUS[1].label, itemStatusNode, "replace");
				// update the client-side collection of nominated items
				nominateUtils.loadNominatedItemsInMemory().then(function (results) {
					nominateUtils.nominatedItems = results;
					var nominateBtnDialog = new Dialog({
						title: results.features[results.features.length - 1].attributes.itemName,
						content:'<div class="dialog-container">' +
								'	<div class="row">' +
								'		<div class = "column-24" >' + defaults.NOMINATED_SUCCESS_DIALOG +
								'	<\/div>' +
								'<\/div>',
						style:"width: 300px"
					});
					nominateBtnDialog.show();
				});
				// set the "Nominate" button to disabled
				userInterfaceUtils.disableNominateButton(nominateBtnNode);
			} else {
				console.debug("ERROR: ", complete);
			}
		}

		function updateSectionScore(score, node, max) {
			var classAttrs = domAttr.get(node, "class");
			score = Math.floor(score / max * scoring.MAXIMUM_SCORE);
			if (score >= scoring.SCORE_THRESHOLD) {
				// PASS
				classAttrs = classAttrs.replace("icon-edit", "active icon-check");
				domAttr.set(node, "class", classAttrs);
				domStyle.set(node, "color", scoring.PASS_COLOR);
				domStyle.set(node, "border", "1px solid " + scoring.PASS_COLOR);
			} else {
				// FAIL
				classAttrs = classAttrs.replace("icon-check", "active icon-edit");
				domAttr.set(node, "class", classAttrs);
				domStyle.set(node, "color", scoring.FAIL_COLOR);
				domStyle.set(node, "border", "1px solid " + scoring.FAIL_COLOR);
			}
		}

		function uploadItemThumbnail(item, imageSizeName) {
			var deferred = new Deferred();
			var previewDlg = new Dialog({
				title:item.title,
				className:"upload-thumbnail-dialog"
			});
			previewDlg.show();
			var dialogContent = put(previewDlg.containerNode, "div.dijitDialogPaneContentArea");
			var actionBar = put(previewDlg.containerNode, "div.dijitDialogPaneActionBar");
			var uploadThumbBtn = new Button({
				label:"Upload Thumbnail"
			}, put(actionBar, "div"));
			domClass.add(uploadThumbBtn.domNode, "dijitHidden");
			var cancelBtn = new Button({
				label:"Cancel",
				onClick:lang.hitch(previewDlg, previewDlg.hide)
			}, put(actionBar, "div"));
			var msgPane = put(dialogContent, "div.msgPane", "Upload alternate image:");
			var form = put(dialogContent, "form", {
				"method":"post",
				"enctype":"multipart/form-data"
			});
			var fileInput = put(form, "input", {
				type:"file",
				name:(imageSizeName === "LARGE") ? "largeThumbnail" : "thumbnail"
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
						if ((this.width === defaults.THUMBNAIL_IMAGE_SIZES[imageSizeName][0]) && (this.height === defaults.THUMBNAIL_IMAGE_SIZES[imageSizeName][1])) {
							domClass.remove(uploadThumbBtn.domNode, "dijitHidden");
							// upload button selected
							uploadThumbBtn.on("click", lang.hitch(this, function (evt) {
								domClass.add(uploadThumbBtn.domNode, "dijitHidden");
								updateItemThumbnail(item, form).then(lang.hitch(this, function (evt) {
									portalUtils.portalUser.getItem(item.id).then(lang.hitch(this, function (userItem) {
										// If the store is updated the dGrid is refreshed and the expanded content is lost
										itemStore.put(userItem);
										domAttr.set(query(".item-thumbnail-" + selectedRowID)[0], "src", userItem.thumbnailUrl);
										domAttr.set(query(".expanded-item-thumbnail-" + selectedRowID)[0], "src", userItem.thumbnailUrl);
										defaults.UPDATE_ITEMS[imageSizeName].push(item.id);
										msgPane.innerHTML = "Item updated with thumbnail";
										validator.setThumbnailScore(userItem);
										updateOverallScore();
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
							msgPane.innerHTML = lang.replace("Invalid image size; it must be {0}px by {1}px", defaults.THUMBNAIL_IMAGE_SIZES[imageSizeName]);
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
				title:"Update Thumbnail",
				className:"upload-thumbnail-dialog"
			});
			previewDlg.show();
			var dialogContent = put(previewDlg.containerNode, "div.dijitDialogPaneContentArea");
			var actionBar = put(previewDlg.containerNode, "div.dijitDialogPaneActionBar");
			var uploadThumbBtn = new Button({
				label:"Upload Thumbnail"
			}, put(actionBar, "div"));
			domClass.add(uploadThumbBtn.domNode, "dijitHidden");
			var cancelBtn = new Button({
				label:"Cancel",
				onClick:lang.hitch(previewDlg, previewDlg.hide)
			}, put(actionBar, "div"));
			var msgPane = put(dialogContent, "div.msgPane", "Upload alternate image:");
			var form = put(dialogContent, "form", {
				"method":"post",
				"enctype":"multipart/form-data"
			});
			var fileInput = put(form, "input", {
				type:"file",
				name:(imageSizeName === "LARGE") ? "largeThumbnail" : "thumbnail"
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
						if ((this.width === defaults.THUMBNAIL_IMAGE_SIZES[imageSizeName][0]) && (this.height === defaults.THUMBNAIL_IMAGE_SIZES[imageSizeName][1])) {
							domClass.remove(uploadThumbBtn.domNode, "dijitHidden");
							// upload button selected
							uploadThumbBtn.on("click", lang.hitch(this, function (evt) {
								domClass.add(uploadThumbBtn.domNode, "dijitHidden");
								updateUserProfileThumbnail(form).then(lang.hitch(this, function (response) {
									previewDlg.hide();
									if (response) {
										esriRequest({
											url:lang.replace("{url}", portalUtils.portalUser),
											content:{
												f:"json"
											},
											handleAs:"json"
										}).then(lang.hitch(this, function (obj) {
											validator.setThumbnailScore(obj);
											updateOverallScore();
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
							msgPane.innerHTML = lang.replace("Invalid image size; it must be {0}px by {1}px", defaults.THUMBNAIL_IMAGE_SIZES[imageSizeName]);
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
				url:lang.replace("{userItemUrl}/update", userItem),
				form:form,
				content:{
					f:"json"
				},
				handleAs:"json"
			}).then(deferred.resolve, deferred.reject);
			return deferred.promise;
		}

		function updateUserProfileThumbnail(form) {
			var deferred = new Deferred();
			esriRequest({
				url:lang.replace("{url}/update", portalUtils.portalUser),
				form:form,
				content:{
					f:"json"
				},
				handleAs:"json"
			}).then(deferred.resolve, deferred.reject);
			return deferred.promise;
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
	});
});
