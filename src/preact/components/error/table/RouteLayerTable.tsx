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
                    <td>{Object.entries(layer.route?.methods as { [key: string]: boolean })
                        .filter(([, v]) => v)
                        .map(([k]) => k.toUpperCase())}</td>
                </tr>
            )}
            </tbody>
        </table>
    }
}
