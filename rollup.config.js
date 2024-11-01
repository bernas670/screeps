"use strict";

const clear = require('rollup-plugin-clear');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');

export default {
  input: "src/main.ts",
  output: {
    file: "default/main.js",
    format: "cjs",
    sourcemap: true
  },

  plugins: [
    clear({ targets: ["dist"] }),
    resolve(),
    commonjs(),
    typescript({tsconfig: "./tsconfig.json"})
  ]
}