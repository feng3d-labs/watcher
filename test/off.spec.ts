import { watcher } from '../src/watcher';

import { assert, describe, it } from 'vitest';
const { ok, equal, deepEqual } = assert;

describe('off 每个监听都会有返回值，并支持链式监听', () =>
{
    it('watch off', () =>
    {
        const watchInfo = watcher.on();
        //
        const o = { a: 1 };
        let out = '';
        const f = (_h, _p, _o) => { out += 'f'; };
        const f1 = (_h, _p, _o) => { out += 'f1'; };
        watchInfo.watch(o, 'a', f);
        watchInfo.watch(o, 'a', f1);
        out = '';
        o.a = 2;
        equal(out, 'ff1');
        watchInfo.off();
        out = '';
        o.a = 3;
        equal(out, '');

        //
        watchInfo.watch(o, 'a', f);
        watchInfo.watch(o, 'a', f1);
        out = '';
        o.a = 2;
        equal(out, 'ff1');
        watchInfo.off();
        out = '';
        o.a = 3;
        equal(out, '');
    });
});
