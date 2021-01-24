/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

import debug from "debug";
import {JSXNode, render as _renderXML} from "jsx-xml";
import {VNode} from "preact";
import {DocType, XMLDocType} from "../types";

// eslint-disable-next-line
const _renderJSX = require("preact-render-to-string");

/**
 * Render a TSX Preact DOM into a string
 *
 * @param {preact.VNode}    jsx         The TSX to render
 * @param {D}               context     The context to provide to the renderer
 * @returns {string}        The rendered Preact DOM
 */
export function renderJSX<D = Record<string, unknown>>(jsx: VNode, context?: D): string {
    const log = debug('expresso:render:jsx')
    log.color = "35"
    log('start')
    const dom = _renderJSX(jsx, context);
    log('rendered JSX')
    return dom;
}

/**
 * Render an XML dom into a string with jsx-xml
 * @param {JSXNode} xml The XML dom
 * @param {DocType} xmlDoctype The XML doctype to use
 * @returns {string} The rendered XML output
 */
export function renderXML(xml: JSXNode, xmlDoctype: DocType = XMLDocType.XML_UTF8): string {
    const log = debug('expresso:render:xml')
    log.color = "34"
    log('start')
    const dom = _renderXML(xml, {doctype: xmlDoctype})
    log('rendered XML')
    return dom
}
