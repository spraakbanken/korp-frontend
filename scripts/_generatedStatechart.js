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
    var my_slot = 1234;
    //send timeout id variables
    var $default_Regexp_id40978183 = /^($default)/;
    //abstract state
    var AbstractState = new
    function() {
        //triggers are methods
        this.$default = function() {};
        this.$default = function() {};
        this.$dispatchPrefixEvent = function() {};
    }
    //states
    var scxml_id39478291 = (function() {
        function scxml_id39478291Constructor() {
            this.parent = AbstractState;
            this.initial = null;
            this.depth = 0;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            false;
            this.toString = function() {
                return "scxml_id39478291"
            }
            this.enterAction = function() {
                console.log("entering scxml_id39478291");
                for (var id42140328_iterator = 0, id42140328_hoist = listeners.length;
                id42140328_iterator < id42140328_hoist;
                id42140328_iterator++) {
                    var listener = listeners[id42140328_iterator];
                    //to
                    listener.onEntry("scxml_id39478291");
                }
            }
            this.exitAction = function() {
                console.log("exiting scxml_id39478291");
                for (var id42140334_iterator = 0, id42140334_hoist = listeners.length;
                id42140334_iterator < id42140334_hoist;
                id42140334_iterator++) {
                    var listener = listeners[id42140334_iterator];
                    //from
                    listener.onExit("scxml_id39478291");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                return AbstractState.$dispatchPrefixEvent(e);
            }
        }
        scxml_id39478291Constructor.prototype = AbstractState;
        return new scxml_id39478291Constructor();
    })();
    var _initial = (function() {
        function _initialConstructor() {
            this.parent = scxml_id39478291;
            this.initial = null;
            this.depth = 1;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id39478291
                ];
            this.parent.initial = this; //init parent's pointer to initial state
            this.toString = function() {
                return "_initial"
            }
            this.enterAction = function() {
                console.log("entering _initial");
                for (var id42140328_iterator = 0, id42140328_hoist = listeners.length;
                id42140328_iterator < id42140328_hoist;
                id42140328_iterator++) {
                    var listener = listeners[id42140328_iterator];
                    //to
                    listener.onEntry("_initial");
                }
            }
            this.exitAction = function() {
                console.log("exiting _initial");
                for (var id42140342_iterator = 0, id42140342_hoist = listeners.length;
                id42140342_iterator < id42140342_hoist;
                id42140342_iterator++) {
                    var listener = listeners[id42140342_iterator];
                    //from
                    listener.onExit("_initial");
                }
            }
            this.$default = function() {
                return {
                    preemptedBasicStates: {
                        s1: true,
                        s2: true
                    },
                    action: function() {
                        hasTakenDefaultTransition = true;
                        //exit states
                        _initial.exitAction();
                        //transition action
                        for (var id42140328_iterator = 0, id42140328_hoist = listeners.length;
                        id42140328_iterator < id42140328_hoist;
                        id42140328_iterator++) {
                            var listener = listeners[id42140328_iterator];
                            //transition id
                            listener.onTransition("", "s1", "_initial_$default_1");
                        }
                        //enter states
                        s1.enterAction();
                        //update configuration
                        currentConfiguration = [
                            s1
                            ];
                    }
                }
                return scxml_id39478291['$default']();
            }
            this.$dispatchPrefixEvent = function(e) {
                return scxml_id39478291.$dispatchPrefixEvent(e);
            }
        }
        _initialConstructor.prototype = scxml_id39478291;
        return new _initialConstructor();
    })();
    var s1 = (function() {
        function s1Constructor() {
            this.parent = scxml_id39478291;
            this.initial = null;
            this.depth = 1;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id39478291
                ];
            this.toString = function() {
                return "s1"
            }
            this.enterAction = function() {
                console.log("entering s1");
                for (var id42140328_iterator = 0, id42140328_hoist = listeners.length;
                id42140328_iterator < id42140328_hoist;
                id42140328_iterator++) {
                    var listener = listeners[id42140328_iterator];
                    //to
                    listener.onEntry("s1");
                }
            }
            this.exitAction = function() {
                console.log("exiting s1");
                for (var id42140408_iterator = 0, id42140408_hoist = listeners.length;
                id42140408_iterator < id42140408_hoist;
                id42140408_iterator++) {
                    var listener = listeners[id42140408_iterator];
                    //from
                    listener.onExit("s1");
                }
            }
            this.$default = function() {
                return {
                    preemptedBasicStates: {
                        s1: true,
                        s2: true
                    },
                    action: function() {
                        hasTakenDefaultTransition = true;
                        //exit states
                        s1.exitAction();
                        //transition action
                        for (var id42140328_iterator = 0, id42140328_hoist = listeners.length;
                        id42140328_iterator < id42140328_hoist;
                        id42140328_iterator++) {
                            var listener = listeners[id42140328_iterator];
                            //transition id
                            listener.onTransition("", "s2", "s1_$default_2");
                        }
                        //enter states
                        s2.enterAction();
                        //update configuration
                        currentConfiguration = [
                            s2
                            ];
                    }
                }
                return scxml_id39478291['$default']();
            }
            this.$dispatchPrefixEvent = function(e) {
                return scxml_id39478291.$dispatchPrefixEvent(e);
            }
        }
        s1Constructor.prototype = scxml_id39478291;
        return new s1Constructor();
    })();
    var s2 = (function() {
        function s2Constructor() {
            this.parent = scxml_id39478291;
            this.initial = null;
            this.depth = 1;
            this.historyState = null;
            //these variables facilitate fast In predicate
            this.isBasic =
            true;
            this.ancestors = [
                scxml_id39478291
                ];
            this.toString = function() {
                return "s2"
            }
            this.enterAction = function() {
                console.log("entering s2");
                console.log(' hello : ');
                console.log('expr');
                console.log("log");
                for (var id42140328_iterator = 0, id42140328_hoist = listeners.length;
                id42140328_iterator < id42140328_hoist;
                id42140328_iterator++) {
                    var listener = listeners[id42140328_iterator];
                    //to
                    listener.onEntry("s2");
                }
            }
            this.exitAction = function() {
                console.log("exiting s2");
                for (var id42140467_iterator = 0, id42140467_hoist = listeners.length;
                id42140467_iterator < id42140467_hoist;
                id42140467_iterator++) {
                    var listener = listeners[id42140467_iterator];
                    //from
                    listener.onExit("s2");
                }
            }
            this.$dispatchPrefixEvent = function(e) {
                return scxml_id39478291.$dispatchPrefixEvent(e);
            }
        }
        s2Constructor.prototype = scxml_id39478291;
        return new s2Constructor();
    })();
    //states enum for glass-box unit testing
    this._states = {
        _initial: _initial,
        s1: s1,
        s2: s2
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
        currentConfiguration = [s1];
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
            for (var id42140328_iterator = 0, id42140328_hoist = currentConfiguration.length;
            id42140328_iterator < id42140328_hoist;
            id42140328_iterator++) {
                var state = currentConfiguration[id42140328_iterator];
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
            for (var id42140328_iterator = 0, id42140328_hoist = currentConfiguration.length;
            id42140328_iterator < id42140328_hoist;
            id42140328_iterator++) {
                var state = currentConfiguration[id42140328_iterator];
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
        for (var id42140328_iterator = 0, id42140328_hoist = enabledTransitions.length;
        id42140328_iterator < id42140328_hoist;
        id42140328_iterator++) {
            var t = enabledTransitions[id42140328_iterator];
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
            for (var id42140328_iterator = 0, id42140328_hoist = currentConfiguration.length;
            id42140328_iterator < id42140328_hoist;
            id42140328_iterator++) {
                var s = currentConfiguration[id42140328_iterator];
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