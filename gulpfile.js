var gulp = require('gulp')
  , browserify = require('browserify')
  , source = require('vinyl-source-stream')
;

var root = './www/js';
var paths = {
    scripts: 'www/**/*.js'
}

gulp.task('browserify', function() {
    var bundleStream = browserify(root + '/main.js', {
        debug: true,
        // standalone: 'A'
    }).bundle();

    bundleStream
        .pipe(source('build.js'))
        .pipe(gulp.dest(root))
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['browserify']);
});

// default task
gulp.task('default', ['watch']);