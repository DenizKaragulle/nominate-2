require([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/fx",
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
	"dijit/Tooltip",
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
	"config/credits",
	"config/tags",
	"config/performance",
	"config/profile",
	"config/tooltips",
	"config/scoring",
	"config/validator",
	/*"esri/dijit/Tags",*/
	"config/CustomTagsWidget",
	"dojo/NodeList-traverse"
], function (array, declare, fx, lang, put, Pagination, OnDemandGrid, Dialog, Editor, LinkDialog, TextColor, ViewSource, FontChoice, Button, CheckBox, ProgressBar, registry, Tree, ForestStoreModel, ObjectStoreModel, Tooltip, aspect, ItemFileReadStore, date, Deferred, dom, domAttr, domClass, domConstruct, domStyle, html, JSON, keys, number, on, parser, ready, query, Memory, string, arcgisPortal, ArcGISOAuthInfo, esriId, arcgisUtils, Color, config, Point, Graphic, FeatureLayer, ArcGISImageServiceLayer, Map, esriRequest, Query, QueryTask, SimpleMarkerSymbol, defaults, details, credits, tags, performanceConfig, profileConfig, tooltipsConfig, scoring, Validator, CustomTagsWidget) {

	parser.parse();

	var map;
	var layers;
	var nominateAdminFL = null;
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
	var TAB_CONTAINER_CATEGORY = "category-";
	var TAB_CONTAINER_TAGS = "tags-";
	var TAB_CONTAINER_USERNAME = "username-";
	var TAB_CONTAINER_USERDESCRIPTION = "userdesc-";
	var NOMINATE_BTN_ID = "nominate-btn-";

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
	var nominateBtnClickHandler = null;
	var nominateBtnDialog = null;
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
			PERFORMANCE_DRAW_TIME_MAX_SCORE = 0,
			PERFORMANCE_LAYER_COUNT_MAX_SCORE = 0,
			PERFORMANCE_POPUPS_MAX_SCORE = 0,
			PERFORMANCE_SHARING_MAX_SCORE = 0;
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
	var tagStore = null;
	var atlasTagStore = null;
	//var tagsDijit;
	var customTagsWidget = null;
	//
	var HAS_PERFORMANCE_CONTENT = false;
	//
	var validator = null;
	//
	var nominatedItems = [];

	ready(function () {

		run();

		renderRow = function (object, data, cell) {
			// item title
			var itemTitle = object.title;
			// thumbnail url
			var thumbnailUrl = formatThumbnailUrl(object);
			// item type
			var type = validator.validateStr(object.type);
			// item last modified
			var modifiedDate = formatDate(object.modified);
			// item number of views
			var views = validator.validateStr(object.numViews);
			// item access
			var access = object.access;
			// item status ("NOMINATED", "IN REVIEW", "ACCEPTED")
			//var randomStatus = Math.floor((Math.random() * 4) + 0);
			var status = "";//defaults.CURRENT_STATUS[randomStatus].label;
			array.forEach(nominatedItems.features, function (feature) {
				if (object.id === feature.attributes.itemID) {
					console.log("object.id: " + object.id + "\t\t" + "feature.attributes.itemID: " + feature.attributes.itemID);
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

		detailsNodeClickHandler = function (selectedRowID, _nodeList, _titleID, _snippetID, _descID, _detailsNode) {
			array.forEach(_nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4", "active column-4");
					detailsContentPane(selectedRowID, _titleID, _snippetID, _descID);
				}
			});
			domClass.replace(_detailsNode, "active column-4 details-tab-node", "column-4 details-tab-node");
		};
		creditsNodeClickHandler = function (selectedRowID, _nodeList, _item, _accessID, _creditID, _creditsNode) {
			array.forEach(_nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4", "active column-4");
					useCreditsContentPane(selectedRowID, _accessID, _creditID);
				}
			});
			domClass.replace(_creditsNode, "active column-4 credits", "column-4 credits");
		};
		tagsNodeClickHandler = function (_selectedRowID, _nodeList, _categoryID, _tagsID, _tagsNode) {
			array.forEach(_nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4", "active column-4");
					tagsContentPane(_selectedRowID, _categoryID, _tagsID);
				}
			});
			domClass.replace(_tagsNode, "active column-4 tags", "column-4 tags");
		};
		performanceNodeClickHandler = function (_nodeList, _item, _popUps, _mapDrawTime, _response, _layers, _performanceNode) {
			array.forEach(nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4", "active column-4");
					performanceContentPane(_item, popupsScore, _mapDrawTime, _response, _layers);
				}
			});
			domClass.replace(_performanceNode, "active column-4 performance", "column-4 performance");
		};
		profileNodeClickHandler = function (_selectedRowID, _nodeList, _userNameID, _userDescriptionID, _profileNode) {
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

				on(searchInputNode, "keydown", searchItemsClickHandler);
				on(query(".filter-list"), "click", filterItemsClickHandler);
				on(query(".sort-items"), "click", sortItemsClickHandler);
				on(query(".icon-help")[0], "click", helpBtnClickHandler);
			});
		}

		function signIn() {
			portal.signIn().then(function (user) {
				// update the header row
				updateHeader();
				// Represents a registered user of the Portal.
				portalUser = portal.getPortalUser();
				// The username for the user.
				owner = portalUser.username;
				// The url to the thumbnail image for the user.
				portalUserThumbnailUrl = portalUser.thumbnailUrl;
				// If user has no thumbnail, apply the default thumbnail for a user
				if (portalUserThumbnailUrl === null) {
					portalUserThumbnailUrl = "https://cdn.arcgis.com/cdn/5777/js/arcgisonline/css/images/no-user-thumb.jpg";
				}
				// load the validation rules
				validator = new Validator();
				validator.startup();
				// query the user's items
				var params = {
					q:"owner:" + owner,
					num:1000
				};
				portal.queryItems(params).then(function (result) {
					// total number of items
					var numItems = result.total;
					// update the ribbon header
					domAttr.set(query(".ribbon-header-title").parent()[0], "class", "");
					ribbonHeaderTitle.innerHTML = defaults.HEADER_BLOCK_PRIVATE;
					ribbonHeaderUser.innerHTML = " (" + portalUser.fullName + " - " + owner + ")";
					ribbonHeaderNumItemsNode.innerHTML = " " + numItems + " Items";
					domAttr.set(ribbonHeaderNumItemsNode, "class", "icon-stack");

					atlasTagStore = new Memory({
					data:[
						{ id:"categories", name:"" },
						{ id:"basemapsCategory", name:"Basemaps", type:"parent", parent:"categories"},
						{ id:"esriBasemapsCB", name:"Esri Basemaps", parent:"basemapsCategory", path:["categories", "basemapsCategory"] },
						{ id:"partnerBasemapsCB", name:"Partner Basemaps", parent:"basemapsCategory", path:["categories", "basemapsCategory"] },
						{ id:"userBasemapsCB", name:"User Basemaps", parent:"basemapsCategory", path:["categories", "basemapsCategory"] },

						{ id:"imageryCategory", name:"Imagery", type:"parent", parent:"categories"},
						{ id:"eventImageryCB", name:"Event Imagery", parent:"imageryCategory", path:["categories", "imageryCategory"] },
						{ id:"basemapsImageryCB", name:"Basemaps Imagery", parent:"imageryCategory", path:["categories", "imageryCategory"] },
						{ id:"multispectralImageryCB", name:"Multi-spectral Imagery", parent:"imageryCategory", path:["categories", "imageryCategory"] },
						{ id:"temporalImageryCB", name:"Temporal Imagery", parent:"imageryCategory", path:["categories", "imageryCategory"] },

						{ id:"demographicsCategory", name:"Demographics", type:"parent", parent:"categories"},
						{ id:"ageCB", name:"Age", parent:"demographicsCategory", path:["categories", "demographicsCategory"]  },
						{ id:"householdsCB", name:"Households", parent:"demographicsCategory", path:["categories", "demographicsCategory"]  },
						{ id:"incomeCB", name:"Income", parent:"demographicsCategory", path:["categories", "demographicsCategory"]  },
						{ id:"maritalStatusCB", name:"Marital Status", parent:"demographicsCategory", path:["categories", "demographicsCategory"]  },
						{ id:"populationCB", name:"Population", parent:"demographicsCategory", path:["categories", "demographicsCategory"]  },
						{ id:"raceCB", name:"Race", parent:"demographicsCategory", path:["categories", "demographicsCategory"]  },

						{ id:"lifestyleCategory", name:"Lifestyle", type:"parent", parent:"categories"},
						{ id:"atRiskCB", name:"At Risk", parent:"lifestyleCategory", path:["categories", "lifestyleCategory"]  },
						{ id:"behaviorsCB", name:"Behaviors", parent:"lifestyleCategory", path:["categories", "lifestyleCategory"]  },
						{ id:"businessAndJobsCB", name:"Business and Jobs", parent:"lifestyleCategory", path:["categories", "lifestyleCategory"]  },
						{ id:"housingCB", name:"Housing", parent:"lifestyleCategory", path:["categories", "lifestyleCategory"]  },
						{ id:"povertyCB", name:"Poverty", parent:"lifestyleCategory", path:["categories", "lifestyleCategory"]  },
						{ id:"spendingCB", name:"Spending", parent:"lifestyleCategory", path:["categories", "lifestyleCategory"]  },

						{ id:"landscapeCategory", name:"Landscape", type:"parent", parent:"categories"},
						{ id:"climateCB", name:"Climate", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"ecologyCB", name:"Ecology", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"speciesBiologyCB", name:"Species Biology", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"ecologicalDisturbanceCB", name:"Ecological Disturbance", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"elevationCB", name:"Elevation", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"environmentalImpactCB", name:"Environmental Impact", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"landCoverCB", name:"Land Cover", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"naturalHazardsCB", name:"Natural Hazards", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"oceansCB", name:"Oceans", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"soilsGeologyCB", name:"Soils/Geology", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"subsurfaceCB", name:"Subsurface", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"waterCB", name:"Water", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"weatherCB", name:"Weather", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },

						{ id:"earthObservationsCategory", name:"Earth Observations ", type:"parent", parent:"categories"},
						{ id:"earthObservationsCB", name:"Earth Observations", parent:"earthObservationsCategory", path:["categories", "earthObservationsCategory"] },

						{ id:"urbanSystemsCategory", name:"Urban Systems", type:"parent", parent:"categories"},
						{ id:"citiesCB", name:"3D Cities", parent:"urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },
						{ id:"movementCB", name:"Movement", parent:"urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },
						{ id:"parcelsCB", name:"Parcels", parent:"urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },
						{ id:"peopleCB", name:"People", parent:"urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },
						{ id:"planningCB", name:"Planning", parent:"urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },
						{ id:"publicCB", name:"Public", parent:"urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },
						{ id:"workCB", name:"Work", parent:"urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },

						{ id:"transportationCategory", name:"Transportation ", type:"parent", parent:"categories"},
						{ id:"locationsCB", name:"Locators", parent:"transportationCategory", path:["categories", "transportationCategory"] },
						{ id:"networkCB", name:"Network", parent:"transportationCategory", path:["categories", "transportationCategory"] },
						{ id:"trafficCB", name:"Traffic", parent:"transportationCategory", path:["categories", "transportationCategory"] },
						{ id:"transportationCB", name:"Transportation", parent:"transportationCategory", path:["categories", "transportationCategory"] },

						{ id:"boundariesAndPlacesCategory", name:"Boundaries and Places", type:"parent", parent:"categories"},
						{ id:"boundariesCB", name:"Boundaries", parent:"boundariesAndPlacesCategory", path:["categories", "boundariesAndPlacesCategory"] },
						{ id:"placesCB", name:"Places", parent:"boundariesAndPlacesCategory", path:["categories", "boundariesAndPlacesCategory"] },

						{ id:"historicalMapsCategory", name:"Historical Maps ", type:"parent", parent:"categories"},
						{ id:"historicalMapsCB", name:"Historical Maps", parent:"historicalMapsCategory" },

						{ id:"storyMapsCategory", name:"Story Maps", type:"parent", parent:"categories"},
						{ id:"architectureAndDesignCB", name:"Architecture and Design", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"businessCB", name:"Business", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"conservationAndSustainabilityCB", name:"Conservation and Sustainability", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"cultureCB", name:"Culture", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"destinationsCB", name:"Destinations", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"eventsAndDisastersCB", name:"Events and Disasters", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"historyCB", name:"History", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"infrastructureAndPlanningCB", name:"Infrastructure and Planning", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"natureAndEnvironmentCB", name:"Nature and Environment", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"oceansStoryMapsCB", name:"Oceans ", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"parksAndRecreationCB", name:"Parks and Recreation", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"peopleAndHealthCB", name:"People and Health", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"publicArtCB", name:"Public Art", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"scienceAndTechnologyCB", name:"Science and Technology", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"sportsAndEntertainmentCB", name:"Sports and Entertainment", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"traveloguesCB", name:"Travelogues", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
					],

					// Returns all direct children of this widget
					getChildren:function (object) {
						return this.query({
							parent:object.id
						});
					}
				});

					loadNominatedItemContent().then(function (results) {
						nominatedItems = results;

						if (numItems > 0) {
							// dGrid columns
							var dgridColumns = [
								{
									label:"",
									field:"thumbnailUrl",
									renderCell:renderRow
								}
							];
							// dGrid item store
							itemStore = new Memory({
								data:result.results
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
								noDataMessage:'No results found.'
							}, "dgrid");
							dgrid.startup();

							// set the maximum possible scores for each section and the overall possible maximum score
							// for all the sections combined
							initScoreMaxValues();

							nominateAdminFL = new FeatureLayer(defaults.NOMINATE_ADMIN_FEATURE_SERVICE_URL);
							on(nominateAdminFL, "edits-complete", function (complete) {
								if (complete.adds[0].success) {
									var itemStatusNode = query(".item-nomination-status-" + selectedRowID)[0];
									domConstruct.place(defaults.CURRENT_STATUS[1].label, itemStatusNode, "replace");
									// update the client-side collection of nominated items
									loadNominatedItemContent().then(function (results) {
										nominatedItems = results;
									});
								} else {
									console.debug("ERROR: ", complete);
								}
							});

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
									updateNodeHeight(previousSelectedRow, COLLAPSE_ROW_HEIGHT);
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
									var nominateBtnID = NOMINATE_BTN_ID + selectedRowID;

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
														"				<div class='current-score-number'></div>" +
														"				<div id='progressBarMarker'></div>" +
														"			</div>" +
														"			<div class='column-3 right' style='margin-top: -15px !important;'>" +
														"				<button id='" + nominateBtnID + "' class='btn icon-email custom-btn disabled'> NOMINATE </button>" +
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
										nominateBtnNode = dom.byId(nominateBtnID);

										// create button group
										initContentButtonGroup(tcID);

										// initialize content area with details data
										detailsContentPane(selectedRowID, titleID, snippetID, descID);
										domClass.replace(detailsNode, "active column-4 details-tab-node", "column-4 details-tab-node");

										if (item.type === "Web Map") {
											var mapDrawBegin = performance.now(),
													mapDrawComplete;
											// Web Map, Feature Service, Map Service, Image Service, Web Mapping Application
											arcgisUtils.createMap(selectedRowID, "map").then(function (response) {
												//console.log(response);
												layers = response.itemInfo.itemData.operationalLayers;
												map = response.map;

												// make sure map is loaded
												if (map.loaded) {
													mapDrawComplete = performance.now();
													var mapDrawTime = (mapDrawComplete - mapDrawBegin);
													fadeLoader();

													// set performance scores
													mapDrawTimeScore = validator.setMapDrawTimeScore(mapDrawTime);
													nLayersScore = validator.setNumLayersScore(layers);
													popupsScore = validator.setPopupScore(response);
													sharingScore = validator.setSharingScore(item);
													performanceScore = mapDrawTimeScore + nLayersScore + popupsScore + sharingScore;
													// set style on performance button
													setPassFailStyleOnTabNode(performanceScore, performanceNode, PERFORMANCE_MAX_SCORE);
													// initialize the scores
													initScores(item, portalUser);
													HAS_PERFORMANCE_CONTENT = true;

													on(performanceNode, "click", lang.partial(performanceNodeClickHandler, nodeList, item, popupsScore, mapDrawTime, response, layers, performanceNode));
												}
											});
										} else {
											// fade the loader
											fadeLoader();
											// hide the map div
											domStyle.set("map", "display", "none");
											//
											on(performanceNode, "click", lang.partial(performanceNodeClickHandler, nodeList, item, "", "", "", layers, performanceNode));

											mapDrawTimeScore = 0;
											nLayersScore = 0;
											popupsScore = 0;
											sharingScore = validator.setSharingScore(item);
											performanceScore = mapDrawTimeScore + nLayersScore + popupsScore + sharingScore;

											// initialize the scores
											initScores(item, portalUser);
											HAS_PERFORMANCE_CONTENT = false;
										}
										on(detailsNode, "click", lang.partial(detailsNodeClickHandler, selectedRowID, nodeList, titleID, snippetID, descID, detailsNode));
										on(creditsNode, "click", lang.partial(creditsNodeClickHandler, selectedRowID, nodeList, item, accessID, creditID, creditsNode));
										on(tagsNode, "click", lang.partial(tagsNodeClickHandler, selectedRowID, nodeList, categoryID, tagsID, tagsNode));
										on(profileNode, "click", lang.partial(profileNodeClickHandler, selectedRowID, nodeList, userNameID, userDescriptionID, profileNode));

										// overall score graphic
										if (dijit.byId("overall-score-graphic")) {
											dijit.byId("overall-score-graphic").destroy();
										}
										if (dijit.byId("overall-score-graphic") === undefined) {
											overallScoreGraphic = new ProgressBar({
												id:"overall-score-graphic",
												style:{
													"width":"100%",
													"height":"5px"
												},
												value:overAllCurrentScore
											}).placeAt(progressBarNode).startup();
										}

										//var barAttr = domStyle.get(query(".dijitProgressBarLabel")[0]);
										//var externalBarWidth = domStyle.get(query(".dijitProgressBarLabel")[0], "width");
										//var internalBarWidth = domStyle.get(query(".dijitProgressBarFull")[0], "width");

										// draw the minimum score marker
										initPassingMarker();
									});
								}
							});
						} else {
							console.log("USER HAS NO ITEMS");
						}


					});
				});
			});
		}

		function loadNominatedItemContent() {
			var deferred = new Deferred();
			var query = new Query();
			query.returnGeometry = false;
			query.outFields = ["*"];
			// TODO more than 2000?
			query.where = "1=1";
			var queryTask = new QueryTask(defaults.NOMINATE_ADMIN_FEATURE_SERVICE_URL);
			queryTask.execute(query).then(function (results) {
				deferred.resolve(results);
			});
			return deferred.promise;
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

		function filterItemsClickHandler() {
			var checkedListItem = query(".filter-check");
			domAttr.set(checkedListItem, "class", "filter-list");
			domClass.remove(checkedListItem[0], "icon-check filter-check");
			domStyle.set(checkedListItem, "margin-left", "20px");
			query(".filter-list").style("margin-left", "20px");
			domAttr.set(this, "class", "filter-list icon-check filter-check");
			domStyle.set(this, "margin-left", "2px");
			var target = domAttr.get(this, "data-value");
			applyFilter(target);
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
			applySort(target);
		}

		function helpBtnClickHandler() {
			var helpDialog = new Dialog({
				title:"HELP",
				content:"<div>Not implemented yet</div>",
				style:"width: 300px"
			});
			helpDialog.show();
		}


		function detailsContentPane(selectedRowID, titleID, snippetID, descID) {
			portalUser.getItem(selectedRowID).then(function (item) {
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
				createTooltips([itemThumbnailTooltipNode, itemTitleTooltipNode, itemSummaryTooltipNode, itemDescriptionTooltipNode],
						[tooltipsConfig.ITEM_THUMBNAIL_TOOLTIP_CONTENT, tooltipsConfig.ITEM_TITLE_TOOLTIP_CONTENT, tooltipsConfig.ITEM_SUMMARY_TOOLTIP_CONTENT, tooltipsConfig.ITEM_DESCRIPTION_TOOLTIP_CONTENT]);

				// set denominator
				thumbnailScoreDenominatorNode.innerHTML = ITEM_THUMBNAIL_MAX_SCORE;
				titleScoreDenominatorNode.innerHTML = ITEM_TITLE_MAX_SCORE;
				summaryScoreDenominatorNode.innerHTML = ITEM_SUMMARY_MAX_SCORE;
				descScoreDenominatorNode.innerHTML = ITEM_DESC_MAX_SCORE;

				// set numerator
				itemThumbnailScore = validator.setThumbnailScore(item);
				itemTitleScore = validator.setItemTitleScore(item.title);
				itemSummaryScore = validator.setItemSummaryScore(item.snippet);
				itemDescriptionScore = validator.setItemDescriptionScore(item.description);
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
				//updateOverallScore();

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

						// for some reason, cannot upload empty strings, probably issue on my end
						if (itemDescription.length < 0) {
							itemDescription = " ";
						}

						// write to AGOL
						portalUser.getItem(selectedRowID).then(function (results) {
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
											updateEditSaveButton(editSaveBtnNode, " EDIT ", cancelBtnNode, "none");
											// set numerator
											itemThumbnailScore = validator.setThumbnailScore(results);
											itemTitleScore = validator.setItemTitleScore(itemTitle);
											itemSummaryScore = validator.setItemSummaryScore(itemSummary);
											itemDescriptionScore = validator.setItemDescriptionScore(itemDescription);
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
					//itemThumbnailScore = validator.setThumbnailScore(results);
					itemTitleScore = validator.setItemTitleScore(itemTitle_clean);
					itemSummaryScore = validator.setItemSummaryScore(itemSummary_clean);
					itemDescriptionScore = validator.setItemDescriptionScore(itemDescription_clean);
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
				var itemCredits = validator.validateStr(item.accessInformation),
						itemCredits_clean = itemCredits,
						accessAndUseConstraints = validator.validateStr(item.licenseInfo),
						accessAndUseConstraints_clean = accessAndUseConstraints;

				// load the content
				loadContent(credits.ACCESS_CREDITS_CONTENT);

				domAttr.set(query(".creditsID-textbox")[0], "id", creditID);
				domConstruct.create("div", {innerHTML:itemCredits}, query(".creditsID-textbox")[0], "first");

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
				itemCreditsScore = validator.setCreditsScore(item.accessInformation);
				itemAccessAndUseConstraintsScore = validator.setAccessAndUseConstraintsScore(item.licenseInfo);
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

						portalUser.getItem(selectedRowID).then(function (results) {
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
						itemCreditsScore = validator.setCreditsScore(itemCredits);
						itemAccessAndUseConstraintsScore = validator.setAccessAndUseConstraintsScore(accessAndUseConstraints);
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
					itemCreditsScore = validator.setCreditsScore(itemCredits_clean);
					itemAccessAndUseConstraintsScore = validator.setAccessAndUseConstraintsScore(accessAndUseConstraints_clean);
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

				// nodes
				var editSaveBtnNode = query(".edit-save-btn")[0];
				var cancelBtnNode = query(".cancel-btn")[0];
				var tagsTooltipNode = query(".tags-tooltip")[0];
				var tagsScoreNodeContainer = query(".tags-score-gr")[0];
				var tagsScoreNumeratorNode = query(".tags-score-num")[0];
				var tagsScoreDenominatorNode = query(".tags-score-denom")[0];
				// tooltips
				createTooltips([tagsTooltipNode], [tooltipsConfig.TAGS_TOOLTIP_CONTENT]);

				// tags
				var itemTags = item.tags;
				var itemTags_clean = itemTags;

				// validate score
				itemTagsScore = validateItemTags(itemTags);
				// set numerator
				tagsScoreNumeratorNode.innerHTML = itemTagsScore;
				// set denominator
				tagsScoreDenominatorNode.innerHTML = TAGS_MAX_SCORE;
				// update section score
				updateSectionScore(itemTagsScore, tagsNode, TAGS_MAX_SCORE);
				// update section score style
				updateSectionScoreStyle(itemTagsScore, TAGS_MAX_SCORE, tagsScoreNodeContainer);
				// update overall score
				updateOverallScore();

				// create the existing tags (un-editable)
				domConstruct.create("div", {
					class:"existing-tags"
				}, query(".tag-container")[0], "first");
				styleTags(itemTags, query(".existing-tags")[0]);

				// existing tags store
				tagStore = new Memory({
					idProperty:"tag",
					data:[].concat(itemTags)
				});
				// atlas tags store
				/*atlasTagStore = new Memory({
					data:[
						{ id:"categories", name:"" },
						{ id:"basemapsCategory", name:"Basemaps", type:"parent", parent:"categories"},
						{ id:"esriBasemapsCB", name:"Esri Basemaps", parent:"basemapsCategory", path:["categories", "basemapsCategory"] },
						{ id:"partnerBasemapsCB", name:"Partner Basemaps", parent:"basemapsCategory", path:["categories", "basemapsCategory"] },
						{ id:"userBasemapsCB", name:"User Basemaps", parent:"basemapsCategory", path:["categories", "basemapsCategory"] },

						{ id:"imageryCategory", name:"Imagery", type:"parent", parent:"categories"},
						{ id:"eventImageryCB", name:"Event Imagery", parent:"imageryCategory", path:["categories", "imageryCategory"] },
						{ id:"basemapsImageryCB", name:"Basemaps Imagery", parent:"imageryCategory", path:["categories", "imageryCategory"] },
						{ id:"multispectralImageryCB", name:"Multi-spectral Imagery", parent:"imageryCategory", path:["categories", "imageryCategory"] },
						{ id:"temporalImageryCB", name:"Temporal Imagery", parent:"imageryCategory", path:["categories", "imageryCategory"] },

						{ id:"demographicsCategory", name:"Demographics", type:"parent", parent:"categories"},
						{ id:"ageCB", name:"Age", parent:"demographicsCategory", path:["categories", "demographicsCategory"]  },
						{ id:"householdsCB", name:"Households", parent:"demographicsCategory", path:["categories", "demographicsCategory"]  },
						{ id:"incomeCB", name:"Income", parent:"demographicsCategory", path:["categories", "demographicsCategory"]  },
						{ id:"maritalStatusCB", name:"Marital Status", parent:"demographicsCategory", path:["categories", "demographicsCategory"]  },
						{ id:"populationCB", name:"Population", parent:"demographicsCategory", path:["categories", "demographicsCategory"]  },
						{ id:"raceCB", name:"Race", parent:"demographicsCategory", path:["categories", "demographicsCategory"]  },

						{ id:"lifestyleCategory", name:"Lifestyle", type:"parent", parent:"categories"},
						{ id:"atRiskCB", name:"At Risk", parent:"lifestyleCategory", path:["categories", "lifestyleCategory"]  },
						{ id:"behaviorsCB", name:"Behaviors", parent:"lifestyleCategory", path:["categories", "lifestyleCategory"]  },
						{ id:"businessAndJobsCB", name:"Business and Jobs", parent:"lifestyleCategory", path:["categories", "lifestyleCategory"]  },
						{ id:"housingCB", name:"Housing", parent:"lifestyleCategory", path:["categories", "lifestyleCategory"]  },
						{ id:"povertyCB", name:"Poverty", parent:"lifestyleCategory", path:["categories", "lifestyleCategory"]  },
						{ id:"spendingCB", name:"Spending", parent:"lifestyleCategory", path:["categories", "lifestyleCategory"]  },

						{ id:"landscapeCategory", name:"Landscape", type:"parent", parent:"categories"},
						{ id:"climateCB", name:"Climate", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"ecologyCB", name:"Ecology", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"speciesBiologyCB", name:"Species Biology", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"ecologicalDisturbanceCB", name:"Ecological Disturbance", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"elevationCB", name:"Elevation", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"environmentalImpactCB", name:"Environmental Impact", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"landCoverCB", name:"Land Cover", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"naturalHazardsCB", name:"Natural Hazards", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"oceansCB", name:"Oceans", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"soilsGeologyCB", name:"Soils/Geology", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"subsurfaceCB", name:"Subsurface", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"waterCB", name:"Water", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },
						{ id:"weatherCB", name:"Weather", parent:"landscapeCategory", path:["categories", "landscapeCategory"] },

						{ id:"earthObservationsCategory", name:"Earth Observations ", type:"parent", parent:"categories"},
						{ id:"earthObservationsCB", name:"Earth Observations", parent:"earthObservationsCategory", path:["categories", "earthObservationsCategory"] },

						{ id:"urbanSystemsCategory", name:"Urban Systems", type:"parent", parent:"categories"},
						{ id:"citiesCB", name:"3D Cities", parent:"urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },
						{ id:"movementCB", name:"Movement", parent:"urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },
						{ id:"parcelsCB", name:"Parcels", parent:"urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },
						{ id:"peopleCB", name:"People", parent:"urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },
						{ id:"planningCB", name:"Planning", parent:"urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },
						{ id:"publicCB", name:"Public", parent:"urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },
						{ id:"workCB", name:"Work", parent:"urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },

						{ id:"transportationCategory", name:"Transportation ", type:"parent", parent:"categories"},
						{ id:"locationsCB", name:"Locators", parent:"transportationCategory", path:["categories", "transportationCategory"] },
						{ id:"networkCB", name:"Network", parent:"transportationCategory", path:["categories", "transportationCategory"] },
						{ id:"trafficCB", name:"Traffic", parent:"transportationCategory", path:["categories", "transportationCategory"] },
						{ id:"transportationCB", name:"Transportation", parent:"transportationCategory", path:["categories", "transportationCategory"] },

						{ id:"boundariesAndPlacesCategory", name:"Boundaries and Places", type:"parent", parent:"categories"},
						{ id:"boundariesCB", name:"Boundaries", parent:"boundariesAndPlacesCategory", path:["categories", "boundariesAndPlacesCategory"] },
						{ id:"placesCB", name:"Places", parent:"boundariesAndPlacesCategory", path:["categories", "boundariesAndPlacesCategory"] },

						{ id:"historicalMapsCategory", name:"Historical Maps ", type:"parent", parent:"categories"},
						{ id:"historicalMapsCB", name:"Historical Maps", parent:"historicalMapsCategory" },

						{ id:"storyMapsCategory", name:"Story Maps", type:"parent", parent:"categories"},
						{ id:"architectureAndDesignCB", name:"Architecture and Design", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"businessCB", name:"Business", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"conservationAndSustainabilityCB", name:"Conservation and Sustainability", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"cultureCB", name:"Culture", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"destinationsCB", name:"Destinations", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"eventsAndDisastersCB", name:"Events and Disasters", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"historyCB", name:"History", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"infrastructureAndPlanningCB", name:"Infrastructure and Planning", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"natureAndEnvironmentCB", name:"Nature and Environment", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"oceansStoryMapsCB", name:"Oceans ", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"parksAndRecreationCB", name:"Parks and Recreation", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"peopleAndHealthCB", name:"People and Health", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"publicArtCB", name:"Public Art", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"scienceAndTechnologyCB", name:"Science and Technology", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"sportsAndEntertainmentCB", name:"Sports and Entertainment", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
						{ id:"traveloguesCB", name:"Travelogues", parent:"storyMapsCategory", path:["categories", "storyMapsCategory"] },
					],

					// Returns all direct children of this widget
					getChildren:function (object) {
						return this.query({
							parent:object.id
						});
					}
				});*/

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
						updateTreePath(tree, treeModel, customTagsWidget.values);
					},
					onClick:function (item, node, evt) {
						//console.log(item);
					},
					onOpen:function (item, node) {
						var name = item.name;
						if (editSaveBtnNode.innerHTML === " EDIT ") {
							toggleCheckboxes(checkBoxID_values, "disabled", true);
						} else {
							toggleCheckboxes(checkBoxID_values, "disabled", false);
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
					updateTreePath(tree, treeModel, customTagsWidget.values);
				});

				on(editSaveBtnNode, "click", function () {
					if (editSaveBtnNode.innerHTML === " EDIT ") {
						// EDIT mode
						updateEditSaveButton(editSaveBtnNode, " SAVE ", cancelBtnNode, "block");
						// remove non-editing tag nodes
						// domConstruct.empty(query(".existing-tags")[0]);
						domStyle.set(query(".existing-tags")[0], "display", "none");
						// display the tags dijit
						domStyle.set("tag-widget", "display", "block");
						// enable living atlas checkboxes
						toggleCheckboxes(checkBoxID_values, "disabled", false);
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
										styleTags(tagStore.data, query(".existing-tags")[0]);
										domStyle.set(query(".existing-tags")[0], "display", "block");
										domStyle.set("tag-widget", "display", "none");
										// set the numerator and update score
										itemTagsScore = validateItemTags(tagStore.data);
										tagsScoreNumeratorNode.innerHTML = itemTagsScore;
										// section overall score
										updateSectionScore(itemTagsScore, tagsNode, TAGS_MAX_SCORE);
										updateSectionScoreStyle(itemTagsScore, TAGS_MAX_SCORE, tagsScoreNodeContainer);
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
					domStyle.set(query(".existing-tags")[0], "display", "block");
					domStyle.set("tag-widget", "display", "none");

					// set the numerator and update score
					itemTagsScore = validateItemTags(itemTags_clean);
					tagsScoreNumeratorNode.innerHTML = itemTagsScore;
					// section overall score
					updateSectionScore(itemTagsScore, tagsNode, TAGS_MAX_SCORE);
					updateSectionScoreStyle(itemTagsScore, TAGS_MAX_SCORE, tagsScoreNodeContainer);
					updateOverallScore();
					// disable living atlas checkboxes
					toggleCheckboxes(checkBoxID_values, "disabled", true);
					updateEditSaveButton(editSaveBtnNode, " EDIT ", cancelBtnNode, "none");
				});
			});
		}

		function performanceContentPane(item, popupScore, mapDrawTime, response, layers) {
			// load the content
			loadContent(performanceConfig.PERFORMANCE_CONTENT);

			// tooltip nodes
			var mapLayersTooltipNode = query(".map-layers-tooltip")[0],
					sharingNode = query(".sharing-tooltip")[0],
					drawTimeTooltipNode = query(".draw-time-tooltip")[0],
					popupsTooltipNode = query(".popups-tooltip")[0];
			// create tooltips
			createTooltips([mapLayersTooltipNode, sharingNode, drawTimeTooltipNode, popupsTooltipNode], [tooltipsConfig.PERFORMANCE_MAP_LAYERS_TOOLTIP_CONTENT, tooltipsConfig.PERFORMANCE_SHARING_TOOLTIP_CONTENT, tooltipsConfig.PERFORMANCE_DRAW_TIME_TOOLTIP_CONTENT, tooltipsConfig.PERFORMANCE_POP_UPS_TOOLTIP_CONTENT]);

			// map draw time nodes
			var mdtScoreContainerNode = query(".mdt-score-gr")[0],
					mdtNumeratorNode = query(".mdt-score-num")[0],
					mdtDenominatorNode = query(".mdt-score-denom")[0];
			var mdtGoodNode = query(".performance-text-very-slow")[0],
					mdtBetterNode = query(".performance-text-slow")[0],
					mdtBestNode = query(".performance-text-good")[0];
			if (mapDrawTimeScore === scoring.PERFORMANCE_DRAW_TIME_BEST_SCORE) {
				domStyle.set(mdtGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(mdtBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(mdtBestNode, "color", "#0079C1");
			} else if (mapDrawTimeScore === scoring.PERFORMANCE_DRAW_TIME_BETTER_SCORE) {
				domStyle.set(mdtGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(mdtBetterNode, "color", "#0079C1");
				domStyle.set(mdtBestNode, "color", "rgba(0, 122, 194, 0.24)");
			} else if (mapDrawTimeScore === scoring.PERFORMANCE_DRAW_TIME_GOOD_SCORE) {
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
			if (nLayersScore === scoring.LAYER_COUNT_GOOD_SCORE) {
				// GOOD
				domStyle.set(nLayersGoodNode, "color", scoring.PASS_COLOR);
				domStyle.set(nLayersBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(nLayersBestNode, "color", "rgba(0, 122, 194, 0.24)");
			} else if (nLayersScore === scoring.LAYER_COUNT_BETTER_SCORE) {
				// BETTER
				domStyle.set(nLayersGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(nLayersBetterNode, "color", scoring.PASS_COLOR);
				domStyle.set(nLayersBestNode, "color", "rgba(0, 122, 194, 0.24)");
			} else if (nLayersScore === scoring.LAYER_COUNT_BEST_SCORE) {
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

			popupsScore = validator.setPopupScore(response);
			// popups
			var popupsScoreContainerNode = query(".popups-score-gr")[0],
					popupsNumeratorNode = query(".popups-score-num")[0],
					popupsDenominatorNode = query(".popups-score-denom")[0];
			var popupsNoneNode = query(".performance-popups-none")[0],
					popupsDefaultNode = query(".performance-popups-default")[0],
					popupsCustomNode = query(".performance-popups-custom")[0];

			if (popupsScore === 7) {
				domStyle.set(popupsNoneNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(popupsDefaultNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(popupsCustomNode, "color", "#005E95");
			} else if (popupsScore === 2) {
				domStyle.set(popupsNoneNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(popupsDefaultNode, "color", "#005E95");
				domStyle.set(popupsCustomNode, "color", "rgba(0, 122, 194, 0.24)");
			} else {
				domStyle.set(popupsNoneNode, "color", "#005E95");
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
			if (sharingScore === scoring.PERFORMANCE_SHARING_PRIVATE_SCORE) {
				// GOOD
				domStyle.set(sharingGoodNode, "color", "#005E95");
				domStyle.set(sharingBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(sharingBestNode, "color", "rgba(0, 122, 194, 0.24)");
			} else if (sharingScore === scoring.PERFORMANCE_SHARING_ORG_SCORE) {
				// BETTER
				domStyle.set(sharingGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(sharingBetterNode, "color", "#005E95");
				domStyle.set(sharingBestNode, "color", "rgba(0, 122, 194, 0.24)");
			} else {
				// BEST
				domStyle.set(sharingGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(sharingBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(sharingBestNode, "color", "#005E95");
			}

			// set the numerators
			mdtNumeratorNode.innerHTML = mapDrawTimeScore;
			layerCountNumeratorNode.innerHTML = nLayersScore;
			popupsNumeratorNode.innerHTML = popupsScore;
			sharingNumeratorNode.innerHTML = sharingScore;
			// set the denominators
			mdtDenominatorNode.innerHTML = layerCountDenominatorNode.innerHTML = popupsDenominatorNode.innerHTML = sharingDenominatorNode.innerHTML = scoring.PERFORMANCE_MAX;

			// update the section styles
			updateSectionScoreStyle(mapDrawTimeScore, PERFORMANCE_DRAW_TIME_MAX_SCORE, mdtScoreContainerNode);
			updateSectionScoreStyle(nLayersScore, PERFORMANCE_LAYER_COUNT_MAX_SCORE, nLayersScoreContainerNode);
			updateSectionScoreStyle(popupsScore, PERFORMANCE_POPUPS_MAX_SCORE, popupsScoreContainerNode);
			updateSectionScoreStyle(sharingScore, PERFORMANCE_SHARING_MAX_SCORE, sharingContainerNode);
		}

		function loadProfileContentPane(selectedRowID, _userNameID, _userDescriptionID) {
			portalUser.getItem(selectedRowID).then(function (item) {
				// item full name
				var _userFullName = validator.validateStr(portalUser.fullName);
				var _userFullName_clean = _userFullName;
				// item user description
				var _userDescription = validator.validateStr(portalUser.description);
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
				domConstruct.create("div", {innerHTML:_userFullName}, profileUserFullNameNode, "first");
				// set the user description
				domAttr.set(profileUserDescriptionNode, "id", _userDescriptionID);
				domConstruct.create("div", {innerHTML:_userDescription}, profileUserDescriptionNode, "first");

				// tooltips
				createTooltips([profileThumbnailTooltipNode, profileFullNameTooltipNode, profileDescriptionTooltipNode], [tooltipsConfig.USER_PROFILE_THUMBNAIL_TOOLTIP_CONTENT, tooltipsConfig.USER_PROFILE_FULL_NAME_TOOLTIP_CONTENT, tooltipsConfig.USER_PROFILE_DESCRIPTION_TOOLTIP_CONTENT]);

				// set denominator
				userThumbnailDenominatorNode.innerHTML = USER_PROFILE_THUMBNAIL;
				userNameScoreDenominatorNode.innerHTML = USER_PROFILE_FULLNAME;
				userDescriptionScoreDenominatorNode.innerHTML = USER_PROFILE_DESCRIPTION;

				// score content
				userThumbnailScore = 7;//validator.setThumbnailScore(portalUser.thumbnail);
				userNameScore = validator.setUserProfileFullNameScore(portalUser.fullName);
				userDescriptionScore = validator.setUserDescriptionScore(portalUser.description);
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
						domConstruct.create("input", {
							class:"edit-user-full-name",
							value:_userFullName
						}, profileUserFullNameNode, "first");
						domAttr.set(profileUserFullNameNode, "data-dojo-type", "dijit/form/TextBox");
						domAttr.set(profileUserFullNameNode, "id", _userNameID);

						// update user description
						domConstruct.empty(profileUserDescriptionNode);
						domConstruct.create("input", {
							class:"edit-user-description",
							value:_userDescription
						}, profileUserDescriptionNode, "first");
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
											domAttr.set(profileUserFullNameNode, "id", _userNameID);

											domConstruct.empty(profileUserDescriptionNode);
											domConstruct.create("div", {innerHTML:_userDescription}, profileUserDescriptionNode, "first");
											domAttr.remove(profileUserDescriptionNode, "data-dojo-type");
											domAttr.set(profileUserDescriptionNode, "id", _userDescriptionID);

											_userFullName_clean = _userFullName;
											_userDescription_clean = _userDescription;

											updateEditSaveButton(editSaveBtnNode, " EDIT ", cancelBtnNode, "none");

											// score content
											userThumbnailScore = 0;//setUserProfileThumbnailScore()
											userNameScore = validator.setUserProfileFullNameScore(_userFullName_clean);
											userDescriptionScore = validator.setUserDescriptionScore(_userDescription_clean);
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
					domConstruct.create("div", {innerHTML:_userFullName_clean}, profileUserFullNameNode, "first");
					domAttr.remove(profileUserFullNameNode, "data-dojo-type");
					domAttr.set(profileUserFullNameNode, "id", _userNameID);

					domConstruct.empty(profileUserDescriptionNode);
					domConstruct.create("div", {innerHTML:_userDescription_clean}, profileUserDescriptionNode, "first");
					domAttr.remove(profileUserDescriptionNode, "data-dojo-type");
					domAttr.set(profileUserDescriptionNode, "id", _userDescriptionID);
					domAttr.set(editSaveBtnNode, "innerHTML", " EDIT ");
					domStyle.set(cancelBtnNode, "display", "none");

					userThumbnailScore = 0;//setUserProfileThumbnailScore()
					userNameScore = validator.setUserProfileFullNameScore(_userFullName_clean);
					userDescriptionScore = validator.setUserDescriptionScore(_userDescription_clean);
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

		function loadContent(content) {
			domConstruct.destroy("section-content");
			var node = query(".content-container")[0];
			domConstruct.place(content, node, "last");
		}

		function initScores(item, portalUser) {
			// details
			itemThumbnailScore = validator.setThumbnailScore(item);
			itemTitleScore = validator.setItemTitleScore(item.title);
			itemSummaryScore = validator.setItemSummaryScore(item.snippet);
			itemDescriptionScore = validator.setItemDescriptionScore(item.description);
			itemDetailsScore = itemThumbnailScore + itemTitleScore + itemSummaryScore + itemDescriptionScore;
			setPassFailStyleOnTabNode(itemDetailsScore, detailsNode, ITEM_DETAILS_MAX_SCORE);
			// use/constrains
			itemCreditsScore = validator.setCreditsScore(item.accessInformation);
			itemAccessAndUseConstraintsScore = validator.setAccessAndUseConstraintsScore(item.licenseInfo);
			creditsAndAccessScore = itemCreditsScore + itemAccessAndUseConstraintsScore;
			setPassFailStyleOnTabNode(creditsAndAccessScore, creditsNode, ITEM_USE_CONSTRAINS_MAX_SCORE);
			// tags
			itemTagsScore = validateItemTags(item.tags);
			setPassFailStyleOnTabNode(itemTagsScore, tagsNode, TAGS_MAX_SCORE);
			// performance
			//
			setPassFailStyleOnTabNode(performanceScore, performanceNode, PERFORMANCE_MAX_SCORE);
			// user profile
			userThumbnailScore = 7;//validator.setThumbnailScore(portalUser);
			userNameScore = validator.setUserProfileFullNameScore(portalUser.fullName);
			userDescriptionScore = validator.setUserDescriptionScore(portalUser.description);
			userProfileScore = userThumbnailScore + userNameScore + userDescriptionScore;
			setPassFailStyleOnTabNode(userProfileScore, profileNode, USER_PROFILE_MAX_SCORE);
			// update the overall score and score graphic
			updateOverallScore();
		}

		function updateOverallScore() {
			overAllCurrentScore = Math.floor((itemDetailsScore + creditsAndAccessScore + itemTagsScore + performanceScore + userProfileScore) / MAX_SCORE * 100);
			var classAttrs = domAttr.get(nominateBtnNode, "class");
			if (overAllCurrentScore >= scoring.SCORE_THRESHOLD) {
				// PASS
				domStyle.set(currentOverallScoreNode, "color", scoring.PASS_COLOR);
				classAttrs = classAttrs.replace("disabled", "enabled");
				domAttr.set(nominateBtnNode, "class", classAttrs);
				nominateBtnClickHandler = on(nominateBtnNode, "click", function () {
					//nominateBtnDialog.show();
					isItemNominated(selectedRowID).then(nominate);
				});
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
			currentOverallScoreNode.innerHTML = overAllCurrentScore;
			if (dijit.byId("overall-score-graphic") !== undefined) {
				dijit.byId("overall-score-graphic").update({
					value:overAllCurrentScore
				});
				dijit.byId("overall-score-graphic").set("value", overAllCurrentScore);
			}
		}

		function nominate(count) {
			if (count > 0) {
				console.log("ITEM HAS BEEN NOMINATED");
			} else {
				portalUser.getItem(selectedRowID).then(function (item) {
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
						"ContactEmail":portalUser.email,
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
					nominateAdminFL.applyEdits([graphic], null, null);
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

		function updateSectionScore(score, node, max) {
			var classAttrs = domAttr.get(node, "class");
			score = Math.floor(score / max * 100);
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

		function updateSectionScoreStyle(itemScore, max, node) {
			if ((itemScore / max * 100) >= scoring.SCORE_THRESHOLD) {
				domClass.replace(node, "score-graphic-pass", "score-graphic-fail");
			} else {
				domClass.replace(node, "score-graphic-fail", "score-graphic-pass");
			}
		}

		function validateItemTags(tags) {
			// set the initial score to 0
			var score = 0;
			// words that will deduct points
			var badWords = scoring.TAGS_PENALTY_WORDS;
			// number of tags
			var nTags = tags.length;
			if (nTags >= scoring.TAGS_MIN_NUM_TAGS) {
				// at least one tag exist +1
				score = scoring.TAGS_HAS_TAGS_SCORE;
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
					// PASS
					score = score + scoring.TAGS_HAS_NO_BAD_WORDS_SCORE;
				}

				// check if there are more than 3 tags
				if (nTags > scoring.TAGS_MIN_COUNT) {
					score = score + scoring.TAGS_HAS_EXTRA_TAGS_SCORE;
				}

				// check for atlas tags
				var hasAtlasTag = false;
				array.forEach(atlasTagStore.data, function (atlasTag) {
					array.forEach(tags, function (tag) {
						if (tag === atlasTag.name) { //atlasTag.tag.toLowerCase()) {
							hasAtlasTag = true;
						}
					});
				});

				if (hasAtlasTag) {
					score = score + scoring.TAGS_HAS_ATLAS_TAGS_SCORE;
				}
			} else {
				score = 0;
			}
			return score;
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
					title:item
				}, listItemNode);
				html.set(listItemDivNode, item);
			});
		}

		function updateTreePath(tree, treeModel, userTags) {
			var tagPaths = [];
			// iterate over the user tags from AGOL
			array.forEach(userTags, function (tag) {
				// iterate over each of the atlas tags
				array.forEach(treeModel.store.data, function (atlasTag) {
					// check if there is a match
					if (tag === atlasTag.name) {
						// check if it's not a parent/root node
						if (atlasTag.path) {
							// add the id and the tag's path to the list of paths
							atlasTag.path.push(atlasTag.id);
							tagPaths.push(atlasTag.path);
							// check the check box
							if (registry.byId(tag)) {
								registry.byId(tag).set("checked", true);
							}
						}
					}
				});
			});
			tree.set('paths', tagPaths);
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
									portalUser.getItem(item.id).then(lang.hitch(this, function (userItem) {
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
											url:lang.replace("{url}", portalUser),
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
			//console.log(lang.replace("{url}/update", portalUser));
			var deferred = new Deferred();
			esriRequest({
				url:lang.replace("{url}/update", portalUser),
				form:form,
				content:{
					f:"json"
				},
				handleAs:"json"
			}).then(deferred.resolve, deferred.reject);
			return deferred.promise;
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

		function setPassFailStyleOnTabNode(score, node, sectionThreshold) {
			var average = Math.floor(score / sectionThreshold * 100);
			var classAttrs = domAttr.get(node, "class");
			if (average >= scoring.SCORE_THRESHOLD) {
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
					"<span class='current-overall-gr-number'> " + scoring.SCORE_THRESHOLD + "</span>" +
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
			ITEM_THUMBNAIL_MAX_SCORE = scoring.ITEM_THUMBNAIL_NONE_SCORE + scoring.ITEM_THUMBNAIL_CUSTOM + scoring.ITEM_THUMBNAIL_LARGE_SCORE;
			ITEM_TITLE_MAX_SCORE = scoring.ITEM_TITLE_NO_BAD_WORDS_SCORE + scoring.ITEM_TITLE_NO_UNDERSCORE_SCORE + scoring.ITEM_TITLE_MIN_LENGTH_SCORE + scoring.ITEM_TITLE_NO_ALL_CAPS_SCORE;
			ITEM_SUMMARY_MAX_SCORE = scoring.ITEM_SUMMARY_MUST_EXIST_SCORE + scoring.ITEM_SUMMARY_NO_BAD_WORDS_SCORE + scoring.ITEM_SUMMARY_NO_UNDERSCORE_SCORE + scoring.ITEM_SUMMARY_MIN_LENGTH_SCORE;
			ITEM_DESC_MAX_SCORE = scoring.ITEM_DESCRIPTION_MUST_EXIST_SCORE + scoring.ITEM_DESCRIPTION_MIN_LENGTH_SCORE + scoring.ITEM_DESCRIPTION_LINK_SCORE;
			ITEM_DETAILS_MAX_SCORE = ITEM_THUMBNAIL_MAX_SCORE + ITEM_TITLE_MAX_SCORE + ITEM_SUMMARY_MAX_SCORE + ITEM_DESC_MAX_SCORE;
			// Use/Credits
			ITEM_CREDIT_MAX_SCORE = scoring.ITEM_CREDITS_MIN_NUM_WORDS_SCORE;
			ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE = scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_WORDS_SCORE + scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_MIN_WORDS_SCORE + scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_BONUS_WORDS_SCORE + scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_VALID_LINK_SCORE;
			ITEM_USE_CONSTRAINS_MAX_SCORE = ITEM_CREDIT_MAX_SCORE + ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE;
			// Tags
			TAGS_MAX_SCORE = scoring.TAGS_HAS_TAGS_SCORE + scoring.TAGS_HAS_ATLAS_TAGS_SCORE + scoring.TAGS_HAS_EXTRA_TAGS_SCORE + scoring.TAGS_HAS_NO_BAD_WORDS_SCORE;
			// Performance
			PERFORMANCE_SHARING_MAX_SCORE = scoring.PERFORMANCE_MAX;
			PERFORMANCE_POPUPS_MAX_SCORE = scoring.PERFORMANCE_POPUPS_ENABLED + scoring.PERFORMANCE_POPUPS_CUSTOM;
			PERFORMANCE_DRAW_TIME_MAX_SCORE = scoring.PERFORMANCE_MAX;
			PERFORMANCE_LAYER_COUNT_MAX_SCORE = scoring.PERFORMANCE_MAX;
			PERFORMANCE_MAX_SCORE = PERFORMANCE_SHARING_MAX_SCORE + PERFORMANCE_POPUPS_MAX_SCORE + PERFORMANCE_DRAW_TIME_MAX_SCORE + PERFORMANCE_LAYER_COUNT_MAX_SCORE;
			// User Profile
			USER_PROFILE_THUMBNAIL = scoring.USER_PROFILE_HAS_THUMBNAIL + scoring.USER_PROFILE_HAS_LARGE_THUMBNAIL;
			USER_PROFILE_FULLNAME = scoring.USER_PROFILE_HAS_FULLNAME_MIN_NUM_WORDS_SCORE + scoring.USER_PROFILE_FULLNAME_HAS_NO_UNDERSCORE_SCORE;
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
					{attribute:value, descending:false},
					{attribute:"title", descending:false}
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
					q:"owner:" + owner,
					num:1000
				};
			} else if (value === "Web Map") {
				params = {
					q:"owner:" + owner + ' Web Map -type:"web mapping application" -type:"Layer Package" (type:"Project Package" OR type:"Windows Mobile Package" OR type:"Map Package" OR type:"Basemap Package" OR type:"Mobile Basemap Package" OR type:"Mobile Map Package" OR type:"Pro Map" OR type:"Project Package" OR type:"Web Map" OR type:"CityEngine Web Scene" OR type:"Map Document" OR type:"Globe Document" OR type:"Scene Document" OR type:"Published Map" OR type:"Explorer Map" OR type:"ArcPad Package" OR type:"Map Template") -type:"Code Attachment" -type:"Featured Items" -type:"Symbol Set" -type:"Color Set" -type:"Windows Viewer Add In" -type:"Windows Viewer Configuration"  -type:"Code Attachment" -type:"Featured Items" -type:"Symbol Set" -type:"Color Set" -type:"Windows Viewer Add In" -type:"Windows Viewer Configuration"',
					num:1000
				};
			} else {
				params = {
					q:"owner:" + owner + " type: " + value,
					num:1000
				};
			}

			portal.queryItems(params).then(function (result) {
				itemStore.data = result.results;
				dgrid.refresh();
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

		function toggleCheckboxes(checkBoxID_values, attr, value) {
			// enable/disable living atlas checkboxes
			array.forEach((checkBoxID_values), function (id) {
				if (dijit.byId(id)) {
					dijit.byId(id).setAttribute(attr, value);
				}
			});
		}

		function fadeLoader() {
			var loaderNode = dom.byId("map-mask");
			domStyle.set(loaderNode, "opacity", "1");
			var fadeArgs = {
				node:"map-mask",
				duration:1000
			};
			fx.fadeOut(fadeArgs).play();
		}

		function searchBtnClickHandler(event) {
			var searchInputNode = query(".search-input-text-box")[0];
			var searchQueryParams = searchInputNode.value;
			var queryParams = {
				q:"title: " + searchQueryParams,
				num:100
			};

			portalUser.portal.queryItems(queryParams).then(lang.hitch(this, function (response) {
				var searchResults = response.results;
				itemStore.data = searchResults;
				dgrid.refresh();
			}));
		}
	});
});
