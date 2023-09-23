import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';

const plugins = [resolve(), terser()];

export default [{
    input: './rollup/fontawesome.ts',
    output: {
        file: './public/fontawesome.js',
        format: 'esm'
    },
    plugins
}];
