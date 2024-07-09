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
