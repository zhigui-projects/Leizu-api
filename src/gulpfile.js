// Dependencies
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var livereload = require('gulp-livereload');
var clear = require('clear');
var apidoc = require('gulp-apidoc');

// index
var script = 'index.js';

// server reload on change
var server = function () {
    return gulp.src(script).pipe(livereload());
};

// documentation generation
var apidocjs = function () {
    return apidoc({
        src: 'app/',
        dest: 'public/apidoc/',
        config: './',
        debug: false,
        includeFilters: ['.*\\.js$']
    }, function () {

    });
};

// actions on server restart
var nodemonjs = function () {
    return nodemon({
        script: script,
        ignore: ['public/*'],
    }).on('restart', function () {
        //clear console
        clear();

        //generate documentation
        apidocjs();

        //restart server
        server();
    });
};

// start tasks
gulp.task('default', ['nodemon', 'apidoc']);
gulp.task('apidoc', apidocjs);
gulp.task('nodemon', nodemonjs);