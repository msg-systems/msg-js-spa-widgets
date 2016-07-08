class TextEditor extends AbstractEditor {
    constructor(args, maxLength) {
        super(args)
        this._maxEditLengthOrFunction = maxLength || 999
        this.init()
    }

    init() {
        let maxEditLength;
        if (typeof this._maxEditLengthOrFunction === "function")
            maxEditLength = this._maxEditLengthOrFunction.call(this, this._args.item);
        else
            maxEditLength = this._maxEditLengthOrFunction;
        this.$editor = this.$container.markup("textEditor", {maxLength: maxEditLength}).localize()
            .bind("keydown.nav", (e) => {
                if (e.which === this.keys.LEFT || e.which === this.keys.RIGHT) {
                    e.stopImmediatePropagation();
                }
            })
            .bind("mousedown", TextEditor.interruptClickHandler)
            .focus();
    }

    loadValue(item) {
        this.defaultValue = item[this.column.field] || "";
        this.$editor.val(this.defaultValue);
        this.$editor[0].defaultValue = this.defaultValue;
        this.$editor.select();
    }
}




