import { h } from "../../lib/mini-vue.esm-bundler.js";
import { Foo } from "./Foo.js";
import {Bar} from "./Bar.js";

export const App = {
    name: 'App',
    render() {
        const app = h("div", {}, "App")

        const foo = h(Foo, {}, {
            header: ()=> h("p", {}, "header"),
            footer: () => h("p", {}, "footer")
        })

        const bar = h(Bar,{}, {
            BarHeader: ()=> h("p", {}, "BarHeader"),
            BarFooter: () => h("p", {}, "BarFooter")
        })

        const double = h("div", {}, [h("p", {}, "bar")])

        return h("div", {}, [app, foo, double, bar])
    },
    setup() {
        return {}
    }
}