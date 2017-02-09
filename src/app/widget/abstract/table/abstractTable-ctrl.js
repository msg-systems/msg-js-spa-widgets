// make sure required abstract components are loaded
if (typeof ComponentJS === "undefined") {
    throw "This is a wrapper for SlickGrid to ComponentJS. It requires ComponentJS to be loaded"
}
if (!(typeof app !== "undefined" && typeof app.fw !== "undefined" && typeof app.fw.abstract !== "undefined" && typeof app.fw.abstract.ctrl !== "undefined")) {
    throw "This is a abstract component for a table. It needs to extend from the component app.fw.abstract" +
    "from the msg-js-spa-framework. So the controller from the component app.fw.abstract is required to be loaded"
}
if (!(typeof app.widget !== "undefined" && typeof app.widget.trait !== "undefined" &&
    typeof app.widget.trait.dataView !== "undefined" && typeof app.widget.trait.dataView.ctrl !== "undefined")) {
    throw "This is a abstract component for a table. It needs the mixin app.widget.trait.dataView to be loaded"
}

ComponentJS.ns("___config.package___")
___config.package___.ctrl = ComponentJS.clazz({
    extend: app.fw.abstract.ctrl,
    mixin: [
        app.widget.trait.dataView.ctrl
    ],
    dynamics: {
        table: null,
        isTreeTable: false,
        hasGrouping: false
    },
    protos: {

        create (modelClazz, viewClazz) {
            this.hasGroupingActivated = this.hasGrouping
            this.base(modelClazz, viewClazz)
            this.createTable()

            if (this.hasGrouping) {
                this.model.value("data:tableOptions.activateGrouping", true)
            }
            if (this.isTreeTable) {
                this.model.value("data:tableOptions.activateTreeTableFunctionality", true)
            }
            this.isTree = this.isTreeTable

            this.registerAPI("table:changeCollapsedStates", collapsed => {
                this.updateCollapsedStateOfAllItemsTo(collapsed)
            })

            this.registerAPI("table:invalidate", () => {
                this.table.call("table:resize")
            })
        },

        setup () {
            this.base()

            let dataView = this.publishEventToParent("dataView")
            // this abstract components mixins the dataView trait, so by default, there the dataview is initialiazed
            if (dataView) {
                this.dataView = dataView
            }
            if (this.dataView) {
                this.table.call("table:data", this.dataView)
            }
            if (this.groupItemMetadataProvider) {
                this.table.call("table:groupItemMetadataProvider", this.groupItemMetadataProvider)
            }

            let tableOptions = this.model.value("data:tableOptions")
            if (tableOptions.activateSelectPlugIn || tableOptions.activateRowSelectionModel) {
                if (tableOptions.multiSelect) {
                    this.table.call("table:multiSelectPluginOptions", this.multiSelectPluginOptions())
                } else {
                    this.table.call("table:singleSelectPluginOptions", this.singleSelectPluginOptions())
                }
            }
        },

        prepare () {
            this.base()

            this.subscribeForChildEvent("table:activeCellChanged", (ev, activeCellObj) => {
                ev.propagation(false)
                this.model.value("data:activeCellsPresentationEntry", activeCellObj && activeCellObj.dataObject ? activeCellObj.dataObject : {})
            })

            this.subscribeForChildEvent("table:sortData", (ev, sortObject) => {
                let column = sortObject.col
                let field = column.field || ""
                if (field) {
                    sortObject.field = field
                    this.model.value("data:sortObject", sortObject)
                }
            })

            this.observeParentModel("global:command:resize", (/*ev, value*/) => {
                this.table.call("table:resize")
            })

            this.observeOwnModel("data:tableColumns", (ev, columns) => {
                this.table.call("table:columns", columns)
                // da die Werte der einzelnen Zellen (=Spalten) beim Filtern überprüft werden werden,
                // muss erneut gefiltert werden, wenn sich die Spalten ändern
                this.model.touch("data:filterValue")
            })

            this.observeOwnModel("data:tableOptions", (ev, newValue, oldValue, op, path) => {
                if (path.indexOf(".") === -1) {
                    this.table.call("table:options", newValue)
                } else {
                    let attr = path.replace(/^.+?\./, "")
                    this.model.value("data:tableOptions." + attr, newValue)
                    this.table.call("table:options", this.model.value("data:tableOptions"))
                }
            }, {boot: true})

            this.observeOwnModel("data:sortObject", (ev, sortObject) => {
                this.sortTableEntries(sortObject)
            })

            this.observeOwnModel("data:filterValue", (ev, filterValue) => {
                if (typeof this.filterItems === "function" && this.model.value("data:tableColumns").length > 0) {
                    this.filterItems(this.tableEntryHasMatch.bind(this), filterValue)
                }
            })

            this.observeOwnModel("data:activeCellsPresentationEntry", (ev, newValue, oldValue) => {
                let oldEntity = oldValue ? oldValue.entity : {}
                //second parameter is only needed from tables that need informations from the presentation entry
                this.saveData(oldEntity, oldValue)
            }, {op: "changed"})


            //
            // F O R   S E L E C T I O N
            //
            this.subscribeForChildEvent("table:selectedDataItemsChanged", (ev, selectedDataItems) => {
                if (selectedDataItems.length > 0) {
                    this.model.value("data:selectedTableEntriesFromTable", selectedDataItems)
                } else {
                    this.model.value("data:selectedTableEntriesFromTable", [])
                }
            })

            this.observeOwnModel("data:selectedTableEntriesFromOutside", (ev, tableEntries)=> {
                this.setSelectedTableEntriesFromOutside(tableEntries)
            })

            this.observeOwnModel("data:selectedTableEntriesFromTable", (ev, tableEntries) => {
                this.setSelectedTableEntriesFromTable(tableEntries)
            })
        },

        teardown () {
            this.base()
            this.model.value("data:activeCellsPresentationEntry", {})
        },

        ready () {
            this.base()
            this.table.call("table:setOnBeforeEditCellCallback", this.onBeforeEditCell.bind(this))
            this.table.call("table:setOnBeforeMoveRowsCallback", this.onBeforeMoveRows.bind(this))
        },

        createTable () {
            if (!this.table) {
                this.table = this.view.create("table", app.widget.table.ctrl)
            }
        },

        onRowCountChanged () {
            this.table.call("table:changeRowCount")
        },

        onRowsChanged (args) {
            this.table.call("table:changedRows", args)
        },

        // can be overwritten from concrete table
        // args = {item: tableEntry}
        onItemDeleted (/*args*/) {
        },
        // can be overwritten from concrete table
        // args = {item: tableEntry, index: index}
        onItemAdded (/*args*/) {
        },
        // can be overwritten from concrete table
        // args = {item: tableEntry, index: index}
        onItemUpdated (/*args*/) {
        },

        doScrollToIndex (scrollToIndex) {
            this.table.call("table:scrollToIndex", scrollToIndex)
        },

        // has to be overwritten of the concrete controller
        saveData (/*prevSelectedEntity*/) {
        },

        // has to be overwritten of the concrete controller
        multiSelectPluginOptions () {
            throw "Please overwrite the method 'table:multiSelectPluginOptions' in the concrete table: " + ComponentJS(this).name()
        },

        // has to be overwritten of the concrete controller
        singleSelectPluginOptions () {
            throw "Please overwrite the method 'table:singleSelectPluginOptions' in the concrete table: " + ComponentJS(this).name()
        },

        // has to be overwritten of the concrete controller
        treePluginOptions () {
            throw "Please overwrite the method 'table:treePluginOptions' in the concrete table: " + ComponentJS(this).name()
        },

        //can be overwritten of the concrete controller
        onBeforeEditCell () {
        },

        //has to be overwritten of the concrete controller
        onBeforeMoveRows () {
        },

        presentationIdOfEntity (entity) {
            return entity ? (entity.id + (entity._className ? "_" + entity._className : "")) : null
        },

        //can be overwritten
        parentOfEntity (entity) {
            return entity.parent
        },

        /**
         * this method generates the presentation table entries out of the data entities
         * this is the default for every flat table - normally it is not neccassary that a flat table controller overwrites this
         * if some more presentation attributes are needed, they can be added through overwriting the method 'addPresentationAttributesToItemFromEntity'
         * every treetable HAS to overwrite this method
         * @param data - data model entities
         * @returns {Array}
         */
        generatePresentationTableEntries (data) {
            let tableEntries = []
            _.forEach(data, entity => {
                let tableEntry = this.generatePresentationTableEntry(entity)
                tableEntries.push(tableEntry)
            })
            return tableEntries
        },


        generatePresentationTableEntry (entity, pParent, isLeaf, defaultCollapsed) {
            let pTableEntry
            if (this.isTreeTable) {
                let pParentItem = pParent !== undefined ? pParent : this.itemById(this.presentationIdOfEntity(this.parentOfEntity(entity)))
                let itemIsLeaf = isLeaf !== undefined ? isLeaf : true
                pTableEntry = this.generatePresentationTreeEntry(entity, pParentItem, itemIsLeaf, defaultCollapsed)
            } else {
                pTableEntry = this.generateDataViewItem(entity, this.presentationIdOfEntity(entity))
                this.addPresentationAttributesToItemFromEntity(pTableEntry, entity)
            }
            return pTableEntry
        },

        // should be used of every tree table
        // to extend the presentation items the method 'addPresentationAttributesToItemFromEntity' should be used
        // defaultCollapsed: normally the trees are all collapsed, but if u want another default behaviour and have the tree all open, u can defaultCollapsed as false
        generatePresentationTreeEntry (entity, pParent, isLeaf, defaultCollapsed) {
            let pTreeEntry = this.generateDataViewTreeItem(entity, this.presentationIdOfEntity(entity), pParent, isLeaf, defaultCollapsed)
            this.addPresentationAttributesToItemFromEntity(pTreeEntry, entity, pParent)
            return pTreeEntry
        },

        deleteEntities (entities) {
            let entitiesToDel = entities
            if (Object.prototype.toString.call(entities) !== Object.prototype.toString.call([])) {
                entitiesToDel = [entities]
            }
            this.beginUpdate()
            _.forEach(entitiesToDel, entity => {
                this.deleteItemById(this.presentationIdOfEntity(entity))
            })
            this.endUpdate()
        },

        addEntities (entities) {
            let entitiesToAdd = entities
            if (Object.prototype.toString.call(entities) !== Object.prototype.toString.call([])) {
                entitiesToAdd = [entities]
            }
            this.beginUpdate()
            _.forEach(entitiesToAdd, entity => {
                let item = this.generatePresentationTableEntry(entity)
                this.addItem(item)
            })
            this.endUpdate()
        },

        updateEntities (entities) {
            let entitiesToUpdate = entities
            if (Object.prototype.toString.call(entities) !== Object.prototype.toString.call([])) {
                entitiesToUpdate = [entities]
            }
            this.beginUpdate()
            _.forEach(entitiesToUpdate, entity => {
                let pItem = this.itemById(this.presentationIdOfEntity(entity))
                this.updateItemsFromEntities(this.itemsToUpdate(pItem, entity))
            })
            this.endUpdate()
        },

        replaceEntityWithEntity (oldEntity, newEntity) {
            this.beginUpdate()
            this.deleteEntities(oldEntity)
            this.addEntities(newEntity)
            this.endUpdate()
        },

        updatePresentationTableEntries (newEntities, oldEntities) {
            let items = this.items()
            if (newEntities !== oldEntities ||
                (newEntities && newEntities.length !== items.length) ||
                (!newEntities && items.length > 0)){
                //RESET or newly SET
                this.items(this.generatePresentationTableEntries(newEntities))
                this.model.touch("data:sortObject")
                let existingEntitiesAsItems = _.map(items, "entity")
                if (this.isTreeTable && newEntities && newEntities.length > 0 && existingEntitiesAsItems.length > 0)
                    this.table.call("table:render")
            }
            // if it is possible to select row(s) in table, update the selection after the data changed
            if (this.model.value("data:tableOptions.activateSelectPlugIn") || this.model.value("data:tableOptions.activateRowSelectionModel"))
                this.updateSelectedTableEntriesFromOutside(this.selectedData())
        },

        /**
         * through overwriting this method spezific presentation attributes can be added to a given presentation item
         * this method is called when generating all items and when updating an exisiting item
         */
        addPresentationAttributesToItemFromEntity (/*item, entity, pParent*/) {
        },

        // can be overwritten by concrete table controller
        updatePresentationAttributesToItemFromEntity (item, entity, pParent) {
            _.forEach(item, (val, key) => {
                if (key !== "id" && item.hasOwnProperty(key) && entity.hasOwnProperty(key) && (item[key] !== entity[key])) {
                    item[key] = entity[key]
                }
            })
            item.entity = entity
            this.addPresentationAttributesToItemFromEntity(item, entity, pParent)
        },

        updateTableEntry (tableEntry) {
            this.updateDataViewItem(tableEntry)
        },

        updateItemsFromEntities (itemObjs) {
            let itemsToUpdate = itemObjs
            // pruefe auf Array
            if (Object.prototype.toString.call(itemObjs) !== Object.prototype.toString.call([])) {
                itemsToUpdate = [itemObjs]
            }
            _.forEach(itemsToUpdate, itemObj => {
                this.updatePresentationAttributesToItemFromEntity(itemObj.item, itemObj.entity, itemObj.item.pParent)
                this.updateDataViewItem(itemObj.item)
            })
        },

        itemsToUpdate (item, entity) {
            return {item: item, entity: entity}
        },

        itemFromEntity (entity) {
            return this.itemById(this.presentationIdOfEntity(entity))
        },

        // this returns the index of the item with the id in the whole amount of data, does not matter if all itesm visible or not (e.g. needed for inserting)
        indexById (id) {
            return this.idxById(id)
        },

        // this returns the index of the item with the id only in the amount of all visible items (e.g. needed for scrolling)
        rowIndexById (id) {
            return this.rowIdxById(id)
        },


        // can be overwritten of concrete controller
        tableEntryHasMatch (tableEntry, filterValue) {
            // replace all for regular expressions reserved special character
            filterValue = filterValue.trim().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            let filterValues = filterValue.split(" ")
            let matchesForValues = []
            let columns = this.model.value("data:tableColumns")
            _.forEach(filterValues, val => {
                let regEx = new RegExp(val, "gi")
                let valMatches = _.some(columns, column => {
                    let attrValue
                    let formattedAttr
                    //das Attribut "entity" ist das Datamodell, das soll hier nicht extra nochmal angeschaut werden
                    if (["entity"].indexOf(column.id) === -1) {
                        attrValue = tableEntry[column.field]
                        formattedAttr = attrValue
                        if (column && column.useFormatterForSearch && typeof column.formatter === "function") {
                            formattedAttr = column.formatter(0, 0, attrValue, column, tableEntry)
                        }
                        if (typeof formattedAttr === "string") {
                            return formattedAttr.match(regEx) !== null
                        }
                    }
                    return false
                })
                matchesForValues.push(valMatches)
            })
            // nur wenn alle einzlenen Strings (filterValues) in der Zeile in irgendeiner Spalte vorhanden sind, soll die Zeile auch angezeigt werden
            return !_.includes(matchesForValues, false)
        },

        filterTableEntries (filterValue) {
            this.model.value("data:filterValue", filterValue, true)
        },

        solveUmlaut (value) {
            let text = (value === null || value === undefined) ? "" : value
            if (text && typeof text === "string") {
                text = text.toLowerCase();
                text = text.replace(/ä/g, "ae");
                text = text.replace(/ö/g, "oe");
                text = text.replace(/ü/g, "ue");
                text = text.replace(/ß/g, "ss");
            }
            return text;
        },

        sortStrings (value1, value2, sortDirection) {
            let sortDir = sortDirection || 1;
            let a = this.solveUmlaut(value1);
            let b = this.solveUmlaut(value2);
            return a === b ? 0 : ((a > b ? 1 : -1) * sortDir);
        },

        sortTableEntries (sortObject) {
            if (sortObject && typeof this.items === "function" && typeof this.sortItems === "function") {
                let tableItems = this.items()
                if (tableItems.length > 0) {
                    let field = sortObject.field
                    let column = sortObject.col || _.find(this.model.value("data:tableColumns"), {field: field})
                    let sortFunction = (dataRow1, dataRow2) => {
                        let value1, value2
                        //only use formatted value, when column-option is set to that and a formatter function exists
                        if (column && column.useFormatterForSort && typeof column.formatter === "function") {
                            value1 = column.formatter(0, 0, dataRow1[field], column, dataRow1)
                            value2 = column.formatter(0, 0, dataRow2[field], column, dataRow2)
                        } else {
                            value1 = dataRow1[field]
                            value2 = dataRow2[field]
                        }
                        return this.sortStrings(value1, value2, sortObject.asc)
                    }

                    if (this.isTreeTable) {
                        let sortedItems = []
                        let rootItems = _.filter(tableItems, item => {
                            return _.isEmpty(item.pParent)
                        })

                        let recursiveSort = (items, sortedItems) => {
                            items = items.sort(sortFunction)
                            _.forEach(items, item => {
                                sortedItems.push(item)
                                let children = _.filter(tableItems, oldItem => {
                                    return oldItem.pParent === item
                                })
                                recursiveSort(children, sortedItems)
                            })
                        }

                        recursiveSort(rootItems, sortedItems)
                        this.items(sortedItems)
                    } else {
                        this.sortItems(sortFunction, sortObject.asc)
                    }
                }
            }
        },

        groupTableEntriesByColumn (column) {
            let allColumns = this.model.value("data:allAvailableColumns")
            if (column) {
                let columnsAfterFilter = [], columnToFilter
                _.forEach(allColumns, col => {
                    if (col.id === column) {
                        columnToFilter = col
                    } else {
                        columnsAfterFilter.push(col)
                    }
                })
                this.model.value("data:tableColumns", columnsAfterFilter)
                if (!_.isEmpty(columnToFilter)) {
                    this.activateGrouping(columnToFilter.id, groupByValue => {
                        return app.util.format.DisplayFormatter.groupByColumnFormatter(columnToFilter.formatter, groupByValue)
                    })
                }
            } else {
                this.model.value("data:tableColumns", allColumns)
                this.deactivateGrouping()
            }
        },

        setSelectedTableEntriesFromOutside (tableEntries) {
            this.scrollSelectionIntoView(tableEntries)
            this.table.call("table:selectedItems", tableEntries)
        },

        scrollSelectionIntoView (tableEntries) {
            let selection = tableEntries === undefined ? this.model.value("data:selectedTableEntriesFromOutside") : tableEntries
            // soll nur zu einem Eintrag aufgeklappt und gescrollt werden, wenn Single-Selekt aktiv ist
            if (!this.model.value("data:tableOptions").multiSelect && selection.length === 1) {
                let item = selection[0]
                if (this.isTreeTable && typeof this.expandBranchToItem === "function") {
                    // wenn es sich um einen Baum handelt, muss der Baum auf jeden Fall den Ast bist zu dem selektierten Element aufklappen
                    this.expandBranchToItem(item)
                }
                this.table.call("table:scrollToIndex", this.rowIndexById(item.id))
            }
        },

        /**
         * Aus den Selektierten Präsentation-Modellen müssen die Entity Objects ermittelt werden.
         * @param presentationModelEntries
         */
        setSelectedTableEntriesFromTable (presentationModelEntries) {
            if (this.model.value("data:tableOptions").multiSelect) {
                this.selectedData(_.map(presentationModelEntries, "entity"))
            } else {
                let entityObjs = _.uniq(presentationModelEntries, "entity")
                let entityObj = {}
                if (entityObjs.length === 1 && entityObjs[0].hasOwnProperty("entity")) {
                    entityObj = entityObjs[0].entity
                }
                this.selectedData(entityObj)
            }
        },

        /**
         * Es werden echte Entity Objekts selektiert. Die dazu passenden PräsentationModel Objects
         * die auf die gewünschten Entitäten referenzieren werden dann an SlickGrid indirekt weitergereicht.
         */
        updateSelectedTableEntriesFromOutside (selectedEntityOrArrayOfEntities) {
            let selectedItems = []
            // prüfe auf Array
            if (Object.prototype.toString.call(selectedEntityOrArrayOfEntities) === Object.prototype.toString.call([])) {
                _.forEach(selectedEntityOrArrayOfEntities, entity => {
                    let item = this.itemFromEntity(entity)
                    if (item) selectedItems.push(item)
                })
            } else if (selectedEntityOrArrayOfEntities) { // should not be null
                let item = this.itemFromEntity(selectedEntityOrArrayOfEntities)
                if (item) selectedItems.push(item)
            }
            // only set it if the content has changed, it is not enough to compare the array, because here is every time a new reference created (selectedItems = [])
            // therefore the content must be compared
            if (!_.isEqual(selectedItems, this.model.value("data:selectedTableEntriesFromOutside")))
                this.model.value("data:selectedTableEntriesFromOutside", selectedItems)
        },

        /**
         * Diese Methode muss immer überschrieben werden, wenn die Tabelle die Selektion aktiviert hat
         * wird eine selection übergeben wird diese gesetzt
         * wird kein parameter übergeben wird der model Wert zurückgegeben
         */
        selectedData (/*selection*/) {
        }
    }
})
