/** @jsx h */
import {Component, ComponentChild, h, JSX} from "preact";

type Props = JSX.HTMLAttributes<HTMLHeadElement>;

export class DocumentHead extends Component<Props> {
    render(): ComponentChild {
        const {children} = this.props;
        const baseProps = Object.assign({}, this.props, {children: undefined})
        return <head {...baseProps}>
            {children}
        </head>
    }
}
