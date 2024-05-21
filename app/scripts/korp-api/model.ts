/** @format */
import KwicProxy from "@/korp-api/kwic-proxy"
import LemgramProxy from "@/korp-api/lemgram-proxy"
import StatsProxy from "@/korp-api/stats-proxy"
import TimeProxy from "@/korp-api/time-proxy"
import GraphProxy from "@/korp-api/graph-proxy"

/** These are in an object so that they can be easily replaced by dynamically loaded code. */
const model = {
    KwicProxy,
    LemgramProxy,
    StatsProxy,
    TimeProxy,
    GraphProxy,
}
export default model
