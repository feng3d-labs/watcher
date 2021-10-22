(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.watcher = {}));
})(this, (function (exports) { 'use strict';

    /**
     * 观察装饰器，观察被装饰属性的变化
     *
     * @param onChange 属性变化回调  例如参数为“onChange”时，回调将会调用this.onChange(property, oldValue, newValue)
     *
     * 使用@watch后会自动生成一个带"_"的属性，例如 属性"a"会生成"_a"
     *
     * 通过使用 eval 函数 生成出 与自己手动写的set get 一样的函数，性能已经接近 手动写的get set函数。
     *
     * 性能比Watcher.watch更加高效，但还是建议使用 Watcher.watch 替代 @watch ，由于 @watch 没有对onChange更好的约束 使用 时容易出现运行时报错。
     */
    function watch(onChange) {
        return function (target, property) {
            var key = "_" + property;
            console.assert(target[onChange], "\u5728\u5BF9\u8C61 " + target + " \u4E0A\u627E\u4E0D\u5230\u65B9\u6CD5 " + onChange);
            Object.defineProperty(target, property, {
                get: function () { return this[key]; },
                set: function (value) {
                    if (this[key] === value) {
                        return;
                    }
                    var oldValue = this[key];
                    this[key] = value;
                    this[onChange](property, oldValue, value);
                },
                enumerable: true,
                configurable: true,
            });
        };
    }
    var Watcher = /** @class */ (function () {
        function Watcher() {
            this._binds = [];
        }
        /**
         * 监听对象属性的变化
         *
         * 注意：使用watch后获取该属性值的性能将会是原来的1/60，避免在运算密集处使用该函数。
         *
         * @param object 被监听对象
         * @param property 被监听属性
         * @param handler 变化回调函数 (object: T, property: string, oldValue: V) => void
         * @param thisObject 变化回调函数 this值
         */
        Watcher.prototype.watch = function (object, property, handler, thisObject) {
            if (!Object.getOwnPropertyDescriptor(object, __watchs__)) {
                Object.defineProperty(object, __watchs__, {
                    value: {},
                    enumerable: false,
                    configurable: true,
                    writable: false,
                });
            }
            var _property = property;
            var watchs = object[__watchs__];
            if (!watchs[_property]) {
                var oldPropertyDescriptor = Object.getOwnPropertyDescriptor(object, _property);
                watchs[_property] = { value: object[_property], oldPropertyDescriptor: oldPropertyDescriptor, handlers: [] };
                //
                var data = getPropertyDescriptor(object, _property);
                if (data && data.set && data.get) {
                    data = { enumerable: data.enumerable, configurable: true, get: data.get, set: data.set };
                    var orgSet_1 = data.set;
                    data.set = function (value) {
                        var oldValue = this[_property];
                        if (oldValue !== value) {
                            orgSet_1 && orgSet_1.call(this, value);
                            notifyListener(value, oldValue, this, _property);
                        }
                    };
                }
                else if (!data || (!data.get && !data.set)) {
                    data = { enumerable: true, configurable: true };
                    data.get = function () {
                        return this[__watchs__][_property].value;
                    };
                    data.set = function (value) {
                        var oldValue = this[__watchs__][_property].value;
                        if (oldValue !== value) {
                            this[__watchs__][_property].value = value;
                            notifyListener(value, oldValue, this, _property);
                        }
                    };
                }
                else {
                    console.warn("watch " + object + " . " + _property + " \u5931\u8D25\uFF01");
                    return;
                }
                Object.defineProperty(object, _property, data);
            }
            var propertywatchs = watchs[_property];
            var has = propertywatchs.handlers.reduce(function (v, item) { return v || (item.handler === handler && item.thisObject === thisObject); }, false);
            if (!has) {
                propertywatchs.handlers.push({ handler: handler, thisObject: thisObject });
            }
        };
        /**
         * 取消监听对象属性的变化
         *
         * @param object 被监听对象
         * @param property 被监听属性
         * @param handler 变化回调函数 (object: T, property: string, oldValue: V) => void
         * @param thisObject 变化回调函数 this值
         */
        Watcher.prototype.unwatch = function (object, property, handler, thisObject) {
            var watchs = object[__watchs__];
            if (!watchs)
                return;
            var _property = property;
            if (watchs[_property]) {
                var handlers = watchs[_property].handlers;
                if (handler === undefined) {
                    handlers.length = 0;
                }
                for (var i = handlers.length - 1; i >= 0; i--) {
                    if (handlers[i].handler === handler && (handlers[i].thisObject === thisObject || thisObject === undefined)) {
                        handlers.splice(i, 1);
                    }
                }
                if (handlers.length === 0) {
                    var value = object[_property];
                    delete object[_property];
                    if (watchs[_property].oldPropertyDescriptor) {
                        Object.defineProperty(object, _property, watchs[_property].oldPropertyDescriptor);
                    }
                    object[_property] = value;
                    delete watchs[_property];
                }
                if (Object.keys(watchs).length === 0) {
                    delete object[__watchs__];
                }
            }
        };
        /**
         * 绑定两个对象的指定属性，保存两个属性值同步。
         *
         * @param object0 第一个对象。
         * @param property0 第一个对象的属性名称。
         * @param object1 第二个对象。
         * @param property1 第二个对象的属性名称。
         */
        Watcher.prototype.bind = function (object0, property0, object1, property1) {
            var fun0 = function () {
                object1[property1] = object0[property0];
            };
            var fun1 = function () {
                object0[property0] = object1[property1];
            };
            this.watch(object0, property0, fun0);
            this.watch(object1, property1, fun1);
            this._binds.push([object0, property0, fun0, object1, property1, fun1]);
        };
        /**
         * 解除两个对象的指定属性的绑定。
         *
         * @param object0 第一个对象。
         * @param property0 第一个对象的属性名称。
         * @param object1 第二个对象。
         * @param property1 第二个对象的属性名称。
         */
        Watcher.prototype.unbind = function (object0, property0, object1, property1) {
            var binds = this._binds;
            for (var i = binds.length - 1; i >= 0; i--) {
                var v = binds[i];
                if ((v[1] === property0 && v[4] === property1) || (v[1] === property1 && v[4] === property0)) {
                    if ((v[0] === object0 && v[3] === object1) || (v[0] === object1 && v[3] === object0)) {
                        this.unwatch(v[0], v[1], v[2]);
                        this.unwatch(v[3], v[4], v[5]);
                        binds.splice(i, 1);
                        break;
                    }
                }
            }
        };
        /**
         * 监听对象属性链值变化
         *
         * @param object 被监听对象
         * @param property 被监听属性 例如："a.b"
         * @param handler 变化回调函数 (newValue: any, oldValue: any, object: any, property: string) => void
         * @param thisObject 变化回调函数 this值
         */
        Watcher.prototype.watchchain = function (object, property, handler, thisObject) {
            var _this = this;
            var notIndex = property.indexOf('.');
            if (notIndex === -1) {
                this.watch(object, property, handler, thisObject);
                return;
            }
            if (!Object.getOwnPropertyDescriptor(object, __watchchains__)) {
                Object.defineProperty(object, __watchchains__, { value: {}, enumerable: false, writable: false, configurable: true });
            }
            var watchchains = object[__watchchains__];
            if (!watchchains[property]) {
                watchchains[property] = [];
            }
            var propertywatchs = watchchains[property];
            var has = propertywatchs.reduce(function (v, item) { return v || (item.handler === handler && item.thisObject === thisObject); }, false);
            if (!has) {
                // 添加下级监听链
                var currentp = property.substr(0, notIndex);
                var nextp_1 = property.substr(notIndex + 1);
                if (object[currentp]) {
                    this.watchchain(object[currentp], nextp_1, handler, thisObject);
                }
                // 添加链监听
                var watchchainFun = function (newValue, oldValue) {
                    if (oldValue)
                        _this.unwatchchain(oldValue, nextp_1, handler, thisObject);
                    if (newValue)
                        _this.watchchain(newValue, nextp_1, handler, thisObject);
                    // 当更换对象且监听值发生改变时触发处理函数
                    var ov = getObjectPropertyValue(oldValue, nextp_1);
                    var nv = getObjectPropertyValue(newValue, nextp_1);
                    if (ov !== nv) {
                        handler.call(thisObject, nv, ov, newValue, nextp_1);
                    }
                };
                this.watch(object, currentp, watchchainFun);
                // 记录链监听函数
                propertywatchs.push({ handler: handler, thisObject: thisObject, watchchainFun: watchchainFun });
            }
        };
        /**
         * 取消监听对象属性链值变化
         *
         * @param object 被监听对象
         * @param property 被监听属性 例如："a.b"
         * @param handler 变化回调函数 (object: T, property: string, oldValue: V) => void
         * @param thisObject 变化回调函数 this值
         */
        Watcher.prototype.unwatchchain = function (object, property, handler, thisObject) {
            var notIndex = property.indexOf('.');
            if (notIndex === -1) {
                this.unwatch(object, property, handler, thisObject);
                return;
            }
            var currentp = property.substr(0, notIndex);
            var nextp = property.substr(notIndex + 1);
            //
            var watchchains = object[__watchchains__];
            if (!watchchains || !watchchains[property])
                return;
            //
            var propertywatchs = watchchains[property];
            for (var i = propertywatchs.length - 1; i >= 0; i--) {
                var element = propertywatchs[i];
                if (objectIsEmpty(handler) || (handler === element.handler && thisObject === element.thisObject)) {
                    // 删除下级监听链
                    if (object[currentp]) {
                        this.unwatchchain(object[currentp], nextp, element.handler, element.thisObject);
                    }
                    // 删除链监听
                    this.unwatch(object, currentp, element.watchchainFun);
                    // 清理记录链监听函数
                    propertywatchs.splice(i, 1);
                }
            }
            // 清理空列表
            if (propertywatchs.length === 0)
                delete watchchains[property];
            if (Object.keys(watchchains).length === 0) {
                delete object[__watchchains__];
            }
        };
        /**
         * 监听对象属性链值变化
         *
         * @param object 被监听对象
         * @param property 被监听属性 例如：{a:{b:null,d:null}} 表示监听 object.a.b 与 object.a.d 值得变化，如果property===object时表示监听对象中所有叶子属性变化。
         * @param handler 变化回调函数 (object: T, property: string, oldValue: V) => void
         * @param thisObject 变化回调函数 this值
         */
        Watcher.prototype.watchobject = function (object, property, handler, thisObject) {
            var _this = this;
            var chains = getObjectPropertyChains(object);
            chains.forEach(function (v) {
                _this.watchchain(object, v, handler, thisObject);
            });
        };
        /**
         * 取消监听对象属性链值变化
         *
         * @param object 被监听对象
         * @param property 被监听属性 例如：{a:{b:null,d:null}} 表示监听 object.a.b 与 object.a.d 值得变化，如果property===object时表示监听对象中所有叶子属性变化。
         * @param handler 变化回调函数 (object: T, property: string, oldValue: V) => void
         * @param thisObject 变化回调函数 this值
         */
        Watcher.prototype.unwatchobject = function (object, property, handler, thisObject) {
            var _this = this;
            var chains = getObjectPropertyChains(property);
            chains.forEach(function (v) {
                _this.unwatchchain(object, v, handler, thisObject);
            });
        };
        return Watcher;
    }());
    var watcher = new Watcher();
    var __watchs__ = '__watchs__';
    var __watchchains__ = '__watchchains__';
    function notifyListener(newValue, oldValue, host, property) {
        var watchs = host[__watchs__];
        var handlers = watchs[property].handlers;
        handlers.forEach(function (element) {
            element.handler.call(element.thisObject, newValue, oldValue, host, property);
        });
    }
    /**
     * 从对象自身或者对象的原型中获取属性描述
     *
     * @param object 对象
     * @param property 属性名称
     */
    function getPropertyDescriptor(object, property) {
        var data = Object.getOwnPropertyDescriptor(object, property);
        if (data) {
            return data;
        }
        var prototype = Object.getPrototypeOf(object);
        if (prototype) {
            return getPropertyDescriptor(prototype, property);
        }
        return undefined;
    }
    /**
     * 判断对象是否为null或者undefine
     *
     * @param obj
     * @returns
     */
    function objectIsEmpty(obj) {
        if (obj === undefined || obj === null) {
            return true;
        }
        return false;
    }
    /**
     * 获取对象对应属性上的值
     *
     * @param object 对象
     * @param property 属性名称，可以是 "a" 或者 "a.b" 或者 ["a","b"]
     */
    function getObjectPropertyValue(object, property) {
        if (typeof property === 'string')
            property = property.split('.');
        var value = object;
        for (var i = 0; i < property.length; i++) {
            if (objectIsEmpty(value))
                return undefined;
            value = value[property[i]];
        }
        return value;
    }
    /**
     * 获取对象上属性链列表
     *
     * 例如 object值为{ a: { b: { c: 1 }, d: 2 } }时则返回 ["a.b.c","a.d"]
     *
     * @param object 对象
     */
    function getObjectPropertyChains(object) {
        var result = [];
        // 属性名称列表
        var propertys = Object.keys(object);
        // 属性所属对象列表
        var hosts = new Array(propertys.length).fill(object);
        // 父属性所在编号列表
        var parentPropertyIndices = new Array(propertys.length).fill(-1);
        // 处理到的位置
        var index = 0;
        var _loop_1 = function () {
            var host = hosts[index];
            var cp = propertys[index];
            var cv = host[cp];
            var vks = void 0;
            if (objectIsEmpty(cv) || isBaseType(cv) || (vks = Object.keys(cv)).length === 0) {
                // 处理叶子属性
                var ps = [cp];
                var ci = index;
                // 查找并组合属性链
                while ((ci = parentPropertyIndices[ci]) !== -1) {
                    ps.push(propertys[ci]);
                }
                ps.reverse();
                result.push(ps.join('.'));
            }
            else {
                // 处理中间属性
                // eslint-disable-next-line no-loop-func
                vks.forEach(function (k) {
                    propertys.push(k);
                    hosts.push(cv);
                    parentPropertyIndices.push(index);
                });
            }
            index++;
        };
        while (index < propertys.length) {
            _loop_1();
        }
        return result;
    }
    /**
     * 判断是否为基础类型 undefined,null,boolean,string,number
     */
    function isBaseType(object) {
        // 基础类型
        if (object === undefined || object === null
            || typeof object === 'boolean'
            || typeof object === 'string'
            || typeof object === 'number') {
            return true;
        }
        return false;
    }

    exports.Watcher = Watcher;
    exports.__watchchains__ = __watchchains__;
    exports.__watchs__ = __watchs__;
    exports.watch = watch;
    exports.watcher = watcher;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.js.map
