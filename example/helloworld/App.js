import { h } from "../../lib/mini-vue.esm-bundler.js";
import { Foo } from "./Foo.js";

export const App = {
    name: "App",
    render() {
        window.self = this

        return h('div', {
            id: "root",
            class: ["red", "hard"],
            onClick() {
                console.log('click');
            },
            onMousedown(){
                console.log("mousedown")
            }
        }, [
            h("p", { class: "red" }, "hi"),
            h("p", { class: "blue" }, "mini-vue"),
            h("p", { class: "yellow" }, "hi, " + this.msg),
            h(Foo, { count: 1 }),
        ])
    },

    setup() {
        return {
            msg: "mini-vue!!"
        }
    }
}