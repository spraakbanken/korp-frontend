'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // configurable paths
  var yeomanConfig = {
    app: 'app',
    dist: 'dist'
  };

  try {
    yeomanConfig.app = require('./component.json').appPath || yeomanConfig.app;
  } catch (e) {}

  grunt.initConfig({
    yeoman: yeomanConfig,
    watch: {
      jade : {
        files : ["<%= yeoman.app %>/index.jade", "<%= yeoman.app %>/{includes,views}/*.jade", ],
        tasks : ['jade:compile']
      },
      coffee: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
        tasks: ['coffee:dist']
      },
      coffeeTest: {
        files: ['test/spec/{,*/}*.coffee'],
        tasks: ['coffee:test']
      },
      compass: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass']
      },
      livereload: {
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
          '{.tmp,<%= yeoman.app %>}/modes/{,*/}*.js',
          '{.tmp,<%= yeoman.app %>}/config.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ],
        tasks: ['livereload']
      }
    },
    connect: {
        options: {
            port: 9000,
            // change this to '0.0.0.0' to access the server from outside
            hostname: '0.0.0.0'
        },
        livereload: {
            options: {
                middleware: function (connect) {
                    return [
                        lrSnippet,
                        // proxySnippet,
                        mountFolder(connect, '.tmp'),
                        mountFolder(connect, yeomanConfig.app),
                    ];
                }
            }
        },
        test: {
            options: {
                middleware: function (connect) {
                    return [
                        mountFolder(connect, '.tmp'),
                        mountFolder(connect, 'test')
                    ];
                }
            }
        },
        dist: {
            options: {
                middleware: function (connect) {
                    return [
                        mountFolder(connect, 'dist')
                    ];
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
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>',
            // '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
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
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
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
          src: '{,*/}*.coffee',
          dest: 'test/spec',
          ext: '.js'
        }]
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
        files: [{'<%= yeoman.app %>/index.html': ["<%= yeoman.app %>/index.jade"]},
              {
                expand: true,
                cwd: 'app/views',
                src: '{,*/}*.jade',
                dest: 'app/views',
                ext: '.html'
              }
          ]
      }
    },

    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/styles',
        cssDir: ['.tmp/styles', '<%= yeoman.app %>/styles'],
        imagesDir: '<%= yeoman.app %>/images',
        javascriptsDir: '<%= yeoman.app %>/scripts',
        fontsDir: ['<%= yeoman.app %>/styles/fonts', "<%= yeoman.app %>/components/font-awesome/fonts"],
        importPath: '<%= yeoman.app %>/components',
        relativeAssets: true
      },
      dist: {},
      server: {
        options: {
          debugInfo: true
        }
      }
    },
    concat: {
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/scripts.js': [
            '.tmp/scripts/{,*/}*.js',
            '<%= yeoman.app %>/scripts/{,*/}*.js'
          ]
        }
      }
    },
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },
    usemin: {
      // html: ['<%= yeoman.dist %>/{,*/}*.html'],
      html: ['<%= yeoman.dist %>/*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= yeoman.dist %>']
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    cssmin: {
      // dist: {
      //   files: {
      //     '<%= yeoman.dist %>/styles/main.css': [
      //       '.tmp/styles/{,*/}*.css',
      //       '<%= yeoman.app %>/styles/{,*/}*.css'
      //     ]
      //   }
      // }
    },
    htmlmin: {
      dist: {
        options: {
          /*removeCommentsFromCDATA: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          //collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true*/
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['*.html', 'views/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>/scripts',
          src: '*.js',
          dest: '<%= yeoman.dist %>/scripts'
        }]
      }
    },
    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/scripts.js': [
            '<%= yeoman.dist %>/scripts/scripts.js'
          ],
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
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },

    copy: {
      dev : {
        files: [
        {
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['components/font-awesome/fonts/*'],
          dest: '.tmp/fonts',
          flatten: true
        }]

      },
      dist: {
        files: [
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
            '*.{ico,txt,js,xml}',
            '.htaccess',
            'components/**/*',
            'translations/*.json',
            'markup/*',
            'modes/*',
            'img/*',
            'lib/**/*',
            'styles/**/*.{png,otf,gif}',
            'scripts/jq_extensions.js',
            'scripts/bin/controllers/controllers.js',
          ]
        }]
      }
    }
  });

  grunt.renameTask('regarde', 'watch');

  grunt.registerTask('server', function (target) {
      if (target === 'dist') {
          return grunt.task.run(['connect:dist:keepalive']);
      }

      grunt.task.run([
          'clean:server',
          'coffee:dist',
          'jade',
          'compass:server',
          'copy:dev',
          'livereload-start',
          'connect:livereload',
          // 'open',

          'watch'
      ]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'coffee',
    'compass',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    // 'jshint',
    'test',
    'coffee',
    "jade",
    'compass:dist',
    'useminPrepare',
    // 'imagemin',
    'htmlmin',
    'concat',
    'copy',
    // 'cdnify',
    'ngmin',
    'uglify',
    'rev',
    'usemin',
  ]);

  grunt.registerTask('default', ['build']);
};
