'use strict';

module.exports = function (grunt) {

	// load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var packageJson = require('./package.json');

  var validatorConfig = {
    src: 'src',
    sampleApp: 'sampleapp',
    dist: 'dist',
    test: 'test',
    version: packageJson.version,
    homepage: packageJson.homepage
  };

  grunt.initConfig({
    validator: validatorConfig,
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= validator.src %>/*.js',
        '<%= validator.sampleApp %>/scripts/{,*/}*.js'
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
            return dest + src.replace(/\./, '-<%=validator.version%>.');
          }
        }]
      }
    },
    uglify: {
      dist: {
        options: {
          sourceMap: true,
          banner: '/*Angular - Simple validator v<%=validator.version%> - <%= validator.homepage %>*/'
        },
        files: {
          '<%= validator.dist %>/validator-<%= validator.version %>.min.js': [
            '<%= validator.dist %>/validator-<%= validator.version %>.js'
          ]
        }
      }
    }
  });

  grunt.registerTask('build', [
    'jshint',
    'clean:dist',
    'copy:dist',
    'uglify:dist'
  ]);

};