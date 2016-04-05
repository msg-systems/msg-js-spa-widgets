(function ($) {

    var SingleSelect = function (options) {
        var _grid;
        var _handler = new Slick.EventHandler();
        var _selectedRowsLookup = {};
        var _defaults = {
            columnId: "_checkbox_selector",
            cssClass: "centerColumn singleSelect",
            headerCssClass: "centerColumn singleSelect",
            width: 24,
            minWidth: 24
        };

        var _options = $.extend(true, {}, _defaults, options);

        var uncheckedMarkup = "";
        var checkedMarkup = "";
        if (_options.markups && _options.markups.uncheckedMarkup && _options.markups.checkedMarkup) {
            uncheckedMarkup = $("<div />").append(_options.markups.uncheckedMarkup).html();
            checkedMarkup = $("<div />").append(_options.markups.checkedMarkup).html();
        }

        function init(grid) {
            _grid = grid;
            _handler
                .subscribe(_grid.onSelectedRowsChanged, handleSelectedRowsChanged)
                .subscribe(_grid.onClick, handleClick)
                .subscribe(_grid.onKeyDown, handleKeyDown);
        }

        function destroy() {
            _handler.unsubscribeAll();
        }

        function handleSelectedRowsChanged(/*e, args*/) {
            var selectedRows = _grid.getSelectedRows();
            var lookup = {}, row, i;
            for (i = 0; i < selectedRows.length; i++) {
                row = selectedRows[i];
                lookup[row] = true;
                if (lookup[row] !== _selectedRowsLookup[row]) {
                    _grid.invalidateRow(row);
                    delete _selectedRowsLookup[row];
                }
            }
            for (i in _selectedRowsLookup) {
                _grid.invalidateRow(i);
            }
            _selectedRowsLookup = lookup;
            _grid.render();
        }

        function handleKeyDown(e, args) {
            if (e.which == 32) {
                if (_grid.getColumns()[args.cell].id === _options.columnId) {
                    // if editing, try to commit
                    if (!_grid.getEditorLock().isActive() || _grid.getEditorLock().commitCurrentEdit()) {
                        toggleRowSelection(args.row);
                    }
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }
        }

        function handleClick(e, args) {
            // clicking on a row select checkbox
            var isRightColumn = _grid.getColumns()[args.cell].id === _options.columnId;
            if ((_grid.getOptions().activateGrouping ? !$(e.target).hasClass("pscGroupToggle") : true) && isRightColumn) {
                // if editing, try to commit
                if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                }
                // set active cell, because when u click in the singleselect column and then back to the previous selected cell,
                // the editor is not opening, because the cell is not newly set active, because it is still active, the event is not triggered
                _grid.setActiveCell(args.row, args.cell);
                toggleRowSelection(args.row);
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }

        function toggleRowSelection(row) {
            if (_selectedRowsLookup[row]) {
                _grid.setSelectedRows([]);
            } else {
                _grid.setSelectedRows([row]);
            }
        }

        function getColumnDefinition() {
            return {
                id: _options.columnId,
                name: "",
                field: "sel",
                width: _options.width,
                minWidth: _options.minWidth,
                maxWidth: _options.maxWidth,
                resizable: false,
                sortable: false,
                cssClass: _options.cssClass,
                headerCssClass: _options.headerCssClass,
                formatter: checkboxSelectionFormatter
            };
        }

        function checkboxSelectionFormatter(row, cell, value, columnDef, dataContext) {
            if (dataContext) {
                return _selectedRowsLookup[row] ? checkedMarkup : uncheckedMarkup;
            }
            return null;
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
            "SingleSelect": SingleSelect
        }
    });
})($);