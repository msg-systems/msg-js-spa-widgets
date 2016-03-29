if (typeof app.fw.abstract.model === "undefined") {
    throw "This is a abstract component for a table. It needs to extend from the component app.fw.abstract" +
    "from the msg-js-spa-framework. So the model from the component app.fw.abstract is required to be loaded"
}

ComponentJS.ns("___config.package___");
___config.package___.model = ComponentJS.clazz({
    extend: app.fw.abstract.model,
    dynamics: {
        options: null,
        columns: null
    },
    protos: {

        create () {
            this.initializeOptions();
            ComponentJS(this).model({
                "data:tableOptions": {value: this.options, valid: "{@?:any}"},
                "data:tableColumns": {value: [], valid: "[object*]"},
                "data:allAvailableColumns": {value: [], valid: "[object*]"},
                "data:sortObject": {value: null, valid: "object"},
                "data:filterValue": {value: "", valid: "string"},
                "data:activeCellsPresentationEntry": {value: {}, valid: "object"},
                "data:selectedTableEntriesFromTable": {value: [], valid: "[object*]"},
                "data:selectedTableEntriesFromOutside": {value: [], valid: "[object*]"}
            })
        },

        render () {
            this.initializeColumns();
            ComponentJS(this).value("data:tableColumns", this.columns);
            ComponentJS(this).value("data:allAvailableColumns", this.columns);
        },

        initializeOptions () {
            this.options = {
                multiSelect: false,
                rowHeight: 27,
                enableColumnReorder: false,
                forceFitColumns: true,
                editable: false,
                activateSelectPlugIn: false,
                activateRowSelectionModel: true
            };
        },

        initializeColumns () {
            this.columns = []
        }

    }
});