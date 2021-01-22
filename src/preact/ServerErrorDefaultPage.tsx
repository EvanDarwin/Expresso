import {Component, h} from "preact";

export class ServerErrorDefaultPage extends Component<{ error: Error; debug?: boolean }> {
    render() {
        const {error, debug} = this.props;
        return <html lang="en">
        <head>
            <title>500 - Internal Server Error</title>
        </head>
        <body>
        <h1>500 - Internal Server Error</h1>
        <h2>An error occurred while processing your request</h2>
        {debug && <div>
            <hr/>
            {error.stack ? <pre>{error.stack}</pre> : <em>No stack available</em>}
            <hr/>
            <p>expresso</p>
        </div>}
        </body>
        </html>
    }
}
