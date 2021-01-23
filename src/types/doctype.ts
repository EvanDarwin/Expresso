/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

export type DocType = HTMLDocType | XMLDocType;

export enum HTMLDocType {
    // Modern HTML5 document type header
    HTML5 = `<!DOCTYPE html>`,
    // Old HTML4 document type header, for those poor developers that need it
    HTML4 = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">`,
}

export enum XMLDocType {
    XML_UTF8 = `<?xml version="1.0" encoding="UTF-8"?>`,
    XML = `<?xml version="1.0" encoding="UTF-8"?>`, // XML_UTF8
}

