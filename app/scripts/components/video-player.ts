/** @format */
import angular, { ICompileService, IScope, ITimeoutService } from "angular"
import { html } from "@/util"
import moment from "moment"

type VideoPlayerScope = IScope & {
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

angular.module("korpApp").component("videoPlayer", {
    template: html`<div>
        <div id="video-container">
            <video id="korp-video" width="100%" height="100%" controls ng-init="init()" controlsList="nodownload">
                Your browser does not support the video tag.
            </video>
            <div id="extra-controls" ng-show="isPaused">
                <div class="restart" ng-click="goToStartTime()">
                    <i class="restart-icon fa-solid fa-repeat"></i>
                    <span>{{"video_restart" | loc:lang}}</span>
                </div>
                <div class="continue" ng-click="continuePlay()">
                    <i class="continue-icon fa-solid fa-play"></i>
                    <span>{{"video_continue" | loc:lang}}</span>
                </div>
            </div>
        </div>
        <div id="video-meta-container">
            <div class="time-div">
                <span>{{"video_start_time" | loc:lang}}: <span class="time">{{startTime}}</span></span>
                <span>{{"video_end_time" | loc:lang}}: <span class="time">{{endTime}}</span></span>
            </div>
            <div>{{"video_utterance" | loc:lang}}: <span class="utterance">{{sentence}}</span></div>
        </div>
    </div>`,
    controller: [
        "$scope",
        "$compile",
        "$timeout",
        "items",
        "startTime",
        "endTime",
        "fileName",
        "sentence",
        function (
            $scope: VideoPlayerScope,
            $compile: ICompileService,
            $timeout: ITimeoutService,
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
        },
    ],
})
