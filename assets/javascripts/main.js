/*global define,location */
/*jslint sloppy:true */
/*
 | Copyright 2014 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
require([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"put-selector/put",
	"dgrid/extensions/Pagination",
	"dgrid/OnDemandGrid",
	"dijit/Dialog",
	"dijit/form/Button",
	"dijit/ProgressBar",
	"dijit/registry",
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
	"dojo/parser",
	"dojo/promise/all",
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
	"esri/map",
	"esri/request",
	"config/defaults",
	"config/details",
	"config/detailsUtils",
	"config/creditsUtils",
	"config/profileUtils",
	"config/gridUtils",
	"config/credits",
	"config/tags",
	"config/tagUtils",
	"config/performance",
	"config/performanceUtils",
	"config/profile",
	"config/tooltips",
	"config/scoring",
	"config/validator",
	"config/uiUtils",
	"config/portalUtils",
	"config/scoringUtils",
	"config/nominateUtils",
	"dojo/NodeList-traverse"
], function (array, declare, lang, put, Pagination, OnDemandGrid, Dialog, Button, ProgressBar, registry, date, Deferred, dom, domAttr, domClass, domConstruct, domStyle, html, keys, number, on, parser, all, ready, query, Memory, string, arcgisPortal, ArcGISOAuthInfo, esriId, arcgisUtils, Color, config, Map, esriRequest, defaults, details, DetailsUtils, CreditsUtils, ProfileUtils, GridUtils, credits, tags, TagUtils, performanceConfig, PerformanceUtils, profileConfig, tooltipsConfig, scoring, Validator, UserInterfaceUtils, PortalUtils, ScoringUtils, NominateUtils) {

	parser.parse();

	var map;
	var layers;
	//
	var dgrid;
	var dgridColumns;
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

	var searchInputNode = "";
	var dropdownSortNode = "";
	var dropdownItemFilterNode = "";
	var progressBarNode = "";
	// div dimensions
	var COLLAPSE_ROW_HEIGHT = 125;
	var EXPAND_ROW_HEIGHT = 900;
	// element id/name
	var SIGNIN_BUTTON_ID = "sign-in";
	var EXPANDED_ROW_NAME = "expanded-row-";
	var TAB_CONTAINER_NAME = "tc-";

	var rowID = null;
	var tcID = null;

	var portal;
	var portalUserThumbnailUrl = "";

	//
	var detailsNodeClickHandler;
	var creditsNodeClickHandler;
	var tagsNodeClickHandler;
	var performanceNodeClickHandler;
	var profileNodeClickHandler;

	var HAS_PERFORMANCE_CONTENT = false;
	//
	var portalUtils = null;
	var gridUtils = null;
	var validator = null;
	var scoringUtils = null;
	var nominateUtils = null;

	var detailsUtils = null;
	var creditsUtils = null;
	var tagUtils = null;
	var performanceUtils = null;
	var profileUtils = null;

	var selectedTab = ".details";

	// OAuth
	var info = null;

	var _config = {};

	ready(function () {

		run();

		function run() {

			var appLocation = location.pathname.indexOf("/apps/");
			var instance = location.pathname.substr(0, appLocation);
			_config.proxyurl = location.protocol + "//" + location.host + instance + "/sharing/proxy";
			esriConfig.defaults.io.proxyUrl = _config.proxyurl;
			esriConfig.defaults.io.alwaysUseProxy = false;

			info = new ArcGISOAuthInfo({
				appId: "A7LGXdfYyyfvcAEx",
				// Uncomment this line to prevent the user's signed in state from being shared
				// with other apps on the same domain with the same authNamespace value.
				//authNamespace: "portal_oauth_inline",
				popup: false
			});
			esriId.registerOAuthInfos([info]);

			esriId.checkSignInStatus(info.portalUrl).then(
					function () {
						loadContent();
					}
			).otherwise(
					function () {
						var userInterfaceUtils = new UserInterfaceUtils();
						//	on(portal, "ready", lang.hitch(this, function (p) {
						on(dom.byId(SIGNIN_BUTTON_ID), "click", portalSignInHandler);
						//on(searchInputNode, "keydown", searchItemsClickHandler);
						//on(query(".filter-list"), "click", filterItemsClickHandler);
						//on(query(".sort-items"), "click", sortItemsClickHandler);
						/*on(query(".icon-help")[0], "click", helpBtnClickHandler);*/
						//	}));
					}
			);
		}

		function portalSignInHandler() {
			esriId.getCredential(info.portalUrl);
		}

		function loadContent() {
			searchInputNode = query(".search-items")[0];
			dropdownSortNode = query(".dropdown-item-sort")[0];
			dropdownItemFilterNode = query(".dropdown-item-filter")[0];

			on(query(".filter-list"), "click", filterItemsClickHandler);
			on(query(".sort-items"), "click", sortItemsClickHandler);
			on(query(".help-button")[0], "click", function () {
				esriId.destroyCredentials();
				window.location.reload();
			});

			var userInterfaceUtils = new UserInterfaceUtils();

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
						if (feature.attributes["OnineStatus"] === "") {
							status = defaults.CURRENT_STATUS[0].label;
						} else if (feature.attributes["OnineStatus"] === defaults.STATUS_NOMINATED) {
							status = defaults.CURRENT_STATUS[1].label;
						} else if (feature.attributes["OnineStatus"] === defaults.STATUS_UNDER_REVIEW) {
							status = defaults.CURRENT_STATUS[2].label;
						} else if (feature.attributes["OnineStatus"] === defaults.STATUS_ACCEPTED) {
							status = defaults.CURRENT_STATUS[3].label;
						}
					}
				});

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
							'		<div class="item-nomination-status-' + object.id + '">' + status + '</div>' +
							'	</div>' +
							'</div>'
				});
				cell.appendChild(n);
			};

			detailsNodeClickHandler = function () {
				userInterfaceUtils.setActiveTab(this, query(selectedTab)[0], "details");
				selectedTab = ".details";
				detailsContentPane();
			};
			creditsNodeClickHandler = function () {
				userInterfaceUtils.setActiveTab(this, query(selectedTab)[0], "credits");
				selectedTab = ".credits";
				creditsContentPane();
			};
			tagsNodeClickHandler = function () {
				userInterfaceUtils.setActiveTab(this, query(selectedTab)[0], "tags");
				selectedTab = ".tags";
				tagsContentPane();
			};
			performanceNodeClickHandler = function (response, layers) {
				userInterfaceUtils.setActiveTab(this, query(selectedTab)[0], "performance");
				selectedTab = ".performance";
				performanceContentPane(response, layers);
			};
			profileNodeClickHandler = function () {
				userInterfaceUtils.setActiveTab(this, query(selectedTab)[0], "profile");
				selectedTab = ".profile";
				profileContentPane();
			};

			new arcgisPortal.Portal(defaults.sharinghost).signIn().then(function (portalUser) {

				var portal = portalUser.portal;

				// hide the sign in button
				userInterfaceUtils.hideNode(dom.byId("sign-in"));
				// hide the intro text
				userInterfaceUtils.hideNode(query(".intro")[0]);
				// show the loading indicator
				userInterfaceUtils.showNode(query(".init-loader")[0]);

				portalUtils = new PortalUtils(portal);
				nominateUtils = new NominateUtils(defaults, portalUtils);
				validator = new Validator();

				// update the header row
				userInterfaceUtils.updateHeader();

				// url to the thumbnail image for the portalUser.
				portalUserThumbnailUrl = portalUtils.portalUser.thumbnailUrl;
				// if portalUser has no thumbnail in the dGrid, use the default thumbnail for a portalUser
				if (portalUserThumbnailUrl === null) {
					portalUserThumbnailUrl = "https://cdn.arcgis.com/cdn/5777/js/arcgisonline/css/images/no-user-thumb.jpg";
				}

				// dGrid columns
				dgridColumns = [
					{
						label: "",
						field: "thumbnailUrl",
						renderCell: renderRow
					}
				];

				portalUtils.getListOfCurators().then(lang.hitch(this, function (response) {
							// query the list of curators
							var deferred = new Deferred();
							var curators = response.features;
							var is_a_curator = array.some(curators, lang.hitch(this, function (curator) {
								if (curator.attributes["curatorID"] === portalUtils.portalUser.username) {
									return true;
								}
							}));
							deferred.resolve(is_a_curator);
							return deferred.promise;
						})).then(function (result) {
							if (result) {
								portalUtils.IS_CURATOR = true;
								var process = nominateUtils.loadNominatedItemsInMemory();
								process.then(lang.hitch(this, function (items) {
									portalUtils.queryMultiplePortals(items.features).then(lang.hitch(this, function (response) {
										all(response).then(lang.hitch(this, function (results) {
											console.debug("results", results);
											console.debug("items", items);
											nominateUtils.nominatedItems = items;
											load(results, portalUtils.portalUser.fullName, portalUtils.portalUser.username);
										}));
									}));
								}));
							} else {
								portalUtils.IS_CURATOR = false;
								var deferred = null;
								portal.queryItems(portalUtils.portalQueryParams).then(function (portalQueryResult) {
									deferred = new Deferred();
									deferred.resolve(portalQueryResult);
									return deferred.promise;
								}).then(function (portalItems) {
											var process = nominateUtils.loadNominatedItemsInMemory();
											process.then(lang.hitch(this, function (results) {
												nominateUtils.nominatedItems = results;
												load(portalItems.results, portalUtils.portalUser.fullName, portalUtils.portalUser.username);
											}));
										});
							}
						});
			});

			function load(results, fullName, userName) {
				var numItems = results.length;
				userInterfaceUtils.updateRibbonHeaderTitle();
				var hdrUserNameText = " (" + fullName + " - " + userName + ")";
				userInterfaceUtils.setNodeContent(".ribbon-header-user", hdrUserNameText);
				userInterfaceUtils.ribbonHeaderNumItemsNode.innerHTML = " " + numItems + " Items";
				domAttr.set(userInterfaceUtils.ribbonHeaderNumItemsNode, "class", "icon-stack");

				itemStore = new Memory({
					data: results
				});
				dgrid = new (declare([OnDemandGrid, Pagination]))({
					store: itemStore,
					rowsPerPage: 6,
					pagingLinks: true,
					pagingTextBox: false,
					firstLastArrows: true,
					columns: dgridColumns,
					showHeader: false,
					noDataMessage: "No results found"
				}, "dgrid");
				dgrid.startup();
				gridUtils = new GridUtils(portal, dgrid, userInterfaceUtils);
				gridUtils.startup();

				// "Nominate" button edits-complete handler
				on(nominateUtils.nominateAdminFeatureLayer, "edits-complete", function (complete) {

					// curator has added comments to an nominated item
					if (complete.updates.length > 0) {
						if (complete.updates[0].success) {
							// update the list
							nominateUtils.loadNominatedItemsInMemory().then(function (nominatedItemResults) {
								nominateUtils.nominatedItems = nominatedItemResults;
							});
							dijit.byId("adminDialog").destroy();
						}
					}

					// new item has been nominated
					if (complete.adds.length > 0) {
						if (complete.adds[0].success) {
							// selected item ID
							var selectedID = nominateUtils.selectedID;
							// item status (NOMINATED)
							var nodeLabel = defaults.CURRENT_STATUS[1].label;
							// item status node in dGrid
							var itemStatusNode = query(".item-nomination-status-" + selectedID)[0];
							// update the status label of the item in the dGrid to "Nominated"
							var updatedItemStatusNode = domConstruct.toDom("<div class='item-nomination-status-" + selectedID + "'>" + nodeLabel + "</div>");
							domConstruct.place(updatedItemStatusNode, itemStatusNode, "last");

							// update the client-side collection of nominated items
							nominateUtils.loadNominatedItemsInMemory().then(function (nominatedItemResults) {
								nominateUtils.nominatedItems = nominatedItemResults;
								var nominateBtnDialog = new Dialog({
									title: nominatedItemResults.features[nominatedItemResults.features.length - 1].attributes.itemName,
									/*content: '<div class="dialog-container">' +
											'	<div class="row">' +
											'		<div class="column-24" >' + defaults.NOMINATED_SUCCESS_DIALOG +
											'	<\/div>' +
											'<\/div>',*/
									content: '<div class="dialog-container">' +
											'	<div class="row">' +
											'		<div class = "column-24">' + defaults.NOMINATED_SUCCESS_DIALOG +
											'	<\/div>' +
											'	<div class="dialog-btn-container">' +
											'		<div class="row">' +
											'			<div class = "column-24" >' +
											'				<button class="btn dialog-ok-btn"> Ok <\/button>' +
											'			<\/div>' +
											'		<\/div>' +
											'	<\/div>' +
											'<\/div>',
									style: "width: 300px"
								});
								nominateBtnDialog.show();

								on(query(".dialog-ok-btn")[0], "click", function () {
									nominateBtnDialog.hide();
									console.log("OK");
								});
							});
							// disable "NOMINATE" button
							userInterfaceUtils.disableNominateButton(nominateUtils.nominateBtnNode);
							// enable "ACCEPT" button
							userInterfaceUtils.enableNominateButton(nominateUtils.acceptBtnNode);
						}
					}
				});

				// dGrid row click handler
				on(dgrid.domNode, ".item-title:click", function (event) {
					// selected row
					selectedRow = dgrid.row(event).element;
					// selected row ID
					selectedRowID = domAttr.get(selectedRow, "id").split("dgrid-row-")[1];
					nominateUtils.setSelectedID(selectedRowID);

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
						nominateUtils.nominateBtnID = nominateUtils.NOMINATE_BTN_ID + selectedRowID;
						nominateUtils.acceptBtnID = nominateUtils.ACCEPT_BTN_ID + selectedRowID;

						// get item details
						portalUtils.portalUser.getItem(selectedRowID).then(function (item) {
							// get the item's owner details
							portalUtils.getItemUserProfileContent(item).then(function (userProfile) {
								scoringUtils = new ScoringUtils(userProfile, validator, selectedRowID, defaults, scoring, portalUtils, nominateUtils, userInterfaceUtils);
								scoringUtils.removeScoreBar();

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
												"				<button id='" + nominateUtils.nominateBtnID + "' class='btn icon-email custom-btn enabled'> NOMINATE </button>" +
												"				<button id='" + nominateUtils.acceptBtnID + "' class='btn icon-check success custom-btn accept-item-btn enabled'> ACCEPT </button>" +
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

								// get progress bar node
								progressBarNode = query(".current-score-graphic-container")[0];
								// nominate button node
								nominateUtils.nominateBtnNode = dom.byId(nominateUtils.nominateBtnID);
								// accept button node
								nominateUtils.acceptBtnNode = dom.byId(nominateUtils.acceptBtnID);

								// create button group
								initContentButtonGroup(tcID);

								// initialize content area with details data
								detailsContentPane();

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
											scoringUtils.updateScore(item, detailsNode, creditsNode, tagsNode, performanceNode, profileNode);
											HAS_PERFORMANCE_CONTENT = true;

											on(performanceNode, "click", lang.partial(performanceNodeClickHandler, response, layers));
										}
									});
								} else {
									// fade the loader
									userInterfaceUtils.fadeLoader();
									// hide the map div
									domStyle.set("map", "display", "none");
									//
									on(performanceNode, "click", lang.partial(performanceNodeClickHandler, "", layers));

									scoringUtils.mapDrawTimeScore = 0;
									scoringUtils.nLayersScore = 0;
									scoringUtils.popupsScore = 0;
									scoringUtils.sharingScore = validator.setSharingScore(item);
									scoringUtils.performanceScore = scoringUtils.mapDrawTimeScore + scoringUtils.nLayersScore + scoringUtils.popupsScore + scoringUtils.sharingScore;

									// initialize the scores
									scoringUtils.updateScore(item, detailsNode, creditsNode, tagsNode, performanceNode, profileNode);
									HAS_PERFORMANCE_CONTENT = false;
								}
								on(detailsNode, "click", lang.partial(detailsNodeClickHandler));
								on(creditsNode, "click", lang.partial(creditsNodeClickHandler));
								on(tagsNode, "click", lang.partial(tagsNodeClickHandler));
								on(profileNode, "click", lang.partial(profileNodeClickHandler));
							});
						}); // END getItem
					} // END if
				});
				userInterfaceUtils.hideNode(query(".init-loader")[0]);
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

			// BEGIN DETAILS
			function detailsContentPane() {
				portalUtils.getItem(selectedRowID).then(loadDetailsContent);
			}

			function loadDetailsContent(item) {
				userInterfaceUtils.loadContent(details.DETAILS_CONTENT);
				detailsUtils = new DetailsUtils(item, itemStore, validator, nominateUtils, userInterfaceUtils, scoringUtils, scoring, tooltipsConfig, portalUtils);
			}

			// END DETAILS


			// BEGIN CREDITS AND ACCESS USE CONSTRAINTS
			function creditsContentPane() {
				portalUtils.getItem(selectedRowID).then(loadCreditsContent);
			}

			function loadCreditsContent(item) {
				userInterfaceUtils.loadContent(credits.ACCESS_CREDITS_CONTENT);
				creditsUtils = new CreditsUtils(item, validator, nominateUtils, userInterfaceUtils, scoringUtils, scoring, tooltipsConfig, portalUtils);
			}

			// END CREDITS


			// BEGIN TAGS
			function tagsContentPane() {
				portalUtils.getItem(selectedRowID).then(loadTagsContent);
			}

			function loadTagsContent(item) {
				userInterfaceUtils.loadContent(tags.TAGS_CONTENT);
				tagUtils = new TagUtils(item, validator, nominateUtils, userInterfaceUtils, scoringUtils, scoring, tooltipsConfig, portalUtils);
			}

			// END TAGS


			// BEGIN PERFORMANCE
			function performanceContentPane(response, layers) {
				// load the content
				userInterfaceUtils.loadContent(performanceConfig.PERFORMANCE_CONTENT);
				performanceUtils = new PerformanceUtils(response, layers, validator, nominateUtils, userInterfaceUtils, scoringUtils, scoring, tooltipsConfig, portalUtils);
			}

			// END PERFORMANCE*/

			// BEGIN PROFILE
			function profileContentPane() {
				portalUtils.getItem(selectedRowID).then(loadProfileContent);
			}

			function loadProfileContent(item) {
				userInterfaceUtils.loadContent(profileConfig.PROFILE_CONTENT);
				profileUtils = new ProfileUtils(item, validator, nominateUtils, userInterfaceUtils, scoringUtils, scoring, tooltipsConfig, portalUtils, portal, portalUserThumbnailUrl);
			}

			// END PROFILE

			function initContentButtonGroup(id) {
				domConstruct.place(
						'<div class="row btn-group-container">' +
								'	<div class="btn-group column-24 icon-edit-btn-group">' +
								'		<a class="column-4 details icon-edit"> ' + defaults.DETAILS + '</a>' +
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
			}
		}
	});
});
