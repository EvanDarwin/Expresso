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
import type {ExpressoRequest} from "../../../types";
import {ErrorPage} from "./ErrorPage";

interface Props {
    error: Error;
    req: ExpressoRequest;
}

export class InternalErrorPage extends Component<Props> {
    render(): VNode {
        const {error, req} = this.props;
        const [errorMessage, ...stack] = (error.stack || "").split('\n')
        const prettyStackLines: (VNode | string)[] = stack.map(l => {
            // eslint-disable-next-line security/detect-unsafe-regex
            const data = l.match(/^ *at ([\w.\d_:\\\- [\]]+)(?: ?\((.+)\))?$/);
            if (!data) return <span style={{display: "block"}}>{l}</span>;
            let [, method = '', path] = data;
            if (method && !path) {
                path = method
                method = ''
            }
            return <span style={{display: "block"}}><em>at</em>{
                method && <span>&nbsp;<u>{method.trim()}</u></span>} (<em>{path?.trim()}</em>)</span>
        })
        return <ErrorPage
            req={req} statusCode={500}
            statusMessage={"Internal Server Error"}
            subtitle="An error occurred while processing your request"
            centered>{req.app.debug && <div>
            {error.stack ? <div>
                <h4 style={{marginBottom: '0.5em'}}>{errorMessage || <em>No information available</em>}</h4>
                <pre style={{marginTop: 0, textIndent: "1.5em"}}>{prettyStackLines}</pre>
            </div> : <em>No stack available</em>}
        </div>}
        </ErrorPage>
    }
}
