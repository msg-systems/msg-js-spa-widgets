if (typeof ComponentJS === "undefined") {
    throw "This is a wrapper for SlickGrid to ComponentJS. It requires ComponentJS to be loaded"
}
ComponentJS.ns('app.widget.trait.dataView')
app.widget.trait.dataView.ctrl = ComponentJS.trait({
    dynamics: {
        dataView: null,
        isTree: false,
        hasGroupingActivated: false,
        groupItemMetadataProvider: null,
        groupItemMetadataProviderConfig: {
            toggleCssClass: "appGroupToggle",
            toggleExpandedCssClass: "appExpanded",
            toggleCollapsedCssClass: "appCollapsed",
            groupCssClass: "appGroupContainer",
            groupTitleCssClass: "appGroupTitle"
        },
        updateCounter: 0,
        scrollToIndex: null
    },
    protos: {

        create (modelClazz, viewClazz) {
            this.base(modelClazz, viewClazz)

            if (this.hasGroupingActivated) {
                this.groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider(this.groupItemMetadataProviderConfig)
                this.dataView = new Slick.Data.DataView({groupItemMetadataProvider: this.groupItemMetadataProvider})
            } else {
                this.dataView = new Slick.Data.DataView()
            }

            this.dataView.setFilter(item => {
                if (this.isTree) {
                    return item.isVisible && (item.hasMatch || !!item.hasMatchedChild)
                } else {
                    return item.hasMatch
                }
            })
        },

        prepare () {
            this.base()
            this.registerDataViewBindings()
        },

        registerDataViewBindings () {

            this.dataView.onRowCountChanged.subscribe((e, args) => {
                this.onRowCountChanged(args)
            })

            this.dataView.onRowsChanged.subscribe((e, args) => {
                this.onRowsChanged(args)
            })

            this.dataView.onItemAdded.subscribe((e, args) => {
                this.onItemAdded(args)
            })

            this.dataView.onItemDeleted.subscribe((e, args) => {
                this.onItemDeleted(args)
            })

            this.dataView.onItemUpdated.subscribe((e, args) => {
                this.onItemUpdated(args)
            })
        },

        // needs to be implemented by component that includes this trait
        onRowCountChanged (args) {
            this.base(args)
        },

        // needs to be implemented by component that includes this trait
        onRowsChanged (args) {
            this.base(args)
        },

        // needs to be implemented by component that includes this trait
        onItemAdded (args) {
            this.base(args)
        },

        // needs to be implemented by component that includes this trait
        onItemDeleted (args) {
            this.base(args)
        },

        // needs to be implemented by component that includes this trait
        onItemUpdated (args) {
            this.base(args)
        },

        generateDataViewItem (entity, id) {
            let item = _.clone(entity)
            item.id = id
            item.entity = entity
            item.isVisible = true
            item.hasMatch = true
            return item
        },

        // should be used of every tree table
        // to extend the presentation items the method 'addPresentationAttributesToItemFromEntity' should be used
        // defaultCollapsed: normally the trees are all collapsed, but if u want another default behaviour and have the tree all open, u can defaultCollapsed as false
        generateDataViewTreeItem (entity, id, pParent, isLeaf, defaultCollapsed) {
            let item = this.dataView ? this.dataView.getItemById(id) : null
            let treeItem = this.generateDataViewItem(entity, id)
            treeItem.level = pParent ? pParent.level + 1 : 0
            treeItem.isCollapsed = item ? item.isCollapsed : (defaultCollapsed !== undefined ? defaultCollapsed : true)
            treeItem.isVisible = pParent ? (!pParent.isVisible ? pParent.isVisible : !pParent.isCollapsed) : true
            treeItem.isLeaf = isLeaf
            treeItem.pParent = pParent
            return treeItem
        },

        itemById (id) {
            return this.dataView.getItemById(id)
        },

        idxById (id) {
            return this.dataView.getIdxById(id)
        },

        rowIdxById (id) {
            return this.dataView.getRowById(id)
        },

        items (items) {
            if (items === undefined) {
                return this.dataView.getItems()
            } else {
                this.dataView.setItems(items)
            }
        },

        beginUpdate () {
            if (this.updateCounter === 0) {
                this.dataView.beginUpdate()
            }
            this.updateCounter++
        },

        endUpdate () {
            this.updateCounter--
            if (this.updateCounter === 0) {
                this.dataView.endUpdate()
                // Es kann sein, dass an eine bestimmte Stelle gescrollt werden soll, nachdem sich die Tabelle neu gerendert hat
                // Ist das der Fall, so wird der Index unter this.scrollToIndex gespeichert und nach dem Hinscrollen zurückgesetzt
                if (this.scrollToIndex !== null) {
                    this.doScrollToIndex(this.scrollToIndex)
                    this.scrollToIndex = null
                }
            }
        },

        doScrollToIndex (scrollToIndex) {
            this.base(scrollToIndex)
        },

        deleteItemWithChildItems (item) {
            let children = this.getChildrenOfItem(item)
            _.forEach(children, child => {
                this.deleteItemWithChildItems(child)
            })
            this.dataView.deleteItem(item.id)
        },

        deleteItemById (itemId) {
            let item = this.dataView.getItemById(itemId)
            if (item) {
                if (this.isTree) {
                    // if we have a tree, delete all children recursivly as well
                    let pParent = item.pParent
                    this.deleteItemWithChildItems(item)
                    if (pParent) {
                        let children = this.getChildrenOfItem(pParent)
                        if (children.length === 0) {
                            pParent.isLeaf = true
                            this.dataView.updateItem(pParent.id, pParent)
                        }
                    }
                } else {
                    this.dataView.deleteItem(item.id)
                }
            }
        },

        addItem (pItem) {
            let index
            if (this.isTree && pItem.pParent) {
                pItem.pParent.isLeaf = false
                pItem.pParent.isFilterLeaf = false
                this.updateCollapseStateFromItem(pItem.pParent, false)
            }

            if (pItem) {
                pItem.isVisible = true
                index = this.indexOfPItem(pItem)
                if (index === null) {
                    this.dataView.addItem(pItem)
                    this.scrollToIndex = this.dataView.getLength()
                } else {
                    this.dataView.insertItem(index.insertIdx, pItem)
                    this.scrollToIndex = index.scrollIdx
                }
            }
        },

        updateDataViewItem (pItem) {
            let item = this.dataView.getItemById(pItem.id)
            if (item)
                this.dataView.updateItem(item.id, item)
        },

        // if no new value is given (value === undefined) the collapsed state should be toggled
        updateCollapseStateFromItem (item, value) {
            if (item) {
                this.beginUpdate()

                item.isCollapsed = value !== undefined ? value : !item.isCollapsed
                this.updateVisibilityStateFromChildrenOfItem(item)
                this.dataView.updateItem(item.id, item)

                this.endUpdate()
            }
        },

        updateCollapsedStateOfAllItemsTo (collapsed) {
            this.beginUpdate()
            let items = this.dataView.getItems()
            _.forEach(items, item => {
                item.isCollapsed = collapsed
                let children = this.getChildrenOfItem(item)
                _.forEach(children, childItem => {
                    childItem.isVisible = !item.isCollapsed
                    this.dataView.updateItem(childItem.id, childItem)
                })
                this.dataView.updateItem(item.id, item)
            })
            this.endUpdate()
        },

        sortItems (sortFunction, asc) {
            // Delegate the sorting to DataView. This will fire the change events and update the grid.
            this.dataView.sort(sortFunction, asc)
        },

        filterTreeItems (filterFunction, filterValue) {
            this.beginUpdate()

            let items = this.dataView.getItems()
            let matches = _.chain(items)
                .forEach(item => {
                    //Reset previous markers
                    item.hasMatchedChild = false
                    item.isFilterLeaf = false
                    this.dataView.updateItem(item.id, item)
                })
                .filter(item => {
                    item.hasMatch = filterFunction(item, filterValue)
                    this.dataView.updateItem(item.id, item)
                    return item.hasMatch
                })
                .value()

            _.forEach(matches, matchItem => {
                let pParent = matchItem.pParent
                while (!_.isEmpty(pParent)) {
                    let pParentItem = this.dataView.getItemById(pParent.id)
                    if (pParentItem) {
                        pParentItem.hasMatchedChild = true
                        this.dataView.updateItem(pParentItem.id, pParentItem)
                    }
                    pParent = pParent.pParent
                }
                let children = this.getRecursivlyAllChildrenOfItem(matchItem)
                //wenn keines der Kinder bei den Matches dabei ist, dann ist der Match ein "Pseudo"-Blatt
                matchItem.isFilterLeaf = _.intersection(children, matches).length === 0
                this.expandBranchToItem(matchItem)
                this.dataView.updateItem(matchItem.id, matchItem)
            })

            this.endUpdate()
        },

        filterFlatItems (filterFunction, filterValue) {
            this.beginUpdate()

            let items = this.dataView.getItems()
            _.forEach(items, item => {
                item.hasMatch = filterFunction(item, filterValue)
                this.dataView.updateItem(item.id, item)
            })

            this.endUpdate()
        },

        filterItems (filterFunction, filterValue) {
            if (this.dataView) {
                if (this.isTree)
                    this.filterTreeItems(filterFunction, filterValue)
                else
                    this.filterFlatItems(filterFunction, filterValue)
            }
        },

        updateVisibilityStateFromChildrenOfItem (item) {
            if (item.isCollapsed) {
                //if the item is collapsed then no child is visible at all
                let allChildren = this.getRecursivlyAllChildrenOfItem(item)
                _.forEach(allChildren, child => {
                    child.isVisible = !item.isCollapsed
                    this.dataView.updateItem(child.id, child)
                })
            } else {
                //if the item is not collapsed the visible state depends on the parent of each item
                let recursiveUpdateVisibilityState = (parentItem) => {
                    _.forEach(this.getChildrenOfItem(parentItem), child => {
                        child.isVisible = !parentItem.isCollapsed
                        this.dataView.updateItem(child.id, child)
                        recursiveUpdateVisibilityState(child)
                    })
                }

                recursiveUpdateVisibilityState(item)
            }
        },

        expandBranchToItem (item) {
            this.beginUpdate()
            // only if the item is not visible, it has to be expanded
            // if it is visible, it is already expanded
            if (!item.isVisible) {
                let pParent = item.pParent
                while (pParent && (pParent.isCollapsed || !pParent.isVisible)) {
                    pParent.isCollapsed = false
                    pParent.isVisible = true
                    this.updateVisibilityStateFromChildrenOfItem(pParent)
                    this.dataView.updateItem(pParent.id, pParent)

                    pParent = pParent.pParent
                }
            }
            this.endUpdate()
        },

        getRecursivlyAllChildrenOfItem (item) {
            let allChildren = []
            let recursiveFindChildren = (item, allChildren) => {
                _.forEach(this.getChildrenOfItem(item), child => {
                    allChildren.push(child)
                    recursiveFindChildren(child, allChildren)
                })
            }
            recursiveFindChildren(item, allChildren)
            return allChildren
        },

        getChildrenOfItem (parentItem) {
            return _.filter(this.dataView.getItems(), item => {
                return item.pParent === parentItem
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
        indexOfPItem (pItem) {
            if (pItem.pParent && pItem.pParent.id) {
                return {insertIdx: this.idxById(pItem.pParent.id) + 1, scrollIdx: this.rowIdxById(pItem.pParent.id) + 1}
            } else {
                return {insertIdx: 0, scrollIdx: 0}
            }
        },

        activateGrouping (columnId, groupFormatter) {
            if (columnId !== undefined && groupFormatter !== undefined) {
                this.dataView.setGrouping({
                    getter: columnId,
                    formatter: (groupByValue) => {
                        return groupFormatter(groupByValue)
                    },
                    aggregateCollapsed: true
                })
            }
        },

        deactivateGrouping () {
            this.dataView.setGrouping([])
        }
    }
})
