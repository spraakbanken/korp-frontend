/** @format */
import _ from "lodash"
import moment, { Moment } from "moment"
import settings from "@/settings"
import { html } from "@/util"
import { Widget, WidgetScope } from "./common"
import "@/components/datetime-picker"
import { StoreService } from "@/services/store"
import "@/services/store"

type DateIntervalScope = WidgetScope<(string | number)[]> & {
    minDate: Date
    maxDate: Date
    fromDate: Date
    fromDateString: string
    fromTime: Date
    toDate: Date
    toDateString: string
    toTime: Date
    commitDateInput: () => void
    updateFrom: (m: Moment) => void
    updateTo: (m: Moment) => void
}

export const dateInterval: Widget = {
    template: html`
        <div class="date_interval_arg_type">
            <h3>{{'simple' | loc:$root.lang}}</h3>
            <form ng-submit="commitDateInput()">
                <div class="" style="margin-bottom: 1rem;">
                    <span class="" style="display : inline-block; width: 32px; text-transform: capitalize;"
                        >{{'from' | loc:$root.lang}}</span
                    >
                    <input
                        type="text"
                        ng-blur="commitDateInput()"
                        ng-model="fromDateString"
                        placeholder="'1945' {{'or' | loc:$root.lang}} '1945-08-06'"
                    />
                </div>
                <div>
                    <span class="" style="display : inline-block; width: 32px; text-transform: capitalize;"
                        >{{'to' | loc:$root.lang}}</span
                    >
                    <input
                        type="text"
                        ng-blur="commitDateInput()"
                        ng-model="toDateString"
                        placeholder="'1968' {{'or' | loc:$root.lang}} '1968-04-04'"
                    />
                </div>
                <button type="submit" class="hidden"></button>
            </form>

            <h3>{{'advanced' | loc:$root.lang}}</h3>
            <div class="section mt-4">
                <datetime-picker
                    label="from"
                    date-model="fromDate"
                    time-model="fromTime"
                    min-date="minDate"
                    max-date="maxDate"
                    update="updateFrom(m)"
                ></datetime-picker>
            </div>

            <div class="section">
                <datetime-picker
                    label="to"
                    date-model="toDate"
                    time-model="toTime"
                    min-date="minDate"
                    max-date="maxDate"
                    update="updateTo(m)"
                ></datetime-picker>
            </div>
        </div>
    `,
    controller: [
        "$scope",
        "store",
        function ($scope: DateIntervalScope, store: StoreService) {
            function updateIntervals() {
                const moments = settings.corpusListing.getMomentInterval()
                if (moments) {
                    ;[$scope.minDate, $scope.maxDate] = moments.map((m) => m.toDate())
                } else {
                    const interval = settings.corpusListing.getTimeInterval()
                    if (!interval) return
                    const [from, to] = interval
                    $scope.minDate = getYear(from)
                    $scope.maxDate = getYear(to)
                }
            }

            $scope.commitDateInput = () => {
                if ($scope.fromDateString) {
                    const dateString =
                        $scope.fromDateString.length == 4 ? `${$scope.fromDateString}-01-01` : $scope.fromDateString
                    $scope.fromDate = moment(dateString).toDate()
                    $scope.fromTime = moment("000000", "HHmmss").toDate()
                }
                if ($scope.toDateString) {
                    const dateString =
                        $scope.toDateString.length == 4 ? `${$scope.toDateString}-12-31` : $scope.toDateString
                    $scope.toDate = moment(dateString).toDate()
                    $scope.toTime = moment("235959", "HHmmss").toDate()
                }
            }

            store.watch("selectedCorpusIds", () => {
                updateIntervals()
            })

            updateIntervals()

            if (!$scope.model) {
                $scope.fromDate = $scope.minDate
                $scope.toDate = $scope.maxDate
                const moments = settings.corpusListing.getMomentInterval()
                if (moments) [$scope.fromTime, $scope.toTime] = moments.map((m) => m.toDate())
            } else if ($scope.model.length === 4) {
                ;[$scope.fromDate, $scope.toDate] = $scope.model.slice(0, 3).map(getDate)
                ;[$scope.fromTime, $scope.toTime] = $scope.model.slice(2).map(getTime)
            }

            $scope.updateFrom = (m: Moment) => {
                // We cannot just patch the list, we need to re-set it to trigger watcher.
                // [fromdate, todate, fromtime, totime]
                $scope.model = [m.format("YYYYMMDD"), $scope.model[1], m.format("HHmmss"), $scope.model[3]]
            }

            $scope.updateTo = (m: Moment) => {
                // We cannot just patch the list, we need to re-set it to trigger watcher.
                // [fromdate, todate, fromtime, totime]
                m.set("second", 59)
                $scope.model = [$scope.model[0], m.format("YYYYMMDD"), $scope.model[2], m.format("HHmmss")]
            }
        },
    ],
}

const getDate = (date: string | number): Date => moment(date.toString(), "YYYYMMDD").toDate()
const getTime = (date: string | number): Date => moment(date.toString(), "HHmmss").toDate()
const getYear = (date: number): Date => moment(date.toString(), "YYYY").toDate()
