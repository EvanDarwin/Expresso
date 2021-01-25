/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

import * as chai from "chai";
import {expect} from "chai";
import {expresso, middleware} from "../../";

describe("core/middleware", () => {
    describe("#rid", () => {
        it("works", (done) => {
            const app = expresso();
            app.use(middleware.rid());
            let found: string | undefined;
            app.get('/', (req, res) => {
                res.send('')
                found = req.uuid;
            })
            chai.request(app).get('/')
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.status).to.eq(200);
                    expect(res.text).to.eq('');
                    expect(found).to.not.be.undefined;
                    expect(res.header['x-rid']).to.eq(found);
                    done();
                })
        })
    })

    describe("#error", () => {
        it("default error page", (done) => {
            const app = expresso()
            let uuid: string | undefined;
            app.get('/', async (req, res, next) => {
                uuid = req.uuid;
                throw new Error();
            })
            app.use(middleware.error())
            chai.request(app).get('/')
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.status).to.eq(500);
                    expect(uuid).to.not.be.undefined;
                    expect(res.text).to.contain(`<small>${uuid}</small>`)
                    done();
                })
        })

        it("non-Error error page", (done) => {
            const app = expresso()
            let uuid: string | undefined;
            app.get('/', async (req, res, next) => {
                uuid = req.uuid;
                next(true)
            })
            app.use(middleware.error())
            chai.request(app).get('/')
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.status).to.eq(500);
                    expect(uuid).to.not.be.undefined;
                    expect(res.text).to.contain(`<small>${uuid}</small>`)
                    done();
                })
        })
    })

    describe("#notFound", () => {
        it("not found page", (done) => {
            const app = expresso()
            app.use(middleware.notFound())
            // add a route so the 404 debug page component gets fully covered
            app.get('/a', (req, res, next) => (res.send()))
            chai.request(app).get('/')
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.status).to.eq(404);
                    expect(res.text).to.contain(`404 - Not Found`)
                    done();
                })
        })
    })
})
