ComponentJS.ns('app.widgets.trait.dataView');
app.widgets.trait.dataView.ctrl = ComponentJS.trait({
    dynamics: {
        dataView: null,
        isTree: false,
        hasGroupingActivated: false,
        groupItemMetadataProvider: null,
        updateCounter: 0,
        scrollToIndex: null,
        groupItemMetadataProviderConfig: {
            toggleCssClass: "appGroupToggle",
            toggleExpandedCssClass: "appExpanded",
            toggleCollapsedCssClass: "appCollapsed",
            groupCssClass: "appGroupContainer",
            groupTitleCssClass: "appGroupTitle"

        }
    },
    protos: {

        create: function (modelClazz, viewClazz) {
            var self = this;
            self.base(modelClazz, viewClazz);

            if (self.hasGroupingActivated) {
                self.groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider(self.groupItemMetadataProviderConfig);
                self.dataView = new Slick.Data.DataView({groupItemMetadataProvider: self.groupItemMetadataProvider});
            } else {
                self.dataView = new Slick.Data.DataView();
            }

            self.dataView.setFilter(function (item) {
                if (self.isTree) {
                    return item.isVisible && (item.hasMatch || !!item.hasMatchedChild);
                } else {
                    return item.hasMatch;
                }
            });
        },

        prepare: function () {
            var self = this;
            self.base();
            self.registerDataViewBindings();
        },

        registerDataViewBindings: function () {
            var self = this;

            self.dataView.onRowCountChanged.subscribe(function (/*e, args*/) {
                self.publishEventToParent("dataView:onRowCountChanged");
            });

            self.dataView.onRowsChanged.subscribe(function (e, args) {
                self.publishEventToParent("dataView:onRowsChanged", args);
            });
        },

        generateDataViewItem: function (entity, id) {
            var item = _.clone(entity);
            item.id = id;
            item.entity = entity;
            item.isVisible = true;
            item.hasMatch = true;
            return item;
        },

        // should be used of every tree table
        // to extend the presentation items the method 'addPresentationAttributesToItemFromEntity' should be used
        // defaultCollapsed: normally the trees are all collapsed, but if u want another default behaviour and have the tree all open, u can defaultCollapsed as false
        generateDataViewTreeItem: function (entity, id, pParent, isLeaf, defaultCollapsed) {
            var self = this;
            var item = self.dataView ? self.dataView.getItemById(id) : null;
            var treeItem = self.generateDataViewItem(entity, id);
            treeItem.level = pParent ? pParent.level + 1 : 0;
            treeItem.isCollapsed = item ? item.isCollapsed : (defaultCollapsed !== undefined ? defaultCollapsed : true);
            treeItem.isVisible = pParent ? (!pParent.isVisible ? pParent.isVisible : !pParent.isCollapsed) : true;
            treeItem.isLeaf = isLeaf;
            treeItem.pParent = pParent;
            return treeItem;
        },

        itemById: function (id) {
            var self = this;
            return self.dataView.getItemById(id);
        },

        idxById: function (id) {
            var self = this;
            return self.dataView.getIdxById(id)
        },

        rowIdxById: function (id) {
            var self = this;
            return self.dataView.getRowById(id)
        },

        items: function (items) {
            var self = this;
            if (items === undefined) {
                return self.dataView.getItems();
            } else {
                self.dataView.setItems(items);
            }
        },

        beginUpdate: function () {
            var self = this;
            if (self.updateCounter === 0) {
                self.dataView.beginUpdate();
            }
            self.updateCounter++;
        },

        endUpdate: function () {
            var self = this;
            self.updateCounter--;
            if (self.updateCounter === 0) {
                self.dataView.endUpdate();
                // Es kann sein, dass an eine bestimmte Stelle gescrollt werden soll, nachdem sich die Tabelle neu gerendert hat
                // Ist das der Fall, so wird der Index unter self.scrollToIndex gespeichert und nach dem Hinscrollen zurückgesetzt
                if (self.scrollToIndex !== null) {
                    self.publishEventToParent("dataView:scrollToIndex", self.scrollToIndex);
                    self.scrollToIndex = null
                }
            }
        },

        deleteItemWithChildItems: function (item) {
            var self = this;
            var children = self.getChildrenOfItem(item);
            _.forEach(children, function (child) {
                self.deleteItemWithChildItems(child);
            });
            self.dataView.deleteItem(item.id);
        },

        deleteItemById: function (itemId) {
            var self = this;
            var item = self.dataView.getItemById(itemId);
            if (item) {
                if (self.isTree) {
                    // if we have a tree, delete all children recursivly as well
                    var pParent = item.pParent;
                    self.deleteItemWithChildItems(item);
                    if (pParent) {
                        var children = self.getChildrenOfItem(pParent);
                        if (children.length === 0) {
                            pParent.isLeaf = true;
                            self.dataView.updateItem(pParent.id, pParent);
                        }
                    }
                } else {
                    self.dataView.deleteItem(item.id);
                }
            }
        },

        addItem: function (pItem) {
            var self = this;
            var index;
            if (self.isTree && pItem.pParent) {
                pItem.pParent.isLeaf = false;
                pItem.pParent.isFilterLeaf = false;
                self.updateCollapseStateFromItem(pItem.pParent, false);
            }

            if (pItem) {
                pItem.isVisible = true;
                index = self.indexOfPItem(pItem);
                if (index === null) {
                    self.dataView.addItem(pItem);
                    self.scrollToIndex = self.dataView.getLength();
                } else {
                    self.dataView.insertItem(index.insertIdx, pItem);
                    self.scrollToIndex = index.scrollIdx;
                }
            }
        },

        updateDataViewItem: function (pItem) {
            var self = this;
            var item = self.dataView.getItemById(pItem.id);
            if (item)
                self.dataView.updateItem(item.id, item);
        },

        // if no new value is given (value === undefined) the collapsed state should be toggled
        updateCollapseStateFromItem: function (item, value) {
            var self = this;
            if (item) {
                self.beginUpdate();

                item.isCollapsed = value !== undefined ? value : !item.isCollapsed;
                self.updateVisibilityStateFromChildrenOfItem(item);
                self.dataView.updateItem(item.id, item);

                self.endUpdate();
            }
        },

        updateCollapsedStateOfAllItemsTo: function (collapsed) {
            var self = this;
            self.beginUpdate();
            var items = self.dataView.getItems();
            _.forEach(items, function (item) {
                item.isCollapsed = collapsed;
                var children = self.getChildrenOfItem(item);
                _.forEach(children, function (childItem) {
                    childItem.isVisible = !item.isCollapsed;
                    self.dataView.updateItem(childItem.id, childItem);
                });
                self.dataView.updateItem(item.id, item);
            });
            self.endUpdate();
        },

        sortItems: function (sortFunction, asc) {
            var self = this;
            // Delegate the sorting to DataView. This will fire the change events and update the grid.
            self.dataView.sort(sortFunction, asc);
        },

        filterTreeItems: function (filterFunction, filterValue) {
            var self = this;
            self.beginUpdate();

            var items = self.dataView.getItems();
            var matches = _.chain(items)
                .forEach(function (item) {
                    //Reset previous markers
                    item.hasMatchedChild = false;
                    item.isFilterLeaf = false;
                    self.dataView.updateItem(item.id, item);
                })
                .filter(function (item) {
                    item.hasMatch = filterFunction(item, filterValue);
                    self.dataView.updateItem(item.id, item);
                    return item.hasMatch
                })
                .value();

            _.forEach(matches, function (matchItem) {
                var pParent = matchItem.pParent;
                while (!_.isEmpty(pParent)) {
                    var pParentItem = self.dataView.getItemById(pParent.id);
                    if (pParentItem) {
                        pParentItem.hasMatchedChild = true;
                        self.dataView.updateItem(pParentItem.id, pParentItem);
                    }
                    pParent = pParent.pParent;
                }
                var children = self.getRecursivlyAllChildrenOfItem(matchItem);
                //wenn keines der Kinder bei den Matches dabei ist, dann ist der Match ein "Pseudo"-Blatt
                matchItem.isFilterLeaf = _.intersection(children, matches).length === 0;
                self.expandBranchToItem(matchItem);
                self.dataView.updateItem(matchItem.id, matchItem);
            });

            self.endUpdate();
        },

        filterFlatItems: function (filterFunction, filterValue) {
            var self = this;
            self.beginUpdate();

            var items = self.dataView.getItems();
            _.forEach(items, function (item) {
                item.hasMatch = filterFunction(item, filterValue);
                self.dataView.updateItem(item.id, item);
            });

            self.endUpdate();
        },

        filterItems: function (filterFunction, filterValue) {
            var self = this;
            if (self.dataView) {
                if (self.isTree)
                    self.filterTreeItems(filterFunction, filterValue);
                else
                    self.filterFlatItems(filterFunction, filterValue);
            }
        },

        updateVisibilityStateFromChildrenOfItem: function (item) {
            var self = this;
            if (item.isCollapsed) {
                //if the item is collapsed then no child is visible at all
                var allChildren = self.getRecursivlyAllChildrenOfItem(item);
                _.forEach(allChildren, function (child) {
                    child.isVisible = !item.isCollapsed;
                    self.dataView.updateItem(child.id, child);
                })
            } else {
                //if the item is not collapsed the visible state depends on the parent of each item
                var recursiveUpdateVisibilityState = function (parentItem) {
                    _.forEach(self.getChildrenOfItem(parentItem), function (child) {
                        child.isVisible = !parentItem.isCollapsed;
                        self.dataView.updateItem(child.id, child);
                        recursiveUpdateVisibilityState(child);
                    });
                };
                recursiveUpdateVisibilityState(item);
            }
        },

        expandBranchToItem: function (item) {
            var self = this;
            self.beginUpdate();
            // only if the item is not visible, it has to be expanded
            // if it is visible, it is already expanded
            if (!item.isVisible) {
                var pParent = item.pParent;
                while (pParent && (pParent.isCollapsed || !pParent.isVisible)) {
                    pParent.isCollapsed = false;
                    pParent.isVisible = true;
                    self.updateVisibilityStateFromChildrenOfItem(pParent);
                    self.dataView.updateItem(pParent.id, pParent);

                    pParent = pParent.pParent;
                }
            }
            self.endUpdate();
        },

        getRecursivlyAllChildrenOfItem: function (item) {
            var self = this;
            var allChildren = [];
            var recursiveFindChildren = function (item, allChildren) {
                _.forEach(self.getChildrenOfItem(item), function (child) {
                    allChildren.push(child);
                    recursiveFindChildren(child, allChildren);
                });
            };
            recursiveFindChildren(item, allChildren);
            return allChildren;
        },

        getChildrenOfItem: function (parentItem) {
            var self = this;
            return _.filter(self.dataView.getItems(), function (item) {
                return item.pParent === parentItem;
            })
        },

        /**
         * can be overwritten of the concrete controller, if it should not inserted always on top.
         * if null is returned, the item will be added at the end -> is returned in the overwritten methods
         * if 0 is returned, the item will be added at the beginning
         * returns an object with the keys insertIdx (index in all data) and scrollIdx (index only in visible data)
         * @param pItem
         * @returns {*}
         */
        indexOfPItem: function (pItem) {
            var self = this;
            if (pItem.pParent && pItem.pParent.id) {
                return {insertIdx: self.idxById(pItem.pParent.id) + 1, scrollIdx: self.rowIdxById(pItem.pParent.id) + 1};
            } else {
                return {insertIdx: 0, scrollIdx: 0};
            }
        },

        activateGrouping: function (columnId, groupFormatter) {
            var self = this;
            if (columnId !== undefined && groupFormatter !== undefined) {
                self.dataView.setGrouping({
                    getter: columnId,
                    formatter: function (groupByValue) {
                        return groupFormatter(groupByValue);
                    },
                    aggregateCollapsed: true
                });
            }
        },

        deactivateGrouping: function () {
            var self = this;
            self.dataView.setGrouping([]);
        }
    }
});
