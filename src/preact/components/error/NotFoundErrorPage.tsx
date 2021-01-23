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
import type {ExpressoRequest, Layer} from "../../../types";
import {ErrorPage} from "./ErrorPage";
import {MiddlewareLayerTable} from "./table/MiddlewareLayerTable";
import {RequestDetailsTable} from "./table/RequestDetailsTable";
import {RouteLayerTable} from "./table/RouteLayerTable";

interface Props {
    req: ExpressoRequest;
}

export class NotFoundErrorPage extends Component<Props> {
    render(): VNode {
        const {req} = this.props;
        const layerStack: Layer[] = req.app._router.stack;
        const routes: Layer[] = layerStack.filter(layer => !!layer.route)
        const middleware: Layer[] = layerStack.filter(layer => !layer.route)
        return <ErrorPage req={req} statusCode={404} statusMessage={"Not Found"} centered>
            {!req.app.debug ? undefined :
                <div>
                    <div style={{display: "flex", justifyContent: "space-evenly"}}>
                        <div id="details">
                            <p><strong>Request Details:</strong></p>
                            <RequestDetailsTable req={req}/>
                        </div>

                        <div id="layers">
                            <p><strong>Route Layers:</strong></p>
                            <RouteLayerTable routes={routes}/>
                        </div>

                        <div id="middleware">
                            <p><strong>Middleware Layers:</strong></p>
                            <MiddlewareLayerTable middleware={middleware}/>
                        </div>
                    </div>
                    <br/>
                </div>}
        </ErrorPage>
    }
}
