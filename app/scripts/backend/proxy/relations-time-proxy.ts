import ProxyBase from "./proxy-base"

export class RelationsProxy extends ProxyBase<"relations_time"> {
    protected readonly endpoint = "relations_time"
}
