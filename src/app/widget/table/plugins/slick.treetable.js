(function ($) {

    var TreeTable = function (options) {
        var _grid;
        var _handler = new Slick.EventHandler();
        var _defaults = {
            columnId: "_tree_toggler",
            cssClass: null,
            headerCssClass: null,
            toolTip: "",
            width: 30,
            focusable: false,
            //only has effect when RowMoveManager is activatet
            behavior: "selectAndMove",
            //todo check ob das so geht
            disabledNodeClass: 'slick-tree-disabledNode'
        };

        var _options = $.extend(true, {}, _defaults, options);

        function init(grid) {
            _grid = grid;
            _handler
                .subscribe(_grid.onClick, handleClick);
        }

        function destroy() {
            _handler.unsubscribeAll();
        }

        function handleClick(e, args) {
            // clicking on a cell with the tree toggler
            var isRightColumn = _grid.getColumns()[args.cell].id === _options.columnId;
            //todo pscGroupToggle muss entfernt werden
            if ((_grid.getOptions().activateGrouping ? !$(e.target).hasClass("pscGroupToggle") : true) && isRightColumn) {
                // if editing, try to commit
                if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                }
                // set active cell, because when u click in the tree-toggler column and then back to the previous selected cell,
                // the editor is not opening, because the cell is not newly set active, because it is still active, the event is not triggered
                _grid.setActiveCell(args.row, args.cell);
            }
        }

        function getColumnDefinition() {
            return {
                id: _options.columnId,
                name: "",
                toolTip: _options.toolTip,
                field: "toggle",
                width: _options.width,
                minWidth: _options.minWidth,
                maxWidth: _options.maxWidth,
                resizable: false,
                sortable: false,
                cssClass: _options.cssClass,
                headerCssClass: _options.headerCssClass,
                formatter: treeFormatter,
                behavior: _options.behavior,
                focusable: _options.focusable
            };
        }

        function treeFormatter(row, cell, value, columnDef, dataContext) {
            if (dataContext) {
                var spacer = dataContext.level ? 10 * dataContext.level : 0;
                if (!dataContext.isLeaf) {
                    var filterLeafClass = dataContext.isFilterLeaf ? _options.disabledNodeClass : "";
                    if (dataContext.isCollapsed) {
                        return $.markup("SlickTreeTable_collapsed", {"spacer": spacer, "class": filterLeafClass})[0].outerHTML;
                    } else {
                        return $.markup("SlickTreeTable_expanded", {"spacer": spacer, "class": filterLeafClass})[0].outerHTML;
                    }
                } else if (dataContext.isTemporaryLeaf) {
                    return $.markup("SlickTreeTable_collapsed", {"spacer": spacer, "class": _options.disabledNodeClass})[0].outerHTML;
                } else {
                    spacer += 5;
                    return $.markup("SlickTreeTable_leaf", {"spacer": spacer})[0].outerHTML;
                }
            }
            return "";
        }

        $.extend(this, {
            "init": init,
            "destroy": destroy,

            "getColumnDefinition": getColumnDefinition
        });
    };

    // register namespace
    $.extend(true, window, {
        "Slick": {
            "TreeTable": TreeTable
        }
    });
})($);
