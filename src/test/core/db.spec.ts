/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

import {connect} from "../../core";

describe("core/database", () => {
    describe("connect()", () => {
        it("works", (done) => {
            connect().then(db => {
                db.close()
                done();
            }).catch(done);
        })
    })
})
