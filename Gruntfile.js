/* global module */
module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['dist/**'],
        src_files: [
            'src/factories.js',
            'src/forms.js',
            'src/main.js'
        ],
        uglify: {
            dev: {
                options: {
                    preserveComments: false,
                    compress: false,
                    beautify: true,
                    mangle: false
                },
                files: {
                    'dist/<%= pkg.name %>.js': '<%= src_files %>'
                }
            },
            dist: {
                options: {
                    preserveComments: false,
                    compress: {},
                    beautify: false,
                    mangle: true
                },
                files: {
                    'dist/<%= pkg.name %>.min.js': '<%= src_files %>'
                }
            }
        },
        jshint: {
            files: ['src/**/*.js'],
            options: {
                globals: {
                    angular: true,
                    jQuery: true,
                    Cockpit: true,
                    window: true,
                    document: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', [
        'jshint',
        'clean',
        'uglify'
    ]);

};
