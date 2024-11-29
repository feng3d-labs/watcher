import * as fs from 'fs';
import * as path from 'path';

const pkgpath = path.resolve('package.json');

let pkg = fs.readFileSync(pkgpath, 'utf8');
pkg = pkg
    .replace(`"types": "./src/index.ts"`, `"types": "./lib/index.d.ts"`)
    //
    .replace(`"module": "./src/index.ts"`, `"module": "./dist/index.mjs"`)
    .replace(`"main": "./src/index.ts"`, `"main": "./dist/index.umd.js"`)
    //
    .replace(`"import": "./src/index.ts"`, `"import": "./dist/index.mjs"`)
    .replace(`"require": "./src/index.ts"`, `"require": "./dist/index.umd.js"`)
    ;

fs.writeFileSync(pkgpath, pkg, 'utf8');