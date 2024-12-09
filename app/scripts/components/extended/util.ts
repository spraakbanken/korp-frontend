/** @format */

import { Condition } from "@/cqp_parser/cqp.types"

export const createDefaultCondition = (): Condition => ({ type: "word", op: "=", val: "" })
