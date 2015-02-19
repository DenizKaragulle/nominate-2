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
	// DETAILS
	"ITEM_TITLE_TOOLTIP_CONTENT":'<div class="tooltip-style">' +
			'<p>The idea: enter a title that is easy to read and avoid the use of jargon or abbreviations. The item name answers the question “What is this?” </p>' +
			'<p>The score: points are deducted if “copy”, “demo”, “test”, “eval”, “_” or words in ALL CAPS are used. Points awarded if two or more words are in the title. </p>' +
			'</div>',

	"ITEM_THUMBNAIL_TOOLTIP_CONTENT":'<div class="tooltip-style">' +
			'<p>The idea: upload a great-looking thumbnail that shows the layer, map or app at its best. Zoom the map to a scale at which your map looks great, and take a screenshot of that. Then trim or resize it to the required 200x133 pixel dimensions.</p>' +
			'<p>The score: full points are awarded for using a custom thumbnail you upload of 200x133 pixels.</p>' +
			'</div>',

	"ITEM_SUMMARY_TOOLTIP_CONTENT":'<div class="tooltip-style">' +
			'<p>The idea: Enter one or two sentences to answer to the question “What is this?” This summary is a much shorter version of the full description below. </p>' +
			'<p> The score: points awarded for having 1-2 sentences, 10 word minimum. Points are deducted if “copy”, “demo”, “test”, “eval” are used.</p>' +
			'</div>',

	"ITEM_DESCRIPTION_TOOLTIP_CONTENT":'<div class="tooltip-style">' +
			'<p>The idea: A good description directly answers the question “What is this?” as well as “What does this layer/map/app show?” A couple of short paragraphs is usually plenty to cover the basic questions of “who, what, when, where, why and how” (not necessarily in that order, of course). Avoid using jargon or abbreviations. Provide source information and in-depth explanations via web links. </p>' +
			'<p>The score: points are awarded for having roughly 4-5 sentences, 12 words per sentence average. Points are awarded for providing links to more detailed information.</p>' +
			'</div>',

	// USE/CREDITS
	"CREDITS_TOOLTIP_CONTENT":'<div class="tooltip-style">' +
			'<p>The idea: Enter text that gives credit to the organizations requiring credit: data provider, application developer, etc. </p>' +
			'<p>The score: full points awarded for entering text here.</p>' +
			'</div>',

	"ACCESS_TOOLTIP_CONTENT":'<div class="tooltip-style">' +
			'<p>The idea: Communicate any access and use constraints required by your organization or by the data provider.</p>' +
			'<p>The score: points awarded for having more than one word here. Also rewarded: text that includes a hyperlink (to more detailed information explaining the constraints more fully).</p>' +
			'</div>',

	// TAGS
	"TAGS_TOOLTIP_CONTENT":'<div class="tooltip-style">' +
			'<p>The idea: To be in the Living Atlas, choose one tag from the list on the left side of the screen. This tells us what the primary category of your map is. Then enter tags that help people find your work. This can duplicate what’s in your title, summary and description to some extent, but also think more broadly: “How someone find this item if they don’t know it’s title, or the industry?”</p>' +
			'<p>The score: Points are awarded for having more than three tags total. Points are awarded for choosing only one tag from the list at left, to indicate the primary category for your item. Points deducted for tags “copy”, “demo”, “test”, “eval”.</p>' +
			'</div>',

	// PERFORMANCE
	"PERFORMANCE_MAP_LAYERS_TOOLTIP_CONTENT":'<div class="tooltip-style">' +
			'<p>The idea: generally speaking, it takes about 1-5 layers to make a clean, focused map. When an item requires more and more layers, it usually indicates the information product is not fully formed in the minds of the creators yet. More time is needed to clarify what needs to be built, and distill that.</p>' +
			'<p>The score: one layer gets maximum points, with reduced points as the layer count increases.</p>' +
			'</div>',
	"PERFORMANCE_SHARING_TOOLTIP_CONTENT":'<div class="tooltip-style">' +
			'<p>The idea: Share your item public, so it can be part of the Living Atlas.</p>' +
			'<p>The score: full points for sharing the item Public.</p>' +
			'</div>',
	"PERFORMANCE_DRAW_TIME_TOOLTIP_CONTENT":'<div class="tooltip-style">' +
			'<p>The idea: Maps that draw quickly are desirable.</p>' +
			'<p>The score: the faster the map is, the higher the score.</p>' +
			'</div>',
	"PERFORMANCE_POP_UPS_TOOLTIP_CONTENT":'<div class="tooltip-style">' +
			'<p>The idea: Reward people when the click on the map. Give them more than just rows and columns of data. Give them information that puts the raw data into proper context. Use full sentences, like “This street was last plowed at 7:13 a.m.” rather then dump a column of data on the reader to interpret.</p>' +
			'<p>The score: points are awarded for having any popup, but more points are awarded if a custom popup is detected (no rows and columns).</p>' +
			'</div>',

	// USER PROFILE
	"USER_PROFILE_THUMBNAIL_TOOLTIP_CONTENT":'<div class="tooltip-style">' +
			'<p>The idea: People want to know who is behind a map or app. Share your image or organization logo — something visual to remember. </p>' +
			'<p>The score: any image besides the default is awarded points. Bonus points if it fits the required dimensions.</p>' +
			'</div>',

	"USER_PROFILE_FULL_NAME_TOOLTIP_CONTENT":'<div class="tooltip-style">' +
			'<p>The idea: Enter your name. If someone has a question, whom should they contact? </p>' +
			'<p>The score: points awarded for filling this out, with no “_” characters.</p>' +
			'</div>',

	"USER_PROFILE_DESCRIPTION_TOOLTIP_CONTENT":'<div class="tooltip-style">' +
			'<p>The idea: Enter two sentences minimum about yourself, your organization, your team, who to contact with questions, etc. </p>' +
			'<p>The score: points awarded for having at least 2 sentences averaging 10 words per sentence minimum. Points awarded for having a hyperlink and an email present so that people can ask questions.</p>' +
			'</div>'
});
