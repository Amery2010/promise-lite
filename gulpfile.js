var gulp = require('gulp'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint');

gulp.task('default', function () {
    'use strict';

    gulp.src(['src/promise-lite.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('dist/'))
        .pipe(uglify())
        .pipe(rename('promise-lite.min.js'))
        .pipe(gulp.dest('dist/'));
});
