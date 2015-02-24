define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/Deferred",
	"config/scoring"
], function (array, declare, Deferred, scoring) {

	return declare(null, {

		instance: null,
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

		constructor: function () {

		},

		startup: function () {
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

			this.ITEM_THUMBNAIL_MAX_SCORE = scoring.ITEM_THUMBNAIL_NONE_SCORE + scoring.ITEM_THUMBNAIL_CUSTOM + scoring.ITEM_THUMBNAIL_LARGE_SCORE;
			this.ITEM_TITLE_MAX_SCORE = scoring.ITEM_TITLE_NO_BAD_WORDS_SCORE + scoring.ITEM_TITLE_NO_UNDERSCORE_SCORE + scoring.ITEM_TITLE_MIN_LENGTH_SCORE + scoring.ITEM_TITLE_NO_ALL_CAPS_SCORE;
			this.ITEM_SUMMARY_MAX_SCORE = scoring.ITEM_SUMMARY_MUST_EXIST_SCORE + scoring.ITEM_SUMMARY_NO_BAD_WORDS_SCORE + scoring.ITEM_SUMMARY_NO_UNDERSCORE_SCORE + scoring.ITEM_SUMMARY_MIN_LENGTH_SCORE;
			this.ITEM_DESC_MAX_SCORE = scoring.ITEM_DESCRIPTION_MUST_EXIST_SCORE + scoring.ITEM_DESCRIPTION_MIN_LENGTH_SCORE + scoring.ITEM_DESCRIPTION_LINK_SCORE;
			this.ITEM_DETAILS_MAX_SCORE = this.ITEM_THUMBNAIL_MAX_SCORE + this.ITEM_TITLE_MAX_SCORE + this.ITEM_SUMMARY_MAX_SCORE + this.ITEM_DESC_MAX_SCORE;

			this.ITEM_CREDIT_MAX_SCORE = scoring.ITEM_CREDITS_MIN_NUM_WORDS_SCORE;
			this.ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE = scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_WORDS_SCORE + scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_MIN_WORDS_SCORE + scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_BONUS_WORDS_SCORE + scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_VALID_LINK_SCORE;
			this.ITEM_USE_CONSTRAINS_MAX_SCORE = this.ITEM_CREDIT_MAX_SCORE + this.ITEM_ACCESS_AND_USE_CONSTRAINTS_MAX_SCORE;

			this.TAGS_MAX_SCORE = scoring.TAGS_HAS_TAGS_SCORE + scoring.TAGS_HAS_ATLAS_TAGS_SCORE + scoring.TAGS_HAS_NO_BAD_WORDS_SCORE;

			this.PERFORMANCE_SHARING_MAX_SCORE = scoring.PERFORMANCE_MAX;
			this.PERFORMANCE_POPUPS_MAX_SCORE = scoring.PERFORMANCE_POPUPS_ENABLED + scoring.PERFORMANCE_POPUPS_CUSTOM;
			this.PERFORMANCE_DRAW_TIME_MAX_SCORE = scoring.PERFORMANCE_MAX;
			this.PERFORMANCE_LAYER_COUNT_MAX_SCORE = scoring.PERFORMANCE_MAX;
			this.PERFORMANCE_MAX_SCORE = this.PERFORMANCE_SHARING_MAX_SCORE + this.PERFORMANCE_POPUPS_MAX_SCORE + this.PERFORMANCE_DRAW_TIME_MAX_SCORE + this.PERFORMANCE_LAYER_COUNT_MAX_SCORE;

			this.USER_PROFILE_THUMBNAIL = scoring.USER_PROFILE_HAS_THUMBNAIL + scoring.USER_PROFILE_HAS_LARGE_THUMBNAIL;
			this.USER_PROFILE_FULLNAME = scoring.USER_PROFILE_HAS_FULLNAME_MIN_NUM_WORDS_SCORE + scoring.USER_PROFILE_FULLNAME_HAS_NO_UNDERSCORE_SCORE;
			this.USER_PROFILE_DESCRIPTION = scoring.USER_PROFILE_DESCRIPTION_HAS_DESCRIPTION + scoring.USER_PROFILE_DESCRIPTION_HAS_MIN_NUM_SENTENCES + scoring.USER_PROFILE_DESCRIPTION_HAS_MIN_NUM_WORDS + scoring.USER_PROFILE_DESCRIPTION_HAS_LINK + scoring.USER_PROFILE_DESCRIPTION_HAS_EMAIL;
			this.USER_PROFILE_MAX_SCORE = this.USER_PROFILE_THUMBNAIL + this.USER_PROFILE_FULLNAME + this.USER_PROFILE_DESCRIPTION;
			this.MAX_SCORE = this.ITEM_DETAILS_MAX_SCORE + this.ITEM_USE_CONSTRAINS_MAX_SCORE + this.TAGS_MAX_SCORE + this.PERFORMANCE_MAX_SCORE + this.USER_PROFILE_MAX_SCORE;
			console.log(this.MAX_SCORE)
		},

		//initTotalMaxScore: function () {
		//	this.MAX_SCORE = this.ITEM_DETAILS_MAX_SCORE + this.ITEM_USE_CONSTRAINS_MAX_SCORE + this.TAGS_MAX_SCORE + this.PERFORMANCE_MAX_SCORE + this.USER_PROFILE_MAX_SCORE;
		//},

		getDetailsSectionMaxScore : function () {
			//this.ITEM_THUMBNAIL_MAX_SCORE = scoring.ITEM_THUMBNAIL_NONE_SCORE + scoring.ITEM_THUMBNAIL_CUSTOM + scoring.ITEM_THUMBNAIL_LARGE_SCORE;
			//this.ITEM_TITLE_MAX_SCORE = scoring.ITEM_TITLE_NO_BAD_WORDS_SCORE + scoring.ITEM_TITLE_NO_UNDERSCORE_SCORE + scoring.ITEM_TITLE_MIN_LENGTH_SCORE + scoring.ITEM_TITLE_NO_ALL_CAPS_SCORE;
			//this.ITEM_SUMMARY_MAX_SCORE = scoring.ITEM_SUMMARY_MUST_EXIST_SCORE + scoring.ITEM_SUMMARY_NO_BAD_WORDS_SCORE + scoring.ITEM_SUMMARY_NO_UNDERSCORE_SCORE + scoring.ITEM_SUMMARY_MIN_LENGTH_SCORE;
			//this.ITEM_DESC_MAX_SCORE = scoring.ITEM_DESCRIPTION_MUST_EXIST_SCORE + scoring.ITEM_DESCRIPTION_MIN_LENGTH_SCORE + scoring.ITEM_DESCRIPTION_LINK_SCORE;
			//this.ITEM_DETAILS_MAX_SCORE = this.ITEM_THUMBNAIL_MAX_SCORE + this.ITEM_TITLE_MAX_SCORE + this.ITEM_SUMMARY_MAX_SCORE + this.ITEM_DESC_MAX_SCORE;
			return this.ITEM_DETAILS_MAX_SCORE;
		},

		updateOverallCurrentScore: function (itemDetailsScore, creditsAndAccessScore, itemTagsScore, performanceScore, userProfileScore, MAX_SCORE, MAXIMUM_SCORE) {
			this.overAllCurrentScore = Math.floor((itemDetailsScore + creditsAndAccessScore + itemTagsScore + performanceScore + userProfileScore) / MAX_SCORE * MAXIMUM_SCORE);
		}
	});
});