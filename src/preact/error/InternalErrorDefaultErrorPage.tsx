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
