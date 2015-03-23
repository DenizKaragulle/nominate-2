define([
	"esri/arcgis/Portal",
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
	"dijit/Dialog",
	"dijit/Editor",
	"dijit/_editor/plugins/LinkDialog",
	"dijit/_editor/plugins/TextColor",
	"dijit/_editor/plugins/ViewSource",
	"dijit/_editor/plugins/FontChoice",
	"dijit/form/Button",
	"config/defaults",
	"config/adminUtils"
], function (arcgisPortal, Color, esriRequest, Point, Graphic, FeatureLayer, SimpleMarkerSymbol, Dialog, focusUtil, array, declare, lang, Deferred, dom, domAttr, domClass, domConstruct, domStyle, html, mouse, on, query, Dialog, Editor, LinkDialog, TextColor, ViewSource, FontChoice, Button, defaults, AdminUtils) {

	return declare([AdminUtils], {

		validator:null,
		nominateUtils:null,
		userInterfaceUtils:null,
		scoringUtils:null,
		scoring:null,
		tooltipsConfig:null,
		portalUtils:null,
		portalUserThumbnailUrl:null,

		selectedID:null,
		item:null,
		userNameID:null,
		userDescriptionID:null,

		usernameAdminNode:null,
		currentOverallScoreNode:null,
		nominateBtnNode:null,

		profileNode:null,
		editSaveBtnNode:null,
		cancelBtnNode:null,
		emailUserBtn:null,
		profileThumbnailLabelNode:null,
		userFullNameLabelNode:null,
		userDescriptionLabelNode:null,

		profileThumbnailNode:null,
		profileUserFullNameNode:null,
		profileUserDescriptionNode:null,
		userThumbnailNodeContainer:null,
		userThumbnailNumeratorNode:null,
		userThumbnailDenominatorNode:null,
		userNameScoreNodeContainer:null,
		userNameScoreNumeratorNode:null,
		userNameScoreDenominatorNode:null,

		userDescriptionScoreNodeContainer:null,
		userDescriptionScoreNumeratorNode:null,
		userDescriptionScoreDenominatorNode:null,

		profileThumbnailTooltipNode:null,
		profileFullNameTooltipNode:null,
		profileDescriptionTooltipNode:null,
		profileThumbnailListener:null,

		userFullName:null,
		userFullName_clean:null,
		userDescription:null,
		userDescription_clean:null,
		userThumbnailUrl:null,
		userThumbnailUrl_clean:null,

		constructor:function (item, validator, nominateUtils, userInterfaceUtils, scoringUtils, scoring, tooltipsConfig, portalUtils, portal, portalUserThumbnailUrl) {
			this.validator = validator;
			this.nominateUtils = nominateUtils;
			this.userInterfaceUtils = userInterfaceUtils;
			this.scoringUtils = scoringUtils;
			this.scoring = scoring;
			this.tooltipsConfig = tooltipsConfig;
			this.portalUtils = portalUtils;
			this.portalUserThumbnailUrl = portalUserThumbnailUrl;
			this.selectedID = item.id;
			this.userNameID = "username-" + this.selectedID;
			this.userDescriptionID = "userdesc-" + this.selectedID;
			this.nominateBtnNode = dom.byId(this.nominateUtils.nominateBtnID);
			this.currentOverallScoreNode = query(".current-score-number")[0];
			this.profileNode = query(".profile")[0];
			this.editSaveBtnNode = query(".edit-save-btn")[0];
			this.refreshBtnNode = query(".refresh-btn")[0];
			this.cancelBtnNode = query(".cancel-btn")[0];
			this.emailUserBtn = query(".email-btn")[0];
			this.profileThumbnailLabelNode = query(".profile-thumbnail-attr-label")[0];
			this.userFullNameLabelNode = query(".full-name-attr-label")[0];
			this.userDescriptionLabelNode = query(".user-desc-attr-label")[0];
			this.profileThumbnailNode = query(".profileThumbnailUrl")[0];
			this.profileUserFullNameNode = query(".name-textbox")[0];
			this.profileUserDescriptionNode = query(".user-description-textbox")[0];
			this.userThumbnailNodeContainer = query(".profile-thumbnail-score-gr")[0];
			this.userThumbnailNumeratorNode = query(".profile-thumbnail-score-num")[0];
			this.userThumbnailDenominatorNode = query(".profile-thumbnail-score-denom")[0];
			this.userNameScoreNodeContainer = query(".profile-name-score-gr")[0];
			this.userNameScoreNumeratorNode = query(".profile-name-score-num")[0];
			this.userNameScoreDenominatorNode = query(".profile-name-score-denom")[0];
			this.userDescriptionScoreNodeContainer = query(".profile-description-score-gr")[0];
			this.userDescriptionScoreNumeratorNode = query(".profile-description-score-num")[0];
			this.userDescriptionScoreDenominatorNode = query(".profile-description-score-denom")[0];
			this.profileThumbnailTooltipNode = query(".profile-thumbnail-tooltip")[0];
			this.profileFullNameTooltipNode = query(".user-full-name-tooltip")[0];
			this.profileDescriptionTooltipNode = query(".user-description-tooltip")[0];
			this.profileThumbnailListener = null;

			this.userInterfaceUtils.createTooltips([
				this.profileThumbnailTooltipNode,
				this.profileFullNameTooltipNode,
				this.profileDescriptionTooltipNode
			], [
				this.tooltipsConfig.USER_PROFILE_THUMBNAIL_TOOLTIP_CONTENT,
				this.tooltipsConfig.USER_PROFILE_FULL_NAME_TOOLTIP_CONTENT,
				this.tooltipsConfig.USER_PROFILE_DESCRIPTION_TOOLTIP_CONTENT
			]);

			this.portalUtils.getItemUserProfileContent(item).then(lang.hitch(this, function (response) {
				if (this.portalUtils.IS_CURATOR) {
					this.userFullName = this.validator.validateStr(response.fullName);
					this.userFullName_clean = this.userFullName;
					this.userDescription = this.validator.validateStr(response.description);
					this.userDescription_clean = this.userDescription;

					// only permit nominated items to have notes added by curators
					this.userInterfaceUtils.getFeature(item.id).then(lang.hitch(this, function (response) {
						var notesFeature = response.features[0];
						if (notesFeature) {
							// admin dialog hover/click listeners
							on(this.profileThumbnailLabelNode, mouse.enter, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseEnterHandler, this.profileThumbnailLabelNode)));
							on(this.profileThumbnailLabelNode, mouse.leave, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseLeaveHandler, this.profileThumbnailLabelNode)));
							on(this.profileThumbnailLabelNode, "click", lang.hitch(this, this.adminNodeClickHandler));

							on(this.userFullNameLabelNode, mouse.enter, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseEnterHandler, this.userFullNameLabelNode)));
							on(this.userFullNameLabelNode, mouse.leave, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseLeaveHandler, this.userFullNameLabelNode)));
							on(this.userFullNameLabelNode, "click", lang.hitch(this, this.adminNodeClickHandler));

							on(this.userDescriptionLabelNode, mouse.enter, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseEnterHandler, this.userDescriptionLabelNode)));
							on(this.userDescriptionLabelNode, mouse.leave, lang.hitch(this, lang.partial(this.userInterfaceUtils.nodeMouseLeaveHandler, this.userDescriptionLabelNode)));
							on(this.userDescriptionLabelNode, "click", lang.hitch(this, this.adminNodeClickHandler));
						}
					}));
					on(this.emailUserBtn, "click", lang.hitch(this, function () {
						this.openEmailDialog();
					}));
				} else {
					this.userFullName = this.validator.validateStr(this.portalUtils.fullName);
					this.userFullName_clean = this.userFullName;
					//this.userDescription = this.validator.validateStr(item.portal.user.description);
					this.userDescription = this.validator.validateStr(this.portalUtils.userDescription);
					this.userDescription_clean = this.userDescription;

					domStyle.set(query(".email-btn")[0], "display", "none");
					domStyle.set(this.nominateUtils.acceptBtnNode, "display", "none");
					domStyle.set(this.editSaveBtnNode, "display", "block");

					on(this.editSaveBtnNode, "click", lang.hitch(this, function () {
						var profilePageUrl = "https://" + item.portal.urlKey + "." + item.portal.customBaseUrl + "/home/user.html";
						window.open(profilePageUrl);
					}));

					/*on(this.editSaveBtnNode, "click", lang.hitch(this, function () {
						if (this.editSaveBtnNode.innerHTML === defaults.EDIT_BTN_LABEL) {
							// "EDIT" clicked
							// update EDIT/SAVE button
							this.userInterfaceUtils.updateEditSaveButton(this.editSaveBtnNode, defaults.SAVE_BTN_LABEL, this.cancelBtnNode, "block");
							domStyle.set(query(".expanded-item-thumbnail")[0], "cursor", "pointer");

							// update user full name
							domConstruct.empty(this.profileUserFullNameNode);
							domConstruct.create("input", {
								class:"edit-user-full-name",
								value:this.userFullName
							}, this.profileUserFullNameNode, "first");
							domAttr.set(this.profileUserFullNameNode, "data-dojo-type", "dijit/form/TextBox");
							domAttr.set(this.profileUserFullNameNode, "id", this.userNameID);

							// update user description
							domConstruct.empty(this.profileUserDescriptionNode);
							domConstruct.create("input", {
								class:"edit-user-description",
								value:this.userDescription
							}, this.profileUserDescriptionNode, "first");
							domAttr.set(this.profileUserDescriptionNode, "data-dojo-type", "dijit/form/TextBox");
							domAttr.set(this.profileUserDescriptionNode, "id", this.userDescriptionID);

							domStyle.set(query(".edit-profile-thumbnail-msg")[0], "display", "block");

							// update user thumbnail
							this.profileThumbnailListener = on(query(".profileThumbnailUrl"), "click", lang.hitch(this, function (event) {
								this.portalUtils.portalUser.getItem(this.selectedID).then(lang.hitch(this, function (userItem) {
									this.uploadUserProfileThumbnail("PROFILE");
								}));
							}));
						} else {
							// "SAVE" clicked
							this.profileThumbnailListener.remove();
							this.userFullName = query(".edit-user-full-name")[0].value;
							this.userDescription = query(".edit-user-description")[0].value;

							console.log(this.userDescription);

							domStyle.set(query(".edit-profile-thumbnail-msg")[0], "display", "none");
							domStyle.set(query(".expanded-item-thumbnail")[0], "cursor", "inherit");

							// write to AGOL
							this.portalUtils.portalUser.getItem(item.id).then(lang.hitch(this, function (results) {
								esriRequest({
									url:"https://www.arcgis.com/sharing/rest/community/users/" + results.owner + "/update",
									content:{
										f:"json",
										fullname:this.userFullName,
										description:this.userDescription
									}
								}, {
									usePost:true
								}).then(lang.hitch(this, function (response) {
									if (response.success) {
										this.userFullName_clean = this.userFullName;
										this.userDescription_clean = this.userDescription;
										this.portalUtils.setUserFullName(this.userFullName);
										this.portalUtils.setUserDescription(this.userDescription);
										// update the Edit/Save buttons
										this.userInterfaceUtils.updateEditSaveButton(this.editSaveBtnNode, defaults.EDIT_BTN_LABEL, this.cancelBtnNode, "none");
										// update the scoring numerator(s)
										this.scoringUtils.userThumbnailScore = 0;
										this.scoringUtils.userNameScore = this.validator.setUserProfileFullNameScore(this.userFullName_clean);
										this.scoringUtils.userDescriptionScore = this.validator.setUserDescriptionScore(this.userDescription_clean);
										// update the nodes
										this.userNameScoreNumeratorNode.innerHTML = this.scoringUtils.userNameScore;
										this.userDescriptionScoreNumeratorNode.innerHTML = this.scoringUtils.userDescriptionScore;

										// update section style score graphics
										this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.userNameScore, this.scoringUtils.USER_PROFILE_FULLNAME, this.userNameScoreNodeContainer);
										this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.userDescriptionScore, this.scoringUtils.USER_PROFILE_DESCRIPTION, this.userDescriptionScoreNodeContainer);

										// section overall score
										this.scoringUtils.userProfileScore = this.scoringUtils.userThumbnailScore + this.scoringUtils.userNameScore + this.scoringUtils.userDescriptionScore;
										this.scoringUtils.updateSectionScore(this.scoringUtils.userProfileScore, this.profileNode, this.scoringUtils.USER_PROFILE_MAX_SCORE);
										this.scoringUtils.updateOverallScore();
									}
								}));
							}));

							domConstruct.empty(this.profileUserFullNameNode);
							domConstruct.create("div", {
								innerHTML:this.userFullName
							}, this.profileUserFullNameNode, "first");
							domAttr.remove(this.profileUserFullNameNode, "data-dojo-type");
							domAttr.set(this.profileUserFullNameNode, "id", this.userNameID);

							domConstruct.empty(this.profileUserDescriptionNode);
							domConstruct.create("div", {
								innerHTML:this.userDescription
							}, this.profileUserDescriptionNode, "first");
							domAttr.remove(this.profileUserDescriptionNode, "data-dojo-type");
							domAttr.set(this.profileUserDescriptionNode, "id", this.userDescriptionID);
						}
					}));*/

					/*on(this.cancelBtnNode, "click", lang.hitch(this, function () {
					 this.profileThumbnailListener.remove();
					 domStyle.set(query(".expanded-item-thumbnail")[0], "cursor", "inherit");

					 domStyle.set(query(".edit-profile-thumbnail-msg")[0], "display", "none");
					 domConstruct.empty(this.profileUserFullNameNode);
					 domConstruct.create("div", {
					 innerHTML:this.userFullName_clean
					 }, this.profileUserFullNameNode, "first");
					 domAttr.remove(this.profileUserFullNameNode, "data-dojo-type");
					 domAttr.set(this.profileUserFullNameNode, "id", this.userNameID);

					 domConstruct.empty(this.profileUserDescriptionNode);
					 domConstruct.create("div", {
					 innerHTML:this.userDescription_clean
					 }, this.profileUserDescriptionNode, "first");
					 domAttr.remove(this.profileUserDescriptionNode, "data-dojo-type");
					 domAttr.set(this.profileUserDescriptionNode, "id", this.userDescriptionID);
					 domAttr.set(this.editSaveBtnNode, "innerHTML", defaults.EDIT_BTN_LABEL);
					 domStyle.set(this.cancelBtnNode, "display", "none");

					 this.scoringUtils.userThumbnailScore = 0;
					 this.scoringUtils.userNameScore = this.validator.setUserProfileFullNameScore(this.userFullName_clean);
					 this.scoringUtils.userDescriptionScore = this.validator.setUserDescriptionScore(this.userDescription_clean);
					 this.userNameScoreNumeratorNode.innerHTML = this.scoringUtils.userNameScore;
					 this.userDescriptionScoreNumeratorNode.innerHTML = this.scoringUtils.userDescriptionScore;

					 // update section style score graphics
					 this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.userNameScore, this.scoringUtils.USER_PROFILE_FULLNAME, this.userNameScoreNodeContainer);
					 this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.userDescriptionScore, this.scoringUtils.USER_PROFILE_DESCRIPTION, this.userDescriptionScoreNodeContainer);

					 this.scoringUtils.userProfileScore = this.scoringUtils.userThumbnailScore + this.scoringUtils.userNameScore + this.scoringUtils.userDescriptionScore;
					 this.scoringUtils.updateSectionScore(this.scoringUtils.userProfileScore, this.profileNode, this.scoringUtils.USER_PROFILE_MAX_SCORE);
					 this.scoringUtils.updateOverallScore();
					 }));*/
					on(this.refreshBtnNode, "click", lang.hitch(this, function () {

						new arcgisPortal.Portal(defaults.sharinghost).signIn().then(lang.hitch(this, function (portalUser) {
							console.log(portalUser);

							this.portalUtils.fullName = portalUser.fullName;
							this.portalUtils.userDescription = portalUser.description;

							this.userFullName = this.validator.validateStr(this.portalUtils.fullName);
							this.userDescription = this.validator.validateStr(this.portalUtils.userDescription);

							domConstruct.empty(this.profileUserFullNameNode);
							domConstruct.create("div", {
								innerHTML:this.userFullName
							}, this.profileUserFullNameNode, "first");
							domAttr.remove(this.profileUserFullNameNode, "data-dojo-type");
							domAttr.set(this.profileUserFullNameNode, "id", this.userNameID);

							domConstruct.empty(this.profileUserDescriptionNode);
							domConstruct.create("div", {
								innerHTML:this.userDescription
							}, this.profileUserDescriptionNode, "first");
							domAttr.remove(this.profileUserDescriptionNode, "data-dojo-type");
							domAttr.set(this.profileUserDescriptionNode, "id", this.userDescriptionID);


							this.scoringUtils.userThumbnailScore = 0;
							this.scoringUtils.userNameScore = this.validator.setUserProfileFullNameScore(this.userFullName);
							this.scoringUtils.userDescriptionScore = this.validator.setUserDescriptionScore(this.userDescription);
							this.userNameScoreNumeratorNode.innerHTML = this.scoringUtils.userNameScore;
							this.userDescriptionScoreNumeratorNode.innerHTML = this.scoringUtils.userDescriptionScore;

							// update section style score graphics
							this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.userNameScore, this.scoringUtils.USER_PROFILE_FULLNAME, this.userNameScoreNodeContainer);
							this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.userDescriptionScore, this.scoringUtils.USER_PROFILE_DESCRIPTION, this.userDescriptionScoreNodeContainer);

							this.scoringUtils.userProfileScore = this.scoringUtils.userThumbnailScore + this.scoringUtils.userNameScore + this.scoringUtils.userDescriptionScore;
							this.scoringUtils.updateSectionScore(this.scoringUtils.userProfileScore, this.profileNode, this.scoringUtils.USER_PROFILE_MAX_SCORE);
							this.scoringUtils.updateOverallScore();
						}));
					}));
				}

				this.userThumbnailUrl = this.portalUtils.portalUser.thumbnailUrl;
				if (this.userThumbnailUrl === null) {
					this.userThumbnailUrl = "https://cdn.arcgis.com/cdn/5777/js/arcgisonline/css/images/no-user-thumb.jpg";
				}
				this.userThumbnailUrl_clean = this.userThumbnailUrl;
				domAttr.set(this.profileThumbnailNode, "src", this.userThumbnailUrl);

				domAttr.set(this.profileUserFullNameNode, "id", this.userNameID);
				domConstruct.create("div", {
					innerHTML:this.userFullName
				}, this.profileUserFullNameNode, "first");

				domAttr.set(this.profileUserDescriptionNode, "id", this.userDescriptionID);
				domConstruct.create("div", {
					innerHTML:this.userDescription
				}, this.profileUserDescriptionNode, "first");

				this.userThumbnailDenominatorNode.innerHTML = this.scoringUtils.USER_PROFILE_THUMBNAIL;
				this.userNameScoreDenominatorNode.innerHTML = this.scoringUtils.USER_PROFILE_FULLNAME;
				this.userDescriptionScoreDenominatorNode.innerHTML = this.scoringUtils.USER_PROFILE_DESCRIPTION;

				this.scoringUtils.userThumbnailScore = 7;
				this.scoringUtils.userNameScore = this.validator.setUserProfileFullNameScore(this.userFullName/*this.portalUtils.fullName*/);
				this.scoringUtils.userDescriptionScore = this.validator.setUserDescriptionScore(this.userDescription/*this.portalUtils.portalUser.description*/);
				this.userThumbnailNumeratorNode.innerHTML = this.scoringUtils.userThumbnailScore;
				this.userNameScoreNumeratorNode.innerHTML = this.scoringUtils.userNameScore;
				this.userDescriptionScoreNumeratorNode.innerHTML = this.scoringUtils.userDescriptionScore;

				this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.userThumbnailScore, this.scoringUtils.USER_PROFILE_THUMBNAIL, this.userThumbnailNodeContainer);
				this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.userNameScore, this.scoringUtils.USER_PROFILE_FULLNAME, this.userNameScoreNodeContainer);
				this.userInterfaceUtils.updateSectionScoreStyle(this.scoringUtils.userDescriptionScore, this.scoringUtils.USER_PROFILE_DESCRIPTION, this.userDescriptionScoreNodeContainer);

				this.scoringUtils.userProfileScore = this.scoringUtils.userThumbnailScore + this.scoringUtils.userNameScore + this.scoringUtils.userDescriptionScore;
				this.scoringUtils.updateSectionScore(this.scoringUtils.userProfileScore, this.profileNode, this.scoringUtils.USER_PROFILE_MAX_SCORE);
				this.scoringUtils.updateOverallScore();

			}));
		},

		uploadUserProfileThumbnail:function (imageSizeName) {
			var deferred = new Deferred();
			var previewDlg = new Dialog({
				title:"Update Thumbnail",
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
						//
						if ((imgNode.width === defaults.THUMBNAIL_IMAGE_SIZES[imageSizeName][0]) && (imgNode.height === defaults.THUMBNAIL_IMAGE_SIZES[imageSizeName][1])) {
							domClass.remove(uploadThumbBtn.domNode, "dijitHidden");
							// upload button selected
							uploadThumbBtn.on("click", lang.hitch(this, function (evt) {
								domClass.add(uploadThumbBtn.domNode, "dijitHidden");
								this.updateUserProfileThumbnail(form).then(lang.hitch(this, function (response) {
									previewDlg.hide();
									if (response) {
										esriRequest({
											url:lang.replace("{url}", this.portalUtils.portalUser),
											content:{
												f:"json"
											},
											handleAs:"json"
										}).then(lang.hitch(this, function (obj) {
											console.log(this);
											this.validator.setThumbnailScore(obj);
											this.scoringUtils.updateOverallScore();
											this.portalUserThumbnailUrl = this.portalUserThumbnailUrl.substring(0, this.portalUserThumbnailUrl.lastIndexOf("/"));
											this.portalUserThumbnailUrl = this.portalUserThumbnailUrl + "/" + obj.thumbnail;
											domAttr.set(query(".profileThumbnailUrl")[0], "src", this.portalUserThumbnailUrl);
										}));
									}
								}), lang.hitch(this, function (error) {
									console.warn(error);
									msgPane.innerHTML = error.message;
								}));
							}));
						} else {
							msgPane.innerHTML = lang.replace("Invalid image size; it must be {0}px by {1}px", defaults.THUMBNAIL_IMAGE_SIZES[imageSizeName]);
						}
					});
					imgNode.src = _file.target.result;
				});
			}));
			return deferred.promise;
		},

		updateUserProfileThumbnail:function (form) {
			var deferred = new Deferred();
			esriRequest({
				url:lang.replace("{url}/update", this.portalUtils.portalUser),
				form:form,
				content:{
					f:"json"
				},
				handleAs:"json"
			}).then(deferred.resolve, deferred.reject);
			return deferred.promise;
		},

		adminNodeClickHandler:function (evt) {
			var label = evt.target.innerHTML;

			// destroy dijit
			if (dijit.byId("adminDialog") !== undefined) {
				dijit.byId("adminDialog").destroy();
			}

			// pass in the textarea we want to set focus on
			if (dijit.byId("adminDialog") === undefined) {
				if (label === "Thumbnail") {
					lang.hitch(this, this.loadAdminDialog("userThumbnailNotesTextArea"));
				} else if (label === "Name") {
					lang.hitch(this, this.loadAdminDialog("userNameNotesTextArea"));
				} else if (label === "Description") {
					lang.hitch(this, this.loadAdminDialog("userDescNotesTextArea"));
				}
			}
		},

		loadAdminDialog:function (focusedNode) {
			this.userInterfaceUtils.getFeature(this.selectedID).then(lang.hitch(this, function (response) {
				var feature = response.features[0];

				var adminDialog = new Dialog({
					id:"adminDialog",
					title:"DETAILS Section",
					class:"details-admin-dialog",
					onFocus:function () {
						focusUtil.focus(dom.byId(focusedNode));
					}
				});

				adminDialog.set("content",
						"<div class='row attribute-row'>" +
								"	<div class='column-6'>" +
								"		<div class='dialog-label'> Thumbnail Notes : <\/div>" +
								"	<\/div>" +
								"	<div class='column-18'>" +
								"		<textarea id='userThumbnailNotesTextArea'>" + feature.attributes.notesProfileThumbnail + "<\/textarea>" +
								"	<\/div>" +
								"<\/div>" +

								"<div class='row attribute-row'>" +
								"	<div class='column-6'>" +
								"		<div class='dialog-label'> Title Notes : <\/div>" +
								"	<\/div>" +
								"	<div class='column-18'>" +
								"		<textarea id='userNameNotesTextArea'>" + feature.attributes.notesProfileFullName + "<\/textarea>" +
								"	<\/div>" +
								"<\/div>" +

								"<div class='row attribute-row'>" +
								"	<div class='column-6'>" +
								"		<div class='dialog-label'> Summary Notes : <\/div>" +
								"	<\/div>" +
								"	<div class='column-18'>" +
								"		<textarea id='userDescNotesTextArea'>" + feature.attributes.notesProfileDesc + "<\/textarea>" +
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
					this.portalUtils.portalUser.getItem(this.selectedID).then(lang.hitch(this, function (item) {
						var userThumbnailNotes = dom.byId("userThumbnailNotesTextArea").value;
						var userNameNotes = dom.byId("userNameNotesTextArea").value;
						var userDescNotes = dom.byId("userDescNotesTextArea").value;
						this.userInterfaceUtils.getFeature(this.selectedID).then(lang.hitch(this, lang.partial(this.updateAdminDialogNotes, userThumbnailNotes, userNameNotes, userDescNotes)));
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

		updateAdminDialogNotes:function (userThumbnailNotes, userNameNotes, userDescNotes, response) {
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
				"notesProfileThumbnail":userThumbnailNotes,
				"notesProfileFullName":userNameNotes,
				"notesProfileDesc":userDescNotes
			};
			var graphic = new Graphic(pt, sms, attr);
			this.nominateUtils.nominateAdminFeatureLayer.applyEdits(null, [graphic], null);
		}
	});
});