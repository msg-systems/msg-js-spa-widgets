module.exports = function (grunt) {

    /* app specific actions and tasks */
    grunt.extendConfig({
        placeholder: {
            "code": {"files": [{cwd: "src/app/", src: "**/*.js", dest: "tmp/app"}]},
            "html": {"files": [{cwd: "src/app/", src: "**/*.html", dest: "tmp/app"}]},
            "less": {"files": [{cwd: "src/app/", src: "**/*.less", dest: "tmp/app"}]}
        },
        babel: {
            "code": {
                options: {
                    sourceMap: false,
                    "plugins": [
                        "transform-es2015-arrow-functions",
                        "transform-es2015-block-scoped-functions",
                        "transform-es2015-block-scoping",
                        "transform-es2015-classes",
                        "transform-es2015-computed-properties",
                        "check-es2015-constants",
                        "transform-es2015-destructuring",
                        "transform-es2015-for-of",
                        "transform-es2015-function-name",
                        "transform-es2015-literals",
                        "transform-es2015-object-super",
                        "transform-es2015-parameters",
                        "transform-es2015-shorthand-properties",
                        "transform-es2015-spread",
                        "transform-es2015-sticky-regex",
                        "transform-es2015-template-literals",
                        "transform-es2015-typeof-symbol",
                        "transform-es2015-unicode-regex",
                        "transform-regenerator"
                    ]
                },
                files: [{expand: true, cwd: 'tmp/app/', src: ['**/*.js'], dest: 'dist/app/'}]
            }
        },
        less: {
            style: {
                files: [
                    {
                        expand: true,
                        cwd: "tmp/app/",
                        src: ["**/*.less"],
                        dest: "dist/app/",
                        ext: ".css"
                    }
                ],
                options: {
                    paths: ["tmp/app"]
                }
            },
            options: {
                cleancss: true,
                ieCompat: true,
                report: "none"
            }
        },
        copy: {
            html: {
                files: [
                    {
                        expand: true,
                        cwd: "tmp/app/",
                        src: ["**/*.html"],
                        dest: "dist/app/"
                    }
                ]
            }
        }
    });

    grunt.registerTask("widgets-code", ["placeholder:code", "babel:code"]);
    grunt.registerTask("widgets-style", ["placeholder:less", "less:style"]);
    grunt.registerTask("widgets-markup", ["placeholder:html", "copy:html"]);

    grunt.registerTask("build-widgets", ["widgets-code", "widgets-style", "widgets-markup"]);

};
