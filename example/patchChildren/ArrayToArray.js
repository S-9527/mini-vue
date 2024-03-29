import { h, ref } from "../../lib/mini-vue.esm-bundler.js";

const prevChildren = [
    h("p", {}, "A"),
    h("p", {}, "B")
];

const nextChildren = [
    h("p", {}, "C"),
    h("p", {}, "D")
];

export default {
    name: "ArrayToArray",
    setup() {
        const isChange = ref(false);
        window.isChange = isChange;

        return {
            isChange
        }
    },
    render() {
        const self = this;

        return self.isChange === true
            ? h("div", {}, nextChildren)
            : h("div", {}, prevChildren);
    }
}