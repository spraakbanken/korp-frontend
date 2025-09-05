/** @format */
import Abortable from "../backend/abortable"

/** Base class for tasks assigned to dynamic tabs. */
export abstract class TaskBase<R = any> extends Abortable {
    /** Send backend request. */
    abstract send(...args: any[]): Promise<R>
}
