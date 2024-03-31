import { h, ref } from '../../dist/mini-vue.esm-bundler.js'

export const App = {
    name: 'App',
    setup() {
        const count = ref(0);

        const onClick = () => {
            count.value ++;
        }

        const props = ref({
            foo: 'foo',
            bar: 'bar'
        })

        const onClickPropsDemo1 = () => {
            props.value.foo = 'new-foo';
        }

        const onClickPropsDemo2 = () => {
            props.value.bar = undefined;
        }

        const onClickPropsDemo3 = () => {
            props.value = {
                foo: 'foo',
            }
        }

        return {
            count,
            onClick,
            onClickPropsDemo1,
            onClickPropsDemo2,
            onClickPropsDemo3,
            props
        }
    },
    render() {
        return h('div', {id: "root", ...this.props}, [
            h('div', {}, 'count: ' + this.count),
            h('button', {onClick: this.onClick}, 'click'),
            h('button', {onClick: this.onClickPropsDemo1}, `change props - 值变成了 ${this.props.foo}, 修改`),
            h('button', {onClick: this.onClickPropsDemo2}, 'change props - 值变成了 undefined, 删除'),
            h('button', {onClick: this.onClickPropsDemo3}, 'change props - key 在值里面没有了, 删除')
        ]);
    }
}