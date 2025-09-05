import angular from "angular"

// <div click-cover="(boolean expression)">...</div>
// If the expression is true, the content is faded and cannot be clicked.
angular.module("korpApp").directive("clickCover", () => ({
    link(scope, elem, attr) {
        const cover = $("<div class='click-cover'>").on("click", () => false)

        const pos = elem.css("position") || "static"
        scope.$watch(
            () => scope.$eval(attr.clickCover),
            (enabled: boolean) => {
                if (enabled) {
                    elem.prepend(cover)
                    elem.css("pointer-events", "none")
                    elem.css("position", "relative").addClass("covered")
                } else {
                    cover.remove()
                    elem.css("pointer-events", "")
                    elem.css("position", pos).removeClass("covered")
                }
            },
        )
    },
}))
