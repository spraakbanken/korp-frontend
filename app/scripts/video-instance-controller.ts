/** @format */
import angular, { ICompileService, IScope, ITimeoutService, ui } from "angular"
import moment from "moment"

type VideoInstanceControllerScope = IScope & {
    fileName: string
    sentence: string
    startTime: string
    endTime: string
    init: () => void
    goToStartTime: () => void
    continuePlay: () => void
    isPaused: boolean
    pauseAfterEndTime: boolean
    ok: () => void
}

angular.module("korpApp").controller("VideoInstanceCtrl", [
    "$scope",
    "$compile",
    "$timeout",
    "$uibModalInstance",
    "items",
    "startTime",
    "endTime",
    "fileName",
    "sentence",
    function (
        $scope: VideoInstanceControllerScope,
        $compile: ICompileService,
        $timeout: ITimeoutService,
        $uibModalInstance: ui.bootstrap.IModalInstanceService,
        items: { url: string; type: string }[],
        startTime: number,
        endTime: number,
        fileName: string,
        sentence: string
    ) {
        $scope.fileName = fileName
        $scope.sentence = sentence

        /** Format time as hh:mm:ss if hours > 0, else mm:ss */
        const transformSeconds = function (seconds: number) {
            let sHours
            const d = moment.duration(seconds, "seconds")
            const hours = Math.floor(d.asHours())
            if (hours !== 0) {
                sHours = String(hours) + ":"
            } else {
                sHours = ""
            }

            const mins = Math.floor(d.asMinutes()) - hours * 60
            let sMins = String(mins + ":")

            if (sMins.length === 2 && sHours) {
                sMins = `0${sMins}`
            }
            let secs = String(Math.floor(d.asSeconds()) - hours * 3600 - mins * 60)
            if (secs.length === 1) {
                secs = `0${secs}`
            }

            return sHours + sMins + secs
        }

        if (startTime) {
            $scope.startTime = transformSeconds(startTime)
        }
        if (endTime) {
            $scope.endTime = transformSeconds(endTime)
        }

        $scope.init = function () {
            const videoElem = angular.element("#korp-video")

            // workaround for firefox problem, not possible to create source-elem in template
            for (let videoData of items) {
                const srcElem = angular.element("<source>")
                srcElem.attr("src", videoData.url)
                srcElem.attr("type", videoData.type)
                $compile(srcElem)($scope)
                videoElem.append(srcElem)
            }

            const video = videoElem[0] as HTMLVideoElement

            video.addEventListener("durationchange", function () {
                video.currentTime = startTime
                video.play()
            })

            video.addEventListener("timeupdate", () => {
                if ($scope.pauseAfterEndTime && endTime && video.currentTime >= endTime) {
                    video.pause()
                    $timeout(() => ($scope.isPaused = true), 0)
                }
            })

            $scope.goToStartTime = function () {
                video.currentTime = startTime
                $scope.isPaused = false
                video.play()
            }

            $scope.continuePlay = function () {
                $scope.pauseAfterEndTime = false
                $scope.isPaused = false
                video.play()
            }
        }

        $scope.isPaused = false
        $scope.pauseAfterEndTime = true

        $scope.ok = () => $uibModalInstance.close()
    },
])
