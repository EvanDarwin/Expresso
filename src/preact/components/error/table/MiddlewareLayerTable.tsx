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
import {Layer} from "../../../../types";

interface Props {
    middleware: Layer[];
}

export class MiddlewareLayerTable extends Component<Props> {
    render(): VNode {
        const {middleware} = this.props;
        return <table>
            <thead>
            <tr>
                <th colSpan={2}>Name</th>
                <th>Regex</th>
                <th>Params</th>
                <th>Path</th>
            </tr>
            </thead>
            <tbody>
            {middleware.map((layer, i) => <tr>
                <td>&nbsp;&nbsp;#{i}&nbsp;&nbsp;</td>
                <td>{layer.name}</td>
                <td><code><small>{`${layer.regexp}`}</small></code></td>
                <td><code>{JSON.stringify(layer.params)}</code></td>
                <td><code>{JSON.stringify(layer.path)}</code></td>
            </tr>)}
            </tbody>
        </table>
    }
}
