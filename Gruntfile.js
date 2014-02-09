'use strict';

module.exports = function (grunt) {

	// load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var validatorConfig = {
    src: 'src',
    sampleApp: 'sampleapp',
    dist: 'dist',
    test: 'test'
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
    }
  });

  grunt.registerTask('build', [
    'jshint',
    'clean:dist',
    'copy:dist',
    'uglify:dist'
  ]);

};