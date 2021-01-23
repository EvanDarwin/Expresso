import {Component, h, VNode} from "preact";

interface Props {
    title: string;
}

export class InternalPageBase extends Component<Props> {
    render(): VNode {
        const {title} = this.props;
        return <html lang="en">
        <head><title>{title}</title></head>
        <body>{this.props.children}</body>
        </html>
    }
}
