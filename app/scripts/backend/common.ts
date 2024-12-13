/** @format */
import { axiosConfAddMethod } from "@/util"
import { getAuthorizationHeader } from "@/components/auth/auth"
import settings from "@/settings"
import { API, ErrorMessage, Response, ResponseBase } from "./types"
import axios, { AxiosProgressEvent } from "axios"

type KorpRequestOptions = {
    abortSignal?: AbortSignal
    onProgress?: (event: AxiosProgressEvent) => void
}

export async function korpRequest<K extends keyof API>(
    endpoint: K,
    params: API[K]["params"],
    options?: KorpRequestOptions
): Promise<ResponseBase & API[K]["response"]> {
    const conf = axiosConfAddMethod({
        url: korpEndpointUrl(endpoint),
        params,
        headers: getAuthorizationHeader(),
        onDownloadProgress: options?.onProgress,
        signal: options?.abortSignal,
    })
    const response = await axios.request<Response<API[K]["response"]>>(conf)
    const data = response.data

    if ("ERROR" in data) {
        const { type, value } = data.ERROR as ErrorMessage
        throw new KorpBackendError(type, value)
    }

    return data
}

export const korpEndpointUrl = (endpoint: keyof API): string => settings.korp_backend_url + "/" + endpoint

export class KorpBackendError extends Error {
    constructor(public readonly message: string, public readonly details: string) {
        super(message)
        this.name = "KorpBackendError"
    }
}
