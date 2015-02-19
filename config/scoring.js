/*
 | Copyright 2014 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
define({
	////////////////////////////////////////////////////////////////////
	// Overall scoring threshold
	////////////////////////////////////////////////////////////////////
	// maximum possible score
	"MAXIMUM_SCORE" : 100,
	// minimum passing score to be nominated
	"SCORE_THRESHOLD" : 80,

	////////////////////////////////////////////////////////////////////
	// Scoring PASS/FAIL colors
	////////////////////////////////////////////////////////////////////
	// passing color
	"PASS_COLOR" : "#005E95",
	// failing color
	"FAIL_COLOR" : "#C86A4A",

	////////////////////////////////////////////
	// Details
	////////////////////////////////////////////
	// Thumbnail
	"NO_THUMBNAIL_FILE_NAME" : "ago_downloaded.png",
	"ITEM_THUMBNAIL_LARGE_SCORE" : 3,
	"ITEM_THUMBNAIL_CUSTOM" : 4,
	"ITEM_THUMBNAIL_NONE_SCORE" : 0,

	////////////////////////////////////////////
	// Title
	////////////////////////////////////////////
	// Rules
	"ITEM_TITLE_BAD_WORDS" : ["copy", "demo", "test", "eval"],
	"ITEM_TITLE_MIN_LENGTH" : 2,
	// Scores
	"ITEM_TITLE_NO_BAD_WORDS_SCORE" : 2,
	"ITEM_TITLE_NO_UNDERSCORE_SCORE" : 2,
	"ITEM_TITLE_MIN_LENGTH_SCORE" : 2,
	"ITEM_TITLE_NO_ALL_CAPS_SCORE" : 1,

	////////////////////////////////////////////
	// Summary
	////////////////////////////////////////////
	// Rules
	"ITEM_SUMMARY_BAD_WORDS" : ["copy", "demo", "eval"],
	"ITEM_SUMMARY_MIN_NUM_WORDS": 10,
	// Scores
	"ITEM_SUMMARY_MUST_EXIST_SCORE" : 1,
	"ITEM_SUMMARY_MIN_LENGTH_SCORE" : 4,
	"ITEM_SUMMARY_NO_BAD_WORDS_SCORE" : 2,
	"ITEM_SUMMARY_NO_UNDERSCORE_SCORE" : 1,

	////////////////////////////////////////////
	// Description
	////////////////////////////////////////////
	// Rules
	"ITEM_DESC_MIN_LENGTH" : 48,
	"ITEM_DESC_CONTENT" : [""],
	// Scores
	"ITEM_DESCRIPTION_MUST_EXIST_SCORE" : 1,
	"ITEM_DESCRIPTION_MIN_LENGTH_SCORE" : 5,
	"ITEM_DESCRIPTION_LINK_SCORE" : 2,



	////////////////////////////////////////////
	// Access and Use Constraints
	////////////////////////////////////////////
	// Rules
	"ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_WORDS" : 1,
	"ITEM_ACCESS_AND_USE_CONSTRAINTS_MIN_NUM_WORDS" : 2,
	"ITEM_ACCESS_AND_USE_CONSTRAINTS_BONUS_WORDS" : [""],

	// Score
	"ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_WORDS_SCORE" : 1,
	"ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_MIN_WORDS_SCORE" : 4,
	"ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_BONUS_WORDS_SCORE" : 0,
	"ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_VALID_LINK_SCORE" : 2,

	////////////////////////////////////////////
	// Credits
	////////////////////////////////////////////
	// Rules
	"ITEM_CREDITS_MIN_NUM_WORDS" : 1,
	"ITEM_CREDITS_CONTENT" : [],

	// Scores
	"ITEM_CREDITS_MIN_NUM_WORDS_SCORE" : 7,
	"ITEM_ACCESS_AND_USE_CONSTRAINTS_BONUS_WORDS_SCORE" : 0,



	////////////////////////////////////////////
	// Tags
	////////////////////////////////////////////
	// Rules
	"TAGS_MIN_NUM_TAGS" : 3,
	"TAGS_PENALTY_WORDS" : ["copy", "demo", "test", "eval"],
	// Scores
	"TAGS_HAS_TAGS_SCORE" : 3,
	"TAGS_HAS_ATLAS_TAGS_SCORE" : 3,
	"TAGS_HAS_NO_BAD_WORDS_SCORE" : 1,



	////////////////////////////////////////////
	// Performance
	////////////////////////////////////////////
	// Rules
	// map draw times in seconds
	"drawTime": {
		"BEST": 2,
		"BETTER": 6,
		"GOOD": 10
	},
	// Scores
	// Performance Parameter
	"PERFORMANCE_MAX" : 7,
	// Map draw time (Best)
	"PERFORMANCE_DRAW_TIME_BEST_SCORE" : 7,
	// Map draw time (Better)
	"PERFORMANCE_DRAW_TIME_BETTER_SCORE" : 4,
	// Map draw time (Good)
	"PERFORMANCE_DRAW_TIME_GOOD_SCORE" : 1,

	////////////////////////////////////////////
	// Layers
	////////////////////////////////////////////
	// Rules
	"LAYER_COUNT_MIN" : 1,
	"LAYER_COUNT_MAX" : 10,

	// Scores
	"LAYER_COUNT_BEST_SCORE" : 7,
	"LAYER_COUNT_BETTER_SCORE" : 4,
	"LAYER_COUNT_GOOD_SCORE" : 1,

	////////////////////////////////////////////
	// Popups
	////////////////////////////////////////////
	"PERFORMANCE_POPUPS_CUSTOM" : 5,
	"PERFORMANCE_POPUPS_ENABLED" : 2,
	"PERFORMANCE_POPUPS_DISABLED_SCORE" : 0,

	////////////////////////////////////////////
	// Sharing
	////////////////////////////////////////////
	"PERFORMANCE_SHARING_PUBLIC_SCORE" : 7,
	"PERFORMANCE_SHARING_ORG_SCORE" : 2,
	"PERFORMANCE_SHARING_PRIVATE_SCORE" : 0,

	////////////////////////////////////////////
	// User Profile
	////////////////////////////////////////////
	// User Profile
	// Rules

	// User Profile
	// scoring
	"USER_PROFILE_HAS_THUMBNAIL" : 5,
	"USER_PROFILE_HAS_LARGE_THUMBNAIL" : 2,
	"USER_PROFILE_HAS_FULLNAME_MIN_NUM_WORDS_SCORE" : 5,
	"USER_PROFILE_FULLNAME_HAS_NO_UNDERSCORE_SCORE" : 2,
	"USER_PROFILE_DESCRIPTION_HAS_DESCRIPTION" : 1,
	"USER_PROFILE_DESCRIPTION_HAS_MIN_NUM_SENTENCES" : 2,
	"USER_PROFILE_DESCRIPTION_HAS_MIN_NUM_WORDS" : 1,
	"USER_PROFILE_DESCRIPTION_HAS_LINK" : 1,
	"USER_PROFILE_DESCRIPTION_HAS_EMAIL" : 2,
	// User Profile parameters
	"USER_NAME_MIN_NUM_WORDS" : 2,
	"USER_NAME_CONTENT" : ["_"],
	"USER_DESCRIPTION_MIN_NUM_WORDS" : 20,
	"USER_DESCRIPTION_CONTENT" : [],
	"USER_DESCRIPTION_BONUS_WORDS" : []
});
