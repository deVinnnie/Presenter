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
                        'js/SyncClient.js',
                        'js/Routes.js'
                    ],
                    dest: 'dist/js/<%= pkg.name %>.js'
              }
        },
        uglify: {
            options: {
                // the banner is inserted at the top of the output
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            dist: {
                files: {
                  'dist/js/<%= pkg.name %>.min.js' : ['<%= concat.dist.dest %>'] //Minimize the output of concat.
                }
            }
        },
        less: {
            presenter : {
                options: {
                    compress: true
                },
                files: {
                    "dist/css/presenter.css" : "less/presenter.less"
                }
            },
            presenter_theme:{
                files: {
                    "dist/css/presenter.theme.css" : "less/presenter.theme.less"
                }
            }
        },
        watch: {
            livereload: {
                options: {
                    livereload: true
                },
                files: [
                    'example.html',
                    'js/*.js',
                    'dist/*'
                ]
            }
        },
        connect: {
            livereload: {
                options: {
                    port: 9000,
                    hostname: 'localhost',
                    base: '.',
                    open: 'example.html',
                    livereload: true
                }
            }
        },
        esdoc : {
            dist : {
                options: {
                    source: './js',
                    destination: './doc'
                }
            }
        },
        rollup: {
            options: {
                treeshake: false
            },
            files: {
                'dest': 'dist/bundle.js',
                'src' : 'js/Presenter.js'
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },

        clean: ["dist/*", "doc/*"]
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-esdoc');
    grunt.loadNpmTasks('grunt-rollup');

    //Set Default task.
    grunt.registerTask('default', ['rollup', 'less']);
    grunt.registerTask('test', ['rollup', 'less', 'karma']);
    
    grunt.registerTask('serve', ['connect', 'watch']);
    grunt.registerTask('doc', 'esdoc');
};
