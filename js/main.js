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
define([
	"dojo/ready",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/fx",
	"dojo/_base/lang",
	"dojo/Deferred",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/json",
	"dojo/number",
	"dojo/on",
	"dojo/parser",
	"dojo/promise/all",
	"dojo/query",
	"dojo/store/Memory",
	"dijit/Editor",
	"dijit/form/Button",
	"dijit/form/CheckBox",
	"dijit/form/ComboBox",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane",
	"dijit/registry",
	"esri/arcgis/Portal",
	"esri/arcgis/utils",
	"esri/dijit/Geocoder",
	"esri/geometry/Point",
	"esri/SpatialReference",
	"esri/layers/ArcGISImageServiceLayer",
	"esri/layers/ImageServiceParameters",
	"esri/layers/MosaicRule",
	"esri/map",
	"esri/tasks/query",
	"esri/tasks/QueryTask",
	"esri/urlUtils",
	"application/uiUtils",
	"application/gridUtils",
	"application/timelineLegendUtils",
	"application/sharingUtils",
	"application/mapUtils",
	"application/timelineUtils"
], function (ready, array, declare, fx, lang, Deferred, dom, domClass, domConstruct, domGeom, domStyle, json, number, on, parser, all, query, Memory, Editor, Button, CheckBox, ComboBox, BorderContainer, ContentPane, registry, arcgisPortal, arcgisUtils, Geocoder, Point, SpatialReference, ArcGISImageServiceLayer, ImageServiceParameters, MosaicRule, Map, Query, QueryTask, urlUtils, UserInterfaceUtils, GridUtils, TimelineLegendUtils, SharingUtils, MappingUtils, TimelineUtils) {
	return declare(null, {

		config:{},

		// user interface utils
		//userInterfaceUtils:{},
		// dgrid utils
		//gridUtils:{},
		// timeline utils
		//timelineUtils:{},
		// timeline legend utils
		//timelineLegendUtils:{},
		// sharing utils
		//sharingUtils:{},
		// map utils
		//mapUtils:{},

		portalUrl:"",
		portal:{},

		selectedItemType : "",

		filterItemTypeStore:{},

		SIGNIN_BUTTON_ID:"signIn",
		EXPANDED_ROW_NAME : "expanded-row-",
		SAVE_BUTTON_NAME : "btn-",
		TAB_CONTAINER_NAME : "tc-",
		TAB_CONTAINER_TITLE : "title-",
		TAB_CONTAINER_DESC : "desc-",
		TAB_CONTAINER_SNIPPET : "snippet-",
		TAB_CONTAINER_LICENSE : "license-",
		TAB_CONTAINER_CREDITS : "credits-",
		TAB_CONTAINER_CATEGORY : "category-",
		TAB_CONTAINER_TAGS : "tags-",
		TAB_CONTAINER_USERNAME : "username-",
		TAB_CONTAINER_USERDESCRIPTION : "userdesc-",

		INTRO_TEXT : "ArcGIS includes a Living Atlas of the World with beautiful and " +
					"authoritative maps on hundreds of topics. It combines reference and thematic maps with many topics " +
					"relating to people, earth, and life.  Explore maps from Esri and thousands or organizations and " +
					"enrich them with your own data to create new maps and map layers.",
		INTRO_AUTHENTICATED_TEXT : "Select an item to prepare for nomination.",
		MAXIMUM_CHAR : "A maximum of xxx characters are available",

		/**
		 *
		 * @param config
		 */
		startup:function (config) {
			// config will contain application and user defined info for the template such as i18n strings, the web map id
			// and application id
			// any url parameters and any application specific configuration information.
			if (config) {
				this.config = config;
				// document ready
				ready(lang.hitch(this, function () {
					// set the initial screen text
					dom.byId("init-screen-msg").innerHTML = this.INTRO_TEXT;
					portalUrl = document.location.protocol + '//www.arcgis.com';
					portal = new arcgisPortal.Portal(portalUrl);

					on(portal, "ready", lang.hitch(this, function (p) {
						dom.byId(this.SIGNIN_BUTTON_ID).disabled = false;
						on(dom.byId(this.SIGNIN_BUTTON_ID), "click", lang.hitch(this, this.signIn));
					}));

					this.filterItemTypeStore = new Memory({
						data:[
							/*{type:"Show All", id:"all"},*/
							{type:"Web Map", id:"webmap"},
							{type:"CityEngine Web Scene", id:"cityEngine"},
							{type:"Web Scene", id:"webScene"},
							{type:"Pro Map", id:"proMap"},
							{type:"Feature Service", id:"featureService"},
							{type:"Map Service", id:"mapService"},
							{type:"Image Service", id:"imageService"},
							{type:"Web Mapping Application", id:"webMappingApplication"}
						]
					});

					// filter item type
					var comboBox = new ComboBox({
						id:"filter-container-drop-down",
						name:"type",
						value:"",
						store:this.filterItemTypeStore,
						searchAttr:"type",
						onChange:function (value) {
							//applyFilter(value);
							console.log(value);
						}
					}, query(".filter-container")[0]).startup();

					/*this.userInterfaceUtils = new UserInterfaceUtils(this, this.config);
					 this.gridUtils = new GridUtils(this, this.config);
					 this.timelineLegendUtils = new TimelineLegendUtils(this.config);
					 this.timelineUtils = new TimelineUtils(this, this.config);
					 this.sharingUtils = new SharingUtils(this.config);
					 this.mapUtils = new MappingUtils(this.config);

					 //supply either the webmap id or, if available, the item info
					 var itemInfo = this.config.itemInfo || this.config.webmap;
					 this._createWebMap(itemInfo);

					 this.userInterfaceUtils.loadAppStyles();

					 array.forEach(this.config.TIMELINE_LEGEND_VALUES, lang.hitch(this, this.timelineLegendUtils.buildLegend));

					 this.userInterfaceUtils.watchSplitters(registry.byId("main-window"));*/
				}));
			} else {
				var error = new Error("Main:: Config is not defined");
				this.reportError(error);
			}
		},

		signIn:function () {
			var signInLink = dom.byId(this.SIGNIN_BUTTON_ID);
			if (signInLink.innerHTML.indexOf("APPS") !== -1) {
				portal.signIn().then(lang.hitch(this, function (user) {
					dom.byId("init-screen-msg").innerHTML = this.INTRO_AUTHENTICATED_TEXT;
					domStyle.set("init-screen-msg", "float", "left");
					domConstruct.destroy("sign-in-container");
					// show the filter controls
					this._displayControls();

					portalUser = portal.getPortalUser();
					owner = portalUser.username;

					var params = {
						q:"owner:" + owner + this.selectedItemType,
						num:1000
					};
					portal.queryItems(params).then(lang.hitch(this, function (result) {
						console.log(result);
					}));
					/*	if (result.total > 0) {
							// thumbnail cell renderer
							var thumbnailRenderCell = function (object, data, cell) {
								var thumbnailUrl = formatThumbnailUrl(object);
								var n = domConstruct.create("div", {
									innerHTML:'<div class="thumbnail"><img src="' + thumbnailUrl + '" />'
								});
								cell.appendChild(n);
							};
							// title cell renderer
							var titleRenderCell = function (object, data, cell) {
								var snippet = formatSnippet(object.snippet);
								var type = formatSnippet(object.type);
								var modifiedDate = formatDate(object.modified);
								var n = domConstruct.create("div", {
									innerHTML:'<div class="title-column-container">' +
											'<div class="title-column-title">' + object.title + '</div>' +
											'<div class="title-column-modified" style="position: relative; top: 70px;">Modified: ' + modifiedDate + '<span style="position: absolute; left: 300px;">' + type + '</span></div>' +
											'<div class="title-column-snippet" style="position: relative; top: -20px;">' + snippet + '</div>' +
											'</div>'
								});
								cell.appendChild(n);
							};
							// status cell renderer
							var statusRenderCell = function (object, data, cell) {
								var n = domConstruct.create("div", {
									innerHTML:"status"
								});
								cell.appendChild(n);
							};

							// dgrid columns
							dgridColumns = [
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
							store = new Memory({
								data:result.results
							});
							dgrid = new (declare([OnDemandGrid, Pagination]))({
								store:store,
								rowsPerPage:6,
								pagingLinks:true,
								pagingTextBox:false,
								firstLastArrows:true,
								columns:dgridColumns,
								showHeader:true
							}, "grid");
							dgrid.startup();

							// item title click handler
							on(dgrid.domNode, ".title-column-title:click", function (event) {
								// selected row
								var selectedRow = dgrid.row(event).element;
								//
								selectedRowID = domAttr.get(selectedRow, "id").split("grid-row-")[1];
								// get row width
								var selectedNodeWidth = domStyle.get(selectedRow, "width") - 10;
								// set row height
								domStyle.set(selectedRow, "height", "600px");
								// set row background color
								domStyle.set(selectedRow, "background-color", "white");

								if (previousSelectedRow) {
									// collapse the previously selected row height
									updateNodeHeight(previousSelectedRow, COLLAPSE_ROW_HEIGHT);
									var categoryNodes = [];
									array.forEach(categoryIDs, function (category) {
										categoryNodes.push(category + previousSelectedRowID);
									});
									destroyNodes(EXPANDED_ROW_NAME + previousSelectedRowID,
											TAB_CONTAINER_NAME + previousSelectedRowID,
											TAB_CONTAINER_TITLE + previousSelectedRowID,
											TAB_CONTAINER_DESC + previousSelectedRowID,
											TAB_CONTAINER_SNIPPET + previousSelectedRowID,
											TAB_CONTAINER_LICENSE + previousSelectedRowID,
											TAB_CONTAINER_CREDITS + previousSelectedRowID,
											TAB_CONTAINER_CATEGORY + previousSelectedRowID,
											TAB_CONTAINER_TAGS + previousSelectedRowID,
											TAB_CONTAINER_USERNAME + previousSelectedRowID,
											TAB_CONTAINER_USERDESCRIPTION + previousSelectedRowID,
											categoryNodes,
											SAVE_BUTTON_NAME + previousSelectedRowID);
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
									domConstruct.place("<div id='" + rowID + "' style='width: " + selectedNodeWidth + "px;'>" +
											"<div class='content-container'>" +
											"<div id='map'></div>" +
											"<div style='margin-bottom: 5px; font-size: 0.9em;'>Some practical characteristics of your item must be present in order to nominate it for the Living Atlas.  A score of at least 80 is required before the map can be nominated.</div>" +
											"<div style='margin-bottom: 5px; font-size: 0.9em;'>Here is your item's current score. Click on the 'i' buttons for details on how to improve your score.</div>" +
											"<div class='section-header'>OVERALL</div>" +
											"<div class='overall-msg'>In the sections below, if the check box is green you have full-filled criteria,<br />" +
											"If the check box is red, please select that section and look for the items underlined to improve your score.</div>" +
											"<div id='" + tcID + "'></div>" +
											"<\/div>" +
											"<\/div>" +
											"<button id='" + btnID + "' type='button'></button>", selectedRow.firstElementChild, "last");

									// create the map
									portalUser.getItem(selectedRowID).then(function (item) {
										console.log(item);
										if (item.type === "Web Map") {
											var mapDrawBegin = performance.now();
											var mapDrawComplete;

											// Web Map, Feature Service, Map Service, Image Service, Web Mapping Application
											arcgisUtils.createMap(selectedRowID, "map").then(function (response) {
												map = response.map;
												// make sure map is loaded
												if (map.loaded) {
													console.log(map);
													mapDrawComplete = performance.now();
													var mapDrawTime = (mapDrawComplete - mapDrawBegin);
													var popUps = processPopupData(map);
													// -------------------------------------------------
													// TAB CONTAINER
													// -------------------------------------------------
													var tc = new TabContainer({
														style:{ width:selectedNodeWidth + "px" },
														className:"tab-container"
													}, tcID);
													// monitor and respond to changes in widget (Tab Container) properties
													tc.watch("selectedChildWidget", function (name, oval, nval) {
														// each tab container needs a different 'Save' button per the spec
														if (dijit.byId(btnID) !== undefined) {
															destroyBtn(btnID, selectedRow.firstElementChild);
														}

														if (nval.title === DETAILS) {
															// details
															saveButton = new Button({
																label:"SAVE",
																style:{
																	"position":"absolute",
																	"left":"50%"
																},
																onClick:function () {
																	domStyle.set(dom.byId("msg-overlay"), "display", "block");
																	// DETAILS
																	// http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#/Item/02r30000007w000000/
																	// The title of the item. This is the name that's displayed to users and by
																	// which they refer to the item. Every item must have a title.
																	var _title = dom.byId(TAB_CONTAINER_TITLE + selectedRowID).value;
																	// A short summary description of the item.
																	var _snippet = dom.byId(TAB_CONTAINER_SNIPPET + selectedRowID).value;
																	// Item description.
																	var _description = dom.byId(TAB_CONTAINER_DESC + selectedRowID).value;

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
																					if (response.success) {
																						domStyle.set(dom.byId("msg-overlay"), "display", "none");
																					}
																				});
																	});
																}
															}, btnID).startup();
														} else if (nval.title === USE_CREDITS) {
															// USE/CREDITS
															saveButton = new Button({
																label:"SAVE",
																style:{
																	"position":"absolute",
																	"left":"50%"
																},
																onClick:function () {
																	domStyle.set(dom.byId("msg-overlay"), "display", "block");
																	// ACCESS
																	// Any license information or restrictions.
																	var _license = dom.byId(TAB_CONTAINER_LICENSE + selectedRowID).value;
																	// Information on the source of the item.
																	var _credits = dom.byId(TAB_CONTAINER_CREDITS + selectedRowID).value;

																	portalUser.getItem(selectedRowID).then(function (results) {
																		console.log(results);
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
																					console.log(response);
																					if (response.success) {
																						domStyle.set(dom.byId("msg-overlay"), "display", "none");
																					}
																				});
																	});
																}
															}, btnID).startup();
														} else if (nval.title === TAGS) {
															// TAGS
															saveButton = new Button({
																label:"SAVE",
																style:{
																	"position":"absolute",
																	"left":"50%"
																},
																onClick:function () {
																	portalUser.getItem(selectedRowID).then(function (results) {
																		console.log(results);
																		console.log("TAGS");
																	});
																}
															}, btnID).startup();
														} else if (nval.title === PERFORMANCE) {
															// PERFORMANCE
															saveButton = new Button({
																label:"SAVE",
																style:{
																	"position":"absolute",
																	"left":"50%"
																},
																onClick:function () {
																	portalUser.getItem(selectedRowID).then(function (results) {
																		console.log(results);
																		console.log("PERFORMANCE");
																	});
																}
															}, btnID).startup();
														} else if (nval.title === MY_PROFILE) {
															// MY PROFILE
															saveButton = new Button({
																label:"SAVE",
																style:{
																	"position":"absolute",
																	"left":"50%"
																},
																onClick:function () {
																	domStyle.set(dom.byId("msg-overlay"), "display", "block");
																	var _fullName = processInput(dom.byId(TAB_CONTAINER_USERNAME + selectedRowID).value);
																	var _description = processInput(dom.byId(TAB_CONTAINER_USERDESCRIPTION + selectedRowID).value);
																	portalUser.getItem(selectedRowID).then(function (results) {
																		console.log(results);
																		var _portalUrl = results.portal.portalUrl;
																		var _community = "community/users/";
																		var _portalUser = results.owner;
																		esriRequest({
																			url:"https://www.arcgis.com/sharing/rest/community/users/" + _portalUser + "/update",
																			content:{
																				f:"json",
																				fullname:_fullName,
																				description:_description
																			}
																		}, {
																			usePost:true
																		}).then(function (response) {
																					console.log(response);
																					if (response.success) {
																						domStyle.set(dom.byId("msg-overlay"), "display", "none");
																					}
																				});
																	});
																}
															}, btnID).startup();
														}
													});

													if (dijit.byId(btnID) !== undefined) {
														destroyBtn(btnID, selectedRow.firstElementChild);
													} else {
														saveButton = new Button({
															label:"SAVE",
															style:{
																"position":"absolute",
																"left":"50%"
															},
															onClick:function () {
																domStyle.set(dom.byId("msg-overlay"), "display", "block");
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
																				console.log(response);
																				if (response.success) {
																					domStyle.set(dom.byId("msg-overlay"), "display", "none");
																				}
																			});
																});
															}
														}, btnID).startup();
													}

													// DETAILS
													detailsContentPane(tc, item, DETAILS, titleID, snippetID, descID);
													// USE/CREDITS
													useCreditsContentPane(tc, item, USE_CREDITS, accessID, creditID);
													// TAGS
													tagsContentPane(tc, item, TAGS, selectedRowID, categoryID, tagsID);
													// PERFORMANCE
													performanceContentPane(tc, item, PERFORMANCE, popUps, mapDrawTime);
													// MY PROFILE
													loadProfileContentPane(tc, item, MY_PROFILE, portalUser, userNameID, userDescriptionID);

													tc.startup();
													tc.resize();
												}
											});
										} else {
											// CityEngine Web Scene, Web Scene, Pro Map
											// -------------------------------------------------
											// TAB CONTAINER
											// -------------------------------------------------
											var tc = new TabContainer({
												style:{ width:selectedNodeWidth + "px" },
												className:"tab-container"
											}, tcID);
											// monitor and respond to changes in widget (Tab Container) properties
											tc.watch("selectedChildWidget", function (name, oval, nval) {
												// each tab container needs a different 'Save' button per the spec
												if (dijit.byId(btnID) !== undefined) {
													destroyBtn(btnID, selectedRow.firstElementChild);
												}

												if (nval.title === DETAILS) {
													// details
													saveButton = new Button({
														label:"SAVE",
														style:{
															"position":"absolute",
															"left":"50%"
														},
														onClick:function () {
															domStyle.set(dom.byId("msg-overlay"), "display", "block");
															// DETAILS
															// http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#/Item/02r30000007w000000/
															// The title of the item. This is the name that's displayed to users and by
															// which they refer to the item. Every item must have a title.
															var _title = dom.byId(TAB_CONTAINER_TITLE + selectedRowID).value;
															// A short summary description of the item.
															var _snippet = dom.byId(TAB_CONTAINER_SNIPPET + selectedRowID).value;
															// Item description.
															var _description = dom.byId(TAB_CONTAINER_DESC + selectedRowID).value;

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
																			if (response.success) {
																				domStyle.set(dom.byId("msg-overlay"), "display", "none");
																			}
																		});
															});
														}
													}, btnID).startup();
												} else if (nval.title === USE_CREDITS) {
													// USE/CREDITS
													saveButton = new Button({
														label:"SAVE",
														style:{
															"position":"absolute",
															"left":"50%"
														},
														onClick:function () {
															domStyle.set(dom.byId("msg-overlay"), "display", "block");
															// ACCESS
															// Any license information or restrictions.
															var _license = dom.byId(TAB_CONTAINER_LICENSE + selectedRowID).value;
															// Information on the source of the item.
															var _credits = dom.byId(TAB_CONTAINER_CREDITS + selectedRowID).value;

															portalUser.getItem(selectedRowID).then(function (results) {
																console.log(results);
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
																			console.log(response);
																			if (response.success) {
																				domStyle.set(dom.byId("msg-overlay"), "display", "none");
																			}
																		});
															});
														}
													}, btnID).startup();
												} else if (nval.title === TAGS) {
													// TAGS
													saveButton = new Button({
														label:"SAVE",
														style:{
															"position":"absolute",
															"left":"50%"
														},
														onClick:function () {
															portalUser.getItem(selectedRowID).then(function (results) {
																console.log(results);
																console.log("TAGS");
															});
														}
													}, btnID).startup();
												} else if (nval.title === PERFORMANCE) {
													// PERFORMANCE
													saveButton = new Button({
														label:"SAVE",
														style:{
															"position":"absolute",
															"left":"50%"
														},
														onClick:function () {
															portalUser.getItem(selectedRowID).then(function (results) {
																console.log(results);
																console.log("PERFORMANCE");
															});
														}
													}, btnID).startup();
												} else if (nval.title === MY_PROFILE) {
													// MY PROFILE
													saveButton = new Button({
														label:"SAVE",
														style:{
															"position":"absolute",
															"left":"50%"
														},
														onClick:function () {
															domStyle.set(dom.byId("msg-overlay"), "display", "block");
															var _fullName = processInput(dom.byId(TAB_CONTAINER_USERNAME + selectedRowID).value);
															var _description = processInput(dom.byId(TAB_CONTAINER_USERDESCRIPTION + selectedRowID).value);
															portalUser.getItem(selectedRowID).then(function (results) {
																console.log(results);
																var _portalUrl = results.portal.portalUrl;
																var _community = "community/users/";
																var _portalUser = results.owner;
																esriRequest({
																	url:"https://www.arcgis.com/sharing/rest/community/users/" + _portalUser + "/update",
																	content:{
																		f:"json",
																		fullname:_fullName,
																		description:_description
																	}
																}, {
																	usePost:true
																}).then(function (response) {
																			console.log(response);
																			if (response.success) {
																				domStyle.set(dom.byId("msg-overlay"), "display", "none");
																			}
																		});
															});
														}
													}, btnID).startup();
												}
											});

											if (dijit.byId(btnID) !== undefined) {
												destroyBtn(btnID, selectedRow.firstElementChild);
											} else {
												saveButton = new Button({
													label:"SAVE",
													style:{
														"position":"absolute",
														"left":"50%"
													},
													onClick:function () {
														domStyle.set(dom.byId("msg-overlay"), "display", "block");
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
																		console.log(response);
																		if (response.success) {
																			domStyle.set(dom.byId("msg-overlay"), "display", "none");
																		}
																	});
														});
													}
												}, btnID).startup();
											}

											// DETAILS
											detailsContentPane(tc, item, DETAILS, titleID, snippetID, descID);
											// USE/CREDITS
											useCreditsContentPane(tc, item, USE_CREDITS, accessID, creditID);
											// TAGS
											tagsContentPane(tc, item, TAGS, selectedRowID, categoryID, tagsID);
											// PERFORMANCE
											performanceContentPane(tc, item, PERFORMANCE, "", "");
											// MY PROFILE
											loadProfileContentPane(tc, item, MY_PROFILE, portalUser, userNameID, userDescriptionID);

											tc.startup();
											tc.resize();
										}
									});

								}
							});
						} else {
							console.log("no results");
						}
					});*/
				}));
			} else {
				portal.signOut().then(function (portalInfo) {
					signInLink.innerHTML = "Sign In";
				});
			}
		},

		/**
		 *
		 * @param error
		 */
		reportError:function (error) {
			// remove loading class from body
			domClass.remove(document.body, "app-loading");
			domClass.add(document.body, "app-error");
			// an error occurred - notify the user. In this example we pull the string from the
			// resource.js file located in the nls folder because we've set the application up
			// for localization. If you don't need to support multiple languages you can hardcode the
			// strings here and comment out the call in index.html to get the localization strings.
			// set message
			var node = dom.byId("loading_message");
			if (node) {
				if (this.config && this.config.i18n) {
					node.innerHTML = this.config.i18n.map.error + ": " + error.message;
				} else {
					node.innerHTML = "Unable to create map: " + error.message;
				}
			}
		},

		// create a map based on the input web map id
		_createWebMap:function (itemInfo) {
			var lat, lng, lod;

			if (this.sharingUtils.urlQueryObject) {
				lat = this.sharingUtils.urlQueryObject.lat;
				lng = this.sharingUtils.urlQueryObject.lng;
				lod = this.sharingUtils.urlQueryObject.zl;
			} else {
				lat = this.config.BASEMAP_INIT_LAT;
				lng = this.config.BASEMAP_INIT_LNG;
				lod = this.config.BASEMAP_INIT_ZOOM;
			}

			arcgisUtils.createMap(itemInfo, "mapDiv", {
				mapOptions:{
					// Optionally define additional map config here for example you can
					// turn the slider off, display info windows, disable wraparound 180, slider position and more.
					center:[lng, lat],
					zoom:lod
				},
				bingMapsKey:this.config.bingKey
			}).then(lang.hitch(this, function (response) {
				// Once the map is created we get access to the response which provides important info
				// such as the map, operational layers, popup info and more. This object will also contain
				// any custom options you defined for the template. In this example that is the 'theme' property.
				// Here' we'll use it to update the application to match the specified color theme.
				// console.log(this.config);
				this.map = response.map;
				// make sure map is loaded
				if (this.map.loaded) {
					// do something with the map
					this._mapLoaded();
				} else {
					on.once(this.map, "load", lang.hitch(this, function () {
						// do something with the map
						this._mapLoaded();
					}));
				}
			}), this.reportError);
		},

		// Map is ready
		_mapLoaded:function () {
			// remove loading class from body
			domClass.remove(document.body, "app-loading");

			if (this.sharingUtils.urlQueryObject !== null) {
				var _mp = new Point([this.sharingUtils.urlQueryObject.clickLat, this.sharingUtils.urlQueryObject.clickLng], new SpatialReference({
					wkid:102100
				}));
				// add crosshair
				this.userInterfaceUtils.addCrosshair(_mp);
			}

			//// external logic ////
			// Load the Geocoder Dijit
			this._initGeocoderDijit("geocoder");

			on(this.map, "click", lang.hitch(this, this.mapUtils.mapClickHandler));
			on(this.map, "extent-change", lang.hitch(this, this.mapUtils.mapExtentChangeHandler));
			on(this.map, "update-start", lang.hitch(this, this.mapUtils.updateStartHandler));
			on(this.map, "update-end", lang.hitch(this, this.mapUtils.updateEndHandler));
			on(document, ".share_facebook:click", lang.hitch(this, this.sharingUtils.shareFacebook));
			on(document, ".share_twitter:click", lang.hitch(this, this.sharingUtils.shareTwitter));
			on(document, ".share_bitly:click", lang.hitch(this, this.sharingUtils.requestBitly));
			on(document, "click", lang.hitch(this, this.sharingUtils.documentClickHandler));

			this.mapUtils.currentMapExtent = this.map.extent;
			this._initUrlParamData(this.sharingUtils.urlQueryObject);
		},

		_initUrlParamData:function (urlQueryObject) {
			if (urlQueryObject) {

				var _mp = new Point([urlQueryObject.clickLat, urlQueryObject.clickLng], new SpatialReference({
					wkid:102100
				}));

				if (urlQueryObject.oids.length > 0) {
					var qt = new QueryTask(this.config.IMAGE_SERVER);
					var q = new Query();
					q.returnGeometry = true;
					q.outFields = this.config.OUTFIELDS;
					q.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
					if (this.config.QUERY_GEOMETRY === "MAP_POINT") {
						q.geometry = _mp;
					} else {
						q.geometry = this.mapUtils.currentMapExtent.expand(this.config.EXTENT_EXPAND);
					}

					var deferreds = [];
					// we need to fire off a query for 'each' OID, not all at once
					array.forEach(urlQueryObject.oids.split("|"), function (oid) {
						//var deferred = new Deferred();
						q.where = "OBJECTID = " + oid;
						var deferred = qt.execute(q).addCallback(function (rs) {
							return rs.features[0];
						});
						deferreds.push(deferred);
					});// END forEach

					var layers = [];
					all(deferreds).then(lang.hitch(this, function (results) {
						var downloadIds = urlQueryObject.dlids.split("|");
						array.forEach(results, lang.hitch(this, function (feature, index) {
							var objID = feature.attributes.OBJECTID;
							var mapName = feature.attributes[this.config.ATTRIBUTE_MAP_NAME];
							var extent = feature.geometry.getExtent();
							var dateCurrent = new Date(feature.attributes[this.config.ATTRIBUTE_DATE]);

							if (dateCurrent === undefined || dateCurrent === null || dateCurrent === "") {
								dateCurrent = this.config.MSG_UNKNOWN;
							}

							var scale = feature.attributes[this.config.ATTRIBUTE_SCALE];
							var scaleLabel = number.format(scale, {
								places:0
							});
							var lodThreshold = this.timelineLegendUtils.setLodThreshold(scale, this.config.TIMELINE_LEGEND_VALUES, this.timelineLegendUtils.nScales, this.timelineLegendUtils.minScaleValue, this.timelineLegendUtils.maxScaleValue);

							var mosaicRule = new MosaicRule({
								"method":MosaicRule.METHOD_CENTER,
								"ascending":true,
								"operation":MosaicRule.OPERATION_FIRST,
								"where":"OBJECTID = " + objID
							});
							params = new ImageServiceParameters();
							params.noData = 0;
							params.mosaicRule = mosaicRule;
							imageServiceLayer = new ArcGISImageServiceLayer(this.config.IMAGE_SERVER, {
								imageServiceParameters:params,
								opacity:1.0
							});
							layers.push(imageServiceLayer);

							this.gridUtils.store.put({
								id:"1",
								objID:objID,
								layer:imageServiceLayer,
								name:mapName,
								imprintYear:dateCurrent,
								scale:scale,
								scaleLabel:scaleLabel,
								lodThreshold:lodThreshold,
								downloadLink:this.config.DOWNLOAD_PATH + downloadIds[index],
								extent:extent
							});
						}));// End forEach
						return layers.reverse();
					})).then(lang.hitch(this, function (layers) {
						array.forEach(layers, lang.hitch(this, function (layer, index) {
							this.map.addLayer(layer, index + 1);
						}));
					}));// END all

					// expand height of timeline parent container
					this.userInterfaceUtils.updateTimelineContainerHeight(timelineHeight);
					this.userInterfaceUtils.hideStep(".stepOne", "");
					this.userInterfaceUtils.showGrid();
					this.timelineUtils.runQuery(this.mapUtils.currentMapExtent, _mp, urlQueryObject.zl);
				} else {
					// TODO there are no OID's, check if the timeline was visible
					if (_mp) {
						this.timelineUtils.runQuery(this.mapUtils.currentMapExtent, _mp, urlQueryObject.zl);
					}
				}
			}
		},

		_initGeocoderDijit:function (srcRef) {
			var geocoder = new Geocoder({
				map:this.map,
				autoComplete:true,
				showResults:true,
				searchDelay:250,
				arcgisGeocoder:{
					placeholder:"Find a place"
				}
			}, srcRef);
			geocoder.startup();
		},

		_displayControls: function() {
			var sortFilterContainer = dom.byId("filter-container");
			domStyle.set(sortFilterContainer, "display", "block");
			domStyle.set(sortFilterContainer, "opacity", "0");
			var fadeArgs = {
				node:"filter-container"
			};
			fx.fadeIn(fadeArgs).play();
		}
	});
});