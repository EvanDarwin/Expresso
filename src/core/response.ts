/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

import {Response} from "express";
import {JSXNode} from "jsx-xml";
import {VNode} from "preact";
import {renderJSX, renderXML} from ".";
import {HTMLDocType, XMLDocType} from "../types";

export function json(res: Response, data: unknown): void {
    res.setHeader('content-type', 'application/json')
    res.json(data);
}

export function document<D = Record<string, unknown>>(res: Response, jsx: VNode, data?: D, doctype: HTMLDocType | string = HTMLDocType.HTML5): void {
    res.send(doctype + renderJSX(jsx, data))
}

export function xml(res: Response, xml: JSXNode, doctype: XMLDocType = XMLDocType.XML_UTF8): void {
    res.setHeader('content-type', 'application/xml')
    res.send(renderXML(xml, doctype));
}

