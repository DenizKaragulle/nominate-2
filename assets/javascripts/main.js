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
	"dijit/ProgressBar",
	"dijit/Tooltip",
	"dojo/_base/array",
	"dojo/_base/declare",
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
	"config/defaults",
	"config/details",
	"config/credits",
	"config/tags",
	"config/performance",
	"config/profile",
	"esri/dijit/Tags",
	"dojo/NodeList-traverse"
], function (put, Memory, Pagination, OnDemandGrid, Keyboard, Selection, Dialog, Editor, LinkDialog, TextColor, ViewSource, FontChoice, Button, CheckBox, ProgressBar, Tooltip, array, declare, lang, aspect, date, Deferred, dom, domAttr, domClass, domConstruct, domStyle, number, on, query, arcgisPortal, ArcGISOAuthInfo, esriId, arcgisUtils, config, Map, esriRequest, parser, ready, defaults, details, credits, tags, performanceConfig, profileConfig, Tags) {

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
	var score = 0;

	ready(function () {

		run();

		thumbnailRenderCell = function (object, data, cell) {
			var thumbnailUrl = formatThumbnailUrl(object);
			var type = validateStr(object.type);
			var modifiedDate = formatDate(object.modified);
			var views = validateStr(object.numViews);
			var access = object.access;
			var n = domConstruct.create("div", {
				innerHTML:
						'<div class="row">' +
						'	<div class="column-3">' +
						'		<div class="thumbnail">' +
						'			<img src="' + thumbnailUrl + '" />' +
						'		</div>' +
						'	</div>' +

						'	<div class="column-18">' +
						'		<div class="item-title">' + object.title + '</div>' +
						'		<div class="shit">' +
						'			<span class="item-type">' + type + '</span> - <span class="item-access">Sharing:' + access + ' - Updated ' + modifiedDate + '</span>' +
						'		</div>' +
						'		<div class="item-number-views">' + views + ' views</div>' +
						'	</div>' +

						'	<div class="column-1">' +
						'		<h4 class="icon-checked icon-blue"></h4>' +
						'	</div>' +
						'	<div class="column-1">' +
						'		<h4 class="icon-unchecked icon-blue"></h4>' +
						'	</div>' +
						'	<div class="column-1">' +
						'		<h4 class="icon-unchecked icon-blue"></h4>' +
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
			array.forEach(defaults.CATEGORIES, function (category) {
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
					// total nuber of items
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
								renderCell: thumbnailRenderCell
							}
						];
						// dgrid memory store
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
								array.forEach(defaults.CATEGORIES, function (category) {
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
											"<div id='" + rowID + "' class='container' style='width: " + selectedNodeWidth + "px;'>" +
											"	<div class='content-container'>" +
													"		<div class='row'>" +
													"			<div class='column-21 pre-3'>" +
													"				<div id='map'></div>" +
													"			</div>" +
													"		</div>" +

													"		<div class='row'>" +
													"			<div class='column-21 pre-3'>" +
													"				<div class='row'>" +
													"					<div class='current-score-header'>" + defaults.CURRENT_SCORE_HEADER_TEXT + "</div>" +
													"				</div>" +
													"			</div>" +
													"		</div>" +

													"		<div class='row'>" +
													"			<div class='column-15 pre-3'>" +
													"				<div class='current-score-graphic-container'></div>" +
													"			</div>" +
													"			<div class='column-2'>" +
													"				<div class='current-score-number'>78</div>" +
													"			</div>" +
													"			<div class='column-4 right' style='margin-top: -15px !important;'>" +
													"				<button id='nominate-btn' class='btn icon-email custom-btn'> NOMINATE </button>" +
													"			</div>" +
													"		</div>" +

													"		<div class='row'>" +
													"			<div class='column-21 pre-3'>" +
													"				<div class='expanded-item-text'>" + defaults.OVERALL_TXT + "</div>" +
													"			</div>" +
													"		</div>" +

													"		<div class='row'>" +
													"			<div class='column-21 pre-3'>" +
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
										id: "overall-score-graphic",
										style: {
											"width": "100%",
											"height": "5px"
										},
										value: score
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
				var node = query(".content-container")[0];
				domConstruct.place(details.DETAILS_CONTENT, node, "last");

				// set the thumbnail
				domAttr.set(query(".thumbnailUrl")[0], "src", thumbnailUrl);
				domAttr.set(query(".title-textbox")[0], "id", titleID);
				domConstruct.create("div", { innerHTML: itemTitle }, query(".title-textbox")[0], "first");
				// set the summary
				domAttr.set(query(".summary-textbox")[0], "id", snippetID);
				domAttr.set(query(".summary-textbox")[0], "value", itemSummary);
				domConstruct.create("div", { innerHTML: itemSummary }, query(".summary-textbox")[0], "first");
				// set the description
				domAttr.set(query(".description-editor")[0], "id", descID);
				if (itemDescription === "") {
					domConstruct.place("<span></span>", "description-editor-widget", "first");
				} else {
					domConstruct.place("<span>" + itemDescription + "</span>", "description-editor-widget", "first");
				}

				var thumbnailTooltip = new Tooltip({
					connectId: [query(".thumbnail-tooltip")[0]],
					style: {
						width: "10px"
					},
					label: "<div>" +
							"Full points for using a custom thumbnail <br/>" +
							"that you create and upload in the required<br/>" +
							" dimensions (200 x 133 pixels)." +
							"<\/div>"
				});
				var titleTooltip = new Tooltip({
					connectId: [query(".title-tooltip")[0]],
					style: {
						width: "10px"
					},
					label: "<div>" +
							"A title should be short, simple, clear. <br/>" +
							"Three words is ideal. Avoid acronyms, <br/>" +
							"ALL CAPS, underscores, “copy”, “test”, <br/>" +
							"“demo”, “eval” in the title. Answers <br/>" +
							"the basic question “What is this?\"" +
							"<\/div>"
				});
				var summaryTooltip = new Tooltip({
					connectId: [query(".summary-tooltip")[0]],
					style: {
						width: "10px"
					},
					label: "<div>" +
							"A good summary briefly explains what this map is, <br />" +
							"in 1-2 sentences, about 10 words per sentence. <br />" +
							"Avoid acronyms, ALL CAPS, underscores, “copy”, <br />" +
							"“test”, “demo”, “eval” in the summary. Answers <br />" +
							"the basic question “What does this show?\"" +
							"<\/div>"
				});
				var descriptionTooltip = new Tooltip({
					connectId: [query(".description-tooltip")[0]],
					style: {
						width: "10px"
					},
					label: "<div>" +
							"A good description further clarifies what this item</br >" +
							"is and what it shows. It explains more about the </br >" +
							"data and its sources, but does not go into pages</br >" +
							"of explanation. Scoring is primarily based on </br >" +
							"length of content. About 2-3 paragraphs is ideal, </br >" +
							"with 4-5 sentences per paragraph, and about 12 or </br >" +
							"so words per sentence. Bonus points if hyperlinks </br >" +
							"whisk the reader away to more fully developed </br >" +
							"explanations and other supporting material." +
							"<\/div>"
				});

				/*descriptionEditor = new Editor({
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
					]
				}, dom.byId(descID));
				descriptionEditor.startup();*/

				/*var editBtn = dom.byId("edit-btn");
				on(editBtn, "click", function () {
					domConstruct.destroy("section-content");

					var node = query(".content-container")[0];
					domConstruct.place(details.DETAILS_CONTENT_EDIT, node, "last");
					// set the title
					domAttr.set(query(".thumbnailUrl")[0], "src", thumbnailUrl);
					domAttr.set(query(".title-textbox")[0], "id", titleID);
					domConstruct.create("div", { innerHTML:itemTitle }, query(".title-textbox")[0], "first");
					// set the summary
					domAttr.set(query(".summary-textbox")[0], "id", snippetID);
					domAttr.set(query(".summary-textbox")[0], "value", itemSummary);
					domConstruct.create("div", { innerHTML:itemSummary }, query(".summary-textbox")[0], "first");
					// set the description
					domAttr.set(query(".description-editor")[0], "id", descID);
					domConstruct.create("div", { innerHTML:itemDescription }, query(".description-editor")[0], "first");
					descriptionEditor = new Editor({
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
							'viewSource'
						]
					}, dom.byId(descID));
					descriptionEditor.startup();

					// update thumbnail dialog
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

					on(query(".expanded-item-thumbnail"), "click", function (event) {
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
							console.log(dom.byId("thumbnail-file-updload-btn").files[0]);
							// http://www.arcgis.com/sharing/rest/content/users/cmahlke_jsapi/items/d34ed6019b2348768002221c8ac9c312
							// http://jsapi.maps.arcgis.com/sharing/rest/content/users/cmahlke_jsapi/items/d34ed6019b2348768002221c8ac9c312/update
							esriRequest({
								url:_userItemUrl + "/update",
								content:{
									f:"json",
									thubmnail:dom.byId("thumbnail-file-updload-btn").files[0]
								},
								multipart:true
							}, {
								usePost:true,
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
				});

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
							url: _userItemUrl + "/update",
							content: {
								f: "json",
								title: _title,
								snippet: _snippet,
								description: _description
							}
						}, {
							usePost: true
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
				});*/

				var editSaveBtnNode = query(".edit-save-btn")[0];
				on(editSaveBtnNode, "click", function () {
					var itemThumbnailNode = query(".thumbnailUrl")[0];
					var itemTitleNode = query(".title-textbox")[0];
					var itemSummaryNode = query(".summary-textbox")[0];
					var itemDescriptionNode = query(".description-editor")[0];

					if (editSaveBtnNode.innerHTML === " EDIT ") {
						// EDITING MODE
						// update button label " SAVE "
						domAttr.set(editSaveBtnNode, "innerHTML", " SAVE ");

						// update title section
						// empty the contents
						domConstruct.empty(itemTitleNode);
						// create the input tag and set the value
						domConstruct.create("input", { class: "edit-title", value:itemTitle }, itemTitleNode, "first");
						// create the type of input
						domAttr.set(itemTitleNode, "data-dojo-type", "dijit/form/TextBox");
						// give it and ID
						domAttr.set(itemTitleNode, "id", titleID);

						// update summary section
						// empty the contents
						domConstruct.empty(itemSummaryNode);
						// create the input tag and set the value
						domConstruct.create("input", { class: "edit-summary", value:itemSummary }, itemSummaryNode, "first");
						// create the type of input
						domAttr.set(itemSummaryNode, "data-dojo-type", "dijit/form/TextBox");
						// give it and ID
						domAttr.set(itemSummaryNode, "id", snippetID);

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
								'viewSource'
							],
							innerHTML: itemDescription
						}, dom.byId("description-editor-widget"));
						descriptionEditor.startup();

						// update thumbnail dialog
						/*var myDialog = new Dialog({
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

						on(query(".expanded-item-thumbnail"), "click", function (event) {
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
								console.log(dom.byId("thumbnail-file-updload-btn").files[0]);
								// http://www.arcgis.com/sharing/rest/content/users/cmahlke_jsapi/items/d34ed6019b2348768002221c8ac9c312
								// http://jsapi.maps.arcgis.com/sharing/rest/content/users/cmahlke_jsapi/items/d34ed6019b2348768002221c8ac9c312/update
								esriRequest({
									url:_userItemUrl + "/update",
									content:{
										f:"json",
										thubmnail:dom.byId("thumbnail-file-updload-btn").files[0]
									},
									multipart:true
								}, {
									usePost:true,
								}).then(function (response) {
											if (response.success) {
												console.log("SUCCESS");
												myDialog.hide();
											} else {
												console.log("FAILURE");
											}
										});
							});
						});*/
					} else {
						// DETAILS
						// http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#/Item/02r30000007w000000/
						// The title of the item. This is the name that's displayed to users and by
						// which they refer to the item. Every item must have a title.
						itemTitle = query(".edit-title")[0].value;
						itemSummary = query(".edit-summary")[0].value;
						itemDescription = dijit.byId("description-editor-widget").value;

						portalUser.getItem(selectedRowID).then(function (results) {
							var _userItemUrl = results.userItemUrl;
							esriRequest({
								url:_userItemUrl + "/update",
								content:{
									f:"json",
									title: itemTitle,
									snippet: itemSummary,
									description: itemDescription
								}
							}, {
								usePost:true
							}).then(function (response) {
								domConstruct.destroy(query(".alert-loader")[0]);
								if (response.success) {
									// NON-EDITING MODE
									// update button label " EDIT "
									domAttr.set(editSaveBtnNode, "innerHTML", " EDIT ");
									console.log("SUCCESS");
								} else {
									console.log("ERROR");
								}
							});
						});

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
						}

						domAttr.remove(itemDescriptionNode, "id");
						domConstruct.create("div", {
							id:"description-editor-widget"
						}, itemDescriptionNode, "first");

						if (itemDescription === "") {
							domConstruct.place("<span></span>", "description-editor-widget", "first");
						} else {
							domConstruct.place("<span>" + itemDescription + "</span>", "description-editor-widget", "first");
						}
					}
				});
			});
		}

		function useCreditsContentPane(selectedRowID, accessAndUseConstraintsID, creditID) {
			portalUser.getItem(selectedRowID).then(function (item) {
				var itemCredits = validateStr(item.accessInformation);
				var accessAndUseConstraints = validateStr(item.licenseInfo);

				domConstruct.destroy("section-content");
				domConstruct.destroy("save-row");
				var node = query(".content-container")[0];
				domConstruct.place(credits.ACCESS_CREDITS_CONTENT, node, "last");

				domAttr.set(query(".creditsID-textbox")[0], "id", creditID);
				domConstruct.create("div", { innerHTML: itemCredits }, query(".creditsID-textbox")[0], "first");

				domAttr.set(query(".accessAndUseConstraintsEditor")[0], "id", accessAndUseConstraintsID);
				if (accessAndUseConstraints === "") {
					domConstruct.place("<span></span>", "access-editor-widget", "first");
				} else {
					domConstruct.place("<span>" + accessAndUseConstraints + "</span>", "access-editor-widget", "first");
				}

				var userFullNameTooltip = new Tooltip({
					connectId: [query(".access-constraints-tooltip")[0]],
					style: {
						width: "10px"
					},
					label: "<div>" +
							"Determines if other users can search for this <br/>" +
							"user by name. Setting this to private hides the <br/>" +
							"user from user searches and invites. If org, only <br/>" +
							"members of your organization can search for this <br/>" +
							"user. Setting this to public makes the user searchable. <br/>" +
							"public is the default." +
							"<\/div>"
				});
				var userDescriptionTooltip = new Tooltip({
					connectId: [query(".credits-tooltip")[0]],
					style: {
						width: "10px"
					},
					label: "<div>Credits the source of the item.<\/div>"
				});

				var editSaveBtnNode = query(".edit-save-btn")[0];
				on(editSaveBtnNode, "click", function () {
					var itemCreditsNode = query(".creditsID-textbox")[0];
					var accessAndUseConstraintsEditorNode = query(".accessAndUseConstraintsEditor")[0];

					if (editSaveBtnNode.innerHTML === " EDIT ") {
						// credits
						domConstruct.empty(itemCreditsNode);
						domConstruct.create("input", { class: "edit-credits", value: itemCredits }, itemCreditsNode, "first");
						domAttr.set(itemCreditsNode, "data-dojo-type", "dijit/form/TextBox");
						domAttr.set(itemCreditsNode, "id", creditID);
						domAttr.set(editSaveBtnNode, "innerHTML", " SAVE ");

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
					}
				});
			});
		}

		function tagsContentPane(_selectedRowID, categoryID, tagsID) {

			var tagsDijit;
			var tagStore;

			portalUser.getItem(_selectedRowID).then(function (item) {
				domConstruct.destroy("section-content");
				var node = query(".content-container")[0];
				domConstruct.place(tags.TAGS_CONTENT, node, "last");

				// tags
				var itemTags = item.tags;
				domConstruct.create("div", {
					class: "existing-tags",
					innerHTML: itemTags
				}, query(".tag-container")[0], "first");

				array.forEach(defaults.CATEGORIES, function (id, i) {
					domConstruct.place("<div><input id='" + id + selectedRowID + "' /> " + defaults.CATEGORIES_LABELS[i] + "</div>", dom.byId("tagCategories"), "last");
				});

				array.forEach(defaults.CATEGORIES, function (id) {
					addCheckbox(id + selectedRowID);
				});

				var editSaveBtnNode = query(".edit-save-btn")[0];
				on(editSaveBtnNode, "click", function () {
					tagStore = new Memory({
						idProperty:'tag',
						data:[].concat(itemTags)
					});
					if (editSaveBtnNode.innerHTML === " SAVE ") {
						// save to AGOL
						console.log("TAGS: " + tagsDijit.values);
						var _userItemUrl = item.userItemUrl;
						esriRequest({
							url:_userItemUrl + "/update",
							content:{
								f:"json",
								tags: "" + tagsDijit.values
							}
						}, {
							usePost:true
						}).then(function (response) {
									if (response.success) {
										if (dijit.byId("tag-widget")) {
											domConstruct.create("div", {
												class:"existing-tags",
												innerHTML:tagsDijit.values
											}, query(".tag-container")[0], "first");

											dijit.byId("tag-widget").destroy();
											domConstruct.create("div", {
												id:"tag-widget"
											}, query(".tag-container")[0], "first");
										}
										domAttr.set(editSaveBtnNode, "innerHTML", " EDIT ");
										console.log("SUCCESS");
									} else {
										console.log("ERROR");
									}
								});
					} else {
						// edit mode
						domConstruct.empty(query(".existing-tags")[0]);
						if (dijit.byId("tag-widget")) {
							dijit.byId("tag-widget").destroy();
							domConstruct.create("div", {
								id:"tag-widget"
							}, query(".tag-container")[0], "first");
						}
						tagsDijit = new Tags({
							placeholder:'Add tag(s)',
							noDataMsg:'No results found.',
							matchParam:'all',
							idProperty:'tag',
							gridId:'grid1',
							filterId:'filter1',
							minWidth:'300px',
							maxWidth:'400px',
							store:tagStore
						}, "tag-widget");
						// prepopulate the widget with values from the list
						tagsDijit.prepopulate(tagStore.data);
						domAttr.set(editSaveBtnNode, "innerHTML", " SAVE ");
					}
				});
			});
		}

		function performanceContentPane(item, popUps, mapDrawTime, layers) {
			domConstruct.destroy("section-content");
			domConstruct.destroy("save-row");

			var node = query(".content-container")[0];
			domConstruct.place(performanceConfig.PERFORMANCE_CONTENT, node, "last");

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
				var _userThumbnailUrl = item.portal.getPortalUser().thumbnailUrl;
				var _userFullName = validateStr(item.portal.getPortalUser().fullName);
				var _userDescription = validateStr(item.portal.getPortalUser().description);

				console.log(item.portal.getPortalUser());

				domConstruct.destroy("section-content");
				var node = query(".content-container")[0];
				domConstruct.place(profileConfig.PROFILE_CONTENT, node, "last");

				domAttr.set(query(".profileThumbnailUrl")[0], "src", _userThumbnailUrl);
				domAttr.set(query(".name-textbox")[0], "id", _userNameID);
				domConstruct.create("div", { innerHTML: _userFullName }, query(".name-textbox")[0], "first");
				domAttr.set(query(".user-description-textbox")[0], "id", _userDescriptionID);
				domConstruct.create("div", { innerHTML: _userDescription }, query(".user-description-textbox")[0], "first");

				var profileThumbnailTooltip = new Tooltip({
					connectId: [query(".profile-thumbnail-tooltip")[0]],
					style: {
						width: "10px"
					},
					label: "<div>" +
							"Enter the pathname to the thumbnail image to be <br/>" +
							"used for the user. The recommended image size is 200 <br/>" +
							"pixels wide by 133 pixels high. Acceptable image <br/>" +
							"formats are PNG, GIF, and JPEG. The maximum file size <br/>" +
							"for an image is 1 MB. This is not a reference to the <br/>" +
							"file but the file itself, which will be stored on the <br/>" +
							"sharing servers." +
							"<\/div>"
				});
				var userFullNameTooltip = new Tooltip({
					connectId: [query(".user-full-name-tooltip")[0]],
					style: {
						width: "10px"
					},
					label: "<div>The full name of the user. Only applicable for the arcgis identity provider.<\/div>"
				});
				var userDescriptionTooltip = new Tooltip({
					connectId: [query(".user-description-tooltip")[0]],
					style: {
						width: "10px"
					},
					label: "<div>A description of the user.<\/div>"
				});

				var editSaveBtnNode = query(".edit-save-btn")[0];
				on(editSaveBtnNode, "click", function () {
					var itemThumbnailNode = query(".profileThumbnailUrl")[0];
					var itemUserNameNode = query(".name-textbox")[0];
					var itemUserDescriptionNode = query(".user-description-textbox")[0];

					if (editSaveBtnNode.innerHTML === " EDIT ") {
						domAttr.set(editSaveBtnNode, "innerHTML", " SAVE ");
						domConstruct.empty(itemUserNameNode);
						domConstruct.create("input", { class: "edit-user-full-name", value:_userFullName }, itemUserNameNode, "first");
						domAttr.set(itemUserNameNode, "data-dojo-type", "dijit/form/TextBox");
						domAttr.set(itemUserNameNode, "id", _userNameID);

						domConstruct.empty(itemUserDescriptionNode);
						domConstruct.create("input", { class: "edit-user-description", value:_userDescription }, itemUserDescriptionNode, "first");
						domAttr.set(itemUserDescriptionNode, "data-dojo-type", "dijit/form/TextBox");
						domAttr.set(itemUserDescriptionNode, "id", _userDescriptionID);
					} else {
						_userFullName = query(".edit-user-full-name")[0].value;
						_userDescription = query(".edit-user-description")[0].value;

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
									domConstruct.empty(itemUserNameNode);
									domConstruct.create("div", { innerHTML: _userFullName }, itemUserNameNode, "first");
									domAttr.remove(itemUserNameNode, "data-dojo-type");
									domAttr.set(itemUserNameNode, "id", _userNameID);

									domConstruct.empty(itemUserDescriptionNode);
									domConstruct.create("div", { innerHTML: _userDescription }, itemUserDescriptionNode, "first");
									domAttr.remove(itemUserDescriptionNode, "data-dojo-type");
									domAttr.set(itemUserDescriptionNode, "id", _userDescriptionID);

									domAttr.set(editSaveBtnNode, "innerHTML", " EDIT ");
								} else {

								}
							});
						});
					}
				});
			});
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
							'	<div class="btn-group column-24 icon-edit-btn-group">' +
							'		<a class="active column-4 details icon-edit"> ' + defaults.DETAILS + '</a>' +
							'		<a class="column-4 credits icon-edit"> ' + defaults.USE_CREDITS + '</a>' +
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

		function addCheckbox(id) {
			var checkBox = new CheckBox({
				name: "checkBox",
				value: "",
				checked: false,
				onChange: function (b) {
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
	});
});
