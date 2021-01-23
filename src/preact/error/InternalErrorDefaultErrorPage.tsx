/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

import {Component, h} from "preact";
import {DefaultErrorPage} from "./DefaultErrorPage";

interface Props {
    error: Error;
    debug?: boolean;
    requestAt: Date;
}

export class InternalErrorDefaultErrorPage extends Component<Props> {
    render() {
        const {error, debug, requestAt} = this.props;
        return <DefaultErrorPage
            debug={debug} status={500}
            requestAt={requestAt}
            statusMessage={"Internal Server Error"}
            subtitle="❌ An error occurred while processing your request">
            {debug && <div>
                <hr/>
                {error.stack ? <pre>{error.stack}</pre> : <em>No stack available</em>}
            </div>}
        </DefaultErrorPage>
    }
}
