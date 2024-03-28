import { h } from "../../lib/mini-vue.esm-bundler.js";
import { renderSlots } from "../../lib/mini-vue.esm-bundler.js";

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