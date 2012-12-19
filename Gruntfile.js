module.exports = function( grunt ) {
    'use strict';
    //
    // Grunt configuration:
    //
    // https://github.com/cowboy/grunt/blob/master/docs/getting_started.md
    //
    grunt.initConfig({

        // Project configuration
        // ---------------------

//    pkg: '<json:package.json>',
//    meta: {
//        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
//          '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
//          '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
//          '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
//          ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
//      },


        // specify an alternate install location for Bower
        bower: {
            dir: 'app/components'
        },

        // Coffee to JS compilation
        coffee: {
            compile: {
                files: {
                    'app/*.js': 'app/*.coffee',
                    'app/scripts/bin/*.js': 'app/scripts/**/*.coffee',
                    'test/spec/*.js': 'test/spec/**/*.coffee'
                }
            }
        },

        // compile .scss/.sass to .css using Compass
        compass: {
            dist: {
                // http://compass-style.org/help/tutorials/configuration-reference/#configuration-properties
                options: {
                    css_dir: 'app/styles',
                    sass_dir: 'app/styles',
                    images_dir: 'app/images',
                    javascripts_dir: 'temp/scripts',
                    force: true
                }
            }
        },

        // generate application cache manifest
//    manifest:{
//      dest: ''
//    },

        // default watch configuration
        watch: {
            coffee: {
                files: ['app/*.coffee','app/scripts/**/*.coffee'],
                tasks: 'coffee reload'
            },
            compass: {
                files: [
                    'app/styles/**/*.{scss,sass}'
                ],
                tasks: 'compass reload'
            }
        },

        reload: {
            files: [
                // 'app/**/*.{html|css|js}',
                'app/**/*.html',
                'app/styles/**/*.css',
                'app/scripts/**/*.js',
                'app/images/**/*'
            ],
            tasks: 'reload'
        },

        // default lint configuration, change this to match your setup:
        // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md#lint-built-in-task
//    lint: {
//      files: [
//        'Gruntfile.js',
//        'app/scripts/**/*.js',
//        'spec/**/*.js'
//      ]
//    },

     // concat : {
            // files : {'dist/build.js' : 'app/scripts/*.js'},
            // separator : ";"
     // },
//    min: {
//        dist: {
//          src: ['dist/build.js'],
//          dest: 'dist/korp.min.js'
//        }
//      },

        // specifying JSHint options and globals
        // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md#specifying-jshint-options-and-globals
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true
            },
            globals: {
//        angular: true
            }
        },

        // Build configuration
        // -------------------

        // the staging directory used during the process
        staging: 'temp',
        // final build output
        output: 'dist',

        mkdirs: {
            staging: 'app/'
        },

        // Below, all paths are relative to the staging directory, which is a copy
        // of the app/ directory. Any .gitignore, .ignore and .buildignore file
        // that might appear in the app/ tree are used to ignore these values
        // during the copy process.

        // concat css/**/*.css files, inline @import, output a single minified css
        // css: {
        //     'styles/main.css': ['styles/**/*.css']
        // },

        // renames JS/CSS to prepend a hash of their contents for easier
        // versioning
        rev: {
            js: 'scripts/**/*.js',
            css: 'styles/**/*.css',
            // img: ['images/*', 'components/jquery-ui/themes/base/images/*']
            img: {
                files : {'styles/*' : 'components/jquery-ui/themes/base/images/*'},
            }
        },

        // usemin handler should point to the file containing
        // the usemin blocks to be parsed
        'usemin-handler': {
            html: 'index.html'
        },

        // update references in HTML/CSS to revved files
        usemin: {
            html: ['index.html'],
            // css: ['**/*.css']
            css : ["styles/*.css"]
        },

        // HTML minification
        html: {
            files: ['**/*.html']
        },

        // Optimizes JPGs and PNGs (with jpegtran & optipng)
        img: {
            // dist: {
            //     src: 'components/jquery-ui/themes/base/images/*',
            //     dest : "styles/images/*"
            // }
            dist: 'styles/images'
        },
    });

    // Alias the `test` task to run `testacular` instead
    grunt.registerTask('test', 'run the testacular test driver', function () {
        var done = this.async();
        require('child_process').exec('testacular start --single-run', function (err, stdout) {
            grunt.log.write(stdout);
            done(err);
        });
    });
};
