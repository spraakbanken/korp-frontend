/** @format */
import { axiosConfAddMethod } from "@/util"
import { getAuthorizationHeader } from "@/components/auth/auth"
import settings from "@/settings"
import { API, Response } from "./types"
import axios from "axios"

export async function korpRequest<K extends keyof API>(
    endpoint: K,
    params: API[K]["params"]
): Promise<Response<API[K]["response"]>> {
    const conf = axiosConfAddMethod({
        url: settings.korp_backend_url + "/" + endpoint,
        params,
        headers: getAuthorizationHeader(),
    })
    const response = await axios.request<Response<API[K]["response"]>>(conf)
    return response.data
}
