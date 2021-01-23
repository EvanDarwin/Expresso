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
    routes: Layer[];
}

export class RouteLayerTable extends Component<Props> {
    render(): VNode {
        const {routes} = this.props;
        return <table>
            <thead>
            <tr>
                <th>Path <small>and regex</small></th>
                <th>Layers</th>
                <th>Methods</th>
            </tr>
            </thead>
            <tbody>
            {routes.map(layer =>
                <tr>
                    <td>
                        <strong>{layer.route?.path}</strong><br/>
                        <small style={{textIndent: '.5em', display: 'block'}}>{`${layer.regexp}`}</small>
                    </td>
                    <td>{layer.route?.stack.length}</td>
                    <td style={{maxWidth: 300}}>{Object.entries(layer.route?.methods as { [key: string]: boolean })
                        .filter(([, v]) => v).map(([k]) => k.toUpperCase()).join(", ")}</td>
                </tr>
            )}
            </tbody>
        </table>
    }
}
