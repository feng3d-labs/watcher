import { watcher } from '../src/watcher';

import { assert, describe, it } from 'vitest';
const { ok, equal, deepEqual } = assert;

const __watchs__ = '__watchs__';
const __watchchains__ = '__watchchains__';

describe('watchchain', () =>
{
    it('watchchain', () =>
    {

        {
            const obj = { a: { b: Math.random() }, d: Math.random() };
            let result = false;
            const handler = () => { result = true; };
            watcher.watchchain(obj, 'a.b', handler);
            
            equal(!!obj[__watchs__], true);
            equal(!!obj[__watchchains__], true);
            
            watcher.unwatchchain(obj, 'a.b', handler);
            equal(!!obj[__watchs__], false);
            equal(!!obj[__watchchains__], false);
        }

    });
});
