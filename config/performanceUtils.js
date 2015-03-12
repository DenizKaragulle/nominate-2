define([
	"esri/Color",
	"esri/request",
	"esri/geometry/Point",
	"esri/graphic",
	"esri/layers/FeatureLayer",
	"esri/symbols/SimpleMarkerSymbol",
	"dijit/Dialog",
	"dijit/focus",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/Deferred",
	"dojo/dom",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/html",
	"dojo/mouse",
	"dojo/on",
	"dojo/query",
	"config/defaults",
	"config/adminUtils"
], function (Color, esriRequest, Point, Graphic, FeatureLayer, SimpleMarkerSymbol, Dialog, focusUtil, array, declare, lang, Deferred, dom, domAttr, domClass, domConstruct, domStyle, html, mouse, on, query, defaults, AdminUtils) {

	return declare([AdminUtils], {

		response: null,
		layers: null,
		validator: null,
		nominateUtils: null,
		userInterfaceUtils: null,
		scoringUtils: null,
		scoring: null,
		tooltipsConfig: null,
		portalUtils: null,

		selectedID: null,

		editSaveBtnNode: null,
		cancelBtnNode: null,
		emailUserBtn: null,
		drawTimeLabelNode: null,
		numLayerLabelNode: null,
		popupsLabelNode: null,
		sharingLabelNode: null,

		performanceNode: null,
		currentOverallScoreNode: null,
		nominateBtnNode: null,

		constructor: function (response, layers, validator, nominateUtils, userInterfaceUtils, scoringUtils, scoring, tooltipsConfig, portalUtils) {
			this.response = response;
			this.layers = layers;
			this.validator = validator;
			this.nominateUtils = nominateUtils;
			this.userInterfaceUtils = userInterfaceUtils;
			this.scoringUtils = scoringUtils;
			this.scoring = scoring;
			this.tooltipsConfig = tooltipsConfig;
			this.portalUtils = portalUtils;
			this.selectedID = response.itemInfo.item.id;

			this.emailUserBtn = query(".email-btn")[0];
			this.drawTimeLabelNode = query(".draw-time-attr-label")[0];
			this.numLayerLabelNode = query(".num-layers-attr-label")[0];
			this.popupsLabelNode = query(".popups-attr-label")[0];
			this.sharingLabelNode = query(".sharing-attr-label")[0];

			// tooltip nodes
			var mapLayersTooltipNode = query(".map-layers-tooltip")[0],
					sharingNode = query(".sharing-tooltip")[0],
					drawTimeTooltipNode = query(".draw-time-tooltip")[0],
					popupsTooltipNode = query(".sharing-attr-label")[0];
			// create tooltips
			this.userInterfaceUtils.createTooltips([
				mapLayersTooltipNode,
				sharingNode,
				drawTimeTooltipNode,
				popupsTooltipNode
			], [
				this.tooltipsConfig.PERFORMANCE_MAP_LAYERS_TOOLTIP_CONTENT,
				this.tooltipsConfig.PERFORMANCE_SHARING_TOOLTIP_CONTENT,
				this.tooltipsConfig.PERFORMANCE_DRAW_TIME_TOOLTIP_CONTENT,
				this.tooltipsConfig.PERFORMANCE_POP_UPS_TOOLTIP_CONTENT
			]);

			// map draw time nodes
			var mdtScoreContainerNode = query(".mdt-score-gr")[0],
					mdtNumeratorNode = query(".mdt-score-num")[0],
					mdtDenominatorNode = query(".mdt-score-denom")[0];
			var mdtGoodNode = query(".performance-text-very-slow")[0],
					mdtBetterNode = query(".performance-text-slow")[0],
					mdtBestNode = query(".performance-text-good")[0];
			if (this.scoringUtils.mapDrawTimeScore === this.scoring.PERFORMANCE_DRAW_TIME_BEST_SCORE) {
				domStyle.set(mdtGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(mdtBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(mdtBestNode, "color", "#0079C1");
			} else if (this.scoringUtils.mapDrawTimeScore === this.scoring.PERFORMANCE_DRAW_TIME_BETTER_SCORE) {
				domStyle.set(mdtGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(mdtBetterNode, "color", "#0079C1");
				domStyle.set(mdtBestNode, "color", "rgba(0, 122, 194, 0.24)");
			} else if (this.scoringUtils.mapDrawTimeScore === this.scoring.PERFORMANCE_DRAW_TIME_GOOD_SCORE) {
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
			if (this.scoringUtils.nLayersScore === this.scoring.LAYER_COUNT_GOOD_SCORE) {
				// GOOD
				domStyle.set(nLayersGoodNode, "color", this.scoring.PASS_COLOR);
				domStyle.set(nLayersBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(nLayersBestNode, "color", "rgba(0, 122, 194, 0.24)");
			} else if (this.scoringUtils.nLayersScore === this.scoring.LAYER_COUNT_BETTER_SCORE) {
				// BETTER
				domStyle.set(nLayersGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(nLayersBetterNode, "color", this.scoring.PASS_COLOR);
				domStyle.set(nLayersBestNode, "color", "rgba(0, 122, 194, 0.24)");
			} else if (this.scoringUtils.nLayersScore === this.scoring.LAYER_COUNT_BEST_SCORE) {
				// BEST
				domStyle.set(nLayersGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(nLayersBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(nLayersBestNode, "color", this.scoring.PASS_COLOR);
			} else {
				// NO LAYERS
				domStyle.set(nLayersGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(nLayersBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(nLayersBestNode, "color", "rgba(0, 122, 194, 0.24)");
			}

			this.scoringUtils.popupsScore = this.validator.setPopupScore(response);
			// popups
			var popupsScoreContainerNode = query(".popups-score-gr")[0],
					popupsNumeratorNode = query(".popups-score-num")[0],
					popupsDenominatorNode = query(".popups-score-denom")[0];
			var popupsNoneNode = query(".performance-popups-none")[0],
					popupsDefaultNode = query(".performance-popups-default")[0],
					popupsCustomNode = query(".performance-popups-custom")[0];

			if (this.scoringUtils.popupsScore === 7) {
				domStyle.set(popupsNoneNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(popupsDefaultNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(popupsCustomNode, "color", this.scoring.PASS_COLOR);
			} else if (this.scoringUtils.popupsScore === 2) {
				domStyle.set(popupsNoneNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(popupsDefaultNode, "color", this.scoring.PASS_COLOR);
				domStyle.set(popupsCustomNode, "color", "rgba(0, 122, 194, 0.24)");
			} else {
				domStyle.set(popupsNoneNode, "color", this.scoring.PASS_COLOR);
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
			if (this.scoringUtils.sharingScore === this.scoring.PERFORMANCE_SHARING_PRIVATE_SCORE) {
				// GOOD
				domStyle.set(sharingGoodNode, "color", this.scoring.PASS_COLOR);
				domStyle.set(sharingBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(sharingBestNode, "color", "rgba(0, 122, 194, 0.24)");
			} else if (this.scoringUtils.sharingScore === this.scoring.PERFORMANCE_SHARING_ORG_SCORE) {
				// BETTER
				domStyle.set(sharingGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(sharingBetterNode, "color", this.scoring.PASS_COLOR);
				domStyle.set(sharingBestNode, "color", "rgba(0, 122, 194, 0.24)");
			} else {
				// BEST
				domStyle.set(sharingGoodNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(sharingBetterNode, "color", "rgba(0, 122, 194, 0.24)");
				domStyle.set(sharingBestNode, "color", this.scoring.PASS_COLOR);
			}

			// set the numerators
			mdtNumeratorNode.innerHTML = this.scoringUtils.mapDrawTimeScore;
			layerCountNumeratorNode.innerHTML = this.scoringUtils.nLayersScore;
			popupsNumeratorNode.innerHTML = this.scoringUtils.popupsScore;
			sharingNumeratorNode.innerHTML = this.scoringUtils.sharingScore;
			// set the denominators
			mdtDenominatorNode.innerHTML = layerCountDenominatorNode.innerHTML = popupsDenominatorNode.innerHTML = sharingDenominatorNode.innerHTML = this.scoring.PERFORMANCE_MAX;

			// update the section styles
			this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.mapDrawTimeScore, this.scoringUtils.PERFORMANCE_DRAW_TIME_MAX_SCORE, mdtScoreContainerNode);
			this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.nLayersScore, this.scoringUtils.PERFORMANCE_LAYER_COUNT_MAX_SCORE, nLayersScoreContainerNode);
			this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.popupsScore, this.scoringUtils.PERFORMANCE_POPUPS_MAX_SCORE, popupsScoreContainerNode);
			this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.sharingScore, this.scoringUtils.PERFORMANCE_SHARING_MAX_SCORE, sharingContainerNode);

			this.userInterfaceUtils.getFeature(this.selectedID).then(lang.hitch(this, function (response) {
				var notesFeature = response.features[0];
				if (notesFeature) {
					on(this.drawTimeLabelNode, mouse.enter, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseEnterHandler, this.drawTimeLabelNode)));
					on(this.drawTimeLabelNode, mouse.leave, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseLeaveHandler, this.drawTimeLabelNode)));
					on(this.drawTimeLabelNode, "click", lang.hitch(this, this.adminNodeClickHandler));

					on(this.numLayerLabelNode, mouse.enter, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseEnterHandler, this.numLayerLabelNode)));
					on(this.numLayerLabelNode, mouse.leave, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseLeaveHandler, this.numLayerLabelNode)));
					on(this.numLayerLabelNode, "click", lang.hitch(this, this.adminNodeClickHandler));

					on(this.popupsLabelNode, mouse.enter, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseEnterHandler, this.popupsLabelNode)));
					on(this.popupsLabelNode, mouse.leave, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseLeaveHandler, this.popupsLabelNode)));
					on(this.popupsLabelNode, "click", lang.hitch(this, this.adminNodeClickHandler));

					on(this.sharingLabelNode, mouse.enter, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseEnterHandler, this.sharingLabelNode)));
					on(this.sharingLabelNode, mouse.leave, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseLeaveHandler, this.sharingLabelNode)));
					on(this.sharingLabelNode, "click", lang.hitch(this, this.adminNodeClickHandler));
				}
			}));

			on(this.emailUserBtn, "click", lang.hitch(this, function () {
				// display final email
				this.openEmailDialog();
			}));
		},

		adminNodeClickHandler: function (evt) {
			var label = evt.target.innerHTML;

			// destroy dijit
			if (dijit.byId("adminDialog") !== undefined) {
				dijit.byId("adminDialog").destroy();
			}

			// pass in the textarea we want to set focus on
			if (dijit.byId("adminDialog") === undefined) {
				if (label === "draw time") {
					lang.hitch(this, this.loadAdminDialog("draw-time-attr-label"));
				} else if (label === "number of map layers") {
					lang.hitch(this, this.loadAdminDialog("num-layers-attr-label"));
				} else if (label === "pop ups") {
					lang.hitch(this, this.loadAdminDialog("popups-attr-label"));
				} else if (label === "sharing") {
					lang.hitch(this, this.loadAdminDialog("sharing-attr-label"));
				}
			}
		},

		loadAdminDialog: function (focusedNode) {
			this.userInterfaceUtils.getFeature(this.selectedID).then(lang.hitch(this, function (response) {
				var feature = response.features[0];

				var adminDialog = new Dialog({
					id: "adminDialog",
					title: "PERFORMANCE Section",
					class: "details-admin-dialog",
					onFocus: function () {
						focusUtil.focus(dom.byId(focusedNode));
					}
				});

				adminDialog.set("content",
						"<div class='row attribute-row'>" +
								"	<div class='column-6'>" +
								"		<div class='dialog-label'> Map Draw Time Notes : <\/div>" +
								"	<\/div>" +
								"	<div class='column-18'>" +
								"		<textarea id='drawTimeNotesTextArea'>" + feature.attributes.notesDrawTime + "<\/textarea>" +
								"	<\/div>" +
								"<\/div>" +

								"<div class='row attribute-row'>" +
								"	<div class='column-6'>" +
								"		<div class='dialog-label'> Number of Layers Notes : <\/div>" +
								"	<\/div>" +
								"	<div class='column-18'>" +
								"		<textarea id='numLayersNotesTextArea'>" + feature.attributes.notesNumberOfLayers + "<\/textarea>" +
								"	<\/div>" +
								"<\/div>" +

								"<div class='row attribute-row'>" +
								"	<div class='column-6'>" +
								"		<div class='dialog-label'> Popups Notes : <\/div>" +
								"	<\/div>" +
								"	<div class='column-18'>" +
								"		<textarea id='popupsNotesTextArea'>" + feature.attributes.notesPopups + "<\/textarea>" +
								"	<\/div>" +
								"<\/div>" +

								"<div class='row attribute-row'>" +
								"	<div class='column-6'>" +
								"		<div class='dialog-label'> Sharing Notes : <\/div>" +
								"	<\/div>" +
								"	<div class='column-18'>" +
								"		<textarea id='sharingNotesTextArea'>" + feature.attributes.notesSharing  + "<\/textarea>" +
								"	<\/div>" +
								"<\/div>" +

								"<div class='row right dialog-btn-row'>" +
								"	<div class='column-10'>" +
								"		<button class='btn item-title-btn-save'> Save <\/button>" +
								"	<\/div>" +
								"	<div class='column-3'>" +
								"		<button class='btn item-title-btn-cancel'> Cancel <\/button>" +
								"	<\/div>" +
								"<\/div>");

				// Dialog SAVE btn
				on(query(".item-title-btn-save"), "click", lang.hitch(this, function () {
					// Populate the fields of the dialog with any existing values from nomcur
					this.portalUtils.portalUser.getItem(this.selectedID).then(lang.hitch(this, function (item) {
						var mapDrawTimeNotes = dom.byId("drawTimeNotesTextArea").value;
						var numLayersNotes = dom.byId("numLayersNotesTextArea").value;
						var popupNotes = dom.byId("popupsNotesTextArea").value;
						var sharingNotes = dom.byId("sharingNotesTextArea").value;
						this.userInterfaceUtils.getFeature(this.selectedID).then(lang.hitch(this, lang.partial(this.updateAdminDialogNotes, mapDrawTimeNotes, numLayersNotes, popupNotes, sharingNotes)));
					}));
				}));

				// Dialog CANCEL btn
				on(query(".item-title-btn-cancel"), "click", lang.hitch(this, function () {
					adminDialog.hide();
				}));

				// show dialog
				adminDialog.show();
			}));
		},

		updateAdminDialogNotes: function (mapDrawTimeNotes, numLayersNotes, popupNotes, sharingNotes, response) {
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
			var attr = {
				"FID": feature.attributes.FID,
				"LastContactComments": dateTime,
				"notesDrawTime": mapDrawTimeNotes,
				"notesNumberOfLayers": numLayersNotes,
				"notesPopups": popupNotes,
				"notesSharing": sharingNotes
			};
			var graphic = new Graphic(pt, sms, attr);
			this.nominateUtils.nominateAdminFeatureLayer.applyEdits(null, [graphic], null);
		}
	});
});