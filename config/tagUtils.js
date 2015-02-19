define([
	"dijit/registry",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/html"
], function (registry, array, declare, dom, domClass, domConstruct, domStyle, html) {

	return declare(null, {

		instance: null,

		constructor: function () {

		},

		startup: function () {
			//this.instance = 1;
		},

		updateTreePath: function (tree, treeModel, userTags) {
			var tagPaths = [];
			// iterate over the user tags from AGOL
			array.forEach(userTags, function (tag) {
				// iterate over each of the atlas tags
				array.forEach(treeModel.store.data, function (atlasTag) {
					// check if there is a match
					if (tag === atlasTag.name) {
						// check if it's not a parent/root node
						if (atlasTag.path) {
							// add the id and the tag's path to the list of paths
							atlasTag.path.push(atlasTag.id);
							tagPaths.push(atlasTag.path);
							// check the check box
							if (registry.byId(tag)) {
								registry.byId(tag).set("checked", true);
							}
						}
					}
				});
			});
			tree.set("paths", tagPaths);
		},

		styleTags: function (tags, srcNodeRef) {
			domClass.add(dom.byId(srcNodeRef), "select2-container select2-container-multi");
			var list = domConstruct.create("ul", null, dom.byId(srcNodeRef));
			// add style to the list of tags
			domClass.add(list, "select2-choices");
			domStyle.set(list, "border", "none");
			array.forEach(tags, function (item, i) {
				var listItemNode = domConstruct.create("li", null, list);
				domStyle.set(listItemNode, "padding", "3px 5px 3px 5px");
				// add style to new tag
				domClass.add(listItemNode, "select2-search-resultSet");
				var listItemDivNode = domConstruct.create("div", {
					title: item
				}, listItemNode);
				html.set(listItemDivNode, item);
			});
		}
	});
});