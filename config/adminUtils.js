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
	"dojo/string",
	"dijit/Dialog",
	"dijit/focus",
	"config/defaults"
], function (Color, esriRequest, Point, Graphic, FeatureLayer, SimpleMarkerSymbol, array, declare, lang, dom, domAttr, domClass, domConstruct, domStyle, html, mouse, on, query, string, Dialog, focusUtil, defaults) {

	return declare(null, {

		validator:null,
		selectedItemID:null,
		defaults:null,
		userInterfaceUtils:null,

		constructor:function () {
		},

		openEmailDialog:function () {
			this.userInterfaceUtils.getFeature(this.selectedID).then(lang.hitch(this, function (response) {
				if (response.features[0]) {
					var content = response.features[0];
					var userFullName = this.portalUtils.portalUser.fullName;
					// user's contact email
					var userEmail = content.attributes["ContactEmail"];
					// item name
					var itemName = content.attributes["itemName"];

					var closingMessage = defaults.AMDIN_MSG_CLOSING;

					// Dialog
					var itemTitleDialog = new Dialog({
						id:"emailMessageDialog",
						title:"Email draft",
						class:"admin-editing-dialog",
						onFocus:function () {
							focusUtil.focus(query(".email-btn-send")[0]);
						}
					});

					// dialog displayed to curators
					itemTitleDialog.set("content",
							'<div class="container">' +
									'	<div class="row">' +
									'		<div class="column-24">' +
									'			<div class="panel default compact" style="margin-bottom: 5px;">' +
									'				<h5>Email to: <b>' + userFullName + '</b><\/h5>' +
									'				<p>' + defaults.ADMIN_MSG_CURATOR_INSTRUCTIONS + '<\/p>' +
									'			<\/div>' +
									'		<\/div>' +
									'	<\/div>' +
									'	<div class="row">' +
									'		<div class="column-24">' +
									'			<div class="email-message-container"><\/div>' +
									'		<\/div>' +
									'	<div class="row right dialog-btn-row">' +
									'		<div class="column-11">' +
									'			<button class="btn email-btn-cancel"> Cancel <\/button>' +
									'		<\/div>' +
									'		<div class="column-13">' +
									'			<button class="btn icon-email email-btn-send"> Send <\/button>' +
									'		<\/div>' +
									'	<\/div>' +
									'	<\/div>' +
									'<\/div>');

					// Curator message
					var dialogBody =
							"<div>" + defaults.ADMIN_MSG_GREETING + userFullName + ", <\/div>" +
									"<div><p>" + defaults.ADMIN_MSG_INTRO_1 + itemName + defaults.ADMIN_MSG_INTRO_2 + "<\/p><\/div>" +
									this._formatOutput("Item Thumbnail", content.attributes["notesThumbnail"], true) +
									this._formatOutput("Item Title", content.attributes["notesTitle"], true) +
									this._formatOutput("Item Summary", content.attributes["notesSummary"], true) +
									this._formatOutput("Item Description", content.attributes["notesDescription"], true) +
									this._formatOutput("Credits", content.attributes["notesCredits"], true) +
									this._formatOutput("Item Access and Use Constraints", content.attributes["notesAccessUseConstraints"], true) +
									this._formatOutput("Tags", content.attributes["notesTags"], true) +
									this._formatOutput("Map Draw Time", content.attributes["notesDrawTime"], true) +
									this._formatOutput("Number of Layers", content.attributes["notesNumberOfLayers"], true) +
									this._formatOutput("Popups", content.attributes["notesPopups"], true) +
									this._formatOutput("Sharing", content.attributes["notesSharing"], true) +
									this._formatOutput("User Profile Thumbnail", content.attributes["notesProfileThumbnail"], true) +
									this._formatOutput("User Profile Full Name", content.attributes["notesProfileFullName"], true) +
									this._formatOutput("User Profile Description", content.attributes["notesProfileDesc"], true) +
									"<div><p>" + closingMessage + "<\/p><\/div>";

					// Message in body of email
					var emailBody =
							defaults.ADMIN_MSG_GREETING + userFullName + ", %0A" +
									defaults.ADMIN_MSG_INTRO_1 + itemName + defaults.ADMIN_MSG_INTRO_2 + "%0A%0A" +
									this._formatOutput("Item Thumbnail", content.attributes["notesThumbnail"], false) +
									this._formatOutput("Item Title", content.attributes["notesTitle"], false) +
									this._formatOutput("Item Summary", content.attributes["notesSummary"], false) +
									this._formatOutput("Item Description", content.attributes["notesDescription"], false) +
									this._formatOutput("Credits", content.attributes["notesCredits"], false) +
									this._formatOutput("Item Access and Use Constraints", content.attributes["notesAccessUseConstraints"], false) +
									this._formatOutput("Tags", content.attributes["notesTags"], false) +
									this._formatOutput("Map Draw Time", content.attributes["notesDrawTime"], false) +
									this._formatOutput("Number of Layers", content.attributes["notesNumberOfLayers"], false) +
									this._formatOutput("Popups", content.attributes["notesPopups"], false) +
									this._formatOutput("Sharing", content.attributes["notesSharing"], false) +
									this._formatOutput("User Profile Thumbnail", content.attributes["notesProfileThumbnail"], false) +
									this._formatOutput("User Profile Full Name", content.attributes["notesProfileFullName"], false) +
									this._formatOutput("User Profile Description", content.attributes["notesProfileDesc"], false) +
									closingMessage;

					var emailMsgContainerNode = query(".email-message-container")[0];
					domConstruct.create("div", {
						innerHTML:'<div class="row custom-row-style">' +
								'	<div class="column-24">' +
								'		<div class="panel white">' +
								'			<p>' + dialogBody + '<\/p>' +
								'		<\/div>' +
								'	<\/div>' +
								'<\/div>'
					}, emailMsgContainerNode, "last");

					// email dialog "SEND" button handler
					on(query(".email-btn-send"), "click", lang.hitch(this, function () {
						this.portalUtils.portalUser.getItem(this.selectedID).then(lang.hitch(this, function (item) {
							var status = defaults.STATUS_UNDER_REVIEW;
							this.userInterfaceUtils.getFeature(this.selectedID).then(lang.hitch(this, lang.partial(this.nominateUtils.updateItemStatus, defaults.CURRENT_STATUS[2].label, status)));
						}));
						var link = "mailto:" + userEmail +
								"?cc=" + defaults.LIVING_ATLAS_EMAIL_ALIAS +
								"&subject=" + itemName +
								"&body=" + emailBody;
						window.location.href = link;
					}));

					// email dialog "CANCEL" button
					on(query(".email-btn-cancel"), "click", lang.hitch(this, function () {
						dijit.byId("emailMessageDialog").destroy();
					}));
					itemTitleDialog.show();
				}
			}));
		},

		_formatOutput:function (header, str, draft) {
			var output = "";
			if (!str) {
				output = "";
			} else {
				if (draft) {
					//"<div>Item Thumbnail<p>" + notesThumbnail + "<\/p><\/div>" +
					output = "<div>" + header + "<p>" + string.trim(str) + "<\/p><\/div>";
				} else {
					//notesThumbnail + "%0A%0A" +
					output = header + "%0A" + string.trim(str) + "%0A%0A";
				}
			}
			return output;
		}
	});
});