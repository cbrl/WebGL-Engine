var gulp = require("gulp");
var tsConfig = require("./tsconfig.json");
var source = require('vinyl-source-stream');
var browserify = require("browserify");
var tsify = require("tsify");
var paths = {
    pages: ['src/*.html']
};

gulp.task("copy-html", function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

gulp.task("default", gulp.series(gulp.parallel('copy-html'), function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/engine.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify, tsConfig)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest("dist"));
}));