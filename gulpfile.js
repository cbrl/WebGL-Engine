var gulp = require("gulp");
var browserify = require("browserify");
var tsify = require("tsify");
var beautify = require("gulp-beautify");
var source = require('vinyl-source-stream');
var buffer = require("vinyl-buffer");
var tsConfig = require("./tsconfig.json");

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
	.pipe(buffer())
	.pipe(beautify({
		indent_size: 4
	}))
    .pipe(gulp.dest("dist"));
}));