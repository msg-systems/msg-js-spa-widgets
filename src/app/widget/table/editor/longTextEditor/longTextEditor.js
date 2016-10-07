class LongTextEditor extends AbstractEditor {
    constructor(args, maxLength, parentSelector) {
        super(args)
        this._maxEditLengthOrFunction = maxLength || 999
        // overwrite from AbstractEditor:
        this.$container = parentSelector ? $(parentSelector) : $("body");
        this.init()
    }

    standardKeyHandler(e) {
        if (e.which == this.keys.ESCAPE) {
            e.preventDefault();
            this.cancel();
        } else if (e.which == this.keys.TAB && e.shiftKey) {
            e.preventDefault();
            this.grid.navigatePrev();
        } else if (e.which == this.keys.TAB) {
            e.preventDefault();
            this.grid.navigateNext();
        } else if (e.which == this.keys.UP) {
            e.preventDefault();
            this.grid.navigateUp();
        } else if (e.which == this.keys.DOWN) {
            e.preventDefault();
            this.grid.navigateDown();
        }
    }

    ieMaxLengthFix() {
        const textarea = this.$editor[0]
        const len = parseInt(textarea.getAttribute('maxlength'), 10);
        if (textarea.value.length > len) {
            textarea.value = textarea.value.slice(0, len);
            return false;
        }
    }

    position() {
        const position = this.args.position
        this.$wrapper
            .css("top", position.top - 1)
            .css("left", position.left - 1)
    }

    init() {
        var maxEditLength;
        if (typeof this._maxEditLengthOrFunction === "function")
            maxEditLength = this._maxEditLengthOrFunction.call(this, this.args.item);
        else
            maxEditLength = this._maxEditLengthOrFunction;
        this.$wrapper = this.$container.markup("longTextEditor", {maxLength: maxEditLength}).localize()
            .css("width", this.column.width);
        this.$editor = $("TEXTAREA", this.$wrapper)
            .bind("keydown", this.standardKeyHandler.bind(this))
            .bind("keyup", this.ieMaxLengthFix.bind(this))
            .bind("mousedown", this.interruptClickHandler);

        this.position();
        this.$wrapper.focus().select();
    }

    loadValue(item) {
        this.defaultValue = item[this.column.field];
        this.$editor.val(this.defaultValue);
        this.$editor.select();
    }

    hide() {
        this.$wrapper.hide()
    }

    show() {
        this.$wrapper.show()
    }

    destroy() {
        this.$wrapper.remove()
    }
}




