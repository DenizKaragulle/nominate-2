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
	'PERFORMANCE_CONTENT':
			'<div id="section-content">' +

			// GRAPHIC
			'	<div class="row">' +
			'		<div class="column-3 pre-8">' +
			'			<div class="section-header performance-text" style="float: left">GOOD</div>' +
			'			<span style="vertical-align: text-top; margin-left: 7px; margin-top: 3px; color: rgb(189, 189, 189); position: absolute;"> ______________ </span>' +
			'		</div>' +
			'		<div class="column-3">' +
			'			<div class="section-header performance-text" style="float: left">BETTER</div>' +
			'			<span style="vertical-align: text-top; margin-left: 7px; margin-top: 3px; color: rgb(189, 189, 189); position: absolute;"> ______________ </span>' +
			'		</div>' +
			'		<div class="column-1">' +
			'			<div class="section-header performance-text">BEST</div>' +
			'		</div>' +
			'		<div class="column-2 pre-6">' +
			'			<button class="btn custom-btn email-btn"> EMAIL USER </button>' +
			'		</div>' +
			'	</div>' +

			// MAP DRAW TIME
			'	<div class="row">' +
			'		<div class="column-3">' +
			'			<div class="row">' +
			'				<div class="column-12">' +
			'					<div class="score-graphic score-graphic-pass mdt-score-gr">' +
			'						<span class="mdt-score-num"></span>/<span class="mdt-score-denom"></span>' +
			'					</div>' +
			'				</div>' +
			'				<div class="column-12">' +
			'					<img src="assets/images/info_32.png" class="draw-time-tooltip info-graphic">' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			'		<div class="column-4">' +
			'			<h2 class="icon-loading icon-blue draw-time-attr-label"><span style="font-size: 0.5em;">draw time</span></h2>' +
			'		</div>' +
			'		<div class="column-3">' +
			'			<div class="section-header performance-text performance-text-very-slow">very slow</div>' +
			'		</div>' +
			'		<div class="column-3">' +
			'			<div class="section-header performance-text performance-text-slow">slow</div>' +
			'		</div>' +
			'		<div class="column-3">' +
			'			<div class="section-header performance-text performance-text-good">good</div>' +
			'		</div>' +
			'	</div>' +

			// NUMBER OF LAYERS
			'	<div class="row">' +
			'		<div class="column-3">' +
			'			<div class="row">' +
			'				<div class="column-12">' +
			'					<div class="score-graphic score-graphic-pass num-layers-score-gr">' +
			'						<span class="num-layers-score-num"></span>/<span class="num-layers-score-denom"></span>' +
			'					</div>' +
			'				</div>' +
			'				<div class="column-12">' +
			'					<img src="assets/images/info_32.png" class="map-layers-tooltip info-graphic">' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			'		<div class="column-4">' +
			'			<h2 class="icon-stack icon-blue num-layers-attr-label"><span style="font-size: 0.5em;">number of map layers</span></h2>' +
			'		</div>' +
			'		<div class="column-3">' +
			'			<div class="section-header performance-text num-layers-good">more than 10</div>' +
			'		</div>' +
			'		<div class="column-3">' +
			'			<div class="section-header performance-text num-layers-better">2 - 10</div>' +
			'		</div>' +
			'		<div class="column-3">' +
			'			<div class="section-header performance-text num-layers-best">1</div>' +
			'		</div>' +
			'	</div>' +

			// POPUPS
			'	<div class="row">' +
			'		<div class="column-3">' +
			'			<div class="row">' +
			'				<div class="column-12">' +
			'					<div class="score-graphic score-graphic-pass popups-score-gr">' +
			'						<span class="popups-score-num"></span>/<span class="popups-score-denom"></span>' +
			'					</div>' +
			'				</div>' +
			'				<div class="column-12">' +
			'					<img src="assets/images/info_32.png" class="popups-tooltip info-graphic">' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			'		<div class="column-4">' +
			'			<h2 class="icon-comment icon-blue popups-attr-label"><span style="font-size: 0.5em;">pop ups</span></h2>' +
			'		</div>' +
			'		<div class="column-3">' +
			'			<div class="section-header performance-text performance-popups-none">no popups</div>' +
			'		</div>' +
			'		<div class="column-3">' +
			'			<div class="section-header performance-text performance-popups-default">default only</div>' +
			'		</div>' +
			'		<div class="column-3">' +
			'			<div class="section-header performance-text performance-popups-custom">custom</div>' +
			'		</div>' +
			'	</div>' +

			// SHARING
			'	<div class="row">' +
			'		<div class="column-3">' +
			'			<div class="row">' +
			'				<div class="column-12">' +
			'					<div class="score-graphic score-graphic-pass sharing-score-gr">' +
			'						<span class="sharing-score-num"></span>/<span class="sharing-score-denom"></span>' +
			'					</div>' +
			'				</div>' +
			'				<div class="column-12">' +
			'					<img src="assets/images/info_32.png" class="sharing-tooltip info-graphic">' +
			'				</div>' +
			'			</div>' +
			'		</div>' +
			'		<div class="column-4">' +
			'			<h2 class="icon-share icon-blue sharing-attr-label"><span style="font-size: 0.5em;">sharing</span></h2>' +
			'		</div>' +
			'		<div class="column-3">' +
			'			<div class="section-header performance-text performance-sharing-good">not shared</div>' +
			'		</div>' +
			'		<div class="column-3">' +
			'			<div class="section-header performance-text performance-sharing-better">organization account</div>' +
			'		</div>' +
			'		<div class="column-3">' +
			'			<div class="section-header performance-text performance-sharing-best">public</div>' +
			'		</div>' +
			'	</div>' +

			'</div>'
});