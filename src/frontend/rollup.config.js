import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: './src/**/*.{js,ts,jsx,tsx}',
  output: {
    dir: 'dist',
    format: 'es'
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      tslib: require('tslib')
    }),
    terser()
  ],
  external: ['lodash.debounce']
};
