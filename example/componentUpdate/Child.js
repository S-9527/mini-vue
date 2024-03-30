import { h } from "../../lib/mini-vue.esm-bundler.js";

export default {
    name: 'Child',
    setup(props, { emit }) {},
    render(proxy) {
        return h("div", {}, "child - props - msg: " + this.$props.msg)
    },
}