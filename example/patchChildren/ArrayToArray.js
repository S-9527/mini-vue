import { h, ref } from "../../lib/mini-vue.esm-bundler.js";

/**
 * 左侧对比
 * (a b) c => (a b) d e
 */
// const prevChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "C" }, "C")
// ];
// const nextChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "D" }, "D"),
//     h("p", { key: "E" }, "E")
// ];

/**
 * 右侧对比
 * a (b c) => d e (b c)
 */
// const prevChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "C" }, "C")
// ]
// const nextChildren = [
//     h("p", { key: "D" }, "D"),
//     h("p", { key: "E" }, "E"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "C" }, "C")
// ]

/**
 * 新的比老的长 (左侧)
 * (a b) => (a b) c
 * i:2 e1:1 e2:2
 */
// const prevChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B")
// ]
// const nextChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "C" }, "C"),
//     h("p", { key: "D" }, "D")
// ]

/**
 * 新的比老的长 (右侧)
 * (a b) => c (a b)
 * i:0 e1:-1 e2:0
 */
// const prevChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B")
// ]
// const nextChildren = [
//     h("p", { key: "C" }, "C"),
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B")
// ]

/**
 * 老的比新的长(左侧)
 * 删除老的
 * (a b) c => (a b)
 * i:2 e1:2 e2:1
 */
// const prevChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "C" }, "C")
// ]
// const nextChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B")
// ]

/**
 * 老的比新的长(右侧)
 * a (b c) => (b c)
 * i:0 e1:0 e2:-1
 */

const prevChildren = [
    h("p", { key: "A" }, "A"),
    h("p", { key: "B" }, "B"),
    h("p", { key: "C" }, "C")
]
const nextChildren = [
    h("p", { key: "B" }, "B"),
    h("p", { key: "C" }, "C"),
]

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