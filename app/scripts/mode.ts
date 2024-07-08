/** @format */

const currentMode = new URLSearchParams(window.location.search).get("mode") || "default"

export default currentMode
