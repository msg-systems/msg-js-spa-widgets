if (typeof app.fw.abstract.view === "undefined") {
    throw "This is a abstract component for a table. It needs to extend from the component app.fw.abstract" +
    "from the msg-js-spa-framework. So the view from the component app.fw.abstract is required to be loaded"
}

ComponentJS.ns("___config.package___");
___config.package___.view = ComponentJS.clazz({
    extend: app.fw.abstract.view,
    dynamics: {
        table: null
    },
    protos: {

        render () {
            ComponentJS(this).socket({scope: "table", ctx: this.table, spool: ComponentJS(this).state()});
        },

        prepareMaskReferences () {
            this.base();
            this.table = this.ui;
        }

    }
});