import { h, createTextVNode } from "../../lib/mini-vue.esm-bundler.js";
import { Foo } from "./Foo.js";
import { Bar } from "./Bar.js";

export const App = {
    name: 'App',
    render() {
        const app = h("div", {}, "App")

        const foo = h(Foo, {}, {
            header: ({ age })=> [
                h("p", {}, "header" + age),
                createTextVNode("你好呀")
            ],
            footer: () => h("p", {}, "footer")
        })

        const bar = h(Bar,{}, {
            BarHeader: ()=> h("p", {}, "BarHeader"),
            BarFooter: () => h("p", {}, "BarFooter")
        })

        const anChildren = h("div", {}, [h("p", {}, "bar")])

        const doubleChildren = h("div", {}, [
            h("p", {}, "bar-1"),
            h("p", {}, "bar-2")
        ])

        return h("div", {}, [app, foo, anChildren,doubleChildren, bar])
    },
    setup() {
        return {}
    }
}