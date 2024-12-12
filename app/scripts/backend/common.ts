/** @format */
import { fetchConfAddMethod } from "@/util"
import { getAuthorizationHeader } from "@/components/auth/auth"
import settings from "@/settings"
import { API, ErrorMessage, Response } from "./types"
import { omitBy } from "lodash"

export async function korpRequest<K extends keyof API>(
    endpoint: K,
    params: API[K]["params"]
): Promise<API[K]["response"]> {
    params = omitBy(params, (value) => value == null) as API[K]["params"]
    const { url, request } = fetchConfAddMethod(settings.korp_backend_url + "/" + endpoint, params)
    request.headers = { ...request.headers, ...getAuthorizationHeader() }

    const response = await fetch(url, request)
    const data = (await response.json()) as Response<API[K]["response"]>

    if ("ERROR" in data) {
        const { type, value } = data.ERROR as ErrorMessage
        throw new KorpBackendError(type, value)
    }

    return data
}

export class KorpBackendError extends Error {
    constructor(public readonly message: string, public readonly details: string) {
        super(message)
        this.name = "KorpBackendError"
    }
}
