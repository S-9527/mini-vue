import { ref } from "../../lib/mini-vue.esm-bundler.js";

export default {
    name: 'App',
    template: `<div>hi, {{count}}</div>`,
    setup() {
        const count = window.count = ref(1)

        return {
            count
        }
    }
}