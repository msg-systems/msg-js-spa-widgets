class CheckboxEditor extends AbstractEditor {
    constructor(args) {
        super(args)
        this.init()
    }

    toggleCheckbox() {
        this.$editor.prop('checked', !this.$editor.prop('checked'));
    }

    clickHandler(e) {
        e.stopPropagation();
        this.toggleCheckbox();
    }

    keydownHandler(e) {
        if (e.which == keys.SPACE) {
            e.preventDefault();
            this.toggleCheckbox();
        }
    }

    init() {
        this.$wrapper = this.$container.markup("checkboxEditor").localize()
            .click(this.clickHandler.bind(this))
            .bind("keydown", this.keydownHandler.bind(this));
        this.$editor = $("INPUT", this.$wrapper)
            .focus();
    }

    loadValue(item) {
        this.defaultValue = item[this.column.field];
        this.$editor.prop('checked', this.defaultValue);
    }

    serializeValue() {
        return this.$editor.prop('checked');
    }

    isValueChanged() {
        return (this.serializeValue() !== this.defaultValue);
    }

    validate() {
        return this.standardValidate()
    }
}




