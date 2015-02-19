define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/number",
	"config/scoring"
], function (array, declare, number, scoring) {

	return declare(null, {

		instance:null,

		constructor:function () {

		},

		startup:function () {
			this.instance = 1;
		},

		validateStr: function (str) {
            if (str === null || "") {
                return "";
            } else {
                return str;
            }
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
				score = scoring.ITEM_THUMBNAIL_LARGE_SCORE;
			} else {
				// normal thumbnail
				thumbnail = item.thumbnail;
			}
			if (thumbnail === null || thumbnail === undefined) {
				score = scoring.ITEM_THUMBNAIL_NONE_SCORE;
			} else {
				var index = thumbnail.lastIndexOf("/") + 1;
				var filename = thumbnail.substr(index);
				filename = filename.split("?")[0];
				//nullThumbnail.png = 0
				//no-user-thumb.jpg = 0
				//ago_downloaded.png = 4
				if (filename === "nullThumbnail.png" || filename === "no-user-thumb.jpg") {
					score = scoring.ITEM_THUMBNAIL_NONE_SCORE;
				} else if (filename === scoring.NO_THUMBNAIL_FILE_NAME) {
					score = score + scoring.ITEM_THUMBNAIL_CUSTOM + scoring.ITEM_THUMBNAIL_LARGE_SCORE;
				} else if (filename !== "nullThumbnail.png" || filename !== "no-user-thumb.jpg") {
					score = score + scoring.ITEM_THUMBNAIL_CUSTOM + scoring.ITEM_THUMBNAIL_LARGE_SCORE;
				}
			}
			return score;
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
			// validate length
			if (nWords > scoring.ITEM_TITLE_MIN_LENGTH) {
				score = scoring.ITEM_TITLE_MIN_LENGTH_SCORE;
			}
			score = score + this._titleHasBadWords(itemTitle, scoring.ITEM_TITLE_BAD_WORDS, scoring.ITEM_TITLE_NO_BAD_WORDS_SCORE);
			score = score + this._hasBadCharacters(itemTitle, "_", scoring.ITEM_TITLE_NO_UNDERSCORE_SCORE);
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
				// item summary exist
				score = scoring.ITEM_SUMMARY_MUST_EXIST_SCORE;
				var strippedString = itemSummary.replace(/(<([^>]+)>)/ig, "");
				var nWords = this._getNumWords(strippedString);
				if (nWords >= scoring.ITEM_SUMMARY_MIN_NUM_WORDS) {
					score = score + scoring.ITEM_SUMMARY_MIN_LENGTH_SCORE;
				}
				score = score + this._hasBadWords(strippedString, scoring.ITEM_SUMMARY_BAD_WORDS, scoring.ITEM_SUMMARY_NO_BAD_WORDS_SCORE);
				score = score + this._hasBadCharacters(strippedString, "_", scoring.ITEM_SUMMARY_NO_UNDERSCORE_SCORE);
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
			var strippedString = null;
			if (itemDescription !== null) {
				strippedString = itemDescription.replace(/(<([^>]+)>)/ig, "").trim();
			} else {
				score = 0;
			}
			if (this._isValid(strippedString) || strippedString === null) {
				score = 0;
			} else {
				// it exist
				score = score + scoring.ITEM_DESCRIPTION_MUST_EXIST_SCORE;
				// get number fo words
				var nWords = this._getNumWords(strippedString);
				// validate number of words
				if (nWords >= scoring.ITEM_DESC_MIN_LENGTH) {
					score = score + scoring.ITEM_DESCRIPTION_MIN_LENGTH_SCORE;
				}
				if (itemDescription.search("href") > -1) {
					score = score + scoring.ITEM_DESCRIPTION_LINK_SCORE;
				}
			}
			return score;
		},

		_isValid: function (str) {
			return /^\w*$/.test(str);
		},

		/**
		 *
		 * @param itemAccessAndConstraints
		 * @returns {number}
		 */
		setAccessAndUseConstraintsScore:function (itemAccessAndConstraints) {
			var score = 0;
			if (itemAccessAndConstraints === "" || itemAccessAndConstraints === "<span></span>" || itemAccessAndConstraints === null) {
				score = 0;
			} else {
				var strippedString = itemAccessAndConstraints.replace(/(<([^>]+)>)/ig, "");
				var nWords = this._getNumWords(strippedString);
				// validate if it has words
				if (nWords >= scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_WORDS) {
					score = score + scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_WORDS_SCORE;
					if (nWords >= scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_MIN_NUM_WORDS) {
						score = score + scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_MIN_WORDS_SCORE;
					}
				}
				score = score + this._hasBonusWords(strippedString, scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_BONUS_WORDS, scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_BONUS_WORDS_SCORE);
				if (itemAccessAndConstraints.search("href") > -1) {
					score = score + scoring.ITEM_ACCESS_AND_USE_CONSTRAINTS_HAS_VALID_LINK_SCORE;
				}
			}
			return score;
		},

		/**
		 *
		 * @param itemCredit
		 * @returns {number}
		 */
		setCreditsScore:function (itemCredit) {
			var score = 0;
			if (itemCredit === "" || itemCredit === "<span></span>" || itemCredit === null) {
				score = 0;
			} else {
				score = scoring.ITEM_CREDITS_MIN_NUM_WORDS_SCORE;
			}
			return score;
		},

		/**
		 *
		 * @param val
		 * @returns {*}
		 */
		setMapDrawTimeScore:function (val) {
			var score = 0;
			var temp = (val / 1000) % 60;
			var seconds = number.format(temp, {
				places:5
			});

			if (seconds < scoring.drawTime.GOOD) {
				score = scoring.PERFORMANCE_DRAW_TIME_GOOD_SCORE;
			}

			if (seconds < scoring.drawTime.BETTER) {
				score = scoring.PERFORMANCE_DRAW_TIME_BETTER_SCORE;
			}

			if (seconds < scoring.drawTime.BEST) {
				score = scoring.PERFORMANCE_DRAW_TIME_BEST_SCORE;
			}
			return score;
		},

		/**
		 *
		 * @param layers
		 * @returns {*}
		 */
		setNumLayersScore:function (layers) {
			var score = 0,
					nLayers = 0;
			if (layers !== undefined) {
				nLayers = layers.length;

				if (nLayers === scoring.LAYER_COUNT_MIN) {
					score = scoring.LAYER_COUNT_BEST_SCORE;
				}

				if (nLayers > scoring.LAYER_COUNT_MIN && nLayers <= scoring.LAYER_COUNT_MAX) {
					score = scoring.LAYER_COUNT_BETTER_SCORE;
				}

				if (nLayers > scoring.LAYER_COUNT_MAX) {
					score = scoring.LAYER_COUNT_GOOD_SCORE;
				}
			} else {
				score = 0;
			}

			if (nLayers < 1) {
				// basemap case
				score = 0;
			}

			return score;
		},

		setPopupScore:function (response) {
			var score = 0;
			var itemData = response.itemInfo.itemData;
			if (itemData) {
				var operationalLayers = itemData.operationalLayers;
				if (operationalLayers) {
					if (operationalLayers.length < 1) {
						// POPUPS ARE DISABLED
						score = 0;
					} else {
						array.forEach(operationalLayers, function (ol) {
							//console.log(ol);
							if (ol.popupInfo) {
								score = 2;
								// check if has description
								if (ol.popupInfo.description) {
									//console.log("CUSTOM OL POPUP (DESCRIPTION)");
									score = 7;
								}

								// check if has media infos
								if (ol.popupInfo.mediaInfos) {
									if (ol.popupInfo.mediaInfos.length > 1) {
										//console.log("CUSTOM OL POPUP (MEDIA INFOS)");
										score = 7;
									}
								}
							}

							if (ol.featureCollection) {
								array.forEach(ol.featureCollection.layers, function (lyr) {
									if (lyr.popupInfo !== undefined) {
										if (lyr.popupInfo.description) {
											//console.log("CUSTOM OL POPUP (DESCRIPTION)");
											score = 7;
										}

										if (lyr.popupInfo.mediaInfos) {
											if (lyr.popupInfo.mediaInfos.length > 1) {
												//console.log("CUSTOM OL POPUP (MEDIA INFOS)");
												score = 7;
											}
										}
									}
								});
							}

							// check if sub layers have description/media infos
							array.forEach(ol.layers, function (lyr) {
								if (lyr.popupInfo !== undefined) {
									if (lyr.popupInfo.description) {
										//console.log("CUSTOM OL POPUP (DESCRIPTION)");
										score = 7;
									}

									if (lyr.popupInfo.mediaInfos) {
										if (lyr.popupInfo.mediaInfos.length > 1) {
											//console.log("CUSTOM OL POPUP (MEDIA INFOS)");
											score = 7;
										}
									}
								}
							});
						});

						var featureCollection = operationalLayers.featureCollection;
						if (featureCollection) {
							if (featureCollection.length > 0) {
								console.log(featureCollection);
							} else {
								//console.log("FEATURE COLLECTION NO POPUPS");
								score = 2;
							}
						}
					}
				}

				var layers = itemData.layers;
				if (layers) {
					if (layers.length < 1) {
						// POPUPS ARE DISABLED
						score = 0;
					} else {
						array.forEach(layers, function (l) {
							if (l.popupInfo) {
								if (l.popupInfo.description) {
									//console.log("CUSTOM LAYERS POPUP (DESCRIPTION)");
									score = 7;
								} else {
									//console.log("DEFAULT LAYERS POPUP");
									score = 2;
								}

								if (l.popupInfo.mediaInfos) {
									if (l.popupInfo.mediaInfos.length > 0) {
										//console.log("CUSTOM LAYERS POPUP (MEDIA INFOS)");
									} else {
										//console.log("DEFAULT LAYERS POPUP");
										score = 2;
									}
								}
							}
						});

					}
				}
			} else {
				// response.itemData is null
				score = 0;
			}
			return score;
		},

		/**
		 *
		 * @param item
		 * @returns {*}
		 */
		setSharingScore:function (item) {
			var score = 0,
					sharing = item.access;
			if (sharing === "private") {
				score = scoring.PERFORMANCE_SHARING_PRIVATE_SCORE;
			} else if (sharing === "org" || sharing === "shared") {
				score = scoring.PERFORMANCE_SHARING_ORG_SCORE;
			} else {
				score = scoring.PERFORMANCE_SHARING_PUBLIC_SCORE;
			}
			return score;
		},

		/**
		 *
		 * @param userName
		 * @returns {number}
		 */
		setUserProfileFullNameScore:function (userName) {
			var score = 0;
			if (userName === "" || userName === null) {
				score = 0;
			} else {
				var nWords = this._getNumWords(userName);
				if (nWords >= scoring.USER_NAME_MIN_NUM_WORDS) {
					score = score + scoring.USER_PROFILE_HAS_FULLNAME_MIN_NUM_WORDS_SCORE;
				}
				score = score + this._hasBadCharacters(userName, "_", scoring.USER_PROFILE_FULLNAME_HAS_NO_UNDERSCORE_SCORE);
			}
			return score;
		},

		/**
		 *
		 * @param userDescription
		 * @returns {number}
		 */
		setUserDescriptionScore:function (userDescription) {
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

				var nSentences = strippedString.match(/[^\.!\?]+[\.!\?]+/g);
				if (nSentences !== null) {
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


		_extractEmails:function (text) {
			return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
		},

		_hasUrl:function (str, bonus) {
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

		_getNumWords:function (s) {
			// exclude white space
			s = s.replace(/(^\s*)|(\s*$)/gi, "");
			s = s.replace(/[ ]{2,}/gi, " ");
			// exclude newline with a space at beginning
			s = s.replace(/\n /, "\n");
			return s.split(" ").length;
		},

		_hasBonusWords:function (inputText, bonusWords, bonus) {
			inputText = inputText.toLowerCase();
			if (array.some(bonusWords, function (bonusWord) {
				bonusWord = bonusWord.toLowerCase();
				return inputText.search(bonusWord) >= 0;
			})) {
				// yes
				return bonus;
			} else {
				// no
				return 0;
			}
		},

		_extractWords:function (s) {
			// exclude white space
			s = s.replace("-", " ");
			s = s.replace(/(^\s*)|(\s*$)/gi, "");
			s = s.replace(/[ ]{2,}/gi, " ");
			// exclude newline with a space at beginning
			s = s.replace(/\n /, "\n");
			return s.split(" ");
		},

		_titleHasBadWords:function (inputText, badWords, bonus) {
			inputText = inputText.toLowerCase();
			inputText = this._extractWords(inputText);

			if (array.some(inputText, function (currentWord) {
				console.log(inputText + "\t\t" + currentWord);
				console.log(badWords);
				var match = false;
				array.forEach(badWords, function (badWord) {
					if (currentWord === badWord)
						match = true;
				});
				return match;
			})) {
				// bonus
				console.log("NO BONUS");
				return 0;
			} else {
				// no bonus
				console.log("BONUS");
				return bonus;
			}
		},

		_hasBadWords:function (inputText, badWords, bonus) {
			inputText = inputText.toLowerCase();
			if (array.some(badWords, function (badWord) {
				badWord = badWord.toLowerCase();
				return inputText.search(badWord) >= 0;
			})) {
				// yes
				return 0;
			} else {
				// no
				return bonus;
			}
		},

		_hasBadCharacters:function (inputText, badChars, bonus) {
			if (inputText.indexOf(badChars) === -1) {
				return bonus;
			} else {
				return 0;
			}
		},

		_isUpperCase:function (str) {
			if (str === str.toUpperCase()) {
				return 0;
			} else {
				return scoring.ITEM_TITLE_NO_ALL_CAPS_SCORE;
			}
		}
	});
});