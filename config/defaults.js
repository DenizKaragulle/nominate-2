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
	"HEADER_TEXT_PUBLIC":"Living Atlas of the World: Nominate an app, web map or layer",
	"HEADER_BLOCK_PRIVATE":"My Items",
	"INTRO_TEXT_1":"ArcGIS includes a Living Atlas of the World with beautiful and " +
			"authoritative maps on hundreds of topics. It combines reference and thematic maps with many topics " +
			"relating to people, earth, and life.  Explore maps from Esri and thousands or organizations and " +
			"enrich them with your own data to create new maps and map layers.",
	"CURRENT_SCORE_HEADER_TEXT":"Current Score",
	"OVERALL_TXT":"Review each of the five sections below to look for ways to improve this item’s score.",

	"DETAILS":"DETAILS",
	"USE_CREDITS":"USE/CREDITS",
	"TAGS":"TAGS",
	"PERFORMANCE":"PERFORMANCE",
	"MY_PROFILE":"MY PROFILE",

	"MONTHS":[ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],

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
	},
	//Default configuration settings for the application. This is where you'll define things like a bing maps key,
	//default web map, default app color theme and more. These values can be overwritten by template configuration settings and url parameters.
	"appid":"",
	"webmap":"6e03e8c26aad4b9c92a87c1063ddb0e3",
	"oauthappid":null, //"AFTKRmv16wj14N3z",
	//Group templates must support a group url parameter. This will contain the id of the group.
	"group":"",
	//Enter the url to the proxy if needed by the application. See the 'Using the proxy page' help topic for details
	//http://developers.arcgis.com/en/javascript/jshelp/ags_proxy.html
	"proxyurl":"",
	//Example of a template specific property. If your template had several color schemes
	//you could define the default here and setup configuration settings to allow users to choose a different
	//color theme.
	"theme":"blue",
	"bingKey":"", //Enter the url to your organizations bing maps key if you want to use bing basemaps
	//Defaults to arcgis.com. Set this value to your portal or organization host name.
	"sharinghost":location.protocol + "//" + "www.arcgis.com",
	"units":null,
	//This option demonstrates how to handle additional custom url parameters. For example
	//if you want users to be able to specify lat/lon coordinates that define the map's center or
	//specify an alternate basemap via a url parameter.
	"urlItems":[
		"theme" // example param. ?theme=<my theme>
	],

	"CURRENT_STATUS":[
		{
			"label":"<h4> </h4>"
		},
		{
			"label":"<h4 class='icon-checked icon-red' style='color:#C86A4A'> NOMINATED </h4>"
		},
		{
			"label":"<img src='assets/images/DotDotDot.png' class='status-thumbnail'/><h4 style='color:#C86A4A'> IN REVIEW </h4>"
		},
		{
			"label":"<img src='assets/images/ThumbsUp_Blue.png' class='status-thumbnail'/><h4 style='color:#0079C1'> ACCEPTED </h4>"
		}
	],

	"helperServices":{
		"geometry":{
			"url":null
		},
		"printTask":{
			"url":null
		},
		"elevationSync":{
			"url":null
		},
		"geocode":[
			{
				"url":null
			}
		]
	}
});
