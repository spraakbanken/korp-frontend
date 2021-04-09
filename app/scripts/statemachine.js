/** @format */
import { Machine, interpret, assign } from "xstate"

const listenerMap = {}
function listen(eventName, fn) {
    listenerMap[eventName] = listenerMap[eventName] ? [...listenerMap[eventName], fn] : [fn]
}
function broadcast(eventName, ...payload) {
    if (!(eventName in listenerMap)) {
        console.error("No listener for event name", eventName)
        return
    }
    for (let fn of listenerMap[eventName]) {
        fn(...payload)
    }
}

function search() {
    console.log("🚀 ~ file: statemachine.js ~ line 27 ~ arguments", arguments)
    let $injector = angular.element(document.body).injector()
    let $location = $injector.get("$location")
    $location.search.apply($location, arguments)
}

const sidebarStates = {
    initial: "hidden",
    states: {
        hidden: {
            on: {
                SELECT_WORD: { target: "visible", actions: "select_word" },
            },
        },
        visible: {
            onentry: {},
            on: {
                SELECT_WORD: { actions: "select_word" },
            },
        },
    },
    on: {
        DESELECT_WORD: { target: "sidebar.hidden", actions: "deselect_word" },
    },
}

let machine = Machine(
    {
        id: "main",
        context: {
            loginObj: {},
        },
        initial: "sidebar",
        on: {
            CORPUSCHOOSER_CHANGE: { actions: "update_corpora" },
            CORPORA_INIT: { actions: ["update_corpora", "invalidate_corpuschooser"] },
        },
        type: "parallel",
        states: {
            simple_search: {
                initial: "blank",
                states: {
                    // control the state of the simple search input field
                    blank: {},
                    lemgram_selected: {
                        entry: "log",
                    },
                },
                on: {
                    SEARCH_LEMGRAM: {
                        target: "simple_search.lemgram_selected",
                        actions: ["lemgram_search"],
                    },
                },
            },
            extended_search: {
                initial: "blank",
                states: {
                    blank: {},
                    cqp_selected: {
                        entry: "log",
                    }
                },
                on: {
                    SEARCH_CQP: {
                        target: "extended_search.cqp_selected",
                        actions: ["cqp_search"],
                    },
                }
            },
            sidebar: {
                ...sidebarStates,
            },
        },
    },
    {
        guards: {
            key_s(context, event) {
                return event.which == 115
            },
        },
        actions: {
            log: (context, event) => console.log("log action:", event),
            select_word: (context, event) => broadcast("select_word", event),
            deselect_word: (context, event) => broadcast("select_word", null),
            lemgram_search: (context, event) => broadcast("lemgram_search", event),
            cqp_search: (context, event) => broadcast("cqp_search", event),
            update_corpora: (context, event) => {
                if (event.corpora) {
                    settings.corpusListing.select(event.corpora)
                    search("corpus", event.corpora.join(","))
                    broadcast("corpuschange", event)
                }
            },
            invalidate_corpuschooser: (context, event) => {
                broadcast("invalidate_corpuschooser", event)
            },
        },
    }
)

let currentContext = machine.context
const service = interpret(machine)
service.start()

window.document.addEventListener("keypress", (event) => {
    // TODO: esc not firing, for some reason. switch to keydown instead
    // console.log("event.which", event.which)
    service.send(event)
})

service.onTransition((state) => {
    console.log(
        "🚀 ~ state",
        state.event.type,
        state.configuration.map(({ id }) => id)
    )
    currentContext = state.context
})

export default {
    send: service.send,
    listen,
    get context() {
        return currentContext
    },
}
