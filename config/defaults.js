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
	"HEADER_TEXT_PUBLIC": "Living Atlas of the World: <br />Nominate an item",
	"HEADER_BLOCK_PRIVATE": "My Items",
	"INTRO_TEXT_1": "ArcGIS includes a Living Atlas of the World with beautiful and " +
			"authoritative maps on hundreds of topics. It combines reference and thematic maps with many topics " +
			"relating to people, earth, and life.  Explore maps from Esri and thousands or organizations and " +
			"enrich them with your own data to create new maps and map layers.",
	"CURRENT_SCORE_HEADER_TEXT": "Current Score",
	"OVERALL_TXT": "Review each of the five sections below to look for ways to improve this item’s score.",

	"DETAILS": "DETAILS",
	"USE_CREDITS": "USE/CREDITS",
	"TAGS": "TAGS",
	"PERFORMANCE": "PERFORMANCE",
	"MY_PROFILE": "MY PROFILE",

	"MONTHS": [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	],

	"THUMBNAIL_IMAGE_SIZES":{
		"PROFILE":[150, 150],
		"SMALL":[200, 133],
		"LARGE":[286, 190],
		"XLARGE":[450, 300]
	},

	"UPDATE_ITEMS":{
		"PROFILE":[],
		"SMALL":[],
		"LARGE":[],
		"XLARGE":[]
	},

	// map draw times in seconds
	"drawTime": {
		"GOOD": 10,
		"BETTER": 6,
		"BEST": 2
	},

	"EDITOR_PLUGINS":['bold',
		'italic',
		'underline',
		'foreColor',
		'hiliteColor',
		'|',
		'justifyLeft',
		'justifyCenter',
		'justifyRight',
		'justifyFull',
		'|',
		'insertOrderedList',
		'insertUnorderedList',
		'|',
		'indent',
		'outdent',
		'|',
		'createLink',
		'unlink',
		'removeFormat',
		'|',
		'undo',
		'redo',
		'|',
		'viewSource'],

	"NOMINATE_ADMIN_FEATURE_SERVICE_URL": "http://services1.arcgis.com/4yjifSiIG17X0gW4/arcgis/rest/services/nomcur/FeatureServer/0",

	//Default configuration settings for the application. This is where you'll define things like a bing maps key,
	//default web map, default app color theme and more. These values can be overwritten by template configuration settings and url parameters.
	"appid": "",
	"webmap": "6e03e8c26aad4b9c92a87c1063ddb0e3",
	"oauthappid":null, //"AFTKRmv16wj14N3z",
	//Group templates must support a group url parameter. This will contain the id of the group.
	"group": "",
	//Enter the url to the proxy if needed by the application. See the 'Using the proxy page' help topic for details
	//http://developers.arcgis.com/en/javascript/jshelp/ags_proxy.html
	"proxyurl": "",

	"bingKey": "", //Enter the url to your organizations bing maps key if you want to use bing basemaps
	//Defaults to arcgis.com. Set this value to your portal or organization host name.
	"sharinghost":location.protocol + "//" + "www.arcgis.com",

	"CURRENT_STATUS":[
		{
			"label": "<h4> </h4>"
		},
		{
			"label": "<h4 class='icon-checked icon-red' style='color:#C86A4A'> NOMINATED </h4>"
		},
		{
			"label": "<img src='assets/images/DotDotDot.png' class='status-thumbnail'/><h4 style='color:#C86A4A'> IN REVIEW </h4>"
		},
		{
			"label": "<img src='assets/images/ThumbsUp_Blue.png' class='status-thumbnail'/><h4 style='color:#0079C1'> ACCEPTED </h4>"
		}
	],

	"TAGS_STORE": [
		{ id: "categories", name: "" },
		{ id: "basemapsCategory", name: "Basemaps", type: "parent", parent: "categories"},
		{ id: "esriBasemapsCB", name: "Esri Basemaps", parent: "basemapsCategory", path:["categories", "basemapsCategory"] },
		{ id: "partnerBasemapsCB", name: "Partner Basemaps", parent: "basemapsCategory", path:["categories", "basemapsCategory"] },
		{ id: "userBasemapsCB", name: "User Basemaps", parent: "basemapsCategory", path:["categories", "basemapsCategory"] },

		{ id: "imageryCategory", name: "Imagery", type: "parent", parent: "categories"},
		{ id: "eventImageryCB", name: "Event Imagery", parent: "imageryCategory", path:["categories", "imageryCategory"] },
		{ id: "basemapsImageryCB", name: "Basemaps Imagery", parent: "imageryCategory", path:["categories", "imageryCategory"] },
		{ id: "multispectralImageryCB", name: "Multi-spectral Imagery", parent: "imageryCategory", path:["categories", "imageryCategory"] },
		{ id: "temporalImageryCB", name: "Temporal Imagery", parent: "imageryCategory", path:["categories", "imageryCategory"] },

		{ id: "demographicsCategory", name: "Demographics", type: "parent", parent: "categories"},
		{ id: "ageCB", name: "Age", parent: "demographicsCategory", path:["categories", "demographicsCategory"]  },
		{ id: "householdsCB", name: "Households", parent: "demographicsCategory", path:["categories", "demographicsCategory"]  },
		{ id: "incomeCB", name: "Income", parent: "demographicsCategory", path:["categories", "demographicsCategory"]  },
		{ id: "maritalStatusCB", name: "Marital Status", parent: "demographicsCategory", path:["categories", "demographicsCategory"]  },
		{ id: "populationCB", name: "Population", parent: "demographicsCategory", path:["categories", "demographicsCategory"]  },
		{ id: "raceCB", name: "Race", parent: "demographicsCategory", path:["categories", "demographicsCategory"]  },

		{ id: "lifestyleCategory", name: "Lifestyle", type: "parent", parent: "categories"},
		{ id: "atRiskCB", name: "At Risk", parent: "lifestyleCategory", path:["categories", "lifestyleCategory"]  },
		{ id: "behaviorsCB", name: "Behaviors", parent: "lifestyleCategory", path:["categories", "lifestyleCategory"]  },
		{ id: "businessAndJobsCB", name: "Business and Jobs", parent: "lifestyleCategory", path:["categories", "lifestyleCategory"]  },
		{ id: "housingCB", name: "Housing", parent: "lifestyleCategory", path:["categories", "lifestyleCategory"]  },
		{ id: "povertyCB", name: "Poverty", parent: "lifestyleCategory", path:["categories", "lifestyleCategory"]  },
		{ id: "spendingCB", name: "Spending", parent: "lifestyleCategory", path:["categories", "lifestyleCategory"]  },

		{ id: "landscapeCategory", name: "Landscape", type: "parent", parent: "categories"},
		{ id: "climateCB", name: "Climate", parent: "landscapeCategory", path:["categories", "landscapeCategory"] },
		{ id: "ecologyCB", name: "Ecology", parent: "landscapeCategory", path:["categories", "landscapeCategory"] },
		{ id: "speciesBiologyCB", name: "Species Biology", parent: "landscapeCategory", path:["categories", "landscapeCategory"] },
		{ id: "ecologicalDisturbanceCB", name: "Ecological Disturbance", parent: "landscapeCategory", path:["categories", "landscapeCategory"] },
		{ id: "elevationCB", name: "Elevation", parent: "landscapeCategory", path:["categories", "landscapeCategory"] },
		{ id: "environmentalImpactCB", name: "Environmental Impact", parent: "landscapeCategory", path:["categories", "landscapeCategory"] },
		{ id: "landCoverCB", name: "Land Cover", parent: "landscapeCategory", path:["categories", "landscapeCategory"] },
		{ id: "naturalHazardsCB", name: "Natural Hazards", parent: "landscapeCategory", path:["categories", "landscapeCategory"] },
		{ id: "oceansCB", name: "Oceans", parent: "landscapeCategory", path:["categories", "landscapeCategory"] },
		{ id: "soilsGeologyCB", name: "Soils/Geology", parent: "landscapeCategory", path:["categories", "landscapeCategory"] },
		{ id: "subsurfaceCB", name: "Subsurface", parent: "landscapeCategory", path:["categories", "landscapeCategory"] },
		{ id: "waterCB", name: "Water", parent: "landscapeCategory", path:["categories", "landscapeCategory"] },
		{ id: "weatherCB", name: "Weather", parent: "landscapeCategory", path:["categories", "landscapeCategory"] },

		{ id: "earthObservationsCategory", name: "Earth Observations ", type: "parent", parent: "categories"},
		{ id: "earthObservationsCB", name: "Earth Observations", parent: "earthObservationsCategory", path:["categories", "earthObservationsCategory"] },

		{ id: "urbanSystemsCategory", name: "Urban Systems", type: "parent", parent: "categories"},
		{ id: "citiesCB", name: "3D Cities", parent: "urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },
		{ id: "movementCB", name: "Movement", parent: "urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },
		{ id: "parcelsCB", name: "Parcels", parent: "urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },
		{ id: "peopleCB", name: "People", parent: "urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },
		{ id: "planningCB", name: "Planning", parent: "urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },
		{ id: "publicCB", name: "Public", parent: "urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },
		{ id: "workCB", name: "Work", parent: "urbanSystemsCategory", path:["categories", "urbanSystemsCategory"] },

		{ id: "transportationCategory", name: "Transportation ", type: "parent", parent: "categories"},
		{ id: "locationsCB", name: "Locators", parent: "transportationCategory", path:["categories", "transportationCategory"] },
		{ id: "networkCB", name: "Network", parent: "transportationCategory", path:["categories", "transportationCategory"] },
		{ id: "trafficCB", name: "Traffic", parent: "transportationCategory", path:["categories", "transportationCategory"] },
		{ id: "transportationCB", name: "Transportation", parent: "transportationCategory", path:["categories", "transportationCategory"] },

		{ id: "boundariesAndPlacesCategory", name: "Boundaries and Places", type: "parent", parent: "categories"},
		{ id: "boundariesCB", name: "Boundaries", parent: "boundariesAndPlacesCategory", path:["categories", "boundariesAndPlacesCategory"] },
		{ id: "placesCB", name: "Places", parent: "boundariesAndPlacesCategory", path:["categories", "boundariesAndPlacesCategory"] },

		{ id: "historicalMapsCategory", name: "Historical Maps ", type: "parent", parent: "categories"},
		{ id: "historicalMapsCB", name: "Historical Maps", parent: "historicalMapsCategory" },

		{ id: "storyMapsCategory", name: "Story Maps", type: "parent", parent: "categories"},
		{ id: "architectureAndDesignCB", name: "Architecture and Design", parent: "storyMapsCategory", path:["categories", "storyMapsCategory"] },
		{ id: "businessCB", name: "Business", parent: "storyMapsCategory", path:["categories", "storyMapsCategory"] },
		{ id: "conservationAndSustainabilityCB", name: "Conservation and Sustainability", parent: "storyMapsCategory", path:["categories", "storyMapsCategory"] },
		{ id: "cultureCB", name: "Culture", parent: "storyMapsCategory", path:["categories", "storyMapsCategory"] },
		{ id: "destinationsCB", name: "Destinations", parent: "storyMapsCategory", path:["categories", "storyMapsCategory"] },
		{ id: "eventsAndDisastersCB", name: "Events and Disasters", parent: "storyMapsCategory", path:["categories", "storyMapsCategory"] },
		{ id: "historyCB", name: "History", parent: "storyMapsCategory", path:["categories", "storyMapsCategory"] },
		{ id: "infrastructureAndPlanningCB", name: "Infrastructure and Planning", parent: "storyMapsCategory", path:["categories", "storyMapsCategory"] },
		{ id: "natureAndEnvironmentCB", name: "Nature and Environment", parent: "storyMapsCategory", path:["categories", "storyMapsCategory"] },
		{ id: "oceansStoryMapsCB", name: "Oceans ", parent: "storyMapsCategory", path:["categories", "storyMapsCategory"] },
		{ id: "parksAndRecreationCB", name: "Parks and Recreation", parent: "storyMapsCategory", path:["categories", "storyMapsCategory"] },
		{ id: "peopleAndHealthCB", name: "People and Health", parent: "storyMapsCategory", path:["categories", "storyMapsCategory"] },
		{ id: "publicArtCB", name: "Public Art", parent: "storyMapsCategory", path:["categories", "storyMapsCategory"] },
		{ id: "scienceAndTechnologyCB", name: "Science and Technology", parent: "storyMapsCategory", path:["categories", "storyMapsCategory"] },
		{ id: "sportsAndEntertainmentCB", name: "Sports and Entertainment", parent: "storyMapsCategory", path:["categories", "storyMapsCategory"] },
		{ id: "traveloguesCB", name: "Travelogues", parent: "storyMapsCategory", path:["categories", "storyMapsCategory"] },
	]
});
