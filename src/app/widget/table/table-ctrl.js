// make sure required JavaScript modules are loaded
if (typeof Slick.Grid === "undefined") {
    throw "This is a wrapper for SlickGrid to ComponentJS. It requires Slick.Grid to be loaded"
}
if (typeof ComponentJS === "undefined") {
    throw "This is a wrapper for SlickGrid to ComponentJS. It requires ComponentJS to be loaded"
}
if (!jQuery.markup) {
    throw "This is a wrapper for SlickGrid to ComponentJS. It requires jquery-markup module to be loaded"
}
if (typeof i18next === "undefined" && typeof i18nextJquery === "undefined") {
    throw "This is a wrapper for SlickGrid to ComponentJS. It requires i18next and i18nextJquery module to be loaded"
}

ComponentJS.ns("___config.package___")
___config.package___.ctrl = ComponentJS.clazz({
    mixin: [ComponentJS.marker.controller],
    dynamics: {
        useDataView: false
    },
    protos: {

        create () {

            this.model = ComponentJS(this).create("model", ___config.package___.model)
            this.view = this.model.create("view", ___config.package___.view)
            ComponentJS(this).property("ComponentJS:state-auto-increase", true)

            ComponentJS(this).register({
                name: "table:data", spool: "created",
                func: data => {
                    if (Object.prototype.toString.call(data) === Object.prototype.toString.call([])) {
                        //check if data is an array, then we just have the single items in an array
                        this.model.value("data:data", data)
                    } else {
                        // if data is not an array, we will have a dataView, that have its data inside
                        this.useDataView = true
                        this.model.value("data:dataView", data)
                    }
                }
            })

            ComponentJS(this).register({
                name: "table:groupItemMetadataProvider", spool: "created",
                func: groupItemMetadataProvider => {
                    this.model.value("data:groupItemMetadataProvider", groupItemMetadataProvider)
                }
            })

            ComponentJS(this).register({
                name: "table:columns", spool: "created",
                func: columns => {
                    this.model.value("data:columns", columns)
                }
            })

            ComponentJS(this).register({
                name: "table:options", spool: "created",
                func: options => {
                    if (options.activateRowMoveManager && !this.model.value("data:rowMovePlugin")) {
                        this.model.value("data:rowMovePlugin", new Slick.RowMoveManager({
                            cancelEditOnDrag: true
                        }))
                    }
                    this.model.value("data:options", options, true)
                }
            })

            ComponentJS(this).register({
                name: "table:render", spool: "created",
                func: () => {
                    this.model.value("command:renderGrid", true)
                }
            })

            ComponentJS(this).register({
                name: "table:resize", spool: "created",
                func: () => {
                    this.model.value("command:resizeGrid", true)
                }
            })

            ComponentJS(this).register({
                name: "table:changeRowCount", spool: "created",
                func: () => {
                    if (this.useDataView)
                        this.model.value("command:changeRowCount", true)
                }
            })

            ComponentJS(this).register({
                name: "table:changedRows", spool: "created",
                func: args => {
                    if (this.useDataView) {
                        this.model.value("command:changedRows", args)
                        if (this.model.value("data:options").activateTreeTableFunctionality)
                            this.setMaxTreeLevel()
                        // Die sichtbaren Items haben sich verändert, d.h. dass womöglich sich auch die Position (Index) der selektierten Zeile(n) geändert hat/haben,
                        // deswegen wird das Modelfeld 'data:selectedItems' getoucht, dadurch wird der Index neu berechnet
                        this.model.touch("data:selectedItems")
                    }
                }
            })

            ComponentJS(this).register({
                name: "table:scrollToIndex", spool: "created",
                func: index => {
                    if (index === 0) {
                        this.model.value("command:scrollRowToTop", 0)
                    } else {
                        this.model.value("command:scrollRowIntoView", index)
                    }
                }
            })

            //todo evtl kein command sondern data
            ComponentJS(this).register({
                name: "table:setOnBeforeEditCellCallback", spool: "created",
                func: callback => {
                    this.model.value("command:setOnBeforeEditCellCallback", {"onBeforeEditCellCallback": callback})
                }
            })

            //todo evtl kein command sondern data
            ComponentJS(this).register({
                name: "table:setOnBeforeMoveRowsCallback", spool: "created",
                func: callback => {
                    this.model.value("command:setOnBeforeMoveRowsCallback", {callback: callback})
                }
            })

            ComponentJS(this).register({
                name: "table:singleSelectPluginOptions", spool: "created",
                func: singleSelectPluginOptions => {
                    let singleSelectPlugin = new Slick.SingleSelect(singleSelectPluginOptions)
                    this.model.value("data:singleSelectPlugin", singleSelectPlugin)
                }
            })

            ComponentJS(this).register({
                name: "table:multiSelectPluginOptions", spool: "created",
                func: multiSelectPluginOptions => {
                    let multiSelectPlugin = new Slick.MultiSelect(multiSelectPluginOptions)
                    this.model.value("data:multiSelectPlugin", multiSelectPlugin)
                }
            })

            ComponentJS(this).register({
                name: "table:treePluginOptions", spool: "created",
                func: treePluginOptions => {
                    let treePlugin = new Slick.TreeTable(treePluginOptions)
                    this.model.value("data:treePlugin", treePlugin)
                }
            })

            ComponentJS(this).register({
                name: "table:selectedItems", spool: "created",
                func: selectedItems => {
                    if (Object.prototype.toString.call(selectedItems) !== Object.prototype.toString.call([]))
                        selectedItems = [selectedItems]

                    this.model.value("data:selectedItems", selectedItems)
                }
            })
        },

        prepare () {
            this.model.observe({
                name: "data:selectedItems", spool: "..:prepared",
                func: (event, selectedItems) => {
                    let indicesOfItems = []
                    //get the right item indexes of the current table entries
                    _.forEach(selectedItems, item => {
                        if (item && item.id) {
                            let idx = this.getDataItemById(item.id)
                            if (idx !== undefined && idx !== null)
                                indicesOfItems.push(idx)
                        }
                    })
                    this.model.value("command:setSelectedItems", indicesOfItems)
                }
            })

            this.model.observe({
                name: "event:cellClicked", spool: "..:prepared",
                func: (event, obj) => {
                    let columnId = obj.cellId
                    let options = this.model.value("data:options")
                    let dataObject = this.getDataItemAtIndex(obj.cell.row)
                    if (options.activateTreeTableFunctionality && columnId === "_tree_toggler") {
                        if (!dataObject.isLeaf && !dataObject.isFilterLeaf) {
                            ComponentJS(this).publish("table:toggleTreeCollapse", {
                                dataObject: dataObject,
                                columnId: obj.cellId
                            })
                        }
                    } else {
                        //publish cellClicked event to concrete table
                        ComponentJS(this).publish("table:cellClicked", {
                            dataObject: dataObject,
                            columnId: obj.cellId
                        })
                    }
                }
            })

            this.model.observe({
                name: "event:rowsMoved", spool: "..:prepared",
                func: (event, obj) => {
                    if (this.model.value("data:options").activateRowMoveManager) {
                        let items = _.map(obj.rows, row => {
                            return this.getDataItemAtIndex(row)
                        })
                        let beforeItem = this.getDataItemAtIndex(obj.insertBefore)
                        let afterItem = (obj.insertBefore - 1) >= 0 ? this.getDataItemAtIndex(obj.insertBefore - 1) : null
                        ComponentJS(this).publish("table:rowsMoved", {
                            items: items,
                            insertBeforeItem: beforeItem,
                            insertAfterItem: afterItem
                        })
                    }
                }
            })

            this.model.observe({
                name: "event:activeCellChanged", spool: "..:prepared",
                func: (event, obj) => {
                    let activeCellChanged
                    if (obj) {
                        activeCellChanged = {
                            dataObject: this.getDataItemAtIndex(obj.row),
                            columnId: obj.columnId,
                            row: obj.row,
                            cell: obj.cell
                        }
                    }
                    ComponentJS(this).publish("table:activeCellChanged", activeCellChanged)
                }
            })

            this.model.observe({
                name: "event:selectedRowsChanged", spool: "..:prepared",
                func: (ev, selectedDataItems) => {
                    if (this.model.value("data:options").activateSelectPlugIn || this.model.value("data:options").activateRowSelectionModel)
                        ComponentJS(this).publish("table:selectedDataItemsChanged", selectedDataItems)
                }
            })

            this.model.observe({
                name: "event:dataChanged", spool: "..:prepared",
                func: (ev, cellCoords) => {
                    if (this.model.value("data:options").editable) {
                        let dataObject = this.getDataItemAtIndex(cellCoords.cell.row)
                        ComponentJS(this).publish("table:dataChanged", dataObject, cellCoords.cellId)
                    }
                }
            })

            this.model.observe({
                name: "event:newRowAdded", spool: "..:prepared",
                func: (ev, args) => {
                    if (args.item && args.column)
                        ComponentJS(this).publish("table:newRowAdded", args.item, args.column.id)
                }
            })

            this.model.observe({
                name: "event:sortColumns", spool: "..:prepared",
                func: (ev, args) => {
                    if (args && args.sortCol) {
                        let sortObject = {col: args.sortCol, asc: args.sortAsc ? 1 : -1}
                        ComponentJS(this).publish("table:sortData", sortObject)
                    }
                }
            })

            this.model.observe({
                name: "event:dragStarted", spool: "..:prepared",
                func: (ev, dragObject) => {
                    dragObject.data = this.getDataItemAtIndex(dragObject.row)
                    ComponentJS(this).publish("table:startDragging", dragObject)
                }
            })

            this.model.observe({
                name: "event:onMouseEnter", spool: "..:prepared",
                func: (ev, cellInfomation) => {
                    if (cellInfomation && cellInfomation.cell && cellInfomation.cell.hasOwnProperty("row")) {
                        let data = this.getDataItemAtIndex(cellInfomation.cell.row)
                        ComponentJS(this).publish("table:onMouseEnter", {data: data, target: cellInfomation.target, columnId: cellInfomation.columnId})
                    }
                }
            })

            this.model.observe({
                name: "event:onMouseLeave", spool: "..:prepared",
                func: () => {
                    ComponentJS(this).publish("table:onMouseLeave")
                }
            })

            this.model.observe({
                name: "event:onDrop", spool: "..:prepared",
                func: (ev, onDropObj) => {
                    ComponentJS(this).publish("table:drop", {
                        dataObject: this.getDataItemAtIndex(onDropObj.cell.row),
                        columnId: onDropObj.columnId,
                        droppedData: onDropObj.drop.data,
                        dropType: onDropObj.drop.type
                    })
                }
            })

            this.model.observe({
                name: "event:onDropstart", spool: "..:prepared",
                func: (ev, onDropstartObj) => {
                    ComponentJS(this).publish("table:dropstart", {
                        dataObject: this.getDataItemAtIndex(onDropstartObj.cell.row),
                        columnId: onDropstartObj.columnId,
                        domEv: onDropstartObj.ev,
                        dropType: onDropstartObj.drop.type
                    })
                }
            })

            this.model.observe({
                name: "event:onDropend", spool: "..:prepared",
                func: (ev, domEv) => {
                    ComponentJS(this).publish("table:dropend", domEv)
                }
            })
        },

        show () {
            this.model.touch("command:setSelectedItems")
        },

        setMaxTreeLevel () {
            let items = this.getDataItems()
            let visibleItems = _.filter(items, item => {
                return item.isVisible
            })
            let maxTreeLevel = 0
            _.forEach(visibleItems, item => {
                if (item.level > maxTreeLevel) {
                    maxTreeLevel = item.level
                }
            })
            this.model.value("data:treeColumnWidth", 24 + (maxTreeLevel * 10))
        },

        getDataItemAtIndex (index) {
            if (this.useDataView)
                return this.model.value("data:dataView").getItem(index)
            else
                return this.model.value("data:data")[index]
        },

        getDataItemById (itemId) {
            if (this.useDataView)
                return this.model.value("data:dataView").getRowById(itemId)
            else
                return _.find(this.model.value("data:data"), {id: itemId})
        },

        getDataItems () {
            if (this.useDataView) {
                let dataView = this.model.value("data:dataView")
                return dataView ? dataView.getItems() : []
            } else {
                return this.model.value("data:data")
            }

        }

    }
})

