/** @format */

declare module "korp_config" {
    const settings: import("@/settings/settings.types").Settings
    export = settings
}

declare module "*.svg" {
    const content: any
    export default content
}

declare module "*.png" {
    const content: any
    export default content
}

declare module "rickshaw" {
    const Rickshaw: any
    export default Rickshaw
}

declare module "comma-separated-values/csv" {
    const CSV: any
    export default CSV
}

interface Window {
    /** Matomo action queue */
    _paq?: any[]
}

// Type of process.env
namespace NodeJS {
    interface ProcessEnv {
        ENVIRONMENT: "development" | "staging" | "production"
    }
}
