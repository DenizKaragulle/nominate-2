define([
	"esri/Color",
	"esri/request",
	"esri/geometry/Point",
	"esri/graphic",
	"esri/layers/FeatureLayer",
	"esri/symbols/SimpleMarkerSymbol",
	"dijit/Dialog",
	"dijit/focus",
	"dijit/form/CheckBox",
	"dijit/registry",
	"dijit/Tree",
	"dijit/tree/ForestStoreModel",
	"dijit/tree/ObjectStoreModel",
	"dojo/aspect",
	"dojo/data/ItemFileReadStore",
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
	"dojo/store/Memory",
	"config/defaults",
	"config/CustomTagsWidget",
	"config/adminUtils"
], function (Color, esriRequest, Point, Graphic, FeatureLayer, SimpleMarkerSymbol, Dialog, focusUtil, CheckBox, registry, Tree, ForestStoreModel, ObjectStoreModel, aspect, ItemFileReadStore, array, declare, lang, Deferred, dom, domAttr, domClass, domConstruct, domStyle, html, mouse, on, query, Memory, defaults, CustomTagsWidget, AdminUtils) {

	return declare([AdminUtils], {

<<<<<<< HEAD
		validator:null,
		nominateUtils:null,
		userInterfaceUtils:null,
		scoringUtils:null,
		scoring:null,
		tooltipsConfig:null,
		portalUtils:null,

		customTagsWidget:null,
		checkBoxID_values:[],
		tagStore:null,
		atlasTagStore:null,

		tagsNode:null,

		itemTags:null,
		itemTags_clean:null,

		editSaveBtnNode:null,
		cancelBtnNode:null,
		emailUserBtn:null,
		tagsLabelNode:null,

		tagsTooltipNode:null,
		tagsScoreNodeContainer:null,
		tagsScoreNumeratorNode:null,
		tagsScoreDenominatorNode:null,

		tree:null,
		treeModel:null,

		constructor:function (item, validator, nominateUtils, userInterfaceUtils, scoringUtils, scoring, tooltipsConfig, portalUtils) {
=======
		validator: null,
		nominateUtils: null,
		userInterfaceUtils: null,
		scoringUtils: null,
		scoring: null,
		tooltipsConfig: null,
		portalUtils: null,

		customTagsWidget: null,
		checkBoxID_values: [],
		tagStore: null,
		atlasTagStore: null,

		tagsNode: null,

		itemTags: null,
		itemTags_clean: null,

		editSaveBtnNode: null,
		cancelBtnNode: null,
		emailUserBtn: null,
		tagsLabelNode: null,

		tagsTooltipNode: null,
		tagsScoreNodeContainer: null,
		tagsScoreNumeratorNode: null,
		tagsScoreDenominatorNode: null,

		tree: null,
		treeModel: null,

		constructor: function (item, validator, nominateUtils, userInterfaceUtils, scoringUtils, scoring, tooltipsConfig, portalUtils) {
>>>>>>> 9edef40c989e7189242228381b4d2a74e0843637
			this.validator = validator;
			this.nominateUtils = nominateUtils;
			this.userInterfaceUtils = userInterfaceUtils;
			this.scoringUtils = scoringUtils;
			this.scoring = scoring;
			this.tooltipsConfig = tooltipsConfig;
			this.portalUtils = portalUtils;

			this.atlasTagStore = new Memory({
<<<<<<< HEAD
				data:defaults.TAGS_STORE,

				// Returns all direct children of this widget
				getChildren:function (object) {
					return this.query({
						parent:object.id
=======
				data: defaults.TAGS_STORE,

				// Returns all direct children of this widget
				getChildren: function (object) {
					return this.query({
						parent: object.id
>>>>>>> 9edef40c989e7189242228381b4d2a74e0843637
					});
				}
			});

			this.editSaveBtnNode = query(".edit-save-btn")[0];
			this.cancelBtnNode = query(".cancel-btn")[0];
			this.emailUserBtn = query(".email-btn")[0];
			this.tagsLabelNode = query(".tags-attr-label")[0];
			this.tagsTooltipNode = query(".tags-tooltip")[0];
			this.tagsScoreNodeContainer = query(".tags-score-gr")[0];
			this.tagsScoreNumeratorNode = query(".tags-score-num")[0];
			this.tagsScoreDenominatorNode = query(".tags-score-denom")[0];
			this.tagsNode = query(".tags")[0];

			this.checkBoxID_values = [];

			this.itemTags = item.tags;
			this.itemTags_clean = this.itemTags;

			this.scoringUtils.itemTagsScore = this.validator.validateItemTags(this.itemTags);
			// set numerator
			this.tagsScoreNumeratorNode.innerHTML = this.scoringUtils.itemTagsScore;
			// set denominator
			this.tagsScoreDenominatorNode.innerHTML = this.scoringUtils.TAGS_MAX_SCORE;
			// update section score
			this.scoringUtils.updateSectionScore(this.scoringUtils.itemTagsScore, this.tagsNode, this.scoringUtils.TAGS_MAX_SCORE);
			// update section score style
			this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemTagsScore, this.scoringUtils.TAGS_MAX_SCORE, this.tagsScoreNodeContainer);
			// update overall score
			this.scoringUtils.updateOverallScore();

			// create the existing tags (un-editable)
			domConstruct.create("div", {
<<<<<<< HEAD
				class:"existing-tags"
=======
				class: "existing-tags"
>>>>>>> 9edef40c989e7189242228381b4d2a74e0843637
			}, query(".tag-container")[0], "first");
			this.styleTags(this.itemTags, query(".existing-tags")[0]);

			this.userInterfaceUtils.createTooltips([this.tagsTooltipNode], [this.tooltipsConfig.TAGS_TOOLTIP_CONTENT]);
<<<<<<< HEAD

			// existing tags store
			this.tagStore = new Memory({
				idProperty:"tag",
				data:[].concat(this.itemTags)
			});

			// destroy the Tags dijit and the Tree dijit
			var tagDijit = dijit.byId("tag-widget");
			if (tagDijit !== undefined) {
				tagDijit.destroy();
				this.customTagsWidget = null;
				dijit.byId("tags-tree").destroy();
			}

			// tags dijit
			this.customTagsWidget = new CustomTagsWidget({
				placeholder:"Add tag(s)",
				noDataMsg:"No results found.",
				matchParam:"all",
				idProperty:"tag",
				gridId:"grid1",
				filterId:"filter1",
				minWidth:"300px",
				maxWidth:"400px",
				store:this.tagStore
			}, "tag-widget");
			this.customTagsWidget.prepopulate(this.tagStore.data);
			domStyle.set("tag-widget", "display", "none");

			this.treeModel = new ObjectStoreModel({
				store:this.atlasTagStore,
				query:{
					id:"categories"
				},
				// Overridable function to tell if an item has or may have children.
				// Controls whether or not +/- expando icon is shown.
				mayHaveChildren:function (object) {
					return "type" in object;
				}
			});

			this.tree = new Tree({
				id:"tags-tree",
				model:this.treeModel,
				showRoot:false,
				_createTreeNode:lang.hitch(this, function (args) {
					var tnode = new dijit._TreeNode(args);
					tnode.labelNode.innerHTML = args.item.name;
					if (args.item.parent !== "categories") {
						var cb = new CheckBox({
							id:args.item.name,
							value:args.item.name,
							disabled:true,
							onChange:lang.hitch(this, function (selected) {
								//var tagLabel = this.value;
								var tagLabel = "";
								if (this.tree.paths.length > 0) {
									tagLabel = this.tree.paths[0][2].name;
								}
								if (selected) {
									if (this.tagStore.data.indexOf(tagLabel) === -1) {
										if (tagLabel !== "")
											this.tagStore.data.push(tagLabel);
									}
								} else {
									this.tagStore.data.splice(this.tagStore.data.indexOf(tagLabel), 1);
								}
								console.log("ONCHANGE");
								this.customTagsWidget.clearTags();
								this.customTagsWidget.prepopulate(this.tagStore.data);
							})
						});
						cb.placeAt(tnode.labelNode, "first");
						this.checkBoxID_values.push(args.item.name);
					}
					return tnode;
				}),

				onLoad:lang.hitch(this, function () {
					//console.log("LOADED");
					this.updateTreePath(this.tree, this.treeModel, this.customTagsWidget.values);
				}),

				onClick:lang.hitch(this, function (item, node, evt) {
					//console.log(item);
				}),

				onOpen:lang.hitch(this, function (item, node) {
					var name = item.name;
					if (this.editSaveBtnNode.innerHTML === defaults.EDIT_BTN_LABEL) {
						this.userInterfaceUtils.toggleCheckboxes(this.checkBoxID_values, "disabled", true);
					} else {
						this.userInterfaceUtils.toggleCheckboxes(this.checkBoxID_values, "disabled", false);
					}

					if (registry.byId(name)) {
						registry.byId(name).set("checked", true);
					}
				})
			});
			this.tree.placeAt("tree");
			this.tree.startup();

			aspect.after(this.tree, "onOpen", lang.hitch(this, function (item) {
				var lastValueAdded = this.customTagsWidget.values[this.customTagsWidget.values.length - 1];
				if (registry.byId(lastValueAdded)) {
					registry.byId(lastValueAdded).set("checked", true);
				}
			}));

			this.customTagsWidget.on("deletenode", lang.hitch(this, function (tag) {
				if (registry.byId(tag)) {
					// deleting an Atlas Tag
					registry.byId(tag).set("checked", false);
				} else {
					// deleting a custom tag
					this.tagStore.data.splice(this.tagStore.data.indexOf(tag), 1);
				}
			}));

			this.customTagsWidget.on("addnode", lang.hitch(this, function (tag) {
				if (this.tagStore.data.indexOf(tag) === -1) {
					this.tagStore.data.push(tag);
				}
				// expand tree if needed
				this.updateTreePath(this.tree, this.treeModel, this.customTagsWidget.values);
			}));

			on(this.editSaveBtnNode, "click", lang.hitch(this, function () {
				if (this.editSaveBtnNode.innerHTML === defaults.EDIT_BTN_LABEL) {
					// EDIT mode
					this.userInterfaceUtils.updateEditSaveButton(this.editSaveBtnNode, defaults.SAVE_BTN_LABEL, this.cancelBtnNode, "block");
					// remove non-editing tag nodes
					// domConstruct.empty(query(".existing-tags")[0]);
					domStyle.set(query(".existing-tags")[0], "display", "none");
					// display the tags dijit
					domStyle.set("tag-widget", "display", "block");
					// enable living atlas checkboxes
					this.userInterfaceUtils.toggleCheckboxes(this.checkBoxID_values, "disabled", false);
				} else {
					// SAVE mode
					var _userItemUrl = item.userItemUrl;
					esriRequest({
						url:_userItemUrl + "/update",
						content:{
							f:"json",
							tags:"" + this.tagStore.data
						}
					}, {
						usePost:true
					}).then(lang.hitch(this, function (response) {
						if (response.success) {
							this.itemTags_clean = this.tagStore.data;
							domConstruct.empty(query(".existing-tags")[0]);
							this.styleTags(this.tagStore.data, query(".existing-tags")[0]);
							domStyle.set(query(".existing-tags")[0], "display", "block");
							domStyle.set("tag-widget", "display", "none");
							// set the numerator and update score
							this.scoringUtils.itemTagsScore = this.validator.validateItemTags(this.tagStore.data);
							this.tagsScoreNumeratorNode.innerHTML = this.scoringUtils.itemTagsScore;
							// section overall score
							this.scoringUtils.updateSectionScore(this.scoringUtils.itemTagsScore, this.tagsNode, this.scoringUtils.TAGS_MAX_SCORE);
							this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemTagsScore, this.scoringUtils.TAGS_MAX_SCORE, this.tagsScoreNodeContainer);
							this.scoringUtils.updateOverallScore();

							// disable living atlas checkboxes
							this.userInterfaceUtils.toggleCheckboxes(this.checkBoxID_values, "disabled", true);
							this.userInterfaceUtils.updateEditSaveButton(this.editSaveBtnNode, defaults.EDIT_BTN_LABEL, this.cancelBtnNode, "none");
						}
					}));
				}
			}));

=======

			// existing tags store
			this.tagStore = new Memory({
				idProperty: "tag",
				data: [].concat(this.itemTags)
			});

			// destroy the Tags dijit and the Tree dijit
			var tagDijit = dijit.byId("tag-widget");
			if (tagDijit !== undefined) {
				tagDijit.destroy();
				this.customTagsWidget = null;
				dijit.byId("tags-tree").destroy();
			}

			// tags dijit
			this.customTagsWidget = new CustomTagsWidget({
				placeholder: "Add tag(s)",
				noDataMsg: "No results found.",
				matchParam: "all",
				idProperty: "tag",
				gridId: "grid1",
				filterId: "filter1",
				minWidth: "300px",
				maxWidth: "400px",
				store: this.tagStore
			}, "tag-widget");
			this.customTagsWidget.prepopulate(this.tagStore.data);
			domStyle.set("tag-widget", "display", "none");

			this.treeModel = new ObjectStoreModel({
				store: this.atlasTagStore,
				query: {
					id: "categories"
				},
				// Overridable function to tell if an item has or may have children.
				// Controls whether or not +/- expando icon is shown.
				mayHaveChildren: function (object) {
					return "type" in object;
				}
			});

			this.tree = new Tree({
				id: "tags-tree",
				model: this.treeModel,
				showRoot: false,
				_createTreeNode: lang.hitch(this, function (args) {
					var tnode = new dijit._TreeNode(args);
					tnode.labelNode.innerHTML = args.item.name;
					if (args.item.parent !== "categories") {
						var cb = new CheckBox({
							id: args.item.name,
							value: args.item.name,
							disabled: true,
							onChange: lang.hitch(this, function (selected) {
								//var tagLabel = this.value;
								var tagLabel = "";
								if (this.tree.paths.length > 0) {
									tagLabel = this.tree.paths[0][2].name;
								}
								if (selected) {
									if (this.tagStore.data.indexOf(tagLabel) === -1) {
										if (tagLabel !== "")
											this.tagStore.data.push(tagLabel);
									}
								} else {
									this.tagStore.data.splice(this.tagStore.data.indexOf(tagLabel), 1);
								}
								console.log("ONCHANGE");
								this.customTagsWidget.clearTags();
								this.customTagsWidget.prepopulate(this.tagStore.data);
							})
						});
						cb.placeAt(tnode.labelNode, "first");
						this.checkBoxID_values.push(args.item.name);
					}
					return tnode;
				}),

				onLoad: lang.hitch(this, function () {
					//console.log("LOADED");
					this.updateTreePath(this.tree, this.treeModel, this.customTagsWidget.values);
				}),

				onClick: lang.hitch(this, function (item, node, evt) {
					//console.log(item);
				}),

				onOpen: lang.hitch(this, function (item, node) {
					var name = item.name;
					if (this.editSaveBtnNode.innerHTML === defaults.EDIT_BTN_LABEL) {
						this.userInterfaceUtils.toggleCheckboxes(this.checkBoxID_values, "disabled", true);
					} else {
						this.userInterfaceUtils.toggleCheckboxes(this.checkBoxID_values, "disabled", false);
					}

					if (registry.byId(name)) {
						registry.byId(name).set("checked", true);
					}
				})
			});
			this.tree.placeAt("tree");
			this.tree.startup();

			aspect.after(this.tree, "onOpen", lang.hitch(this, function (item) {
				var lastValueAdded = this.customTagsWidget.values[this.customTagsWidget.values.length - 1];
				if (registry.byId(lastValueAdded)) {
					registry.byId(lastValueAdded).set("checked", true);
				}
			}));

			this.customTagsWidget.on("deletenode", lang.hitch(this, function (tag) {
				if (registry.byId(tag)) {
					// deleting an Atlas Tag
					registry.byId(tag).set("checked", false);
				} else {
					// deleting a custom tag
					this.tagStore.data.splice(this.tagStore.data.indexOf(tag), 1);
				}
			}));

			this.customTagsWidget.on("addnode", lang.hitch(this, function (tag) {
				if (this.tagStore.data.indexOf(tag) === -1) {
					this.tagStore.data.push(tag);
				}
				// expand tree if needed
				this.updateTreePath(this.tree, this.treeModel, this.customTagsWidget.values);
			}));

			// only permit nominated items to have notes added by curators
			this.userInterfaceUtils.getFeature(item.id).then(lang.hitch(this, function (response) {
				var notesFeature = response.features[0];
				if (notesFeature) {
					on(this.tagsLabelNode, mouse.enter, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseEnterHandler, this.tagsLabelNode)));
					on(this.tagsLabelNode, mouse.leave, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseLeaveHandler, this.tagsLabelNode)));
					on(this.tagsLabelNode, "click", lang.hitch(this, this.adminNodeClickHandler));
				}
			}));

			on(this.editSaveBtnNode, "click", lang.hitch(this, function () {
				if (this.editSaveBtnNode.innerHTML === defaults.EDIT_BTN_LABEL) {
					// EDIT mode
					this.userInterfaceUtils.updateEditSaveButton(this.editSaveBtnNode, defaults.SAVE_BTN_LABEL, this.cancelBtnNode, "block");
					// remove non-editing tag nodes
					// domConstruct.empty(query(".existing-tags")[0]);
					domStyle.set(query(".existing-tags")[0], "display", "none");
					// display the tags dijit
					domStyle.set("tag-widget", "display", "block");
					// enable living atlas checkboxes
					this.userInterfaceUtils.toggleCheckboxes(this.checkBoxID_values, "disabled", false);
				} else {
					// SAVE mode
					var _userItemUrl = item.userItemUrl;
					esriRequest({
						url: _userItemUrl + "/update",
						content: {
							f: "json",
							tags: "" + this.tagStore.data
						}
					}, {
						usePost: true
					}).then(lang.hitch(this, function (response) {
								if (response.success) {
									this.itemTags_clean = this.tagStore.data;
									domConstruct.empty(query(".existing-tags")[0]);
									this.styleTags(this.tagStore.data, query(".existing-tags")[0]);
									domStyle.set(query(".existing-tags")[0], "display", "block");
									domStyle.set("tag-widget", "display", "none");
									// set the numerator and update score
									this.scoringUtils.itemTagsScore = this.validator.validateItemTags(this.tagStore.data);
									this.tagsScoreNumeratorNode.innerHTML = this.scoringUtils.itemTagsScore;
									// section overall score
									this.scoringUtils.updateSectionScore(this.scoringUtils.itemTagsScore, this.tagsNode, this.scoringUtils.TAGS_MAX_SCORE);
									this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemTagsScore, this.scoringUtils.TAGS_MAX_SCORE, this.tagsScoreNodeContainer);
									this.scoringUtils.updateOverallScore();

									// disable living atlas checkboxes
									this.userInterfaceUtils.toggleCheckboxes(this.checkBoxID_values, "disabled", true);
									this.userInterfaceUtils.updateEditSaveButton(this.editSaveBtnNode, defaults.EDIT_BTN_LABEL, this.cancelBtnNode, "none");
								}
							}));
				}
			}));

>>>>>>> 9edef40c989e7189242228381b4d2a74e0843637
			on(this.cancelBtnNode, "click", lang.hitch(this, function () {
				domStyle.set(query(".existing-tags")[0], "display", "block");
				domStyle.set("tag-widget", "display", "none");

				// set the numerator and update score
				this.scoringUtils.itemTagsScore = this.validator.validateItemTags(this.itemTags_clean);
				this.tagsScoreNumeratorNode.innerHTML = this.scoringUtils.itemTagsScore;
				// section overall score
				this.scoringUtils.updateSectionScore(this.scoringUtils.itemTagsScore, this.tagsNode, this.scoringUtils.TAGS_MAX_SCORE);
				this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.itemTagsScore, this.scoringUtils.TAGS_MAX_SCORE, this.tagsScoreNodeContainer);
				this.scoringUtils.updateOverallScore();
				// disable living atlas checkboxes
				this.userInterfaceUtils.toggleCheckboxes(this.checkBoxID_values, "disabled", true);
				this.userInterfaceUtils.updateEditSaveButton(this.editSaveBtnNode, defaults.EDIT_BTN_LABEL, this.cancelBtnNode, "none");
			}));

<<<<<<< HEAD
			if (this.portalUtils.IS_CURATOR) {
				// only permit nominated items to have notes added by curators
				this.userInterfaceUtils.getFeature(item.id).then(lang.hitch(this, function (response) {
					var notesFeature = response.features[0];
					if (notesFeature) {
						on(this.tagsLabelNode, mouse.enter, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseEnterHandler, this.tagsLabelNode)));
						on(this.tagsLabelNode, mouse.leave, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseLeaveHandler, this.tagsLabelNode)));
						on(this.tagsLabelNode, "click", lang.hitch(this, this.adminNodeClickHandler));
					}
				}));
				on(this.emailUserBtn, "click", lang.hitch(this, function () {
					// display final email
					this.openEmailDialog();
				}));
			} else {
				domStyle.set(query(".email-btn")[0], "display", "none");
				domStyle.set(this.nominateUtils.acceptBtnNode, "display", "none");
			}
=======
			on(this.emailUserBtn, "click", lang.hitch(this, function () {
				// display final email
				this.openEmailDialog();
			}));
>>>>>>> 9edef40c989e7189242228381b4d2a74e0843637
		},

		updateTreePath:function (tree, treeModel, userTags) {
			var tagPaths = [];
			// iterate over the user tags from AGOL
			array.forEach(userTags, function (tag) {
				// iterate over each of the atlas tags
				array.forEach(treeModel.store.data, function (atlasTag) {
					// check if there is a match
					if (tag === atlasTag.name) {
						// check if it's not a parent/root node
						if (atlasTag.path) {
							// add the id and the tag's path to the list of paths
							atlasTag.path.push(atlasTag.id);
							tagPaths.push(atlasTag.path);
							// check the check box
							if (registry.byId(tag)) {
								registry.byId(tag).set("checked", true);
							}
						}
					}
				});
			});
			tree.set("paths", tagPaths);
		},

		styleTags:function (tags, srcNodeRef) {
			domClass.add(dom.byId(srcNodeRef), "select2-container select2-container-multi");
			var list = domConstruct.create("ul", null, dom.byId(srcNodeRef));
			// add style to the list of tags
			domClass.add(list, "select2-choices");
			domStyle.set(list, "border", "none");
			array.forEach(tags, function (item, i) {
				var listItemNode = domConstruct.create("li", null, list);
				domStyle.set(listItemNode, "padding", "3px 5px 3px 5px");
				// add style to new tag
				domClass.add(listItemNode, "select2-search-resultSet");
				var listItemDivNode = domConstruct.create("div", {
					title:item
				}, listItemNode);
				html.set(listItemDivNode, item);
			});
		},

<<<<<<< HEAD
		adminNodeClickHandler:function (evt) {
=======
		adminNodeClickHandler: function (evt) {
>>>>>>> 9edef40c989e7189242228381b4d2a74e0843637
			var label = evt.target.innerHTML;

			// destroy dijit
			if (dijit.byId("adminDialog") !== undefined) {
				dijit.byId("adminDialog").destroy();
			}

			// pass in the textarea we want to set focus on
			if (dijit.byId("adminDialog") === undefined) {
				if (label === "Select at least one of the following categories") {
					lang.hitch(this, this.loadAdminDialog("itemTagsNotesTextArea"));
				}
			}
		},

<<<<<<< HEAD
		loadAdminDialog:function (focusedNode) {
=======
		loadAdminDialog: function (focusedNode) {
>>>>>>> 9edef40c989e7189242228381b4d2a74e0843637
			this.userInterfaceUtils.getFeature(this.selectedID).then(lang.hitch(this, function (response) {
				var feature = response.features[0];

				var adminDialog = new Dialog({
<<<<<<< HEAD
					id:"adminDialog",
					title:"TAGS Section",
					class:"details-admin-dialog",
					onFocus:function () {
=======
					id: "adminDialog",
					title: "TAGS Section",
					class: "details-admin-dialog",
					onFocus: function () {
>>>>>>> 9edef40c989e7189242228381b4d2a74e0843637
						focusUtil.focus(dom.byId(focusedNode));
					}
				});

				adminDialog.set("content",
						"<div class='row attribute-row'>" +
								"	<div class='column-6'>" +
								"		<div class='dialog-label'> Tags Notes : <\/div>" +
								"	<\/div>" +
								"	<div class='column-18'>" +
								"		<textarea id='itemTagsNotesTextArea'>" + feature.attributes.notesTags + "<\/textarea>" +
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
						var tagsNotes = dom.byId("itemTagsNotesTextArea").value;
						this.userInterfaceUtils.getFeature(this.selectedID).then(lang.hitch(this, lang.partial(this.updateAdminDialogNotes, tagsNotes)));
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

<<<<<<< HEAD
		updateAdminDialogNotes:function (itemTagsNotes, response) {
			var feature = response.features[0];
			var dateTime = new Date();
			var pt = new Point({
				"x":-13024380.422813008,
				"y":4028802.0261344062,
				"spatialReference":{
					"wkid":102100
=======
		updateAdminDialogNotes: function (itemTagsNotes, response) {
			var feature = response.features[0];
			var dateTime = new Date();
			var pt = new Point({
				"x": -13024380.422813008,
				"y": 4028802.0261344062,
				"spatialReference": {
					"wkid": 102100
>>>>>>> 9edef40c989e7189242228381b4d2a74e0843637
				}
			});
			var sms = new SimpleMarkerSymbol().setStyle(SimpleMarkerSymbol.STYLE_CIRCLE).setColor(new Color([255, 0, 0, 0.5]));
			var attr = {
<<<<<<< HEAD
				"FID":feature.attributes.FID,
				"LastContactComments":dateTime,
				"notesTags":itemTagsNotes
=======
				"FID": feature.attributes.FID,
				"LastContactComments": dateTime,
				"notesTags": itemTagsNotes
>>>>>>> 9edef40c989e7189242228381b4d2a74e0843637
			};
			var graphic = new Graphic(pt, sms, attr);
			this.nominateUtils.nominateAdminFeatureLayer.applyEdits(null, [graphic], null);
		}

	});
});