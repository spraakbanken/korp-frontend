/** @format */
import { interpret, createMachine } from "xstate"

import jStorage from "../lib/jstorage"

const listenerMap = {}
function listen(eventName, fn) {
    listenerMap[eventName] = listenerMap[eventName] ? [...listenerMap[eventName], fn] : [fn]
}
function broadcast(eventName, ...payload) {
    if (!listenerMap[eventName]) {
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

let machine = createMachine(
    {
        id: "main",
        context: {},
        initial: "sidebar",
        type: "parallel",
        states: {
            login: {
                initial: "blank",
                states: {
                    blank: {
                        on: {
                            USER_FOUND: { target: "logged_in" },
                            USER_NOT_FOUND: { target: "logged_out" },
                        },
                    },
                    logged_out: {
                        on: {
                            LOGIN: { target: "logged_in" },
                            LOGIN_NEEDED: { target: "login_needed", actions: "login_needed" },
                        },
                    },
                    logged_in: {
                        entry: ["logged_in"],
                        on: {
                            LOGOUT: { target: "logged_out", actions: "logged_out" },
                        },
                    },
                    login_needed: {
                        on: {
                            LOGIN: { target: "logged_in", actions: "logged_in" },
                        },
                    },
                },
            },
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
                    },
                },
                on: {
                    SEARCH_CQP: {
                        target: "extended_search.cqp_selected",
                        actions: ["cqp_search"],
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
            cqp_search: (context, event) => broadcast("cqp_search", event),
            logged_in: (context, event) => {
                broadcast("login", event)
            },
            logged_out: () => {
                authenticationProxy.logout()
                broadcast("logout")
            },
            login_needed: (context, event) => broadcast("login_needed", event),
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
