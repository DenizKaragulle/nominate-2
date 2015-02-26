define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/mouse",
	"dojo/on",
	"dojo/query"
], function (array, declare, lang, dom, domAttr, domClass, domConstruct, domStyle, mouse, on, query) {

	return declare(null, {

		instance: null,
		selectedID: null,
		item: null,
		titleNode: null,

		constructor: function (item, titleNode) {
			this.selectedID = item.id;
			this.item = item;
			this.titleNode = titleNode;
			console.log(this.selectedID);
			console.log(this.item);

			on(this.titleNode, mouse.enter, lang.hitch(this, this._nodeMouseEnterHandler));
			on(this.titleNode, mouse.leave, lang.hitch(this, this._nodeMouseLeaveHandler));
			on(this.titleNode, "click", lang.hitch(this, this._titleClickHandler));
		},

		_nodeMouseEnterHandler : function (evt) {
			domClass.add(this.titleNode, "hoverClass");
		},

		_nodeMouseLeaveHandler : function (evt) {
			domClass.remove(this.titleNode, "hoverClass");
		},

		_titleClickHandler : function (evt) {
			console.log(this.selectedID);
		}
	});
});