define([
	"dojo/ready",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/fx",
	"dojo/_base/lang",
	"dojo/Deferred",
	"dojo/dom",
	"dojo/dom-attr",
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
	"dgrid/extensions/Pagination",
	"dgrid/OnDemandGrid",
	"dgrid/Keyboard",
	"dgrid/Selection",
	"dijit/Editor",
	"dijit/form/Button",
	"dijit/form/CheckBox",
	"dijit/form/ComboBox",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane",
	"dijit/layout/TabContainer",
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
	"esri/request",
	"esri/tasks/query",
	"esri/tasks/QueryTask",
	"esri/urlUtils",
	"application/uiUtils",
	"application/gridUtils",
	"application/timelineLegendUtils",
	"application/sharingUtils",
	"application/mapUtils",
	"application/timelineUtils"
], function (ready, array, declare, fx, lang, Deferred, dom, domAttr, domClass, domConstruct, domGeom, domStyle, json, number, on, parser, all, query, Memory, Pagination, OnDemandGrid, Keyboard, Selection, Editor, Button, CheckBox, ComboBox, BorderContainer, ContentPane, TabContainer, registry, arcgisPortal, arcgisUtils, Geocoder, Point, SpatialReference, ArcGISImageServiceLayer, ImageServiceParameters, MosaicRule, Map, esriRequest, Query, QueryTask, urlUtils, UserInterfaceUtils, GridUtils, TimelineLegendUtils, SharingUtils, MappingUtils, TimelineUtils) {
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
		portalUser:{},
		owner:"",

		selectedRowID: "",
		selectedItemType:"",
		selectedRow : "",
		previousSelectedRow : "",
		previousSelectedRowID : "",

		filterItemTypeStore:{},
		// Dijit Editor for the description section
		descriptionEditor : "",
		// Dijit Editor for the access and user constraints editor
		accessUseConstraintsEditor : "",

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
					dom.byId("init-screen-msg").innerHTML = this.config.INTRO_TEXT;
					portalUrl = document.location.protocol + '//www.arcgis.com';
					portal = new arcgisPortal.Portal(portalUrl);

					on(portal, "ready", lang.hitch(this, function (p) {
						dom.byId(this.config.SIGNIN_BUTTON_ID).disabled = false;
						on(dom.byId(this.config.SIGNIN_BUTTON_ID), "click", lang.hitch(this, this.signIn));
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
			var signInLink = dom.byId(this.config.SIGNIN_BUTTON_ID);
			if (signInLink.innerHTML.indexOf("APPS") !== -1) {
				portal.signIn().then(lang.hitch(this, function (user) {
					dom.byId("init-screen-msg").innerHTML = this.config.INTRO_AUTHENTICATED_TEXT;
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
						if (result.total > 0) {
							// thumbnail cell renderer
							var thumbnailRenderCell = lang.hitch(this, function (object, data, cell) {
								var thumbnailUrl = this._formatThumbnailUrl(object);
								var n = domConstruct.create("div", {
									innerHTML:'<div class="thumbnail"><img src="' + thumbnailUrl + '" />'
								});
								cell.appendChild(n);
							});
							// title cell renderer
							var titleRenderCell = lang.hitch(this, function (object, data, cell) {
								var snippet = this._formatSnippet(object.snippet);
								var type = this._formatSnippet(object.type);
								var modifiedDate = this._formatDate(object.modified);
								var n = domConstruct.create("div", {
									innerHTML:'<div class="title-column-container">' +
											'<div class="title-column-title">' + object.title + '</div>' +
											'<div class="title-column-modified" style="position: relative; top: 70px;">Modified: ' + modifiedDate + '<span style="position: absolute; left: 300px;">' + type + '</span></div>' +
											'<div class="title-column-snippet" style="position: relative; top: -20px;">' + snippet + '</div>' +
											'</div>'
								});
								cell.appendChild(n);
							});
							// status cell renderer
							var statusRenderCell = lang.hitch(this, function (object, data, cell) {
								var n = domConstruct.create("div", {
									innerHTML:"status"
								});
								cell.appendChild(n);
							});

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

							on(dgrid.domNode, ".title-column-title:click", lang.hitch(this, function (event) {
								// selected row
								var selectedRow = dgrid.row(event).element;
								//
								this.selectedRowID = domAttr.get(selectedRow, "id").split("grid-row-")[1];
								// get row width
								var selectedNodeWidth = domStyle.get(selectedRow, "width") - 10;
								// set row height
								domStyle.set(selectedRow, "height", "600px");
								// set row background color
								domStyle.set(selectedRow, "background-color", "white");

								if (this.previousSelectedRow) {
									console.log(this.previousSelectedRow)
									// collapse the previously selected row height
									this._updateNodeHeight(this.previousSelectedRow, this.config.COLLAPSE_ROW_HEIGHT);
									var categoryNodes = [];
									array.forEach(this.config.categoryIDs, function (category) {
										categoryNodes.push(category + this.previousSelectedRowID);
									});

									this._destroyNodes(this.config.EXPANDED_ROW_NAME + this.previousSelectedRowID,
											this.config.TAB_CONTAINER_NAME + this.previousSelectedRowID,
											this.config.TAB_CONTAINER_TITLE + this.previousSelectedRowID,
											this.config.TAB_CONTAINER_DESC + this.previousSelectedRowID,
											this.config.TAB_CONTAINER_SNIPPET + this.previousSelectedRowID,
											this.config.TAB_CONTAINER_LICENSE + this.previousSelectedRowID,
											this.config.TAB_CONTAINER_CREDITS + this.previousSelectedRowID,
											this.config.TAB_CONTAINER_CATEGORY + this.previousSelectedRowID,
											this.config.TAB_CONTAINER_TAGS + this.previousSelectedRowID,
											this.config.TAB_CONTAINER_USERNAME + this.previousSelectedRowID,
											this.config.TAB_CONTAINER_USERDESCRIPTION + this.previousSelectedRowID,
											categoryNodes,
											this.config.SAVE_BUTTON_NAME + this.previousSelectedRowID);
									if (this.previousSelectedRowID === this.selectedRowID) {
										this.previousSelectedRowID = "";
										this.previousSelectedRow = null;
									} else {
										// expand selected row height
										this._updateNodeHeight(selectedRow, this.config.EXPAND_ROW_HEIGHT);
										this.previousSelectedRow = selectedRow;
									}
								} else {
									this._updateNodeHeight(selectedRow, this.EXPAND_ROW_HEIGHT);
									this.previousSelectedRow = selectedRow;
								}

								if (this.previousSelectedRowID !== this.selectedRowID && this.previousSelectedRow !== null) {
									this.previousSelectedRowID = this.selectedRowID;
									// unique id's
									var rowID = this.config.EXPANDED_ROW_NAME + this.selectedRowID;
									var btnID = this.config.SAVE_BUTTON_NAME + this.selectedRowID;
									var tcID = this.config.TAB_CONTAINER_NAME + this.selectedRowID;
									var titleID = this.config.TAB_CONTAINER_TITLE + this.selectedRowID;
									var descID = this.config.TAB_CONTAINER_DESC + this.selectedRowID;
									var snippetID = this.config.TAB_CONTAINER_SNIPPET + this.selectedRowID;
									var accessID = this.config.TAB_CONTAINER_LICENSE + this.selectedRowID;
									var creditID = this.config.TAB_CONTAINER_CREDITS + this.selectedRowID;
									var categoryID = this.config.TAB_CONTAINER_CATEGORY + this.selectedRowID;
									var tagsID = this.config.TAB_CONTAINER_TAGS + this.selectedRowID;
									var userNameID = this.config.TAB_CONTAINER_USERNAME + this.selectedRowID;
									var userDescriptionID = this.config.TAB_CONTAINER_USERDESCRIPTION + this.selectedRowID;
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
									portalUser.getItem(this.selectedRowID).then(lang.hitch(this, function (item) {
										if (item.type === "Web Map") {
											var mapDrawBegin = performance.now();
											var mapDrawComplete;

											// Web Map, Feature Service, Map Service, Image Service, Web Mapping Application
											arcgisUtils.createMap(this.selectedRowID, "map").then(function (response) {
												map = response.map;
												// make sure map is loaded
												if (map.loaded) {
													mapDrawComplete = performance.now();
													var mapDrawTime = (mapDrawComplete - mapDrawBegin);
													var popUps = this._processPopupData(map);
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
															this._destroyBtn(btnID, selectedRow.firstElementChild);
														}

														if (nval.title === this.DETAILS) {
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
																	var _title = dom.byId(this.TAB_CONTAINER_TITLE + this.selectedRowID).value;
																	// A short summary description of the item.
																	var _snippet = dom.byId(this.TAB_CONTAINER_SNIPPET + this.selectedRowID).value;
																	// Item description.
																	var _description = dom.byId(this.TAB_CONTAINER_DESC + this.selectedRowID).value;

																	portalUser.getItem(this.selectedRowID).then(function (results) {
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
														} else if (nval.title === this.USE_CREDITS) {
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
																	var _license = dom.byId(this.TAB_CONTAINER_LICENSE + this.selectedRowID).value;
																	// Information on the source of the item.
																	var _credits = dom.byId(this.TAB_CONTAINER_CREDITS + this.selectedRowID).value;

																	portalUser.getItem(this.selectedRowID).then(function (results) {
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
																					if (response.success) {
																						domStyle.set(dom.byId("msg-overlay"), "display", "none");
																					}
																				});
																	});
																}
															}, btnID).startup();
														} else if (nval.title === this.TAGS) {
															// TAGS
															saveButton = new Button({
																label:"SAVE",
																style:{
																	"position":"absolute",
																	"left":"50%"
																},
																onClick:function () {
																	portalUser.getItem(this.selectedRowID).then(function (results) {

																	});
																}
															}, btnID).startup();
														} else if (nval.title === this.PERFORMANCE) {
															// PERFORMANCE
															saveButton = new Button({
																label:"SAVE",
																style:{
																	"position":"absolute",
																	"left":"50%"
																},
																onClick:function () {
																	portalUser.getItem(this.selectedRowID).then(function (results) {

																	});
																}
															}, btnID).startup();
														} else if (nval.title === this.MY_PROFILE) {
															// MY PROFILE
															saveButton = new Button({
																label:"SAVE",
																style:{
																	"position":"absolute",
																	"left":"50%"
																},
																onClick:function () {
																	domStyle.set(dom.byId("msg-overlay"), "display", "block");
																	var _fullName = this._processInput(dom.byId(this.TAB_CONTAINER_USERNAME + this.selectedRowID).value);
																	var _description = this._processInput(dom.byId(this.TAB_CONTAINER_USERDESCRIPTION + this.selectedRowID).value);
																	portalUser.getItem(this.selectedRowID).then(function (results) {
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
														this._destroyBtn(btnID, selectedRow.firstElementChild);
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
																var _title = dom.byId(this.TAB_CONTAINER_TITLE + this.selectedRowID).value;
																// A short summary description of the item.
																var _snippet = dom.byId(this.TAB_CONTAINER_SNIPPET + this.selectedRowID).value;
																// Item description.
																var _description = dijit.byId(this.TAB_CONTAINER_DESC + this.selectedRowID).value;

																portalUser.getItem(this.selectedRowID).then(function (results) {
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
													}

													// DETAILS
													detailsContentPane(tc, item, config.DETAILS, titleID, snippetID, descID);
													// USE/CREDITS
													useCreditsContentPane(tc, item, config.USE_CREDITS, accessID, creditID);
													// TAGS
													tagsContentPane(tc, item, config.TAGS, this.selectedRowID, categoryID, tagsID);
													// PERFORMANCE
													performanceContentPane(tc, item, config.PERFORMANCE, popUps, mapDrawTime);
													// MY PROFILE
													loadProfileContentPane(tc, item, config.MY_PROFILE, portalUser, userNameID, userDescriptionID);

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
											tc.watch("selectedChildWidget", lang.hitch(this, function (name, oval, nval) {
												// each tab container needs a different 'Save' button per the spec
												if (dijit.byId(btnID) !== undefined) {
													this._destroyBtn(btnID, selectedRow.firstElementChild);
												}

												if (nval.title === this.DETAILS) {
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
															var _title = dom.byId(this.TAB_CONTAINER_TITLE + this.selectedRowID).value;
															// A short summary description of the item.
															var _snippet = dom.byId(this.TAB_CONTAINER_SNIPPET + this.selectedRowID).value;
															// Item description.
															var _description = dom.byId(this.TAB_CONTAINER_DESC + this.selectedRowID).value;

															portalUser.getItem(this.selectedRowID).then(function (results) {
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
												} else if (nval.title === this.config.USE_CREDITS) {
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
															var _license = dom.byId(this.TAB_CONTAINER_LICENSE + this.selectedRowID).value;
															// Information on the source of the item.
															var _credits = dom.byId(this.TAB_CONTAINER_CREDITS + this.selectedRowID).value;

															portalUser.getItem(this.selectedRowID).then(function (results) {
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
												} else if (nval.title === this.config.TAGS) {
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
												} else if (nval.title === this.config.PERFORMANCE) {
													// PERFORMANCE
													saveButton = new Button({
														label:"SAVE",
														style:{
															"position":"absolute",
															"left":"50%"
														},
														onClick:function () {
															portalUser.getItem(this.selectedRowID).then(function (results) {
																console.log(results);
																console.log("PERFORMANCE");
															});
														}
													}, btnID).startup();
												} else if (nval.title === this.config.MY_PROFILE) {
													// MY PROFILE
													saveButton = new Button({
														label:"SAVE",
														style:{
															"position":"absolute",
															"left":"50%"
														},
														onClick:function () {
															domStyle.set(dom.byId("msg-overlay"), "display", "block");
															var _fullName = processInput(dom.byId(this.TAB_CONTAINER_USERNAME + this.selectedRowID).value);
															var _description = processInput(dom.byId(this.TAB_CONTAINER_USERDESCRIPTION + this.selectedRowID).value);
															portalUser.getItem(this.selectedRowID).then(function (results) {
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
											}));

											if (dijit.byId(btnID) !== undefined) {
												this._destroyBtn(btnID, selectedRow.firstElementChild);
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
														var _title = dom.byId(this.TAB_CONTAINER_TITLE + this.selectedRowID).value;
														// A short summary description of the item.
														var _snippet = dom.byId(this.TAB_CONTAINER_SNIPPET + this.selectedRowID).value;
														// Item description.
														var _description = dijit.byId(this.TAB_CONTAINER_DESC + this.selectedRowID).value;

														portalUser.getItem(this.selectedRowID).then(function (results) {
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
											this.detailsContentPane(tc, item, this.config.DETAILS, titleID, snippetID, descID);
											// USE/CREDITS
											this.useCreditsContentPane(tc, item, this.config.USE_CREDITS, accessID, creditID);
											// TAGS
											this.tagsContentPane(tc, item, this.config.TAGS, this.config.selectedRowID, categoryID, tagsID);
											// PERFORMANCE
											this.performanceContentPane(tc, item, this.config.PERFORMANCE, "", "");
											// MY PROFILE
											this.loadProfileContentPane(tc, item, this.config.MY_PROFILE, portalUser, userNameID, userDescriptionID);

											tc.startup();
											tc.resize();
										}
									}));

								}
							}));
						} else {
							console.log("NO RESULTS");
						}
					}));
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

		_displayControls:function () {
			var sortFilterContainer = dom.byId("filter-container");
			domStyle.set(sortFilterContainer, "display", "block");
			domStyle.set(sortFilterContainer, "opacity", "0");
			var fadeArgs = {
				node:"filter-container"
			};
			fx.fadeIn(fadeArgs).play();
		},

		_formatThumbnailUrl:function (obj) {
			var thumbnailUrl = "";
			if (obj.largeThumbnail !== null) {
				thumbnailUrl = obj.largeThumbnail;
			} else if (obj.thumbnailUrl !== null) {
				thumbnailUrl = obj.thumbnailUrl;
			} else {
				thumbnailUrl = location.protocol + "//" + location.hostname + location.pathname + "img/nullThumbnail.png";
			}
			return thumbnailUrl;
		},

		_formatSnippet:function (str) {
			if (str === null || "") {
				return "";
			} else {
				return str;
			}
		},

		_formatDate:function (date) {
			var d = new Date(date);
			if (d.isNaN) {
				return "";
			} else {
				var month = this.config.monthNames[d.getMonth()]
				return month + " " + d.getDate() + ", " + d.getFullYear()
			}
		},

		_destroyBtn:function(id, anchorNode) {
			dijit.byId(id).destroy();
			// create new button
			domConstruct.place("<button id='" + id + "' type='button'></button>", anchorNode, "last");
		},

		_formatTitle:function(str) {
			if (str === null || "")
				return "";
			else
				return str;
		},

		_formatDescription:function(str) {
			if (str === null || "")
				return "";
			else
				return str;
		},

		_updateNodeHeight:function(node, height) {
			domStyle.set(node, "height", height + "px");
		},

		_addContentPane:function(_region, _className, _content) {
			return new ContentPane({
				region:_region,
				className:_className,
				content:_content
			});
		},

		_destroyNodes:function(contentNodeName, tabContainer, titlePane, descPane, snippetPane, accessPane, creditPane, categoryPane, tagsPane, usernamePane, userdescPane, categoryNodes, btnNode) {
			domConstruct.destroy(contentNodeName);
			dijit.byId(btnNode).destroy();
			dijit.byId(tabContainer).destroy();

			dijit.byId(titlePane).destroy();
			dijit.byId(descPane).destroy();
			dijit.byId(snippetPane).destroy();
			dijit.byId(accessPane).destroy();
			dijit.byId(creditPane).destroy();
			//dijit.byId(categoryPane).destroy();
			dijit.byId(tagsPane).destroy();
			dijit.byId(usernamePane).destroy();
			dijit.byId(userdescPane).destroy();

			array.forEach(categoryNodes, function (category) {
				dijit.byId(category).destroy();
			});
		},

		_processSharing:function(item) {
			return item.access
		},

		_processMapDrawTime:function(val) {
			var temp = (val/1000) % 60;
			var seconds = number.format(temp, {
    			places: 5
  			});
    		if (seconds) {
				return seconds + " seconds";
    		} else {
				return "N/A";
			}
    	},

		_processlayerCount:function(item) {
			return "N/A";
		},

		_processPopupData:function(map) {
			if (map.popupManager.enabled) {
				return "Popups are enabled"
			} else {
				return "Popups are disabled"
			}
		},

		_processInput:function(txt) {
			var nChars = txt.length;
			if (nChars < 1) {
				return "";
			} else {
				return txt;
			}
		},

		detailsContentPane:function(tabContainer, item, tabTitle, titleID, snippetID, descID) {
			// item title
			var itemTitle = this._formatTitle(item.title);
			// item summary
			var itemSummary = this._formatSnippet(item.snippet);
			// item description
			var itemDescription = this._formatDescription(item.description);
			// thumbnail url
			var thumbnailUrl = this._formatThumbnailUrl(item);

			// DETAILS CONTAINER
			var detailsContainer = new BorderContainer({
				title:tabTitle,
				selected:true
			});
			// TOP PANE
			var topPane = this._addContentPane("top", "tab-container-top-pane", "<div class='selected-tab-ribbon'>" + this.config.DETAILS + "</div>");
			detailsContainer.addChild(topPane);
			// THUMBNAIL
			var thumbnailPane = new ContentPane({
				region:"",
				className:"tab-container-thumbnail-pane",
				content:"<div class='section-header'>THUMBNAIL<img class='info-icon' src='img/info.png'><\/div>" +
						"<img src='" + thumbnailUrl + "' height='85px'>"
			});
			topPane.addChild(thumbnailPane);
			// TITLE AND SUMMARY PANE
			var titleAndSummaryPane = this._addContentPane("", "tab-container-title-summary-pane", "");
			topPane.addChild(titleAndSummaryPane);
			// TITLE
			titleAndSummaryPane.addChild(new ContentPane({
				region:"",
				className:"tab-container-title-pane",
				content:"<div class='section-header'>TITLE <img class='info-icon' src='img/info.png'><span class='section-header-message'>" + this.MAXIMUM_CHAR + "<\/span><\/div>" +
						"<div class='section-content'>" +
						"<input type='text' name='title-textbox' value='" + itemTitle + "' data-dojo-type='dijit/form/TextBox' id='" + titleID + "' />"
			}));
			// SUMMARY
			titleAndSummaryPane.addChild(new ContentPane({
				region:"",
				className:"tab-container-summary-pane",
				content:"<div class='section-header'>SUMMARY <img class='info-icon' src='img/info.png'>" +
						"<span class='section-header-message'>" + this.MAXIMUM_CHAR + "<\/span><\/div>" +
						"<div class='section-content'>" +
						"<textarea id='" + snippetID + "' data-dojo-type='dijit/form/SimpleTextarea' rows='4' cols='50' style='width:66%;'>" + itemSummary
			}));
			// DESCRIPTION
			detailsContainer.addChild(new ContentPane({
				region:"center",
				className:"tab-container-description-pane",
				content:"<div class='section-header'>DESCRIPTION <img class='info-icon' src='img/info.png'>" +
						"<span class='section-header-message'>" + this.MAXIMUM_CHAR + "<\/span><\/div>" +
						"<div class='section-content'>" +
						"<div id='" + descID + "' data-dojo-type='dijit/Editor' name='editorContent'>" + itemDescription + "</div>" +
						"</div>"
			}));

			descriptionEditor = new Editor({
				height:"50px"
			}, dom.byId(descID));
			descriptionEditor.startup();

			detailsContainer.startup();
			tabContainer.addChild(detailsContainer);
		},

		useCreditsContentPane:function(tabContainer, item, tabTitle, accessID, creditID) {
			// license information
			var licenseInfo = this._formatTitle(item.licenseInfo);
			// credit
			var credit = this._formatTitle(item.accessInformation);

			// USE/CREDIT CONTAINER (Access and Use Constraints)
			var creditsContainer = new BorderContainer({
				title:tabTitle,
				selected:false
			});
			// TOP PANE
			var topPane = this._addContentPane("top", "tab-container-top-pane", "<div class='selected-tab-ribbon'>" + this.config.USE_CREDITS + "</div>");
			creditsContainer.addChild(topPane);
			// LICENSE
			var accessPane = new ContentPane({
				region:"center",
				className:"tab-container-description-pane",
				content:"<div class='section-header'>ACCESS AND USE CONSTRAINTS<img class='info-icon' src='img/info.png'><\/div>" +
						"<div class='section-content'>" +
						"<div id='" + accessID + "' data-dojo-type='dijit/Editor' name='editorContent'>" + licenseInfo + "</div>" +
						"</div>"
			});
			accessUseConstraintsEditor = new Editor({
				height:"50px"
			}, dom.byId(accessID));
			accessUseConstraintsEditor.startup();
			// CREDIT
			var creditsPane = new ContentPane({
				region:"center",
				className:"tab-container-description-pane",
				content:"<div class='section-header'>CREDITS<img class='info-icon' src='img/info.png'>" +
						"<\/div>" +
						"<div class='section-content'><textarea id='" + creditID + "' data-dojo-type='dijit/form/SimpleTextarea' rows='5' cols='50' style='width:95%;'>" + credit
			});

			topPane.addChild(accessPane);
			topPane.addChild(creditsPane);

			creditsContainer.startup();
			tabContainer.addChild(creditsContainer);
		},

		tagsContentPane:function(tabContainer, item, tabTitle, selectedRowID, categoryID, tagsID) {
			// existing tags
			var itemTags = item.tags;

			// TAGS CONTAINER
			var tagsContainer = new BorderContainer({
				title:tabTitle,
				selected:false
			});
			var topPane = this._addContentPane("top", "tab-container-top-pane", "<div class='selected-tab-ribbon'>" + this.config.TAGS + "</div>");
			tagsContainer.addChild(topPane);
			topPane.addChild(new ContentPane({
				region:"center",
				className:"tab-container-description-pane",
				content:"<div class='section-header'>Select at least one of the following categories<img class='info-icon' src='img/info.png'><\/div>" +
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
			tabContainer.addChild(tagsContainer);

			array.forEach(this.categoryIDs, function (id) {
				addCheckbox(id + selectedRowID);
			});
		},

		performanceContentPane:function(tabContainer, item, tabTitle, popUps, mapDrawTime) {
			// PERFORMANCE CONTAINER
			var performanceContainer = new BorderContainer({
				title:tabTitle,
				selected:false
			});
			// TOP PANE
			var topPane = this._addContentPane("top", "tab-container-top-pane", "<div class='selected-tab-ribbon'>" + this.config.PERFORMANCE + "</div>");
			topPane.addChild(new ContentPane({
				region:"center",
				className:"tab-container-description-pane",
				content:"<div class='section-content'>" +
						"<table style='width: 100%'>" +
						"<tr>" +
						"<td>" +
						"<div class='performance-section-header'>SHARING <img class='performance-info-icon' src='img/info.png'></div>" +
						"<div class='performance-content'>" + this._processSharing(item.access) + "</div>" +
						"</td>" +
						"<td>" +
						"<div class='performance-section-header'>MAP DRAW TIME <img class='performance-info-icon' src='img/info.png'></div>" +
						"<div class='performance-content'>" + this._processMapDrawTime(mapDrawTime) + "</div>" +
						"</td>" +
						"<td>" +
						"<div class='performance-section-header'>LAYER COUNT <img class='performance-info-icon' src='img/info.png'></div>" +
						"<div class='performance-content'>" + this._processlayerCount(item) + "</div>" +
						"</td>" +
						"</tr>" +
						"<tr>" +
						"<td>" +
						"<div class='performance-section-header'>POP UPS <img class='performance-info-icon' src='img/info.png'></div>" +
						"<div class='performance-content'>" + popUps + "</div>" +
						"</td>" +
						"</tr>" +
						"</table>" +
						"<\/div>"
			}));
			performanceContainer.addChild(topPane);
			performanceContainer.startup();
			tabContainer.addChild(performanceContainer);
		},

		loadProfileContentPane:function(tabContainer, item, tabTitle, portalUser, userNameID, userDescriptionID) {
			var userThumbnailUrl = portalUser.thumbnailUrl;
			var userFullName = this._formatTitle(portalUser.fullName);
			var userDescription = this._formatTitle(portalUser.description);

			var profileContainer = new BorderContainer({
				title:tabTitle,
				selected:false
			});
			// TOP PANE
			var profileTopPane = this._addContentPane("top", "tab-container-top-pane", "<div class='selected-tab-ribbon'>" + this.config.MY_PROFILE + "</div>");
			profileContainer.addChild(profileTopPane);
			// THUMBNAIL
			var userThumbnailPane = new ContentPane({
				region:"",
				className:"tab-container-thumbnail-pane",
				content:"<div class='section-header'>THUMBNAIL<img class='info-icon' src='img/info.png'><\/div>" +
						"<img src='" + userThumbnailUrl + "' height='85px'>"
			});
			profileTopPane.addChild(userThumbnailPane);
			// USER NAME AND USER DESCRIPTION PANE
			var nameAndDescriptionPane = this._addContentPane("", "tab-container-title-summary-pane", "");
			profileTopPane.addChild(nameAndDescriptionPane);
			// USER NAME PANE
			var userNamePane = new ContentPane({
				region:"",
				className:"tab-container-title-pane",
				content:"<div class='section-header'>NAME<\/div>" +
						"<div class='section-content'>" +
						"<input type='text' name='title-textbox' value='" + userFullName + "' data-dojo-type='dijit/form/TextBox' id='" + userNameID + "' />"
			});
			// USER DESCRIPTION PANE
			var userDescriptionPane = new ContentPane({
				region:"",
				className:"tab-container-summary-pane",
				content:"<div class='section-header'>DESCRIPTION <img class='info-icon' src='img/info.png'>" +
						"<span class='section-header-message'>" + this.config.MAXIMUM_CHAR + "<\/span><\/div>" +
						"<div class='section-content'><textarea id='" + userDescriptionID + "' data-dojo-type='dijit/form/SimpleTextarea' rows='4' cols='50' style='width:66%;'>" + userDescription
			});
			nameAndDescriptionPane.addChild(userNamePane);
			nameAndDescriptionPane.addChild(userDescriptionPane);
			profileContainer.startup();
			tabContainer.addChild(profileContainer);
		}

	});
});