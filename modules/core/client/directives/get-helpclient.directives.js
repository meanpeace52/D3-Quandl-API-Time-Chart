'use strict';
(function () {

    var getHelp = function ($uibModal) {
        return {
            restrict: 'E',
            replace: true,
            template: '<a href="" class="text-center"><span class="icon icon-help-with-circle"></span>&nbsp;&nbsp;<span style="font-size:12px;">Need Help?</span></a>',
            scope: {
                videoid: '@',
                content: '@'
            },
            link: function (scope, elem, attrs) {
                elem.bind('click', function () {
                    $uibModal.open({
                        controller: 'GetHelpModalController',
                        controllerAs: 'GetHelpModal',
                        templateUrl: 'modules/core/client/views/get-help.modal.client.view.html',
                        size: 'md',
                        backdrop: 'static',
                        resolve: {
                            videoId: function () {
                                return scope.videoid;
                            },
                            content: function () {
                                return scope.content;
                            }
                        }
                    }).result.then(function (result) {});
                });
            }
        };
    };

    angular.module('core')
        .directive('getHelp', ['$uibModal', getHelp]);

})();
