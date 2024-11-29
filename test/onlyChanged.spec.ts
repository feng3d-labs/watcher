import { watcher } from '../src/watcher';

import { assert, describe, it } from 'vitest';
const { ok, equal, deepEqual } = assert;

describe('onlyChanged', () =>
{
    it('onlyChanged', () =>
    {
        const obj = { a: { b: Math.random() }, d: Math.random() };

        {
            let result = false;
            watcher.watch(obj, 'd', () => { result = true; });
            obj.d = obj.d;
            equal(result, false);
        }

        {
            const onlyChanged = true;
            let result = false;
            watcher.watch(obj, 'd', () => { result = true; }, undefined, onlyChanged);
            obj.d = obj.d;
            equal(result, false);
        }

        {
            const onlyChanged = false;
            let result = false;
            watcher.watch(obj, 'd', () => { result = true; }, undefined, onlyChanged);
            obj.d = obj.d;
            equal(result, true); // 当 onlyChanged 为 false 时，值没有变化也会调用回调函数。
        }

        {
            let result = false;
            watcher.watchchain(obj, 'a.b', () => { result = true; });
            obj.a.b = obj.a.b;
            equal(result, false);
        }

        {
            const onlyChanged = true;
            let result = false;
            watcher.watchchain(obj, 'a.b', () => { result = true; }, undefined, onlyChanged);
            obj.a.b = obj.a.b;
            equal(result, false);
        }

        {
            const onlyChanged = false;
            let result = false;
            watcher.watchchain(obj, 'a.b', () => { result = true; }, undefined, onlyChanged);
            obj.a.b = obj.a.b;
            equal(result, true); // 当 onlyChanged 为 false 时，值没有变化也会调用回调函数。
        }

        {
            let result = false;
            watcher.watchobject(obj, { a: { b: undefined } }, () => { result = true; });
            obj.a.b = obj.a.b;
            equal(result, false);
        }

        {
            const onlyChanged = true;
            let result = false;
            watcher.watchobject(obj, { a: { b: undefined } }, () => { result = true; }, undefined, onlyChanged);
            obj.a.b = obj.a.b;
            equal(result, false);
        }

        {
            const onlyChanged = false;
            let result = false;
            watcher.watchobject(obj, { a: { b: undefined } }, () => { result = true; }, undefined, onlyChanged);
            obj.a.b = obj.a.b;
            equal(result, true); // 当 onlyChanged 为 false 时，值没有变化也会调用回调函数。
        }
    });
});
