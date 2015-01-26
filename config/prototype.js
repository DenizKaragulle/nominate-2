define([
		"dojo/_base/array",
		"dojo/_base/declare",
		"dojo/number",
		"config/scoring"
], function (array, declare, number, scoring) {

	return declare(null, {

		instance: null,

		constructor: function () {

		},

		startup: function () {
			this.instance = 1;
		},

		/**
		 *
		 * @param item
		 * @returns {number}
		 */
		setThumbnailScore: function (item) {
			var score = 0;
			var thumbnail = null;
			var largeThumbnail = item.largeThumbnail;
			if (largeThumbnail !== null) {
				// large thumbnail
				thumbnail = largeThumbnail;
				score = scoring.ITEM_THUMBNAIL_LARGE;
			} else {
				// normal thumbnail
				thumbnail = item.thumbnail;
			}
			if (thumbnail === null || thumbnail === undefined) {
				return 0;
			} else {
				var index = thumbnail.lastIndexOf("/") + 1;
				var filename = thumbnail.substr(index);
				filename = filename.split("?")[0];
				if (filename === "nullThumbnail.png" || filename === "ago_downloaded.png" || filename === "no-user-thumb.jpg") {
					return 0;
				} else {
					return score + scoring.ITEM_THUMBNAIL_CUSTOM;
				}
			}
		},

		/**
		 *
		 * @param itemTitle
		 * @returns {number}
		 */
		setItemTitleScore: function (itemTitle) {
			var score = 0;
			var strippedString = itemTitle.replace(/(<([^>]+)>)/ig, "");
			var nWords = this._getNumWords(strippedString);
			if (nWords > scoring.ITEM_TITLE_MIN_LENGTH) {
				score = scoring.ITEM_TITLE_MIN_LENGTH;
			}
			score = score + this._hasBadWords(itemTitle, scoring.ITEM_TITLE_BAD_WORDS, scoring.ITEM_TITLE_NO_BAD_WORDS);
			score = score + this._hasBadCharacters(itemTitle, "_", scoring.ITEM_TITLE_NO_UNDERSCORE);
			score = score + this._isUpperCase(itemTitle);
			return score;
		},

		/**
		 *
		 * @param itemSummary
		 * @returns {number}
		 */
		setItemSummaryScore: function (itemSummary) {
			var score = 0;
			if (itemSummary === "" || itemSummary === null) {
				score = 0;
			} else {
				score = scoring.ITEM_SUMMARY_MUST_EXIST;
				var strippedString = itemSummary.replace(/(<([^>]+)>)/ig, "");
				var nWords = this._getNumWords(strippedString);
				if (nWords >= scoring.ITEM_SUMMARY_MIN_NUM_WORDS) {
					score = score + scoring.ITEM_SUMMARY_MIN_LENGTH;
				}
				score = score + this._hasBadWords(strippedString, scoring.ITEM_SUMMARY_CONTENT, scoring.ITEM_SUMMARY_NO_BAD_WORDS);
				score = score + this._hasBadCharacters(strippedString, "_", scoring.ITEM_SUMMARY_NO_UNDERSCORE);
			}
			return score;
		},

		/**
		 *
		 * @param itemDescription
		 * @returns {number}
		 */
		setItemDescriptionScore: function (itemDescription) {
			var score = 0;
			if (itemDescription === "" || itemDescription === null) {
				score = 0;
			} else {
				score = score + scoring.ITEM_DESCRIPTION_MUST_EXIST;
				var strippedString = itemDescription.replace(/(<([^>]+)>)/ig, "");
				var nWords = this._getNumWords(strippedString);
				if (nWords >= scoring.ITEM_DESC_MIN_LENGTH) {
					score = score + scoring.ITEM_DESCRIPTION_MIN_LENGTH;
				}
				if (itemDescription.search("href") > -1) {
					score = score + scoring.ITEM_DESCRIPTION_LINK;
				}
			}
			return score;
		},

		/**
		 *
		 * @param itemAccessAndConstraints
		 * @returns {number}
		 */
		setAccessAndUseConstraintsScore: function (itemAccessAndConstraints) {
			var score = 0;
			if (itemAccessAndConstraints === "" || itemAccessAndConstraints === null) {
				score = 0;
			} else {
				score = score + scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_WORDS;
				var strippedString = itemAccessAndConstraints.replace(/(<([^>]+)>)/ig, "");
				var nWords = this._getNumWords(strippedString);
				if (nWords >= scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_BONUS_WORDS) {
					score = score + scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_MIN_WORDS;
				}
				if (itemAccessAndConstraints.search("href") > -1) {
					score = score + scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_VALID_LINK;
				}
			}
			return score;
		},

		/**
		 *
		 * @param itemCredit
		 * @returns {number}
		 */
		setCredtisScore: function (itemCredit) {
			var score = 0;
			if (itemCredit === "" || itemCredit === null) {
				score = 0;
			} else {
				score = scoring.ITEM_CREDITS_HAS_WORDS;
			}
			return score;
		},

		/**
		 *
		 * @param val
		 * @returns {*}
		 */
		setMapDrawTimeScore: function (val) {
			var temp = (val / 1000) % 60;
			var seconds = number.format(temp, {
				places: 5
			});

			if (seconds < scoring.drawTime.BEST) {
				return scoring.PERFORMANCE_DRAW_TIME_BEST;
			} else if (seconds < scoring.drawTime.BETTER) {
				return scoring.PERFORMANCE_DRAW_TIME_BETTER;
			} else if (seconds < scoring.drawTime.GOOD) {
				return scoring.PERFORMANCE_DRAW_TIME_GOOD;
			} else {
				return 0;
			}
		},

		/**
		 *
		 * @param layers
		 * @returns {*}
		 */
		setNumLayersScore: function (layers) {
			if (layers !== undefined) {
				var nLayers = layers.length;
				if (nLayers > scoring.LAYER_COUNT_MAX) {
					return scoring.LAYER_COUNT_GOOD_POINTS;
				} else if (nLayers > scoring.LAYER_COUNT_MIN && nLayers <= scoring.LAYER_COUNT_MAX) {
					return scoring.LAYER_COUNT_BETTER_POINTS;
				} else if (nLayers === scoring.LAYER_COUNT_MIN) {
					return scoring.LAYER_COUNT_BEST_POINTS;
				} else {
					return 0;
				}
			}
		},

		/**
		 *
		 * @param layers
		 * @returns {number}
		 */
		setPopupScore: function (layers) {
			var score = 0;
			var isCustomPopup = false;

			array.forEach(layers, function (layer) {
				array.forEach(layer.layers, function(lyr) {
					if (isCustomPopup === false) {
						if (lyr.popupInfo) {
							var popupInfo = lyr.popupInfo;
							if (popupInfo.description.length > 0) {
								isCustomPopup = true;
								score = scoring.PERFORMANCE_POPUPS_CUSTOM;
							}
						}
					}
				});
			});

			array.forEach(layers, function (layer) {
				var popupInfo;
				if (layer.featureCollection !== undefined) {
					popupInfo = layer.featureCollection.layers[0].popupInfo;
					if (popupInfo.description !== null) {
						isCustomPopup = true;
						score = scoring.PERFORMANCE_POPUPS_CUSTOM;
					}
				}

				if (layer.featureCollection !== undefined) {
					popupInfo = layer.featureCollection.layers[0].popupInfo;
					if (popupInfo.description !== null) {
						isCustomPopup = true;
						score = scoring.PERFORMANCE_POPUPS_CUSTOM;
					}
				}
			});

			return score;
		},

		/**
		 *
		 * @param item
		 * @returns {*}
		 */
		setSharingScore: function (item) {
			var sharing = item.access;
			if (sharing === "private") {
				return scoring.PERFORMANCE_SHARING_PRIVATE_POINTS;
			} else if (sharing === "org" || sharing === "shared") {
				return scoring.PERFORMANCE_SHARING_ORG_POINTS;
			} else {
				return scoring.PERFORMANCE_SHARING_PUBLIC_POINTS;
			}
		},

		/**
		 *
		 * @param userName
		 * @returns {number}
		 */
		setUserProfileFullNameScore: function (userName) {
			var score = 0;
			if (userName === "" || userName === null) {
				score = 0;
			} else {
				score = score + scoring.USER_PROFILE_HAS_FULLNAME_MIN_NUM_WORDS;
				score = score + this._hasBadCharacters(userName, "_", scoring.USER_PROFILE_FULLNAME_HAS_NO_UNDERSCORE);
			}
			return score;
		},

		/**
		 *
		 * @param userDescription
		 * @returns {number}
		 */
		setUserDescriptionScore: function (userDescription) {
			var score = 0;
			if (userDescription === "" || userDescription === null) {
				score = 0;
			} else {
				// has text +1
				score = scoring.USER_PROFILE_DESCRIPTION_HAS_DESCRIPTION;
				// has link 1
				var strippedString = userDescription.replace(/(<([^>]+)>)/ig, "");
				score = score + this._hasUrl(strippedString, scoring.USER_PROFILE_DESCRIPTION_HAS_LINK);
				var nWords = this._getNumWords(strippedString);
				if (nWords > 10) {
					// > 10 +1
					score = score + scoring.USER_PROFILE_DESCRIPTION_HAS_MIN_NUM_WORDS;
				}

				var nSentences = strippedString.match( /[^\.!\?]+[\.!\?]+/g);
				if (nSentences !== null) {
					console.log(nSentences);
					if (nSentences.length >= 2) {
						// 2 min sentence +2
						score = score + scoring.USER_PROFILE_DESCRIPTION_HAS_MIN_NUM_SENTENCES;
					}
				}

				var emails = this._extractEmails(userDescription);
				if (emails !== null) {
					// has email +2
					score = score + scoring.USER_PROFILE_DESCRIPTION_HAS_EMAIL;
				}
			}
			return score;
		},



		_extractEmails: function (text) {
			return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
		},

		_hasUrl: function (str, bonus) {
			var pattern = new RegExp("((?:(http|https|Http|Https|rtsp|Rtsp):\\/\\/(?:(?:[a-zA-Z0-9\\$\\-\\_\\.\\+\\!\\*\\'\\(\\)"
					+ "\\,\\;\\?\\&\\=]|(?:\\%[a-fA-F0-9]{2})){1,64}(?:\\:(?:[a-zA-Z0-9\\$\\-\\_"
					+ "\\.\\+\\!\\*\\'\\(\\)\\,\\;\\?\\&\\=]|(?:\\%[a-fA-F0-9]{2})){1,25})?\\@)?)?"
					+ "((?:(?:[a-zA-Z0-9][a-zA-Z0-9\\-]{0,64}\\.)+"   // named host
					+ "(?:"   // plus top level domain
					+ "(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])"
					+ "|(?:biz|b[abdefghijmnorstvwyz])"
					+ "|(?:cat|com|coop|c[acdfghiklmnoruvxyz])"
					+ "|d[ejkmoz]"
					+ "|(?:edu|e[cegrstu])"
					+ "|f[ijkmor]"
					+ "|(?:gov|g[abdefghilmnpqrstuwy])"
					+ "|h[kmnrtu]"
					+ "|(?:info|int|i[delmnoqrst])"
					+ "|(?:jobs|j[emop])"
					+ "|k[eghimnrwyz]"
					+ "|l[abcikrstuvy]"
					+ "|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])"
					+ "|(?:name|net|n[acefgilopruz])"
					+ "|(?:org|om)"
					+ "|(?:pro|p[aefghklmnrstwy])"
					+ "|qa"
					+ "|r[eouw]"
					+ "|s[abcdeghijklmnortuvyz]"
					+ "|(?:tel|travel|t[cdfghjklmnoprtvwz])"
					+ "|u[agkmsyz]"
					+ "|v[aceginu]"
					+ "|w[fs]"
					+ "|y[etu]"
					+ "|z[amw]))"
					+ "|(?:(?:25[0-5]|2[0-4]" // or ip address
					+ "[0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\\.(?:25[0-5]|2[0-4][0-9]"
					+ "|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\\.(?:25[0-5]|2[0-4][0-9]|[0-1]"
					+ "[0-9]{2}|[1-9][0-9]|[1-9]|0)\\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}"
					+ "|[1-9][0-9]|[0-9])))"
					+ "(?:\\:\\d{1,5})?)" // plus option port number
					+ "(\\/(?:(?:[a-zA-Z0-9\\;\\/\\?\\:\\@\\&\\=\\#\\~"  // plus option query params
					+ "\\-\\.\\+\\!\\*\\'\\(\\)\\,\\_])|(?:\\%[a-fA-F0-9]{2}))*)?"); // fragment locator
			if (!pattern.test(str)) {
				return 0;
			} else {
				return bonus;
			}
		},

		_getNumWords: function (s) {
			// exclude white space
			s = s.replace(/(^\s*)|(\s*$)/gi, "");
			s = s.replace(/[ ]{2,}/gi, " ");
			// exclude newline with a space at beginning
			s = s.replace(/\n /, "\n");
			return s.split(" ").length;
		},

		_hasBadWords: function (inputText, badWords, bonus) {
			if (array.some(badWords, function (badWord) {
				return inputText.search(badWord) >= 0;
			})) {
				// yes
				return 0;
			} else {
				// no
				return bonus;
			}
		},

		_hasBadCharacters: function (inputText, badChars, bonus) {
			if (inputText.indexOf(badChars) === -1) {
				return bonus;
			} else {
				return 0;
			}
		},

		_isUpperCase: function (str) {
			if (str === str.toUpperCase()) {
				return 0;
			} else {
				return scoring.ITEM_TITLE_NO_ALL_CAPS;
			}
		}
	});
});