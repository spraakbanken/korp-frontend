/**
 * @file Typings for settings as they are stored and used in the frontend.
 * @format
 */

import { AppSettings } from "./app-settings.types"
import { ConfigTransformed } from "./config-transformed.types"

export type Settings = AppSettings & ConfigTransformed
