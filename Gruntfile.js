'use strict';
// var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // load all grunt tasks
  // require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  require('load-grunt-tasks')(grunt);

  require('time-grunt')(grunt);

  // // configurable paths
  var yeomanConfig = {
    app: 'app',
    dist: 'dist'
  };

  // try {
  //   yeomanConfig.app = require('./component.json').appPath || yeomanConfig.app;
  // } catch (e) {}

  grunt.initConfig({
    // yeoman: yeomanConfig,
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist'
    },
    watch: {
      //bower: {
      //  files: ['bower.json'],
      //  tasks: ['bowerInstall']
      //},
      jade : {
        files : ["<%= yeoman.app %>/index.jade", "<%= yeoman.app %>/{includes,views}/*.jade"],
        tasks : ['jade:compile']
      },
      coffee: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
        tasks: ['newer:coffee:dist']
      },
      coffeeTest: {
        files: ['test/spec/{,*/}*.coffee'],
        tasks: ['newer:coffee:test', 'karma']
      },
      compass: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
          '{.tmp,<%= yeoman.app %>}/modes/{,*/}*.js',
          '{.tmp,<%= yeoman.app %>}/config.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
        // tasks: ['livereload']
      }
    },
    protractor: {
      options: {
        configFile: "protractor.conf", // Default config file
        keepAlive: false, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        chromeOnly : true,
        args: {
          // Arguments passed to the command
        }
      },
      test: {
        options: {
          configFile: "test/e2e/conf_e2e.js", // Target-specific config file
          args: {
            // rootElement: 'div'
          } // Target-specific arguments
        }
      }
    },

    protractor_webdriver: {
      test : {
        options: {
            path: 'node_modules/protractor/bin/',
            command: './webdriver-manager start',
          },
      }
    },

    connect: {
      options: {
          port: 9000,
          // change this to '0.0.0.0' to access the server from outside
          hostname: '0.0.0.0',
          livereload: 35729,
          base: [
          //   '.tmp',
            // 'test',
          //   '<%= yeoman.app %>'
          "dist"
          ]
      },
      livereload: {
          options: {
            open: false,
            base: [
              '.tmp',
              '<%= yeoman.app %>'
            ]
          }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= yeoman.app %>'
          ]
        }
      },
      e2e : {
        options: {
          middleware: function (connect) {
            return [
              // proxySnippet, 
              mountFolder(connect, '.tmp'),
              mountFolder(connect, yeomanConfig.app)
            ];
          }
        }
      },
      dist: {
        dist: {
          options: {
            base: '<%= yeoman.dist %>'
          }
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= connect.livereload.options.port %>'
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ]
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>'
            // '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'app/styles/',
          src: '{,*/}*.css',
          dest: 'app/styles/'
        }]
      }
    },
    // Automatically inject Bower components into the app
    bowerInstall: {
      app: {
        src: ['<%= yeoman.app %>/index.html'],
        ignorePath: '<%= yeoman.app %>/'
      },
      sass: {
        src: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        ignorePath: '<%= yeoman.app %>/components/'
      }
    },
    coffee: {
      options: {
        sourceMap: true,
        sourceRoot: '..'
      },
      dist: {
          expand: true,
          cwd: '<%= yeoman.app %>/scripts',
          src: ['**/*.coffee'],
          // dest: '.tmp/scripts',
          dest: '<%= yeoman.app %>/scripts/bin',
          ext: '.js'
      },
      test: {
        files: [{
          expand: true,
          cwd: 'test/spec',
          src: '*.coffee',
          dest: 'test/spec',
          ext: '.js'
        },
        {
          expand: true,
          cwd: 'test/e2e',
          src: '*.coffee',
          dest: 'test/e2e',
          ext: '.js'
        }]
      }
    },
    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/styles',
        cssDir: ['.tmp/styles', '<%= yeoman.app %>/styles'],
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= yeoman.app %>/images',
        javascriptsDir: '<%= yeoman.app %>/scripts',
        fontsDir: ['<%= yeoman.app %>/styles/fonts','<%= yeoman.app %>/styles/fonts', "<%= yeoman.app %>/components/font-awesome/fonts"],
        importPath: '<%= yeoman.app %>/components',
        httpImagesPath: 'images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: 'styles/fonts',
        relativeAssets: true,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        options: {
          generatedImagesDir: '<%= yeoman.dist %>/images/generated'
        }
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
            '<%= yeoman.dist %>/styles/fonts/*',
            '!<%= yeoman.dist %>/scripts/statistics_worker.js'
          ]
        }
      }
    },
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },
    usemin: {
      // html: ['<%= yeoman.dist %>/{,*/}*.html'],
      html: ['<%= yeoman.dist %>/*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= yeoman.dist %>'],

        // assetsDirs: ['<%= yeoman.dist %>/styles', '<%= yeoman.dist %>/styles/fonts', '"<%= yeoman.dist %>/components/font-awesome/fonts"' ],
        // assetsDirs: ['<%= yeoman.dist %>/styles'],
      }
    },
    cssmin: {
      options: {
        root: '<%= yeoman.app %>'
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['views/{,*/}*.html', 'markup/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: 'scripts.js',
          dest: '.tmp/concat/scripts'
          // expand: true,
          // cwd: '<%= yeoman.dist %>/scripts',
          // src: '*.js',
          // dest: '<%= yeoman.dist %>/scripts'
        }]
      }
    },
    copy: {
      dev : {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['components/font-awesome/fonts/*'],
          dest: '.tmp/fonts',
          flatten: true
        },
        {
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['components/jquery-ui/themes/smoothness/images/*'],
          dest: '.tmp/images',
          flatten: true
        }]
      },
      dist: {
        files: [
        {'<%= yeoman.dist %>/index.html': "<%= yeoman.app %>/index.html" },
        {
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['components/font-awesome/fonts/*'],
          dest: '<%= yeoman.dist %>/fonts',
          flatten: true
        },
        {
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            'scripts/statistics_worker.js',
            '*.{ico,txt,js,xml}',
            '.htaccess',
            'components/jquery-ui/themes/smoothness/images/*',
            'components/SlickGrid/images/*',
            'translations/*.json',
            // 'markup/*',
            'modes/*',
            'img/*',
            'lib/**/*',
            'styles/**/*.{png,otf,gif}',
            'styles/styles.css',
            "components/font-awesome/fonts/*",
            'components/d3/d3.min.js',
            'components/rickshaw/rickshaw.min.js',
            'lib/jquery.tooltip.pack.js',
            'components/jquery-ui/themes/smoothness/jquery-ui.min.css'
          ]
        },
        {
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['components/jquery-ui/themes/smoothness/images/*'],
          dest: '<%= yeoman.dist %>/images',
          flatten: true
        }]
      } // removed from 0.8, not sure if we need
      // styles: {
      //   expand: true,
      //   cwd: '<%= yeoman.app %>/styles',
      //   dest: '.tmp/styles/',
      //   src: '{,*/}*.css'
      // }
    },
    concurrent: {
      server: [
        'newer:coffee:dist',
        'compass:server'
      ],
      test: [
        'newer:coffee',
        'newer:compass'
      ],
      dist: [
        'coffee',
        'compass:dist',
        'imagemin',
        'svgmin'
      ]
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    jade: {
      compile: {
        options: {
          data: {
            debug: false
          },
          pretty: true

        },
        files: [
          {'<%= yeoman.app %>/index.html': ["<%= yeoman.app %>/index.jade"]},
          {
            expand: true,
            cwd: 'app/views',
            src: '{,*/}*.jade',
            dest: 'app/views',
            ext: '.html'
          }
        ]
      }
    }
  });

  // grunt.renameTask('regarde', 'watch');

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run([
        // 'build', 
        'connect:dist:keepalive'
      ]);
    }

    grunt.task.run([
      'clean:server',
      //'bowerInstall',
      'jade',
      'concurrent:server',
      'copy:dev',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  // grunt.registerTask('test', [
  //   'clean:server',
  //   'concurrent:test',
  //   'autoprefixer',
  //   'connect:test',
  //   'karma'
  // ]);

  grunt.registerTask('test', [
    'clean:server',
    // 'configureProxies',
    'concurrent:test',
    'concurrent:server',
    'autoprefixer',
    // 'connect:test',
    // 'karma'
    
    'connect:e2e',
    "protractor_webdriver",
    'protractor'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    // 'bowerInstall',
    "jade",
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngmin',
    'copy:dist',
    // 'cdnify',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    // 'newer:jshint',
    'test',
    'build'
  ]);

  grunt.registerTask('default', ['build']);
};
