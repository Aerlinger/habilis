/* eslint max-len: 0 */
import webpack from 'webpack';
import baseConfig from './webpack.config.base';

let devPort = 3001

const config = {
  ...baseConfig,

  debug: true,
  dev_port: process.env.PORT || devPort,

  devtool: 'cheap-module-eval-source-map',

  entry: [
    'webpack-hot-middleware/client?path=http://localhost:3001/__webpack_hmr',
    './lib/renderer/index'
  ],

  output: {
    ...baseConfig.output,
    publicPath: 'http://localhost:3001/dist/'
  },

  module: {
    ...baseConfig.module,
    loaders: [
      ...baseConfig.module.loaders,

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
    ...baseConfig.plugins,
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],

  target: 'electron-renderer'
};

export default config;
