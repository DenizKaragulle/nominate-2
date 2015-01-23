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
	"SECTION_PASS_COLOR" : "#005E95",
	// failing color
	"SECTION_FAIL_COLOR" : "#C86A4A",

	// Item Details
	"NO_THUMBNAIL_FILE_NAME" : "ago_downloaded.png",
	"ITEM_TITLE_MIN_LENGTH" : 2,
	"ITEM_TITLE_CONTENT" : ["copy", "demo", "test", "eval", "_"],
	"ITEM_SUMMARY_MIN_LENGTH" : 10,
	"ITEM_SUMMARY_CONTENT" : ["copy", "demo", "test", "eval"],
	"ITEM_DESC_MIN_LENGTH" : 48,
	"ITEM_DESC_CONTENT" : ["test", "testing", "demo", "sample"],

	// Item Use/Credits
	"ITEM_CREDITS_MIN_NUM_WORDS" : 1,
	"ITEM_CREDITS_CONTENT" : [],
	"ITEM_ACCESS_AND_USE_CONSTRAINTS_MIN_NUM_WORDS" : 2,
	"ITEM_ACCESS_AND_USE_CONSTRAINTS_CONTENT" : [],
	"ITEM_ACCESS_AND_USE_CONSTRAINTS_BONUS_WORDS" : ["No Restrictions"],

	// Tags
	"TAGS_MIN_COUNT" : 3,
	"TAGS_PENALTY_WORDS" : ["copy", "demo", "test", "eval"],

	// Performance
	"PERFORMANCE_MAX" : 7,
	"PERFORMANCE_DRAW_TIME_THRESHOLD" : 4,
	"PERFORMANCE_DRAW_TIME_GOOD" : 2,
	"PERFORMANCE_DRAW_TIME_BETTER" : 4,
	"PERFORMANCE_DRAW_TIME_BEST" : 7,

	"PERFORMANCE_LAYER_COUNT_THRESHOLD" : 4,
	"PERFORMANCE_LAYER_COUNT_GOOD" : 1,
	"PERFORMANCE_LAYER_COUNT_BETTER" : 4,
	"PERFORMANCE_LAYER_COUNT_BEST" : 7,

	"PERFORMANCE_POPUPS_THRESHOLD" : 4,
	"PERFORMANCE_POPUPS_ENABLED" : 2,
	"PERFORMANCE_POPUPS_CUSTOM" : 5,

	"PERFORMANCE_SHARING_THRESHOLD" : 4,
	"PERFORMANCE_SHARING_PUBLIC" : 5,
	"PERFORMANCE_SHARING_ORG" : 2,
	"PERFORMANCE_SHARING_PRIVATE" : 0,

	// User Profile
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
		"BETTER":3,
		"BEST":1
	}
});
