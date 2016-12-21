'use strict';

//datasets List Controller
angular.module('core').controller('GetHelpModalController', ['$uibModalInstance', 'videoId', 'content', '$sce',
    function ($uibModalInstance, videoId, content, $sce) {
        var vm = this;

        vm.videoId = videoId;
        vm.content = content;

        vm.getIframeSrc = function(){
            return $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + vm.videoId + '?rel=0&amp;controls=0&amp;showinfo=&amp;autoplay=1');
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss();
        };
}]);
