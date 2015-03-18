/*
 | Copyright 2015 Esri
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
	'TAGS_CONTENT':
			'<div id="section-content">' +

			'	<div class="row">' +
			'		<div class="column-3">' +
			'			<div class="row">' +
			'				<div class="column-12">' +
			'					<div class="score-graphic score-graphic-pass tags-score-gr">' +
			'						<span class="tags-score-num"></span>/<span class="tags-score-denom"></span>' +
			'					</div>' +
			'				</div>' +
			'				<div class="column-12">' +
			'					<img src="assets/images/info_32.png" class="tags-tooltip info-graphic">' +
			'				</div>' +
			'			</div>' +
			'		</div>' +

			'		<div class="column-18">' +
			'			<div class="column-9">' +
			'				<div class="section-header tags-attr-label">Select at least one of the following categories</div>' +
			'				<div id="tagCategories">' +
			'					<div id="tree"></div>' +
			'				</div>' +
			'			</div>' +
			'			<div class="column-9 pre-2">' +
			'				<div class="section-header">Add custom tags</div>' +
			'				<div class="tag-container">' +
			'					<div id="tag-widget"></div>' +
			'				</div>' +
			'			</div>' +
			'		</div>' +

			'		<div class="column-2">' +
			'			<button class="btn custom-btn edit-save-btn"> EDIT </button>' +
			'			<button class="btn custom-btn cancel-btn"> CANCEL </button>' +
			'			<button class="btn custom-btn email-btn"> EMAIL USER </button>' +
			'		</div>' +
			'	</div>' +
			'</div>'
});
