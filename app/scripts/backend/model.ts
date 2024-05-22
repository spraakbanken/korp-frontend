/** @format */
import KwicProxy from "@/backend/kwic-proxy"
import LemgramProxy from "@/backend/lemgram-proxy"
import StatsProxy from "@/backend/stats-proxy"
import TimeProxy from "@/backend/time-proxy"
import GraphProxy from "@/backend/graph-proxy"

/** These are in an object so that they can be easily replaced by dynamically loaded code. */
const model = {
    KwicProxy,
    LemgramProxy,
    StatsProxy,
    TimeProxy,
    GraphProxy,
}
export default model
