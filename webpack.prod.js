/** @format */
const merge = require("webpack-merge")
const common = require("./webpack.common.js")
const CompressionPlugin = require("compression-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")

module.exports = merge(common, {
    plugins: [new CompressionPlugin({})],
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    mangle: {
                        reserved: ["$super"]
                    }
                }
            })
        ]
    },
    mode: "production"
})
