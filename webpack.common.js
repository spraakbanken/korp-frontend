/** @format */
const webpack = require("webpack")
const path = require("path")
const Dotenv = require("dotenv")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { VueLoaderPlugin } = require("vue-loader")
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

// Read .env into process.env
Dotenv.config()

function getKorpConfigDir() {
    fs = require("fs")
    let config = "app"
    try {
        json = fs.readFileSync("run_config.json", { encoding: "utf-8" })
        config = JSON.parse(json).configDir || "app"
        console.log('Using "' + config + '" as config directory.')
    } catch (err) {
        console.log('No run_config.json given, using "app" as config directory (default).')
    }
    return config
}

const korpConfigDir = getKorpConfigDir()

module.exports = {
    resolve: {
        extensions: [".ts", "..."],
        alias: {
            jquery: path.resolve(__dirname, "node_modules/jquery/src/jquery"),
            jquerylocalize: path.resolve(__dirname, "app/lib/jquery.localize"),
            korp_config: path.resolve(korpConfigDir, "config.yml"),
            custom: path.resolve(korpConfigDir, "custom/"),
            modes: path.resolve(korpConfigDir, "modes/"),
            "@": path.resolve(__dirname, "app/scripts"),
        },
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: "vue-loader",
            },
            {
                test: /\.tsx?$/,
                use: {
                    loader: "ts-loader",
                    options: {
                        configFile: path.resolve(__dirname, "tsconfig.json"),
                        appendTsSuffixTo: [/\.vue$/],
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
        // Create index.html with a dynamic reference to index.(hash).js
        new HtmlWebpackPlugin({
            /** @see https://github.com/jantimon/html-webpack-plugin#writing-your-own-templates */
            template: "app/index.html",
        }),
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
                    noErrorOnMissing: true,
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
        new webpack.EnvironmentPlugin({
            // Values here are defaults, in case the named variable is undefined
            // See https://webpack.js.org/plugins/environment-plugin/
            // Using our own variable instead of NODE_ENV, since NODE_ENV should really only be "development" or "production"
            ENVIRONMENT: "development", // Can be: "development", "staging" or "production"
        }),
        new webpack.DefinePlugin({
            // See https://vuejs.org/api/compile-time-flags.html
            __VUE_OPTIONS_API__: "false", // Enable if needed by 3rd party deps
        }),
        new VueLoaderPlugin(),
        new NodePolyfillPlugin(),
    ],
    ignoreWarnings: [
        (e) => e.message.includes("Can't resolve 'custom"),
        (e) => e.message.includes("Can't resolve 'modes"),
    ],
    entry: {
        index: "./app/index.ts",
        worker: "./app/scripts/statistics_worker.ts",
    },
    output: {
        filename: "[name].[contenthash].js",
        path: path.resolve(__dirname, "dist"),
        globalObject: "this",
        clean: true,
    },
}
