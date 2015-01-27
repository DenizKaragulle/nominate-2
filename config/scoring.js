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
	"SCORE_THRESHOLD" : 80,
	// Overall scoring graphic properties

	////////////////////////////////////////////////////////////////////
	// Item Details Section scoring graphic properties
	////////////////////////////////////////////////////////////////////
	// maximum score
	"SECTION_MAX" : 10,
	// minimum score
	"SECTION_MIN" : 0,
	// minimum required to pass
	"SECTION_PASSING" : 8,
	// passing color
	"PASS_COLOR" : "#005E95",
	// failing color
	"FAIL_COLOR" : "#C86A4A",

	////////////////////////////////////////////
	// Details
	////////////////////////////////////////////
	// Thumbnail
	"NO_THUMBNAIL_FILE_NAME" : "ago_downloaded.png",
	"ITEM_THUMBNAIL_LARGE" : 3,
	"ITEM_THUMBNAIL_CUSTOM" : 4,
	"ITEM_THUMBNAIL_NONE" : 0,
	// Title
	"ITEM_TITLE_NO_BAD_WORDS" : 2,
	"ITEM_TITLE_BAD_WORDS" : ["copy", "demo", "test", "eval", "_"],
	"ITEM_TITLE_NO_UNDERSCORE" : 2,
	"ITEM_TITLE_MIN_LENGTH" : 2,
	"ITEM_TITLE_NO_ALL_CAPS" : 1,
	// Summary
	"ITEM_SUMMARY_MUST_EXIST" : 1,
	"ITEM_SUMMARY_NO_BAD_WORDS" : 2,
	"ITEM_SUMMARY_CONTENT" : ["copy", "demo", "eval"],
	"ITEM_SUMMARY_NO_UNDERSCORE" : 1,
	"ITEM_SUMMARY_MIN_LENGTH" : 4,
	// minimum number of words
	"ITEM_SUMMARY_MIN_NUM_WORDS":10,
	// Description
	"ITEM_DESCRIPTION_MUST_EXIST" : 1,
	"ITEM_DESCRIPTION_MIN_LENGTH" : 5,
	"ITEM_DESCRIPTION_LINK" : 2,
	"ITEM_DESC_MIN_LENGTH" : 48,
	"ITEM_DESC_CONTENT" : [""],

	////////////////////////////////////////////
	// Use/Credtis
	////////////////////////////////////////////
	// Item Use/Credits Scoring
	"ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_WORDS" : 1,
	"ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_MIN_WORDS" : 3,
	"ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_BONUS_WORDS" : 2,
	"ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_VALID_LINK" : 1,
	"ITEM_CREDITS_HAS_WORDS" : 7,
	// Item Use/Credits Parameters
	"ITEM_ACCESS_AND_USE_CONSTRAINTS_MIN_NUM_WORDS" : 2,
	"ITEM_ACCESS_AND_USE_CONSTRAINTS_CONTENT" : [],
	"ITEM_ACCESS_AND_USE_CONSTRAINTS_BONUS_WORDS" : ["No Restrictions"],
	"ITEM_CREDITS_MIN_NUM_WORDS" : 1,
	"ITEM_CREDITS_CONTENT" : [],

	////////////////////////////////////////////
	// Tags
	////////////////////////////////////////////
	"TAGS_HAS_NO_TAGS" : 0,
	"TAGS_HAS_TAGS" : 1,
	"TAGS_HAS_ATLAS_TAGS" : 3,
	"TAGS_HAS_CUSTOM_TAGS_MIN" : 2,
	"TAGS_HAS_NO_BAD_WORDS" : 1,
	// Tags Parameters
	"TAGS_MIN_COUNT" : 3,
	"TAGS_PENALTY_WORDS" : ["copy", "demo", "test", "eval"],

	////////////////////////////////////////////
	// Performance
	////////////////////////////////////////////
	// Performance Parameter
	"PERFORMANCE_MAX" : 7,
	// Map draw time (Best)
	"PERFORMANCE_DRAW_TIME_BEST" : 7,
	// Map draw time (Better)
	"PERFORMANCE_DRAW_TIME_BETTER" : 4,
	// Map draw time (Good)
	"PERFORMANCE_DRAW_TIME_GOOD" : 2,

	// Number of map layers (Best)
	"LAYER_COUNT_BEST_POINTS" : 7,
	// Minimum number of layers
	"LAYER_COUNT_MIN" : 1,
	// Number of map layers (Better)
	"LAYER_COUNT_BETTER_POINTS" : 4,
	// Number of map layers (Good)
	"LAYER_COUNT_GOOD_POINTS" : 1,
	// Maximum number of layers
	"LAYER_COUNT_MAX" : 10,

	// Custom popup
	"PERFORMANCE_POPUPS_CUSTOM" : 5,
	// Default popup
	"PERFORMANCE_POPUPS_ENABLED" : 2,

	// AGOL item sharing is set to public
	"PERFORMANCE_SHARING_PUBLIC_POINTS" : 5,
	// AGOL item sharing is set to org
	"PERFORMANCE_SHARING_ORG_POINTS" : 2,
	// AGOL item sharing is set to private
	"PERFORMANCE_SHARING_PRIVATE_POINTS" : 0,

	////////////////////////////////////////////
	// User Profile
	////////////////////////////////////////////
	// User Profile scoring
	"USER_PROFILE_HAS_THUMBNAIL" : 5,
	"USER_PROFILE_HAS_LARGE_THUMBNAIL" : 2,
	"USER_PROFILE_HAS_FULLNAME_MIN_NUM_WORDS" : 5,
	"USER_PROFILE_FULLNAME_HAS_NO_UNDERSCORE" : 2,
	"USER_PROFILE_DESCRIPTION_HAS_DESCRIPTION" : 1,
	"USER_PROFILE_DESCRIPTION_HAS_MIN_NUM_SENTENCES" : 2,
	"USER_PROFILE_DESCRIPTION_HAS_MIN_NUM_WORDS" : 1,
	"USER_PROFILE_DESCRIPTION_HAS_LINK" : 1,
	"USER_PROFILE_DESCRIPTION_HAS_EMAIL" : 2,
	// User Profile parameters
	"USER_NAME_MIN_NUM_WORDS" : 1,
	"USER_NAME_CONTENT" : ["_"],
	"USER_DESCRIPTION_MIN_NUM_WORDS" : 20,
	"USER_DESCRIPTION_CONTENT" : [],
	"USER_DESCRIPTION_BONUS_WORDS" : [],

	"ATLAS_TAGS":[
		{
			"id":"basemapsCB",
			"tag":"Basemaps"
		},
		{
			"id":"lifestylesCB",
			"tag":"Lifestyle"
		},
		{
			"id":"urbanSystemsCB",
			"tag":"Urban Systems"
		},
		{
			"id":"historicalMapsCB",
			"tag":"Historical maps"
		},
		{
			"id":"imageryCB",
			"tag":"Imagery"
		},
		{
			"id":"landscapeCB",
			"tag":"Landscape"
		},
		{
			"id":"transportationCB",
			"tag":"Transportation"
		},
		{
			"id":"storyMapsCB",
			"tag":"Story Maps"
		},
		{
			"id":"demographgicsCB",
			"tag":"Demographics"
		},
		{
			"id":"earthObservationsCB",
			"tag":"Earth Observations"
		},
		{
			"id":"boundariesAndPlacesCB",
			"tag":"Boundaries and Places"
		}
	],

	// map draw times in seconds
	"drawTime":{
		"GOOD":10,
		"BETTER":6,
		"BEST":2
	}
});
