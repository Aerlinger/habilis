/* eslint no-console: 0 */

import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import config from './webpack.config';

const app = express();
const compiler = webpack(config);
const PORT = 8080;

const webpackDev = webpackDevMiddleware(compiler, {
  publicPath: `http://localhost:${PORT}/dist/`,
  stats: {
    colors: true
  },
  hot: true,
  historyApiFallback: true
});

app.use(webpackDev);
app.use(webpackHotMiddleware(compiler, {
  log: console.log,
  path: '/__webpack_hmr',
  heartbeat: 1000
}));

const server = app.listen(PORT, 'localhost', err => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(`Listening at http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('Stopping dev server');

  webpackDev.close();
  server.close(() => {
    process.exit(0);
  });
});
