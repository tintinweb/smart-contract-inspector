import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: {
    dir: 'build',
    format: 'cjs'
  },
  plugins: [nodeResolve()]
};