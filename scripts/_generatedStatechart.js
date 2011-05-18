function StatechartExecutionContext() {
    var self = this; //used in the rare occasions we call public functions from inside this class
    //system variable declarations
    var _event = {
        name: undefined,
        data: undefined
    },
        _name = "",
        _sessionid;
    var _x = {
        _event: _event,
        _name: _name,
        _sessionid: _sessionid
    };
    //variable declarations relating to data model
    //send timeout id variables
    var $default_Regexp_id0x00000000290d8600 = /^($default)/,
        submit_kwic_Regexp_id0x0000000029192540 = /^(submit\.kwic)/,
        searchtab_simple_Regexp_id0x00000000291748d0 = /^(searchtab\.simple)/,
        searchtab_extended_Regexp_id0x0000000029174be0 = /^(searchtab\.extended)/,
        searchtab_advanced_Regexp_id0x000000002915f2d0 = /^(searchtab\.advanced)/,
        submit_lemgram_Regexp_id0x0000000029102d50 = /^(submit\.lemgram)/,
        submit_Regexp_id0x00000000290cfbb0 = /^(submit)/,
        resultstab_kwic_Regexp_id0x00000000291761f0 = /^(resultstab\.kwic)/,
        resultstab_lemgram_Regexp_id0x0000000029170e10 = /^(resultstab\.lemgram)/,
        resultstab_stats_Regexp_id0x0000000029171090 = /^(resultstab\.stats)/,
        word_deselect_Regexp_id0x00000000291620e0 = /^(word\.deselect)/,
        word_select_Regexp_id0x000000002910fa80 = /^(word\.select)/,
        sidebar_show_Regexp_id0x00000000290c09d0 = /^(sidebar\.show)/,
        sidebar_hide_Regexp_id0x00000000291a1440 = /^(sidebar\.hide)/,
        star_Regexp_id0x00000000291a03d0 = /.*/;
    //abstract state
    var AbstractState = new
    function() {
        //triggers are methods
        this.$default = function() {};
        this.submit = function() {};
        this.$default = function() {};
        this.$dispatchPrefixEvent = function() {};
    }
    //states
    var scxml_id0x0000000027ec41c0 = (function() {
        function scxml_id0x0000000027ec41c0Constructor() {
            this.parent = AbstractState;
            this.initial = null;
            this.depth = 0;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            false;
            this.toString = function() {
                return "scxml_id0x0000000027ec41c0"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("scxml_id0x0000000027ec41c0");
                }
            }
            this.exitAction = function() {
                for (var id0x0000000029181db0_iterator = 0, id0x0000000029181db0_hoist = listeners.length;
                id0x0000000029181db0_iterator < id0x0000000029181db0_hoist;
                id0x0000000029181db0_iterator++) {
                    var listener = listeners[id0x0000000029181db0_iterator];
                    //from
                    listener.onExit("scxml_id0x0000000027ec41c0");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                return AbstractState.$dispatchPrefixEvent(e);
            }
        }
        scxml_id0x0000000027ec41c0Constructor.prototype = AbstractState;
        return new scxml_id0x0000000027ec41c0Constructor();
    })();
    var _initial = (function() {
        function _initialConstructor() {
            this.parent = scxml_id0x0000000027ec41c0;
            this.initial = null;
            this.depth = 1;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                ];
            this.parent.initial = this; //init parent's pointer to initial state
            this.toString = function() {
                return "_initial"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("_initial");
                }
            }
            this.exitAction = function() {
                for (var id0x00000000291a54d0_iterator = 0, id0x00000000291a54d0_hoist = listeners.length;
                id0x00000000291a54d0_iterator < id0x00000000291a54d0_hoist;
                id0x00000000291a54d0_iterator++) {
                    var listener = listeners[id0x00000000291a54d0_iterator];
                    //from
                    listener.onExit("_initial");
                }
            }
            this.$default = function() {
                return {
                    preemptedBasicStates: {
                        init: true,
                        simple: true,
                        extended: true,
                        advanced: true,
                        results_hidden: true,
                        kwic_word_selected: true,
                        kwic_word_not_selected: true,
                        results_lemgram: true,
                        results_stats: true,
                        sidebar_hidden: true,
                        sidebar_visible: true,
                        l2: true
                    },
                    action: function() {
                        hasTakenDefaultTransition = true;
                        //exit states
                        _initial.exitAction();
                        //transition action
                        for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                        id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                        id0x0000000000000000_iterator++) {
                            var listener = listeners[id0x0000000000000000_iterator];
                            //transition id
                            listener.onTransition("", "init", "_initial_$default_1");
                        }
                        //enter states
                        init.enterAction();
                        //update configuration
                        currentConfiguration = [
                            init
                            ];
                    }
                }
                return scxml_id0x0000000027ec41c0['$default']();
            }
            this.$dispatchPrefixEvent = function(e) {
                return scxml_id0x0000000027ec41c0.$dispatchPrefixEvent(e);
            }
        }
        _initialConstructor.prototype = scxml_id0x0000000027ec41c0;
        return new _initialConstructor();
    })();
    var init = (function() {
        function initConstructor() {
            this.parent = scxml_id0x0000000027ec41c0;
            this.initial = null;
            this.depth = 1;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                ];
            this.toString = function() {
                return "init"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("init");
                }
            }
            this.exitAction = function() {
                for (var id0x0000000029154240_iterator = 0, id0x0000000029154240_hoist = listeners.length;
                id0x0000000029154240_iterator < id0x0000000029154240_hoist;
                id0x0000000029154240_iterator++) {
                    var listener = listeners[id0x0000000029154240_iterator];
                    //from
                    listener.onExit("init");
                }
            }
            this.$default = function() {
                return {
                    preemptedBasicStates: {
                        init: true,
                        simple: true,
                        extended: true,
                        advanced: true,
                        results_hidden: true,
                        kwic_word_selected: true,
                        kwic_word_not_selected: true,
                        results_lemgram: true,
                        results_stats: true,
                        sidebar_hidden: true,
                        sidebar_visible: true,
                        l2: true
                    },
                    action: function() {
                        hasTakenDefaultTransition = true;
                        //exit states
                        init.exitAction();
                        //transition action
                        simpleSearch = new view.SimpleSearch('#korp-simple');
                        extendedSearch = new view.ExtendedSearch('#korp-extended');
                        advancedSearch = new view.AdvancedSearch('#korp-advanced');
                        kwicResults = new view.KWICResults('#result-container li:first');
                        lemgramResults = new view.LemgramResults('#result-container li:nth-child(3)');
                        statsResults = new view.StatsResults('#result-container li:nth-child(4)');
                        searchProxy = new model.SearchProxy();
                        kwicProxy = new model.KWICProxy();
                        lemgramProxy = new model.LemgramProxy();
                        statsProxy = new model.StatsProxy();
                        for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                        id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                        id0x0000000000000000_iterator++) {
                            var listener = listeners[id0x0000000000000000_iterator];
                            //transition id
                            listener.onTransition("", "main_initial", "init_$default_2");
                        }
                        //enter states
                        main.enterAction();
                        main_initial.enterAction();
                        //update configuration
                        currentConfiguration = [
                            main_initial
                            ];
                    }
                }
                return scxml_id0x0000000027ec41c0['$default']();
            }
            this.$dispatchPrefixEvent = function(e) {
                return scxml_id0x0000000027ec41c0.$dispatchPrefixEvent(e);
            }
        }
        initConstructor.prototype = scxml_id0x0000000027ec41c0;
        return new initConstructor();
    })();
    var main = (function() {
        function mainConstructor() {
            this.parent = scxml_id0x0000000027ec41c0;
            this.initial = null;
            this.depth = 1;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            false;
            this.toString = function() {
                return "main"
            }
            this.enterAction = function() {
                console.log(' entered main : ');
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("main");
                }
            }
            this.exitAction = function() {
                for (var id0x000000002914e9e0_iterator = 0, id0x000000002914e9e0_hoist = listeners.length;
                id0x000000002914e9e0_iterator < id0x000000002914e9e0_hoist;
                id0x000000002914e9e0_iterator++) {
                    var listener = listeners[id0x000000002914e9e0_iterator];
                    //from
                    listener.onExit("main");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                return scxml_id0x0000000027ec41c0.$dispatchPrefixEvent(e);
            }
        }
        mainConstructor.prototype = scxml_id0x0000000027ec41c0;
        return new mainConstructor();
    })();
    var main_initial = (function() {
        function main_initialConstructor() {
            this.parent = main;
            this.initial = null;
            this.depth = 2;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                ];
            this.parent.initial = this; //init parent's pointer to initial state
            this.toString = function() {
                return "main_initial"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("main_initial");
                }
            }
            this.exitAction = function() {
                for (var id0x000000002914ea90_iterator = 0, id0x000000002914ea90_hoist = listeners.length;
                id0x000000002914ea90_iterator < id0x000000002914ea90_hoist;
                id0x000000002914ea90_iterator++) {
                    var listener = listeners[id0x000000002914ea90_iterator];
                    //from
                    listener.onExit("main_initial");
                }
            }
            this.$default = function() {
                return {
                    preemptedBasicStates: {
                        simple: true,
                        extended: true,
                        advanced: true,
                        results_hidden: true,
                        kwic_word_selected: true,
                        kwic_word_not_selected: true,
                        results_lemgram: true,
                        results_stats: true,
                        sidebar_hidden: true,
                        sidebar_visible: true,
                        l2: true
                    },
                    action: function() {
                        hasTakenDefaultTransition = true;
                        //exit states
                        main_initial.exitAction();
                        //transition action
                        for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                        id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                        id0x0000000000000000_iterator++) {
                            var listener = listeners[id0x0000000000000000_iterator];
                            //transition id
                            listener.onTransition("", "p_initial", "main_initial_$default_3");
                        }
                        //enter states
                        p.enterAction();
                        p_initial.enterAction();
                        //update configuration
                        currentConfiguration = [
                            p_initial
                            ];
                    }
                }
                return main['$default']();
            }
            this.$dispatchPrefixEvent = function(e) {
                return main.$dispatchPrefixEvent(e);
            }
        }
        main_initialConstructor.prototype = main;
        return new main_initialConstructor();
    })();
    var p = (function() {
        function pConstructor() {
            this.parent = main;
            this.initial = null;
            this.depth = 2;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            false;
            this.toString = function() {
                return "p"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("p");
                }
            }
            this.exitAction = function() {
                for (var id0x000000002914ad60_iterator = 0, id0x000000002914ad60_hoist = listeners.length;
                id0x000000002914ad60_iterator < id0x000000002914ad60_hoist;
                id0x000000002914ad60_iterator++) {
                    var listener = listeners[id0x000000002914ad60_iterator];
                    //from
                    listener.onExit("p");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                return main.$dispatchPrefixEvent(e);
            }
        }
        pConstructor.prototype = main;
        return new pConstructor();
    })();
    var p_initial = (function() {
        function p_initialConstructor() {
            this.parent = p;
            this.initial = null;
            this.depth = 3;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                ];
            this.parent.initial = this; //init parent's pointer to initial state
            this.toString = function() {
                return "p_initial"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("p_initial");
                }
            }
            this.exitAction = function() {
                for (var id0x000000002914ae10_iterator = 0, id0x000000002914ae10_hoist = listeners.length;
                id0x000000002914ae10_iterator < id0x000000002914ae10_hoist;
                id0x000000002914ae10_iterator++) {
                    var listener = listeners[id0x000000002914ae10_iterator];
                    //from
                    listener.onExit("p_initial");
                }
            }
            this.$default = function() {
                return {
                    preemptedBasicStates: {
                        simple: true,
                        extended: true,
                        advanced: true,
                        results_hidden: true,
                        kwic_word_selected: true,
                        kwic_word_not_selected: true,
                        results_lemgram: true,
                        results_stats: true,
                        sidebar_hidden: true,
                        sidebar_visible: true,
                        l2: true
                    },
                    action: function() {
                        hasTakenDefaultTransition = true;
                        //exit states
                        p_initial.exitAction();
                        //transition action
                        for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                        id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                        id0x0000000000000000_iterator++) {
                            var listener = listeners[id0x0000000000000000_iterator];
                            //transition id
                            listener.onTransition("", "search_initial", "p_initial_$default_4");
                            listener.onTransition("", "results_initial", "p_initial_$default_5");
                            listener.onTransition("", "sidebar_initial", "p_initial_$default_6");
                            listener.onTransition("", "logger_initial", "p_initial_$default_7");
                        }
                        //enter states
                        logger.enterAction();
                        logger_initial.enterAction();
                        sidebar.enterAction();
                        sidebar_initial.enterAction();
                        results.enterAction();
                        results_initial.enterAction();
                        search.enterAction();
                        search_initial.enterAction();
                        //update configuration
                        currentConfiguration = [
                            search_initial, results_initial, sidebar_initial, logger_initial
                            ];
                    }
                }
                return p['$default']();
            }
            this.$dispatchPrefixEvent = function(e) {
                return p.$dispatchPrefixEvent(e);
            }
        }
        p_initialConstructor.prototype = p;
        return new p_initialConstructor();
    })();
    var search = (function() {
        function searchConstructor() {
            this.parent = p;
            this.initial = null;
            this.depth = 3;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            false;
            this.toString = function() {
                return "search"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("search");
                }
            }
            this.exitAction = function() {
                for (var id0x0000000029142850_iterator = 0, id0x0000000029142850_hoist = listeners.length;
                id0x0000000029142850_iterator < id0x0000000029142850_hoist;
                id0x0000000029142850_iterator++) {
                    var listener = listeners[id0x0000000029142850_iterator];
                    //from
                    listener.onExit("search");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                return p.$dispatchPrefixEvent(e);
            }
        }
        searchConstructor.prototype = p;
        return new searchConstructor();
    })();
    var search_initial = (function() {
        function search_initialConstructor() {
            this.parent = search;
            this.initial = null;
            this.depth = 4;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    search
                ];
            this.parent.initial = this; //init parent's pointer to initial state
            this.toString = function() {
                return "search_initial"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("search_initial");
                }
            }
            this.exitAction = function() {
                for (var id0x0000000029142980_iterator = 0, id0x0000000029142980_hoist = listeners.length;
                id0x0000000029142980_iterator < id0x0000000029142980_hoist;
                id0x0000000029142980_iterator++) {
                    var listener = listeners[id0x0000000029142980_iterator];
                    //from
                    listener.onExit("search_initial");
                }
            }
            this.$default = function() {
                return {
                    preemptedBasicStates: {
                        simple: true,
                        extended: true,
                        advanced: true
                    },
                    action: function() {
                        hasTakenDefaultTransition = true;
                        //exit states
                        search_initial.exitAction();
                        //transition action
                        for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                        id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                        id0x0000000000000000_iterator++) {
                            var listener = listeners[id0x0000000000000000_iterator];
                            //transition id
                            listener.onTransition("", "simple", "search_initial_$default_8");
                        }
                        //enter states
                        search_inner.enterAction();
                        simple.enterAction();
                        //update configuration
                        currentConfiguration.splice(
                        indexOf(currentConfiguration, search_initial), 1, simple);
                    }
                }
                return search['$default']();
            }
            this.$dispatchPrefixEvent = function(e) {
                return search.$dispatchPrefixEvent(e);
            }
        }
        search_initialConstructor.prototype = search;
        return new search_initialConstructor();
    })();
    var search_inner = (function() {
        function search_innerConstructor() {
            this.parent = search;
            this.initial = null;
            this.depth = 4;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            false;
            this.toString = function() {
                return "search_inner"
            }
            this.enterAction = function() {
                if ($("#result-container").is(".ui-tabs")) $("#result-container").tabs("option", "disabled", [0, 2, 3]);
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("search_inner");
                }
            }
            this.exitAction = function() {
                this.historyState.lastConfiguration = currentConfiguration.slice();
                for (var id0x000000002913f310_iterator = 0, id0x000000002913f310_hoist = listeners.length;
                id0x000000002913f310_iterator < id0x000000002913f310_hoist;
                id0x000000002913f310_iterator++) {
                    var listener = listeners[id0x000000002913f310_iterator];
                    //from
                    listener.onExit("search_inner");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                if (e.match(submit_kwic_Regexp_id0x0000000029192540)) {
                    return {
                        preemptedBasicStates: {
                            simple: true,
                            extended: true,
                            advanced: true
                        },
                        action: function() {
                            //exit states
                            var statesExited = [];
                            var lca = search;
                            var nonBasicTriggerDispatcherExitBlockIteratorExpression = currentConfiguration;
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = nonBasicTriggerDispatcherExitBlockIteratorExpression.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var state = nonBasicTriggerDispatcherExitBlockIteratorExpression[id0x0000000000000000_iterator];
                                if (
                                indexOf(state.ancestors, lca) !== -1) {
                                    do {
                                        statesExited.push(state);
                                    } while ((state = state.parent) && state != lca && indexOf(statesExited, state) == -1)
                                }
                            }
                            //sort by depth
                            statesExited.sort(sortByDepthDeepToShallow);
                            //execute actions for each of these states
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = statesExited.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var state = statesExited[id0x0000000000000000_iterator];
                                state.exitAction();
                            }
                            //transition action
                            //simpleSearch.clear();
                            $("#simple_text").get(0).blur();
                            simpleSearch.resetView();
                            kwicProxy.makeRequest();
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var listener = listeners[id0x0000000000000000_iterator];
                                //transition id
                                listener.onTransition("search_inner", "search_history", "search_inner_submit.kwic_10");
                            }
                            //enter states
                            search_inner.enterAction();
                            search_history.enterAction();
                            //update configuration
                            currentConfiguration.splice(
                            indexOf(currentConfiguration, statesExited[0]), 1, search_history);
                        }
                    }
                }
                if (e.match(searchtab_simple_Regexp_id0x00000000291748d0)) {
                    return {
                        preemptedBasicStates: {
                            simple: true,
                            extended: true,
                            advanced: true
                        },
                        action: function() {
                            //exit states
                            var statesExited = [];
                            var lca = search;
                            var nonBasicTriggerDispatcherExitBlockIteratorExpression = currentConfiguration;
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = nonBasicTriggerDispatcherExitBlockIteratorExpression.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var state = nonBasicTriggerDispatcherExitBlockIteratorExpression[id0x0000000000000000_iterator];
                                if (
                                indexOf(state.ancestors, lca) !== -1) {
                                    do {
                                        statesExited.push(state);
                                    } while ((state = state.parent) && state != lca && indexOf(statesExited, state) == -1)
                                }
                            }
                            //sort by depth
                            statesExited.sort(sortByDepthDeepToShallow);
                            //execute actions for each of these states
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = statesExited.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var state = statesExited[id0x0000000000000000_iterator];
                                state.exitAction();
                            }
                            //transition action
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var listener = listeners[id0x0000000000000000_iterator];
                                //transition id
                                listener.onTransition("search_inner", "simple", "search_inner_searchtab.simple_11");
                            }
                            //enter states
                            search_inner.enterAction();
                            simple.enterAction();
                            //update configuration
                            currentConfiguration.splice(
                            indexOf(currentConfiguration, statesExited[0]), 1, simple);
                        }
                    }
                }
                if (e.match(searchtab_extended_Regexp_id0x0000000029174be0)) {
                    return {
                        preemptedBasicStates: {
                            simple: true,
                            extended: true,
                            advanced: true
                        },
                        action: function() {
                            //exit states
                            var statesExited = [];
                            var lca = search;
                            var nonBasicTriggerDispatcherExitBlockIteratorExpression = currentConfiguration;
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = nonBasicTriggerDispatcherExitBlockIteratorExpression.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var state = nonBasicTriggerDispatcherExitBlockIteratorExpression[id0x0000000000000000_iterator];
                                if (
                                indexOf(state.ancestors, lca) !== -1) {
                                    do {
                                        statesExited.push(state);
                                    } while ((state = state.parent) && state != lca && indexOf(statesExited, state) == -1)
                                }
                            }
                            //sort by depth
                            statesExited.sort(sortByDepthDeepToShallow);
                            //execute actions for each of these states
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = statesExited.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var state = statesExited[id0x0000000000000000_iterator];
                                state.exitAction();
                            }
                            //transition action
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var listener = listeners[id0x0000000000000000_iterator];
                                //transition id
                                listener.onTransition("search_inner", "extended", "search_inner_searchtab.extended_12");
                            }
                            //enter states
                            search_inner.enterAction();
                            extended.enterAction();
                            //update configuration
                            currentConfiguration.splice(
                            indexOf(currentConfiguration, statesExited[0]), 1, extended);
                        }
                    }
                }
                if (e.match(searchtab_advanced_Regexp_id0x000000002915f2d0)) {
                    return {
                        preemptedBasicStates: {
                            simple: true,
                            extended: true,
                            advanced: true
                        },
                        action: function() {
                            //exit states
                            var statesExited = [];
                            var lca = search;
                            var nonBasicTriggerDispatcherExitBlockIteratorExpression = currentConfiguration;
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = nonBasicTriggerDispatcherExitBlockIteratorExpression.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var state = nonBasicTriggerDispatcherExitBlockIteratorExpression[id0x0000000000000000_iterator];
                                if (
                                indexOf(state.ancestors, lca) !== -1) {
                                    do {
                                        statesExited.push(state);
                                    } while ((state = state.parent) && state != lca && indexOf(statesExited, state) == -1)
                                }
                            }
                            //sort by depth
                            statesExited.sort(sortByDepthDeepToShallow);
                            //execute actions for each of these states
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = statesExited.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var state = statesExited[id0x0000000000000000_iterator];
                                state.exitAction();
                            }
                            //transition action
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var listener = listeners[id0x0000000000000000_iterator];
                                //transition id
                                listener.onTransition("search_inner", "advanced", "search_inner_searchtab.advanced_13");
                            }
                            //enter states
                            search_inner.enterAction();
                            advanced.enterAction();
                            //update configuration
                            currentConfiguration.splice(
                            indexOf(currentConfiguration, statesExited[0]), 1, advanced);
                        }
                    }
                }
                return search.$dispatchPrefixEvent(e);
            }
        }
        search_innerConstructor.prototype = search;
        return new search_innerConstructor();
    })();
    var search_history = (function() {
        function search_historyConstructor() {
            this.parent = search_inner;
            this.initial = null;
            this.depth = 5;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    search
                        ,
                    search_inner
                ];
            this.parent.historyState = this; //init parent's pointer to history state
            this.toString = function() {
                return "search_history"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("search_history");
                }
            }
            this.exitAction = function() {
                for (var id0x000000002913fa10_iterator = 0, id0x000000002913fa10_hoist = listeners.length;
                id0x000000002913fa10_iterator < id0x000000002913fa10_hoist;
                id0x000000002913fa10_iterator++) {
                    var listener = listeners[id0x000000002913fa10_iterator];
                    //from
                    listener.onExit("search_history");
                }
            }
            this.$default = function() {
                //history state semantics
                if (search_history.lastConfiguration) {
                    return {
                        preemptedBasicStates: {
                            simple: true,
                            extended: true,
                            advanced: true
                        },
                        action: function() {
                            //transition action
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var l = listeners[id0x0000000000000000_iterator];
                                //transition id
                                l.onTransition("", "simple", "search_history_$default_9");
                            }
                            var historyState = search_history;
                            var newConfiguration = [];
                            var historyStateParent = search_history.parent;
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = search_history.lastConfiguration.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var state = search_history.lastConfiguration[id0x0000000000000000_iterator];
                                if (
                                indexOf(state.ancestors, historyStateParent) != -1) {
                                    var statesEntered = [state];
                                    for (var parent = state.parent;
                                    parent != null && parent != historyState.parent;
                                    parent = parent.parent) {
                                        statesEntered.push(parent);
                                    }
                                    var topState = statesEntered.pop();
                                    topState.enterAction();
                                    newConfiguration.push(topState.initial ? topState.initial : topState);
                                }
                            }
                            var filteredConfiguration = [];
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = currentConfiguration.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var state = currentConfiguration[id0x0000000000000000_iterator];
                                if (
                                indexOf(state.ancestors, historyStateParent) == -1) {
                                    filteredConfiguration.push(state);
                                }
                            }
                            newConfiguration = newConfiguration.concat(filteredConfiguration)
                            var historyTriggerDispatcherCurrentConfigurationAssignmentRHS = newConfiguration;
                            currentConfiguration = historyTriggerDispatcherCurrentConfigurationAssignmentRHS;
                        }
                    }
                } else {
                    return {
                        preemptedBasicStates: {
                            simple: true,
                            extended: true,
                            advanced: true
                        },
                        action: function() {
                            hasTakenDefaultTransition = true;
                            //exit states
                            search_history.exitAction();
                            //transition action
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var listener = listeners[id0x0000000000000000_iterator];
                                //transition id
                                listener.onTransition("", "simple", "search_history_$default_9");
                            }
                            //enter states
                            simple.enterAction();
                            //update configuration
                            currentConfiguration.splice(
                            indexOf(currentConfiguration, search_history), 1, simple);
                        }
                    }
                }
                return search_inner['$default']();
            }
            this.$dispatchPrefixEvent = function(e) {
                return search_inner.$dispatchPrefixEvent(e);
            }
        }
        search_historyConstructor.prototype = search_inner;
        return new search_historyConstructor();
    })();
    var simple = (function() {
        function simpleConstructor() {
            this.parent = search_inner;
            this.initial = null;
            this.depth = 5;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    search
                        ,
                    search_inner
                ];
            this.toString = function() {
                return "simple"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("simple");
                }
            }
            this.exitAction = function() {
                $("#simple_text").autocomplete("close");
                for (var id0x00000000291374d0_iterator = 0, id0x00000000291374d0_hoist = listeners.length;
                id0x00000000291374d0_iterator < id0x00000000291374d0_hoist;
                id0x00000000291374d0_iterator++) {
                    var listener = listeners[id0x00000000291374d0_iterator];
                    //from
                    listener.onExit("simple");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                if (e.match(submit_lemgram_Regexp_id0x0000000029102d50)) {
                    return {
                        preemptedBasicStates: {
                            simple: true,
                            extended: true,
                            advanced: true
                        },
                        action: function() {
                            //exit states
                            simple.exitAction();
                            //transition action
                            lemgramSearch(_event.data);
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var listener = listeners[id0x0000000000000000_iterator];
                                //transition id
                                listener.onTransition("simple", "simple", "simple_submit.lemgram_14");
                            }
                            //enter states
                            simple.enterAction();
                            //update configuration
                            currentConfiguration.splice(
                            indexOf(currentConfiguration, simple), 1, simple);
                        }
                    }
                }
                return search_inner.$dispatchPrefixEvent(e);
            }
        }
        simpleConstructor.prototype = search_inner;
        return new simpleConstructor();
    })();
    var extended = (function() {
        function extendedConstructor() {
            this.parent = search_inner;
            this.initial = null;
            this.depth = 5;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    search
                        ,
                    search_inner
                ];
            this.toString = function() {
                return "extended"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("extended");
                }
            }
            this.exitAction = function() {
                for (var id0x0000000029138b40_iterator = 0, id0x0000000029138b40_hoist = listeners.length;
                id0x0000000029138b40_iterator < id0x0000000029138b40_hoist;
                id0x0000000029138b40_iterator++) {
                    var listener = listeners[id0x0000000029138b40_iterator];
                    //from
                    listener.onExit("extended");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                if (e.match(submit_kwic_Regexp_id0x0000000029192540)) {
                    return {
                        preemptedBasicStates: {
                            simple: true,
                            extended: true,
                            advanced: true
                        },
                        action: function() {
                            //exit states
                            extended.exitAction();
                            //transition action
                            advancedSearch.updateCQP();
                            simpleSearch.resetView();
                            kwicProxy.makeRequest();
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var listener = listeners[id0x0000000000000000_iterator];
                                //transition id
                                listener.onTransition("extended", "search_history", "extended_submit.kwic_15");
                            }
                            //enter states
                            search_history.enterAction();
                            //update configuration
                            currentConfiguration.splice(
                            indexOf(currentConfiguration, extended), 1, search_history);
                        }
                    }
                }
                if (e.match(submit_lemgram_Regexp_id0x0000000029102d50)) {
                    return {
                        preemptedBasicStates: {
                            simple: true,
                            extended: true,
                            advanced: true
                        },
                        action: function() {
                            //exit states
                            extended.exitAction();
                            //transition action
                            extendedSearch.setOneToken("lex", _event.data);
                            lemgramSearch(_event.data);
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var listener = listeners[id0x0000000000000000_iterator];
                                //transition id
                                listener.onTransition("extended", "search_history", "extended_submit.lemgram_16");
                            }
                            //enter states
                            search_history.enterAction();
                            //update configuration
                            currentConfiguration.splice(
                            indexOf(currentConfiguration, extended), 1, search_history);
                        }
                    }
                }
                return search_inner.$dispatchPrefixEvent(e);
            }
        }
        extendedConstructor.prototype = search_inner;
        return new extendedConstructor();
    })();
    var advanced = (function() {
        function advancedConstructor() {
            this.parent = search_inner;
            this.initial = null;
            this.depth = 5;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    search
                        ,
                    search_inner
                ];
            this.toString = function() {
                return "advanced"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("advanced");
                }
            }
            this.exitAction = function() {
                for (var id0x000000002913ae80_iterator = 0, id0x000000002913ae80_hoist = listeners.length;
                id0x000000002913ae80_iterator < id0x000000002913ae80_hoist;
                id0x000000002913ae80_iterator++) {
                    var listener = listeners[id0x000000002913ae80_iterator];
                    //from
                    listener.onExit("advanced");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                return search_inner.$dispatchPrefixEvent(e);
            }
        }
        advancedConstructor.prototype = search_inner;
        return new advancedConstructor();
    })();
    var results = (function() {
        function resultsConstructor() {
            this.parent = p;
            this.initial = null;
            this.depth = 3;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            false;
            this.toString = function() {
                return "results"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("results");
                }
            }
            this.exitAction = function() {
                for (var id0x00000000291346f0_iterator = 0, id0x00000000291346f0_hoist = listeners.length;
                id0x00000000291346f0_iterator < id0x00000000291346f0_hoist;
                id0x00000000291346f0_iterator++) {
                    var listener = listeners[id0x00000000291346f0_iterator];
                    //from
                    listener.onExit("results");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                return p.$dispatchPrefixEvent(e);
            }
        }
        resultsConstructor.prototype = p;
        return new resultsConstructor();
    })();
    var results_initial = (function() {
        function results_initialConstructor() {
            this.parent = results;
            this.initial = null;
            this.depth = 4;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    results
                ];
            this.parent.initial = this; //init parent's pointer to initial state
            this.toString = function() {
                return "results_initial"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("results_initial");
                }
            }
            this.exitAction = function() {
                for (var id0x0000000029134760_iterator = 0, id0x0000000029134760_hoist = listeners.length;
                id0x0000000029134760_iterator < id0x0000000029134760_hoist;
                id0x0000000029134760_iterator++) {
                    var listener = listeners[id0x0000000029134760_iterator];
                    //from
                    listener.onExit("results_initial");
                }
            }
            this.$default = function() {
                return {
                    preemptedBasicStates: {
                        results_hidden: true,
                        kwic_word_selected: true,
                        kwic_word_not_selected: true,
                        results_lemgram: true,
                        results_stats: true
                    },
                    action: function() {
                        hasTakenDefaultTransition = true;
                        //exit states
                        results_initial.exitAction();
                        //transition action
                        for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                        id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                        id0x0000000000000000_iterator++) {
                            var listener = listeners[id0x0000000000000000_iterator];
                            //transition id
                            listener.onTransition("", "results_hidden", "results_initial_$default_17");
                        }
                        //enter states
                        results_hidden.enterAction();
                        //update configuration
                        currentConfiguration.splice(
                        indexOf(currentConfiguration, results_initial), 1, results_hidden);
                    }
                }
                return results['$default']();
            }
            this.$dispatchPrefixEvent = function(e) {
                return results.$dispatchPrefixEvent(e);
            }
        }
        results_initialConstructor.prototype = results;
        return new results_initialConstructor();
    })();
    var results_hidden = (function() {
        function results_hiddenConstructor() {
            this.parent = results;
            this.initial = null;
            this.depth = 4;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    results
                ];
            this.toString = function() {
                return "results_hidden"
            }
            this.enterAction = function() {
                $('#results-wrapper').hide();
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("results_hidden");
                }
            }
            this.exitAction = function() {
                $('#results-wrapper').show();
                for (var id0x00000000291325e0_iterator = 0, id0x00000000291325e0_hoist = listeners.length;
                id0x00000000291325e0_iterator < id0x00000000291325e0_hoist;
                id0x00000000291325e0_iterator++) {
                    var listener = listeners[id0x00000000291325e0_iterator];
                    //from
                    listener.onExit("results_hidden");
                }
            }
            this.submit = function() {
                return {
                    preemptedBasicStates: {
                        results_hidden: true,
                        kwic_word_selected: true,
                        kwic_word_not_selected: true,
                        results_lemgram: true,
                        results_stats: true
                    },
                    action: function() {
                        //exit states
                        results_hidden.exitAction();
                        //transition action
                        for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                        id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                        id0x0000000000000000_iterator++) {
                            var listener = listeners[id0x0000000000000000_iterator];
                            //transition id
                            listener.onTransition("", "results_visible_initial", "results_hidden_submit_18");
                        }
                        //enter states
                        results_visible.enterAction();
                        results_visible_initial.enterAction();
                        //update configuration
                        currentConfiguration.splice(
                        indexOf(currentConfiguration, results_hidden), 1, results_visible_initial);
                    }
                }
                return results['submit']();
            }
            this.$dispatchPrefixEvent = function(e) {
                if (e.match(submit_Regexp_id0x00000000290cfbb0)) {
                    return {
                        preemptedBasicStates: {
                            results_hidden: true,
                            kwic_word_selected: true,
                            kwic_word_not_selected: true,
                            results_lemgram: true,
                            results_stats: true
                        },
                        action: function() {
                            //exit states
                            results_hidden.exitAction();
                            //transition action
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var listener = listeners[id0x0000000000000000_iterator];
                                //transition id
                                listener.onTransition("results_hidden", "results_visible_initial", "results_hidden_submit_18");
                            }
                            //enter states
                            results_visible.enterAction();
                            results_visible_initial.enterAction();
                            //update configuration
                            currentConfiguration.splice(
                            indexOf(currentConfiguration, results_hidden), 1, results_visible_initial);
                        }
                    }
                }
                return results.$dispatchPrefixEvent(e);
            }
        }
        results_hiddenConstructor.prototype = results;
        return new results_hiddenConstructor();
    })();
    var results_visible = (function() {
        function results_visibleConstructor() {
            this.parent = results;
            this.initial = null;
            this.depth = 4;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            false;
            this.toString = function() {
                return "results_visible"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("results_visible");
                }
            }
            this.exitAction = function() {
                for (var id0x000000002912e260_iterator = 0, id0x000000002912e260_hoist = listeners.length;
                id0x000000002912e260_iterator < id0x000000002912e260_hoist;
                id0x000000002912e260_iterator++) {
                    var listener = listeners[id0x000000002912e260_iterator];
                    //from
                    listener.onExit("results_visible");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                if (e.match(resultstab_kwic_Regexp_id0x00000000291761f0)) {
                    return {
                        preemptedBasicStates: {
                            results_hidden: true,
                            kwic_word_selected: true,
                            kwic_word_not_selected: true,
                            results_lemgram: true,
                            results_stats: true
                        },
                        action: function() {
                            //exit states
                            var statesExited = [];
                            var lca = results;
                            var nonBasicTriggerDispatcherExitBlockIteratorExpression = currentConfiguration;
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = nonBasicTriggerDispatcherExitBlockIteratorExpression.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var state = nonBasicTriggerDispatcherExitBlockIteratorExpression[id0x0000000000000000_iterator];
                                if (
                                indexOf(state.ancestors, lca) !== -1) {
                                    do {
                                        statesExited.push(state);
                                    } while ((state = state.parent) && state != lca && indexOf(statesExited, state) == -1)
                                }
                            }
                            //sort by depth
                            statesExited.sort(sortByDepthDeepToShallow);
                            //execute actions for each of these states
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = statesExited.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var state = statesExited[id0x0000000000000000_iterator];
                                state.exitAction();
                            }
                            //transition action
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var listener = listeners[id0x0000000000000000_iterator];
                                //transition id
                                listener.onTransition("results_visible", "results_kwic_initial", "results_visible_resultstab.kwic_20");
                            }
                            //enter states
                            results_visible.enterAction();
                            results_kwic.enterAction();
                            results_kwic_initial.enterAction();
                            //update configuration
                            currentConfiguration.splice(
                            indexOf(currentConfiguration, statesExited[0]), 1, results_kwic_initial);
                        }
                    }
                }
                if (e.match(resultstab_lemgram_Regexp_id0x0000000029170e10)) {
                    return {
                        preemptedBasicStates: {
                            results_hidden: true,
                            kwic_word_selected: true,
                            kwic_word_not_selected: true,
                            results_lemgram: true,
                            results_stats: true
                        },
                        action: function() {
                            //exit states
                            var statesExited = [];
                            var lca = results;
                            var nonBasicTriggerDispatcherExitBlockIteratorExpression = currentConfiguration;
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = nonBasicTriggerDispatcherExitBlockIteratorExpression.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var state = nonBasicTriggerDispatcherExitBlockIteratorExpression[id0x0000000000000000_iterator];
                                if (
                                indexOf(state.ancestors, lca) !== -1) {
                                    do {
                                        statesExited.push(state);
                                    } while ((state = state.parent) && state != lca && indexOf(statesExited, state) == -1)
                                }
                            }
                            //sort by depth
                            statesExited.sort(sortByDepthDeepToShallow);
                            //execute actions for each of these states
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = statesExited.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var state = statesExited[id0x0000000000000000_iterator];
                                state.exitAction();
                            }
                            //transition action
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var listener = listeners[id0x0000000000000000_iterator];
                                //transition id
                                listener.onTransition("results_visible", "results_lemgram", "results_visible_resultstab.lemgram_21");
                            }
                            //enter states
                            results_visible.enterAction();
                            results_lemgram.enterAction();
                            //update configuration
                            currentConfiguration.splice(
                            indexOf(currentConfiguration, statesExited[0]), 1, results_lemgram);
                        }
                    }
                }
                if (e.match(resultstab_stats_Regexp_id0x0000000029171090)) {
                    return {
                        preemptedBasicStates: {
                            results_hidden: true,
                            kwic_word_selected: true,
                            kwic_word_not_selected: true,
                            results_lemgram: true,
                            results_stats: true
                        },
                        action: function() {
                            //exit states
                            var statesExited = [];
                            var lca = results;
                            var nonBasicTriggerDispatcherExitBlockIteratorExpression = currentConfiguration;
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = nonBasicTriggerDispatcherExitBlockIteratorExpression.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var state = nonBasicTriggerDispatcherExitBlockIteratorExpression[id0x0000000000000000_iterator];
                                if (
                                indexOf(state.ancestors, lca) !== -1) {
                                    do {
                                        statesExited.push(state);
                                    } while ((state = state.parent) && state != lca && indexOf(statesExited, state) == -1)
                                }
                            }
                            //sort by depth
                            statesExited.sort(sortByDepthDeepToShallow);
                            //execute actions for each of these states
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = statesExited.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var state = statesExited[id0x0000000000000000_iterator];
                                state.exitAction();
                            }
                            //transition action
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var listener = listeners[id0x0000000000000000_iterator];
                                //transition id
                                listener.onTransition("results_visible", "results_stats", "results_visible_resultstab.stats_22");
                            }
                            //enter states
                            results_visible.enterAction();
                            results_stats.enterAction();
                            //update configuration
                            currentConfiguration.splice(
                            indexOf(currentConfiguration, statesExited[0]), 1, results_stats);
                        }
                    }
                }
                return results.$dispatchPrefixEvent(e);
            }
        }
        results_visibleConstructor.prototype = results;
        return new results_visibleConstructor();
    })();
    var results_visible_initial = (function() {
        function results_visible_initialConstructor() {
            this.parent = results_visible;
            this.initial = null;
            this.depth = 5;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    results
                        ,
                    results_visible
                ];
            this.parent.initial = this; //init parent's pointer to initial state
            this.toString = function() {
                return "results_visible_initial"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("results_visible_initial");
                }
            }
            this.exitAction = function() {
                for (var id0x000000002912e310_iterator = 0, id0x000000002912e310_hoist = listeners.length;
                id0x000000002912e310_iterator < id0x000000002912e310_hoist;
                id0x000000002912e310_iterator++) {
                    var listener = listeners[id0x000000002912e310_iterator];
                    //from
                    listener.onExit("results_visible_initial");
                }
            }
            this.$default = function() {
                return {
                    preemptedBasicStates: {
                        kwic_word_selected: true,
                        kwic_word_not_selected: true,
                        results_lemgram: true,
                        results_stats: true
                    },
                    action: function() {
                        hasTakenDefaultTransition = true;
                        //exit states
                        results_visible_initial.exitAction();
                        //transition action
                        for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                        id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                        id0x0000000000000000_iterator++) {
                            var listener = listeners[id0x0000000000000000_iterator];
                            //transition id
                            listener.onTransition("", "results_kwic_initial", "results_visible_initial_$default_19");
                        }
                        //enter states
                        results_kwic.enterAction();
                        results_kwic_initial.enterAction();
                        //update configuration
                        currentConfiguration.splice(
                        indexOf(currentConfiguration, results_visible_initial), 1, results_kwic_initial);
                    }
                }
                return results_visible['$default']();
            }
            this.$dispatchPrefixEvent = function(e) {
                return results_visible.$dispatchPrefixEvent(e);
            }
        }
        results_visible_initialConstructor.prototype = results_visible;
        return new results_visible_initialConstructor();
    })();
    var results_kwic = (function() {
        function results_kwicConstructor() {
            this.parent = results_visible;
            this.initial = null;
            this.depth = 5;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            false;
            this.toString = function() {
                return "results_kwic"
            }
            this.enterAction = function() {
                kwicResults.centerScrollbar();
                util.setJsonLink(kwicProxy.prevRequest);
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("results_kwic");
                }
            }
            this.exitAction = function() {
                this.historyState.lastConfiguration = currentConfiguration.slice();
                for (var id0x0000000029125ca0_iterator = 0, id0x0000000029125ca0_hoist = listeners.length;
                id0x0000000029125ca0_iterator < id0x0000000029125ca0_hoist;
                id0x0000000029125ca0_iterator++) {
                    var listener = listeners[id0x0000000029125ca0_iterator];
                    //from
                    listener.onExit("results_kwic");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                return results_visible.$dispatchPrefixEvent(e);
            }
        }
        results_kwicConstructor.prototype = results_visible;
        return new results_kwicConstructor();
    })();
    var results_kwic_initial = (function() {
        function results_kwic_initialConstructor() {
            this.parent = results_kwic;
            this.initial = null;
            this.depth = 6;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    results
                        ,
                    results_visible
                        ,
                    results_kwic
                ];
            this.parent.initial = this; //init parent's pointer to initial state
            this.toString = function() {
                return "results_kwic_initial"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("results_kwic_initial");
                }
            }
            this.exitAction = function() {
                for (var id0x000000002912e3c0_iterator = 0, id0x000000002912e3c0_hoist = listeners.length;
                id0x000000002912e3c0_iterator < id0x000000002912e3c0_hoist;
                id0x000000002912e3c0_iterator++) {
                    var listener = listeners[id0x000000002912e3c0_iterator];
                    //from
                    listener.onExit("results_kwic_initial");
                }
            }
            this.$default = function() {
                return {
                    preemptedBasicStates: {
                        kwic_word_selected: true,
                        kwic_word_not_selected: true
                    },
                    action: function() {
                        hasTakenDefaultTransition = true;
                        //exit states
                        results_kwic_initial.exitAction();
                        //transition action
                        for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                        id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                        id0x0000000000000000_iterator++) {
                            var listener = listeners[id0x0000000000000000_iterator];
                            //transition id
                            listener.onTransition("", "selected_h", "results_kwic_initial_$default_23");
                        }
                        //enter states
                        selected_h.enterAction();
                        //update configuration
                        currentConfiguration.splice(
                        indexOf(currentConfiguration, results_kwic_initial), 1, selected_h);
                    }
                }
                return results_kwic['$default']();
            }
            this.$dispatchPrefixEvent = function(e) {
                return results_kwic.$dispatchPrefixEvent(e);
            }
        }
        results_kwic_initialConstructor.prototype = results_kwic;
        return new results_kwic_initialConstructor();
    })();
    var selected_h = (function() {
        function selected_hConstructor() {
            this.parent = results_kwic;
            this.initial = null;
            this.depth = 6;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    results
                        ,
                    results_visible
                        ,
                    results_kwic
                ];
            this.parent.historyState = this; //init parent's pointer to history state
            this.toString = function() {
                return "selected_h"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("selected_h");
                }
            }
            this.exitAction = function() {
                for (var id0x000000002911fe80_iterator = 0, id0x000000002911fe80_hoist = listeners.length;
                id0x000000002911fe80_iterator < id0x000000002911fe80_hoist;
                id0x000000002911fe80_iterator++) {
                    var listener = listeners[id0x000000002911fe80_iterator];
                    //from
                    listener.onExit("selected_h");
                }
            }
            this.$default = function() {
                //history state semantics
                if (selected_h.lastConfiguration) {
                    return {
                        preemptedBasicStates: {
                            kwic_word_selected: true,
                            kwic_word_not_selected: true
                        },
                        action: function() {
                            //transition action
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var l = listeners[id0x0000000000000000_iterator];
                                //transition id
                                l.onTransition("", "kwic_word_selected", "selected_h_$default_24");
                            }
                            var historyState = selected_h;
                            var newConfiguration = [];
                            var historyStateParent = selected_h.parent;
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = selected_h.lastConfiguration.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var state = selected_h.lastConfiguration[id0x0000000000000000_iterator];
                                if (
                                indexOf(state.ancestors, historyStateParent) != -1) {
                                    var statesEntered = [state];
                                    for (var parent = state.parent;
                                    parent != null && parent != historyState.parent;
                                    parent = parent.parent) {
                                        statesEntered.push(parent);
                                    }
                                    var topState = statesEntered.pop();
                                    topState.enterAction();
                                    newConfiguration.push(topState.initial ? topState.initial : topState);
                                }
                            }
                            var filteredConfiguration = [];
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = currentConfiguration.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var state = currentConfiguration[id0x0000000000000000_iterator];
                                if (
                                indexOf(state.ancestors, historyStateParent) == -1) {
                                    filteredConfiguration.push(state);
                                }
                            }
                            newConfiguration = newConfiguration.concat(filteredConfiguration)
                            var historyTriggerDispatcherCurrentConfigurationAssignmentRHS = newConfiguration;
                            currentConfiguration = historyTriggerDispatcherCurrentConfigurationAssignmentRHS;
                        }
                    }
                } else {
                    return {
                        preemptedBasicStates: {
                            kwic_word_selected: true,
                            kwic_word_not_selected: true
                        },
                        action: function() {
                            hasTakenDefaultTransition = true;
                            //exit states
                            selected_h.exitAction();
                            //transition action
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var listener = listeners[id0x0000000000000000_iterator];
                                //transition id
                                listener.onTransition("", "kwic_word_selected", "selected_h_$default_24");
                            }
                            //enter states
                            kwic_word_selected.enterAction();
                            //update configuration
                            currentConfiguration.splice(
                            indexOf(currentConfiguration, selected_h), 1, kwic_word_selected);
                        }
                    }
                }
                return results_kwic['$default']();
            }
            this.$dispatchPrefixEvent = function(e) {
                return results_kwic.$dispatchPrefixEvent(e);
            }
        }
        selected_hConstructor.prototype = results_kwic;
        return new selected_hConstructor();
    })();
    var kwic_word_selected = (function() {
        function kwic_word_selectedConstructor() {
            this.parent = results_kwic;
            this.initial = null;
            this.depth = 6;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    results
                        ,
                    results_visible
                        ,
                    results_kwic
                ];
            this.toString = function() {
                return "kwic_word_selected"
            }
            this.enterAction = function() {
                showSidebar();
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("kwic_word_selected");
                }
            }
            this.exitAction = function() {
                hideSidebar();
                for (var id0x000000002911f9e0_iterator = 0, id0x000000002911f9e0_hoist = listeners.length;
                id0x000000002911f9e0_iterator < id0x000000002911f9e0_hoist;
                id0x000000002911f9e0_iterator++) {
                    var listener = listeners[id0x000000002911f9e0_iterator];
                    //from
                    listener.onExit("kwic_word_selected");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                if (e.match(word_deselect_Regexp_id0x00000000291620e0)) {
                    return {
                        preemptedBasicStates: {
                            kwic_word_selected: true,
                            kwic_word_not_selected: true
                        },
                        action: function() {
                            //exit states
                            kwic_word_selected.exitAction();
                            //transition action
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var listener = listeners[id0x0000000000000000_iterator];
                                //transition id
                                listener.onTransition("kwic_word_selected", "kwic_word_not_selected", "kwic_word_selected_word.deselect_25");
                            }
                            //enter states
                            kwic_word_not_selected.enterAction();
                            //update configuration
                            currentConfiguration.splice(
                            indexOf(currentConfiguration, kwic_word_selected), 1, kwic_word_not_selected);
                        }
                    }
                }
                return results_kwic.$dispatchPrefixEvent(e);
            }
        }
        kwic_word_selectedConstructor.prototype = results_kwic;
        return new kwic_word_selectedConstructor();
    })();
    var kwic_word_not_selected = (function() {
        function kwic_word_not_selectedConstructor() {
            this.parent = results_kwic;
            this.initial = null;
            this.depth = 6;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    results
                        ,
                    results_visible
                        ,
                    results_kwic
                ];
            this.toString = function() {
                return "kwic_word_not_selected"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("kwic_word_not_selected");
                }
            }
            this.exitAction = function() {
                for (var id0x000000002911d320_iterator = 0, id0x000000002911d320_hoist = listeners.length;
                id0x000000002911d320_iterator < id0x000000002911d320_hoist;
                id0x000000002911d320_iterator++) {
                    var listener = listeners[id0x000000002911d320_iterator];
                    //from
                    listener.onExit("kwic_word_not_selected");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                if (e.match(word_select_Regexp_id0x000000002910fa80)) {
                    return {
                        preemptedBasicStates: {
                            kwic_word_selected: true,
                            kwic_word_not_selected: true
                        },
                        action: function() {
                            //exit states
                            kwic_word_not_selected.exitAction();
                            //transition action
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var listener = listeners[id0x0000000000000000_iterator];
                                //transition id
                                listener.onTransition("kwic_word_not_selected", "kwic_word_selected", "kwic_word_not_selected_word.select_26");
                            }
                            //enter states
                            kwic_word_selected.enterAction();
                            //update configuration
                            currentConfiguration.splice(
                            indexOf(currentConfiguration, kwic_word_not_selected), 1, kwic_word_selected);
                        }
                    }
                }
                return results_kwic.$dispatchPrefixEvent(e);
            }
        }
        kwic_word_not_selectedConstructor.prototype = results_kwic;
        return new kwic_word_not_selectedConstructor();
    })();
    var results_lemgram = (function() {
        function results_lemgramConstructor() {
            this.parent = results_visible;
            this.initial = null;
            this.depth = 5;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    results
                        ,
                    results_visible
                ];
            this.toString = function() {
                return "results_lemgram"
            }
            this.enterAction = function() {
                util.setJsonLink(lemgramProxy.prevRequest);
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("results_lemgram");
                }
            }
            this.exitAction = function() {
                for (var id0x000000002911c870_iterator = 0, id0x000000002911c870_hoist = listeners.length;
                id0x000000002911c870_iterator < id0x000000002911c870_hoist;
                id0x000000002911c870_iterator++) {
                    var listener = listeners[id0x000000002911c870_iterator];
                    //from
                    listener.onExit("results_lemgram");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                return results_visible.$dispatchPrefixEvent(e);
            }
        }
        results_lemgramConstructor.prototype = results_visible;
        return new results_lemgramConstructor();
    })();
    var results_stats = (function() {
        function results_statsConstructor() {
            this.parent = results_visible;
            this.initial = null;
            this.depth = 5;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    results
                        ,
                    results_visible
                ];
            this.toString = function() {
                return "results_stats"
            }
            this.enterAction = function() {
                util.setJsonLink(statsProxy.prevRequest);
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("results_stats");
                }
            }
            this.exitAction = function() {
                for (var id0x0000000029119b40_iterator = 0, id0x0000000029119b40_hoist = listeners.length;
                id0x0000000029119b40_iterator < id0x0000000029119b40_hoist;
                id0x0000000029119b40_iterator++) {
                    var listener = listeners[id0x0000000029119b40_iterator];
                    //from
                    listener.onExit("results_stats");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                return results_visible.$dispatchPrefixEvent(e);
            }
        }
        results_statsConstructor.prototype = results_visible;
        return new results_statsConstructor();
    })();
    var sidebar = (function() {
        function sidebarConstructor() {
            this.parent = p;
            this.initial = null;
            this.depth = 3;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            false;
            this.toString = function() {
                return "sidebar"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("sidebar");
                }
            }
            this.exitAction = function() {
                for (var id0x000000002911a1f0_iterator = 0, id0x000000002911a1f0_hoist = listeners.length;
                id0x000000002911a1f0_iterator < id0x000000002911a1f0_hoist;
                id0x000000002911a1f0_iterator++) {
                    var listener = listeners[id0x000000002911a1f0_iterator];
                    //from
                    listener.onExit("sidebar");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                return p.$dispatchPrefixEvent(e);
            }
        }
        sidebarConstructor.prototype = p;
        return new sidebarConstructor();
    })();
    var sidebar_initial = (function() {
        function sidebar_initialConstructor() {
            this.parent = sidebar;
            this.initial = null;
            this.depth = 4;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    sidebar
                ];
            this.parent.initial = this; //init parent's pointer to initial state
            this.toString = function() {
                return "sidebar_initial"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("sidebar_initial");
                }
            }
            this.exitAction = function() {
                for (var id0x000000002911a2a0_iterator = 0, id0x000000002911a2a0_hoist = listeners.length;
                id0x000000002911a2a0_iterator < id0x000000002911a2a0_hoist;
                id0x000000002911a2a0_iterator++) {
                    var listener = listeners[id0x000000002911a2a0_iterator];
                    //from
                    listener.onExit("sidebar_initial");
                }
            }
            this.$default = function() {
                return {
                    preemptedBasicStates: {
                        sidebar_hidden: true,
                        sidebar_visible: true
                    },
                    action: function() {
                        hasTakenDefaultTransition = true;
                        //exit states
                        sidebar_initial.exitAction();
                        //transition action
                        for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                        id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                        id0x0000000000000000_iterator++) {
                            var listener = listeners[id0x0000000000000000_iterator];
                            //transition id
                            listener.onTransition("", "sidebar_hidden", "sidebar_initial_$default_27");
                        }
                        //enter states
                        sidebar_hidden.enterAction();
                        //update configuration
                        currentConfiguration.splice(
                        indexOf(currentConfiguration, sidebar_initial), 1, sidebar_hidden);
                    }
                }
                return sidebar['$default']();
            }
            this.$dispatchPrefixEvent = function(e) {
                return sidebar.$dispatchPrefixEvent(e);
            }
        }
        sidebar_initialConstructor.prototype = sidebar;
        return new sidebar_initialConstructor();
    })();
    var sidebar_hidden = (function() {
        function sidebar_hiddenConstructor() {
            this.parent = sidebar;
            this.initial = null;
            this.depth = 4;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    sidebar
                ];
            this.toString = function() {
                return "sidebar_hidden"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("sidebar_hidden");
                }
            }
            this.exitAction = function() {
                for (var id0x0000000029118ab0_iterator = 0, id0x0000000029118ab0_hoist = listeners.length;
                id0x0000000029118ab0_iterator < id0x0000000029118ab0_hoist;
                id0x0000000029118ab0_iterator++) {
                    var listener = listeners[id0x0000000029118ab0_iterator];
                    //from
                    listener.onExit("sidebar_hidden");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                if (e.match(sidebar_show_Regexp_id0x00000000290c09d0)) {
                    return {
                        preemptedBasicStates: {
                            sidebar_hidden: true,
                            sidebar_visible: true
                        },
                        action: function() {
                            //exit states
                            sidebar_hidden.exitAction();
                            //transition action
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var listener = listeners[id0x0000000000000000_iterator];
                                //transition id
                                listener.onTransition("sidebar_hidden", "sidebar_visible", "sidebar_hidden_sidebar.show_28");
                            }
                            //enter states
                            sidebar_visible.enterAction();
                            //update configuration
                            currentConfiguration.splice(
                            indexOf(currentConfiguration, sidebar_hidden), 1, sidebar_visible);
                        }
                    }
                }
                return sidebar.$dispatchPrefixEvent(e);
            }
        }
        sidebar_hiddenConstructor.prototype = sidebar;
        return new sidebar_hiddenConstructor();
    })();
    var sidebar_visible = (function() {
        function sidebar_visibleConstructor() {
            this.parent = sidebar;
            this.initial = null;
            this.depth = 4;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    sidebar
                ];
            this.toString = function() {
                return "sidebar_visible"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("sidebar_visible");
                }
            }
            this.exitAction = function() {
                for (var id0x00000000291169e0_iterator = 0, id0x00000000291169e0_hoist = listeners.length;
                id0x00000000291169e0_iterator < id0x00000000291169e0_hoist;
                id0x00000000291169e0_iterator++) {
                    var listener = listeners[id0x00000000291169e0_iterator];
                    //from
                    listener.onExit("sidebar_visible");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                if (e.match(sidebar_hide_Regexp_id0x00000000291a1440)) {
                    return {
                        preemptedBasicStates: {
                            sidebar_hidden: true,
                            sidebar_visible: true
                        },
                        action: function() {
                            //exit states
                            sidebar_visible.exitAction();
                            //transition action
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var listener = listeners[id0x0000000000000000_iterator];
                                //transition id
                                listener.onTransition("sidebar_visible", "sidebar_hidden", "sidebar_visible_sidebar.hide_29");
                            }
                            //enter states
                            sidebar_hidden.enterAction();
                            //update configuration
                            currentConfiguration.splice(
                            indexOf(currentConfiguration, sidebar_visible), 1, sidebar_hidden);
                        }
                    }
                }
                return sidebar.$dispatchPrefixEvent(e);
            }
        }
        sidebar_visibleConstructor.prototype = sidebar;
        return new sidebar_visibleConstructor();
    })();
    var logger = (function() {
        function loggerConstructor() {
            this.parent = p;
            this.initial = null;
            this.depth = 3;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            false;
            this.toString = function() {
                return "logger"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("logger");
                }
            }
            this.exitAction = function() {
                for (var id0x0000000029117900_iterator = 0, id0x0000000029117900_hoist = listeners.length;
                id0x0000000029117900_iterator < id0x0000000029117900_hoist;
                id0x0000000029117900_iterator++) {
                    var listener = listeners[id0x0000000029117900_iterator];
                    //from
                    listener.onExit("logger");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                return p.$dispatchPrefixEvent(e);
            }
        }
        loggerConstructor.prototype = p;
        return new loggerConstructor();
    })();
    var logger_initial = (function() {
        function logger_initialConstructor() {
            this.parent = logger;
            this.initial = null;
            this.depth = 4;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    logger
                ];
            this.parent.initial = this; //init parent's pointer to initial state
            this.toString = function() {
                return "logger_initial"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("logger_initial");
                }
            }
            this.exitAction = function() {
                for (var id0x00000000291179b0_iterator = 0, id0x00000000291179b0_hoist = listeners.length;
                id0x00000000291179b0_iterator < id0x00000000291179b0_hoist;
                id0x00000000291179b0_iterator++) {
                    var listener = listeners[id0x00000000291179b0_iterator];
                    //from
                    listener.onExit("logger_initial");
                }
            }
            this.$default = function() {
                return {
                    preemptedBasicStates: {
                        l2: true
                    },
                    action: function() {
                        hasTakenDefaultTransition = true;
                        //exit states
                        logger_initial.exitAction();
                        //transition action
                        for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                        id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                        id0x0000000000000000_iterator++) {
                            var listener = listeners[id0x0000000000000000_iterator];
                            //transition id
                            listener.onTransition("", "l2", "logger_initial_$default_30");
                        }
                        //enter states
                        l2.enterAction();
                        //update configuration
                        currentConfiguration.splice(
                        indexOf(currentConfiguration, logger_initial), 1, l2);
                    }
                }
                return logger['$default']();
            }
            this.$dispatchPrefixEvent = function(e) {
                return logger.$dispatchPrefixEvent(e);
            }
        }
        logger_initialConstructor.prototype = logger;
        return new logger_initialConstructor();
    })();
    var l2 = (function() {
        function l2Constructor() {
            this.parent = logger;
            this.initial = null;
            this.depth = 4;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id0x0000000027ec41c0
                        ,
                    main
                        ,
                    p
                        ,
                    logger
                ];
            this.toString = function() {
                return "l2"
            }
            this.enterAction = function() {
                for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                id0x0000000000000000_iterator++) {
                    var listener = listeners[id0x0000000000000000_iterator];
                    //to
                    listener.onEntry("l2");
                }
            }
            this.exitAction = function() {
                for (var id0x0000000029115340_iterator = 0, id0x0000000029115340_hoist = listeners.length;
                id0x0000000029115340_iterator < id0x0000000029115340_hoist;
                id0x0000000029115340_iterator++) {
                    var listener = listeners[id0x0000000029115340_iterator];
                    //from
                    listener.onExit("l2");
                }
            }
            this.submit = function() {
                return {
                    preemptedBasicStates: {
                        l2: true
                    },
                    action: function() {
                        //exit states
                        l2.exitAction();
                        //transition action
                        console.log('event found: ' + _event.name);
                        for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                        id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                        id0x0000000000000000_iterator++) {
                            var listener = listeners[id0x0000000000000000_iterator];
                            //transition id
                            listener.onTransition("", "l2", "l2_*_31");
                        }
                        //enter states
                        l2.enterAction();
                        //update configuration
                        currentConfiguration.splice(
                        indexOf(currentConfiguration, l2), 1, l2);
                    }
                }
                return logger['submit']();
            }
            this.$dispatchPrefixEvent = function(e) {
                if (e.match(star_Regexp_id0x00000000291a03d0)) {
                    return {
                        preemptedBasicStates: {
                            l2: true
                        },
                        action: function() {
                            //exit states
                            l2.exitAction();
                            //transition action
                            console.log('event found: ' + _event.name);
                            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = listeners.length;
                            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
                            id0x0000000000000000_iterator++) {
                                var listener = listeners[id0x0000000000000000_iterator];
                                //transition id
                                listener.onTransition("l2", "l2", "l2_*_31");
                            }
                            //enter states
                            l2.enterAction();
                            //update configuration
                            currentConfiguration.splice(
                            indexOf(currentConfiguration, l2), 1, l2);
                        }
                    }
                }
                return logger.$dispatchPrefixEvent(e);
            }
        }
        l2Constructor.prototype = logger;
        return new l2Constructor();
    })();
    //states enum for glass-box unit testing
    this._states = {
        _initial: _initial,
        init: init,
        main_initial: main_initial,
        p_initial: p_initial,
        search_initial: search_initial,
        search_history: search_history,
        simple: simple,
        extended: extended,
        advanced: advanced,
        results_initial: results_initial,
        results_hidden: results_hidden,
        results_visible_initial: results_visible_initial,
        results_kwic_initial: results_kwic_initial,
        selected_h: selected_h,
        kwic_word_selected: kwic_word_selected,
        kwic_word_not_selected: kwic_word_not_selected,
        results_lemgram: results_lemgram,
        results_stats: results_stats,
        sidebar_initial: sidebar_initial,
        sidebar_hidden: sidebar_hidden,
        sidebar_visible: sidebar_visible,
        logger_initial: logger_initial,
        l2: l2
    }
    //trigger methods for synchronous interaction
    this["$default"] = function(data) {
        if (isInStableState && !destroyed) {
            runToCompletion(
            //TODO: conditionally wrap in quotes for enumerated pattern
            "$default", data, true)
        } else {
            return undefined;
        }
    }
    this["submit.kwic"] = function(data) {
        if (isInStableState && !destroyed) {
            runToCompletion(
            //TODO: conditionally wrap in quotes for enumerated pattern
            "submit.kwic", data, false)
        } else {
            return undefined;
        }
    }
    this["searchtab.simple"] = function(data) {
        if (isInStableState && !destroyed) {
            runToCompletion(
            //TODO: conditionally wrap in quotes for enumerated pattern
            "searchtab.simple", data, false)
        } else {
            return undefined;
        }
    }
    this["searchtab.extended"] = function(data) {
        if (isInStableState && !destroyed) {
            runToCompletion(
            //TODO: conditionally wrap in quotes for enumerated pattern
            "searchtab.extended", data, false)
        } else {
            return undefined;
        }
    }
    this["searchtab.advanced"] = function(data) {
        if (isInStableState && !destroyed) {
            runToCompletion(
            //TODO: conditionally wrap in quotes for enumerated pattern
            "searchtab.advanced", data, false)
        } else {
            return undefined;
        }
    }
    this["submit.lemgram"] = function(data) {
        if (isInStableState && !destroyed) {
            runToCompletion(
            //TODO: conditionally wrap in quotes for enumerated pattern
            "submit.lemgram", data, false)
        } else {
            return undefined;
        }
    }
    this["submit"] = function(data) {
        if (isInStableState && !destroyed) {
            runToCompletion(
            //TODO: conditionally wrap in quotes for enumerated pattern
            "submit", data, true)
        } else {
            return undefined;
        }
    }
    this["resultstab.kwic"] = function(data) {
        if (isInStableState && !destroyed) {
            runToCompletion(
            //TODO: conditionally wrap in quotes for enumerated pattern
            "resultstab.kwic", data, false)
        } else {
            return undefined;
        }
    }
    this["resultstab.lemgram"] = function(data) {
        if (isInStableState && !destroyed) {
            runToCompletion(
            //TODO: conditionally wrap in quotes for enumerated pattern
            "resultstab.lemgram", data, false)
        } else {
            return undefined;
        }
    }
    this["resultstab.stats"] = function(data) {
        if (isInStableState && !destroyed) {
            runToCompletion(
            //TODO: conditionally wrap in quotes for enumerated pattern
            "resultstab.stats", data, false)
        } else {
            return undefined;
        }
    }
    this["word.deselect"] = function(data) {
        if (isInStableState && !destroyed) {
            runToCompletion(
            //TODO: conditionally wrap in quotes for enumerated pattern
            "word.deselect", data, false)
        } else {
            return undefined;
        }
    }
    this["word.select"] = function(data) {
        if (isInStableState && !destroyed) {
            runToCompletion(
            //TODO: conditionally wrap in quotes for enumerated pattern
            "word.select", data, false)
        } else {
            return undefined;
        }
    }
    this["sidebar.show"] = function(data) {
        if (isInStableState && !destroyed) {
            runToCompletion(
            //TODO: conditionally wrap in quotes for enumerated pattern
            "sidebar.show", data, false)
        } else {
            return undefined;
        }
    }
    this["sidebar.hide"] = function(data) {
        if (isInStableState && !destroyed) {
            runToCompletion(
            //TODO: conditionally wrap in quotes for enumerated pattern
            "sidebar.hide", data, false)
        } else {
            return undefined;
        }
    }
    //initialization script

    function lemgramSearch(lemgram) {
        $.log("lemgramSearch", lemgram);
        simpleSearch.setPlaceholder(util.lemgramToString(lemgram).replace(/<.*?>/g, "")).clear();
        lemgramProxy.relationsSearch(lemgram);
        searchProxy.relatedWordSearch(lemgram);
        statsProxy.makeRequest(lemgram);
        var cqp = lemgramProxy.lemgramSearch(lemgram);
        $("#cqp_string").val(cqp);
    }
    //initialization method
    this.initialize = function() {
        currentConfiguration = [init];
        runToCompletion();
        mainLoop();
    }
    //internal runtime functions

    function sortByDepthDeepToShallow(a, b) {
        return b.depth - a.depth;
    }
    //start static boilerplate code
    //static private member variables
    var currentConfiguration = []; //current configuration
    var innerEventQueue = []; //inner event queue
    var outerEventQueue = []; //outer event queue
    var isInStableState = true;
    var hasTakenDefaultTransition = false;
    var destroyed = false;
    var mainLoopCallback = null;
    //static private member functions


    function mainLoop() {
        if (!destroyed) {
            //take an event from the current outer event queue
            if (outerEventQueue.length && isInStableState) {
                runToCompletion(outerEventQueue.shift(), outerEventQueue.shift());
            }
            //call back
            mainLoopCallback = window.setTimeout(function() {
                mainLoop(); //FIXME: note that when calling mainloop this way, we won't have access to the "this" object. 
                //I don't think we ever use it though. Everything we need is private in function scope.
            }, 100);
        }
    }
    function runToCompletion(e, data, isEnumeratedEvent) {
        isInStableState = false;
        if (e) {
            innerEventQueue.push(e, data, isEnumeratedEvent);
        }
        do {
            //take any available default transitions
            microstep("$default", null, true);
            if (!hasTakenDefaultTransition) {
                if (!innerEventQueue.length) {
                    //we have no more generated events, and no default transitions fired, so
                    //we are done, and have run to completion
                    break;
                } else {
                    //microstep, then dequeue next event sending in event
                    microstep(innerEventQueue.shift(), innerEventQueue.shift(), innerEventQueue.shift());
                }
            } else {
                //he has taken a default transition, so reset the global variable to false and loop again
                hasTakenDefaultTransition = false;
            }
        } while (true)
        isInStableState = true;
    }
    function microstep(e, data, isEnumeratedEvent) {
        var enabledTransitions = [],
            transition = null,
            preemptedBasicStates = {};
        //we set the event as a global, rather than passing it into the function invocation as a parameter,
        //because in cases of default events, the event object will be populated with previous event's data
        if (e !== "$default") {
            _event.name = isEnumeratedEvent ? e : e;
            _event.data = data;
        }
        if (isEnumeratedEvent) {
            //e does not contain a dot, so dispatch as an enumerated event
            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = currentConfiguration.length;
            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
            id0x0000000000000000_iterator++) {
                var state = currentConfiguration[id0x0000000000000000_iterator];
                //check to make sure he is not preempted
                if (!(state in preemptedBasicStates)) {
                    //lookup the transition
                    var transition = state[e]();
                    if (transition) {
                        enabledTransitions.push(transition.action);
                        mixin(transition.preemptedBasicStates, preemptedBasicStates);
                    }
                }
            }
        } else {
            //e contains a dot, so dispatch as a prefix event
            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = currentConfiguration.length;
            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
            id0x0000000000000000_iterator++) {
                var state = currentConfiguration[id0x0000000000000000_iterator];
                //check to make sure he is not preempted
                if (!(state in preemptedBasicStates)) {
                    //lookup the transition
                    var transition = state.$dispatchPrefixEvent(e)
                    if (transition) {
                        enabledTransitions.push(transition.action);
                        mixin(transition.preemptedBasicStates, preemptedBasicStates);
                    }
                }
            }
        }
        //invoke selected transitions
        for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = enabledTransitions.length;
        id0x0000000000000000_iterator < id0x0000000000000000_hoist;
        id0x0000000000000000_iterator++) {
            var t = enabledTransitions[id0x0000000000000000_iterator];
            t();
        }
    }
    function mixin(from, to) {
        for (var prop in from) {
            to[prop] = from[prop]
        }
    }
    this.destroy = function() {
        //right now, this only disables timer and sets global destroyed variable to prevent future callbacks
        window.clearTimeout(mainLoopCallback);
        mainLoopCallback = null;
        destroyed = true;
    }
    //this is for async communication
    this.GEN = function(e, data) {
        outerEventQueue.push(e, data);
    }
    //this may or may not be something we want to expose, but for right now, we at least need it for testing
    this.getCurrentConfiguration = function() {
        //slice it to return a copy of the configuration rather than the conf itself
        //this saves us all kinds of confusion involving references and stuff
        //TODO: refactor this name to be genCurrentConfigurationStatement 
        var currentConfigurationExpression = currentConfiguration.slice();
        return currentConfigurationExpression;
    }
    //public API for In predicate
    this.$in = function(state) {
        return In(state);
    }
    //end static boilerplate code

    function In(state) {
        state = typeof state == "string" ? self._states[state] : state;
        var toReturn;
        if (state.isBasic) {
            toReturn =
            indexOf(currentConfiguration, state) != -1;
        } else {
            var toReturn = false;
            for (var id0x0000000000000000_iterator = 0, id0x0000000000000000_hoist = currentConfiguration.length;
            id0x0000000000000000_iterator < id0x0000000000000000_hoist;
            id0x0000000000000000_iterator++) {
                var s = currentConfiguration[id0x0000000000000000_iterator];
                if (
                indexOf(s.ancestors, state) != -1) {
                    toReturn = true;
                    break;
                }
            }
        }
        return toReturn;
    }
    function indexOf(arr, obj) {
        for (var i = 0, l = arr.length; i < l; i++) {
            if (arr[i] === obj) {
                return i;
            }
        }
        return -1;
    }
    var listeners = [];
    //TODO:listeners support adding listeners for a particular state
    this.addListener = function(listener) {
        listeners.push(listener);
    }
    this.removeListener = function(listener) {
        listeners.splice(
        indexOf(listeners, listener), 1);
    }
}