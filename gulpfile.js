const gulp = require('gulp');
const nodeSass = require('node-sass');
const gulpSass = require('gulp-sass');
const browserify = require('browserify');
const Babelify = require('babelify');
const sass = gulpSass(nodeSass);
const include = require('gulp-file-include');
const notify = require('gulp-notify');
const source = require('vinyl-source-stream');
const browserSync = require('browser-sync').init({
    server: {
        baseDir: "./release/"
    }
});

gulp.task('html', () => {
    return gulp.src('./src/html/**/*.html')
        .pipe(include())
        .pipe(gulp.dest('./release/'))
        .pipe(browserSync.stream());
});

gulp.task('scss' ,() => {
    return gulp.src('./src/scss/*.scss')
        .pipe(sass({
            outputStyle: "compressed"
        }))
        .pipe(gulp.dest('./release/css/'))
        .pipe(browserSync.stream());
});

gulp.task('js', () => {
    return browserify('./src/js/master.js')
        .transform(Babelify.configure({
            presets: ['@babel/preset-env']
        }))
        .bundle()
        // .pipe(notify({
        //     message: 'Сборка завершена!',
        //     wait: false
        // }))
        .pipe(source('master.js'))
        .pipe(gulp.dest('./release/js'))
        .pipe(browserSync.stream())
});

gulp.task('watch', () => {
    gulp.watch('./src/html/**/*.html', gulp.series('html'));
    gulp.watch('./src/scss/**/*.scss', gulp.series('scss'));
    gulp.watch('./src/js/*.js', gulp.series('js'));
})