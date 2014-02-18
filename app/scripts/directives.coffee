korpApp.directive 'kwicWord', ->
    replace: true
    template : """<span class="word" set-class="getClassObj(wd)"
                    set-text="wd.word + ' '" ></span>
                """ #ng-click="wordClick($event, wd, sentence)"
    link : (scope, element) ->
        # scope.getClassObj = (wd) ->
        #     output =
        #         reading_match : wd._match
        #         punct : wd._punct
        #         match_sentence : wd._matchSentence

        #     for struct in (wd._struct or [])
        #         output["struct_" + struct] = true

        #     for struct in (wd._open or [])
        #         output["open_" + struct] = true
        #     for struct in (wd._close or [])
        #         output["close_" + struct] = true
        scope.getClassObj = (wd) ->
            output =
                reading_match : wd._match
                punct : wd._punct
                match_sentence : wd._matchSentence

            for struct in (wd._struct or [])
                output["struct_" + struct] = true

            for struct in (wd._open or [])
                output["open_" + struct] = true
            for struct in (wd._close or [])
                output["close_" + struct] = true



            return (x for [x, y] in _.pairs output when y).join " "


korpApp.directive "tabHash", (util, $location) ->
    link : (scope, elem, attr) ->
        s = scope

        watchHash = () ->
            util.setupHash s,[
                expr : "getSelected()"
                val_out : (val) ->
                    c.log "val out", val
                    return val
                val_in : (val) ->
                    c.log "val_in", typeof val
                    s.setSelected parseInt(val)
                    return parseInt(val)
                key : attr.tabHash
                default : 0
            ]

        init_tab = parseInt($location.search()[attr.tabHash]) or 0
        c.log "tab init", init_tab, s.tabs.length


        w = scope.$watch "tabs.length", (len) ->
            c.log "tabs.length", len
            if (len - 1) >= init_tab
                s.setSelected(init_tab)
                watchHash()
                c.log "watchHash()"
                w()



        s.getSelected = () ->
            for p, i in s.tabs
                return i if p.active
        s.setSelected = (index) ->
            for t in s.tabs
                t.active = false
            if s.tabs[index]
                s.tabs[index].active = true



korpApp.directive "tokenValue", ($compile, $controller) ->
    defaultTmpl = "<input ng-model='model'>"

    # require:'ngModel',
    scope :
        tokenValue : "="
        model : "=ngModel"
    template : """
        <div class="arg_value">{{tokenValue.label}}</div>
    """
    link : (scope, elem, attr, ngModelCtrl) ->
        scope.$watch "tokenValue", (valueObj) ->
            # c.log "watch value", valueObj
            unless valueObj then return

            

            # _.extend scope, (_.pick valueObj, "dataset", "translationKey")
            if valueObj.controller
                locals = {$scope : _.extend scope, valueObj} 

                $controller(valueObj.controller, locals)
            # valueObj.controller?(scope, _.omit valueObj)

            tmplElem = $compile(valueObj.extended_template or defaultTmpl)(scope)
            elem.html(tmplElem)


korpApp.directive "korpAutocomplete", () ->
    scope : 
        model : "="
        stringify : "="
        sorter : "="
        type : "@"
    link : (scope, elem, attr) ->
        
        c.log "scope.model", scope.model, scope.type
        setVal = (lemgram) ->
            $(elem).attr("placeholder", scope.stringify(lemgram, true).replace(/<\/?[^>]+>/g, ""))
                .val("").blur().placeholder()
        if scope.model
            setVal(scope.model)
        arg_value = elem.korp_autocomplete(
            labelFunction: scope.stringify
            sortFunction: scope.sorter
            type: scope.type
            select: (lemgram) ->
                c.log "extended lemgram", lemgram, $(this)
                # $(this).data "value", (if data.label is "baseform" then lemgram.split(".")[0] else lemgram)
                setVal(lemgram)
                scope.$apply () ->
                    if scope.type == "baseform"
                        scope.model = lemgram.split(".")[0]
                    else 
                        scope.model = lemgram

            "sw-forms": true
        )
        .blur(->
            input = this
            setTimeout (->
                c.log "blur"

                if ($(input).val().length and not util.isLemgramId($(input).val())) or $(input).data("value") is null
                    $(input).addClass("invalid_input").attr("placeholder", null).data("value", null).placeholder()
                else
                    $(input).removeClass("invalid_input")
                # self._trigger "change"
            ), 100
        )


korpApp.directive "slider", () ->
    template : """
        
    """
    link : () ->
        all_years = _(settings.corpusListing.selected)
                    .pluck("time")
                    .map(_.pairs)
                    .flatten(true)
                    .filter((tuple) ->
                        tuple[0] and tuple[1]
                    ).map(_.compose(Number, _.head))
                    .value()
        # c.log "all", all_years
        start = Math.min(all_years...)
        end = Math.max(all_years...)
        # arg_value = $("<div>")
        arg_value.data "value", [start, end]
        from = $("<input type='text' class='from'>").val(start)
        to = $("<input type='text' class='to'>").val(end)
        slider = $("<div />").slider(
            range: true
            min: start
            max: end
            values: [start, end]
            slide: (event, ui) ->
                from.val ui.values[0]
                to.val ui.values[1]

            change: (event, ui) ->
                $(this).data "value", ui.values
                arg_value.data "value", ui.values
                self._trigger "change"
        )
        from.add(to).keyup ->
            self._trigger "change"

        arg_value.append slider, from, to



korpApp.directive "constr", ($window) ->
    link : (scope, elem, attr) ->
        $window[attr.constrName] = new $window.view[attr.constr](elem, elem, scope)
        # c.log "$window[attr.constrName]", $window[attr.constrName], elem


korpApp.directive "korpPopover", ($window) ->
    link : (scope, elem, attr) ->
        popover = elem.parent().next()
        scope.isPopoverVisible = false
        scope.popShow = () ->
            scope.isPopoverVisible = true
            popover.show("fade", "fast").position
                my : "center top"
                at : "center bottom+10"
                of : elem
        scope.popHide = () ->
            scope.isPopoverVisible = false
            popover.hide("fade", "fast")



    
