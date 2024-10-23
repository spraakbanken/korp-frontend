/** @format */
const webpack = require("webpack")
const { merge } = require("webpack-merge")
const common = require("./webpack.common.js")
const CompressionPlugin = require("compression-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer")

module.exports = merge(common, {
    plugins: [
        new CompressionPlugin({}),
        new BundleAnalyzerPlugin({
            // creates a report.html in the dist folder.
            analyzerMode: "static",
            openAnalyzer: false,
        }),
        new webpack.DefinePlugin({
            // See https://vuejs.org/api/compile-time-flags.html
            __VUE_PROD_DEVTOOLS__: "false",
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
        }),
    ],
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    mangle: {
                        reserved: ["$super"],
                    },
                },
            }),
        ],
    },
    mode: "production",
})
