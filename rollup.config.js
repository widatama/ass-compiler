import buble from 'rollup-plugin-buble';
import replace from 'rollup-plugin-replace';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/esm/ass-compiler.js',
      format: 'esm',
    },
    {
      file: 'dist/ass-compiler.js',
      format: 'umd',
      name: 'assCompiler',
    }
  ],
  plugins: [
    buble({
      objectAssign: 'Object.assign',
    }),
    replace({
      'Number.isNaN': 'isNaN',
    }),
  ],
};
