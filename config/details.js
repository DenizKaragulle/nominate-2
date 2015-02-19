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

			// THUMBNAIL
			"	<div class='row'>" +
			"		<div class='column-3'>" +
			"			<div class='row'>" +
			"				<div class='column-12'>" +
			"					<div class='score-graphic score-graphic-pass item-thumbnail-score-gr'>" +
			"						<span class='item-thumbnail-score-num'></span>/<span class='item-thumbnail-score-denom'></span>" +
			"					</div>" +
			"				</div>" +
			"				<div class='column-12'>" +
			"					<img src='assets/images/info_32.png' class='thumbnail-tooltip info-graphic'>" +
			"				</div>" +
			"			</div>" +
			"		</div>" +
			"		<div class='column-2'>" +
			"			<div class='section-header'>Thumbnail</div>" +
			"		</div>" +
			"		<div class='column-3'>" +
			"			<img class='expanded-item-thumbnail thumbnailUrl' src=''>" +
			"			<div class='edit-thumbnail-msg'>Click thumbnail to change image.</div>" +
			"		</div>" +
			"		<div class='column-13'>" +
			"			<div class='icon-external-link open-item-icon' title='Open this item in ArcGIS Online'></div>" +
			"		</div>" +
			"		<div class='column-2'>" +
			"			<button class='btn custom-btn edit-save-btn'> EDIT </button>" +
			"			<button class='btn custom-btn cancel-btn'> CANCEL </button>" +
			"		</div>" +
			"	</div>" +

			// TITLE
			"	<div class='row'>" +
			"		<div class='column-3'>" +
			"			<div class='row'>" +
			"				<div class='column-12'>" +
			"					<div class='score-graphic score-graphic-pass details-title-score-gr'>" +
			"						<span class='details-title-score-num'></span>/<span class='details-title-score-denom'></span>" +
			"					</div>" +
			"				</div>" +
			"				<div class='column-12'>" +
			"					<img src='assets/images/info_32.png' class='title-tooltip info-graphic'>" +
			"				</div>" +
			"			</div>" +
			"		</div>" +
			"		<div class='column-2'>" +
			"			<div class='section-header'>Title</div>" +
			"		</div>" +
			"		<div class='column-15'>" +
			"			<div class='title-textbox'></div>" +
			"		</div>" +
			"	</div>" +

			// SUMMARY
			"	<div class='row'>" +
			"		<div class='column-3'>" +
			"			<div class='row'>" +
			"				<div class='column-12'>" +
			"					<div class='score-graphic score-graphic-pass details-summary-score-gr'>" +
			"						<span class='details-summary-score-num'></span>/<span class='details-summary-score-denom'></span>" +
			"					</div>" +
			"				</div>" +
			"				<div class='column-12'>" +
			"					<img src='assets/images/info_32.png' class='summary-tooltip info-graphic'>" +
			"				</div>" +
			"			</div>" +
			"		</div>" +
			"		<div class='column-2'>" +
			"			<div class='section-header'>Summary</div>" +
			"		</div>" +
			"		<div class='column-15'>" +
			"			<div class='summary-textbox'></div>" +
			"		</div>" +
			"	</div>" +

			// DESCRIPTION
			"	<div class='row'>" +
			"		<div class='column-3'>" +
			"			<div class='row'>" +
			"				<div class='column-12'>" +
			"					<div class='score-graphic score-graphic-pass details-desc-score-gr'>" +
			"						<span class='details-desc-score-num'></span>/<span class='details-desc-score-denom'></span>" +
			"					</div>" +
			"				</div>" +
			"				<div class='column-12'>" +
			"					<img src='assets/images/info_32.png' class='description-tooltip info-graphic'>" +
			"				</div>" +
			"			</div>" +
			"		</div>" +
			"		<div class='column-2'>" +
			"			<div class='section-header'>Description</div>" +
			"		</div>" +
			"		<div class='column-15'>" +
			"			<div class='description-editor' style='height: 200px; overflow: auto;'>" +
			"				<div id='description-editor-widget'></div>" +
			"			</div>" +
			"		</div>" +
			"	</div>" +
			"</div>"
});
