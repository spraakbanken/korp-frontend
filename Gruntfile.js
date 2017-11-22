'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  function getKorpConfigDir() {
      let config = "app";
      try {
          config = grunt.file.readJSON("run_config.json").configDir || ".";
          grunt.log.write("Using \"" + config + "\" as config directory.");
      } catch(err) {
          grunt.log.write("No run_config.json given, using \"app\" as config directory (default).");
      }
      return config;
  }

  grunt.initConfig({
    yeoman: {
      app: require('./bower.json').appPath || 'app',
      dist: 'dist',
      korpConfig: getKorpConfigDir()
    },
    watch: {
      pug : {
        files : ["<%= yeoman.app %>/index.pug", "<%= yeoman.app %>/{includes,views}/*.pug"],
        tasks : ['pug:compile']
      },
      coffee: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
        tasks: ['newer:coffee:dist']
      },
      coffeeTest: {
        files: ['test/karma/spec/{,*/}*.coffee'],
        tasks: ['newer:coffee:test', 'karma']
      },
      sass: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['sass:server', 'autoprefixer']
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
          '{.tmp,<%= yeoman.app %>}/scripts/**/*.js',
          '{.tmp,<%= yeoman.app %>,<%= yeoman.korpConfig %>}/modes/{,*/}*.js',
          '{.tmp,<%= yeoman.app %>,<%= yeoman.korpConfig %>}/config.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },
    protractor: {
      options: {
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
              // Target-specific arguments
          }
        }
      }
    },

    connect: {
      options: {
          port: 9000,
          hostname: '0.0.0.0',
          livereload: 35729,
          base: ["dist"]
      },
      livereload: {
          options: {
            open: false,
            base: [
              '.tmp',
              '<%= yeoman.korpConfig %>',
              '<%= yeoman.app %>'
            ]
          }
      },
      e2e : {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= yeoman.korpConfig %>',
            '<%= yeoman.app %>'
          ]
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
    clean: {
      dist: {
        options : {
          force : true
        },
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>'
          ]
        }]
      },
      server: {
        options : {
          force : true
        },
        files: {
          src: [
          '.tmp',
          "app/scripts/bin",
          "app/index.html",
          "app/styles/styles.css",
          "app/styles/bootstrap.css"
          ]
        }
      },
      e2e: {
        options : {
          force : true
        },
        files: {
          src: [
            'test/e2e/bin'
          ]
        }
      }
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
    coffee: {
      options: {
        sourceMap: true,
        sourceRoot: '..'
      },
      dist: {
          expand: true,
          cwd: '<%= yeoman.app %>/scripts',
          src: ['**/*.coffee'],
          dest: '<%= yeoman.app %>/scripts/bin',
          ext: '.js'
      },
      test: {
        files: [{
          expand: true,
          cwd: 'test/karma/spec',
          src: '*.coffee',
          dest: 'test/karma/bin',
          ext: '.js'
        },
        {
          expand: true,
          cwd: 'test/e2e/spec',
          src: '*.coffee',
          dest: 'test/e2e/bin',
          ext: '.js'
        }]
      }
    },
    sass: {
      options: {
        sourcemap: "none"
      },
      server: {
        files: [{
            expand: true,
            cwd: '<%= yeoman.app %>/styles',
            src: ['*.scss'],
            dest: '<%= yeoman.app %>/styles',
            ext: '.css'
        }]
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
      html: ['<%= yeoman.dist %>/*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= yeoman.dist %>']
      }
    },
    cssmin: {
      options: {
        root: '<%= yeoman.app %>'
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
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: 'scripts.js',
          dest: '.tmp/concat/scripts'
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
        },
        {
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['components/bootstrap-sass-official/assets/fonts/bootstrap/*'],
          dest: '.tmp/fonts/bootstrap',
          flatten: true
        }
        ]
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
          cwd: '<%= yeoman.app %>',
          src: ['components/bootstrap-sass-official/assets/fonts/bootstrap/*'],
          dest: '<%= yeoman.dist %>/fonts/bootstrap',
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
            'translations/*',
            'img/*',
            'img/browsers/*',
            'lib/**/*',
            'styles/**/*.{png,otf,gif}',
            'styles/styles.css',
            "components/font-awesome/fonts/*",
            'components/rickshaw/rickshaw.min.js',
            'lib/jquery.tooltip.pack.js',
            'lib/leaflet-settings.js',
            'components/jquery-ui/themes/smoothness/jquery-ui.min.css',
            'components/geokorp/dist/data/places.json',
            'components/geokorp/dist/data/name_mapping.json',
            'components/leaflet/dist/images/layers.png',
            'components/d3/d3.min.js',
            'components/lodash/dist/lodash.js'
          ]
        },
        {
          expand: true,
          cwd: "<%= yeoman.korpConfig %>",
          dest: "<%= yeoman.dist %>",
          src: [
            "translations/*",
            "modes/*",
            "config.js"
          ]
        },
        {
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['components/jquery-ui/themes/smoothness/images/*'],
          dest: '<%= yeoman.dist %>/images',
          flatten: true
        },
        {
          cwd: '',
          dest: '<%= yeoman.dist %>/',
          src: ['LICENSE']

        }]
      }
    },
    karma: {
      unit: {
        configFile: 'test/karma/karma.conf.js',
        singleRun: true,
        options: {
            files: [
                'app/components/angular/angular.js',
                'app/components/angular-mocks/angular-mocks.js',
                'app/components/lodash/lodash.js',
                'app/components/moment/moment.js',
                'app/scripts/bin/util.js',
                '<%= yeoman.korpConfig %>/config.js',
                '<%= yeoman.korpConfig %>/modes/common.js',
                '<%= yeoman.korpConfig %>/modes/default_mode.js',
                'app/scripts/cqp_parser/CQPParser.js',
                'app/scripts/bin/cqp_parser/cqp.js',
                'test/karma/bin/*.js'
            ]
        }
      }
    },
    pug: {
      compile: {
        options: {
          data: {
            debug: false
          },
          pretty: true

        },
        files: [
          {'<%= yeoman.app %>/index.html': ["<%= yeoman.app %>/index.pug"]},
          {
            expand: true,
            cwd: 'app/views',
            src: '{,*/}*.pug',
            dest: 'app/views',
            ext: '.html'
          }
        ]
      }
    },
    svninfo: {

    },
    'string-replace': {
      dist: {
        files: {
          'dist/korp.yaml': 'korp.yaml'
        },
        options: {
          replacements: [{
            pattern: 'KORP-VERSION',
            replacement: grunt.file.readJSON("package.json").version
          },
          {
            pattern: 'SVN-REVISION',
            replacement: '<%= svninfo.rev %>'
          }]
        }
      }
    }
  });

  grunt.registerTask('release', function(target) {
    grunt.task.run([
     'build',
     'svninfo',
     'string-replace:dist'
    ]);

  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run([
        'connect:dist:keepalive'
      ]);
    }

    grunt.task.run([
      'clean:server',
      'newer:pug',
      'newer:coffee:dist',
      'newer:sass:server',
      'copy:dev',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', function(target) {
    if(target === 'karma') {
      return grunt.task.run([
        'newer:coffee:dist',
        'newer:coffee:test',
        'karma'
      ]);
    } 
      
    grunt.task.run([
        'clean:server',
        "newer:pug",
        'newer:coffee:test',
        'newer:sass',
        'copy:dev',
        'newer:coffee:dist',
        'newer:sass:server',
        'autoprefixer'
    ]);
    
    if(target !== 'e2e') {
      grunt.task.run([
        'karma'
      ]);
    } 
    
    grunt.task.run([
      'connect:e2e',
      'protractor',
      'clean:e2e'
    ]);
    
  });

  grunt.registerTask('build', [
    'clean:dist',
    "newer:pug",
    'useminPrepare',
    'newer:coffee:dist',
    'newer:sass:server',
    'autoprefixer',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('default', ['build']);

};
