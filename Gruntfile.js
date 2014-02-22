'use strict';

module.exports = function (grunt) {

	// load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var validatorConfig = {
    src: 'src',
    sampleApp: 'sampleapp',
    dist: 'dist',
    test: 'test',
    bowerComponents: 'components'
  };

  grunt.initConfig({
    validator: validatorConfig,
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= validator.src %>/*.js',
      ]
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= validator.dist %>/*',
          ]
        }]
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          flatten: true,
          dest: '<%= validator.dist %>/',
          src: '<%= validator.src %>/validator.js',
          rename: function(dest, src) {
            return dest + src.replace(/\./, '-<%=pkg.version%>.');
          }
        }]
      }
    },
    uglify: {
      dist: {
        options: {
          report: 'gzip',
          sourceMap: true,
          banner: '/*<%=pkg.name%> v<%=pkg.version%> - <%= pkg.homepage %>*/'
        },
        files: {
          '<%= validator.dist %>/validator-<%= pkg.version %>.min.js': [
            '<%= validator.dist %>/validator-<%= pkg.version %>.js'
          ]
        }
      }
    },
    connect: {
      options: {
        port: 9000,
        hostname: 'localhost',
        keepalive:true
      },
      sampleapp: {
        options: {
          base: [
            validatorConfig.sampleApp,
            validatorConfig.bowerComponents,
            validatorConfig.src
          ]
        }
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    }
  });

  grunt.registerTask('build', [
    'jshint',
    'karma:unit',
    'clean:dist',
    'copy:dist',
    'uglify:dist'
  ]);

  grunt.registerTask('test', [
    'jshint',
    'karma:unit'
  ]);

  grunt.registerTask('sampleapp', [
    'connect:sampleapp'
  ]);


};