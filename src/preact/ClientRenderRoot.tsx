/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

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
