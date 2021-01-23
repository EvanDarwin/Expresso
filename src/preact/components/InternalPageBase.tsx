/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

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
