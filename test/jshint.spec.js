require('mocha-jshint')({
    title: 'Code style tests\n'.bold.cyan.underline,
    paths: [
        __dirname,
        __dirname + '/..',
        __dirname + '/../lib'
    ]
});