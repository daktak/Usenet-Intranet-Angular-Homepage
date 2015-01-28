'use strict';

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    minifyCSS = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    cache = require('gulp-cached'),
    beautify = require('gulp-js-beaut'),
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

gulp.task('beautify', function() {
    var config = {
        js: {
            indent_size: 4,
            indent_char: " ",
            indent_level: 0,
            indent_with_tabs: false,
            preserve_newlines: true,
            max_preserve_newlines: 10,
            jslint_happy: false,
            space_after_anon_function: false,
            brace_style: "collapse",
            keep_array_indentation: false,
            keep_function_indentation: false,
            space_before_conditional: true,
            break_chained_methods: false,
            eval_code: false,
            unescape_strings: false,
            wrap_line_length: 0
        }
    };
    return gulp.src(['src/app.js'], {
            base: './'
        })
        .pipe(cache('beautifing'))
        .pipe(beautify(config))
        .pipe(gulp.dest('./'));
});

gulp.task('default',['lint','build']);
