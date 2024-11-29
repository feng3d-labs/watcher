import { watcher } from '../src/watcher';

import { assert, describe, it } from 'vitest';
const { ok, equal, deepEqual } = assert;

describe('onlyChanged', () =>
{
    it('onlyChanged', () =>
    {
        const obj = { a: { b: { c: 1 } }, d: 1 };

        {
            let result = false;
            watcher.watch(obj, "a", () => { result = true; });
            obj.d = obj.d;
            equal(result, false);
        }

        {
            const onlyChanged = true;
            let result = false;
            watcher.watch(obj, "a", () => { result = true; }, undefined, onlyChanged);
            obj.d = obj.d;
            equal(result, false);
        }

        {
            const onlyChanged = false;
            let result = false;
            watcher.watch(obj, "a", () => { result = true; }, undefined, onlyChanged);
            obj.d = obj.d;
            equal(result, false);
        }


    });
});
