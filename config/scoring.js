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

	"ITEM_TITLE_MIN_LENGTH" : 4,
	"ITEM_TITLE_CONTENT" : ["copy", "demo", "test", "eval", "_"],
	"ITEM_SUMMARY_MIN_LENGTH" : 10,
	"ITEM_SUMMARY_CONTENT" : ["copy", "demo", "test", "eval"],
	"ITEM_DESC_MIN_LENGTH" : 20,
	"ITEM_DESC_CONTENT" : ["test", "testing", "demo", "sample"],




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
