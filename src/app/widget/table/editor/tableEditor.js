ComponentJS.ns("app.widget.table.editor");
app.widget.table.editor = (() => {

    const _common = {};
    const _api = {};
    const keys = $.ui.keyCode;

    _common.destroyEditor = (editor) => {
        return () => {
            editor.$editor.remove();
        };
    };

    _common.destroyEditorWrapper = (editor) => {
        return () => {
            editor.$wrapper.remove();
        };
    };

    _common.focusEditor = (editor) => {
        return () => {
            editor.$editor.focus();
        };
    };

    _common.hideEditorWrapper = (editor) => {
        return () => {
            editor.$wrapper.hide();
        };
    };

    _common.showEditorWrapper = (editor) => {
        return () => {
            editor.$wrapper.show();
        };
    };

    _common.getEditorTextValue = (editor) => {
        return () => {
            return editor.$editor.val();
        };
    };

    _common.validateEditorForColumn = (editor) => {
        return () => {
            if (editor.column.validator) {
                const validationResults = editor.column.validator(editor.getValue());
                if (!validationResults.valid) {
                    return validationResults;
                }
            }
            return {
                valid: true,
                msg: null
            };
        };
    };

    _common.isValidNumber = (value, options) => {
        if (value === '')
            return true;
        const decimalNumber = Math.pow(10, options.decimalPlace);
        const valAsInt = numeral().unformat(value);
        const hasCorrectNumberOfDecimalPlaces = Math.floor(valAsInt * decimalNumber) === valAsInt * decimalNumber;
        return !!(!isNaN(parseInt(value, 10)) && hasCorrectNumberOfDecimalPlaces && valAsInt >= options.min && valAsInt <= options.max);
    };

    _common.standardValidate = () => {
        return () => {
            return {
                valid: true,
                msg: null
            };
        };
    };

    _common.hasTextValueChangedInEditor = (editor) => {
        return () => {
            let defaultValue = editor.defaultValue;
            if (defaultValue !== null && defaultValue !== undefined)
                defaultValue = defaultValue.toString();
            const currentValue = editor.getValue();
            return !(currentValue === '' && defaultValue === null) && currentValue != defaultValue;
        };
    };

    _common.ieMaxLengthFix = (textarea) => {
        const len = parseInt(textarea.getAttribute('maxlength'), 10);
        if (textarea.value.length > len) {
            textarea.value = textarea.value.slice(0, len);
            return false;
        }
    };

    _common.standardKeyHandler = (editor) => {
        return (e) => {
            if (e.which == keys.ESCAPE) {
                e.preventDefault();
                editor.cancel();
            } else if (e.which == keys.TAB && e.shiftKey) {
                e.preventDefault();
                editor.grid.navigatePrev();
            } else if (e.which == keys.TAB) {
                e.preventDefault();
                editor.grid.navigateNext();
            } else if (e.which == keys.UP) {
                e.preventDefault();
                editor.grid.navigateUp();
            } else if (e.which == keys.DOWN) {
                e.preventDefault();
                editor.grid.navigateDown();
            }
        };
    };

    _common.applyValue = (editor) => {
        return (item, state) => {
            item[editor.column.field] = state;
        };
    };

    _common.interruptClickHandler = () => {
        return (e) => {
            e.stopPropagation();
        };
    };

    _api.textEditor = function (maxLength) {
        var maxEditLengthOrFunction = maxLength || 999;

        return function (args) {
            var self = this;
            self.grid = args.grid;
            self.column = args.column;
            var $container = $(args.container);

            self.interruptClickHandler = _common.interruptClickHandler();
            self.init = function () {
                var maxEditLength;
                if (typeof maxEditLengthOrFunction === "function")
                    maxEditLength = maxEditLengthOrFunction.call(self, args.item);
                else
                    maxEditLength = maxEditLengthOrFunction;
                self.$editor = $container.markup("textEditor", {maxLength: maxEditLength}).localize()
                    .bind("keydown.nav", function (e) {
                        if (e.which === keys.LEFT || e.which === keys.RIGHT) {
                            e.stopImmediatePropagation();
                        }
                    })
                    .bind("mousedown", self.interruptClickHandler)
                    .focus();
            };
            self.destroy = _common.destroyEditor(self);
            self.focus = _common.focusEditor(self);
            self.getValue = _common.getEditorTextValue(self);
            self.serializeValue = _common.getEditorTextValue(self);
            self.setValue = function (val) {
                self.$editor.val(val);
            };
            self.loadValue = function (item) {
                self.defaultValue = item[self.column.field] || "";
                self.$editor.val(self.defaultValue);
                self.$editor[0].defaultValue = self.defaultValue;
                self.$editor.select();
            };
            self.applyValue = _common.applyValue(self);
            self.save = function () {
                args.commitChanges();
            };
            self.cancel = function () {
                self.$editor.val(self.defaultValue);
                args.cancelChanges();
            };
            self.isValueChanged = _common.hasTextValueChangedInEditor(self);
            self.validate = _common.validateEditorForColumn(self);

            self.init();
        };
    };

    _api.numberEditor = function (options) {
        var numberEditorOptions = {
            min: 0,
            max: 999,
            decimalPlaces: 0
        };
        if (options) {
            numberEditorOptions.min = options.min !== undefined ? options.min : numberEditorOptions.min;
            numberEditorOptions.max = options.max !== undefined ? options.max : numberEditorOptions.max;
            numberEditorOptions.decimalPlaces = options.decimalPlaces !== undefined ? options.decimalPlaces : numberEditorOptions.decimalPlaces;
        }
        numberEditorOptions.maxEditLength = numberEditorOptions.max.toString().length + (numberEditorOptions.decimalPlaces > 0 ? (numberEditorOptions.decimalPlaces + 1) : 0);

        return function (args) {
            var self = this;
            self.grid = args.grid;
            self.column = args.column;
            var $container = $(args.container);

            self.interruptClickHandler = _common.interruptClickHandler();
            self.init = function () {
                self.$editor = $container.markup("textEditor", {maxLength: numberEditorOptions.maxEditLength}).localize()
                    .bind("keydown.nav", function (e) {
                        if (e.which === keys.LEFT || e.which === keys.RIGHT) {
                            e.stopImmediatePropagation();
                        }
                    })
                    .bind("mousedown", self.interruptClickHandler)
                    .focus();
            };
            self.destroy = _common.destroyEditor(self);
            self.focus = _common.focusEditor(self);
            self.getValue = _common.getEditorTextValue(self);
            self.serializeValue = _common.getEditorTextValue(self);
            self.setValue = function (val) {
                self.$editor.val(val);
            };
            self.loadValue = function (item) {
                var valAsInt = parseInt(item[self.column.field], 10);
                self.defaultValue = !isNaN(valAsInt) ? (valAsInt >= numberEditorOptions.min ? valAsInt : "-") : "-";
                self.$editor.val(self.defaultValue);
                self.$editor[0].defaultValue = self.defaultValue;
                self.$editor.select();
            };
            self.applyValue = function (item, state) {
                if (_common.isValidNumber(state, numberEditorOptions)) {
                    item[self.column.field] = state;
                } else {
                    item[self.column.field] = self.defaultValue;
                }
            };
            self.save = function () {
                args.commitChanges();
            };
            self.cancel = function () {
                self.$editor.val(self.defaultValue);
                args.cancelChanges();
            };
            self.isValueChanged = _common.hasTextValueChangedInEditor(self);
            self.validate = _common.validateEditorForColumn(self);

            self.init();
        };
    };

    _api.longTextEditor = function (maxLength, parentSelector) {
        var maxEditLengthOrFunction = maxLength || 999;
        var $container = parentSelector ? $(parentSelector) : $("body");

        return function (args) {
            var self = this;
            self.grid = args.grid;
            self.column = args.column;

            self.interruptClickHandler = _common.interruptClickHandler();
            self.init = function () {
                var maxEditLength;
                if (typeof maxEditLengthOrFunction === "function")
                    maxEditLength = maxEditLengthOrFunction.call(self, args.item);
                else
                    maxEditLength = maxEditLengthOrFunction;
                self.$wrapper = $container.markup("longTextEditor", {maxLength: maxEditLength}).localize()
                    .css("width", self.column.width);
                self.$editor = $("TEXTAREA", self.$wrapper)
                    .bind("keydown", _common.standardKeyHandler(self))
                    .bind("keyup", function () {
                        _common.ieMaxLengthFix(self.$editor[0]);
                    })
                    .bind("mousedown", self.interruptClickHandler);

                self.position(args.position);
                self.$wrapper.focus().select();
            };
            self.save = function () {
                args.commitChanges();
            };
            self.cancel = function () {
                self.$editor.val(self.defaultValue);
                args.cancelChanges();
            };
            self.position = function (position) {
                self.$wrapper
                    .css("top", position.top - 1)
                    .css("left", position.left - 1)
            };
            self.hide = _common.hideEditorWrapper(self);
            self.show = _common.showEditorWrapper(self);
            self.destroy = _common.destroyEditorWrapper(self);
            self.focus = _common.focusEditor(self);
            self.loadValue = function (item) {
                self.defaultValue = item[self.column.field];
                self.$editor.val(self.defaultValue);
                self.$editor.select();
            };
            self.getValue = _common.getEditorTextValue(self);
            self.serializeValue = _common.getEditorTextValue(self);
            self.applyValue = _common.applyValue(self);
            self.isValueChanged = _common.hasTextValueChangedInEditor(self);
            self.validate = _common.validateEditorForColumn(self);

            self.init();
        }
    };

    _api.checkboxEditor = function () {

        return function (args) {
            var self = this;
            self.grid = args.grid;
            self.column = args.column;
            var $container = $(args.container);

            self.init = function () {
                self.$wrapper = $container.markup("checkboxEditor").localize()
                    .click(self.clickHandler.bind(self))
                    .bind("keydown", self.keydownHandler.bind(self));
                self.$editor = $("INPUT", self.$wrapper)
                    .focus();
            };
            self.destroy = _common.destroyEditor(self);
            self.focus = _common.focusEditor(self);
            self.keydownHandler = function (e) {
                if (e.which == keys.SPACE) {
                    e.preventDefault();
                    self.toggleCheckbox();
                }
            };
            self.loadValue = function (item) {
                self.defaultValue = item[self.column.field];
                self.$editor.prop('checked', self.defaultValue);
            };
            self.serializeValue = function () {
                return self.$editor.prop('checked');
            };
            self.applyValue = _common.applyValue(self);
            self.isValueChanged = function () {
                return (self.serializeValue() !== self.defaultValue);
            };
            self.validate = _common.standardValidate();
            self.clickHandler = function (e) {
                e.stopPropagation();
                self.toggleCheckbox();
            };
            self.toggleCheckbox = function () {
                self.$editor.prop('checked', !self.$editor.prop('checked'));
            };

            self.init();
        }
    };

    return _api;
})();
