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
            const obj = { a: { b: 1 } };
            let result = false;
            const handler = () => { result = true; };
            watcher.watchchain(obj, 'a.b', handler);

            equal(!!obj.a[__watchs__], true);
            equal(!!obj[__watchs__], true);
            equal(!!obj[__watchchains__], true);

            watcher.unwatchchain(obj, 'a.b', handler);
            equal(!!obj.a[__watchs__], false);
            equal(!!obj[__watchs__], false);
            equal(!!obj[__watchchains__], false);
        }
    });

    it('watchchain 相同子对象', () =>
    {
        {
            const obj = { a: { b: 1 } };
            const obj1 = { a: obj.a };
            let result = false;
            let result1 = false;
            const handler = () => { result = true; };
            watcher.watchchain(obj, 'a.b', handler);
            equal(!!obj.a[__watchs__], true);
            equal(!!obj[__watchs__], true);
            equal(!!obj[__watchchains__], true);

            const handler1 = () => { result1 = true; };
            watcher.watchchain(obj1, 'a.b', handler1);
            equal(!!obj1.a[__watchs__], true);
            equal(!!obj1[__watchs__], true);
            equal(!!obj1[__watchchains__], true);

            result = false;
            result1 = false;
            obj.a.b = obj.a.b + 1;
            equal(result, true);
            equal(result1, true);

            result = false;
            result1 = false;
            obj1.a.b = obj1.a.b + 1;
            equal(result, true);
            equal(result1, true);

            watcher.unwatchchain(obj, 'a.b', handler);
            equal(!!obj.a[__watchs__], true); // 由于obj与obj1公用a
            equal(!!obj[__watchs__], false);
            equal(!!obj[__watchchains__], false);

            equal(!!obj1.a[__watchs__], true);
            equal(!!obj1[__watchs__], true);
            equal(!!obj1[__watchchains__], true);

            result = false;
            result1 = false;
            obj.a.b = obj.a.b + 1;
            equal(result, false);
            equal(result1, true);

            watcher.unwatchchain(obj1, 'a.b', handler1);

            equal(!!obj.a[__watchs__], false); // 由于obj与obj1公用a
            equal(!!obj[__watchs__], false);
            equal(!!obj[__watchchains__], false);

            equal(!!obj1.a[__watchs__], false);
            equal(!!obj1[__watchs__], false);
            equal(!!obj1[__watchchains__], false);
        }
    });

    it('watchchain 相同子对象1', () =>
    {
        {
            const obj = { a: { b: 1 } };
            const obj1 = { a: obj.a };
            let result = false;
            let result1 = false;
            const handler = () => { result = true; };
            watcher.watchchain(obj, 'a.b', handler);

            const handler1 = () => { result1 = true; };
            watcher.watchchain(obj1, 'a.b', handler1);

            result = false;
            result1 = false;
            obj1.a = { b: obj.a.b + 1 }; // obj与obj1不再公用a
            equal(result, false);
            equal(result1, true);

            result = false;
            result1 = false;
            obj1.a.b = obj1.a.b + 1;
            equal(result, false);
            equal(result1, true);

            watcher.unwatchchain(obj, 'a.b', handler);
            equal(!!obj.a[__watchs__], false);
            equal(!!obj[__watchs__], false);
            equal(!!obj[__watchchains__], false);

            equal(!!obj1.a[__watchs__], true);
            equal(!!obj1[__watchs__], true);
            equal(!!obj1[__watchchains__], true);

            result = false;
            result1 = false;
            obj.a.b = obj.a.b + 1;
            equal(result, false);
            equal(result1, false);

            watcher.unwatchchain(obj1, 'a.b', handler1);

            equal(!!obj.a[__watchs__], false);
            equal(!!obj[__watchs__], false);
            equal(!!obj[__watchchains__], false);

            equal(!!obj1.a[__watchs__], false);
            equal(!!obj1[__watchs__], false);
            equal(!!obj1[__watchchains__], false);
        }
    });
});
