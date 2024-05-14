/** @format */
import angular from "angular"
import { html } from "@/util"

angular.module("korpApp").component("datetimePicker", {
    template: html`
        <div class="flex justify-between items-baseline">
            <div>
                <span class="capitalize">{{$ctrl.label | loc:$root.lang}}</span>
            </div>

            <div>
                <button class="btn btn-default btn-sm" popper no-close-on-click my="left top" at="right top">
                    <i class="fa fa-calendar mr-1"></i>
                    {{ combined.format("YYYY-MM-DD HH:mm") }}
                </button>
                <div ng-click="handleClick($event)" class="date_interval popper_menu dropdown-menu">
                    <div
                        uib-datepicker
                        class="well well-sm"
                        ng-model="date"
                        datepicker-options="$ctrl.datepickerOptions"
                    ></div>

                    <div class="flex items-center justify-center">
                        <i class="fa-solid fa-2x fa-clock"></i>
                        <div
                            uib-timepicker
                            class="timepicker"
                            ng-model="time"
                            hour-step="1"
                            minute-step="1"
                            show-meridian="false"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    `,
    bindings: {
        label: "@",
        dateModel: "<",
        timeModel: "<",
        minDate: "<",
        maxDate: "<",
        update: "&",
    },
    controller: [
        "$scope",
        function ($scope) {
            const $ctrl = this

            $ctrl.$onInit = () => {
                // Sync incoming values to internal model
                $scope.date = $ctrl.dateModel
                $scope.time = $ctrl.timeModel

                $ctrl.datepickerOptions = {
                    minDate: $ctrl.minDate,
                    maxDate: $ctrl.maxDate,
                    initDate: $ctrl.minDate,
                    startingDay: 1,
                }
            }

            // Report changes from datepicker/timepicker upwards
            $scope.$watchGroup(["date", "time"], () => {
                if (!$scope.date || !$scope.time) return

                // Combine date and time
                const m = moment(moment($scope.date).format("YYYY-MM-DD"))
                const m_time = moment($scope.time)
                m.add(m_time.hour(), "hour")
                m.add(m_time.minute(), "minute")
                $scope.combined = m

                // Report new values
                $ctrl.update({ m })
            })

            $scope.handleClick = function (event) {
                event.originalEvent.preventDefault()
                event.originalEvent.stopPropagation()
            }
        },
    ],
})
