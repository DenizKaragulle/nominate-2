require([
	"dojo/ready",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/connect",
	"dojo/_base/array",
	"dojo/aspect",
	"dojo/query",
	"dojo/json",
	"dojo/on",
	"dojo/mouse",
	"dojo/keys",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/dom-class",
	"dojo/_base/Deferred",
	"dojo/DeferredList",
	"dojo/data/ObjectStore",
	"dojo/store/Memory",
	"dojo/store/Observable",
	"dgrid/OnDemandList",
	"dgrid/OnDemandGrid",
	"dgrid/extensions/ColumnHider",
	"dgrid/Selection",
	"dgrid/extensions/DijitRegistry",
	"put-selector/put",
	"dojo/date/locale",
	"dijit/Dialog",
	"dijit/form/Button",
	"dijit/popup",
	"dijit/TooltipDialog",
	"dijit/registry",
	"esri/request",
	"esri/kernel",
	"esri/config",
	"esri/urlUtils",
	"esri/arcgis/utils",
	"esri/arcgis/Portal",
	"esri/tasks/PrintParameters",
	"esri/tasks/PrintTemplate",
	"esri/tasks/PrintTask",
	"esri/geometry/webMercatorUtils",
	"esri/geometry/Extent",
	"esri/SpatialReference",
	"esri/tasks/GeometryService",
	"esri/IdentityManager"
], function (ready, declare, lang, connect, array, aspect, query, json, on, mouse, keys, dom, domConstruct, domClass, Deferred, DeferredList, ObjectStore, MemoryStore, Observable, OnDemandList, OnDemandGrid, ColumnHider, Selection, DijitRegistry, put, locale, Dialog, Button, popup, TooltipDialog, registry, esriRequest, esriKernel, esriConfig, urlUtils, arcgisUtils, esriPortal, PrintParameters, PrintTemplate, PrintTask, webMercatorUtils, Extent, SpatialReference, GeometryService, IdentityManager) {

	var imageSizes = {
		"SMALL":[200, 133],
		"LARGE":[286, 190],
		"XLARGE":[450, 300]
	};

	var updatedItems = {
		"SMALL":[],
		"LARGE":[],
		"XLARGE":[]
	};

	var validTypes = ["Web Map", "Feature Service", "Map Service", "Image Service", "Web Mapping Application"];

	var printServiceUrl = "http://arcgis-thumbnailer-160825098.us-east-1.elb.amazonaws.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task";

	var basemaps = {
		"gray":{
			"baseMapLayers":[
				{
					"id":"World_Light_Gray_Base",
					"opacity":1,
					"visibility":true,
					"url":"http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer"
				},
				{
					"id":"World_Light_Gray_Reference",
					"isReference":true,
					"opacity":1,
					"visibility":false,
					"url":"http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer"
				}
			],
			"title":"Light Gray Canvas"
		},
		"topo":{
			"baseMapLayers":[
				{
					"id":"World_Topo_Map_Base",
					"opacity":1,
					"visibility":true,
					"url":"http://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer"
				}
			],
			"title":"Topographic"
		},
		"hybrid":{
			"baseMapLayers":[
				{
					"id":"World_Imagery_Base",
					"opacity":1,
					"visibility":true,
					"url":"http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer"
				},
				{
					"id":"World_Boundaries_and_Places_Reference",
					"isReference":true,
					"opacity":1,
					"visibility":false,
					"url":"http://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer"
				}
			],
			"title":"Imagery with Labels"
		},
		"none":{
			"baseMapLayers":[
				{
					"id":"None_Base",
					"opacity":1,
					"visibility":false,
					"url":"http://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer"
				}
			],
			"title":"NO BASEMAP"
		}
	};

	var portalUser;
	var sourceFoldersList = null;
	var sourceGroupsList = null;
	var sourceItemList = null;
	var getFolderItemsDeferred = null;
	var getGroupItemsDeferred = null;

	//
	// WE NEED CASE INSENSITIVE SORTS...
	//   http://stackoverflow.com/questions/26783489/non-case-sensitive-sorting-in-dojo-dgrid
	//
	var Memory = declare(MemoryStore, {
		query:function (query, queryOptions) {
			var sort = queryOptions && queryOptions.sort;
			if (sort) {
				// Replace sort array with a function equivalent that performs case-insensitive sorting
				queryOptions.sort = function (a, b) {
					for (var i = 0; i < sort.length; i++) {
						var aValue = a[sort[i].attribute].toLowerCase();
						var bValue = b[sort[i].attribute].toLowerCase();
						if (aValue !== bValue) {
							var result = aValue > bValue ? 1 : -1;
							return result * (sort[i].descending ? -1 : 1);
						}
					}
					return 0;
				}
			}
			return this.inherited(arguments);
		}
	});

	ready(function () {

		// PROXY URL //
		esriConfig.defaults.io.timeout = 20000;
		esriConfig.defaults.io.proxyUrl = "./resources/proxy.ashx";
		esriConfig.defaults.geometryService = new GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");

		// PORTAL //
		var portalUrl = location.protocol + '//www.arcgis.com';
		var portal = new esriPortal.Portal(portalUrl);
		// PORTAL LOADED //
		connect.connect(portal, 'onLoad', lang.hitch(this, function () {

			// FOLDERS LIST //
			sourceFoldersList = declare([OnDemandList, Selection, DijitRegistry])({
				store:new Observable(new Memory({
					data:[]
				})),
				sort:"title",
				loadingMessage:"Loading folders...",
				noDataMessage:"ArcGIS.com Folders",
				selectionMode:"single",
				allowTextSelection:false,
				renderRow:renderFolderRow
			}, "sourceFoldersList");
			sourceFoldersList.startup();
			sourceFoldersList.on("dgrid-select", sourceFolderSelected);

			// GROUPS LIST //
			sourceGroupsList = declare([OnDemandList, Selection, DijitRegistry])({
				store:new Observable(new Memory({
					data:[]
				})),
				sort:"title",
				loadingMessage:"Loading groups...",
				noDataMessage:"ArcGIS.com Groups",
				selectionMode:"single",
				allowTextSelection:false,
				renderRow:renderGroupRow
			}, "sourceGroupList");
			sourceGroupsList.startup();
			sourceGroupsList.on("dgrid-select", sourceGroupSelected);

			// ITEM LIST //
			sourceItemList = declare([OnDemandGrid, ColumnHider, DijitRegistry])({
				store:null,
				columns:getColumns(),
				loadingMessage:"Loading items...",
				noDataMessage:"No items found"
			}, "sourceItemList");
			sourceItemList.startup();
			sourceItemList.on(".dgrid-row:click", lang.partial(onItemRowClick, sourceItemList));
			aspect.after(sourceItemList, 'renderArray', sourceListUpdated, true);

			// FILTER TITLE KEY UP //
			on(registry.byId('sourceItemsFilterInput'), 'keyup', filterSourceItems);

			// FILTER TYPE CHANGE //
			on(registry.byId('itemTypeSelect'), 'change', filterSourceItems);

			// SOURCE LIST CHANGE //
			on(registry.byId('sourceListController'), 'selectChild', sourceListChange);

			// AUTO-GENERATE THUMBNAILS //
			registry.byId("autoGenerateSmallThumbnailsMenuItem").on("click", lang.hitch(this, autoGenerateThumbnails, "SMALL"));
			registry.byId("autoGenerateLargeThumbnailsMenuItem").on("click", lang.hitch(this, autoGenerateThumbnails, "LARGE"));

			// SIGN IN //
			portal.signIn().then(lang.hitch(this, function (user) {
				portalUser = user;

				dom.byId('loggedInUser').innerHTML = portalUser.fullName;

				// GET USER FOLDERS //
				portalUser.getFolders().then(function (folders) {
					// ROOT FOLDER //
					var rootFolder = {
						id:'',
						title:lang.replace(" {username} (Home)", portalUser),
						isRoot:true
					};
					// FOLDER STORE //
					var folderStore = new Observable(new Memory({
						data:[rootFolder].concat(folders)
					}));
					// SET LISTS STORE //
					sourceFoldersList.set('store', folderStore);
				});

				// GET USER GROUPS //
				portalUser.getGroups().then(function (groups) {
					// GROUPS STORE //
					var groupStore = new Observable(new Memory({
						data:groups
					}));
					// SET LISTS STORE //
					sourceGroupsList.set('store', groupStore);
				});

			}));

		}));

		function getColumns() {
			var columns = [];

			columns.push({
				needsQuotes:true,
				label:"Title",
				field:"title",
				unhidable:true,
				renderCell:renderItemTitle
			});
			columns.push({
				needsQuotes:true,
				label:"Thumbnail",
				field:"thumbnailUrl",
				hidden:false,
				renderCell:renderItemThumbnail
			});
			columns.push({
				needsQuotes:true,
				label:"Large Thumbnail",
				field:"largeThumbnail",
				hidden:false,
				renderCell:renderItemLargeThumbnail
			});
			columns.push({
				needsQuotes:true,
				label:"ID",
				field:"id",
				hidden:true
			});
			columns.push({
				needsQuotes:true,
				label:"Shared",
				field:"access",
				hidden:true
			});
			columns.push({
				needsQuotes:true,
				label:"Type",
				field:"type",
				hidden:false
			});
			columns.push({
				needsQuotes:true,
				label:"Tags",
				field:"tags",
				hidden:true
			});
			columns.push({
				needsQuotes:true,
				label:"Created",
				field:"created",
				hidden:true,
				formatter:formatDateValue
			});
			columns.push({
				needsQuotes:true,
				label:"Modified",
				field:"modified",
				hidden:true,
				formatter:formatDateValue
			});
			columns.push({
				needsQuotes:true,
				label:"Owner",
				field:"owner",
				hidden:true
			});

			return columns;
		}

		// RENDER FOLDER ROW //
		function renderFolderRow(object, options) {
			var folderClass = object.isRoot ? '.folderItem.rootFolder' : '.folderItem';
			return put("div" + folderClass, object.title);
		}

		// RENDER GROUP ROW //
		function renderGroupRow(object, options) {
			return put("div.groupItem", object.title);
		}

		// FORMAT DATES VALUES //
		function formatDateValue(value) {
			return (new Date(value)).toLocaleString();
		}

		// FORMAT ITEM THUMBNAIL //
		function renderItemThumbnail(object, value, node, options) {
			var hasUpdate = (array.indexOf(updatedItems.SMALL, object.id) > -1);
			var imgTemplate = hasUpdate ? "{0}&_ts={1}" : "{0}";
			return value ? put("img.itemThumbnail", {
				src:lang.replace(imgTemplate, [value, (new Date()).valueOf()]),
				title:"CTRL = delete thumbnail  ALT = use alternate image"
			}) : put("img.itemThumbnail", {
				src:"./images/webapp.png"
			});

		}

		// FORMAT ITEM LARGE THUMBNAIL //
		function renderItemLargeThumbnail(object, value, node, options) {
			var hasUpdate = (array.indexOf(updatedItems.LARGE, object.id) > -1);
			var imgTemplate = hasUpdate ? "{0}/info/{1}?token={2}&_ts={3}" : "{0}/info/{1}?token={2}";
			return value ? put("img.itemLargeThumbnail", {
				src:lang.replace(imgTemplate, [object.itemUrl, value, portalUser.credential.token, (new Date()).valueOf()]),
				title:"CTRL = delete thumbnail  ALT = use alternate image"
			}) : put("img.itemLargeThumbnail", {
				src:"./images/webapp.png"
			});

		}

		// FORMAT ITEM TITLE TO SHOW TYPE ICON //
		function renderItemTitle(object, value, node, options) {
			var itemClass = '.icon' + object.type.replace(/ /g, '');
			return put("div.iconItem." + itemClass, value);
		}

		// FILTER SOURCE ITEMS //
		function filterSourceItems() {

			// CLEAR COUNT //
			dom.byId('sourceItemsCount').innerHTML = '';

			// ITEM QUERY //
			var itemQuery = {};

			// TYPE FILTER //
			var itemType = registry.byId('itemTypeSelect').get('value');
			if (itemType !== 'none') {
				itemQuery.type = itemType;
			}

			// TITLE FILTER //
			var itemTitle = registry.byId('sourceItemsFilterInput').get('value');
			if (itemTitle !== "") {
				itemQuery.title = new RegExp(itemTitle, 'i');
			}

			// SET QUERY FOR SOURCE ITEM LIST //
			sourceItemList.set('query', itemQuery, {
				count:1000,
				sort:'title'
			});
		}

		// UPDATE ITEM COUNT AFTER LIST IS UPDATED //
		function sourceListUpdated(results) {
			var counts = {
				store:sourceItemList.store.data.length,
				display:results.total
			};
			dom.byId('sourceItemsCount').innerHTML = lang.replace('{display} of {store}', counts);
			registry.byId("createAllBtn").set("disabled", (counts.store === 0));
			//filterSourceItems();
		}

		// UPDATE TYPE LIST //
		function updateTypeList(results) {

			var previousType = registry.byId('itemTypeSelect').get("value");

			var itemTypeNames = [];
			var itemTypes = [
				{
					id:"none",
					label:"<div class='placeHolder'>...no type filter...</div>"
				}
			];
			array.forEach(results, function (result, resultIndex) {
				if (array.indexOf(itemTypeNames, result.type) === -1) {
					itemTypeNames.push(result.type);

					var itemClass = 'icon' + result.type.replace(/ /g, '');
					itemTypes.push({
						id:result.type,
						label:lang.replace("<div class='iconItem {0}'>{1}</div>", [itemClass, result.type])
					});
				}
			});

			var objectStore = new ObjectStore({
				objectStore:new Memory({
					data:itemTypes
				})
			});
			registry.byId('itemTypeSelect').setStore(objectStore);
			if (previousType && objectStore.objectStore.get(previousType)) {
				registry.byId('itemTypeSelect').set("value", previousType);
			} else {
				registry.byId('itemTypeSelect').set("value", "none");
			}

		}

		// SOURCE LIST CHANGED //
		function sourceListChange(selectedChild) {
			dom.byId('sourceItemsCount').innerHTML = '';
			//registry.byId('sourceItemsFilterInput').set('value', "");
			//updateTypeList([]);
			sourceGroupsList.clearSelection();
			sourceFoldersList.clearSelection();
			//var emptyStore = new Observable(new Memory({data: []}));
			sourceItemList.set('store', null, {}, {count:1000, sort:'title'});
		}

		// UPDATE SOURCE ITEM LIST WITH NEW STORE //
		function updateSourceItemList(store) {
			//registry.byId('sourceItemsFilterInput').set('value', "");
			updateTypeList(store.data);
			sourceItemList.set('store', store, {}, {count:1000, sort:'title'});
			domClass.remove('sourceItemsCount', 'searching');
			filterSourceItems();
		}

		// SOURCE FOLDER ITEM SELECTED //
		function sourceFolderSelected(evt) {
			sourceGroupsList.clearSelection();
			domClass.add('sourceItemsCount', 'searching');
			dom.byId('sourceItemsCount').innerHTML = 'Searching...';
			sourceItemList.set('store', null);
			var portalFolder = evt.rows[0].data;
			if (portalFolder) {
				getFolderItemStore(portalFolder).then(updateSourceItemList);
			}
		}

		// SOURCE GROUP ITEM SELECTED //
		function sourceGroupSelected(evt) {
			sourceFoldersList.clearSelection();
			domClass.add('sourceItemsCount', 'searching');
			dom.byId('sourceItemsCount').innerHTML = 'Searching...';
			sourceItemList.set('store', null);
			var portalGroup = evt.rows[0].data;
			if (portalGroup) {
				getGroupItemStore(portalGroup).then(updateSourceItemList);
			}
		}

		// GET ITEM STORE FOR PORTAL FOLDER //
		function getFolderItemStore(portalFolder) {
			var deferred = new Deferred();
			if (getFolderItemsDeferred) {
				getFolderItemsDeferred.cancel();
			}
			getFolderItemsDeferred = portalUser.getItems(portalFolder.id).then(lang.hitch(this, function (items) {
				getFolderItemsDeferred = null;
				var itemStore = new Observable(new Memory({
					data:array.filter(items, lang.hitch(this, function (item) {
						return (array.indexOf(validTypes, item.type) > -1);
					}))
				}));
				deferred.resolve(itemStore);
			}));
			return deferred.promise;
		}

		// GET ITEM STORE FOR PORTAL GROUP //
		function getGroupItemStore(portalGroup) {
			var deferred = new Deferred();

			if (getGroupItemsDeferred) {
				getGroupItemsDeferred.cancel();
			}

			var queryParams = {
				q:"",
				sortField:'title',
				sortOrder:'asc',
				start:0,
				num:100
			};
			getGroupItemsDeferred = searchItems(portalGroup, queryParams).then(lang.hitch(this, function (allResults) {
				getGroupItemsDeferred = null;
				var itemStore = new Observable(new Memory({
					data:array.filter(allResults, lang.hitch(this, function (item) {
						return (array.indexOf(validTypes, item.type) > -1);
					}))
				}));
				deferred.resolve(itemStore);
			}));

			return deferred.promise;
		}

		/**
		 * RECURSIVELY SEARCH UNTIL ALL RESULTS ARE RETURNED
		 * NOTE: THIS CALL CAN BE DANGEROUS IF THE QUERY RESULTS
		 * IN A VERY LARGE NUMBER OF RESULTS. USE CAUTIOUSLY.
		 *
		 * @param portalGroup
		 * @param queryParams
		 * @param allResults
		 * @returns {*}
		 */
		function searchItems(portalGroup, queryParams, allResults) {
			var deferred = new Deferred();

			if (!allResults) {
				allResults = [];
			}
			portalGroup.queryItems(queryParams).then(lang.hitch(this, function (response) {
				allResults = allResults.concat(response.results);
				if (response.nextQueryParams.start > -1) {
					searchItems(portalGroup, response.nextQueryParams, allResults).then(deferred.resolve, deferred.reject);
				} else {
					deferred.resolve(allResults);
				}
			}));

			return deferred.promise;
		}

		// DISPLAY ITEM IN ARCGIS.COM - WILL REQUIRE SIGN-IN //
		function displayItemInAGOL(list, evt) {
			var item = list.row(evt).data;
			var agsDetailsUrl = lang.replace("{0}//{1}.{2}/home/item.html?id={3}", [document.location.protocol, portalUser.portal.urlKey, portalUser.portal.customBaseUrl, item.id]);
			window.open(agsDetailsUrl);
		}

		/**
		 * AUTO-GENERATE THUMBNAILS
		 *
		 * @param imageSizeName
		 */
		function autoGenerateThumbnails(imageSizeName) {

			var imageFormat = registry.byId("thumbnailFormatSelect").get("value");
			var overwrite = registry.byId("overwriteChk").get("checked");

			var items = sourceItemList.store.query(sourceItemList.query);
			items.forEach(function (item) {
				if (item.owner !== portalUser.username) {
					console.log("Can't update thumbnail; you must own the item...", item);
				} else {
					if (imageSizeName === "SMALL") {
						if (item.thumbnailUrl && !overwrite) {
							console.log("Can't overwrite small thumbnail, it already has one: ", item);
						} else {
							if (item.type === "Web Mapping Application") {
								console.log("Can't auto-generate thumbnail for Web Mapping Application items...", item);
							} else {
								displayWebMapPreview(item, imageSizeName, imageFormat, true);
							}
						}
					} else {
						if (item.largeThumbnail && !overwrite) {
							console.log("Can't overwrite large thumbnail, it already has one: ", item);
						} else {
							if (item.type === "Web Mapping Application") {
								console.log("Can't auto-generate thumbnail for Web Mapping Application items...", item);
							} else {
								displayWebMapPreview(item, imageSizeName, imageFormat, true);
							}
						}
					}
				}
			});
		}

		/**
		 * ITEM ROW CLICK
		 *
		 * @param list
		 * @param evt
		 */
		function onItemRowClick(list, evt) {
			var cell = list.cell(evt);
			var item = cell.row.data;
			if (item.owner !== portalUser.username) {
				alert("Can't update thumbnails; you must own the item...");
				//displayItemInAGOL(list, evt);

			} else {

				var imageFormat = registry.byId("thumbnailFormatSelect").get("value");
				var overwrite = registry.byId("overwriteChk").get("checked");

				if (cell.column && (cell.column.field === "largeThumbnail")) {
					if (item.largeThumbnail && !overwrite) {
						alert("Item already has large thumbnail.");
					} else {
						if (evt.ctrlKey) {
							if (confirm("Are you sure you want to delete the large thumbnail?")) {
								deleteItemThumbnail(item, "LARGE");
							}
						} else {
							if (evt.altKey) {
								uploadAlternateImage(item, "LARGE");
							} else {
								if (item.type === "Web Mapping Application") {
									uploadAlternateImage(item, "LARGE");
								} else {
									displayWebMapPreview(item, "LARGE", imageFormat, false);
								}
							}
						}
					}
				} else {
					if (cell.column && (cell.column.field === "thumbnailUrl")) {
						if (item.thumbnailUrl && !overwrite) {
							alert("Item already has small thumbnail.");
						} else {
							if (evt.ctrlKey) {
								if (confirm("Are you sure you want to delete the small thumbnail?")) {
									deleteItemThumbnail(item, "SMALL");
								}
							} else {
								if (evt.altKey) {
									uploadAlternateImage(item, "SMALL");
								} else {
									if (item.type === "Web Mapping Application") {
										uploadAlternateImage(item, "SMALL");
									} else {
										displayWebMapPreview(item, "SMALL", imageFormat, false);
									}
								}
							}
						}
					} else {
						displayItemInAGOL(list, evt);
					}
				}
			}

		}

		/**
		 *
		 * @param item
		 * @param imageSizeName
		 * @param imageFormat
		 * @param autoGenerate
		 */
		function displayWebMapPreview(item, imageSizeName, imageFormat, autoGenerate) {

			var previewDlg = new Dialog({
				title:item.title,
				className:"esriSignInDialog"
			});
			previewDlg.show();

			var dialogContent = put(previewDlg.containerNode, "div.dijitDialogPaneContentArea");
			var actionBar = put(previewDlg.containerNode, "div.dijitDialogPaneActionBar");
			var generateThumbBtn = new Button({
				label:"Generate Thumbnail"
			}, put(actionBar, "div"));
			domClass.add(generateThumbBtn.domNode, "dijitHidden");
			var cancelBtn = new Button({
				label:"Cancel",
				onClick:lang.hitch(previewDlg, previewDlg.hide)
			}, put(actionBar, "div"));

			var msgPane = put(dialogContent, "div.msgPane", "Loading Item...");
			var mapNodeId = "map." + item.id + "." + (new Date()).valueOf();
			var mapPane = put(dialogContent, "div.mapPane-" + imageSizeName, {id:mapNodeId});

			getItemIdOrItemInfoFromItem(item).then(lang.hitch(this, function (itemIdOrItemInfo) {

				arcgisUtils.createMap(itemIdOrItemInfo, mapNodeId, {
					mapOptions:{
						logo:false,
						slider:false,
						showAttribution:false
					}
				}).then(lang.hitch(this, function (createMapResponse) {
					var map = createMapResponse.map;

					map.reposition();
					map.resize();
					map.setMapCursor("wait");
					map.on("update-start", lang.hitch(map, map.setMapCursor, "wait"));
					map.on("update-end", lang.hitch(map, map.setMapCursor, "default"));

					//on.once(map, "update-end", lang.hitch(this, function(evt){
					msgPane.innerHTML = "Item is loaded";

					domClass.remove(generateThumbBtn.domNode, "dijitHidden");
					generateThumbBtn.on("click", lang.hitch(this, function (evt) {
						domClass.add(generateThumbBtn.domNode, "dijitHidden");
						map.setMapCursor("wait");
						map.disableMapNavigation();
						msgPane.innerHTML = "Generating thumbnail...";

						getThumbnailUrlForWebMap(map, imageSizes[imageSizeName], imageFormat).then(lang.hitch(this, function (printThumbnailResponse) {
							//console.log(printThumbnailResponse);
							if (previewDlg && previewDlg.open) {
								msgPane.innerHTML = "Updating item...";

								updateItemThumbnail(item, printThumbnailResponse.url, imageSizeName, imageFormat).then(lang.hitch(this, function (updateItemResponse) {
									//console.log(updateItemResponse);
									if (previewDlg && previewDlg.open) {
										msgPane.innerHTML = "Getting updated item...";
										portalUser.getItem(item.id).then(lang.hitch(this, function (userItem) {

											updatedItems[imageSizeName].push(item.id);

											map.setMapCursor("default");
											msgPane.innerHTML = "Item updated with thumbnail";
											sourceItemList.store.put(userItem);
											previewDlg.hide();

										}), lang.hitch(this, function (error) {
											console.warn(error);
											if (previewDlg && previewDlg.open) {
												msgPane.innerHTML = error.message;
											}
										}));
									}
								}), lang.hitch(this, function (error) {
									console.warn(error);
									if (previewDlg && previewDlg.open) {
										msgPane.innerHTML = error.message;
									}
								}));
							}
						}), lang.hitch(this, function (error) {
							console.warn(error);
							if (previewDlg && previewDlg.open) {
								msgPane.innerHTML = error.message;
							}
						}));
					}));

					// CREATE ALL //
					if (autoGenerate) {
						generateThumbBtn.onClick();
					}

				}), lang.hitch(this, function (error) {
					console.warn(error);
					if (previewDlg && previewDlg.open) {
						msgPane.innerHTML = error.message;
					}
				}));
			}), lang.hitch(this, function (error) {
				console.warn(error);
				if (previewDlg && previewDlg.open) {
					msgPane.innerHTML = error.message;
				}
			}));

		}

		/**
		 *
		 * @param item
		 * @returns {Deferred.promise}
		 */
		function getItemIdOrItemInfoFromItem(item) {
			var deferred = new Deferred();

			if (item.type === "Web Map") {
				deferred.resolve(item.id);

			} else {

				getLayerItemInfo(item).then(lang.hitch(this, function (layerItemInfo) {
					//console.log("layerItemInfo- ", layerItemInfo);

					// WEB MAP //
					var webmapJson = {"version":"1.9.1"};

					var itemSR = new SpatialReference(layerItemInfo.serviceInfo.spatialReference);
					if (layerItemInfo.serviceInfo.singleFusedMapCache && (!itemSR.isWebMercator())) {
						//console.log("singleFusedMapCache- ", layerItemInfo);

						// LAYER ITEM REFERENCES A TILED MAP SERVICE THAT IS NOT WEB MERCATOR //
						lang.mixin(webmapJson, {
							"baseMap":{
								"baseMapLayers":[
									{
										"id":item.title,
										"opacity":1,
										"visibility":true,
										"url":item.url
									}
								],
								"title":item.title + " as Basemap"
							},
							"operationalLayers":[]
						});

					} else {
						var basemapName = registry.byId("basemapSelect").get("value");

						lang.mixin(webmapJson, {
							"baseMap":basemaps[basemapName],
							"operationalLayers":layerItemInfo.operationalLayers
						});
					}

					deferred.resolve({
						item:item,
						itemData:webmapJson
					});

				}), lang.hitch(this, function (error) {
					console.warn(error);
					deferred.reject(error);
				}));

			}

			return deferred.promise;
		}

		/**
		 *
		 * @param item
		 * @returns {Deferred.promise}
		 */
		function getLayerItemInfo(item) {
			var deferred = new Deferred();

			esriRequest({
				url:item.url,
				content:{
					f:'json'
				}
			}).then(lang.hitch(this, function (serviceInfo) {
				//console.log("serviceInfo- ", serviceInfo);

				esriRequest({
					url:item.itemDataUrl,
					content:{
						f:'json'
					}
				}).then(lang.hitch(this, function (itemData) {
					//console.log("itemData- ", itemData);

					var layerInfos = serviceInfo.layers || [];
					var visibleLayers = (itemData && itemData.visibleLayers) ? itemData.visibleLayers : null;
					if (visibleLayers) {
						layerInfos = array.filter(layerInfos, lang.hitch(this, function (layerInfo) {
							return (array.indexOf(itemData.visibleLayers, layerInfo.id) > -1);
						}));
					}

					var operationalLayers = [];

					switch (item.type) {
						case "Image Service":
							var operationalLayer_ImageService = {
								"url":item.url,
								"id":item.title,
								"visibility":true,
								"opacity":1,
								"title":item.title,
								"itemId":item.id
							};
							operationalLayers.push(operationalLayer_ImageService);
							break;

						case "Map Service":
							var operationalLayer_MapService = lang.mixin({
								"url":item.url,
								"id":item.title,
								"visibility":true,
								"opacity":1,
								"title":item.title,
								"itemId":item.id
							}, visibleLayers ? {"visibleLayers":visibleLayers} : {});
							operationalLayers.push(operationalLayer_MapService);
							break;

						case "Feature Service":
							operationalLayers = array.map(layerInfos, lang.hitch(this, function (layerInfo) {
								return {
									"url":lang.replace("{0}/{1}", [item.url, layerInfo.id]),
									"capabilities":serviceInfo.capabilities,
									"id":item.title + "_" + layerInfo.id,
									"title":item.title + " - " + layerInfo.name,
									"visibility":true,
									"opacity":1,
									"mode":1
								};
							}));
							break;
					}

					deferred.resolve({
						"serviceInfo":serviceInfo,
						"itemData":itemData,
						"operationalLayers":operationalLayers
					});

				}), deferred.reject);
			}), deferred.reject);

			return deferred.promise;
		}

		/**
		 *
		 * @param map
		 * @param imageSize
		 * @param imageFormat
		 * @returns {Deferred.promise}
		 */
		function getThumbnailUrlForWebMap(map, imageSize, imageFormat) {
			var deferred = new Deferred();

			var template = new PrintTemplate();
			template.exportOptions = {
				width:imageSize[0],
				height:imageSize[1],
				dpi:96
			};
			template.format = (imageFormat === "png") ? "PNG32" : imageFormat;
			template.layout = "MAP_ONLY";
			template.preserveScale = false;

			var params = new PrintParameters();
			params.template = template;
			params.map = map;

			var printTask = new PrintTask(printServiceUrl);
			printTask.execute(params).then(deferred.resolve, deferred.reject);

			return deferred.promise;
		}

		/**
		 *
		 * @param item
		 * @param thumbnailUrl
		 * @param imageSizeName
		 * @param imageFormat
		 * @returns {Deferred.promise}
		 */
		function updateItemThumbnail(item, thumbnailUrl, imageSizeName, imageFormat) {
			var deferred = new Deferred();

			if (imageSizeName === "LARGE") {
				getImageAsArrayBuffer(thumbnailUrl).then(lang.hitch(this, function (imageAsArrayBuffer) {
					var formData = createFormFromImageArrayBuffer(imageAsArrayBuffer, imageSizeName, imageFormat);
					updateThumbnail_Form(item, formData).then(deferred.resolve, deferred.reject);
				}), deferred.reject);
			} else {
				updateThumbnail_Url(item, thumbnailUrl).then(deferred.resolve, deferred.reject);
			}

			return deferred.promise;
		}

		/**
		 *
		 * @param item
		 * @param imageSizeName
		 */
		function uploadAlternateImage(item, imageSizeName) {
			console.log("uploadAlternateImage")
			var deferred = new Deferred();

			var previewDlg = new Dialog({
				title:item.title,
				className:"esriSignInDialog"
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
						var reader = new FileReader();
						reader.readAsDataURL(imgFile);
						reader.onload = function (_file) {
							domClass.add(fileInput, "dijitHidden");
							var imgNode = put(dialogContent, "img");
							imgNode.onload = function () {
								msgPane.innerHTML = "Valid file selected";
								put(dialogContent, "div.imageSizeLabel", lang.replace("Image size: {0}px by {1}px", [this.width, this.height]));
								if ((this.width === imageSizes[imageSizeName][0]) && (this.height === imageSizes[imageSizeName][1])) {
									domClass.remove(uploadThumbBtn.domNode, "dijitHidden");
									uploadThumbBtn.on("click", lang.hitch(this, function (evt) {
										domClass.add(uploadThumbBtn.domNode, "dijitHidden");
										updateThumbnail_Form(item, form).then(lang.hitch(this, function (evt) {
											portalUser.getItem(item.id).then(lang.hitch(this, function (userItem) {
												updatedItems[imageSizeName].push(item.id);
												msgPane.innerHTML = "Item updated with thumbnail";
												sourceItemList.store.put(userItem);
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
					}
			));
			return deferred.promise;
		}

		/**
		 *
		 * @param item
		 * @param imageSizeName
		 * @returns {Deferred.promise}
		 */
		function deleteItemThumbnail(item, imageSizeName) {
			var deferred = new Deferred();

			var thumbnailFilename = (imageSizeName === "LARGE") ? item.largeThumbnail : item.thumbnail;

			esriRequest({
				url:lang.replace("{userItemUrl}/deleteInfo", item),
				content:{
					infoFile:thumbnailFilename,
					f:"json"
				}
			}, {
				usePost:true
			}).then(lang.hitch(this, function () {

				portalUser.getItem(item.id).then(lang.hitch(this, function (userItem) {
					updatedItems[imageSizeName].push(item.id);
					sourceItemList.store.put(userItem);
					deferred.resolve();
				}), lang.hitch(this, function (error) {
					console.warn(error);
					deferred.reject(error);
				}));

			}), lang.hitch(this, function (error) {
				console.warn(error);
				deferred.reject(error);
			}));

			return deferred.promise;
		}

		/**
		 *
		 * @param imageUrl
		 * @returns {*}
		 */
		function getImageAsArrayBuffer(imageUrl) {
			var deferred = new Deferred();

			// GET IMAGE AS ARRAYBUFFER //
			esriRequest({
				url:imageUrl,
				handleAs:"arraybuffer"
			}).then(deferred.resolve, deferred.reject);

			return deferred.promise;
		}

		/**
		 *
		 * @param imageAsArrayBuffer
		 * @param imageSizeName
		 * @param imageFormat
		 * @returns {FormData}
		 */
		function createFormFromImageArrayBuffer(imageAsArrayBuffer, imageSizeName, imageFormat) {
			var arrayBufferView = new Uint8Array(imageAsArrayBuffer);
			var blobImg = new Blob([arrayBufferView], {type:"image/" + imageFormat});
			var thumbnailFilename = (imageSizeName === "LARGE") ? "largeThumbnail" : "thumbnail";
			var form = put("form", {
				"method":"post",
				"enctype":"multipart/form-data"
			});
			var formData = new FormData(form);
			formData.append(thumbnailFilename, blobImg, lang.replace("{0}.{1}", [thumbnailFilename, imageFormat]));
			return formData;
		}

		/**
		 *
		 * @param userItem
		 * @param form
		 * @returns {Deferred.promise}
		 */
		function updateThumbnail_Form(userItem, form) {
			var deferred = new Deferred();

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

		/**
		 *
		 * @param userItem
		 * @param thumbnailUrl
		 * @returns {Deferred.promise}
		 */
		function updateThumbnail_Url(userItem, thumbnailUrl) {
			var deferred = new Deferred();

			// UPDATE SMALL THUMBNAIL //
			esriRequest({
				url:lang.replace("{userItemUrl}/update", userItem),
				content:{
					f:"json",
					thumbnailUrl:thumbnailUrl
				},
				handleAs:"json"
			}, {
				usePost:true
			}).then(deferred.resolve, deferred.reject);

			return deferred.promise;
		}

	});
});

