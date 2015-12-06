'use strict';

const gulp = require('gulp');
const connect = require('gulp-connect');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const autoprefixer = require('gulp-autoprefixer');
const stylus = require('gulp-stylus');
const nib = require('nib');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const minifyCss = require('gulp-minify-css');
const runSequence = require('run-sequence');

const config = require('./package.json');

gulp.task('server', () => {
    return connect.server({
        port: 3001,
        root: [__dirname]
    });
});

gulp.task('babel', () => {
    return gulp.src('./src/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('stylus', () => {
    return gulp.src('./src/*.styl')
        .pipe(stylus({
            use: [nib()]
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('./dist'))
        .pipe(connect.reload());
});

gulp.task('min-js', () => {
    return gulp.src(`./dist/${config.name}.js`)
        .pipe(uglify())
        .pipe(rename(`${config.name}.min.js`))
        .pipe(gulp.dest('./dist'));
});

gulp.task('min-css', () => {
    return gulp.src(`./dist/${config.name}.css`)
        .pipe(minifyCss())
        .pipe(rename(`${config.name}.min.css`))
        .pipe(gulp.dest('./dist'));
});

gulp.task('build', () => {
    return runSequence('min-js', 'min-css');
});

gulp.task('watch', () => {
    watch('./src/*.js', () => {
        runSequence('babel');
    });

    watch('./src/*.styl', () => {
        runSequence('stylus');
    });
});

gulp.task('default', ['server', 'watch', 'babel', 'stylus']);