import { h } from "../../lib/mini-vue.esm-bundler.js";

export const App = {
    render() {
        window.self = this

        return h('div', { id: "root", class: ["red", "hard"]}, [
            h("p", { class: "red" }, "hi"),
            h("p", { class: "blue" }, "mini-vue"),
            h("p", { class: "yellow" }, "hi, " + this.msg)
        ])
    },

    setup() {
        return {
            msg: "mini-vue!!"
        }
    }
}