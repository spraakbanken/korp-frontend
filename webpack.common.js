/** @format */
const webpack = require("webpack")
const path = require("path")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")

function getKorpConfigDir() {
    fs = require("fs")
    let config = "app"
    try {
        json = fs.readFileSync("run_config.json", { encoding: "utf-8" })
        config = JSON.parse(json).configDir || "app"
        console.log('Using "' + config + '" as config directory.')
    } catch (err) {
        console.error(err)
        console.log('No run_config.json given, using "app" as config directory (default).')
    }
    return config
}

const korpConfigDir = getKorpConfigDir()

module.exports = {
    resolve: {
        alias: {
            jquery: path.resolve(__dirname, "node_modules/jquery/src/jquery"),
            jreject: path.resolve(__dirname, "app/lib/jquery.reject"),
            jquerylocalize: path.resolve(__dirname, "app/lib/jquery.localize"),
            jqueryhoverintent: path.resolve(__dirname, "app/lib/jquery.hoverIntent"),
            korp_config: path.resolve(korpConfigDir, "config.yml"),
            custom: path.resolve(korpConfigDir, "custom/"),
            modes: path.resolve(korpConfigDir, "modes/"),
            "@": path.resolve(__dirname, "app/scripts"),
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: "ts-loader",
                    options: {
                        configFile: path.resolve(__dirname, "tsconfig.json"),
                    },
                },
                exclude: /node_modules/,
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",
                        options: {
                            minimize: {
                                caseSensitive: true,
                                collapseWhitespace: true,
                                conservativeCollapse: false,
                                keepClosingSlash: true,
                                minifyCSS: true,
                                minifyJS: true,
                                removeComments: true,
                                removeRedundantAttributes: true,
                                removeScriptTypeAttributes: true,
                                removeStyleLinkTypeAttributes: true,
                            },
                            esModule: false,
                        },
                    },
                ],
            },
            {
                test: /\.(jpe?g|svg|png|gif|ico|eot|ttf|woff2|otf|woff?)(\?v=\d+\.\d+\.\d+)?$/i,
                type: "asset/resource",
            },
            {
                test: /\.css$/,
                use: [{ loader: "style-loader" }, { loader: "css-loader" }],
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: process.env.NODE_ENV !== "production",
                        },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            // plugins: () => [require("tailwindcss"), require("autoprefixer")],
                            // sourceMap: process.env.NODE_ENV !== "production",
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: process.env.NODE_ENV !== "production",
                            // sourceMapContents: false
                        },
                    },
                ],
            },
            {
                test: /\.ya?ml$/,
                use: "yaml-loader",
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
        }),
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/,
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "app/index.html",
                },
                {
                    from: "app/img/raven_simple.svg",
                    to: "img",
                },
                {
                    from: "app/img/apple-touch-icon.png",
                    to: "img",
                },
                {
                    from: "app/img/json.png",
                    to: "img",
                },
                {
                    from: korpConfigDir + "/modes/*mode.js",
                    to: "modes/[name][ext]",
                },
                {
                    from: korpConfigDir + "/modes/*html",
                    to: "modes/[name][ext]",
                    noErrorOnMissing: true,
                },
                {
                    from: "app/translations/angular-locale_*.js",
                    to: "translations/[name][ext]",
                },
                {
                    from: "app/markup/msdtags.html",
                    to: "markup",
                },
                {
                    from: "app/translations/locale-*.json",
                    to: "translations/[name][ext]",
                },
                {
                    from: korpConfigDir + "/translations/*",
                    to: "translations/[name][ext]",
                },
            ],
        }),
        new webpack.DefinePlugin({
            __IS_LAB__: process.env.NODE_ENV == "staging",
        }),
    ],
    entry: {
        bundle: "./app/index.js",
        worker: "./app/scripts/statistics_worker.ts",
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        globalObject: "this",
    },
}
