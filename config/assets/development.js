'use strict';

var BOWER_PATH = 'public/lib/';

module.exports = {
    client: {
        lib: {
            css: [
                BOWER_PATH + 'bootstrap/dist/css/bootstrap.css',
                BOWER_PATH + 'angular-loading-bar/dist/loading-bar.css',
                BOWER_PATH + 'angular-toastr/dist/angular-toastr.css',
                BOWER_PATH + 'angularjs-slider/dist/rzslider.css',
                BOWER_PATH + 'datatables/media/css/dataTables.bootstrap.min.css'
            ],
            js: [
                BOWER_PATH + 'jquery/dist/jquery.min.js',
                BOWER_PATH + 'angular/angular.js',
                BOWER_PATH + 'angular-cookies/angular-cookies.js',
                BOWER_PATH + 'angular-resource/angular-resource.js',
                BOWER_PATH + 'angular-animate/angular-animate.js',
                BOWER_PATH + 'angular-messages/angular-messages.js',
                BOWER_PATH + 'angular-loading-bar/dist/loading-bar.js',
                BOWER_PATH + 'angular-toastr/dist/angular-toastr.tpls.js',
                BOWER_PATH + 'angular-ui-router/release/angular-ui-router.js',
                BOWER_PATH + 'angular-ui-utils/ui-utils.js',
                BOWER_PATH + 'angular-bootstrap/ui-bootstrap-tpls.js',
                BOWER_PATH + 'angular-file-upload/angular-file-upload.js',
                BOWER_PATH + 'angular-sanitize/angular-sanitize.js',
                BOWER_PATH + 'lodash/lodash.js',
                BOWER_PATH + 'objectpath/lib/ObjectPath.js',
                BOWER_PATH + 'owasp-password-strength-test/owasp-password-strength-test.js',
                BOWER_PATH + 'angular-translate/angular-translate.js',
                BOWER_PATH + 'angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
                BOWER_PATH + 'angular-translate-storage-local/angular-translate-storage-local.min.js',
                BOWER_PATH + 'angular-translate-storage-cookie/angular-translate-storage-cookie.js',
                BOWER_PATH + 'angular-local-storage/dist/angular-local-storage.js',
                BOWER_PATH + 'moment/moment.js',
                BOWER_PATH + 'angular-moment/angular-moment.js',
                BOWER_PATH + 'angularjs-slider/dist/rzslider.js',
                BOWER_PATH + 'ngInfiniteScroll/build/ng-infinite-scroll.js',
                BOWER_PATH + 'datatables/media/js/jquery.dataTables.min.js',
                BOWER_PATH + 'datatables/media/js/dataTables.bootstrap.min.js',
                BOWER_PATH + 'angular-datatables/dist/angular-datatables.js',
                BOWER_PATH + 'aws-sdk/dist/aws-sdk.js',
                BOWER_PATH + 'angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
                BOWER_PATH + 'angular-ui-router-uib-modal/src/angular-ui-router-uib-modal.js',
                BOWER_PATH + 'handlebars/handlebars.js',
                BOWER_PATH + 'js-rbroker-framework/browser/rbroker.min.js',
                BOWER_PATH + 'angular-payments/lib/angular-payments.js',
                BOWER_PATH + 'angular-dob/lib/angular-dob.js',
                BOWER_PATH + 'angular-prompt/dist/angular-prompt.js',
                BOWER_PATH + 'ngstorage/ngStorage.js',
            ],
            tests: [BOWER_PATH + 'angular-mocks/angular-mocks.js']
        },
        css: [
            'modules/*/client/css/*.css'
        ],
        less: [
            'modules/*/client/less/*.less'
        ],
        sass: [
            'modules/*/client/scss/*.scss'
        ],
        js: [
            'modules/core/client/app/config.js',
            'modules/core/client/app/init.js',
            'modules/*/client/*.js',
            'modules/*/client/**/*.js'
        ],
        views: ['modules/*/client/views/**/*.html'],
        templates: ['build/templates.js']
    },
    server: {
        gruntConfig: 'gruntfile.js',
        gulpConfig: 'gulpfile.js',
        allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
        models: 'modules/*/server/models/**/*.js',
        routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
        sockets: 'modules/*/server/sockets/**/*.js',
        config: 'modules/*/server/config/*.js',
        policies: 'modules/*/server/policies/*.js',
        views: 'modules/*/server/views/*.html'
    }
};
