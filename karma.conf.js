module.exports = function(config) {
    config.set({
        frameworks: ['browserify', 'mocha'],
        files: [
            'node_modules/babelify/node_modules/babel-core/browser-polyfill.js',
            "rhea.js",
            "tests.js",
            {pattern: "rhea.emscripten.js", included: false}
        ],
        proxies: {
            '/rhea.emscripten.js': '/base/rhea.emscripten.js'
        },
        reporters: ['progress'],
        port: 9876,
        colors: true,
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        customLaunchers: {
            Chrome_Travis_CI: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        },
        singleRun: false,
        preprocessors: {
            "rhea.js": ["browserify"],
            "tests.js": ["browserify"]
        },
        "browserify": {
            debug: true,
            transform: ['babelify']
        },
    });

    if (process.env.TRAVIS) {
        config.browsers = ['Chrome_Travis_CI'];
    }
};
