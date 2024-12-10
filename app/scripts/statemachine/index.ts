/** @format */
import { interpret, createMachine } from "xstate"

const listenerMap: Record<string, ((...args: any[]) => void)[]> = {}

function listen(eventName: string, fn: (...args: any[]) => void) {
    listenerMap[eventName] = listenerMap[eventName] ? [...listenerMap[eventName], fn] : [fn]
}

function broadcast(eventName: string, ...payload: any[]) {
    if (!listenerMap[eventName]) {
        console.error("No listener for event name", eventName)
        return
    }
    listenerMap[eventName].forEach((fn) => fn(...payload))
}

const machine = createMachine(
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
                initial: "hidden",
                states: {
                    hidden: {
                        on: {
                            SELECT_WORD: { target: "visible", actions: "select_word" },
                        },
                    },
                    visible: {
                        on: {
                            SELECT_WORD: { actions: "select_word" },
                        },
                    },
                },
                on: {
                    DESELECT_WORD: { target: "sidebar.hidden", actions: "deselect_word" },
                },
            },
        },
    },
    {
        actions: {
            log: (context, event) => console.log("log action:", event),
            select_word: (context, event) => broadcast("select_word", event),
            deselect_word: () => broadcast("select_word"),
            lemgram_search: (context, event) => broadcast("lemgram_search", event),
            cqp_search: (context, event) => broadcast("cqp_search", event),
            logged_in: () => broadcast("login"),
            logged_out: () => broadcast("logout"),
            login_needed: (context, event) => broadcast("login_needed", event),
        },
    }
)

const service = interpret(machine)
service.start()

export default {
    send: service.send,
    listen,
}
