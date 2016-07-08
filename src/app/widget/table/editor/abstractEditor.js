class AbstractEditor {
    constructor(args) {
        this.keys = $.ui.keyCode;
        this.grid = args.grid
        this.column = args.column
        this.args = args
        this.$container = $(args.container)
    }

    static interruptClickHandler() {
        return (e) => {
            e.stopPropagation()
        }
    }

    init() {
        throw "Please overwrite the method 'init' of the concrete table editor: " + this
    }

    destroy() {
        this.$editor.remove()
    }

    focus() {
        this.$editor.focus()
    }

    getValue() {
        return this.$editor.val()
    }

    serializeValue() {
        return this.$editor.val()
    }

    setValue(val) {
        this.$editor.val(val);
    }

    loadValue(item) {
        throw "Please overwrite the method 'loadValue' of the concrete table editor: " + this
    }

    applyValue(item, state) {
        item[this.column.field] = state;
    }

    save() {
        this.args.commitChanges();
    }

    cancel() {
        this.$editor.val(this.defaultValue);
        this.args.cancelChanges();
    }

    isValueChanged() {
        let defaultValue = this.defaultValue;
        if (defaultValue !== null && defaultValue !== undefined)
            defaultValue = defaultValue.toString();
        const currentValue = this.getValue();
        return !(currentValue === '' && defaultValue === null) && currentValue != defaultValue;
    }

    validate() {
        if (this.column.validator) {
            const validationResults = this.column.validator(this.getValue());
            if (!validationResults.valid) {
                return validationResults;
            }
        }
        return {
            valid: true,
            msg: null
        };
    }

    standardValidate() {
        return {
            valid: true,
            msg: null
        }
    }

    isValidNumber(value, options) {
        if (value === '')
            return true;
        const decimalNumber = Math.pow(10, options.decimalPlaces);
        const valAsInt = numeral().unformat(value);
        const hasCorrectNumberOfDecimalPlaces = Math.floor(valAsInt * decimalNumber) === valAsInt * decimalNumber;
        return !!(!isNaN(parseInt(value, 10)) && hasCorrectNumberOfDecimalPlaces && valAsInt >= options.min && valAsInt <= options.max);
    }

}




