class NumberEditor extends AbstractEditor{
    constructor(args, options) {
        super(args)
        this.numberEditorOptions = {min: 0, max: 999, decimalPlaces: 0}
        if (options) {
            this.numberEditorOptions.min = options.min !== undefined ? options.min : this.numberEditorOptions.min;
            this.numberEditorOptions.max = options.max !== undefined ? options.max : this.numberEditorOptions.max;
            this.numberEditorOptions.decimalPlaces = options.decimalPlaces !== undefined ? options.decimalPlaces : this.numberEditorOptions.decimalPlaces;
        }
        this.numberEditorOptions.maxEditLength = this.numberEditorOptions.max.toString().length + (this.numberEditorOptions.decimalPlaces > 0 ? (this.numberEditorOptions.decimalPlaces + 1) : 0);

        this.init()
    }

    init() {
        this.$editor = this.$container.markup("textEditor", {maxLength: this.numberEditorOptions.maxEditLength}).localize()
            .bind("keydown.nav", (e) => {
                if (e.which === this.keys.LEFT || e.which === this.keys.RIGHT) {
                    e.stopImmediatePropagation();
                }
            })
            .bind("mousedown", this.interruptClickHandler)
            .focus();
    }

    loadValue(item) {
        var valAsInt = parseInt(item[this.column.field], 10);
        this.defaultValue = !isNaN(valAsInt) ? (valAsInt >= this.numberEditorOptions.min ? valAsInt : "-") : "-";
        this.$editor.val(this.defaultValue);
        this.$editor[0].defaultValue = this.defaultValue;
        this.$editor.select();
    }

    applyValue(item, state) {
        if (this.isValidNumber(state, this.numberEditorOptions)) {
            item[this.column.field] = state;
        } else {
            item[this.column.field] = this.defaultValue;
        }
    }
}




