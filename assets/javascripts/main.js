require([
	"put-selector/put",
	"dojo/store/Memory",
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
	"dijit/form/ComboBox",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane",
	"dijit/layout/TabContainer",
	"dijit/ProgressBar",
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
	"dojo/number",
	"dojo/on",
	"dojo/query",
	"esri/arcgis/Portal",
	"esri/arcgis/OAuthInfo",
	"esri/IdentityManager",
	"esri/arcgis/utils",
	"esri/config",
	"esri/map",
	"esri/request",
	"dojo/parser",
	"dojo/ready",
	"dojo/NodeList-traverse"
], function (put, Memory, Pagination, OnDemandGrid, Keyboard, Selection, Dialog, Editor, LinkDialog, TextColor, ViewSource, FontChoice, Button, CheckBox, ComboBox, BorderContainer, ContentPane, TabContainer, ProgressBar, array, declare, fx, lang, aspect, date, Deferred, dom, domAttr, domClass, domConstruct, domStyle, number, on, query, arcgisPortal, ArcGISOAuthInfo, esriId, arcgisUtils, config, Map, esriRequest, parser, ready) {

	parser.parse();

	var map;
	var layers;
	//
	var dgrid;
	var itemStore;
	var thumbnailRenderCell;
	var titleRenderCell;
	var statusRenderCell;
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
	var SAVE_BUTTON_NAME = "btn-";
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
	// Messages
	var HEADER_BLOCK_PUBLIC = "Living Atlas of the World: Nominate an app, web map or layer";
	var HEADER_BLOCK_PRIVATE = "My Items";
	var INTRO_TEXT_1 = "ArcGIS includes a Living Atlas of the World with beautiful and " +
			"authoritative maps on hundreds of topics. It combines reference and thematic maps with many topics " +
			"relating to people, earth, and life.  Explore maps from Esri and thousands or organizations and " +
			"enrich them with your own data to create new maps and map layers.";
	var INTRO_TEXT_2 = "Select an item to prepare for nomination.";
	var MAXIMUM_CHAR = "A maximum of xxx characters are available";
	var SCORE_TEXT_1 = "Some practical characteristics of your item must be present in order to nominate it for the Living Atlas.  A score of at least 80 is required before the map can be nominated.";
	var SCORE_TEXT_2 = "Here is your item's current score. Click on the 'i' buttons for details on how to improve your score.";
	var CURRENT_SCORE_HEADER_TEXT = "Current Score";
	var OVERALL_TXT = "In the sections below, if the check box is green you have full-filled criteria,<br />" +
			"If the check box is red, please select that section and look for the items underlined to improve your score.";
	//
	var portalUrl;
	var portal;
	var portalUser;
	var owner;
	//
	var MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
	var CATEGORIES = ["basemapsCB", "lifestylesCB", "urbanSystemsCB", "historicalMapsCB", "imageryCB", "landscapeCB", "transportationCB", "storyMapsCB", "demographgicsCB", "earthObservationsCB", "boundariesAndPlacesCB"];
	// Tab Container Labels
	var DETAILS = "DETAILS";
	var USE_CREDITS = "USE/CREDITS";
	var TAGS = "TAGS";
	var PERFORMANCE = "PERFORMANCE";
	var MY_PROFILE = "MY PROFILE";

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
	var score = 0;

	ready(function () {

		run();

		thumbnailRenderCell = function (object, data, cell) {
			var thumbnailUrl = formatThumbnailUrl(object);
			var n = domConstruct.create("div", {
				innerHTML:'<div class="thumbnail"><img src="' + thumbnailUrl + '" />'
			});
			cell.appendChild(n);
		};

		titleRenderCell = function (object, data, cell) {
			console.log(object);
			var snippet = validateStr(object.snippet);
			var type = validateStr(object.type);
			var modifiedDate = formatDate(object.modified);
			var views = validateStr(object.numViews);
			var access = object.access;
			var n = domConstruct.create("div", {
				innerHTML:
						'<div class="container content-area">' +
						'	<div class="row">' +
						'		<div class="column-20">' +
						'			<div class="item-title">' + object.title + '</div>' +
						'			<span class="item-type">' + type + '</span> - <span class="item-access">Sharing:' + access + ' - Updated ' + modifiedDate + '</span>' +
						'			<div class="item-number-views">' + views + ' views</div>' +
						'		</div>' +
						'	</div>' +
						'</div>'
			});
			cell.appendChild(n);
		};

		statusRenderCell = function (object, data, cell) {
			var n = domConstruct.create("div", {
				innerHTML:
						'<div class="container content-area">' +
						'	<div class="row">' +
						'		<div class="column-5">' +
						'			<h4 class="icon-checked icon-blue"></h4>' +
						'		</div>' +
						'		<div class="column-5">' +
						'			<h4 class="icon-unchecked icon-blue"></h4>' +
						'		</div>' +
						'		<div class="column-5">' +
						'			<h4 class="icon-unchecked icon-blue"></h4>' +
						'		</div>' +
						'	</div>' +
						'</div>'
			});
			cell.appendChild(n);
		};

		detailsNodeClickHandler = function (selectedRowID, _categoryNodes, _nodeList, _titleID, _snippetID, _descID, _detailsNode) {
			destroyNodes(_categoryNodes);
			array.forEach(_nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4 details", "active column-4 details");
					detailsContentPane(selectedRowID, _titleID, _snippetID, _descID);
				}
			});
			domClass.replace(_detailsNode, "active column-4 credits", "column-4 credits");

			//overallScoreGraphic.update({
			//	progress: score
			//});
		//	dijit.byId("overall-score-graphic").update({
		//		'progress':score
		//	});
			//overallScoreGraphic.set("value", score);
		};

		creditsNodeClickHandler = function (selectedRowID, _categoryNodes, _nodeList, _item, _accessID, _creditID, _creditsNode) {
			destroyNodes(_categoryNodes);
			array.forEach(_nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4 details", "active column-4 details");
					useCreditsContentPane(selectedRowID, _accessID, _creditID);
				}
			});
			domClass.replace(_creditsNode, "active column-4 credits", "column-4 credits");
		};

		tagsNodeClickHandler = function (_selectedRowID, _categoryNodes, _nodeList, _categoryID, _tagsID, _tagsNode) {
			destroyNodes(categoryNodes);
			categoryNodes = [];
			array.forEach(CATEGORIES, function (category) {
				categoryNodes.push(category + previousSelectedRowID);
			});

			array.forEach(_nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4 details", "active column-4 details");
					tagsContentPane(_selectedRowID, _categoryID, _tagsID);
				}
			});
			domClass.replace(_tagsNode, "active column-4 credits", "column-4 credits");
		};

		performanceNodeClickHandler = function (_categoryNodes, _nodeList, _item, _popUps, _mapDrawTime, _layers, _performanceNode) {
			destroyNodes(_categoryNodes);
			array.forEach(nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4 details", "active column-4 details");
					performanceContentPane(_item, _popUps, _mapDrawTime, _layers);
				}
			});
			domClass.replace(_performanceNode, "active column-4 credits", "column-4 credits");
		};

		profileNodeClickHandler = function (_selectedRowID, _categoryNodes, _nodeList, _userNameID, _userDescriptionID, _profileNode) {
			destroyNodes(_categoryNodes);
			array.forEach(_nodeList, function (node) {
				if (domClass.contains(node, "active")) {
					domClass.replace(node, "column-4 details", "active column-4 details");
					loadProfileContentPane(_selectedRowID, _userNameID, _userDescriptionID);
				}
			});
			domClass.replace(_profileNode, "active column-4 credits", "column-4 credits");
		};

		function run() {
			// sign in node
			signInNode = query(".intro")[0];
			// homepage header message
			signInNode.innerHTML = INTRO_TEXT_1;
			// ribbon header
			ribbonHeaderTitle = query(".ribbon-header-title")[0];
			ribbonHeaderUser = query(".ribbon-header-user")[0];
			ribbonHeaderNumItemsNode = dom.byId("ribbon-header-num-items");
			ribbonHeaderTitle.innerHTML = HEADER_BLOCK_PUBLIC;

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
		}

		function signIn() {
			portal.signIn().then(function (user) {
				// update the header row
				updateHeader();

				portalUser = portal.getPortalUser();
				owner = portalUser.username;

				var params = {
					q:"owner:" + owner,
					num:1000
				};
				portal.queryItems(params).then(function (result) {
					// total nuber of items
					var numItems = result.total;
					// update the ribbon header
					// remove the globe icon from the ribbon header title
					domAttr.set(query(".ribbon-header-title").parent()[0], "class", "");
					var HEADER_BLOCK_PRIVATE_NAME = " (" + portalUser.fullName + " - " + owner + ")"
					ribbonHeaderTitle.innerHTML = HEADER_BLOCK_PRIVATE;
					ribbonHeaderUser.innerHTML = HEADER_BLOCK_PRIVATE_NAME;
					// update the text and icon
					ribbonHeaderNumItemsNode.innerHTML = " " + numItems + " Items";
					domAttr.set(ribbonHeaderNumItemsNode, "class", "icon-stack");

					if (numItems > 0) {
						// dgrid columns
						var dgridColumns = [
							{
								label:"",
								field:"thumbnailUrl",
								renderCell:thumbnailRenderCell
							},
							{
								label:"TITLE",
								field:"title",
								renderCell:titleRenderCell
							},
							{
								label:"STATUS",
								field:"status",
								renderCell:statusRenderCell
							}
						];
						// dgrid memory store
						itemStore = new Memory({
							data:result.results
						});
						// dgrid
						dgrid = new (declare([OnDemandGrid, Pagination]))({
							store:itemStore,
							rowsPerPage:6,
							pagingLinks:true,
							pagingTextBox:false,
							firstLastArrows:true,
							columns:dgridColumns,
							showHeader:false
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
								array.forEach(CATEGORIES, function (category) {
									categoryNodes.push(category + previousSelectedRowID);
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
								var btnID = SAVE_BUTTON_NAME + selectedRowID;
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
											"<div id='" + rowID + "' style='width: " + selectedNodeWidth + "px;'>" +
											"	<div class='content-container'>" +
											"		<div class='row'>" +
											"			<div class='column-2' style='color: white'>spacer</div>" +
											"			<div class='column-20 content-section'>" +
											"				<div id='map'></div>" +
											"			</div>" +
											"		</div>" +

											"		<div class='row'>" +
											"			<div class='column-2' style='color: white'>spacer</div>" +
											"			<div class='column-14 content-section'>" +
											"				<div class='row'>" +
											"					<div class='current-score-header'>" + CURRENT_SCORE_HEADER_TEXT + "</div>" +
											"					<span class='current-score-graphic-container'></span>" +
											"				</div>" +
											"			</div>" +
											"			<div class='column-2'>" +
											"				<div class='row'>" +
											"					<div class='score-spacer'>spacer</div>" +
											"					<div class='current-score-number' style='color: red;'>78</div>" +
											"				</div>" +
											"			</div>" +
											"			<div class='column-4'>" +
											"				<button id='nominate-btn' class='btn red right'> NOMINATE </button>" +
											"			</div>" +
											"		</div>" +

											"		<div class='row'>" +
											"			<div class='column-2' style='color: white'>spacer</div>" +
											"			<div class='column-20 content-section'>" +
											"				<div class='expanded-item-text'>" + OVERALL_TXT + "</div>" +
											"			</div>" +
											"		</div>" +

											"		<div class='row'>" +
											"			<div class='column-2' style='color: white'>spacer</div>" +
											"			<div class='column-20 content-section'>" +
											"				<div id='" + tcID + "'></div>" +
											"			</div>" +
											"		</div>" +
											"	</div>" +
											"</div>" +
											"<div id='" + btnID + "'></div>",
											selectedRow.firstElementChild, "last");

									progressBarAnchorNode = query(".current-score-graphic-container")[0];

									createContentButtonGroup(tcID);

									// initialize content area with details data
									destroyNodes(categoryNodes);
									array.forEach(nodeList, function (node) {
										if (domClass.contains(node, "active")) {
											domClass.replace(node, "column-4 details", "active column-4 details");
											detailsContentPane(selectedRowID, titleID, snippetID, descID);
										}
									});
									domClass.replace(detailsNode, "active column-4 credits", "column-4 credits");

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
												var popUps = processPopupData(map);
												on(performanceNode, "click", lang.partial(performanceNodeClickHandler, categoryNodes, nodeList, item, popUps, mapDrawTime, layers, performanceNode));
											}
										});
									} else {
										// hide the map div
										domStyle.set("map", "display", "none");
										on(performanceNode, "click", lang.partial(performanceNodeClickHandler, categoryNodes, nodeList, item, "", "", layers, performanceNode));
									}
									on(detailsNode, "click", lang.partial(detailsNodeClickHandler, selectedRowID, categoryNodes, nodeList, titleID, snippetID, descID, detailsNode));
									on(creditsNode, "click", lang.partial(creditsNodeClickHandler, selectedRowID, categoryNodes, nodeList, item, accessID, creditID, creditsNode));
									on(tagsNode, "click", lang.partial(tagsNodeClickHandler, selectedRowID, categoryNodes, nodeList, categoryID, tagsID, tagsNode));
									on(profileNode, "click", lang.partial(profileNodeClickHandler, selectedRowID, categoryNodes, nodeList, userNameID, userDescriptionID, profileNode));

									// overall score graphic
									overallScoreGraphic = new ProgressBar({
										id:"overall-score-graphic",
										style: {
											"width" : "100%",
											"height": "5px"
										},
										value:score
									}).placeAt(progressBarAnchorNode).startup();
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
				// item summary
				var itemSummary = validateStr(item.snippet);
				// item description
				var itemDescription = validateStr(item.description);
				// thumbnail url
				var thumbnailUrl = formatThumbnailUrl(item);

				domConstruct.destroy("section-content");
				domConstruct.destroy("save-row");

				var node = query(".content-container")[0];
				domConstruct.place(
								'<div id="section-content">' +
								'	<div class="row section-content">' +
								'		<div class="column-2">' +
								'			<div class="row">' +
								'				<div class="column-12 score-graphic-text">' +
								'					<div class="score-graphic"> 4/5</div>' +
								'				</div>' +
								'				<div class="column-12">' +
								'					<div class="tooltip header-tooltip animate">' +
								'						<span class="icon-help icon-blue"></span>' +
								'						<div class="tooltip-wrapper">' +
								'							<p class="tooltip-content tooltip-content-text">Full points for using a custom thumbnail that you create and upload in the required dimensions (200 x 133 pixels).</p>' +
								'						</div>' +
								'					</div>' +
								'				</div>' +
								'			</div>' +
								'		</div>' +

								'		<div class="column-20 content-section">' +
								'			<div class="section-header">Thumbnail</div>' +
								'			<img class="expanded-item-thumbnail" src="' + thumbnailUrl + '">' +
								'		</div>' +
								'	</div>' +

								'	<div class="row section-content">' +
								'		<div class="column-2">' +
								'			<div class="row">' +
								'				<div class="column-12 score-graphic-text">' +
								'					<div class="score-graphic"> 4/5</div>' +
								'				</div>' +
								'				<div class="column-12">' +
								'					<div class="tooltip header-tooltip animate">' +
								'						<span class="icon-help icon-blue"></span>' +
								'						<div class="tooltip-wrapper">' +
								'							<p class="tooltip-content tooltip-content-text">Full points for using a custom thumbnail that you create and upload in the required dimensions (200 x 133 pixels).</p>' +
								'						</div>' +
								'					</div>' +
								'				</div>' +
								'			</div>' +
								'		</div>' +

								'		<div class="column-12 content-section">' +
								'			<div class="section-header">Title</div>' +
								'			<input type="text" name="title-textbox" value="' + itemTitle + '" data-dojo-type="dijit/form/TextBox" id="' + titleID + '" />' +
								'		</div>' +
								'	</div>' +

								'	<div class="row section-content">' +
								'		<div class="column-2">' +
								'			<div class="row">' +
								'				<div class="column-12 score-graphic-text">' +
								'					<div class="score-graphic"> 4/5</div>' +
								'				</div>' +
								'				<div class="column-12">' +
								'					<div class="tooltip header-tooltip">' +
								'						<span class="icon-help icon-blue"></span>' +
								'						<div class="tooltip-wrapper">' +
								'							<p class="tooltip-content tooltip-content-text">Full points for using a custom thumbnail that you create and upload in the required dimensions (200 x 133 pixels).</p>' +
								'						</div>' +
								'					</div>' +
								'				</div>' +
								'			</div>' +
								'		</div>' +

								'		<div class="column-20 content-section">' +
								'			<div class="section-header">Summary</div>' +
								'			<input type="text" name="title-textbox" value="' + itemSummary + '" data-dojo-type="dijit/form/TextBox" id="' + snippetID + '" />' +
								'		</div>' +
								'	</div>' +

								'	<div class="row section-content">' +
								'		<div class="column-2">' +
								'			<div class="row">' +
								'				<div class="column-12 score-graphic-text">' +
								'					<div class="score-graphic"> 4/5</div>' +
								'				</div>' +
								'				<div class="column-12">' +
								'					<div class="tooltip header-tooltip animate">' +
								'						<span class="icon-help icon-blue"></span>' +
								'						<div class="tooltip-wrapper">' +
								'							<p class="tooltip-content tooltip-content-text">Full points for using a custom thumbnail that you create and upload in the required dimensions (200 x 133 pixels).</p>' +
								'						</div>' +
								'					</div>' +
								'				</div>' +
								'			</div>' +
								'		</div>' +

								'		<div class="column-20 content-section">' +
								'			<div class="section-header">Description</div>' +
								'			<div id="' + descID + '" data-dojo-type="dijit/Editor" name="editorContent">' + itemDescription + '</div>' +
								'		</div>' +
								'	</div>' +
								'</div>',
						node, "last");

						/*'<div id="section-content">' +
						'	<div class="row">' +
						'		<div class="column-4">' +
						'			<div class="section-header">Thumbnail' +
						'				<div class="tooltip header-tooltip animate">' +
						'					<span class="icon-help icon-blue"></span>' +
						'					<div class="tooltip-wrapper">' +
						'						<p class="tooltip-content tooltip-content-text">Full points for using a custom thumbnail that you create and upload in the required dimensions (200 x 133 pixels).</p>' +
						'					</div>' +
						'				</div>' +
						'			</div>' +
						'			<img class="expanded-item-thumbnail" src="' + thumbnailUrl + '">' +
						'		</div>' +
						'		<div class="column-20">' +
						'			<div class="row">' +
						'				<div class="column-24">' +
						'					<div class="section-header">Title' +
						'						<div class="tooltip header-tooltip animate before">' +
						'							<span class="icon-help icon-blue"></span>' +
						'							<div class="tooltip-wrapper">' +
						'								<p class="tooltip-content">A title should be short, simple, clear. Three words is ideal. Avoid acronyms, ALL CAPS, underscores, \“copy\”, \“test\”, \“demo\”, \“eval\” in the title. Answers the basic question \“What is this?\"</p>' +
						'							</div>' +
						'						</div>' +
						'					</div>' +
						'					<div class="section-content">' +
						'						<input type="text" name="title-textbox" value="' + itemTitle + '" data-dojo-type="dijit/form/TextBox" id="' + titleID + '" />' +
						'					</div>' +
						'				</div>' +
						'				<div class="column-24">' +
						'					<div class="section-header">Summary' +
						'						<div class="tooltip header-tooltip animate before">' +
						'							<span class="icon-help icon-blue"></span>' +
						'							<div class="tooltip-wrapper">' +
						'								<p class="tooltip-content">A good summary briefly explains what this map is, in 1-2 sentences, about 10 words per sentence. Avoid acronyms, ALL CAPS, underscores, \“copy\”, \“test\”, \“demo\”, \“eval\” in the summary. Answers the basic question \“What does this show?\"</p>' +
						'							</div>' +
						'						</div>' +
						'					</div>' +
						'					<div class="section-content">' +
						'						<input type="text" name="title-textbox" value="' + itemSummary + '" data-dojo-type="dijit/form/TextBox" id="' + snippetID + '" />' +
						'					</div>' +
						'				</div>' +
						'				<div class="column-24">' +
						'					<div class="section-header">Description' +
						'						<div class="tooltip header-tooltip animate before">' +
						'							<span class="icon-help icon-blue"></span>' +
						'							<div class="tooltip-wrapper">' +
						'								<p class="tooltip-content">A good description further clarifies what this item is and what it shows. It explains more about the data and its sources, but does not go into pages of explanation. Scoring is primarily based on length of content. About 2-3 paragraphs is ideal, with 4-5 sentences per paragraph, and about 12 or so words per sentence. Bonus points if hyperlinks whisk the reader away to more fully developed explanations and other supporting material.</p>' +
						'							</div>' +
						'						</div>' +
						'					</div>' +
						'					<div class="section-content">' +
						'						<div id="' + descID + '" data-dojo-type="dijit/Editor" name="editorContent">' + itemDescription + '</div>' +
						'					</div>' +
						'				</div>' +
						'			</div>' +
						'		</div>' +
						'	</div>' +
						'</div>',
						node, "last");*/


				var myDialog = new Dialog({
					id:"update-thumbnail-dialog",
					title:"Upload Thumbnail",
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
				myDialog.hide();
				on(query(".expanded-item-thumbnail"), "click", function(event) {
					myDialog.show();
				});

				on(query(".cancel-thumbnail-dialog-btn")[0], "click", function (event) {
					myDialog.hide();
				});

				on(query(".ok-thumbnail-dialog-btn")[0], "click", function (event) {
					//
				});

				on(dom.byId("thumbnail-file-updload-btn"), "change", function () {
					portalUser.getItem(selectedRowID).then(function (results) {
						var _userItemUrl = results.userItemUrl;
						console.log(_userItemUrl);
						// http://www.arcgis.com/sharing/rest/content/users/cmahlke_jsapi/items/d34ed6019b2348768002221c8ac9c312
						// http://jsapi.maps.arcgis.com/sharing/rest/content/users/cmahlke_jsapi/items/d34ed6019b2348768002221c8ac9c312/update
						esriRequest({
							url:_userItemUrl + "/update",
							content:{
								f:"json",
								filename:"Opera-thumbnail.jpg",
								multipart:true
							}
						}, {
							usePost:true
						}).then(function (response) {
							if (response.success) {
								console.log("SUCCESS");
								myDialog.hide();
							} else {
								console.log("FAILURE");
							}
						});
					});
				});

				// create the SAVE/CANCEL buttons
				createSaveButtonNode(node);

				descriptionEditor = new Editor({
					id:"description-editor",
					height:"30px",
					plugins:[
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
						'viewSource'/*,
						'fontName',
						'fontSize'*/
					]
				}, dom.byId(descID));
				descriptionEditor.startup();

				var saveBtn = dom.byId("save-btn");
				on(saveBtn, "click", function () {
					var alertAnchorNode = query(".section-content")[0];
					domConstruct.place(
							'<div class="loader alert-loader save-btn">' +
							'	<span class="side side-left">' +
							'		<span class="fill"></span>' +
							'	</span>' +
							'	<span class="side side-right">' +
							'		<span class="fill"></span>' +
							'	</span>' +
							'	<p class="loading-word">Loading...</p>' +
							'</div>', alertAnchorNode, "last");
					// DETAILS
					// http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#/Item/02r30000007w000000/
					// The title of the item. This is the name that's displayed to users and by
					// which they refer to the item. Every item must have a title.
					var _title = dom.byId(TAB_CONTAINER_TITLE + selectedRowID).value;
					// A short summary description of the item.
					var _snippet = dom.byId(TAB_CONTAINER_SNIPPET + selectedRowID).value;
					// Item description.
					var _description = dijit.byId(TAB_CONTAINER_DESC + selectedRowID).value;

					portalUser.getItem(selectedRowID).then(function (results) {
						var _userItemUrl = results.userItemUrl;
						esriRequest({
							url:_userItemUrl + "/update",
							content:{
								f:"json",
								title:_title,
								snippet:_snippet,
								description:_description
							}
						}, {
							usePost:true
						}).then(function (response) {
									domConstruct.destroy(query(".alert-loader")[0]);

									if (response.success) {
										domConstruct.place(
												'<div class="row alert-success alert-loader-success">' +
												'	<div class="column-24 center">' +
												'		<div class="alert success icon-check"> Saved </div>' +
												'	</div>' +
												'</div>', alertAnchorNode, "last");
										setTimeout(function () {
											domConstruct.destroy(query(".alert-success")[0]);
										}, 1500);
									} else {
										domConstruct.place(
												'<div class="row alert-loader-error">' +
												'	<div class="column-24 center">' +
												'		<div class="alert error icon-alert"> Error </div>' +
												'	</div>' +
												'</div>', alertAnchorNode, "last");
									}
								});
					});
				});
			});
		}

		function useCreditsContentPane(selectedRowID, accessID, creditID) {
			portalUser.getItem(selectedRowID).then(function (item) {
				// license information
				var licenseInfo = validateStr(item.licenseInfo);
				// credit
				var credit = validateStr(item.accessInformation);

				domConstruct.destroy("section-content");
				domConstruct.destroy("save-row");

				var node = query(".content-container")[0];
				domConstruct.place(
						'<div id="section-content">' +
								'	<div class="row">' +
								'		<div class="column-24">' +
								'			<div class="section-header">ACCESS AND USE CONSTRAINTS' +
								'				<div class="tooltip header-tooltip animate">' +
								'					<span class="icon-help icon-blue"></span>' +
								'					<div class="tooltip-wrapper">' +
								'						<p class="tooltip-content">Text to appear in the tooltip.</p>' +
								'					</div>' +
								'				</div>' +
								'			</div>' +
								'			<div class="section-content">' +
								'				<div id="' + accessID + '" data-dojo-type="dijit/Editor" name="editorContent" rows="3">' + licenseInfo + '</div>' +
								'			</div>' +
								'		</div>' +
								'		<div class="column-24">' +
								'			<div class="section-header">CREDITS' +
								'				<div class="tooltip header-tooltip animate">' +
								'					<span class="icon-help icon-blue"></span>' +
								'					<div class="tooltip-wrapper">' +
								'						<p class="tooltip-content">Text to appear in the tooltip.</p>' +
								'					</div>' +
								'				</div>' +
								'			</div>' +
								'			<div class="section-content">' +
								'				<textarea id="' + creditID + '" rows="2" style="width:95%;">' + credit + '</textarea>',
						node, "last");

				// create the SAVE/CANCEL buttons
				createSaveButtonNode(node);

				accessUseConstraintsEditor = new Editor({
					id: "access-constraints-editor",
					height:"50px",
					plugins:[
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
						'viewSource'/*,
						'fontName',
						'fontSize'*/
					]
				}, dom.byId(accessID));
				accessUseConstraintsEditor.startup();

				var saveBtn = dom.byId("save-btn");
				on(saveBtn, "click", function () {
					var alertAnchorNode = query(".section-content")[0];
					domConstruct.place(
							'<div class="loader alert-loader save-btn">' +
									'	<span class="side side-left">' +
									'		<span class="fill"></span>' +
									'	</span>' +
									'	<span class="side side-right">' +
									'		<span class="fill"></span>' +
									'	</span>' +
									'	<p class="loading-word">Loading...</p>' +
									'</div>', alertAnchorNode, "last");

					var _license = dom.byId(TAB_CONTAINER_LICENSE + selectedRowID).value;
					var _credits = dom.byId(TAB_CONTAINER_CREDITS + selectedRowID).value;

					portalUser.getItem(selectedRowID).then(function (results) {
						var _userItemUrl = results.userItemUrl;
						esriRequest({
							url:_userItemUrl + "/update",
							content:{
								f:"json",
								licenseInfo:_license,
								accessInformation:_credits
							}
						}, {
							usePost:true
						}).then(function (response) {
									domConstruct.destroy(query(".alert-loader")[0]);

									if (response.success) {
										domConstruct.place(
												'<div class="row alert-success alert-loader-success">' +
														'	<div class="column-24 center">' +
														'		<div class="alert success icon-check"> Saved </div>' +
														'	</div>' +
														'</div>', alertAnchorNode, "last");
										setTimeout(function () {
											domConstruct.destroy(query(".alert-success")[0]);
										}, 1500);
									} else {
										domConstruct.place(
												'<div class="row alert-loader-error">' +
														'	<div class="column-24 center">' +
														'		<div class="alert error icon-alert"> Error </div>' +
														'	</div>' +
														'</div>', alertAnchorNode, "last");
									}
								});
					});
				});
			});
		}

		function tagsContentPane(_selectedRowID, categoryID, tagsID) {
			portalUser.getItem(_selectedRowID).then(function (item) {
				// existing tags
				var itemTags = item.tags;

				domConstruct.destroy("section-content");
				domConstruct.destroy("save-row");

				var node = query(".content-container")[0];
				domConstruct.place(
						"<div id='section-content'>" +
								"	<div class='row'>" +
								"		<div class='column-24'>" +
								"			<div class='section-header'>Select at least one of the following categories" +
								"				<div class='tooltip header-tooltip animate'>" +
								"					<span class='icon-help icon-blue'></span>" +
								"					<div class='tooltip-wrapper'>" +
								"						<p class='tooltip-content'>Text to appear in the tooltip.</p>" +
								"					</div>" +
								"				</div>" +
								"			</div>" +
								"			<div class='row'>" +
								"				<div class='column-6'><input id='basemapsCB" + selectedRowID + "' /> Basemaps</div>" +
								"				<div class='column-6'><input id='lifestylesCB" + selectedRowID + "' /> Lifestyles</div>" +
								"				<div class='column-6'><input id='urbanSystemsCB" + selectedRowID + "' /> Urban Systems</div>" +
								"				<div class='column-6'><input id='historicalMapsCB" + selectedRowID + "' /> Historical Maps</div>" +
								"			</div>" +
								"			<div class='row'>" +
								"				<div class='column-6'><input id='imageryCB" + selectedRowID + "' /> Imagery</div>" +
								"				<div class='column-6'><input id='landscapeCB" + selectedRowID + "' /> Landscape</div>" +
								"				<div class='column-6'><input id='transportationCB" + selectedRowID + "' /> Transportation</div>" +
								"				<div class='column-6'><input id='storyMapsCB" + selectedRowID + "' /> Story Maps</div>" +
								"			</div>" +
								"			<div class='row'>" +
								"				<div class='column-6'><input id='demographgicsCB" + selectedRowID + "' /> Demographics</div>" +
								"				<div class='column-6'><input id='earthObservationsCB" + selectedRowID + "' /> Earth Observations</div>" +
								"				<div class='column-6'><input id='boundariesAndPlacesCB" + selectedRowID + "' /> Boundaries and Places</div>" +
								"			</div>" +
								"		</div>" +
								"	</div>" +
								"</div>" +
								"<div class='row'>" +
								"	<div class='column-24'>" +
								"		<div class='section-header additional-tags'>Add additional tags" +
								"			<div class='row'>" +
								"				<textarea id='" + tagsID + "' data-dojo-type='dijit/form/SimpleTextarea' rows='5' cols='50' style='width:95%;'>" + itemTags,
						node, "last");

				array.forEach(CATEGORIES, function (id) {
					addCheckbox(id + selectedRowID);
				});

				// create the SAVE/CANCEL buttons
				createSaveButtonNode(node);

			});
			// TAGS CONTAINER
			/*var tagsContainer = new BorderContainer({
			 title:tabTitle,
			 selected:false
			 });*/
			//var topPane = addContentPane("top", "tab-container-top-pane", "<div class='selected-tab-ribbon'>" + TAGS + "</div>");
			//tagsContainer.addChild(topPane);
			/*topPane.addChild(new ContentPane({
			 region:"center",
			 className:"tab-container-description-pane",
			 content:"<div class='section-header'>Select at least one of the following categories<img class='info-icon' src='" + INFO_ICON_URL +"'><\/div>" +
			 "<div class='section-content'>" +
			 "<table style='width: 100%;'>" +
			 "<tr>" +
			 "<td><input id='basemapsCB" + selectedRowID + "' /><label for='checkBox'>Basemaps</label></td>" +
			 "<td><input id='lifestylesCB" + selectedRowID + "' /><label for='checkBox'>Lifestyles</label></td>" +
			 "<td><input id='urbanSystemsCB" + selectedRowID + "' /><label for='checkBox'>Urban Systems</label></td>" +
			 "<td><input id='historicalMapsCB" + selectedRowID + "' /><label for='checkBox'>Historical Maps</label></td>" +
			 "</tr>" +
			 "<tr>" +
			 "<td><input id='imageryCB" + selectedRowID + "' /><label for='checkBox'>Imagery</label></td>" +
			 "<td><input id='landscapeCB" + selectedRowID + "' /><label for='checkBox'>Landscape</label></td>" +
			 "<td><input id='transportationCB" + selectedRowID + "' /><label for='checkBox'>Transportation</label></td>" +
			 "<td><input id='storyMapsCB" + selectedRowID + "' /><label for='checkBox'>Story Maps</label></td>" +
			 "</tr>" +
			 "<tr>" +
			 "<td><input id='demographgicsCB" + selectedRowID + "' /><label for='checkBox'>Demographics</label></td>" +
			 "<td><input id='earthObservationsCB" + selectedRowID + "' /><label for='checkBox'>Earth Observations</label></td>" +
			 "<td><input id='boundariesAndPlacesCB" + selectedRowID + "' /><label for='checkBox'>Boundaries and Places</label></td>" +
			 "</tr>" +
			 "</table>" +
			 "<\/div>" +
			 "<\/div>"
			 }));
			 topPane.addChild(new ContentPane({
			 region:"center",
			 className:"tab-container-description-pane",
			 content:"<div class='section-header'>Add additional tags" +
			 "<\/div>" +
			 "<div class='section-content'>" +
			 "<textarea id='" + tagsID + "' data-dojo-type='dijit/form/SimpleTextarea' rows='5' cols='50' style='width:95%;'>" + itemTags
			 }));
			 tagsContainer.startup();
			 tabContainer.addChild(tagsContainer);*/
		}

		function performanceContentPane(item, popUps, mapDrawTime, layers) {
			domConstruct.destroy("section-content");
			domConstruct.destroy("save-row");

			var node = query(".content-container")[0];
			domConstruct.place(
					"<div id='section-content'>" +
							"	<div class='row'>" +
							"		<div class='column-8'>" +
							"			<div class='section-header'>SHARING " +
							"				<div class='tooltip header-tooltip animate'>" +
							"					<span class='icon-help icon-blue'></span>" +
							"					<div class='tooltip-wrapper'>" +
							"						<p class='tooltip-content'>Text to appear in the tooltip.</p>" +
							"					</div>" +
							"				</div>" +
							"			</div>" +
							"			<div class='performance-content'>" + processSharing(item) + "</div>" +
							"		</div>" +
							"		<div class='column-8'>" +
							"			<div class='section-header'>MAP DRAW TIME " +
							"				<div class='tooltip header-tooltip animate'>" +
							"					<span class='icon-help icon-blue'></span>" +
							"					<div class='tooltip-wrapper'>" +
							"						<p class='tooltip-content'>Text to appear in the tooltip.</p>" +
							"					</div>" +
							"				</div>" +
							"			</div>" +
							"			<div class='performance-content'>" + processMapDrawTime(mapDrawTime) + "</div>" +
							"		</div>" +
							"		<div class='column-8'>" +
							"			<div class='section-header'>LAYER COUNT " +
							"				<div class='tooltip header-tooltip animate'>" +
							"					<span class='icon-help icon-blue'></span>" +
							"					<div class='tooltip-wrapper'>" +
							"						<p class='tooltip-content'>Text to appear in the tooltip.</p>" +
							"					</div>" +
							"				</div>" +
							"			</div>" +
							"			<div class='performance-content'>" +
							"				<div id='layers-list'></div>" +
							"			</div>" +
							"		</div>" +
							"	</div>" +
							"	<div class='row'>" +
							"		<div class='column-8'>" +
							"			<div class='section-header'>POP UPS " +
							"				<div class='tooltip header-tooltip animate'>" +
							"					<span class='icon-help icon-blue'></span>" +
							"					<div class='tooltip-wrapper'>" +
							"						<p class='tooltip-content'>Text to appear in the tooltip.</p>" +
							"					</div>" +
							"				</div>" +
							"			</div>" +
							"			<div class='performance-content'>" + popUps + "</div>" +
							"		</div>" +
							"	</div>" +
							"</div>",
					node, "last");

			if (layers !== undefined && layers.length < 1) {
				domConstruct.create("div", {
					innerHTML:"No available layers",
					style:{
						"margin-left":"5px",
						"paddingLeft":"0px"
					}
				}, "layers-list", "first");
			} else {
				var ul = domConstruct.create("ul", {
					style:{
						"margin-left":"5px",
						"paddingLeft":"0px"
					}
				}, "layers-list", "first");
				array.forEach(layers, function (layer) {
					domConstruct.create("li", {
						innerHTML:layer.title,
						style:{
							"list-style-type":"none"
						}
					}, ul);
				});
			}
		}

		function loadProfileContentPane(selectedRowID, _userNameID, _userDescriptionID) {
			portalUser.getItem(selectedRowID).then(function (item) {
				console.log(item.portal.getPortalUser());
				var _userThumbnailUrl = item.portal.getPortalUser().thumbnailUrl;
				var _userFullName = validateStr(item.portal.getPortalUser().fullName);
				var _userDescription = validateStr(item.portal.getPortalUser().description);

				domConstruct.destroy("section-content");
				domConstruct.destroy("save-row");

				var node = query(".content-container")[0];
				domConstruct.place(
						'<div id="section-content">' +
								'	<div class="row">' +
								'		<div class="column-4">' +
								'			<div class="section-header">THUMBNAIL' +
								'				<div class="tooltip header-tooltip animate">' +
								'					<span class="icon-help icon-blue"></span>' +
								'					<div class="tooltip-wrapper">' +
								'						<p class="tooltip-content">Text to appear in the tooltip.</p>' +
								'					</div>' +
								'				</div>' +
								'				<img src="' + _userThumbnailUrl + '" height="85px">' +
								'			</div>' +
								'		</div>' +
								'		<div class="column-20">' +
								'			<div class="row">' +
								'				<div class="column-24">' +
								'					<div class="section-header">NAME ' +
								'						<div class="tooltip header-tooltip animate">' +
								'							<span class="icon-help icon-blue"></span>' +
								'							<div class="tooltip-wrapper">' +
								'								<p class="tooltip-content">Text to appear in the tooltip.</p>' +
								'							</div>' +
								'						</div>' +
								'					</div>' +
								'					<div class="section-content">' +
								'						<input type="text" name="title-textbox" value="' + _userFullName + '" data-dojo-type="dijit/form/TextBox" id="' + _userNameID + '" />' +
								'					</div>' +
								'				</div>' +
								'			</div>' +
								'			<div class="row">' +
								'				<div class="column-24">' +
								'					<div class="section-header">DESCRIPTION ' +
								'						<div class="tooltip header-tooltip animate">' +
								'							<span class="icon-help icon-blue"></span>' +
								'							<div class="tooltip-wrapper">' +
								'								<p class="tooltip-content">Text to appear in the tooltip.</p>' +
								'							</div>' +
								'						</div>' +
								'					</div>' +
								'					<div class="section-content">' +
								'						<textarea id="' + _userDescriptionID + '" rows="4" cols="50" style="width:66%;">' + _userDescription,
						node, "last");

				// create the SAVE/CANCEL buttons
				createSaveButtonNode(node);

				var saveBtn = dom.byId("save-btn");
				on(saveBtn, "click", function () {
					var alertAnchorNode = query(".section-content")[0];
					domConstruct.place(
							'<div class="loader alert-loader save-btn">' +
									'	<span class="side side-left">' +
									'		<span class="fill"></span>' +
									'	</span>' +
									'	<span class="side side-right">' +
									'		<span class="fill"></span>' +
									'	</span>' +
									'	<p class="loading-word">Loading...</p>' +
									'</div>', alertAnchorNode, "last");
					var _userFullName = dom.byId(_userNameID).value;
					var _userDescription = dom.byId(_userDescriptionID).value;

					portalUser.getItem(selectedRowID).then(function (results) {
						console.log("_userDescription: " + _userDescription);
						//var _portalUrl = results.portal.portalUrl;
						//var _community = "community/users/";
						//var _portalUser = results.owner;
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
									domConstruct.destroy(query(".alert-loader")[0]);
									if (response.success) {
										domConstruct.place(
												'<div class="row alert-success alert-loader-success">' +
														'	<div class="column-24 center">' +
														'		<div class="alert success icon-check"> Saved </div>' +
														'	</div>' +
														'</div>', alertAnchorNode, "last");
										setTimeout(function () {
											domConstruct.destroy(query(".alert-success")[0]);
										}, 1500);
									} else {
										domConstruct.place(
												'<div class="row alert-loader-error">' +
														'	<div class="column-24 center">' +
														'		<div class="alert error icon-alert"> Error </div>' +
														'	</div>' +
														'</div>', alertAnchorNode, "last");
									}
								});
					});
				});
			});
		}


		function createSaveButtonNode(_node) {
			domConstruct.place(
					'<div id="save-row" class="row">' +
					'	<div class="column-8 center">' +
					'		<button id="save-btn" class="btn small"> SAVE </button>' +
					'		<button id="cancel-btn" class="btn small"> CANCEL </button>' +
					'	</div>' +
					'</div>', _node, "last");
		}

		function applySort(value) {
			if (value === "title") {
				dgrid.set("sort", value, false);
			} else if (value === "type") {
				dgrid.set("sort", value, false);
				dgrid.set('sort', [
					{ attribute: value, descending:false },
					{ attribute: "title", descending:false }
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

		function destroyNodes(categoryNodes) {
			if (dijit.byId("description-editor")) {
				dijit.byId("description-editor").destroy();
			}

			if (dijit.byId("update-thumbnail-dialog")) {
				dijit.byId("update-thumbnail-dialog").destroy();
			}

			if (dijit.byId("overall-score-graphic")) {
				dijit.byId("overall-score-graphic").destroy();
			}
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

		function updateNodeHeight(node, height) {
			domStyle.set(node, "height", height + "px");
		}

		function createContentButtonGroup(id) {
			domConstruct.place(
					'<div class="row btn-group-container">' +
					'	<div class="btn-group column-24">' +
					'		<a class="active column-4 details icon-edit"> ' + DETAILS + '</a>' +
					'		<a class="column-4 credits icon-edit"> ' + USE_CREDITS + '</a>' +
					'		<a class="column-4 tags icon-edit"> ' + TAGS + '</a>' +
					'		<a class="column-4 performance icon-edit"> ' + PERFORMANCE + '</a>' +
					'		<a class="column-4 profile icon-edit"> ' + MY_PROFILE + '</a>' +
					'	</div>' +
					'</div>', id, "last");

			detailsNode = query(".details")[0];
			creditsNode = query(".credits")[0];
			tagsNode = query(".tags")[0];
			performanceNode = query(".performance")[0];
			profileNode = query(".profile")[0];
			nodeList = [detailsNode, creditsNode, tagsNode, performanceNode, profileNode];
		}

		function addCheckbox(id) {
			var checkBox = new CheckBox({
				name:"checkBox",
				value:"",
				checked:false,
				onChange:function (b) {
					alert('onChange called with parameter = ' + b + ', and widget value = ' + this.get('value'));
				}
			}, id).startup();
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
			var month = MONTHS[d.getMonth()];
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
				places:5
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
	});
});
