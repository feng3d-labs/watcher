import { ok } from 'assert';
import { watcher } from '../src';

describe('watcher', () =>
{
    it('watch Object', () =>
    {
        const o = { a: 1 };
        let out = '';
        const f = (_h, _p, _o) => { out += 'f'; };
        const f1 = (_h, _p, _o) => { out += 'f1'; };
        watcher.watch(o, 'a', f);
        watcher.watch(o, 'a', f1);
        o.a = 2;
        watcher.unwatch(o, 'a', f);
        o.a = 3;
        ok(out === 'ff1f1', out);
    });

    it('bind', () =>
    {
        const o1 = { a: 1 };
        const o2 = { a: 1 };

        watcher.bind(o1, 'a', o2, 'a');

        o1.a = 2;
        ok(o1.a === o2.a && o2.a === 2);

        o2.a = 5;
        ok(o1.a === o2.a && o1.a === 5);
    });

    it('watch custom A', () =>
    {
        class A
        {
            get a()
            {
                return this._a;
            }
            set a(v)
            {
                this._a = v;
                num = v;
            }
            private _a = 1;
        }
        const o = new A();
        let num = 0;
        let out = '';
        const f = (_h, _p, _o) => { out += 'f'; };
        const f1 = (_h, _p, _o) => { out += 'f1'; };
        watcher.watch(o, 'a', f);
        watcher.watch(o, 'a', f1);
        o.a = 2;
        ok(num === 2);
        watcher.unwatch(o, 'a', f);
        o.a = 3;
        ok(out === 'ff1f1', out);
        ok((num as any) === 3);
    });

    it('watch Object 性能', () =>
    {
        const o = { a: 1 };

        const num = 10000000;
        let out = '';
        const f = () => { out += 'f'; };
        let s = Date.now();
        for (let i = 0; i < num; i++)
        {
            o.a = i;
        }
        const t1 = Date.now() - s;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        out = '';
        watcher.watch(o, 'a', f);
        o.a = 2;
        watcher.unwatch(o, 'a', f);
        o.a = 3;
        s = Date.now();
        for (let i = 0; i < num; i++)
        {
            o.a = i;
        }
        const t2 = Date.now() - s;

        ok(true, `${t1}->${t2} watch与unwatch操作后性能 1->${t1 / t2}`);
    });

    it('watchchain Object', () =>
    {
        const o = { a: { b: { c: 1 } } };
        let out = '';
        const f = (_h: any, _p: any, _o: any) => { out += 'f'; };
        const f1 = (_h, _p, _o) => { out += 'f1'; };
        watcher.watchchain(o, 'a.b.c', f);
        watcher.watchchain(o, 'a.b.c', f1);
        o.a.b.c = 2;
        watcher.unwatchchain(o, 'a.b.c', f);
        o.a.b.c = 3;
        ok(out === 'ff1f1', out);
        //
        out = '';
        watcher.unwatchchain(o, 'a.b.c', f1);
        o.a.b.c = 4;
        ok(out === '', out);
        //
        out = '';
        watcher.watchchain(o, 'a.b.c', f);
        o.a.b.c = 4;
        o.a.b.c = 5;
        ok(out === 'f', out);
        //
        out = '';
        o.a = { b: { c: 1 } };
        o.a.b.c = 3;
        ok(out === 'ff', `out:${out}`);
        //
        out = '';
        watcher.unwatchchain(o, 'a.b.c', f);
        o.a.b.c = 4;
        ok(out === '', `out:${out}`);
        //
        out = '';
        watcher.watchchain(o, 'a.b.c', f);
        o.a = <any>null;
        o.a = { b: { c: 1 } };
        o.a.b.c = 5;
        ok(out === 'fff', out);
    });
});
