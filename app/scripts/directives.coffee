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


korpApp.directive "tabHash", (utils, $location) ->
    link : (scope, elem, attr) ->
        s = scope

        watchHash = () ->
            utils.setupHash s,[
                expr : "getSelected()"
                val_out : (val) ->
                    return val
                val_in : (val) ->
                    s.setSelected parseInt(val)
                    return parseInt(val)
                key : attr.tabHash
                default : 0
            ]

        init_tab = parseInt($location.search()[attr.tabHash]) or 0


        w = scope.$watch "tabs.length", (len) ->
            if (len - 1) >= init_tab
                s.setSelected(init_tab)
                watchHash()
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
    # defaultTmpl = "<input ng-model='model' 
    #             placeholder='{{tokenValue.value == \"word\" && !model.length && \"any\" | loc}} '>"
    defaultTmpl = """<input ng-model='model' class='arg_value'
                placeholder='<{{"any" | loc}}>'>
                <span class='val_mod' popper
                    ng-class='{sensitive : case == "sensitive", insensitive : case == "insensitive"}'>
                        Aa
                </span> 
                <ul class='mod_menu popper_menu dropdown-menu'>
                    <li><a ng-click='makeSensitive()'>{{'case_sensitive' | loc}}</a></li>
                    <li><a ng-click='makeInsensitive()'>{{'case_insensitive' | loc}}</a></li>
                </ul>
                """
    defaultController = ($scope) ->
        $scope.case = "sensitive"
        $scope.makeSensitive = () ->
            $scope.case = "sensitive"
            delete $scope.orObj.flags?["c"]
            # $scope.$emit("change_case", "sensitive")

        $scope.makeInsensitive = () ->
            flags = ($scope.orObj.flags or {})
            flags["c"] = true
            $scope.orObj.flags = flags

            $scope.case = "insensitive"
            # $scope.$emit("change_case", "insensitive")
            



    # require:'ngModel',
    scope :
        tokenValue : "="
        model : "=ngModel"
        orObj : "=orObj"
    template : """
        <div class="arg_value">{{tokenValue.label}}</div>
    """
    link : (scope, elem, attr) ->
        scope.$watch "tokenValue", (valueObj) ->
            c.log "watch value", valueObj
            unless valueObj then return

            

            # _.extend scope, (_.pick valueObj, "dataset", "translationKey")
            locals = {$scope : _.extend scope, valueObj} 
            $controller(valueObj.controller or defaultController, locals)

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
        c.log "constr scope", scope
        instance = new $window.view[attr.constr](elem, elem, scope)
        if attr.constrName
            $window[attr.constrName] = instance

        scope.instance = instance

        # c.log "$window[attr.constrName]", $window[attr.constrName], elem




korpApp.directive "searchSubmit", ($window, $document, $rootElement) ->
    template : '''
    <div class="search_submit">
        <div class="btn-group">
            <button class="btn btn-small" id="sendBtn" ng-click="onSendClick()">Sök</button>
            <button class="btn btn-small opener" ng-click="togglePopover()">
                <span class="caret"></span>
            </button>
        </div>
        <div class="popover compare {{pos}}">
            <div class="arrow"></div>
            <h3 class="popover-title">Spara för jämförelse</h3>
            <form class="popover-content" ng-submit="onSubmit()">
                <div>
                    <label for="cmp_input">Namn:</label> <input id="cmp_input" ng-model="name">
                </div>
                <div class="btn_container"><button class="btn btn-primary btn-small">Spara</button></div>
            </form>
        </div>
    </div>
    '''
    restrict : "E"
    replace : true
    link : (scope, elem, attr) ->
        s = scope
        s.pos = attr.pos or "bottom"
        s.togglePopover = () ->
            if s.isPopoverVisible
                s.popHide()
            else
                s.popShow()

        popover = elem.find(".popover")
        s.isPopoverVisible = false
        trans = 
            bottom : "top"
            top : "bottom"
            right : "left"
            left : "right"
        horizontal = s.pos in ["top", "bottom"]
        if horizontal
            my = "center " + trans[s.pos]
            at = "center " + s.pos + "+10"
        else
            my = trans[s.pos] + " center"
            at = s.pos + "+10 center"


        onEscape = (event) ->
            if event.which == 27 #escape
                s.popHide()
                return false

        s.popShow = () ->
            s.isPopoverVisible = true
            popover.show("fade", "fast").focus().position
                my : my
                at : at
                of : elem.find(".opener")

            $rootElement.on "keydown", onEscape

        s.popHide = () ->
            s.isPopoverVisible = false
            popover.hide("fade", "fast")
            $rootElement.off "keydown", onEscape


        s.onSubmit = () ->
            s.popHide()
            s.$broadcast('popover_submit', s.name)

        s.onSendClick = () ->
            s.$broadcast('btn_submit')


korpApp.directive "meter", () ->
    scope :
        meter : "="
        max : "="
        stringify : "="
    link : (scope, elem, attr) ->
        wds = scope.meter[0]

        # for wd in _.compact wds.split("|")
        #     c.log "wd", wd
        #     elem.html scope.stringify wd
        elem.html (_.map (_.compact wds.split("|")), scope.stringify).join(", ")

        w = elem.parent().width()
        part = ((Math.abs scope.meter[1]) / (Math.abs scope.max))

        elem.width Math.round (part * w)



korpApp.directive "popper", ($rootElement) ->
    link : (scope, elem, attrs) ->
        popup = elem.next()
        popup.appendTo("body").hide()
        closePopup = () ->
            popup.hide()
        
        popup.on "click", (event) ->
            closePopup()
            return false



        elem.on "click", (event) ->
            if popup.is(":visible") then closePopup()
            else popup.show()

            popup.position
                my : "right top"
                at : "bottom right"
                of : elem

            return false

        $rootElement.on "click", () ->
            closePopup()




korpApp.directive "tabSpinner", ($rootElement) ->
    template : """
    <i class="fa fa-times-circle close_icon"></i> 
        <span class="tab_spinner" 
            us-spinner="{lines : 8 ,radius:4, width:1.5, length: 2.5, left : 4, top : -12}"></span>
    """

