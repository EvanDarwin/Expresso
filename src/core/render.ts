import debug from "debug";
import {JSXNode, render as _renderXML} from "jsx-xml";
import {VNode} from "preact";
import _renderJSX from "preact-render-to-string";
import {DocType, XMLDocType} from "../types";

/**
 * Render a TSX Preact DOM into a string
 *
 * @param {preact.VNode}    jsx         The TSX to render
 * @param {D}               context     The context to provide to the renderer
 * @returns {string}        The rendered Preact DOM
 */
export function renderJSX<D = Record<string, unknown>>(jsx: VNode, context?: D): string {
    const log = debug('expresso:render:jsx')
    log('start')
    const dom = _renderJSX(jsx, context);
    log('rendered JSX')
    return dom;
}

export function renderXML(xml: JSXNode, xmlDoctype: DocType = XMLDocType.XML_UTF8): string {
    const log = debug('expresso:render:xml')
    log('start')
    const dom = _renderXML(xml, {doctype: xmlDoctype})
    log('rendered XML')
    return dom
}
