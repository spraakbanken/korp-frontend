const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');

const host = process.env.KORP_HOST || "localhost"
const port = process.env.KORP_PORT || 9111

let https
if (process.env.KORP_HTTPS) {
  https = {
    key: process.env.KORP_KEY,
    cert: process.env.KORP_CERT,
  }
} else {
  https = false
}

module.exports = merge(common, {
  devServer: {
    host,
    port,
    https
  },
  devtool: 'inline-source-map',
  mode: 'development'
});
