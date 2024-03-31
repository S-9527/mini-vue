import { h } from "../../dist/mini-vue.esm-bundler.js";
import { renderSlots } from "../../dist/mini-vue.esm-bundler.js";

export const Bar = {
    name: "Bar",
    render() {
        const bar = h("p", {}, "bar");
        return h("div", {}, [
            bar,
            renderSlots(this.$slots, "BarHeader"),
            renderSlots(this.$slots, "BarFooter"),
        ]);
    },
    setup() {
        return {}
    }
}