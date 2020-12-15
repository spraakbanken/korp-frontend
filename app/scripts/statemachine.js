/** @format */
import { Machine, interpret, assign } from "xstate"

const listenerMap = {}
function listen(eventName, fn) {
    listenerMap[eventName] = listenerMap[eventName] ? [...listenerMap[eventName], fn] : [fn]
}
function broadcast(eventName, ...payload) {
    if (!eventName in listenerMap) {
        console.error("No listener for event name", eventName)
        return
    }
    for (let fn of listenerMap[eventName]) {
        fn(...payload)
    }
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
        context: {},
        initial: "sidebar",
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
        },
    }
)

let currentContext = machine.context
const service = interpret(machine)
service.start()

window.document.addEventListener("keypress", (event) => {
    // TODO: esc not firing, for some reason.
    // console.log("event.which", event.which)
    service.send(event)
})

service.onTransition((state) => {
    // console.log("onTransition", state.value, state.context)
    currentContext = state.context
})

export default {
    send: service.send,
    listen,
    get context() {
        return currentContext
    },
}
