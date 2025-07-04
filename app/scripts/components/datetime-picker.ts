/** @format */
import angular, { type IComponentController, type IScope } from "angular"
import { html } from "@/util"
import moment, { type Moment } from "moment"

angular.module("korpApp").component("datetimePicker", {
    template: html`
        <div class="flex justify-between items-baseline">
            <div>
                <span class="capitalize">{{$ctrl.label | loc:$root.lang}}</span>
            </div>

            <div>
                <button
                    uib-popover-template="'datepicker.html'"
                    popover-trigger="'outsideClick'"
                    popover-placement="bottom-left"
                    class="btn btn-default btn-sm"
                >
                    <i class="fa fa-calendar mr-1"></i>
                    {{ combined.format("YYYY-MM-DD HH:mm") }}
                </button>

                <script type="text/ng-template" id="datepicker.html">
                    <div ng-click="handleClick($event)" class="date_interval">
                        <div
                            uib-datepicker
                            class="well well-sm"
                            ng-model="$parent.date"
                            datepicker-options="datepickerOptions"
                        ></div>

                        <div class="flex items-center justify-center">
                            <i class="fa-solid fa-2x fa-clock"></i>
                            <div
                                uib-timepicker
                                class="timepicker"
                                ng-model="$parent.time"
                                hour-step="1"
                                minute-step="1"
                                show-meridian="false"
                            ></div>
                        </div>
                    </div>
                </script>
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
        function ($scope: DatetimePickerScope) {
            const $ctrl = this as DatetimePickerController

            $scope.datepickerOptions = { startingDay: 1 }

            $ctrl.$onChanges = (changes) => {
                // Sync incoming values to internal model
                if (changes.dateModel) $scope.date = changes.dateModel.currentValue
                if (changes.timeModel) $scope.time = changes.timeModel.currentValue

                if (changes.minDate) {
                    $scope.datepickerOptions.minDate = changes.minDate.currentValue
                    $scope.datepickerOptions.initDate = changes.minDate.currentValue
                }
                if (changes.maxDate) $scope.datepickerOptions.maxDate = changes.maxDate.currentValue
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
                event.originalEvent?.preventDefault()
                event.originalEvent?.stopPropagation()
            }
        },
    ],
})

type DatetimePickerController = IComponentController & {
    label: string
    dateModel: Date
    timeModel: Date
    minDate: Date
    maxDate: Date
    update: (values: { m: Moment }) => void
}

type DatetimePickerScope = IScope & {
    date: Date
    time: Date
    combined: Moment
    datepickerOptions: any
    handleClick: (event: JQuery.ClickEvent) => void
}
