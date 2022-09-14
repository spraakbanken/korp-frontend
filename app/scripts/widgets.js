/** @format */
let widget = require("components-jqueryui/ui/widget")

widget("korp.radioList", {
    options: {
        change: $.noop,
        separator: "|",
        selected: "default",
    },

    _create() {
        this._super()
        const self = this
        $.each(this.element, function () {
            return $(this)
                .children()
                .wrap("<li></li>")
                .click(function () {
                    if (!$(this).is(".radioList_selected")) {
                        self.select($(this).data("mode"))
                        return self._trigger("change", $(this).data("mode"))
                    }
                })
                .parent()
                .prepend($("<span>").text(self.options.separator))
                .wrapAll("<ul class='inline_list'></ul>")
        })

        this.element.find(".inline_list span:first").remove()
        return this.select(this.options.selected)
    },

    select(mode) {
        this.options.selected = mode
        const target = this.element.find("a").filter(function () {
            return $(this).data("mode") === mode
        })
        this.element.find(".radioList_selected").removeClass("radioList_selected")
        this.element.find(target).addClass("radioList_selected")
        return this.element
    },

    getSelected() {
        return this.element.find(".radioList_selected")
    },
})
