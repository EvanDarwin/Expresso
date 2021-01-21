/** @jsx h */
import {Component, ComponentChild, h} from "preact";

interface Props {
    id?: string;
}

export class ClientRenderRoot extends Component<Props> {
    render(): ComponentChild {
        const {id} = this.props;
        return <div id={id || "root"}/>;
    }
}
