module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    compass: {
      // Production
      dist: {
        options: {
          banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                  '*   <%= pkg.homepage %>\n' +
                  '*   Copyright (c) <%= grunt.template.today("yyyy") %> Environmental Systems Research Institute, Inc.\n' +
                  '*   Apache 2.0 License */',
          sassDir: 'lib/stylesheets',
          specify: 'lib/stylesheets/tailcoat.scss',
          cssDir: 'dist/tailcoat/stylesheets/',
          imagesDir: 'dist/tailcoat/images/',
          fontsDir: 'dist/tailcoat/fonts/',
          relativeAssets: true,
          environment: 'production',
          outputStyle: 'expanded',
          noLineComments: true
        }
      },
      // Minified
      distmin: {
        options: {
          banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                  '*   <%= pkg.homepage %>\n' +
                  '*   Copyright (c) <%= grunt.template.today("yyyy") %> Environmental Systems Research Institute, Inc.\n' +
                  '*   Apache 2.0 License */',
          sassDir: 'lib/stylesheets',
          specify: 'lib/stylesheets/tailcoat.scss',
          cssDir: 'dist/tailcoat/stylesheets/',
          imagesDir: 'dist/tailcoat/images/',
          fontsDir: 'dist/tailcoat/fonts/',
          environment: 'production',
          outputStyle: 'compressed',
          noLineComments: true
        }
      },
      options: {
        raw: ' ' // hack to force compass to ignore the config.rb file at root
      }
    },

    copy: {
      dist: {
        src: 'lib/javascripts/tailcoat.js',
        dest: 'dist/tailcoat/javascripts/tailcoat.js'
      },
      'docs-js': {
        src: 'lib/javascripts/tailcoat.js',
        dest: 'docs/source/assets/javascripts/tailcoat.js'
      },
      'docs-images': {
        cwd: 'dist/tailcoat/images/',
        src: '**',
        dest: 'docs/source/assets/images/',
        expand: true
      },
      'docs-fonts': {
        cwd: 'dist/tailcoat/fonts/',
        src: '**',
        dest: 'docs/source/assets/fonts/',
        expand: true
      }
    },

    concat: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '*   <%= pkg.homepage %>\n' +
                '*   Copyright (c) <%= grunt.template.today("yyyy") %> Environmental Systems Research Institute, Inc.\n' +
                '*   Apache 2.0 License */\n'
      },
      dist: {
        files: {
          'dist/tailcoat/javascripts/tailcoat.js': 'dist/tailcoat/javascripts/tailcoat.js'
        }
      },
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '*   <%= pkg.homepage %>\n' +
                '*   Copyright (c) <%= grunt.template.today("yyyy") %> Environmental Systems Research Institute, Inc.\n' +
                '*   Apache 2.0 License */\n'
      },
      dist: {
        files: {
          'dist/tailcoat/javascripts/tailcoat.min.js': ['lib/javascripts/tailcoat.js']
        }
      }
    },

    rename: {
      distmin: {
        src: 'dist/tailcoat/stylesheets/tailcoat.css',
        dest: 'dist/tailcoat/stylesheets/tailcoat.min.css'
      }
    },

    middleman: {
      options: {
        useBundle: true
      },
      server: {
        options: {
          command: 'server'
        }
      },
      build: {
        options: {
          command: 'build',
          clean: true
        }
      }
    },

    'gh-pages': {
      options: {
        base: 'docs/build',
        repo: 'https://github.com/ArcGIS/tailcoat.git'
      },
      src: ['**']
    },

    watch: {
      scripts: {
        files: ['lib/**/*.js'],
        tasks: [
          'copy:docs-js',
          'copy:docs-images',
          'copy:docs-fonts'
        ]
      }
    }
  });

  // load npm tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Tasks

  // build distribution
  grunt.registerTask('build', [
    'copy:dist',
    'concat:dist',
    'uglify:dist',
    'compass:distmin',
    'rename:distmin',
    'compass:dist'
  ]);

  // documentation tasks

  // serve doc site locally (local.arcgis.com:4567)
  grunt.registerTask('docs:serve', [
    'copy:docs-js',
    'copy:docs-images',
    'copy:docs-fonts',
    'middleman:server'
  ]);

  // build doc site to docs/build
  grunt.registerTask('docs:build', [
    'copy:docs-js',
    'copy:docs-images',
    'copy:docs-fonts',
    'middleman:build'
  ]);

  // deploy doc site to github pages
  grunt.registerTask('docs:deploy', 'Deploy documentation to github pages', function(n) {
    if (grunt.option('message')) {
      grunt.config.set('gh-pages.options.message', grunt.option('message'));
    }

    grunt.task.run(['gh-pages']);
  });

  grunt.registerTask('default', ['docs:serve']);
};
