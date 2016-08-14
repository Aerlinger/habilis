/* eslint max-len: 0 */
import webpack from 'webpack';
import baseConfig from './webpack.config.base';
import merge from 'webpack-merge';

let dev_port = process.env.DEV_PORT || 3000

export default merge(baseConfig, {
  debug: true,

  dev_port: dev_port,

  devtool: 'cheap-module-eval-source-map',

  entry: [
    'webpack-hot-middleware/client?path=http://localhost:' + dev_port + '/__webpack_hmr&timeout=2000&noInfo=true',
    './src/renderer/index'
  ],

  output: {
    publicPath: 'http://localhost:' + dev_port + '/dist/'
  },

  module: {
    loaders: [
      {
        test: /\.global\.css$/,
        loaders: [
          'style-loader',
          'css-loader?sourceMap'
        ]
      },
      {
        test: /^((?!\.global).)*\.css$/,
        loaders: [
          'style-loader',
          'css-loader?modules&sourceMap&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'
        ]
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),

    }),
    new webpack.DefinePlugin({
      'process.env': {
        'DEV_PORT': dev_port
      }
    })
  ],

  target: 'electron-renderer'
});
