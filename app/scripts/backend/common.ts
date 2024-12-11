/** @format */
import { httpConfAddMethodFetch } from "@/util"
import { getAuthorizationHeader } from "@/components/auth/auth"
import settings from "@/settings"
import { API, Response } from "./types"

export async function korpRequest<K extends keyof API>(
    endpoint: K,
    params: API[K]["params"]
): Promise<Response<API[K]["response"]>> {
    const { url, request } = httpConfAddMethodFetch(settings.korp_backend_url + "/" + endpoint, params)
    request.headers = { ...request.headers, ...getAuthorizationHeader() }
    const response = await fetch(url, request)
    return (await response.json()) as Response<API[K]["response"]>
}
