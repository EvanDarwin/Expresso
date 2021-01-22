import {Component, h} from "preact";

interface Props {
    status: number;
    statusMessage: string;
    debug?: boolean;
    error?: string;
    subtitle?: string;
    requestAt: Date;
}

export class DefaultErrorPage extends Component<Props> {
    render() {
        const {status, subtitle, statusMessage, debug, requestAt} = this.props;
        const diff = +(new Date()) - +requestAt;
        return <html lang="en">
        <head>
            <title>{status} - {statusMessage}</title>
        </head>
        <body>
        <h1>{status} - {statusMessage}</h1>
        {subtitle ? <h2>❌ An error occurred while processing your request</h2> : undefined}
        {this.props.children}
        <hr/>
        <p>expresso{debug ? <span> - rendered in {diff} ms</span> : undefined}</p>
        </body>
        </html>
    }
}
