import {connect} from "../core";

export function testConnections(): Promise<void> {
    console.log("Testing database connection")
    return connect().then(DB => {
        console.log("Connected to " + DB.options.type + "!")
    });
}
