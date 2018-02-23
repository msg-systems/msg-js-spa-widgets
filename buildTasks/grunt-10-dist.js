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
                    "presets": [
                        "env"
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
