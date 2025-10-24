import { loc } from "@/i18n"

$.fn.localeKey = function (key) {
    this.each(function () {
        $(this).attr("rel", `localize[${key}]`).html(loc(key))
    })
    return this
}

/*
 * A file generation plugin modified from that by Martin Angelov:
 * http://tutorialzine.com/2011/05/generating-files-javascript-php/
 * (assets/jquery.generateFile.js) (janiemi 2014-02-27)
 */
;(function ($) {
    // Creating a jQuery plugin:
    $.generateFile = function (script, data) {
        console.log("generateFile", script, data)
        data = data || {}

        // Creating a 1 by 1 px invisible iframe:
        var iframe = $("<iframe>", {
            id: "generate-file",
            width: 1,
            height: 1,
            frameborder: 0,
            css: {
                display: "none",
            },
        }).appendTo("body")

        var formHTML = '<form action="" method="post">'
        for (var key in data) {
            formHTML += '<input type="hidden" name="' + key + '" />'
        }
        formHTML += "</form>"

        // Giving IE a chance to build the DOM in
        // the iframe with a short timeout:
        setTimeout(function () {
            // The body element of the iframe document:
            var body =
                iframe.prop("contentDocument") !== undefined
                    ? iframe.prop("contentDocument").body
                    : iframe.prop("document").body // IE
            body = $(body)

            // Adding the form to the body:
            body.html(formHTML)

            var form = body.find("form")
            form.attr("action", script)
            for (var key in data) {
                form.find("input[name=" + key + "]").val(data[key])
            }

            // Submitting the form to the download script. This will
            // cause the file download dialog box to appear.
            form.submit()
        }, 50)

        // TODO: Check for a possible error message printed to iframe.
        // Should $.generateFile have a callback function argument for
        // handling error messages? How do we recognize an error
        // message and for how long should we wait for one to appear?
        // Is it at all possible?
    }
})(jQuery)
