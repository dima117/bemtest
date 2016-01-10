var gulp = require('gulp'),
    concat = require('gulp-concat');

gulp.task('default', function() {

    gulp
        .src([
            'src/helpers.js',
            'src/object.js',
            'src/events.js',
            'src/hash.js',
            'src/model.js'
        ])
        .pipe(concat('b-box.js'))
        .pipe(gulp.dest('demo/common.blocks/b-box'));
});
