/** @format */
import _ from "lodash"
import angular, { IRootElementService } from "angular"

angular.module("korpApp").directive("popper", [
    "$rootElement",
    ($rootElement: IRootElementService) => ({
        scope: {},
        link(scope, elem, attrs) {
            const popup = elem.next()
            popup.appendTo("body").hide()

            if (attrs.noCloseOnClick == null) {
                popup.on("click", function () {
                    popup.hide()
                    return false
                })
            }

            elem.on("click", function () {
                // Hide other popper menus on the page
                const other = $(".popper_menu:visible").not(popup)
                if (other.length) {
                    other.hide()
                }

                // Close this menu if visible, show if hidden
                if (popup.is(":visible")) {
                    popup.hide()
                } else {
                    popup.show()
                }

                // See https://api.jqueryui.com/position/
                popup.position({
                    my: attrs.my || "right top",
                    at: attrs.at || "bottom right",
                    of: elem,
                })

                return false
            })

            // Hide menu if any other part of the page is clicked
            $rootElement.on("click", () => popup.hide())
        },
    }),
])
