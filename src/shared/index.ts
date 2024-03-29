export const extend = Object.assign

export const EMPTY_OBJ = {}

export const hasOwn = (val: any, key: any) => Object.prototype.hasOwnProperty.call(val, key)

export const isObject = (val: any) => {
    return val !== null && typeof val === 'object';
}

export const hasChanged = (val: any, newVal: any) => {
    return !Object.is(val, newVal);
}

export const camelize = (str: string) => {
    return str.replace(/-(\w)/g, (_, c: string) => {
        return c ? c.toUpperCase() : ''
    })
}
export const toHandlerKey = (str: string) => {
    return str ? 'on' + capitalized(str) : ''
}

const capitalized = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}