import path from 'path';
var precss       = require('precss');
var autoprefixer = require('autoprefixer');

export default {
  module:    {
    loaders: [
      {
        test:    /\.jsx?$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test:   /\.json$/,
        loader: 'json-loader'
      },
      {
        test:   /\.(yml)|(yaml)$/,
        loader: 'yaml-loader'
      },
      {
        test:    /\.scss$/,
        loaders: ["style", "css?sourceMap", "sass?sourceMap"]
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/,
        loader: 'url-loader?limit=30000&name=[name]-[hash].[ext]'
      }
    ]
  },
  sassLoader: {
    includePaths: [path.resolve(__dirname, "./src/renderer")]
  },
  postcss: function () {
    return [precss, autoprefixer];
  },
  output:    {
    path:          path.join(__dirname, 'dist'),
    filename:      'bundle.js',
    libraryTarget: 'commonjs2'
  },
  resolve:   {
    extensions:   ['', '.js', '.jsx', '.json'],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
  },
  plugins:   [],
  externals: [
    // put your node 3rd party libraries which can't be built with webpack here
    // (mysql, mongodb, and so on..)
  ]
};
