import { NodeTypes } from "./ast";

enum TagType {
    Start,
    End
}

export function baseParse(content: string) {
    const context = createParseContext(content)
    return createRoot(parseChildren(context, []))
}

function parseChildren(context: { source: string }, ancestors: string[]) {
    const nodes: any = []

    while (!isEnd(context, ancestors)) {
        let node;

        const s = context.source
        if (s.startsWith("{{")) {
            node = parseInterpolation(context);
        } else if (s[0] === "<") {
            if (/[a-z]/i.test(s[1])) {
                node = parseElement(context, ancestors);
            }
        }

        if (!node) {
            node = parseText(context)
        }

        nodes.push(node);
    }

    return nodes;
}

function isEnd(context: { source: string }, ancestors: any[]) {
    const s = context.source
    if (s.startsWith("</")) {
        for (let i = ancestors.length -1; i >= 0; i--) {
            const tag = ancestors[i].tag
            if (startsWithEndTagOpen(s, tag)) {
                return true
            }
        }
    }

    return !s;
}

function parseText(context: { source: string }) {
    let endIndex = context.source.length
    let endToken = ["<", "{{"]


    for (let i = 0; i < endToken.length; i++) {
        const index = context.source.indexOf(endToken[i])
        if (index !== -1 && endIndex > index) {
            endIndex = index
        }
    }

    const content = parseTextData(context, endIndex);

    return {
        type: NodeTypes.TEXT,
        content
    }
}

function parseTextData(context: { source: string }, length: number) {
    const content = context.source.slice(0, length)
    advanceBy(context, length)
    return content
}

function parseElement(context: { source: string }, ancestors: string[]) {
    const element: any = parseTag(context, TagType.Start)
    ancestors.push(element)

    element.children = parseChildren(context, ancestors)
    ancestors.pop()

    if (startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, TagType.End)
    } else {
        throw new Error(`missing end tag: ${element.tag}`)
    }

    return element
}

function startsWithEndTagOpen(source: string, tag: string) {
    return source.startsWith("</") && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
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
        children: [],
    }
}

function parseInterpolation(context: { source: string }) {
    const openDelimiter = "{{"
    const closeDelimiter = "}}"

    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

    advanceBy(context, openDelimiter.length)

    const rawContentLength = closeIndex - openDelimiter.length

    const rawContent = parseTextData(context, rawContentLength)
    const content = rawContent.trim()

    advanceBy(context, closeDelimiter.length)

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