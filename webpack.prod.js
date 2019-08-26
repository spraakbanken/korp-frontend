const merge = require('webpack-merge');
// const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
const common = require('./webpack.common.js');
const CompressionPlugin = require("compression-webpack-plugin")

module.exports = merge(common, {
  plugins: [
    // new ngAnnotatePlugin({
    //   add: true
    // }),
    new CompressionPlugin({
      // test: ""
    })
  ],
  optimization: {
    minimize: true
  },
  mode: 'production'
});
