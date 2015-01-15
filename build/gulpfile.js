'use strict';

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    minifyCSS = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat');

gulp.task('lint', function() {
	return gulp.src('src/app.js')
	.pipe(jshint())
	.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build', function() {
     gulp.src('src/*.js')
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('min'));
    gulp.src(['lib/*.js','min/*.js'])
    .pipe(concat('all.js'))
    .pipe(gulp.dest('../intranet/'));
    gulp.src('css/*.css')
    .pipe(minifyCSS())
    .pipe(gulp.dest('../intranet/'));
});

gulp.task('default',['lint','build']);
