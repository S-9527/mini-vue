import { h, renderSlots } from "../../lib/mini-vue.esm-bundler.js";

export const Foo = {
    setup() {
        return {}
    },
    render() {
        const foo = h("p", {}, "foo");
        return h("div", {} , [
            foo,
            renderSlots(this.$slots, "header",{
                age: 18
            }),
            renderSlots(this.$slots, "footer"),
        ])
    }
}