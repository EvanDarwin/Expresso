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
import {ExpressoRequest} from "../../../types";
import {InternalPageBase} from "../InternalPageBase";

interface Props {
    req: ExpressoRequest;
    statusCode: number;
    statusMessage: string;
    error?: string;
    subtitle?: string;
    centered?: boolean;
}

/**
 *
 */
export class ErrorPage extends Component<Props> {
    render(): VNode {
        const {centered, subtitle, statusCode: status, statusMessage, req, req: {app: {debug}}} = this.props;
        return <InternalPageBase title={status + " - " + statusMessage}>
            <style>{`table,th,td,tr {` +
            `  border-collapse: collapse;` +
            `  border: 1px solid #000; ` +
            `  padding: 2px 6px;` +
            `}`}</style>

            <div style={{textAlign: centered ? "center" : "inherit"}}>
                <h1 style={{marginBottom: '0.25rem'}}>{status} - {statusMessage}</h1>
                {subtitle ? <h3 style={{marginTop: 0}}>An error occurred while processing your request</h3> : undefined}
                <hr/>
            </div>
            {this.props.children}

            {req.app.debug && <hr/>}
            <div style={{textAlign: centered ? "center" : "inherit"}}>
                <p style={{margin: "0.25em 0"}}>expresso{debug ?
                    <span> - <em>{req.currentMs}ms</em></span> : undefined}</p>
                {debug ? <small>{req.uuid}</small> : undefined}
            </div>
        </InternalPageBase>
    }
}
