/** @format */
import { axiosConfAddMethod } from "@/util"
import { getAuthorizationHeader } from "@/components/auth/auth"
import settings from "@/settings"
import { API, ErrorMessage, Response, ResponseBase } from "./types"
import axios from "axios"

export async function korpRequest<K extends keyof API>(
    endpoint: K,
    params: API[K]["params"]
): Promise<ResponseBase & API[K]["response"]> {
    const conf = axiosConfAddMethod({
        url: settings.korp_backend_url + "/" + endpoint,
        params,
        headers: getAuthorizationHeader(),
    })
    const response = await axios.request<Response<API[K]["response"]>>(conf)
    const data = response.data

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
