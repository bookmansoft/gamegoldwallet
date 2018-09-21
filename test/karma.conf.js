// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function(config) {
  config.set({
    webpack: { node: { fs: 'empty' } },
    basePath: '..',
    browserDisconnectTolerance: 2,
    browserNoActivityTimeout: 60 * 1000,
    frameworks: ['jasmine', '@angular/cli'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-junit-reporter'),
      require('karma-spec-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular/cli/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    files: [{ pattern: './src/test.ts', watched: false }],
    preprocessors: {
      './src/test.ts': ['@angular/cli']
    },
    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly'],
      fixWebpackSourcePaths: true
    },
    angularCli: {
      environment: 'dev'
    },
    reporters:
      config.angularCli && config.angularCli.codeCoverage
        ? ['spec', 'coverage-istanbul']
        : ['spec', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadlessCI'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        // Sandbox causes Chrome to crash on Travis
        // https://github.com/travis-ci/travis-ci/issues/8836#issuecomment-359018652
        flags: ['--no-sandbox']
      }
    },
    singleRun: false,
    junitReporter: {
      outputDir: process.env.JUNIT_REPORT_PATH || './test/',
      outputFile: process.env.JUNIT_REPORT_NAME || 'junitresults.xml',
      useBrowserName: false
    }
  });
};
