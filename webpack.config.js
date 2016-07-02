var path = require('path');

import webpack from 'webpack';
var ExtractTextPlugin = require("extract-text-webpack-plugin");
// var HtmlWebpackPlugin = require('html-webpack-plugin');
// var HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
//   template: path.resolve(__dirname, 'index.html'),  // File transferred to dist
//   filename: 'index.html',
//   inject: 'body'
// });

export default {
  debug: true,

  devtool: 'cheap-module-eval-source-map',

  entry: {
    main: [
      'react-hot-loader/patch',
      'babel-polyfill',
      './src/main',
      'webpack/hot/only-dev-server',
      'webpack-hot-middleware/client?path=http://localhost:8080/__webpack_hmr'
    ]
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: 'http://localhost:8008/dist/'
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        cacheDirectory: true,
        query: {
          plugins: ['react-hot-loader/babel', 'lodash'],
          presets: ['react', 'es2015']
        }
      },
      {test: /\.(png|woff|woff2|eot|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file'},
      {test: /\.md$/, loader: 'raw'},
      {test: /\.ya?ml$/, loader: 'json!yaml'},

      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.(less|css)$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
      }
    ]
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __DEV__: true,
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    }),
    new ExtractTextPlugin("default.css")
  ],

  target: 'electron-renderer',

  stats: {
    colors: true
  },

  externals: {
    'ascii-table': 'AsciiTable',
    templates: 'templates',
    ace: 'ace',
    ipc: 'ipc'
  }
};

