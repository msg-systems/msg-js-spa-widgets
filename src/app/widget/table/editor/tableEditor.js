ComponentJS.ns("app.widget.table.editor");
app.widget.table.editor = (() => {

    const _api = {};

    _api.textEditor = function (maxLength) {
        return function (args) {
            return new TextEditor(args, maxLength)
        }
    };

    _api.numberEditor = function (options) {
        return function (args) {
            return new NumberEditor(args, options)
        }
    };

    _api.longTextEditor = function (maxLength, parentSelector) {
        return function (args) {
            return new LongTextEditor(args, maxLength, parentSelector)
        }
    };

    _api.checkboxEditor = function () {
        return function (args) {
            return new CheckboxEditor(args)
        }
    };

    return _api;
})();
