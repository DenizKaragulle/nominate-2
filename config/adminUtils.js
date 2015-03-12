define([
	"esri/request",
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
], function (esriRequest, array, declare, lang, dom, domAttr, domClass, domConstruct, domStyle, html, mouse, on, query, string, Dialog, focusUtil, defaults) {

	return declare(null, {

		validator: null,
		selectedItemID: null,
		defaults: null,
		userInterfaceUtils: null,

		constructor: function () { },

		openEmailDialog: function () {
			this.userInterfaceUtils.getFeature(this.selectedID).then(lang.hitch(this, function (response) {
				if (response.features[0]) {
					var content = response.features[0];
					var userFullName = this.portalUtils.portalUser.fullName;
					// user's contact email
					var userEmail = content.attributes["ContactEmail"];
					// item name
					var itemName = content.attributes["itemName"];
					// Notes
					var notesThumbnail = this._formatOutput("Item Thumbnail", content.attributes["notesThumbnail"]);
					var notesTitle = this._formatOutput("Item Title", content.attributes["notesTitle"]);
					var notesSummary = this._formatOutput("Item Summary", content.attributes["notesSummary"]);
					var notesDescription = this._formatOutput("Item Description", content.attributes["notesDescription"]);
					var notesCredits = this._formatOutput("Credits", content.attributes["notesCredits"]);
					var notesAccessAndUseConstraints = this._formatOutput("Item Access and Use Constraints", content.attributes["notesAccessUseConstraints"]);
					var notesTags = this._formatOutput("Tags", content.attributes["notesTags"]);
					var notesDrawTime = this._formatOutput("Map Draw Time", content.attributes["notesDrawTime"]);
					var notesNumberOfLayers = this._formatOutput("Number of Layers", content.attributes["notesNumberOfLayers"]);
					var notesPopups = this._formatOutput("Popups", content.attributes["notesPopups"]);
					var notesSharing = this._formatOutput("Sharing", content.attributes["notesSharing"]);
					var notesProfileThumbnail = this._formatOutput("User Profile Thumbnail", content.attributes["notesProfileThumbnail"]);
					var notesProfileFullName = this._formatOutput("User Profile Full Name", content.attributes["notesProfileFullName"]);
					var notesProfileDesc = this._formatOutput("User Profile Description", content.attributes["notesProfileDesc"]);

					var closingMessage = defaults.AMDIN_MSG_CLOSING;

					// Dialog
					var itemTitleDialog = new Dialog({
						id: "emailMessageDialog",
						title: "Email draft",
						class: "admin-editing-dialog",
						onFocus: function () {
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
							'				<p>'  + defaults.ADMIN_MSG_CURATOR_INSTRUCTIONS +'<\/p>' +
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
							"<div><p>" + notesThumbnail + "<\/p><\/div>" +
							"<div><p>" + notesTitle + "<\/p><\/div>" +
							"<div><p>" + notesSummary + "<\/p><\/div>" +
							"<div><p>" + notesDescription + "<\/p><\/div>" +
							"<div><p>" + notesCredits + "<\/p><\/div>" +
							"<div><p>" + notesAccessAndUseConstraints + "<\/p><\/div>" +
							"<div><p>" + notesTags + "<\/p><\/div>" +
							"<div><p>" + notesDrawTime + "<\/p><\/div>" +
							"<div><p>" + notesNumberOfLayers + "<\/p><\/div>" +
							"<div><p>" + notesPopups + "<\/p><\/div>" +
							"<div><p>" + notesSharing + "<\/p><\/div>" +
							"<div><p>" + notesProfileThumbnail + "<\/p><\/div>" +
							"<div><p>" + notesProfileFullName + "<\/p><\/div>" +
							"<div><p>" + notesProfileDesc + "<\/p><\/div>" +
							"<div><p>" + closingMessage + "<\/p><\/div>";

					// Message in body of email
					var emailBody =
							defaults.ADMIN_MSG_GREETING + userFullName + ", %0A" +
							defaults.ADMIN_MSG_INTRO_1 + itemName + defaults.ADMIN_MSG_INTRO_2 + "%0A%0A" +
							notesThumbnail + "%0A%0A" +
							notesTitle + "%0A%0A" +
							notesSummary + "%0A%0A" +
							notesDescription + "%0A%0A" +
							notesCredits + "%0A%0A" +
							notesAccessAndUseConstraints + "%0A%0A" +
							notesTags + "%0A%0A" +
							notesDrawTime + "%0A%0A" +
							notesNumberOfLayers + "%0A%0A" +
							notesPopups + "%0A%0A" +
							notesSharing + "%0A%0A" +
							notesProfileThumbnail + "%0A%0A" +
							notesProfileFullName + "%0A%0A" +
							notesProfileDesc + "%0A%0A" +
							closingMessage;

					var emailMsgContainerNode = query(".email-message-container")[0];
					domConstruct.create("div", {
						innerHTML:
								'<div class="row custom-row-style">' +
								'	<div class="column-24">' +
								'		<div class="panel white">' +
								'			<p>' + dialogBody + '<\/p>' +
								'		<\/div>' +
								'	<\/div>' +
								'<\/div>'
					}, emailMsgContainerNode, "last");

					on(query(".email-btn-send"), "click", lang.hitch(this, function () {
						window.location = "mailto:" + userEmail + "?subject=" + itemName + "&body=" + emailBody;
					}));

					on(query(".email-btn-cancel"), "click", lang.hitch(this, function () {
						dijit.byId("emailMessageDialog").destroy();
					}));
					itemTitleDialog.show();
				}
			}));
		},

		_formatOutput: function (header, str) {
			var output = "";
			console.log(output);
			if (str === null || str === "") {
				output = "";
			} else {
				str = string.trim(str);
				output = "<div>" + header + "<\/div><div>" + str + "<\/div>";
			}
			return output;
		}
	});
});