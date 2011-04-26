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
    var kwicProxy, lemgramProxy, statsProxy, simpleSearch, kwicResults, lemgramResults, statsResults;
    //send timeout id variables
    var $default_Regexp_idm427110640 = /^($default)/;
    //abstract state
    var AbstractState = new
    function() {
        //triggers are methods
        this.$default = function() {};
        this.$default = function() {};
        this.$dispatchPrefixEvent = function() {};
    }
    //states
    var scxml_idm414688816 = (function() {
        function scxml_idm414688816Constructor() {
            this.parent = AbstractState;
            this.initial = null;
            this.depth = 0;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            false;
            this.toString = function() {
                return "scxml_idm414688816"
            }
            this.enterAction = function() {
                console.log("entering scxml_idm414688816");
                for (var idp0_iterator = 0, idp0_hoist = listeners.length;
                idp0_iterator < idp0_hoist;
                idp0_iterator++) {
                    var listener = listeners[idp0_iterator];
                    //to
                    listener.onEntry("scxml_idm414688816");
                }
            }
            this.exitAction = function() {
                console.log("exiting scxml_idm414688816");
                for (var idm3056_iterator = 0, idm3056_hoist = listeners.length;
                idm3056_iterator < idm3056_hoist;
                idm3056_iterator++) {
                    var listener = listeners[idm3056_iterator];
                    //from
                    listener.onExit("scxml_idm414688816");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                return AbstractState.$dispatchPrefixEvent(e);
            }
        }
        scxml_idm414688816Constructor.prototype = AbstractState;
        return new scxml_idm414688816Constructor();
    })();
    var _initial = (function() {
        function _initialConstructor() {
            this.parent = scxml_idm414688816;
            this.initial = null;
            this.depth = 1;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_idm414688816
                ];
            this.parent.initial = this; //init parent's pointer to initial state
            this.toString = function() {
                return "_initial"
            }
            this.enterAction = function() {
                console.log("entering _initial");
                for (var idp0_iterator = 0, idp0_hoist = listeners.length;
                idp0_iterator < idp0_hoist;
                idp0_iterator++) {
                    var listener = listeners[idp0_iterator];
                    //to
                    listener.onEntry("_initial");
                }
            }
            this.exitAction = function() {
                console.log("exiting _initial");
                for (var idp103312_iterator = 0, idp103312_hoist = listeners.length;
                idp103312_iterator < idp103312_hoist;
                idp103312_iterator++) {
                    var listener = listeners[idp103312_iterator];
                    //from
                    listener.onExit("_initial");
                }
            }
            this.$default = function() {
                return {
                    preemptedBasicStates: {
                        init: true
                    },
                    action: function() {
                        hasTakenDefaultTransition = true;
                        //exit states
                        _initial.exitAction();
                        //transition action
                        for (var idp0_iterator = 0, idp0_hoist = listeners.length;
                        idp0_iterator < idp0_hoist;
                        idp0_iterator++) {
                            var listener = listeners[idp0_iterator];
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
                return scxml_idm414688816['$default']();
            }
            this.$dispatchPrefixEvent = function(e) {
                return scxml_idm414688816.$dispatchPrefixEvent(e);
            }
        }
        _initialConstructor.prototype = scxml_idm414688816;
        return new _initialConstructor();
    })();
    var init = (function() {
        function initConstructor() {
            this.parent = scxml_idm414688816;
            this.initial = null;
            this.depth = 1;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_idm414688816
                ];
            this.toString = function() {
                return "init"
            }
            this.enterAction = function() {
                console.log("entering init");
                for (var idp0_iterator = 0, idp0_hoist = listeners.length;
                idp0_iterator < idp0_hoist;
                idp0_iterator++) {
                    var listener = listeners[idp0_iterator];
                    //to
                    listener.onEntry("init");
                }
            }
            this.exitAction = function() {
                console.log("exiting init");
                for (var idm5200_iterator = 0, idm5200_hoist = listeners.length;
                idm5200_iterator < idm5200_hoist;
                idm5200_iterator++) {
                    var listener = listeners[idm5200_iterator];
                    //from
                    listener.onExit("init");
                }
            }
            this.$default = function() {
                return {
                    preemptedBasicStates: {
                        init: true
                    },
                    action: function() {
                        hasTakenDefaultTransition = true;
                        //exit states
                        init.exitAction();
                        //transition action
                        simpleSearch = new view.SimpleSearch();
                        kwicResults = new view.KWICResults('#result-container li:first');
                        lemgramResults = new view.LemgramResults('#result-container li:nth-child(3)');
                        statsResults = new view.StatsResults('#result-container li:nth-child(4)');
                        kwicProxy = new model.KWICProxy();
                        lemgramProxy = new model.LemgramProxy();
                        statsProxy = new model.StatsProxy();
                        for (var idp0_iterator = 0, idp0_hoist = listeners.length;
                        idp0_iterator < idp0_hoist;
                        idp0_iterator++) {
                            var listener = listeners[idp0_iterator];
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
                return scxml_idm414688816['$default']();
            }
            this.$dispatchPrefixEvent = function(e) {
                return scxml_idm414688816.$dispatchPrefixEvent(e);
            }
        }
        initConstructor.prototype = scxml_idm414688816;
        return new initConstructor();
    })();
    var main = (function() {
        function mainConstructor() {
            this.parent = scxml_idm414688816;
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
                console.log("entering main");
                console.log(' entered main : ');
                console.log(' this : ');
                console.log(this);
                for (var idp0_iterator = 0, idp0_hoist = listeners.length;
                idp0_iterator < idp0_hoist;
                idp0_iterator++) {
                    var listener = listeners[idp0_iterator];
                    //to
                    listener.onEntry("main");
                }
            }
            this.exitAction = function() {
                console.log("exiting main");
                for (var idp109648_iterator = 0, idp109648_hoist = listeners.length;
                idp109648_iterator < idp109648_hoist;
                idp109648_iterator++) {
                    var listener = listeners[idp109648_iterator];
                    //from
                    listener.onExit("main");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                return scxml_idm414688816.$dispatchPrefixEvent(e);
            }
        }
        mainConstructor.prototype = scxml_idm414688816;
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
                scxml_idm414688816
                        ,
                    main
                ];
            this.parent.initial = this; //init parent's pointer to initial state
            this.toString = function() {
                return "main_initial"
            }
            this.enterAction = function() {
                console.log("entering main_initial");
                for (var idp0_iterator = 0, idp0_hoist = listeners.length;
                idp0_iterator < idp0_hoist;
                idp0_iterator++) {
                    var listener = listeners[idp0_iterator];
                    //to
                    listener.onEntry("main_initial");
                }
            }
            this.exitAction = function() {
                console.log("exiting main_initial");
                for (var idm135120_iterator = 0, idm135120_hoist = listeners.length;
                idm135120_iterator < idm135120_hoist;
                idm135120_iterator++) {
                    var listener = listeners[idm135120_iterator];
                    //from
                    listener.onExit("main_initial");
                }
            }
            this.$default = function() {
                return {
                    preemptedBasicStates: {},
                    action: function() {
                        hasTakenDefaultTransition = true;
                        //exit states
                        main_initial.exitAction();
                        //transition action
                        for (var idp0_iterator = 0, idp0_hoist = listeners.length;
                        idp0_iterator < idp0_hoist;
                        idp0_iterator++) {
                            var listener = listeners[idp0_iterator];
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
                console.log("entering p");
                for (var idp0_iterator = 0, idp0_hoist = listeners.length;
                idp0_iterator < idp0_hoist;
                idp0_iterator++) {
                    var listener = listeners[idp0_iterator];
                    //to
                    listener.onEntry("p");
                }
            }
            this.exitAction = function() {
                console.log("exiting p");
                for (var idp129968_iterator = 0, idp129968_hoist = listeners.length;
                idp129968_iterator < idp129968_hoist;
                idp129968_iterator++) {
                    var listener = listeners[idp129968_iterator];
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
                scxml_idm414688816
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
                console.log("entering p_initial");
                for (var idp0_iterator = 0, idp0_hoist = listeners.length;
                idp0_iterator < idp0_hoist;
                idp0_iterator++) {
                    var listener = listeners[idp0_iterator];
                    //to
                    listener.onEntry("p_initial");
                }
            }
            this.exitAction = function() {
                console.log("exiting p_initial");
                for (var idp130192_iterator = 0, idp130192_hoist = listeners.length;
                idp130192_iterator < idp130192_hoist;
                idp130192_iterator++) {
                    var listener = listeners[idp130192_iterator];
                    //from
                    listener.onExit("p_initial");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                return p.$dispatchPrefixEvent(e);
            }
        }
        p_initialConstructor.prototype = p;
        return new p_initialConstructor();
    })();
    //states enum for glass-box unit testing
    this._states = {
        _initial: _initial,
        init: init,
        main_initial: main_initial,
        p_initial: p_initial
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
    //initialization script
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
            for (var idp0_iterator = 0, idp0_hoist = currentConfiguration.length;
            idp0_iterator < idp0_hoist;
            idp0_iterator++) {
                var state = currentConfiguration[idp0_iterator];
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
            for (var idp0_iterator = 0, idp0_hoist = currentConfiguration.length;
            idp0_iterator < idp0_hoist;
            idp0_iterator++) {
                var state = currentConfiguration[idp0_iterator];
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
        for (var idp0_iterator = 0, idp0_hoist = enabledTransitions.length;
        idp0_iterator < idp0_hoist;
        idp0_iterator++) {
            var t = enabledTransitions[idp0_iterator];
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
            for (var idp0_iterator = 0, idp0_hoist = currentConfiguration.length;
            idp0_iterator < idp0_hoist;
            idp0_iterator++) {
                var s = currentConfiguration[idp0_iterator];
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