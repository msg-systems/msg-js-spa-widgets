module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json")
    });

    /*  load all grunt tasks defined in package.json */
    require("load-grunt-tasks")(grunt, {pattern: ["grunt-*"]});

    grunt.loadTasks("buildTasks");

    /*  register all project specific tasks */
    grunt.registerTask("default", ["clean:clean", "build-widgets"]);

};