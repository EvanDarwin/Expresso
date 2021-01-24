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
