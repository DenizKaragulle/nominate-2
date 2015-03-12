define([
	"esri/Color",
	"esri/request",
	"esri/geometry/Point",
	"esri/graphic",
	"esri/layers/FeatureLayer",
	"esri/symbols/SimpleMarkerSymbol",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/html",
	"dojo/mouse",
	"dojo/on",
	"dojo/query",
	"dijit/Dialog",
	"dijit/focus",
	"dijit/Editor",
	"dijit/_editor/plugins/LinkDialog",
	"dijit/_editor/plugins/TextColor",
	"dijit/_editor/plugins/ViewSource",
	"dijit/_editor/plugins/FontChoice",
	"dijit/form/Button",
	"config/defaults",
	"config/adminUtils"
], function (Color, esriRequest, Point, Graphic, FeatureLayer, SimpleMarkerSymbol, array, declare, lang, dom, domAttr, domClass, domConstruct,
			 domStyle, html, mouse, on, query, Dialog, focusUtil, Editor, LinkDialog, TextColor, ViewSource, FontChoice, Button, defaults, AdminUtils) {

	return declare([AdminUtils], {

		validator: null,
		nominateUtils: null,
		userInterfaceUtils: null,
		scoringUtils: null,
		scoring: null,
		tooltipsConfig: null,
		portalUtils: null,

		selectedID: null,

		itemCredits: null,
		itemCredits_clean: null,
		accessAndUseConstraints: null,
		accessAndUseConstraints_clean: null,

		creditsNode: null,

		editSaveBtnNode: null,
		cancelBtnNode: null,
		emailUserBtn: null,
		creditsLabelNode: null,
		accessAndUseConstraintsLabelNode: null,

		accessConstraintsTooltipNode: null,
		creditsTooltipNode: null,
		itemCreditsNode: null,
		accessAndUseConstraintsEditorNode: null,
		creditsScoreNodeContainer: null,
		creditsScoreNumeratorNode: null,
		creditsScoreDenominatorNode: null,
		accessScoreNodeContainer: null,
		accessScoreNumeratorNode: null,
		accessScoreDenominatorNode: null,

		constructor: function (item, validator, nominateUtils, userInterfaceUtils, scoringUtils, scoring, tooltipsConfig, portalUtils) {
			this.validator = validator;
			this.nominateUtils = nominateUtils;
			this.userInterfaceUtils = userInterfaceUtils;
			this.scoringUtils = scoringUtils;
			this.scoring = scoring;
			this.tooltipsConfig = tooltipsConfig;
			this.portalUtils = portalUtils;

			this.selectedID = item.id;
			this.creditsID = "credits-" + this.selectedID;
			this.licenseID = "license-" + this.selectedID;

			this.currentOverallScoreNode = query(".current-score-number")[0];
			this.nominateBtnNode = dom.byId(this.nominateUtils.nominateBtnID);
			this.creditsNode = query(".credits")[0];

			this.itemCredits = this.validator.validateStr(item.accessInformation);
			this.itemCredits_clean = this.itemCredits;
			this.accessAndUseConstraints = this.validator.validateStr(item.licenseInfo);
			this.accessAndUseConstraints_clean = this.accessAndUseConstraints;

			// edit/save button
			this.editSaveBtnNode = query(".edit-save-btn")[0];
			// cancel button
			this.cancelBtnNode = query(".cancel-btn")[0];
			// email user button
			this.emailUserBtn = query(".email-btn")[0];
			// credits label
			this.creditsLabelNode = query(".credits-attr-label")[0];
			// access and use constraints label
			this.accessAndUseConstraintsLabelNode = query(".access-and-use-constraints-label")[0];

			this.accessConstraintsTooltipNode = query(".access-constraints-tooltip")[0];
			this.creditsTooltipNode = query(".credits-tooltip")[0];
			this.itemCreditsNode = query(".creditsID-textbox")[0];
			this.accessAndUseConstraintsEditorNode = query(".accessAndUseConstraintsEditor")[0];
			this.creditsScoreNodeContainer = query(".credits-score-gr")[0];
			this.creditsScoreNumeratorNode = query(".credits-score-num")[0];
			this.creditsScoreDenominatorNode = query(".credits-score-denom")[0];
			this.accessScoreNodeContainer = query(".access-score-gr")[0];
			this.accessScoreNumeratorNode = query(".access-score-num")[0];
			this.accessScoreDenominatorNode = query(".access-score-denom")[0];

			domAttr.set(query(".creditsID-textbox")[0], "id", this.creditsID);
			domConstruct.create("div", {
				innerHTML: this.itemCredits
			}, query(".creditsID-textbox")[0], "first");

			domAttr.set(query(".accessAndUseConstraintsEditor")[0], "id", this.licenseID);
			if (this.accessAndUseConstraints === "") {
				domConstruct.place("<span></span>", "access-editor-widget", "first");
			} else {
				domConstruct.place("<span>" + this.accessAndUseConstraints + "</span>", "access-editor-widget", "first");
			}

			this.userInterfaceUtils.createTooltips([
				this.accessConstraintsTooltipNode,
				this.creditsTooltipNode
			], [
				this.tooltipsConfig.CREDITS_TOOLTIP_CONTENT,
				this.tooltipsConfig.ACCESS_TOOLTIP_CONTENT
			]);

			this.creditsScoreDenominatorNode.innerHTML = this.scoringUtils.ITEM_CREDIT_MAX_SCORE;
			this.accessScoreDenominatorNode.innerHTML = this.scoringUtils.ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE;

			this.scoringUtils.itemCreditsScore = this.validator.setCreditsScore(item.accessInformation);
			this.scoringUtils.itemAccessAndUseConstraintsScore = this.validator.setAccessAndUseConstraintsScore(item.licenseInfo);
			this.creditsScoreNumeratorNode.innerHTML = this.scoringUtils.itemCreditsScore;
			this.accessScoreNumeratorNode.innerHTML = this.scoringUtils.itemAccessAndUseConstraintsScore;

			this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemCreditsScore, this.scoringUtils.ITEM_CREDIT_MAX_SCORE, this.creditsScoreNodeContainer);
			this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemAccessAndUseConstraintsScore, this.scoringUtils.ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE, this.accessScoreNodeContainer);

			this.scoringUtils.creditsAndAccessScore = this.scoringUtils.itemCreditsScore + this.scoringUtils.itemAccessAndUseConstraintsScore;
			this.scoringUtils.updateSectionScore(this.scoringUtils.creditsAndAccessScore, this.creditsNode, this.scoringUtils.ITEM_USE_CONSTRAINS_MAX_SCORE);
			this.scoringUtils.updateOverallScore();

			// only permit nominated items to have notes added by curators
			this.userInterfaceUtils.getFeature(item.id).then(lang.hitch(this, function (response) {
				var notesFeature = response.features[0];
				if (notesFeature) {
					on(this.creditsLabelNode, mouse.enter, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseEnterHandler, this.creditsLabelNode)));
					on(this.creditsLabelNode, mouse.leave, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseLeaveHandler, this.creditsLabelNode)));
					on(this.creditsLabelNode, "click", lang.hitch(this, this.adminNodeClickHandler));

					on(this.accessAndUseConstraintsLabelNode, mouse.enter, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseEnterHandler, this.accessAndUseConstraintsLabelNode)));
					on(this.accessAndUseConstraintsLabelNode, mouse.leave, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseLeaveHandler, this.accessAndUseConstraintsLabelNode)));
					on(this.accessAndUseConstraintsLabelNode, "click", lang.hitch(this, this.adminNodeClickHandler));
				}
			}));

			// SAVE/EDIT
			on(this.editSaveBtnNode, "click", lang.hitch(this, function () {
				if (this.editSaveBtnNode.innerHTML === defaults.EDIT_BTN_LABEL) {
					domAttr.set(this.editSaveBtnNode, "innerHTML", defaults.SAVE_BTN_LABEL);
					domStyle.set(this.cancelBtnNode, "display", "block");
					// credits
					if (this.itemCredits === "<span></span>") {
						this.itemCredits = "";
					}

					domConstruct.empty(this.itemCreditsNode);
					domConstruct.create("input", {
						class: "edit-credits",
						value: this.itemCredits
					}, this.itemCreditsNode, "first");
					domAttr.set(this.itemCreditsNode, "data-dojo-type", "dijit/form/TextBox");
					domAttr.set(this.itemCreditsNode, "id", this.creditsID);

					// access and user constraints
					if (dijit.byId("access-editor-widget")) {
						dijit.byId("access-editor-widget").destroy();
						domAttr.remove(this.accessAndUseConstraintsEditorNode, "id");
						domConstruct.create("div", {
							id: "access-editor-widget",
							innerHTML: this.accessAndUseConstraints
						}, this.accessAndUseConstraintsEditorNode, "first");
					}
					var accessUseConstraintsEditor = new Editor({
						plugins: defaults.EDITOR_PLUGINS,
						innerHTML: this.accessAndUseConstraints
					}, dom.byId("access-editor-widget"));
					accessUseConstraintsEditor.startup();
				} else {
					// credits
					this.itemCredits = query(".edit-credits")[0].value;
					this.accessAndUseConstraints = dijit.byId("access-editor-widget").value;

					domConstruct.empty(this.itemCreditsNode);
					domConstruct.create("div", {
						innerHTML: this.itemCredits
					}, this.itemCreditsNode, "first");
					domAttr.remove(this.itemCreditsNode, "data-dojo-type");
					domAttr.set(this.itemCreditsNode, "id", this.creditsID);

					this.portalUtils.portalUser.getItem(item.id).then(lang.hitch(this, function (results) {
						var _userItemUrl = results.userItemUrl;

						if (this.itemCredits.length === 0) {
							this.itemCredits = "<span></span>";
						}

						if (this.accessAndUseConstraints.length === 0) {
							this.accessAndUseConstraints = "<span></span>";
						}

						esriRequest({
							url: _userItemUrl + "/update",
							content: {
								f: "json",
								licenseInfo: this.accessAndUseConstraints,
								accessInformation: this.itemCredits
							}
						}, {
							usePost: true
						}).then(lang.hitch(this, function (response) {
									if (response.success) {
										domAttr.set(this.editSaveBtnNode, "innerHTML", defaults.EDIT_BTN_LABEL);
										domStyle.set(this.cancelBtnNode, "display", "none");
										this.accessAndUseConstraints_clean = this.accessAndUseConstraints;
										this.itemCredits_clean = this.itemCredits;
									}
								}));
					}));

					if (dijit.byId("access-editor-widget")) {
						dijit.byId("access-editor-widget").destroy();
					}

					domAttr.remove(this.accessAndUseConstraintsEditorNode, "id");
					domConstruct.create("div", {
						id: "access-editor-widget"
					}, this.accessAndUseConstraintsEditorNode, "first");

					if (this.accessAndUseConstraints === "") {
						domConstruct.place("<span></span>", "access-editor-widget", "first");
					} else {
						domConstruct.place("<span>" + this.accessAndUseConstraints + "</span>", "access-editor-widget", "first");
					}

					// set numerator
					this.scoringUtils.itemCreditsScore = this.validator.setCreditsScore(this.itemCredits);
					this.scoringUtils.itemAccessAndUseConstraintsScore = this.validator.setAccessAndUseConstraintsScore(this.accessAndUseConstraints);
					this.creditsScoreNumeratorNode.innerHTML = this.scoringUtils.itemCreditsScore;
					this.accessScoreNumeratorNode.innerHTML = this.scoringUtils.itemAccessAndUseConstraintsScore;

					// update section style score graphics
					this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemCreditsScore, this.scoringUtils.ITEM_CREDIT_MAX_SCORE, this.creditsScoreNodeContainer);
					this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemAccessAndUseConstraintsScore, this.scoringUtils.ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE, this.accessScoreNodeContainer);

					this.scoringUtils.creditsAndAccessScore = this.scoringUtils.itemCreditsScore + this.scoringUtils.itemAccessAndUseConstraintsScore;
					this.scoringUtils.updateSectionScore(this.scoringUtils.creditsAndAccessScore, this.creditsNode, this.scoringUtils.ITEM_USE_CONSTRAINS_MAX_SCORE);
					this.scoringUtils.updateOverallScore();
				}
			}));
			// CANCEL
			on(this.cancelBtnNode, "click", lang.hitch(this, function () {
				domConstruct.empty(this.itemCreditsNode);
				domConstruct.create("div", {
					innerHTML: this.itemCredits_clean
				}, this.itemCreditsNode, "first");
				domAttr.remove(this.itemCreditsNode, "data-dojo-type");
				domAttr.set(this.itemCreditsNode, "id", this.creditsID);

				if (dijit.byId("access-editor-widget")) {
					dijit.byId("access-editor-widget").destroy();
				}

				domAttr.remove(this.accessAndUseConstraintsEditorNode, "id");
				domConstruct.create("div", {
					id: "access-editor-widget"
				}, this.accessAndUseConstraintsEditorNode, "first");

				if (this.accessAndUseConstraints === "") {
					domConstruct.place("<span></span>", "access-editor-widget", "first");
				} else {
					domConstruct.place("<span>" + this.accessAndUseConstraints_clean + "</span>", "access-editor-widget", "first");
				}

				domAttr.set(this.editSaveBtnNode, "innerHTML", defaults.EDIT_BTN_LABEL);
				domStyle.set(this.cancelBtnNode, "display", "none");

				// set numerator
				this.scoringUtils.itemCreditsScore = this.validator.setCreditsScore(this.itemCredits_clean);
				this.scoringUtils.itemAccessAndUseConstraintsScore = this.validator.setAccessAndUseConstraintsScore(this.accessAndUseConstraints_clean);
				this.creditsScoreNumeratorNode.innerHTML = this.scoringUtils.itemCreditsScore;
				this.accessScoreNumeratorNode.innerHTML = this.scoringUtils.itemAccessAndUseConstraintsScore;

				// update section style score graphics
				this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemCreditsScore, this.scoringUtils.ITEM_CREDIT_MAX_SCORE, this.creditsScoreNodeContainer);
				this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemAccessAndUseConstraintsScore, this.scoringUtils.ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE, this.accessScoreNodeContainer);

				this.scoringUtils.creditsAndAccessScore = this.scoringUtils.itemCreditsScore + this.scoringUtils.itemAccessAndUseConstraintsScore;
				this.scoringUtils.updateSectionScore(this.scoringUtils.creditsAndAccessScore, this.creditsNode, this.scoringUtils.ITEM_USE_CONSTRAINS_MAX_SCORE);
				this.scoringUtils.updateOverallScore();
			}));
			// EMAIL
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
				if (label === "Credits") {
					lang.hitch(this, this.loadAdminDialog("itemCreditsNotesTextArea"));
				} else if (label === "Access and Use Constraints") {
					lang.hitch(this, this.loadAdminDialog("itemAccessUseConstraintsNotesTextArea"));
				}
			}
		},

		loadAdminDialog: function (focusedNode) {
			this.userInterfaceUtils.getFeature(this.selectedID).then(lang.hitch(this, function (response) {
				var feature = response.features[0];

				var adminDialog = new Dialog({
					id: "adminDialog",
					title: "USE/CREDITS Section",
					class: "details-admin-dialog",
					onFocus: function () {
						focusUtil.focus(dom.byId(focusedNode));
					}
				});

				adminDialog.set("content",
						"<div class='row attribute-row'>" +
								"	<div class='column-6'>" +
								"		<div class='dialog-label'> Credits Notes : <\/div>" +
								"	<\/div>" +
								"	<div class='column-18'>" +
								"		<textarea id='itemCreditsNotesTextArea'>" + feature.attributes.notesCredits + "<\/textarea>" +
								"	<\/div>" +
								"<\/div>" +

								"<div class='row attribute-row'>" +
								"	<div class='column-6'>" +
								"		<div class='dialog-label'> Access and Use Constraints Notes : <\/div>" +
								"	<\/div>" +
								"	<div class='column-18'>" +
								"		<textarea id='itemAccessUseConstraintsNotesTextArea'>" + feature.attributes.notesAccessUseConstraints + "<\/textarea>" +
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
						var creditsNotes = dom.byId("itemCreditsNotesTextArea").value;
						var accessUseConstraintsNotes = dom.byId("itemAccessUseConstraintsNotesTextArea").value;
						// apply updates to the feature layer
						this.userInterfaceUtils.getFeature(this.selectedID).then(lang.hitch(this, lang.partial(this.updateAdminDialogNotes, creditsNotes, accessUseConstraintsNotes)));
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

		updateAdminDialogNotes: function (itemCreditsNotes, itemAccessAndUseConstraintsNotes, response) {
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
				"notesCredits": itemCreditsNotes,
				"notesAccessUseConstraints": itemAccessAndUseConstraintsNotes
			};
			var graphic = new Graphic(pt, sms, attr);
			this.nominateUtils.nominateAdminFeatureLayer.applyEdits(null, [graphic], null);
		}
	});
});