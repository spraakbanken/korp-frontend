import { getUrlParam } from "./urlparams"

const currentMode = getUrlParam("mode") || "default"

export default currentMode
