import { createRenderer } from '../runtime-core'

function createElement(type: any) {
    return document.createElement(type)
}

function patchProp(el: any, key: any,prevVal: any, nextVal: any) {
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase()
        el.addEventListener(event, nextVal)
    } else{
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key)
        }else {
            el.setAttribute(key, nextVal)
        }
    }
}


function insert(el: any, parent: any) {
    parent.appendChild(el)
}

const render: any = createRenderer({
    createElement,
    patchProp,
    insert
})

export function createApp(...args: any) {
    return render.createApp(...args)
}

export * from '../runtime-core'