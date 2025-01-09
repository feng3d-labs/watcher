import { watcher } from '../src/watcher';

import { assert, describe, it } from 'vitest';
const { ok, equal, deepEqual } = assert;

describe('onlyChanged', () =>
{
    it('onlyChanged watch', () =>
    {
        {
            const obj = { a: { b: Math.random() }, d: Math.random() };
            let result = false;
            watcher.watch(obj, 'd', () => { result = true; });
            obj.d = obj.d;
            equal(result, false);
        }

        {
            const obj = { a: { b: Math.random() }, d: Math.random() };
            const onlyChanged = true;
            let result = false;
            watcher.watch(obj, 'd', () => { result = true; }, undefined, onlyChanged);
            obj.d = obj.d;
            equal(result, false);
        }

        {
            const obj = { a: { b: Math.random() }, d: Math.random() };
            const onlyChanged = false;
            let result = false;
            watcher.watch(obj, 'd', () => { result = true; }, undefined, onlyChanged);
            obj.d = obj.d;
            equal(result, true);
        }
    });

    it('onlyChanged watchchain', () =>
    {

        {
            const obj = { a: { b: Math.random() }, d: Math.random() };
            let result = false;
            watcher.watchchain(obj, 'a.b', () => { result = true; });
            obj.a.b = obj.a.b;
            equal(result, false);
        }

        {
            const obj = { a: { b: Math.random() }, d: Math.random() };
            const onlyChanged = true;
            let result = false;
            watcher.watchchain(obj, 'a.b', () => { result = true; }, undefined, onlyChanged);
            obj.a.b = obj.a.b;
            equal(result, false);
        }

        {
            const obj = { a: { b: Math.random() }, d: Math.random() };
            const onlyChanged = false;
            let result = false;
            const handler = () => { result = true; };
            watcher.watchchain(obj, 'a.b', handler, undefined, onlyChanged);
            obj.a.b = obj.a.b;
            equal(result, true);

            //
            result = false;
            obj.a = { b: obj.a.b };
            equal(result, true);

            //
            result = false;
            obj.a.b = obj.a.b;
            equal(result, true);

            watcher.unwatchchain(obj, 'a.b', handler, undefined);
            result = false;
            obj.a = { b: obj.a.b };
            equal(result, false);
        }
    });

    it('onlyChanged watchobject', () =>
    {
        {
            const obj = { a: { b: Math.random() }, d: Math.random() };
            let result = false;
            watcher.watchobject(obj, { a: { b: undefined } }, () => { result = true; });
            obj.a.b = obj.a.b;
            equal(result, false);
        }

        {
            const obj = { a: { b: Math.random() }, d: Math.random() };
            const onlyChanged = true;
            let result = false;
            watcher.watchobject(obj, { a: { b: undefined } }, () => { result = true; }, undefined, onlyChanged);
            obj.a.b = obj.a.b;
            equal(result, false);
        }

        {
            const obj = { a: { b: Math.random() }, d: Math.random() };
            const onlyChanged = false;
            let result = false;
            watcher.watchobject(obj, { a: { b: undefined } }, () => { result = true; }, undefined, onlyChanged);
            obj.a.b = obj.a.b;
            equal(result, true);
        }
    });
});
