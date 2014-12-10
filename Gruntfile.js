module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
              dist: {
                    src:
                    [
                        'js/Navigator.js',
                        'js/Ticker.js',
                        'js/StepManager.js',
                        'js/SlideDeck.js',
                        'js/Keyboard.js',
                        'js/Mouse.js',
                        'js/SlideDeckManager.js',
                        'js/Curtain.js',
                        'js/Touch.js',
                        'js/Overview.js',
                        'js/SyncClient.js'
                    ],
                    dest: 'build/<%= pkg.name %>.js'
              }
        },
        uglify: {
            options: {
                // the banner is inserted at the top of the output
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            dist: {
                files: {
                  'build/<%= pkg.name %>.min.js' : ['<%= concat.dist.dest %>'] //Minimize the output of concat.
                }
            }
        },
        less: {
            all:{
                files: {
                    "css/presenter.css": "less/presenter.less",
                    "css/presenter.theme.css" : "less/presenter.theme.less"
                }
            }
        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                options: {
                    paths: 'js/',
                    outdir: 'doc/'
                }
            }
        },

        clean: ["css/*", "build/*", "doc/*"]
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');

    //Set Default task.
    grunt.registerTask('default', 'concat');
};
