define([
	"put-selector/put",
	"esri/Color",
	"esri/request",
	"esri/geometry/Point",
	"esri/graphic",
	"esri/layers/FeatureLayer",
	"esri/symbols/SimpleMarkerSymbol",
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
	"dijit/Dialog",
	"dijit/focus",
	"dijit/Editor",
	"dijit/_editor/plugins/LinkDialog",
	"dijit/_editor/plugins/TextColor",
	"dijit/_editor/plugins/ViewSource",
	"dijit/_editor/plugins/FontChoice",
	"dijit/form/Button",
	"dijit/form/Textarea",
	"config/defaults",
	"config/adminUtils"
], function (put, Color, esriRequest, Point, Graphic, FeatureLayer, SimpleMarkerSymbol, array, declare, lang, Deferred, dom, domAttr, domClass, domConstruct, domStyle, html, mouse, on, query, Dialog, focusUtil, Editor, LinkDialog, TextColor, ViewSource, FontChoice, Button, Textarea, defaults, AdminUtils) {

	return declare([AdminUtils], {

		itemStore:null,
		validator:null,
		nominateUtils:null,
		userInterfaceUtils:null,
		scoringUtils:null,
		scoring:null,
		tooltipsConfig:null,
		portalUtils:null,

		selectedID:null,
		item:null,
		titleID:null,
		snippetID:null,
		descID:null,

		currentOverallScoreNode:null,
		nominateBtnNode:null,

		detailsNode:null,
		editSaveBtnNode:null,
		cancelBtnNode:null,
		emailUserBtn:null,
		thumbnailLabelNode:null,
		titleNode:null,
		summaryLabelNode:null,
		descriptionLabelNode:null,

		itemThumbnailNode:null,
		itemOpenLinkNode:null,
		itemTitleNode:null,
		itemSummaryNode:null,
		itemDescriptionNode:null,
		// tooltip nodes
		itemThumbnailTooltipNode:null,
		itemTitleTooltipNode:null,
		itemSummaryTooltipNode:null,
		itemDescriptionTooltipNode:null,
		// sections scores
		thumbnailScoreNodeContainer:null,
		thumbnailScoreNumeratorNode:null,
		thumbnailScoreDenominatorNode:null,
		titleScoreNodeContainer:null,
		titleScoreNumeratorNode:null,
		titleScoreDenominatorNode:null,
		summaryScoreNodeContainer:null,
		summaryScoreNumeratorNode:null,
		summaryScoreDenominatorNode:null,
		descScoreNodeContainer:null,
		descScoreNumeratorNode:null,
		descScoreDenominatorNode:null,
		itemThumbnailListener:null,

		// item title
		itemTitle:null,
		itemTitle_clean:null,
		// item summary
		itemSummary:null,
		itemSummary_clean:null,
		// item description
		itemDescription:null,
		itemDescription_clean:null,
		// thumbnail url
		thumbnailUrl:null,
		thumbnailUrl_clean:null,

		detailsAdminDialog:null,

		constructor:function (item, itemStore, validator, nominateUtils, userInterfaceUtils, scoringUtils, scoring, tooltipsConfig, portalUtils) {
			this.validator = validator;
			this.itemStore = itemStore;
			this.nominateUtils = nominateUtils;
			this.userInterfaceUtils = userInterfaceUtils;
			this.scoringUtils = scoringUtils;
			this.scoring = scoring;
			this.tooltipsConfig = tooltipsConfig;
			this.portalUtils = portalUtils;

			this.selectedID = item.id;
			this.titleID = "title-" + this.selectedID;
			this.snippetID = "snippet-" + this.selectedID;
			this.descID = "desc-" + this.selectedID;

			this.currentOverallScoreNode = query(".current-score-number")[0];
			this.nominateBtnNode = dom.byId(this.nominateUtils.nominateBtnID);

			this.detailsNode = query(".details")[0];

			this.itemTitle = this.validator.validateStr(item.title);
			this.itemTitle_clean = this.itemTitle;

			// item summary
			this.itemSummary = this.validator.validateStr(item.snippet);
			this.itemSummary_clean = this.itemSummary;
			// item description
			this.itemDescription = this.validator.validateStr(item.description);
			this.itemDescription_clean = this.itemDescription;
			// thumbnail url
			this.thumbnailUrl = this.userInterfaceUtils.formatThumbnailUrl(item);
			this.thumbnailUrl_clean = this.thumbnailUrl;

			// edit/save button
			this.editSaveBtnNode = query(".edit-save-btn")[0];
			// cancel button
			this.cancelBtnNode = query(".cancel-btn")[0];
			this.emailUserBtn = query(".email-btn")[0];
			this.thumbnailLabelNode = query(".thumbnail-attr-label")[0];
			this.titleNode = query(".title-attr-label")[0];
			this.summaryLabelNode = query(".summary-attr-label")[0];
			this.descriptionLabelNode = query(".description-attr-label")[0];

			this.itemThumbnailNode = query(".thumbnailUrl")[0];
			this.itemOpenLinkNode = query(".open-item-icon")[0];
			this.itemTitleNode = query(".title-textbox")[0];
			this.itemSummaryNode = query(".summary-textbox")[0];
			this.itemDescriptionNode = query(".description-editor")[0];
			// tooltip nodes
			this.itemThumbnailTooltipNode = query(".thumbnail-tooltip")[0];
			this.itemTitleTooltipNode = query(".title-tooltip")[0];
			this.itemSummaryTooltipNode = query(".summary-tooltip")[0];
			this.itemDescriptionTooltipNode = query(".description-tooltip")[0];
			// sections scores
			this.thumbnailScoreNodeContainer = query(".item-thumbnail-score-gr")[0];
			this.thumbnailScoreNumeratorNode = query(".item-thumbnail-score-num")[0];
			this.thumbnailScoreDenominatorNode = query(".item-thumbnail-score-denom")[0];
			this.titleScoreNodeContainer = query(".details-title-score-gr")[0];
			this.titleScoreNumeratorNode = query(".details-title-score-num")[0];
			this.titleScoreDenominatorNode = query(".details-title-score-denom")[0];
			this.summaryScoreNodeContainer = query(".details-summary-score-gr")[0];
			this.summaryScoreNumeratorNode = query(".details-summary-score-num")[0];
			this.summaryScoreDenominatorNode = query(".details-summary-score-denom")[0];
			this.descScoreNodeContainer = query(".details-desc-score-gr")[0];
			this.descScoreNumeratorNode = query(".details-desc-score-num")[0];
			this.descScoreDenominatorNode = query(".details-desc-score-denom")[0];
			this.itemThumbnailListener = null;

			// set the thumbnail
			domAttr.set(this.itemThumbnailNode, "src", this.thumbnailUrl);
			domAttr.set(this.itemThumbnailNode, "class", "expanded-item-thumbnail thumbnailUrl expanded-item-thumbnail-" + item.id);
			// set the title
			domAttr.set(this.itemTitleNode, "id", this.titleID);
			domConstruct.create("div", {
				innerHTML:this.itemTitle
			}, this.itemTitleNode, "first");
			// set the summary
			domAttr.set(this.itemSummaryNode, "id", this.snippetID);
			domAttr.set(this.itemSummaryNode, "value", this.itemSummary);
			domConstruct.create("div", {
				innerHTML:this.itemSummary
			}, this.itemSummaryNode, "first");
			// set the description
			domAttr.set(this.itemDescriptionNode, "id", this.descID);
			if (this.itemDescription === "") {
				domConstruct.place("<span></span>", "description-editor-widget", "first");
			} else {
				domConstruct.place("<span>" + this.itemDescription + "</span>", "description-editor-widget", "first");
			}

			//tooltips
			this.userInterfaceUtils.createTooltips([
				this.itemThumbnailTooltipNode,
				this.itemTitleTooltipNode,
				this.itemSummaryTooltipNode,
				this.itemDescriptionTooltipNode
			], [
				this.tooltipsConfig.ITEM_THUMBNAIL_TOOLTIP_CONTENT,
				this.tooltipsConfig.ITEM_TITLE_TOOLTIP_CONTENT,
				this.tooltipsConfig.ITEM_SUMMARY_TOOLTIP_CONTENT,
				this.tooltipsConfig.ITEM_DESCRIPTION_TOOLTIP_CONTENT
			]);

			// open item link
			on(this.itemOpenLinkNode, "click", function () {
				window.open("http://www.arcgis.com/home/item.html?id=" + item.id, "_blank");
			});

			// set denominator
			this.thumbnailScoreDenominatorNode.innerHTML = this.scoringUtils.ITEM_THUMBNAIL_MAX_SCORE;
			this.titleScoreDenominatorNode.innerHTML = this.scoringUtils.ITEM_TITLE_MAX_SCORE;
			this.summaryScoreDenominatorNode.innerHTML = this.scoringUtils.ITEM_SUMMARY_MAX_SCORE;
			this.descScoreDenominatorNode.innerHTML = this.scoringUtils.ITEM_DESC_MAX_SCORE;

			// set numerator
			this.scoringUtils.itemThumbnailScore = this.validator.setThumbnailScore(item);
			this.scoringUtils.itemTitleScore = this.validator.setItemTitleScore(item.title);
			this.scoringUtils.itemSummaryScore = this.validator.setItemSummaryScore(item.snippet);
			this.scoringUtils.itemDescriptionScore = this.validator.setItemDescriptionScore(item.description);
			this.thumbnailScoreNumeratorNode.innerHTML = this.scoringUtils.itemThumbnailScore;
			this.titleScoreNumeratorNode.innerHTML = this.scoringUtils.itemTitleScore;
			this.summaryScoreNumeratorNode.innerHTML = this.scoringUtils.itemSummaryScore;
			this.descScoreNumeratorNode.innerHTML = this.scoringUtils.itemDescriptionScore;

			// update section style score graphics
			this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemThumbnailScore, this.scoringUtils.ITEM_THUMBNAIL_MAX_SCORE, this.thumbnailScoreNodeContainer);
			this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemTitleScore, this.scoringUtils.ITEM_TITLE_MAX_SCORE, this.titleScoreNodeContainer);
			this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemSummaryScore, this.scoringUtils.ITEM_SUMMARY_MAX_SCORE, this.summaryScoreNodeContainer);
			this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemDescriptionScore, this.scoringUtils.ITEM_DESC_MAX_SCORE, this.descScoreNodeContainer);

			// section overall score
			this.scoringUtils.itemDetailsScore = this.scoringUtils.itemThumbnailScore + this.scoringUtils.itemTitleScore + this.scoringUtils.itemSummaryScore + this.scoringUtils.itemDescriptionScore;
			this.scoringUtils.updateSectionScore(this.scoringUtils.itemDetailsScore, this.detailsNode, this.scoringUtils.ITEM_DETAILS_MAX_SCORE);

			if (this.portalUtils.IS_CURATOR) {
				// only permit nominated items to have notes added by curators
				this.userInterfaceUtils.getFeature(item.id).then(lang.hitch(this, function (response) {
					var notesFeature = response.features[0];
					if (notesFeature) {
						// admin dialog hover/click listeners
						on(this.thumbnailLabelNode, mouse.enter, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseEnterHandler, this.thumbnailLabelNode)));
						on(this.thumbnailLabelNode, mouse.leave, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseLeaveHandler, this.thumbnailLabelNode)));
						on(this.thumbnailLabelNode, "click", lang.hitch(this, this.adminNodeClickHandler));

						on(this.titleNode, mouse.enter, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseEnterHandler, this.titleNode)));
						on(this.titleNode, mouse.leave, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseLeaveHandler, this.titleNode)));
						on(this.titleNode, "click", lang.hitch(this, this.adminNodeClickHandler));

						on(this.summaryLabelNode, mouse.enter, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseEnterHandler, this.summaryLabelNode)));
						on(this.summaryLabelNode, mouse.leave, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseLeaveHandler, this.summaryLabelNode)));
						on(this.summaryLabelNode, "click", lang.hitch(this, this.adminNodeClickHandler));

						on(this.descriptionLabelNode, mouse.enter, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseEnterHandler, this.descriptionLabelNode)));
						on(this.descriptionLabelNode, mouse.leave, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseLeaveHandler, this.descriptionLabelNode)));
						on(this.descriptionLabelNode, "click", lang.hitch(this, this.adminNodeClickHandler));
					}
				}));
				// EMAIL
				on(this.emailUserBtn, "click", lang.hitch(this, function () {
					// display final email
					this.openEmailDialog();
				}));
			} else {
				domStyle.set(query(".email-btn")[0], "display", "none");
				domStyle.set(this.nominateUtils.acceptBtnNode, "display", "none");
				domStyle.set(this.editSaveBtnNode, "display", "block");

				on(this.editSaveBtnNode, "click", lang.hitch(this, function () {
					if (this.editSaveBtnNode.innerHTML === defaults.EDIT_BTN_LABEL) {
						// EDIT clicked
						// update EDIT/SAVE button
						this.userInterfaceUtils.updateEditSaveButton(this.editSaveBtnNode, defaults.SAVE_BTN_LABEL, this.cancelBtnNode, "block");
						domStyle.set(query(".expanded-item-thumbnail")[0], "cursor", "pointer");

						// update thumbnail
						domStyle.set(query(".edit-thumbnail-msg")[0], "display", "block");

						// update title
						domConstruct.empty(this.itemTitleNode);
						domConstruct.create("input", {
							class:"edit-title",
							value:this.itemTitle
						}, this.itemTitleNode, "first");
						domAttr.set(this.itemTitleNode, "data-dojo-type", "dijit/form/TextBox");
						domAttr.set(this.itemTitleNode, "id", this.titleID);

						// update summary
						domConstruct.empty(this.itemSummaryNode);
						domConstruct.create("input", {
							class:"edit-summary",
							value:this.itemSummary
						}, this.itemSummaryNode, "first");
						domAttr.set(this.itemSummaryNode, "data-dojo-type", "dijit/form/TextBox");
						domAttr.set(this.itemSummaryNode, "id", this.snippetID);

						// update description
						if (dijit.byId("description-editor-widget")) {
							dijit.byId("description-editor-widget").destroy();
							domAttr.remove(this.itemDescriptionNode, "id");
							domConstruct.create("div", {
								id:"description-editor-widget",
								innerHTML:this.itemDescription
							}, this.itemDescriptionNode, "first");
						}

						// create the Editor for the description
						var descriptionEditor = new Editor({
							plugins:defaults.EDITOR_PLUGINS,
							innerHTML:this.itemDescription
						}, dom.byId("description-editor-widget"));
						descriptionEditor.startup();

						// update thumbnail
						this.itemThumbnailListener = on(query(".expanded-item-thumbnail"), "click", lang.hitch(this, function (event) {
							this.portalUtils.portalUser.getItem(this.selectedID).then(lang.hitch(this, function (userItem) {
								this.uploadItemThumbnail(userItem, "SMALL");
							}));
						}));
					} else {
						this.itemThumbnailListener.remove();

						// SAVE clicked
						this.itemTitle = query(".edit-title")[0].value;
						this.itemSummary = query(".edit-summary")[0].value;
						this.itemDescription = dijit.byId("description-editor-widget").value;

						// for some reason, cannot upload empty strings, probably issue on my end
						if (this.itemDescription.length < 0) {
							this.itemDescription = " ";
						}

						// write to AGOL
						this.portalUtils.portalUser.getItem(item.id).then(lang.hitch(this, function (results) {
							var _userItemUrl = results.userItemUrl;
							esriRequest({
								url:_userItemUrl + "/update",
								content:{
									f:"json",
									title:this.itemTitle,
									snippet:this.itemSummary,
									description:this.itemDescription
								}
							}, {
								usePost:true
							}).then(lang.hitch(this, function (response) {
								if (response.success) {
									// update the title
									html.set(query(".title-" + item.id)[0], this.itemTitle);
									this.itemTitle_clean = this.itemTitle;
									this.itemSummary_clean = this.itemSummary;
									this.itemDescription_clean = this.itemDescription;
									// update the Edit/Save buttons
									this.userInterfaceUtils.updateEditSaveButton(this.editSaveBtnNode, defaults.EDIT_BTN_LABEL, this.cancelBtnNode, "none");
									// update the scoring numerator(s)
									this.scoringUtils.itemThumbnailScore = this.validator.setThumbnailScore(results);
									this.scoringUtils.itemTitleScore = this.validator.setItemTitleScore(this.itemTitle);
									this.scoringUtils.itemSummaryScore = this.validator.setItemSummaryScore(this.itemSummary);
									this.scoringUtils.itemDescriptionScore = this.validator.setItemDescriptionScore(this.itemDescription);
									// update the nodes
									this.thumbnailScoreNumeratorNode.innerHTML = this.scoringUtils.itemThumbnailScore;
									this.titleScoreNumeratorNode.innerHTML = this.scoringUtils.itemTitleScore;
									this.summaryScoreNumeratorNode.innerHTML = this.scoringUtils.itemSummaryScore;
									this.descScoreNumeratorNode.innerHTML = this.scoringUtils.itemDescriptionScore;

									// update section style score graphics
									this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemThumbnailScore, this.scoringUtils.ITEM_THUMBNAIL_MAX_SCORE, this.thumbnailScoreNodeContainer);
									this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemTitleScore, this.scoringUtils.ITEM_TITLE_MAX_SCORE, this.titleScoreNodeContainer);
									this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemSummaryScore, this.scoringUtils.ITEM_SUMMARY_MAX_SCORE, this.summaryScoreNodeContainer);
									this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemDescriptionScore, this.scoringUtils.ITEM_DESC_MAX_SCORE, this.descScoreNodeContainer);

									// section overall score
									this.scoringUtils.itemDetailsScore = this.scoringUtils.itemThumbnailScore + this.scoringUtils.itemTitleScore + this.scoringUtils.itemSummaryScore + this.scoringUtils.itemDescriptionScore;
									this.scoringUtils.updateSectionScore(this.scoringUtils.itemDetailsScore, this.detailsNode, this.scoringUtils.ITEM_DETAILS_MAX_SCORE);
									this.scoringUtils.updateOverallScore();
								}
							}));
						}));

						// update thumbnail
						domStyle.set(query(".edit-thumbnail-msg")[0], "display", "none");
						domStyle.set(query(".expanded-item-thumbnail")[0], "cursor", "inherit");

						// update the title
						domConstruct.empty(this.itemTitleNode);
						domConstruct.create("div", {
							innerHTML:this.itemTitle
						}, this.itemTitleNode, "first");
						domAttr.remove(this.itemTitleNode, "data-dojo-type");
						domAttr.set(this.itemTitleNode, "id", this.titleID);

						// update the summary
						domConstruct.empty(this.itemSummaryNode);
						domConstruct.create("div", {
							innerHTML:this.itemSummary
						}, this.itemSummaryNode, "first");
						domAttr.remove(this.itemSummaryNode, "data-dojo-type");
						domAttr.set(this.itemSummaryNode, "id", this.snippetID);

						// update the description
						// empty the contents
						if (dijit.byId("description-editor-widget")) {
							dijit.byId("description-editor-widget").destroy();
							domAttr.remove(this.itemDescriptionNode, "id");
							domConstruct.create("div", {
								id:"description-editor-widget",
								innerHTML:this.itemDescription
							}, this.itemDescriptionNode, "first");
						}

						if (this.itemDescription === "") {
							domConstruct.place("<span></span>", "description-editor-widget", "first");
						}
					}
				}));

				on(this.cancelBtnNode, "click", lang.hitch(this, function () {
					this.itemThumbnailListener.remove();
					// update thumbnail cursor/message
					domStyle.set(query(".edit-thumbnail-msg")[0], "display", "none");
					domStyle.set(query(".expanded-item-thumbnail")[0], "cursor", "inherit");

					// update the title
					domConstruct.empty(this.itemTitleNode);
					domConstruct.create("div", {innerHTML:this.itemTitle_clean}, this.itemTitleNode, "first");
					domAttr.remove(this.itemTitleNode, "data-dojo-type");
					domAttr.set(this.itemTitleNode, "id", this.titleID);

					// update the summary
					domConstruct.empty(this.itemSummaryNode);
					domConstruct.create("div", {innerHTML:this.itemSummary_clean}, this.itemSummaryNode, "first");
					domAttr.remove(this.itemSummaryNode, "data-dojo-type");
					domAttr.set(this.itemSummaryNode, "id", this.snippetID);

					// update the description
					// empty the contents
					if (dijit.byId("description-editor-widget")) {
						dijit.byId("description-editor-widget").destroy();
					}

					domAttr.remove(this.itemDescriptionNode, "id");
					domConstruct.create("div", {
						id:"description-editor-widget"
					}, this.itemDescriptionNode, "first");

					if (this.itemDescription === "") {
						domConstruct.place("<span></span>", "description-editor-widget", "first");
					} else {
						domConstruct.place("<span>" + this.itemDescription_clean + "</span>", "description-editor-widget", "first");
					}

					domAttr.set(this.editSaveBtnNode, "innerHTML", defaults.EDIT_BTN_LABEL);
					domStyle.set(this.cancelBtnNode, "display", "none");

					// set numerator
					//scoringUtils.itemThumbnailScore = validator.setThumbnailScore(results);
					this.scoringUtils.itemTitleScore = this.validator.setItemTitleScore(this.itemTitle_clean);
					this.scoringUtils.itemSummaryScore = this.validator.setItemSummaryScore(this.itemSummary_clean);
					this.scoringUtils.itemDescriptionScore = this.validator.setItemDescriptionScore(this.itemDescription_clean);
					this.thumbnailScoreNumeratorNode.innerHTML = this.scoringUtils.itemThumbnailScore;
					this.titleScoreNumeratorNode.innerHTML = this.scoringUtils.itemTitleScore;
					this.summaryScoreNumeratorNode.innerHTML = this.scoringUtils.itemSummaryScore;
					this.descScoreNumeratorNode.innerHTML = this.scoringUtils.itemDescriptionScore;

					// update section style score graphics
					this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemThumbnailScore, this.scoringUtils.ITEM_THUMBNAIL_MAX_SCORE, this.thumbnailScoreNodeContainer);
					this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemTitleScore, this.scoringUtils.ITEM_TITLE_MAX_SCORE, this.titleScoreNodeContainer);
					this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemSummaryScore, this.scoringUtils.ITEM_SUMMARY_MAX_SCORE, this.summaryScoreNodeContainer);
					this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemDescriptionScore, this.scoringUtils.ITEM_DESC_MAX_SCORE, this.descScoreNodeContainer);

					// section overall score
					this.scoringUtils.itemDetailsScore = this.scoringUtils.itemThumbnailScore + this.scoringUtils.itemTitleScore + this.scoringUtils.itemSummaryScore + this.scoringUtils.itemDescriptionScore;
					this.scoringUtils.updateSectionScore(this.scoringUtils.itemDetailsScore, this.detailsNode, this.scoringUtils.ITEM_DETAILS_MAX_SCORE);
					this.scoringUtils.updateOverallScore();
				}));
			}
		},

		/**
		 * Upload the item's thumbnail
		 *
		 * @param item
		 * @param imageSizeName
		 * @returns {*}
		 */
		uploadItemThumbnail:function (item, imageSizeName) {
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
				reader.onload = lang.hitch(this, function (_file) {
					domClass.add(fileInput, "dijitHidden");
					var imgNode = put(dialogContent, "img");
					//
					imgNode.onload = lang.hitch(this, function () {
						msgPane.innerHTML = "Valid file selected";
						put(dialogContent, "div.imageSizeLabel", lang.replace("Image size: {0}px by {1}px", [imgNode.width, imgNode.height]));
						console.log(defaults);
						//
						if ((imgNode.width === defaults.THUMBNAIL_IMAGE_SIZES[imageSizeName][0]) && (imgNode.height === defaults.THUMBNAIL_IMAGE_SIZES[imageSizeName][1])) {
							domClass.remove(uploadThumbBtn.domNode, "dijitHidden");
							// upload button selected
							uploadThumbBtn.on("click", lang.hitch(this, function (evt) {
								domClass.add(uploadThumbBtn.domNode, "dijitHidden");
								this.updateItemThumbnail(item, form).then(lang.hitch(this, function (evt) {
									this.portalUtils.portalUser.getItem(item.id).then(lang.hitch(this, function (userItem) {
										// If the store is updated the dGrid is refreshed and the expanded content is lost
										this.itemStore.put(userItem);
										domAttr.set(query(".item-thumbnail-" + this.selectedID)[0], "src", userItem.thumbnailUrl);
										domAttr.set(query(".expanded-item-thumbnail-" + this.selectedID)[0], "src", userItem.thumbnailUrl);
										defaults.UPDATE_ITEMS[imageSizeName].push(item.id);
										msgPane.innerHTML = "Item updated with thumbnail";
										this.validator.setThumbnailScore(userItem);
										this.scoringUtils.updateOverallScore();
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
					});
					imgNode.src = _file.target.result;
				});
			}));
			return deferred.promise;
		},

		/**
		 * Update the item's thumbnail
		 *
		 * @param userItem
		 * @param form
		 * @returns {*}
		 */
		updateItemThumbnail:function (userItem, form) {
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
		},

		/**
		 * Handle click events on the item's property labels (i.e. Title, Description, Summary, etc)
		 *
		 * @param evt
		 */
		adminNodeClickHandler:function (evt) {
			var label = evt.target.innerHTML;

			// destroy dijit
			if (dijit.byId("adminDialog") !== undefined) {
				dijit.byId("adminDialog").destroy();
			}

			// pass in the textarea we want to set focus on
			if (dijit.byId("adminDialog") === undefined) {
				if (label === "Thumbnail") {
					lang.hitch(this, this.loadAdminDialog("itemThumbnailNotesTextArea"));
				} else if (label === "Title") {
					lang.hitch(this, this.loadAdminDialog("itemTitleNotesTextArea"));
				} else if (label === "Summary") {
					lang.hitch(this, this.loadAdminDialog("itemSummaryNotesTextArea"));
				} else {
					lang.hitch(this, this.loadAdminDialog("itemDescriptionNotesTextArea"));
				}
			}
		},

		/**
		 * Edit dialog for curators to update notes on an item
		 *
		 * @param focusedNode - node that should have focus
		 */
		loadAdminDialog:function (focusedNode) {
			this.userInterfaceUtils.getFeature(this.selectedID).then(lang.hitch(this, function (response) {
				var feature = response.features[0];

				this.detailsAdminDialog = new Dialog({
					id:"adminDialog",
					title:"DETAILS Section",
					class:"details-admin-dialog",
					onFocus:function () {
						focusUtil.focus(dom.byId(focusedNode));
					}
				});

				this.detailsAdminDialog.set("content",
						"<div class='row attribute-row'>" +
								"	<div class='column-6'>" +
								"		<div class='dialog-label'> Thumbnail Notes : <\/div>" +
								"	<\/div>" +
								"	<div class='column-18'>" +
								"		<textarea id='itemThumbnailNotesTextArea'>" + feature.attributes.notesThumbnail + "<\/textarea>" +
								"	<\/div>" +
								"<\/div>" +

								"<div class='row attribute-row'>" +
								"	<div class='column-6'>" +
								"		<div class='dialog-label'> Title Notes : <\/div>" +
								"	<\/div>" +
								"	<div class='column-18'>" +
								"		<textarea id='itemTitleNotesTextArea'>" + feature.attributes.notesTitle + "<\/textarea>" +
								"	<\/div>" +
								"<\/div>" +

								"<div class='row attribute-row'>" +
								"	<div class='column-6'>" +
								"		<div class='dialog-label'> Summary Notes : <\/div>" +
								"	<\/div>" +
								"	<div class='column-18'>" +
								"		<textarea id='itemSummaryNotesTextArea'>" + feature.attributes.notesSummary + "<\/textarea>" +
								"	<\/div>" +
								"<\/div>" +

								"<div class='row attribute-row'>" +
								"	<div class='column-6'>" +
								"		<div class='dialog-label'> Description Notes :  <\/div>" +
								"	<\/div>" +
								"	<div class='column-18'>" +
								"		<textarea id='itemDescriptionNotesTextArea'>" + feature.attributes.notesDescription + "<\/textarea>" +
								"	<\/div>" +
								"<\/div>" +

								"<div class='row right dialog-btn-row'>" +
								"	<div class='column-13'>" +
								"		<button class='btn item-title-btn-cancel'> Cancel <\/button>" +
								"	<\/div>" +
								"	<div class='column-3'>" +
								"		<button class='btn item-title-btn-save'> Save <\/button>" +
								"	<\/div>" +
								"<\/div>");

				// Dialog SAVE btn
				on(query(".item-title-btn-save"), "click", lang.hitch(this, function () {
					// Populate the fields of the dialog with any existing values from nomcur
					this.portalUtils.portalUser.getItem(this.selectedID).then(lang.hitch(this, function (item) {
						var thumbnailNotes = dom.byId("itemThumbnailNotesTextArea").value;
						var titleNotes = dom.byId("itemTitleNotesTextArea").value;
						var summaryNotes = dom.byId("itemSummaryNotesTextArea").value;
						var descriptionNotes = dom.byId("itemDescriptionNotesTextArea").value;
						// apply updates to the feature layer
						this.userInterfaceUtils.getFeature(this.selectedID).then(lang.hitch(this, lang.partial(this.updateAdminDialogNotes, thumbnailNotes, titleNotes, summaryNotes, descriptionNotes)));
					}));
				}));

				// Dialog CANCEL btn
				on(query(".item-title-btn-cancel"), "click", lang.hitch(this, function () {
					this.detailsAdminDialog.hide();
				}));

				// show dialog
				this.detailsAdminDialog.show();

			}));
		},

		/**
		 * Apply updates the nomcur
		 *
		 * @param itemThumbnailNotes
		 * @param itemTitleNotes
		 * @param itemSummaryNotes
		 * @param itemDescriptionNotes
		 * @param response
		 */
		updateAdminDialogNotes:function (itemThumbnailNotes, itemTitleNotes, itemSummaryNotes, itemDescriptionNotes, response) {
			var feature = response.features[0];
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
				"FID":feature.attributes.FID,
				"LastContactComments":dateTime,
				"notesThumbnail":itemThumbnailNotes,
				"notesSummary":itemSummaryNotes,
				"notesDescription":itemDescriptionNotes,
				"notesTitle":itemTitleNotes
			};
			var graphic = new Graphic(pt, sms, attr);
			this.nominateUtils.nominateAdminFeatureLayer.applyEdits(null, [graphic], null);
		}
	});
});