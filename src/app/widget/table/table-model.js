ComponentJS.ns("___config.package___");
___config.package___.model = ComponentJS.clazz({
    dynamics: {
        optionsFormat: "{ " +
            // slickgrid grid options
        "asyncEditorLoading?: boolean, " +
        "asyncEditorLoadDelay?: number, " +
        "aysncPostRenderDelay?: number," +
        "autoEdit?: boolean, " +
        "autoHeight?: boolean, " +
        "cellFlashCssClass?: string, " +
        "cellHighlightCssClass?: string, " +
        "dataItemColumnValueExtractor?: any, " +
        "defaultColumnWidth?: number, " +
        "defaultFormatter?: any, " +
        "editable?: boolean, " +
        "editCommandhandler?: any, " +
        "editorFactory?: any, " +
        "editorLock?: any, " +
        "enableAddRow?: boolean, " +
        "enableAsyncPostRender?: boolean, " +
        "enableCellRangeSelection?: boolean, " +
        "enableCellNavigation?: boolean, " +
        "enableColumnReorder?: boolean, " +
        "enableTextSelectionOnCells?: boolean, " +
        "explicitInitialization?: boolean, " +
        "forceFitColumns?: boolean, " +
        "forceSyncScrolling?: boolean, " +
        "formatterFactory?: any, " +
        "fullWidthRows?: boolean, " +
        "headerRowHeight?: number, " +
        "leaveSpaceForNewRows?: boolean, " +
        "multiColumnSort?: boolean, " +
        "multiSelect?: boolean, " +
        "rowHeight?: number, " +
        "selectedCellCssClass?: string, " +
        "showHeaderRow?: boolean, " +
        "syncColumnCellResize?: boolean, " +
        "topPanelHeight?: number, " +
        "dynRowHeight?: boolean, " +
            // slickgrid addons by this component
        "activateRowSelectionModel?: boolean, " +
        "activateSelectPlugIn?: boolean, " +
        "activateTreeTableFunctionality?: boolean, " +
        "activateRowMoveManager?: boolean, " +
        "activateGrouping?: boolean" +
        "}",
        singleColumnFormat: "{ " +
            // slickgrid column options
        "behavior?: string, " +
        "cannotTriggerInsert?: boolean, " +
        "cssClass?: any," +
        "defaultSortAsc?: boolean, " +
        "editor?: any, " +
        "field: string, " +
        "focusable?: boolean, " +
        "formatter?: any, " +
        "headerCssClass?: any, " +
        "id: string, " +
        "maxWidth?: number, " +
        "minWidth?: number, " +
        "name: string, " +
        "rerenderOnResize?: boolean, " +
        "resizable?: boolean, " +
        "selectable?: boolean, " +
        "sortable?: boolean, " +
        "toolTip?: string, " +
        "width?: number, " +
            // slickgrid editor column options
        "validator?: any, " +
            // slickgrid internal fields used by slick during runtime
        "previousWidth?: number, " +
            //for searching and sorting it is sometimes neccassary to use formatted value, not the value of the entity directly
            //e.g. when searching a date the user wnats to type 13.3. and not the milliseconds
        "formattedSearchValue?: any, " +
        "formattedSortValue?: any, " +
            // JHO: the rest here must be eliminated
        "tableDroppable?: boolean, " +
        "}",
        selectMarkupFormat: "{ " +
        "uncheckedMarkup: any, " +
        "checkedMarkup: any, " +
        "}"
    },
    protos: {
        create () {
            ComponentJS(this).model({
                "data:dataView": {value: null, valid: "object"},
                "data:groupItemMetadataProvider": {value: null, valid: "object"},
                "data:data": {value: [null], valid: "[object*]"},
                "data:columns": {value: [], valid: "[" + this.singleColumnFormat + "*]"},
                "data:options": {value: null, valid: this.optionsFormat},
                "data:selectedCell": {value: null, valid: "object"},
                "data:selectedItems": {value: [], valid: "[object*]"},
                "data:treeColumnWidth": {value: 0, valid: "number"},
                "data:singleSelectMarkup": {value: null, valid: this.selectMarkupFormat},
                "data:multiSelectMarkup": {value: null, valid: this.selectMarkupFormat},
                "event:selectedRowsChanged": {value: [], valid: "[object*]", autoreset: true},
                "event:cellClicked": {value: null, valid: "object", autoreset: true},
                "event:dataChanged": {value: {}, valid: "object", autoreset: true},
                "event:sortColumns": {value: null, valid: "object", autoreset: true},
                "event:dragStarted": {value: {}, valid: "object", autoreset: true},
                "event:onDrop": {value: {}, valid: "object", autoreset: true},
                "event:onDropstart": {value: {}, valid: "object", autoreset: true},
                "event:onDropend": {value: {}, valid: "object", autoreset: true},
                "event:onMouseEnter": {value: {}, valid: "object", autoreset: true},
                "event:onMouseLeave": {value: false, valid: "boolean", autoreset: true},
                "event:activeCellChanged": {value: {}, valid: "object", autoreset: true},
                "event:rowsMoved": {value: null, valid: "object", autoreset: true},
                "command:renderGrid": {value: false, valid: "boolean", autoreset: true},
                "command:resizeGrid": {value: false, valid: "boolean", autoreset: true},
                "command:changeRowCount": {value: false, valid: "boolean", autoreset: true},
                "command:changedRows": {value: null, valid: "object", autoreset: true},
                "command:scrollRowToTop": {value: -1, valid: "number", autoreset: true},
                "command:scrollRowIntoView": {value: -1, valid: "number", autoreset: true},
                "command:setSelectedItems": {value: [], valid: "[number*]"},
                "command:setOnBeforeEditCellCallback": {value: {}, valid: "object", autoreset: true},
                "command:setOnBeforeMoveRowsCallback": {value: null, valid: "object", autoreset: true}
            })
        }
    }
});
