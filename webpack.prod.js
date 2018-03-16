const merge = require('webpack-merge');
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
const common = require('./webpack.common.js');


module.exports = merge(common, {
  plugins: [
    new ngAnnotatePlugin({
      add: true
    })
  ],
  mode: 'production'
});
