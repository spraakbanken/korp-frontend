const merge = require('webpack-merge');
// const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
const common = require('./webpack.common.js');
const CompressionPlugin = require("compression-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")

module.exports = merge(common, {
  plugins: [
    new CompressionPlugin({
      // test: ""
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            reserved: ['$super'],
          },
        }
      })
    ]
  },
  mode: 'production'
});
