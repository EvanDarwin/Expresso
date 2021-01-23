/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

import {Component, h, VNode} from "preact";
import type {ExpressoRequest} from "../../../../types";

interface Props {
    req: ExpressoRequest;
}

export class RequestDetailsTable extends Component<Props> {
    render(): VNode {
        const {req} = this.props;
        return <table>
            <thead>
            <tr>
                <th>Key</th>
                <th>Value</th>
            </tr>
            </thead>
            <tbody>
            {Object.entries({
                Method: <span>HTTP/{req.httpVersion} <strong>{req.method}</strong></span>,
                Host: req.hostname,
                Path: req.path,
                Params: JSON.stringify(req.params, undefined, 2),
                Query: JSON.stringify(req.query, undefined, 2),
                "Raw Body": JSON.stringify(req.body),
                Cookies: JSON.stringify(req.cookies),
                IPs: JSON.stringify(req.ips),
            }).map(([k, v]) => <tr>
                <td>{k}</td>
                <td style={{maxWidth: 350, lineBreak: "break-word"}}><code>{
                    (typeof v === 'undefined') ? <em>undefined</em> : v
                }</code></td>
            </tr>)}
            </tbody>
        </table>
    }
}
