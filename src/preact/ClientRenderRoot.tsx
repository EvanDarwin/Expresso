/** @jsx h */
import {Component, ComponentChild, h} from "preact";

export class ClientRenderRoot extends Component {
    render(): ComponentChild {
        return <div id="root"/>;
    }
}
