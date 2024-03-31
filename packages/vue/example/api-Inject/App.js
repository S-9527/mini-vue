import { h, inject, provide } from "../../dist/mini-vue.esm-bundler.js";

const Provider = {
    name: 'Provider',
    setup() {
        provide('foo', 'fooVal');
        provide('bar', 'barVal');
    },
    render() {
        return h('div', {},[h("p", {}, "Provider"), h(ProviderTwo)]);
    }
}

const ProviderTwo = {
    name: 'ProviderTwo',
    setup() {
        provide('foo', 'fooTwo');
        const foo = inject('foo');

        return {
            foo
        }
    },
    render() {
        return h('div', {},[h("p", {},  `ProviderTwo foo:${this.foo}`), h(Consumer)]);
    }
}

const Consumer = {
    name: 'Consumer',
    setup() {
        const foo = inject('foo');
        const bar = inject('bar');
        const baz = inject('baz', 'defaultBaz');
        const func = inject('func', () => 'defaultFunc');

        return {
            foo,
            bar,
            baz,
            func
        }
    },
    render() {
        return h('div', {}, `Consumer: ${this.foo} - ${this.bar} - ${this.baz} - ${this.func}`);
    }
}

export default {
    name: 'App',
    setup() {},
    render() {
        return h("div", {}, [h("p", {}, "apiInject"), h(Provider)]);
    }
}