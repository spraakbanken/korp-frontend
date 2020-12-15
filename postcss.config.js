// const tailwindcss = require("tailwindcss")
const autoprefixer = require("autoprefixer")

const devMode = process.env.NODE_ENV !== "production"

module.exports = {
    plugins: [
        // tailwindcss("./tailwind.config.js"),
        require("tailwindcss"),
        autoprefixer
    ]
}
