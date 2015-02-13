define([
	"require",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/has",
	"dojo/html",
	"dojo/keys",
	"dojo/on",
	"dojo/query",
	"dojo/string",
	"dojo/store/Memory",

	"dijit/focus",
	"dijit/form/TextBox",
	"dijit/registry",
	"dijit/_OnDijitClickMixin",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetBase",

	"dgrid/OnDemandGrid",
	"dgrid/Selection",
	"dgrid/Keyboard",
	"dojo/topic",

	"dojo/NodeList-traverse",
	"dojo/NodeList-manipulate",
	"dojo/_base/sniff"
], function (require, array, declare, lang, win, dom, domClass, domConstruct, domStyle, has, html, keys, on, query, string, Memory, focusUtil, TextBox, registry, _OnDijitClickMixin, _TemplatedMixin, _WidgetBase, OnDemandGrid, Selection, Keyboard, topic) {
	var Tags = declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin], {
		declaredClass:"CustomTagsWidget",
		basePath:require.toUrl("."),
		templateString:"<div class=\"${baseClass}\"></div>",
		baseClass:"esriTags",

		/* private */
		_attachmentNode:"", // DOM location of this widget (srcNodeRef)
		_autocompleteList:"", // list to hold the in the dropdown autocomplete items
		_grid:"", // dGrid to hold the dropdown list
		_store:"", // hold the array of data in the dropdown list
		_matchParam:"",
		_idProperty:"", // indicates the property to use as the identity property.
		_gridId:"",
		_filterId:"",
		_placeHolder:"", // the input text box placeHolder
		_noDataMsg:"", // No matching data found message
		_maxWidth:"", // max width of the widget
		_minWidth:"", // min width of the widget
		_inputTextBox:"", // the input text box
		_gridHasFocus:false,
		_metaKeyPressed:false, // meta keys
		_shiftKeyPressed:false, // shift key
		_CSS_STYLES:{
			CLASS_SELECTOR:".",
			ALL_SELECTOR:">",
			MULTI:"select2-container select2-container-multi",
			CHOICES:"select2-choices",
			CHOICE:"select2-search-choice",
			SEARCH_CHOICE_FOCUS:"select2-search-choice-focus",
			SEARCH_FIELD:"select2-search-field",
			CLOSE_ICON:"select2-search-choice-close"
		},
		values:[], // values returned to the user
		_selRows:[], // selected rows in the dGrid
		_CHOICE_SELECTOR:"",
		_CHOICE_FOCUS:"",
		_CHOICE_FOCUS_ALL:"",

		constructor:function (params) {
			this._idProperty = params.idProperty || "tag";
			this._maxWidth = params.maxWidth || "auto";
			this._minWidth = params.minWidth || "auto";
			this._matchParam = params.matchParam || "first";
			this.values = [];
			this._selRows = [];

			this._CHOICE_ALL_SELECTOR = this._CSS_STYLES.CLASS_SELECTOR + this._CSS_STYLES.CHOICE + this._CSS_STYLES.ALL_SELECTOR;
			this._CHOICE_FOCUS = this._CSS_STYLES.CLASS_SELECTOR + this._CSS_STYLES.SEARCH_CHOICE_FOCUS;
			this._CHOICE_FOCUS_ALL = this._CHOICE_FOCUS + this._CSS_STYLES.ALL_SELECTOR;
		},

		postMixInProperties:function () {
			this.inherited(arguments);

			var datetime = (new Date()).getTime();
			this._tagsId = "userTags-" + datetime;
			this._gridId = "grid-" + datetime;
			this._filterId = "filter-" + datetime;
			this._isIE8 = has("ie") < 9;
		},

		postCreate:function () {
			if (this._isIE8) {
				this._textTags = new TextBox({
					trim:true,
					placeHolder:"Add Tags",
					style:{
						minWidth:this.minWidth,
						maxWidth:this.maxWidth
					}
				}, domConstruct.create("div", {id:this._tagsId}, this.domNode));
				this._textTags.startup();
				domClass.add(this._textTags.domNode, "ie8Style");
			} else {
				this._attachmentNode = domConstruct.create("div", {id:this._tagsId, className:"grid_1"}, this.domNode);

				// create the container DOM, holds the entire <input> text box
				this._createContainerNode();
				// create the list <ul> that will hold the styled tags inside the <input>
				this._createTagList();
				// dGrid dropdown list
				this._createDropDownList();
				// create a single list choice <li>
				this._createInput();

				var firstFilterQuery = lang.hitch(this, function (item, index, items) {
					var filterString = this._inputTextBox ? this._inputTextBox.get("value") + "" : "";
					if (filterString.length < 1) {
						return true;
					}
					if (!item.tag) {
						return false;
					}
					var name = (item.tag + "").toLowerCase();
					var re = name.match(new RegExp("^" + filterString.toLowerCase()));
					if (re !== null) {
						if (re.length > 0) {
							return true;
						}
					}
					return false;
				});

				var allFilterQuery = lang.hitch(this, function (item, index, items) {
					// the filter string
					var filterString = this._inputTextBox ? this._inputTextBox.get("value") + "" : "";
					if (filterString.length < 1) {
						return true;
					}
					if (!item.tag) {
						return false;
					}
					var name = (item.tag + "").toLowerCase();

					if (name.indexOf(filterString.toLowerCase())) {
						return true;
					}
					return false;
				});

				// dGrid (one column and a hidden header)
				var columns = [
					{ field:this._idProperty }
				];
				// attribute used to sort the dropdown list
				var sortAttr = [
					{ attribute:this._idProperty, ascending:true }
				];

				this._store = new Memory({idProperty:this._idProperty, data:[]}); // create empty store
				var StandardGrid = declare([OnDemandGrid, Selection, Keyboard]);
				this._grid = new StandardGrid({
					store:this._store,
					showHeader:false,
					noDataMessage:"No Tags Found",
					selectionMode:"extended",
					allowSelectAll:true,
					cellNavigation:false,
					columns:columns,
					sort:sortAttr,
					renderRow:this._renderItem
				}, this._dropDownList);
				this._grid.startup();

				domClass.add(this._grid.domNode, "gridHeightLimiter"); // limit grid height

				if (this._matchParam === "first") {
					this._grid.query = firstFilterQuery;
				} else {
					this._grid.query = allFilterQuery;
				}

				// connect events
				var timeoutId;
				// watch for keyboard input in the text box
				this._inputTextBox.watch("value", lang.hitch(this, function (name, oldValue, newValue) {
					if (timeoutId) {
						clearTimeout(timeoutId);
						timeoutId = null;
					}
					this._grid.refresh();
				}));

				this._grid.on(".dgrid-row:click", lang.hitch(this, function (event) {
					var value = "";
					if (!this._shiftKeyPressed && !this._metaKeyPressed) {
						value = this._grid.row(event).data.tag;
						this._createTags(value);
						this._store.remove(value);
						this._grid.refresh();
						this._resetInputTextBox();
					} else if (!event.shiftKey && !event.metaKey && !event.ctrlKey) {
						value = this._selRows[0];
						this._createTags(value);
						this._store.remove(value);
						this._grid.refresh();
						this._resetInputTextBox();
					}
				}));

				this._grid.on("dgrid-deselect", lang.hitch(this, function (event) {
					this._selRows = [];
					for (var rowIdx in this._grid.selection) {
						if (this._grid.selection.hasOwnProperty(rowIdx)) {
							this._selRows.push(rowIdx);
						}
					}
				}));

				this._grid.on("dgrid-select", lang.hitch(this, function (event) {
					this._selRows = [];
					for (var rowIdx in this._grid.selection) {
						if (this._grid.selection.hasOwnProperty(rowIdx)) {
							this._selRows.push(rowIdx);
						}
					}
				}));
				this.connect(this.domNode, "keydown", "_keydownHandler");

				// Seems to be an issue with dojo.keys and SHIFT in FF
				// Test case: http://cmahlke.esri.com:89/test/dojo/keys.html
				window.onkeydown = lang.hitch(this, function (e) {
					if (e.shiftKey || e.ctrlKey || e.keyCode === 224) {
						this._metaKeyPressed = true;
					}
				});
				this.connect(document, "onkeydown", lang.hitch(this, function (event) {
					this._shiftKeyPressed = true;
					this._metaKeyPressed = true;
				}));
			}
		},

		_keydownHandler:function (evt) {
			var nInputChars;
			if (focusUtil.curNode.value !== undefined) {
				nInputChars = focusUtil.curNode.value.length;
			}
			var selectedTag = query(this._CHOICE_FOCUS, dom.byId(this.id)),
					currentTag = query(this._CSS_STYLES.CLASS_SELECTOR + this._CSS_STYLES.CHOICE, dom.byId(this.id)).last(),
					value,
					partsOfStr,
					newArr,
					i;

			switch (evt.keyCode) {
				case keys.RIGHT_ARROW:
					this._navigate(selectedTag, nInputChars, currentTag, "right");
					this._hideGrid();
					break;
				case keys.LEFT_ARROW:
					this._navigate(selectedTag, nInputChars, currentTag, "left");
					this._hideGrid();
					break;
				case keys.DOWN_ARROW:
					evt.preventDefault();
					this._unhighlightTag(selectedTag);
					if (domStyle.get(this._gridId, "display") === "none") {
						this._showGrid();
					}
					if (!this._gridHasFocus) {
						this._grid.focus(this._setFocusOnFirstRow(this._grid, 0));
						this._gridHasFocus = true;
					}
					break;
				case keys.UP_ARROW:
					break;
				case keys.BACKSPACE:
					var tagValue;
					// if the input text is EMPTY and no tags are in FOCUS, delete the first encountered node in the tag list
					if (nInputChars === 0 && query(this._CHOICE_FOCUS_ALL).length === 0) {
						if (query(this._CHOICE_ALL_SELECTOR)[query(this._CHOICE_ALL_SELECTOR).length - 1] !== undefined) {
							tagValue = query(this._CHOICE_ALL_SELECTOR)[query(this._CHOICE_ALL_SELECTOR).length - 1].title;
							if (query("li", this._attachmentNode).length > 0) {
								// remove the tag from the list
								domConstruct.destroy(currentTag[0]);
								// get the tag's title, add it back to the store
								if (tagValue !== undefined || "") {
									try {
										this._store.add({
											tag:tagValue
										});
									} catch (e) {
									}
								}
							}
						}
					}

					// One of the tags other than the last tag has focus, delete it
					if (query(this._CHOICE_FOCUS_ALL).length > 0) {
						tagValue = query(this._CHOICE_FOCUS_ALL).text();
						domConstruct.destroy(selectedTag[0]);
						// get the tag"s title, add it back to the store
						if (tagValue !== undefined || "") {
							try {
								this._store.add({
									tag:tagValue
								});
							} catch (e) {
							}
						}
					}
					// refresh the dGrid and destroy the tag from the list
					this._grid.refresh();
					if (nInputChars === 0) {
						// hide the grid
						this._hideGrid();
					}
					this._removeTag(tagValue);
					break;
				case keys.CTRL:
					this._metaKeyPressed = true;
					break;
				case keys.META:
					this._metaKeyPressed = true;
					break;
				case keys.SHIFT:
					this._shiftKeyPressed = true;
					break;
				case keys.ENTER:
					// check if there are characters entered in the textbox
					if (nInputChars > 0) {
						// get the value(s) in the input text box
						value = this._stripHTML(focusUtil.curNode.value); // strip HTML
						// user could be manually entering csv
						partsOfStr = value.split(",");
						// need to check if the user manually entered the same tag in the csv, if so remove duplicates
						newArr = [];
						array.forEach(partsOfStr, function (item, i) {
							if (array.indexOf(newArr, item) === -1) {
								newArr.push(string.trim(item));
							}
						});

						array.forEach(newArr, lang.hitch(this, function (entry, i) {
							// do not permit empty strings
							if (!this._isEmpty(entry)) {
								//make sure tag does not already exist
								if (!this._contains(this.values, entry)) {
									this._createTags(entry);
								}
							}
						}));
					} else {
						for (i = 0; i < this._selRows.length; i++) {
							this._createTags(this._selRows[i]);
							this._store.remove(this._selRows[i]);
						}
						this._shiftKeyPressed = false;
						this._metaKeyPressed = false;
					}
					this._resetInputTextBox();
					evt.preventDefault();
					focusUtil.focus(dom.byId(this._filterId));
					break;
				case keys.TAB:
					if (!(focusUtil.curNode.id === this._filterId && nInputChars === 0)) {
						// check if there are characters entered in the textbox
						if (nInputChars > 0) {
							// get the value(s) in the input text box
							value = this._stripHTML(focusUtil.curNode.value); // strip HTML
							// user could be manually entering csv
							partsOfStr = value.split(",");
							// need to check if the user manually entered the same tag in the csv, if so remove duplicates
							newArr = [];
							array.forEach(partsOfStr, function (item, i) {
								if (array.indexOf(newArr, item) === -1) {
									newArr.push(string.trim(item));
								}
							});

							array.forEach(newArr, lang.hitch(this, function (entry, i) {
								// do not permit empty strings
								if (!this._isEmpty(entry)) {
									//make sure tag does not already exist
									if (!this._contains(this.values, entry)) {
										this._createTags(entry);
									}
								}
							}));
						} else {
							for (i = 0; i < this._selRows.length; i++) {
								this._createTags(this._selRows[i]);
								this._store.remove(this._selRows[i]);
							}
							this._shiftKeyPressed = false;
							this._metaKeyPressed = false;
						}
						this._resetInputTextBox();
						evt.preventDefault();
						focusUtil.focus(dom.byId(this._filterId));
					}
					break;
				case keys.ESCAPE:
					this._hideGrid();
					break;
				default:
					if (nInputChars > -1) {
						if (domStyle.get(dom.byId(this._gridId), "display") === "none") {
							this._showGrid();
						}
						this._unhighlightTag(selectedTag);
					}
					this._metaKeyPressed = false;
			}
		},

		_blurHandler:function (name, oldValue, newValue) {
			if (!this.focused) {
				// focus has shifted from the tag widget to some other dom node
				var value = this._stripHTML(this._inputTextBox.value); // strip HTML
				if (value.length > 0) {
					var newArr = [],
							partsOfStr = value.split(",");
					array.forEach(partsOfStr, function (item, i) {
						if (array.indexOf(newArr, item) === -1) {
							newArr.push(string.trim(item));
						}
					});
					array.forEach(newArr, lang.hitch(this, function (entry, i) {
						// do not permit empty strings
						if (!this._isEmpty(entry)) {
							// add a new tag if there was text
							if (!this._contains(this.values, entry)) {
								this._createTags(entry);
							}
						}
					}));
					this._resetInputTextBox();
					this._hideGrid();
				} else {
					this._hideGrid();
				}
			}
		},

		_resetInputTextBox:function () {
			registry.byId(this._filterId).set("value", "");
		},

		_isEmpty:function (str) {
			str = str.replace(/^\s+|\s+$/, "");
			if (str.length === 0) {
				return true;
			} else {
				return false;
			}
		},

		_navigate:function (selectedTag, nInputChars, currentTag, dir) {
			if (selectedTag.length > 0 && nInputChars < 1) {
				if (dir === "right") {
					this._hightlightTag(selectedTag.next());
				} else {
					this._hightlightTag(selectedTag.prev());
				}
				this._unhighlightTag(selectedTag);
			} else {
				if (nInputChars < 1) {
					this._hightlightTag(currentTag);
				}
			}
		},

		_contains:function (arr, item) {
			return array.indexOf(arr, item) >= 0;
		},

		_hightlightTag:function (tag) {
			tag.addClass(this._CSS_STYLES.SEARCH_CHOICE_FOCUS);
		},

		_unhighlightTag:function (tag) {
			tag.removeClass(this._CSS_STYLES.SEARCH_CHOICE_FOCUS);
		},

		_removeTag:function (tag) {
			if (tag && array.indexOf(this.values, tag) !== -1) {
				this.values.splice(array.indexOf(this.values, tag), 1);
			}
		},

		_hideGrid:function () {
			if (dom.byId(this._gridId)) {
				domStyle.set(dom.byId(this._gridId), "display", "none");
			}
			this._gridHasFocus = false;
		},

		_showGrid:function () {
			domStyle.set(dom.byId(this._gridId), "display", "block");
			// expand the width of the dGrid to equal the input text box
			var textBoxWidth = domStyle.get(dom.byId(this._attachmentNode), "width");
			domStyle.set(dom.byId(this._gridId), "width", textBoxWidth + "px");
		},

		_setFocusOnFirstRow:function (grid, index) {
			return query(".dgrid-content .dgrid-cell", this._grid.domNode)[index] ||
					query(".dgrid-content .dgrid-row", this._grid.domNode)[index];
		},

		_createTags:function (value) {
			// remove style for any selected nodes
			query(this._CHOICE_FOCUS, dom.byId(this.id)).removeClass("select2-search-choice-focus");
			// create a new <li> tag
			var listItemNode = domConstruct.create("li", null, this._autocompleteList);
			// add style to new tag
			domClass.add(listItemNode, this._CSS_STYLES.CHOICE);
			// set text of new tag
			var listItemDivNode = domConstruct.create("div", {
				title:value
			}, listItemNode);
			html.set(listItemDivNode, this._htmlEncode(value));
			// create a close icon for the new tag
			var listItemNodeLink = domConstruct.create("a", { href:"#" }, listItemDivNode);
			domClass.add(listItemNodeLink, this._CSS_STYLES.CLOSE_ICON);
			// event handler for the close icon (removes the tag and re-adds the item to the store)
			on(listItemNodeLink, "click", lang.hitch(this, function (evt) {
				var tagValue = evt.target.parentElement.innerText || evt.target.parentElement.textContent;
				try {
					this._store.add({
						tag:tagValue
					});
				} catch (e) {
					//
				}
				this._grid.refresh();
				this._removeTag(tagValue);
				domConstruct.destroy(evt.target.parentNode.parentNode);
				this.onDeleteNode(tagValue);
				evt.preventDefault();
			}));
			var inputTextBox = registry.byId(this._filterId);
			domConstruct.place(inputTextBox.domNode, this._autocompleteList, "last");
			this._hideGrid();
			this.values.push(value);
			this.onAddNode(value);
		},

		/**
		 * Listen for when nodes are being removed from the store
		 */
		onDeleteNode:function () {
			// This can be left empty, it will be used as the extension point
		},

		onAddNode:function () {
			// This can be left empty, it will be used as the extension point
		},

		_renderItem:function (item) {
			return domConstruct.create("div", {
				innerHTML:item.tag
			});
		},

		_createContainerNode:function () {
			// create the DOM for this widget
			this._containerNode = domConstruct.create("div", null, this._attachmentNode);
			// add style to the container
			domClass.add(this._containerNode, this._CSS_STYLES.MULTI);
			// since the widget's width expands as the list size increases we need to set the maximum width of
			// the widget
			domStyle.set(this._containerNode, "maxWidth", this._maxWidth);
			domStyle.set(this._containerNode, "minWidth", this._minWidth);
		},

		_createTagList:function () {
			// autocomplete list (<ul>) holds the list of tags already in the input text box
			this._autocompleteList = domConstruct.create("ul", null, this._containerNode);
			// add style to the list of tags
			domClass.add(this._autocompleteList, this._CSS_STYLES.CHOICES);
		},

		_createInput:function () {
			// single autocomplete list choice
			var autocompleteListItem = domConstruct.create("li", null, this._autocompleteList, "last");
			// add style to a single choice
			domClass.add(autocompleteListItem, this._CSS_STYLES.SEARCH_FIELD);

			// input text box
			this._inputTextBox = new TextBox({
				id:this._filterId,
				placeHolder:"Add Tags", //this._placeHolder,
				intermediateChanges:true,
				trim:true,
				style:{ border:"none" }
			}, autocompleteListItem);
			domClass.add(this._inputTextBox, "inputTextBox");
			domStyle.set(this._inputTextBox, "width", this._minWidth);
			if (has("ie") > 8 || has("trident") > 4) { // IE 9, 10, 11 (incl. emulation) needs different style applied
				domClass.add(this._inputTextBox.domNode, "ieStyle");
			}
//      this._inputTextBox.set("placeholder", this.i18n.addTags);
			focusUtil.watch("curNode", lang.hitch(this, this._blurHandler));
		},

		_createDropDownList:function () {
			this._dropDownList = domConstruct.create("div", {
				id:this._gridId
			}, this._containerNode);
			domClass.add(this._dropDownList, "dropDownList");
			domStyle.set(this._dropDownList, "width", this._minWidth);
		},

		prepopulate:function (tags) {
			array.forEach(tags, lang.hitch(this, function (tag, i) {
				this._createTags(tag);
				this._store.remove(tag);
			}));
		},

		clearTags:function () {
			var tags = query(this._CSS_STYLES.CLASS_SELECTOR + this._CSS_STYLES.CHOICE, dom.byId(this.id));
			if (tags.length > 0) {
				array.forEach(tags, lang.hitch(this, function (tag, i) {
					try {
						this._store.add({
							tag:query(this._CHOICE_ALL_SELECTOR, dom.byId(this.id))[0].title
						});
					} catch (e) {
					}
					domConstruct.destroy(tag);
				}));
				this.values = [];
			}
		},

		addStyledTags:function (tags, srcNodeRef) {
			domClass.add(dom.byId(srcNodeRef), this._CSS_STYLES.MULTI);
			var list = domConstruct.create("ul", null, dom.byId(srcNodeRef));
			// add style to the list of tags
			domClass.add(list, this._CSS_STYLES.CHOICES);
			domStyle.set(list, "border", "none");
			array.forEach(tags, function (item, i) {
				var listItemNode = domConstruct.create("li", null, list);
				domStyle.set(listItemNode, "padding", "3px 5px 3px 5px");
				// add style to new tag
				domClass.add(listItemNode, "select2-search-resultSet");
				var listItemDivNode = domConstruct.create("div", {
					title:item
				}, listItemNode);
				html.set(listItemDivNode, item);
			});
		},

		_getUniqueTags:function (tags) {
			var strippedTags = [],
					stripped;
			// strip HTML and only add tag if it still has content
			// https://devtopia.esri.com/WebGIS/arcgis-portal-app/issues/1976
			array.forEach(tags, lang.hitch(this, function (tag) {
				stripped = this._stripHTML(tag);
				if (esriLang.isDefined(stripped) && stripped.length > 0) {
					strippedTags.push(stripped);
				}
			}));

			return array.filter(strippedTags, lang.hitch(this, function (tag, pos) {
				return array.indexOf(strippedTags, tag) === pos;
			}));
		},

		_setValueAttr:function (value) {
			this._setTagsAttr(value);
		},

		_getValueAttr:function () {
			return this._getTagsAttr();
		},

		_setTagsAttr:function (tags) {
			// convert to array if given a string
			if (tags && !(tags instanceof Array)) {
				tags = tags.split(",");
			}

			if (this._isIE8) {
				if (this._textTags) {
					this._textTags.set("value", this._getUniqueTags(tags).join(","));
				}
			} else {
				this.clearTags();
				this.prepopulate(tags ? this._getUniqueTags(tags) : []);
			}
		},

		_getTagsAttr:function () {
			if (this._isIE8) {
				return this._textTags ? this._textTags.get("value") : "";
			} else {
				return this.values ? this.values.join(",") : "";
			}
		},

		_setMinWidthAttr:function (minWidth) {
			this.minWidth = minWidth;
		},

		_setMaxWidthAttr:function (maxWidth) {
			this.maxWidth = maxWidth;
		},

		_setKnownTagsAttr:function (tagList) {
			if (!this._isIE8) {
				this.clearTags();

				if (tagList && tagList.length > 0) {
					this._store = new Memory({idProperty:this._idProperty, data:tagList});
				} else {
					this._store = new Memory({idProperty:this._idProperty, data:[]}); // create empty store
				}

				this._grid.set("store", this._store);
				this._grid.refresh();
			}
		},

		_stripHTML:function (str) {
			return str.replace(/<(?:.|\s)*?>/g, "");
		},

		_htmlEncode:function (str) {
			return (!str) ? str : str.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
		}
	});
	return Tags;
});