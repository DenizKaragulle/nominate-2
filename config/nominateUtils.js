define([
	"dijit/Dialog",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/Deferred",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/on",
	"dojo/query",
	"esri/Color",
	"esri/geometry/Point",
	"esri/graphic",
	"esri/layers/FeatureLayer",
	"esri/symbols/SimpleMarkerSymbol",
	"esri/tasks/query",
	"esri/tasks/QueryTask"
], function (Dialog, array, declare, lang, Deferred, dom, domConstruct, on, query, Color, Point, Graphic, FeatureLayer, SimpleMarkerSymbol, Query, QueryTask) {

	return declare(null, {

		defaults: null,
		portalUtils: null,

		nominatedItems: null,

		nominateAdminFeatureLayer: null,
		curatorListAdminFeatureLayer: null,

		NOMINATE_BTN_ID: null,
		ACCEPT_BTN_ID: null,
		nominateBtnID: null,
		acceptBtnID: null,
		nominateBtnNode: null,
		nominateBtnClickHandler: null,
		acceptBtnNode: null,
		acceptBtnClickHandler: null,

		selectedID: null,

		constructor: function (defaults, portalUtils) {
			this.defaults = defaults;
			this.portalUtils = portalUtils;

			this.NOMINATE_BTN_ID = "nominate-btn-";
			this.ACCEPT_BTN_ID = "accept-btn-";
			this.nominateBtnID = "";
			this.acceptBtnID = "";
			this.nominatedItems = [];
			this.nominateAdminFeatureLayer = new FeatureLayer(this.defaults.NOMINATE_ADMIN_FEATURE_SERVICE_URL);
			this.curatorListAdminFeatureLayer = new FeatureLayer(this.defaults.CURATOR_LIST_ADMIN_FEATURE_SERVICE_URL);
			this.nominateBtnNode = "";
			this.acceptBtnNode = "";
		},

		setSelectedID: function (selectedID) {
			this.selectedID = selectedID;
		},

		loadNominatedItemsInMemory: function () {
			var deferred = new Deferred();
			var query = new Query();
			query.returnGeometry = false;
			query.outFields = ["*"];
			query.where = "1=1";
			var queryTask = new QueryTask(this.defaults.NOMINATE_ADMIN_FEATURE_SERVICE_URL);
			queryTask.execute(query).then(function (results) {
				deferred.resolve(results);
			});
			return deferred.promise;
		},

		// TODO Duplicate code
		isItemNominated: function (itemID) {
			var deferred = new Deferred();
			var query = new Query();
			query.returnGeometry = false;
			query.outFields = ["*"];
			query.where = "itemID = '" + itemID + "'";
			var queryTask = new QueryTask(this.defaults.NOMINATE_ADMIN_FEATURE_SERVICE_URL);
			queryTask.executeForCount(query).then(lang.hitch(this, function (count) {
				deferred.resolve(count);
			}));
			return deferred.promise;
		},

		// NOMINATE an item
		nominate: function (count) {
			if (count < 1) {
				this.portalUtils.portalUser.getItem(this.nominateUtils.selectedID).then(lang.hitch(this, function (item) {
					if (item.access !== "public") {
						// item must be public
						var nominateFailedDialog = new Dialog({
							id: "nominateFailedDialog",
							title: "Item Access",
							class: "nominate-failed-dialog"
						});

						nominateFailedDialog.set("content",
								'<div class="container">' +
										'<div class="nominate-failed-dialog-container">' +
										'	<div class="row">' +
										'		<div class="column-2">' +
										'			<h3 class="icon-alert"></h3>' +
										'		<\/div>' +
										'		<div class="column-22" style="margin-top: 5px;"> You can only nominate items that are public.<\/div>' +
										'	<\/div>' +
										'	<div class="row" style="margin-top: 10px;">' +
										'		<div class="column-24">' +
										'			<button class="btn ok-btn"> Ok </button>' +
										'		<\/div>' +
										'	<\/div>' +
										'<\/div>' +
										'<\/div>');

						nominateFailedDialog.show();

						on(query(".ok-btn"), "click", function () {
							nominateFailedDialog.hide();
							dijit.byId("nominateFailedDialog").destroy();
						});

					} else {
						// item had never been nominated
						var dateTime = new Date();
						var pt = new Point({
							"x": -13024380.422813008,
							"y": 4028802.0261344062,
							"spatialReference": {
								"wkid": 102100
							}
						});
						var sms = new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_CIRCLE).setColor(new Color([255, 0, 0, 0.5]));
						var attr = {
							"Latitude": "4028802.0261344062",
							"Longitude": "-13024380.422813008",
							"itemID": item.id,
							"itemOwnerID": item.owner,
							"ContactEmail": this.portalUtils.portalUser.email,
							"ContactPhone": "",
							"OnineStatus": "Nominated",
							"NominatedDate": dateTime,
							"LastContactDate": "",
							"LastContactComments": "",
							"AcceptedDate": "",
							"FlaggedDate": "",
							"RemovedDate": "",
							"OriginalNominatedDate": dateTime,
							"OriginalAcceptedDate": "",
							"InitialContactDate": "",
							"CreationDate": dateTime,
							"Creator": "",
							"EditDate": "",
							"Editor": "",
							"itemName": item.title,
							"itemURL": item.itemUrl,
							"notesThumbnail": "",
							"notesSummary": "",
							"notesDescription": "",
							"notesTitle": "",
							"notesCredits": "",
							"notesAccessUseConstraints": "",
							"notesTags": "",
							"notesDrawTime": "",
							"notesNumberOfLayers": "",
							"notesPopups": "",
							"notesSharing": "",
							"notesProfileThumbnail": "",
							"notesProfileFullName": "",
							"notesProfileDesc": ""
						};
						var graphic = new Graphic(pt, sms, attr);
						this.nominateUtils.nominateAdminFeatureLayer.applyEdits([graphic], null, null);
					}
				}));
			}
		},

		// ACCEPT an item
		accept: function (count) {
			// check if the item has even been nominated
			if (count > 0) {
				var status = this.defaults.STATUS_ACCEPTED;
				this.nominateUtils.getFeature(this.nominateUtils.selectedID).then(lang.hitch(this, lang.partial(this.nominateUtils.updateItemStatus, this.defaults.CURRENT_STATUS[3].label, status)));
				this.userInterfaceUtils.disableNominateButton(this.nominateUtils.acceptBtnNode);
			}
		},

		getFeature: function (itemID) {
			var deferred = new Deferred();
			var query = new Query();
			query.returnGeometry = false;
			query.outFields = ["*"];
			query.where = "itemID = '" + itemID + "'";
			var queryTask = new QueryTask(this.defaults.NOMINATE_ADMIN_FEATURE_SERVICE_URL);
			queryTask.execute(query).then(function (results) {
				deferred.resolve(results);
			});
			return deferred.promise;
		},

		updateItemStatus: function (label, status, response) {
			var feature = response.features[0];
			var dateTime = new Date();
			var pt = new Point({
				"x": -13024380.422813008,
				"y": 4028802.0261344062,
				"spatialReference": {
					"wkid": 102100
				}
			});
			var sms = new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_CIRCLE).setColor(new Color([255, 0, 0, 0.5]));

			var attr = {};
			if (status === this.defaults.STATUS_NOMINATED) {
				attr = {
					"FID": feature.attributes.FID,
					"OnineStatus": status,
					"NominatedDate": dateTime
				};
			} else if (status === this.defaults.STATUS_UNDER_REVIEW) {
				attr = {
					"FID": feature.attributes.FID,
					"OnineStatus": status,
					"OriginalAcceptedDate": dateTime,
					"AcceptedDate": dateTime
				};
			} else if (status === this.defaults.STATUS_ACCEPTED) {
				attr = {
					"FID": feature.attributes.FID,
					"OnineStatus": status,
					"OriginalAcceptedDate": dateTime,
					"AcceptedDate": dateTime
				};
			}

			var graphic = new Graphic(pt, sms, attr);
			this.nominateUtils.nominateAdminFeatureLayer.applyEdits(null, [graphic], null);
			// update the dom node for the item's status to "UNDER REVIEW"
			var itemStatusNode = query(".item-nomination-status-" + feature.attributes["itemID"])[0];
			var updatedItemStatusNode = domConstruct.toDom("<div class='item-nomination-status-" + feature.attributes["itemID"] + "'>" + label + "</div>");
			domConstruct.place(updatedItemStatusNode, itemStatusNode, "replace");
			// Enable the "ACCEPT" button
		}
	});
});