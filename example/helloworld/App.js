import { h } from "../../lib/mini-vue.esm-bundler.js";

export const App = {
    render() {
        return h('div', {
            id: "root",
            class: ["red", "hard"]
        }, [h("p", { class: "red" }, "hi"), h("p", { class: "blue" }, "mini-vue")])
    },

    setup() {
        return {
            msg: "mini-vue"
        }
    }
}