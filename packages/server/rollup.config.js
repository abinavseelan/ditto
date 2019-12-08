const path = require('path');
const typescript = require('@rollup/plugin-typescript');
const run = require('@rollup/plugin-run');
const inject = require('@rollup/plugin-inject');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const json = require('@rollup/plugin-json');
const builtins = require('rollup-plugin-node-builtins');

const DEV = process.env.NODE_ENV === 'development';

export default {
  input: './src/index.ts',
  output: {
    file: path.resolve(__dirname, '..', '..', 'dist', 'server', 'server.dist.js'),
    format: 'cjs'
  },
  preferBuiltins: true,
  plugins: [
    typescript(),
    inject({
      __PORT__: process.env.PORT || 1337,
    }),
    resolve({
      extensions: ['.mjs', '.js', '.ts', '.json'],
      jsnext: true,
      preferBuiltins: true,
    }),
    builtins(),
    commonjs({
      include: /node_modules/,
    }),
    json(),
    DEV && run(),
  ],
};
