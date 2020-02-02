const NodemonPlugin = require('nodemon-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const DEV = process.env.development;
const PORT = process.env.port;

module.exports = {
  entry: './src/index.ts',

  target: 'node',

  output: {
    path: path.resolve(__dirname, '..', '..', 'dist', 'server'),
    filename: 'server.bundle.js',
  },

  mode: DEV ? 'development' : 'production',

  module: {
    rules: [
      {
        test: /\.ts/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      __NODE_ENV__: JSON.stringify(DEV ? 'development' : 'production'),
      __PORT__: JSON.stringify(PORT || 1337),
    }),
    new NodemonPlugin()
  ],
}
