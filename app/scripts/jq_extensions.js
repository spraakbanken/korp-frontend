$.fn.outerHTML = function() {
	return $(this).clone().wrap('<div></div>').parent().html();
};

$.fn.localeKey = function(key) {
	this.each(function() {
		$(this).attr("rel", $.format("localize[%s]", key)).html(util.getLocaleString(key));
	});
	return this;
};

/*!
 * jQuery ajaxProgress Plugin v0.5.0
 * Requires jQuery v1.5.0 or later
 *
 * http://www.kpozin.net/ajaxprogress
 *
 * (c) 2011, Konstantin Pozin
 * Licensed under MIT license.
 */
(function($) {

    // Test whether onprogress is supported
    var support = $.support.ajaxProgress = ("onprogress" in $.ajaxSettings.xhr());

    // If it's not supported, we can't do anything
    if (!support) {
        return;
    }

    var NAMESPACE = ".ajaxprogress";

    // Create global "ajaxProgress" event
    $.fn.ajaxProgress = function (f) {
        return this.bind("ajaxProgress", f);
    };

    // Hold on to a reference to the jqXHR object so that we can pass it to the progress callback.
    // Namespacing the handler with ".ajaxprogress"
    $("html").bind("ajaxSend" + NAMESPACE, function(event, jqXHR, ajaxOptions) {
        ajaxOptions.__jqXHR = jqXHR;
    });

    /**
     * @param {XMLHttpRequestProgressEvent} evt
     * @param {Object} options jQuery AJAX options
     */
    function handleOnProgress(evt, options) {

        // Trigger the global event.
        // function handler(jqEvent, progressEvent, jqXHR) {}
        if (options.global) {
            $.event.trigger("ajaxProgress", [evt, options.__jqXHR]);
        }

        // Trigger the local event.
        // function handler(jqXHR, progressEvent)
        if (typeof options.progress === "function") {
            options.progress(options.__jqXHR, evt);
        }
    }


    // We'll work with the original factory method just in case
    var makeOriginalXhr = $.ajaxSettings.xhr.bind($.ajaxSettings);

    // Options to be passed into $.ajaxSetup;
    var newOptions = {};

    // Wrap the XMLHttpRequest factory method
    newOptions.xhr = function () {

        // Reference to the extended options object
        var s = this;

        var newXhr = makeOriginalXhr();
        if (newXhr) {
            newXhr.addEventListener("progress", function(evt) {
                handleOnProgress(evt, s);
            });
        }
        return newXhr;
    };

    $.ajaxSetup(newOptions);

})(jQuery);


/*
 * A file generation plugin modified from that by Martin Angelov:
 * http://tutorialzine.com/2011/05/generating-files-javascript-php/
 * (assets/jquery.generateFile.js) (janiemi 2014-02-27)
 */

(function($) {

    // Creating a jQuery plugin:
    $.generateFile = function(script, data) {

        c.log("generateFile", script, data);
        data = data || {};

        // Creating a 1 by 1 px invisible iframe:
        var iframe = $('<iframe>', {
            id: 'generate-file',
            width: 1,
            height: 1,
            frameborder: 0,
            css: {
                display: 'none'
            }
        }).appendTo('body');

        var formHTML = '<form action="" method="post">';
        for (var key in data) {
            formHTML += '<input type="hidden" name="' + key + '" />';
        }
        formHTML += '</form>';

        // Giving IE a chance to build the DOM in
        // the iframe with a short timeout:
        setTimeout(function() {

            // The body element of the iframe document:
            var body = ((iframe.prop('contentDocument') !== undefined)
                        ? iframe.prop('contentDocument').body
                        : iframe.prop('document').body);	// IE
            body = $(body);

            // Adding the form to the body:
            body.html(formHTML);

            var form = body.find('form');
            form.attr('action', script);
            for (var key in data) {
                form.find('input[name=' + key + ']').val(data[key]);
            }

            // Submitting the form to the download script. This will
            // cause the file download dialog box to appear.
            form.submit();
        }, 50);

	// TODO: Check for a possible error message printed to iframe.
	// Should $.generateFile have a callback function argument for
	// handling error messages? How do we recognize an error
	// message and for how long should we wait for one to appear?
	// Is it at all possible?
    };

})(jQuery);

