'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    geokorp: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      coffee: {
        files: ['<%= geokorp.app %>/scripts/{,*/}*.{coffee,litcoffee,coffee.md}'],
        tasks: ['newer:coffee:dist']
      },
      coffeeTest: {
        files: ['test/spec/{,*/}*.{coffee,litcoffee,coffee.md}'],
        tasks: ['newer:coffee:test', 'karma']
      },
      compass: {
        files: ['<%= geokorp.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost'
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= geokorp.dist %>'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      server: {
        options: {
          map: true,
        },
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      test: {
        devDependencies: true,
        src: '<%= karma.unit.configFile %>',
        ignorePath:  /\.\.\//,
        fileTypes:{
          coffee: {
            block: /(([\s\t]*)#\s*?bower:\s*?(\S*))(\n|\r|.)*?(#\s*endbower)/gi,
              detect: {
                js: /'(.*\.js)'/gi,
                coffee: /'(.*\.coffee)'/gi
              },
            replace: {
              js: '\'{{filePath}}\'',
              coffee: '\'{{filePath}}\''
            }
          }
          }
      },
      sass: {
        src: ['<%= geokorp.app %>/styles/{,*/}*.{scss,sass}'],
        ignorePath: /(\.\.\/){1,2}bower_components\//
      }
    },

    // Compiles CoffeeScript to JavaScript
    coffee: {
      options: {
        sourceMap: true,
        sourceRoot: ''
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= geokorp.app %>/scripts',
          src: '{,*/}*.coffee',
          dest: '.tmp/scripts',
          ext: '.js'
        }]
      },
      test: {
        files: [{
          expand: true,
          cwd: 'test/spec',
          src: '{,*/}*.coffee',
          dest: '.tmp/spec',
          ext: '.js'
        }]
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: '<%= geokorp.app %>/styles',
        cssDir: '<%= geokorp.dist %>/styles',
        generatedImagesDir: '<%= geokorp.dist %>/images/generated',
        imagesDir: '<%= geokorp.app %>/images',
        javascriptsDir: '<%= geokorp.app %>/scripts',
        fontsDir: '<%= geokorp.app %>/styles/fonts',
        importPath: './bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        options: {
          generatedImagesDir: '<%= geokorp.dist %>/images/generated'
        }
      },
      server: {
        options: {
          // sourcemap: true
        }
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= geokorp.app %>',
          dest: '<%= geokorp.dist %>',
          src: [
            'templates/{,*/}*.*',
            'data/places.json',
            'data/name_mapping.json'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= geokorp.dist %>/images',
          src: ['generated/*']
        }, {
          expand: true,
          cwd: '.tmp',
          src: 'scripts/sb_map.js',
          dest: '<%= geokorp.dist %>',
          rename: function(dest,src) {
            return dest + "/scripts/geokorp.js";
          }
        }, {
          expand: true,
          cwd: '.tmp',
          src: 'scripts/geokorp-templates.js',
          dest: '<%= geokorp.dist %>'
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= geokorp.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'coffee:dist',
        'compass:server'
      ],
      test: [
        'coffee',
        'compass'
      ],
      dist: [
        'coffee',
        'compass:dist'
      ]
    },
    html2js: {
      options: {
        base: 'app',
        module: 'sbMapTemplate'
      },
      main: {
        src: ['app/template/*.html'],
        dest: '.tmp/scripts/geokorp-templates.js'
      },
    },
    concat: {
      dist: {
        src: ['.tmp/scripts/*.js'],
        dest: '.tmp/geokorp.js',
      },
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'test/karma.conf.coffee',
        singleRun: true
      }
    }
  });

  grunt.registerTask('test', [
    'clean:server',
    'wiredep',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'concurrent:dist',
    'autoprefixer',
    'html2js',
    'concat',
    'copy:dist',
    'clean:server',
  ]);

  grunt.registerTask('default', [
    // no tests available yet
    //'test',
    'build'
  ]);
};
