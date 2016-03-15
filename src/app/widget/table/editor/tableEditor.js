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

    _api.textEditor = (maxLength) => {
        var maxEditLengthOrFunction = maxLength || 999;

        return (args) => {
            this.grid = args.grid;
            this.column = args.column;
            var $container = $(args.container);

            this.interruptClickHandler = _common.interruptClickHandler();
            this.init = () => {
                let maxEditLength;
                if (typeof maxEditLengthOrFunction === 'function')
                    maxEditLength = maxEditLengthOrFunction.call(this, args.item);
                else
                    maxEditLength = maxEditLengthOrFunction;
                this.$editor = $container.markup('textEditor', { maxLength: maxEditLength }).i18n()
                    .bind('keydown.nav', e => {
                        if (e.which === keys.LEFT || e.which === keys.RIGHT) {
                            e.stopImmediatePropagation();
                        }
                    })
                    .bind('mousedown', this.interruptClickHandler)
                    .focus();
            };
            this.destroy = _common.destroyEditor(this);
            this.focus = _common.focusEditor(this);
            this.getValue = _common.getEditorTextValue(this);
            this.serializeValue = _common.getEditorTextValue(this);
            this.setValue = (val) => {
                this.$editor.val(val);
            };
            this.loadValue = (item) => {
                this.defaultValue = item[this.column.field] || '';
                this.$editor.val(this.defaultValue);
                this.$editor[0].defaultValue = this.defaultValue;
                this.$editor.select();
            };
            this.applyValue = _common.applyValue(this);
            this.save = () => {
                args.commitChanges();
            };
            this.cancel = () => {
                this.$editor.val(this.defaultValue);
                args.cancelChanges();
            };
            this.isValueChanged = _common.hasTextValueChangedInEditor(this);
            this.validate = _common.validateEditorForColumn(this);

            this.init();
        };
    };

    _api.numberEditor = (options) => {
        const numberEditorOptions = {
            min: 0,
            max: 999,
            decimalPlace: 0
        };
        if (options) {
            numberEditorOptions.min = options.min !== undefined ? options.min : numberEditorOptions.min;
            numberEditorOptions.max = options.max !== undefined ? options.max : numberEditorOptions.max;
            numberEditorOptions.decimalPlace = options.decimalPlace !== undefined ? options.decimalPlace : numberEditorOptions.decimalPlace;
        }
        numberEditorOptions.maxEditLength = numberEditorOptions.max.toString().length + (numberEditorOptions.decimalPlace > 0 ? (numberEditorOptions.decimalPlace + 1) : 0);

        return (args) => {
            this.grid = args.grid;
            this.column = args.column;
            var $container = $(args.container);

            this.interruptClickHandler = _common.interruptClickHandler();
            this.init = () => {
                this.$editor = $container.markup('textEditor', { maxLength: numberEditorOptions.maxEditLength }).i18n()
                    .bind('keydown.nav', e => {
                        if (e.which === keys.LEFT || e.which === keys.RIGHT) {
                            e.stopImmediatePropagation();
                        }
                    })
                    .bind('mousedown', this.interruptClickHandler)
                    .focus();
            };
            this.destroy = _common.destroyEditor(this);
            this.focus = _common.focusEditor(this);
            this.getValue = _common.getEditorTextValue(this);
            this.serializeValue = _common.getEditorTextValue(this);
            this.setValue = (val) => {
                this.$editor.val(val);
            };
            this.loadValue = (item) => {
                const valAsInt = parseInt(item[this.column.field], 10);
                this.defaultValue = !isNaN(valAsInt) ? valAsInt >= numberEditorOptions.min ? valAsInt : '-' : '-';
                this.$editor.val(this.defaultValue);
                this.$editor[0].defaultValue = this.defaultValue;
                this.$editor.select();
            };
            this.applyValue = (item, state) => {
                if (_common.isValidNumber(state, numberEditorOptions)) {
                    item[this.column.field] = state;
                } else {
                    item[this.column.field] = this.defaultValue;
                }
            };
            this.save = () => {
                args.commitChanges();
            };
            this.cancel = () => {
                this.$editor.val(this.defaultValue);
                args.cancelChanges();
            };
            this.isValueChanged = _common.hasTextValueChangedInEditor(this);
            this.validate = _common.validateEditorForColumn(this);

            this.init();
        };
    };

    _api.longTextEditor = (maxLength, parentSelector) => {
        const maxEditLengthOrFunction = maxLength || 999;
        const $container = parentSelector ? $(parentSelector) : $('body');

        return (args) => {
            this.grid = args.grid;
            this.column = args.column;

            this.interruptClickHandler = _common.interruptClickHandler();
            this.init = () => {
                let maxEditLength;
                if (typeof maxEditLengthOrFunction === 'function')
                    maxEditLength = maxEditLengthOrFunction.call(this, args.item);
                else
                    maxEditLength = maxEditLengthOrFunction;
                this.$wrapper = $container.markup('longTextEditor', { maxLength: maxEditLength }).i18n()
                    .css('width', this.column.width);
                this.$editor = $('TEXTAREA', this.$wrapper)
                    .bind('keydown', _common.standardKeyHandler(this))
                    .bind('keyup', () => {
                        _common.ieMaxLengthFix(this.$editor[0]);
                    })
                    .bind('mousedown', this.interruptClickHandler)
                    .focus()
                    .select();

                this.position(args.position);
            };
            this.save = () => {
                args.commitChanges();
            };
            this.cancel = () => {
                this.$editor.val(this.defaultValue);
                args.cancelChanges();
            };
            this.position = (position) => {
                this.$wrapper
                    .css('top', position.top - 1)
                    .css('left', position.left - 1);
            };
            this.hide = _common.hideEditorWrapper(this);
            this.show = _common.showEditorWrapper(this);
            this.destroy = _common.destroyEditorWrapper(this);
            this.focus = _common.focusEditor(this);
            this.loadValue = (item) => {
                this.defaultValue = item[this.column.field];
                this.$editor.val(this.defaultValue);
                this.$editor.select();
            };
            this.getValue = _common.getEditorTextValue(this);
            this.serializeValue = _common.getEditorTextValue(this);
            this.applyValue = _common.applyValue(this);
            this.isValueChanged = _common.hasTextValueChangedInEditor(this);
            this.validate = _common.validateEditorForColumn(this);

            this.init();
        };
    };

    _api.checkboxEditor = () => {

        return (args) => {
            this.grid = args.grid;
            this.column = args.column;
            const $container = $(args.container);

            this.init = () => {
                this.$wrapper = $container.markup('checkboxEditor').i18n()
                    .click(this.clickHandler.bind(this))
                    .bind('keydown', this.keydownHandler.bind(this));
                this.$editor = $('INPUT', this.$wrapper)
                    .focus();
            };
            this.destroy = _common.destroyEditor(this);
            this.focus = _common.focusEditor(this);
            this.keydownHandler = (e) => {
                if (e.which == keys.SPACE) {
                    e.preventDefault();
                    this.toggleCheckbox();
                }
            };
            this.loadValue = (item) => {
                this.defaultValue = item[this.column.field];
                this.$editor.prop('checked', this.defaultValue);
            };
            this.serializeValue = () => {
                return this.$editor.prop('checked');
            };
            this.applyValue = _common.applyValue(this);
            this.isValueChanged = () => {
                return this.serializeValue() !== this.defaultValue;
            };
            this.validate = _common.standardValidate();
            this.clickHandler = (e) => {
                e.stopPropagation();
                this.toggleCheckbox();
            };
            this.toggleCheckbox = () => {
                this.$editor.prop('checked', !this.$editor.prop('checked'));
            };

            this.init();
        };
    };

    return _api;
})();
