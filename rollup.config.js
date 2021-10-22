import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';

export default [
    {
        input: 'src/index.ts',
        output: {
            file: './dist/index.js',
            name: 'tscompile',
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
            file: './dist/index.d.ts',
            name: 'tscompile',
            format: 'es',
            footer: 'export as namespace watcher;'
        },
        plugins: [
            typescript({ clean: true, tsconfigOverride: { compilerOptions: { module: 'ES2015', declaration: false, declarationMap: false } } }),
            dts({ respectExternal: true }),
        ]
    }

];
