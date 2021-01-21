/** @jsx h */
import {Component, ComponentChild, h, JSX} from "preact";

type Props = JSX.HTMLAttributes<HTMLHtmlElement>;

export class DocumentBase extends Component<Props> {
    render(): ComponentChild {
        const props = Object.assign({lang: "en"}, this.props, {children: undefined})
        return <html {...props}>{this.props.children}</html>
    }
}
