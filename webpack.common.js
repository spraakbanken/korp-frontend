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
            jquery: "jquery/src/jquery",
            jreject: path.resolve(__dirname, "app/lib/jquery.reject"),
            jquerylocalize: path.resolve(__dirname, "app/lib/jquery.localize"),
            jqueryhoverintent: path.resolve(__dirname, "app/lib/jquery.hoverIntent"),
            configjs: path.resolve(korpConfigDir, "config.js"),
            commonjs: path.resolve(korpConfigDir, "modes/common.js"),
            defaultmode: path.resolve(korpConfigDir, "modes/default_mode.js"),
            customcss: path.resolve(korpConfigDir, "styles/"),
            customscripts: path.resolve(korpConfigDir, "scripts/"),
            customviews: path.resolve(korpConfigDir, "views/"),
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                    },
                },
            },
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
                test: require.resolve(
                    path.resolve(__dirname, "app/scripts/cqp_parser/CQPParser.js")
                ),
                use: "imports-loader?this=>window",
            },
            {
                test: /\.pug$/i,
                exclude: [
                    // does not work
                    path.resolve(__dirname, "app/index.pug"),
                ],
                use: [
                    { loader: "file-loader" },
                    {
                        loader: "extract-loader",
                        options: { publicPath: "" },
                    },
                    { loader: "html-loader" },
                    { loader: "pug-html-loader" },
                ],
            },
            {
                test: /index.pug$/,
                use: [
                    { loader: "file-loader?name=index.html" },
                    {
                        loader: "extract-loader",
                        options: { publicPath: "" },
                    },
                    {
                        loader: "html-loader",
                        options: {
                            attrs: ["img:src", "link:href"],
                        },
                    },
                    {
                        loader: "pug-html-loader",
                        options: {
                            // TODO we should not pretty-print HTML, but removing this
                            // option will result in that some elements get closer together
                            // and need to be fixed with CSS
                            pretty: true,
                        },
                    },
                ],
            },
            {
                test: /\.html$/,
                exclude: [path.resolve(korpConfigDir, "./views/")],
                use: [
                    { loader: "file-loader" },
                    {
                        loader: "extract-loader",
                        options: { publicPath: "" },
                    },
                    { loader: "html-loader" },
                ],
            },
            {
                test: /\.html$/,
                include: [path.resolve(korpConfigDir, "./views/")],
                use: [
                    {
                        loader: "html-loader",
                        options: {
                            minimize: true,
                            conservativeCollapse: false,
                        },
                    },
                ],
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loader: "file-loader?name=[name].[contenthash].[ext]",
            },
            {
                test: /\.ico$/i,
                loader: "file-loader?name=[name].[ext]",
            },
            {
                test: /\.otf$/i,
                loader: "file-loader",
            },
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file-loader?mimetype=application/font-woff",
            },
            {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file-loader?mimetype=application/font-woff",
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file-loader?mimetype=application/octet-stream",
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file-loader",
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
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
        }),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: korpConfigDir + "/modes/*mode.js",
                    to: "modes",
                    flatten: true,
                },
                {
                    from: korpConfigDir + "/modes/*html",
                    to: "modes",
                    flatten: true,
                },
                {
                    from: "app/translations/angular-locale_*.js",
                    to: "translations",
                    flatten: true,
                },
                {
                    from: "app/markup/msdtags.html",
                    to: "markup",
                },
                {
                    from: "app/translations/locale-*.json",
                    to: "translations",
                    flatten: true,
                },
                {
                    from: korpConfigDir + "/translations/*",
                    to: "translations",
                    flatten: true,
                },
                {
                    from: "app/lib/deptrees/",
                    to: "lib/deptrees",
                },
                /* TODO: probably remove this? cannot find any json files there.
                    {
                        from: "node_modules/geokorp/dist/data/*.json",
                        // TODO hard-coded in geokorp project that these files should be here
                        // we need to change geokorp so that these files are required
                        to: "components/geokorp/dist/data",
                        flatten: true
                    }
                    */
            ],
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
