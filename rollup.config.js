import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';
import pkg from './package.json';

export default [
    {
        input: 'src/index.ts',
        output: {
            file: pkg.bundle,
            name: pkg.bundleName,
            format: 'umd',
            sourcemap: true
        },
        plugins: [
            typescript({ clean: true, tsconfigOverride: { compilerOptions: { module: 'ES2015', declaration: false, declarationMap: false } } }),
        ]
    },
    {
        input: 'src/index.ts',
        output: {
            file: pkg['bundle:types'],
            name: pkg.bundleName,
            format: 'es',
            footer: `export as namespace ${pkg.bundleName};`
        },
        plugins: [
            typescript({ clean: true, tsconfigOverride: { compilerOptions: { module: 'ES2015', declaration: false, declarationMap: false } } }),
            dts({ respectExternal: true }),
        ]
    }

];
