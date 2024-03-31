import { h, ref } from "../../dist/mini-vue.esm-bundler.js";

const prevChildren = 'oldChildren'
const nextChildren = [
    h("p", {}, "A"),
    h("p", {}, "B")
];

export default {
    name: 'TextToArray',
    setup() {
        const isChange = ref(false)
        window.isChange = isChange

        return {
            isChange
        }
    },
    render() {
        const self = this

        return self.isChange
            ? h('div', {}, nextChildren)
            : h('div', {}, prevChildren)
    }
}