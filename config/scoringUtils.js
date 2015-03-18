define([
	"dijit/ProgressBar",
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
	"dojo/query"
], function (ProgressBar, array, declare, lang, Deferred, dom, domAttr, domClass, domConstruct, domStyle, html, mouse, on, query) {

	return declare(null, {

		defaults: null,
		validator: null,
		scoring: null,
		portalUtils: null,
		nominateUtils: null,
		userInterfaceUtils: null,

		selectedID: null,

		// current overall score
		overAllCurrentScore: null,
		// details
		itemDetailsScore: null,
		// access and user constraints / license info
		creditsAndAccessScore: null,
		itemCreditsScore: null,
		itemAccessAndUseConstraintsScore: null,
		// tags
		itemTagsScore: null,
		// performance
		performanceScore: null,
		mapDrawTimeScore: null,
		nLayersScore: null,
		popupsScore: null,
		sharingScore: null,
		// user profile
		userProfileScore: null,
		userThumbnailScore: null,
		userNameScore: null,
		userDescriptionScore: null,


		overallScoreGraphic: null,
		progressBarNode: null,

		ITEM_THUMBNAIL_MAX_SCORE: null,
		ITEM_TITLE_MAX_SCORE: null,
		ITEM_SUMMARY_MAX_SCORE: null,
		ITEM_DESC_MAX_SCORE: null,
		ITEM_DETAILS_MAX_SCORE: null,

		ITEM_CREDIT_MAX_SCORE: null,
		ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE: null,
		ITEM_USE_CONSTRAINS_MAX_SCORE: null,

		TAGS_MAX_SCORE: null,

		PERFORMANCE_SHARING_MAX_SCORE: null,
		PERFORMANCE_POPUPS_MAX_SCORE: null,
		PERFORMANCE_DRAW_TIME_MAX_SCORE: null,
		PERFORMANCE_LAYER_COUNT_MAX_SCORE: null,
		PERFORMANCE_MAX_SCORE: null,

		USER_PROFILE_THUMBNAIL: null,
		USER_PROFILE_FULLNAME: null,
		USER_PROFILE_DESCRIPTION: null,
		USER_PROFILE_MAX_SCORE: null,

		MAX_SCORE: null,

		constructor: function (validator, selectedID, defaults, scoring, portalUtils, nominateUtils, userInterfaceUtils) {
			this.validator = validator;
			this.selectedID = selectedID;
			this.defaults = defaults;
			this.scoring = scoring;
			this.portalUtils = portalUtils;
			this.nominateUtils = nominateUtils;
			this.userInterfaceUtils = userInterfaceUtils;

			this.overAllCurrentScore = 0;
			this.itemDetailsScore = 0;
			this.creditsAndAccessScore = 0;
			this.itemCreditsScore = 0;
			this.itemAccessAndUseConstraintsScore = 0;
			this.itemTagsScore = 0;
			this.performanceScore = 0;
			this.userProfileScore = 0;
			this.userThumbnailScore = 0;
			this.userNameScore = 0;
			this.userDescriptionScore = 0;

			this.ITEM_THUMBNAIL_MAX_SCORE = this.scoring.ITEM_THUMBNAIL_NONE_SCORE + this.scoring.ITEM_THUMBNAIL_CUSTOM + this.scoring.ITEM_THUMBNAIL_LARGE_SCORE;
			this.ITEM_TITLE_MAX_SCORE = this.scoring.ITEM_TITLE_NO_BAD_WORDS_SCORE + this.scoring.ITEM_TITLE_NO_UNDERSCORE_SCORE + this.scoring.ITEM_TITLE_MIN_LENGTH_SCORE + this.scoring.ITEM_TITLE_NO_ALL_CAPS_SCORE;
			this.ITEM_SUMMARY_MAX_SCORE = this.scoring.ITEM_SUMMARY_MUST_EXIST_SCORE + this.scoring.ITEM_SUMMARY_NO_BAD_WORDS_SCORE + this.scoring.ITEM_SUMMARY_NO_UNDERSCORE_SCORE + this.scoring.ITEM_SUMMARY_MIN_LENGTH_SCORE;
			this.ITEM_DESC_MAX_SCORE = this.scoring.ITEM_DESCRIPTION_MUST_EXIST_SCORE + this.scoring.ITEM_DESCRIPTION_MIN_LENGTH_SCORE + this.scoring.ITEM_DESCRIPTION_LINK_SCORE;
			this.ITEM_DETAILS_MAX_SCORE = this.ITEM_THUMBNAIL_MAX_SCORE + this.ITEM_TITLE_MAX_SCORE + this.ITEM_SUMMARY_MAX_SCORE + this.ITEM_DESC_MAX_SCORE;

			this.ITEM_CREDIT_MAX_SCORE = this.scoring.ITEM_CREDITS_MIN_NUM_WORDS_SCORE;
			this.ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE = this.scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_WORDS_SCORE + this.scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_MIN_WORDS_SCORE + this.scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_BONUS_WORDS_SCORE + this.scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_VALID_LINK_SCORE;
			this.ITEM_USE_CONSTRAINS_MAX_SCORE = this.ITEM_CREDIT_MAX_SCORE + this.ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE;

			this.TAGS_MAX_SCORE = this.scoring.TAGS_HAS_TAGS_SCORE + this.scoring.TAGS_HAS_ATLAS_TAGS_SCORE + this.scoring.TAGS_HAS_NO_BAD_WORDS_SCORE;

			this.PERFORMANCE_SHARING_MAX_SCORE = this.scoring.PERFORMANCE_MAX;
			this.PERFORMANCE_POPUPS_MAX_SCORE = this.scoring.PERFORMANCE_POPUPS_ENABLED + this.scoring.PERFORMANCE_POPUPS_CUSTOM;
			this.PERFORMANCE_DRAW_TIME_MAX_SCORE = this.scoring.PERFORMANCE_MAX;
			this.PERFORMANCE_LAYER_COUNT_MAX_SCORE = this.scoring.PERFORMANCE_MAX;
			this.PERFORMANCE_MAX_SCORE = this.PERFORMANCE_SHARING_MAX_SCORE + this.PERFORMANCE_POPUPS_MAX_SCORE + this.PERFORMANCE_DRAW_TIME_MAX_SCORE + this.PERFORMANCE_LAYER_COUNT_MAX_SCORE;

			this.USER_PROFILE_THUMBNAIL = this.scoring.USER_PROFILE_HAS_THUMBNAIL + this.scoring.USER_PROFILE_HAS_LARGE_THUMBNAIL;
			this.USER_PROFILE_FULLNAME = this.scoring.USER_PROFILE_HAS_FULLNAME_MIN_NUM_WORDS_SCORE + this.scoring.USER_PROFILE_FULLNAME_HAS_NO_UNDERSCORE_SCORE;
			this.USER_PROFILE_DESCRIPTION = this.scoring.USER_PROFILE_DESCRIPTION_HAS_DESCRIPTION + this.scoring.USER_PROFILE_DESCRIPTION_HAS_MIN_NUM_SENTENCES + this.scoring.USER_PROFILE_DESCRIPTION_HAS_MIN_NUM_WORDS + this.scoring.USER_PROFILE_DESCRIPTION_HAS_LINK + this.scoring.USER_PROFILE_DESCRIPTION_HAS_EMAIL;
			this.USER_PROFILE_MAX_SCORE = this.USER_PROFILE_THUMBNAIL + this.USER_PROFILE_FULLNAME + this.USER_PROFILE_DESCRIPTION;
			this.MAX_SCORE = this.ITEM_DETAILS_MAX_SCORE + this.ITEM_USE_CONSTRAINS_MAX_SCORE + this.TAGS_MAX_SCORE + this.PERFORMANCE_MAX_SCORE + this.USER_PROFILE_MAX_SCORE;
		},

		updateScore: function (item, detailsNode, creditsNode, tagsNode, performanceNode, profileNode) {
			// details
			this.itemThumbnailScore = this.validator.setThumbnailScore(item);
			this.validator.setItemTitleScore(item.title);
			this.itemSummaryScore = this.validator.setItemSummaryScore(item.snippet);
			this.riptionScore = this.validator.setItemDescriptionScore(item.description);
			this.itemDetailsScore = this.itemThumbnailScore + this.itemTitleScore + this.itemSummaryScore + this.itemDescriptionScore;
			this.userInterfaceUtils.setPassFailStyleOnTabNode(this.itemDetailsScore, detailsNode, this.ITEM_DETAILS_MAX_SCORE);
			// use/constrains
			this.itemCreditsScore = this.validator.setCreditsScore(item.accessInformation);
			this.itemAccessAndUseConstraintsScore = this.validator.setAccessAndUseConstraintsScore(item.licenseInfo);
			this.creditsAndAccessScore = this.itemCreditsScore + this.itemAccessAndUseConstraintsScore;
			this.userInterfaceUtils.setPassFailStyleOnTabNode(this.creditsAndAccessScore, creditsNode, this.ITEM_USE_CONSTRAINS_MAX_SCORE);
			// tags
			this.itemTagsScore = this.validator.validateItemTags(item.tags);
			this.userInterfaceUtils.setPassFailStyleOnTabNode(this.itemTagsScore, tagsNode, this.TAGS_MAX_SCORE);
			// performance
			this.userInterfaceUtils.setPassFailStyleOnTabNode(this.performanceScore, performanceNode, this.PERFORMANCE_MAX_SCORE);
			// user profile
			this.userThumbnailScore = 7;//validator.setThumbnailScore(portalUtils.portalUser);
			this.userNameScore = this.validator.setUserProfileFullNameScore(this.portalUtils.portalUser.fullName);
			this.userDescriptionScore = this.validator.setUserDescriptionScore(this.portalUtils.portalUser.description);
			this.userProfileScore = this.userThumbnailScore + this.userNameScore + this.userDescriptionScore;
			this.userInterfaceUtils.setPassFailStyleOnTabNode(this.userProfileScore, profileNode, this.USER_PROFILE_MAX_SCORE);
			// update the overall score and score graphic
			this.updateOverallScore();
		},

		updateOverallScore: function () {
			this.updateTotalScore(this.itemDetailsScore, this.creditsAndAccessScore, this.itemTagsScore, this.performanceScore, this.userProfileScore, this.MAX_SCORE, this.scoring.MAXIMUM_SCORE);
			this.updateTotalScoreGraphic(this.overAllCurrentScore);
		},

		updateTotalScore: function (itemDetailsScore, creditsAndAccessScore, itemTagsScore, performanceScore, userProfileScore, MAX_SCORE, MAXIMUM_SCORE) {
			this.overAllCurrentScore = Math.floor((itemDetailsScore + creditsAndAccessScore + itemTagsScore + performanceScore + userProfileScore) / MAX_SCORE * MAXIMUM_SCORE);
			query(".current-score-number")[0].innerHTML = this.overAllCurrentScore;
		},

		updateTotalScoreGraphic: function (totalScore) {
			var nominateBtnNode = this.nominateUtils.nominateBtnNode;
			var classAttrs = domAttr.get(nominateBtnNode, "class");
			if (totalScore >= this.scoring.SCORE_THRESHOLD) {
				// PASS
				// set the overall score color to pass
				domStyle.set(query(".current-score-number")[0], "color", this.scoring.PASS_COLOR);
				//
				if (array.some(this.nominateUtils.nominatedItems.features, lang.hitch(this, function (feature) {
					return this.selectedID === feature.attributes.itemID;
				}))) {
					// Item has been already nominated
					this.userInterfaceUtils.disableNominateButton(nominateBtnNode);
					this.userInterfaceUtils.enableNominateButton(this.nominateUtils.acceptBtnNode);
				} else {
					// Item has not been nominated
					// enable the "Nominate" button
					this.userInterfaceUtils.enableNominateButton(nominateBtnNode);
					// add the event handler for the "NOMINATE" button
					this.nominateUtils.nominateBtnClickHandler = on(nominateBtnNode, "click", lang.hitch(this, function () {
						this.nominateUtils.isItemNominated(this.nominateUtils.selectedID).then(lang.hitch(this, this.nominateUtils.nominate));
					}));
				}
				// add the event handler for the "ACCEPT" button
				this.nominateUtils.acceptBtnClickHandler = on(this.nominateUtils.acceptBtnNode, "click", lang.hitch(this, function () {
					this.nominateUtils.isItemNominated(this.nominateUtils.selectedID).then(lang.hitch(this, this.nominateUtils.accept));
				}));
			} else {
				// FAIL
				domStyle.set(query(".current-score-number")[0], "color", this.scoring.FAIL_COLOR);
				classAttrs = classAttrs.replace("enabled", "disabled");
				domAttr.set(nominateBtnNode, "class", classAttrs);
				if (this.nominateUtils.nominateBtnClickHandler !== null) {
					this.nominateUtils.nominateBtnClickHandler.remove();
				}

				if (this.nominateUtils.acceptBtnClickHandler !== null) {
					this.nominateUtils.acceptBtnClickHandler.remove();
				}
			}
			this.loadTotalScoreGraphic(totalScore, query(".current-score-graphic-container")[0]);
		},

		loadTotalScoreGraphic: function (totalScore, node) {
			if (dijit.byId("overall-score-graphic") === undefined) {
				this.overallScoreGraphic = new ProgressBar({
					id: "overall-score-graphic",
					style: {
						"width": "100%",
						"height": "5px"
					},
					value: totalScore
				}).placeAt(node).startup();
				this.userInterfaceUtils.initPassingMarker(node);
			} else {
				dijit.byId("overall-score-graphic").setAttribute("value", totalScore);
			}
		},

		removeScoreBar: function () {
			if (dijit.byId("overall-score-graphic")) {
				dijit.byId("overall-score-graphic").destroy();
			}
		},

		updateSectionScore: function (score, node, max) {
			var classAttrs = domAttr.get(node, "class");
			score = Math.floor(score / max * this.scoring.MAXIMUM_SCORE);
			if (score >= this.scoring.SCORE_THRESHOLD) {
				// PASS
				classAttrs = classAttrs.replace("icon-edit", "active icon-check");
				domAttr.set(node, "class", classAttrs);
				domStyle.set(node, "color", this.scoring.PASS_COLOR);
				domStyle.set(node, "border", "1px solid " + this.scoring.PASS_COLOR);
			} else {
				// FAIL
				classAttrs = classAttrs.replace("icon-check", "active icon-edit");
				domAttr.set(node, "class", classAttrs);
				domStyle.set(node, "color", this.scoring.FAIL_COLOR);
				domStyle.set(node, "border", "1px solid " + this.scoring.FAIL_COLOR);
			}
		}
	});
});