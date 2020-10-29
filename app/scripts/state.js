/** @format */

const listenerMap = {}
export function listen(eventName, fn) {
    listenerMap[eventName] = listenerMap[eventName] ? [...listenerMap[eventName], fn] : [fn]
}
export function broadcast(eventName, ...payload) {
    for (let fn of listenerMap[eventName]) {
        fn(...payload)
    }
}
