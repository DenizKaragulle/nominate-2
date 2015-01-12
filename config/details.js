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
	"DETAILS_CONTENT":
			"<div id='section-content'>" +

			"	<div class='row'>" +
			"		<div class='column-3'>" +
			"			<div class='row'>" +
			"				<div class='column-12'>" +
			"					<div class='score-graphic'> 4/5</div>" +
			"				</div>" +
			"				<div class='column-12'>" +
			"					<img src='assets/images/info.png' class='thumbnail-tooltip info-graphic'>" +
			"				</div>" +
			"			</div>" +
			"		</div>" +

			"		<div class='column-17'>" +
			"			<div class='section-header'>Thumbnail</div>" +
			"			<img class='expanded-item-thumbnail thumbnailUrl' src=''>" +
			"		</div>" +
			"		<div class='column-3'>" +
			"			<button id='save-btn' class='btn custom-btn'> SAVE </button>" +
			"		</div>" +
			"	</div>" +


			"	<div class='row'>" +
			"		<div class='column-3'>" +
			"			<div class='row'>" +
			"				<div class='column-12'>" +
			"					<div class='score-graphic'> 4/5</div>" +
			"				</div>" +
			"				<div class='column-12'>" +
			"					<img src='assets/images/info.png' class='title-tooltip info-graphic'>" +
			"				</div>" +
			"			</div>" +
			"		</div>" +
			"		<div class='column-12'>" +
			"			<div class='section-header'>Title</div>" +
			"			<div class='title-textbox'></div>" +
			"		</div>" +
			"	</div>" +


			"	<div class='row'>" +
			"		<div class='column-3'>" +
			"			<div class='row'>" +
			"				<div class='column-12'>" +
			"					<div class='score-graphic'> 4/5</div>" +
			"				</div>" +
			"				<div class='column-12'>" +
			"					<img src='assets/images/info.png' class='summary-tooltip info-graphic'>" +
			"				</div>" +
			"			</div>" +
			"		</div>" +
			"		<div class='column-12'>" +
			"			<div class='section-header'>Summary</div>" +
			"			<div class='summary-textbox'></div>" +
			"		</div>" +
			"	</div>" +

			"	<div class='row'>" +
			"		<div class='column-3'>" +
			"			<div class='row'>" +
			"				<div class='column-12'>" +
			"					<div class='score-graphic'> 4/5</div>" +
			"				</div>" +
			"				<div class='column-12'>" +
			"					<img src='assets/images/info.png' class='description-tooltip info-graphic'>" +
			"				</div>" +
			"			</div>" +
			"		</div>" +

			"		<div class='column-17'>" +
			"			<div class='section-header'>Description</div>" +
			"			<div class='description-editor' style='height: 150px; overflow: scroll;'></div>" +
			"		</div>" +
			"	</div>" +
			"</div>",

	"DETAILS_CONTENT_EDIT":
			"<div id='section-content'>" +

			"	<div class='row'>" +
			"		<div class='column-3'>" +
			"			<div class='row'>" +
			"				<div class='column-12'>" +
			"					<div class='score-graphic'> 4/5</div>" +
			"				</div>" +
			"				<div class='column-12'>" +
			"					<img src='assets/images/info.png' class='thumbnail-tooltip info-graphic'>" +
			"				</div>" +
			"			</div>" +
			"		</div>" +

			"		<div class='column-17'>" +
			"			<div class='section-header'>Thumbnail</div>" +
			"			<img class='expanded-item-thumbnail thumbnailUrl' src=''>" +
			"		</div>" +
			"		<div class='column-3'>" +
			"			<button id='save-btn' class='btn custom-btn'> SAVE </button>" +
			"		</div>" +
			"	</div>" +


			"	<div class='row'>" +
			"		<div class='column-3'>" +
			"			<div class='row'>" +
			"				<div class='column-12'>" +
			"					<div class='score-graphic'> 4/5</div>" +
			"				</div>" +
			"				<div class='column-12'>" +
			"					<img src='assets/images/info.png' class='title-tooltip info-graphic'>" +
			"				</div>" +
			"			</div>" +
			"		</div>" +
			"		<div class='column-12'>" +
			"			<div class='section-header'>Title</div>" +
			"			<input class='title-textbox' type='text' name='title-textbox' value='' data-dojo-type='dijit/form/TextBox' id='' />" +
			"		</div>" +
			"	</div>" +


			"	<div class='row'>" +
			"		<div class='column-3'>" +
			"			<div class='row'>" +
			"				<div class='column-12'>" +
			"					<div class='score-graphic'> 4/5</div>" +
			"				</div>" +
			"				<div class='column-12'>" +
			"					<img src='assets/images/info.png' class='summary-tooltip info-graphic'>" +
			"				</div>" +
			"			</div>" +
			"		</div>" +
			"		<div class='column-12'>" +
			"			<div class='section-header'>Summary</div>" +
			"			<input class='summary-textbox' type='text' name='title-textbox' value='' data-dojo-type='dijit/form/TextBox' id='' />" +
			"		</div>" +
			"	</div>" +

			"	<div class='row'>" +
			"		<div class='column-3'>" +
			"			<div class='row'>" +
			"				<div class='column-12'>" +
			"					<div class='score-graphic'> 4/5</div>" +
			"				</div>" +
			"				<div class='column-12'>" +
			"					<img src='assets/images/info.png' class='description-tooltip info-graphic'>" +
			"				</div>" +
			"			</div>" +
			"		</div>" +

			"		<div class='column-17'>" +
			"			<div class='section-header'>Description</div>" +
			"			<div class='description-editor' id='' data-dojo-type='dijit/Editor' name='editorContent'></div>" +
			"		</div>" +
			"	</div>" +
			"</div>"
});
