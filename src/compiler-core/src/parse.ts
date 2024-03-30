import { NodeTypes } from "./ast";

enum TagType {
    Start,
    End
}

export function baseParse(content: string) {
    const context = createParseContext(content)
    return createRoot(parseChildren(context))
}

function parseChildren(context: { source: string }) {
    const nodes: any = []

    let node;

    const s = context.source
    if (s.startsWith("{{")) {
        node = parseInterpolation(context);
    } else if (s[0] === "<") {
        if (/[a-z]/i.test(s[1])) {
            node = parseElement(context)
        }
    }

    nodes.push(node);

    return nodes;
}

function parseElement(context: { source: string }) {
    const element = parseTag(context, TagType.Start)
    parseTag(context, TagType.End)
    return element
}

function parseTag(context: { source: string }, type: TagType) {
    const match: any = /^<\/?([a-z]*)/i.exec(context.source)
    const tag = match[1]
    advanceBy(context, match[0].length)
    advanceBy(context, 1)

    if (type === TagType.End) return

    return {
        type: NodeTypes.ELEMENT,
        tag,
    }
}

function parseInterpolation(context: { source: string }) {
    const openDelimiter = "{{"
    const closeDelimiter = "}}"

    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

    advanceBy(context, openDelimiter.length)

    const rawContentLength = closeIndex - openDelimiter.length

    const rawContent = context.source.slice(0, rawContentLength)
    const content = rawContent.trim()

    advanceBy(context, rawContentLength + closeDelimiter.length)

    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: content
        }
    }
}

function advanceBy(context: any, length: number) {
    context.source = context.source.slice(length)
}

function createRoot(children: any) {
    return { children }
}

function createParseContext(context: string) {
    return { source: context }
}