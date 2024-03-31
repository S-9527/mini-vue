import { h } from "../../dist/mini-vue.esm-bundler.js";

export const Foo = {
    setup(props){
        console.log(props)
        props.count ++
    },
    render(){
        return h("div",{},'foo: ' + this.count)
    }
}