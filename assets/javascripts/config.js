define({
	// When true, the template will query arcgis.com for the webmap item.
	"performanceContent": "<div id='section-content'>" +
					"	<div class='row'>" +
					"		<div class='column-8'>" +
					"			<div class='section-header'>SHARING " +
					"				<div class='tooltip header-tooltip animate'>" +
					"					<span class='icon-help icon-blue'></span>" +
					"					<div class='tooltip-wrapper'>" +
					"						<p class='tooltip-content'>Text to appear in the tooltip.</p>" +
					"					</div>" +
					"				</div>" +
					"			</div>" +
					"		</div>" +
					"		<div class='column-8'>" +
					"			<div class='section-header'>MAP DRAW TIME " +
					"				<div class='tooltip header-tooltip animate'>" +
					"					<span class='icon-help icon-blue'></span>" +
					"					<div class='tooltip-wrapper'>" +
					"						<p class='tooltip-content'>Text to appear in the tooltip.</p>" +
					"					</div>" +
					"				</div>" +
					"			</div>" +
					"		</div>" +
					"		<div class='column-8'>" +
					"			<div class='section-header'>LAYER COUNT " +
					"				<div class='tooltip header-tooltip animate'>" +
					"					<span class='icon-help icon-blue'></span>" +
					"					<div class='tooltip-wrapper'>" +
					"						<p class='tooltip-content'>Text to appear in the tooltip.</p>" +
					"					</div>" +
					"				</div>" +
					"			</div>" +
					"			<div class='performance-content'>" +
					"				<div id='layers-list'></div>" +
					"			</div>" +
					"		</div>" +
					"	</div>" +
					"	<div class='row'>" +
					"		<div class='column-24'>" +
					"			<div class='section-header'>POP UPS " +
					"				<div class='tooltip header-tooltip animate'>" +
					"					<span class='icon-help icon-blue'></span>" +
					"					<div class='tooltip-wrapper'>" +
					"						<p class='tooltip-content'>Text to appear in the tooltip.</p>" +
					"					</div>" +
					"				</div>" +
					"			</div>" +
					"			<div class='performance-content'></div>" +
					"		</div>" +
					"	</div>" +
					"</div>",
	// When true, the template will query arcgis.com for the group's information.
	"queryForGroupInfo": false,
	// When true, the template will query arcgis.com for the items contained within the group
	"queryForGroupItems": false,
	//When true the template will query arcgis.com for default settings for helper services, units etc. If you
	//want to use custom settings for units or any of the helper services set queryForOrg to false then enter
	//default values for any items you need using the helper services and units properties.
	"queryForOrg": true,
	//If you need localization set the localize value to true to get the localized strings
	//from the javascript/nls/resource files.
	//Note that we've included a placeholder nls folder and a resource file with one error string
	//to show how to setup the strings file.
	"queryForLocale": true,
	// When true, this will query and mixin a common config file from the path specified in the index.html dojo packages
	"queryForCommonConfig": false,
	// These are the options specified for querying items within the group. Modify these to get more items. You can also call the public template.queryGroupItems() method with these options as a parameter.
	"groupParams": {
		"sortField": "modified",
		"sortOrder": "desc",
		"num": 9,
		"start": 0
	}
});