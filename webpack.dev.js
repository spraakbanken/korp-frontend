const merge = require('webpack-merge');
const common = require('./webpack.common.js');


module.exports = merge(common, {
  devServer: {
    host: process.env.KORP_HOST || "localhost",
    port: 9000
  },
  devtool: 'inline-source-map',
  mode: 'development'
});
