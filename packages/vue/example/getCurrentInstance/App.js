import { h, getCurrentInstance } from "../../dist/mini-vue.esm-bundler.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    return h("div", {}, [h("p", {}, "getCurrentInstance demo"), h(Foo)]);
  },
  setup() {
    const instance = getCurrentInstance();
    console.log("App:", instance);
  },
};
