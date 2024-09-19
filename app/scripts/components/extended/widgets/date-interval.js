/** @format */
import _ from "lodash"
import settings from "@/settings"
import moment from "moment"
import { html } from "@/util"
import "@/components/datetime-picker"

export const dateInterval = {
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
        function ($scope) {
            let s = $scope
            let cl = settings.corpusListing

            let updateIntervals = function () {
                let moments = cl.getMomentInterval()
                if (moments.length) {
                    let [fromYear, toYear] = _.invokeMap(moments, "toDate")
                    s.minDate = fromYear
                    s.maxDate = toYear
                } else {
                    let [from, to] = cl.getTimeInterval()
                    s.minDate = moment(from.toString(), "YYYY").toDate()
                    s.maxDate = moment(to.toString(), "YYYY").toDate()
                }
            }
            s.commitDateInput = () => {
                if (s.fromDateString) {
                    const dateString = s.fromDateString.length == 4 ? `${s.fromDateString}-01-01` : s.fromDateString
                    s.fromDate = moment(dateString).toDate()
                    s.fromTime = moment("000000", "HHmmss").toDate()
                }
                if (s.toDateString) {
                    const dateString = s.toDateString.length == 4 ? `${s.toDateString}-12-31` : s.toDateString
                    s.toDate = moment(dateString).toDate()
                    s.toTime = moment("235959", "HHmmss").toDate()
                }
            }
            s.$on("corpuschooserchange", function () {
                updateIntervals()
            })

            updateIntervals()

            let getYear = function (val) {
                return moment(val.toString(), "YYYYMMDD").toDate()
            }

            let getTime = function (val) {
                return moment(val.toString(), "HHmmss").toDate()
            }

            if (!s.model) {
                s.fromDate = s.minDate
                s.toDate = s.maxDate
                let [from, to] = _.invokeMap(cl.getMomentInterval(), "toDate")
                s.fromTime = from
                s.toTime = to
            } else if (s.model.length === 4) {
                let [fromYear, toYear] = _.map(s.model.slice(0, 3), getYear)
                s.fromDate = fromYear
                s.toDate = toYear
                let [fromTime, toTime] = _.map(s.model.slice(2), getTime)
                s.fromTime = fromTime
                s.toTime = toTime
            }

            s.updateFrom = (m) => {
                // We cannot just patch the list, we need to re-set it to trigger watcher.
                // [fromdate, todate, fromtime, totime]
                s.model = [m.format("YYYYMMDD"), s.model[1], m.format("HHmmss"), s.model[3]]
            }

            s.updateTo = (m) => {
                // We cannot just patch the list, we need to re-set it to trigger watcher.
                // [fromdate, todate, fromtime, totime]
                m.set("second", 59)
                s.model = [s.model[0], m.format("YYYYMMDD"), s.model[2], m.format("HHmmss")]
            }
        },
    ],
}
