/** @format */
import angular, { IScope, ui } from "angular"
import "./video-instance-controller"

type VideoControllerScope = IScope & {
    videos: { url: string; type: string }[]
    open: () => void
    startTime: number
    endTime: number
    fileName: string
    sentence: string
}

angular.module("korpApp").controller("VideoCtrl", [
    "$scope",
    "$uibModal",
    function ($scope: VideoControllerScope, $uibModal: ui.bootstrap.IModalService) {
        $scope.videos = []

        $scope.open = function () {
            let modalInstance
            modalInstance = $uibModal.open({
                animation: false,
                template: require("@/../markup/sidebar_video.html"),
                controller: "VideoInstanceCtrl",
                size: "modal-lg",
                windowClass: "video-modal-bootstrap",
                resolve: {
                    items() {
                        return $scope.videos
                    },
                    startTime() {
                        return $scope.startTime
                    },
                    endTime() {
                        return $scope.endTime
                    },
                    fileName() {
                        return $scope.fileName
                    },
                    sentence() {
                        return $scope.sentence
                    },
                },
            })
            // Ignore rejection from dismissing the modal
            modalInstance.result.catch(() => {})
        }

        $scope.startTime = 0
    },
])
