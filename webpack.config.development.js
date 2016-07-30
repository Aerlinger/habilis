/* eslint max-len: 0 */
import webpack from 'webpack';
import baseConfig from './webpack.config.base';

let dev_port = process.env.DEV_PORT || 3000

const config = {
  ...baseConfig,

  debug: true,

  dev_port: dev_port,

  devtool: 'cheap-module-eval-source-map',

  entry: [
    'webpack-hot-middleware/client?path=http://localhost:' + dev_port + '/__webpack_hmr',
    './lib/renderer/index'
  ],

  output: {
    ...baseConfig.output,
    publicPath: 'http://localhost:' + dev_port + '/dist/'
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
      'process.env.NODE_ENV': JSON.stringify('development'),

    }),
    new webpack.DefinePlugin({
      'process.env': {
        'DEV_PORT': dev_port
      }
    })
  ],

  target: 'electron-renderer'
};

export default config;
