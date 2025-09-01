/** @format */

import { getUrlParam } from "@/util"

const currentMode = getUrlParam("mode") || "default"

export default currentMode
