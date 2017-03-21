'use strict';

module.exports = function (grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'tasks/**/*.js'],
      options: {
        globals: {
          jQuery: true
        },
        esversion: 6,
        node: true
      }
    },
    cloudwatch_logs_clean: {
      test: {
        options: {
          region: "eu-west-1"
        }
      }
    }
  });

  grunt.task.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint', 'cloudwatch_logs_clean']);
};