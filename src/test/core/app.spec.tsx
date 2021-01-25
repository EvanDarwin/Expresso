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
// noinspection ES6UnusedImports
import {h} from "preact";
import {Logger} from "tslog";
import {expresso, middleware} from "../../core";

describe("core/app", () => {
    describe("expresso()", () => {
        describe("core bindings", () => {
            // no options
            const _app = expresso({debug: true});

            it("x-powered-by is disabled", () =>
                expect(_app.disabled('x-powered-by')).to.be.true)

            it("default trust proxy value", () =>
                expect(_app.get('trust proxy')).to.be.undefined)

            describe("app.env", () => {
                it("is a function", () =>
                    expect(_app.env).to.be.instanceof(Function));

                it("can read APP_SECRET", () =>
                    expect(_app.env('APP_SECRET')).to.eq(process.env.APP_SECRET));

                it("default value works", () =>
                    expect(_app.env('__NO_EXIST__', 'test')).to.eq('test'));
            })

            describe("app.debug", () => {
                it("matches APP_DEBUG", () =>
                    expect(_app.debug).to.eq(!!process.env.APP_DEBUG))
            })

            describe("app.logger", () => {
                it("is a Logger instance", () =>
                    expect(_app.logger).to.be.instanceof(Logger))
            })

            describe("app.request", () => {
                it(".logger is a Logger instance", () =>
                    expect(_app.request.logger).to.be.instanceof(Logger))

                it("_app.request.logger === _app.logger", () =>
                    expect(_app.logger).to.eq(_app.request.logger))

                // this will be NaN as there is no value on req.at
                it(".msTotal", () =>
                    expect(_app.request.msTotal).to.be.NaN)

                it(".uuid", () => {
                    const result = _app.request.uuid;
                    expect(typeof result).to.eq('string')
                    expect(_app.request.uuid).to.eq(result)
                });
            })
        })

        describe("configuration options", () => {
            it("trust proxy", () => {
                const expected = 'loopback'
                const app1 = expresso();
                expect(app1.enabled('trust proxy')).to.be.false;
                const app2 = expresso({trustProxy: expected})
                expect(app2.enabled('trust proxy')).to.be.true;
            })
        })

        describe("expresso functionality", () => {
            describe("res.send()", () => {
                it("raw", (done) => {
                    const app = expresso();
                    app.get('/', async (req, res) => {
                        res.send('raw');
                    });
                    chai.request(app).get('/')
                        .end((err, res) => {
                            if (err) return done(err)
                            expect(res.status).to.eq(200)
                            expect(res.text).to.eq('raw')
                            done();
                        })
                })

                it("JSX (Preact)", (done) => {
                    const app = expresso();
                    app.get('/', async (req, res) => {
                        /** @jsx h */
                        res.send(<p>hello</p>);
                    });

                    chai.request(app).get('/')
                        .end((err, res) => {
                            if (err) return done(err)
                            expect(res.status).to.eq(200)
                            expect(res.text).to.eq('<p>hello</p>')
                            done();
                        })
                })
            })

            const verbs = ["get", "post", "put", "delete", "patch", "head", "options"];
            describe("async verb methods", () => {
                verbs.forEach(verb => {
                    it("app." + verb + "()", (done) => {
                        const app = expresso();
                        app[verb]('/', async (req, res) => {
                            setTimeout(() => {
                                res.status(201).send();
                            }, 3)
                        });

                        chai.request(app)[verb]('/')
                            .end((err, res) => {
                                if (err) return done(err)
                                expect(res.status).to.eq(201)
                                done();
                            })
                    })
                })
            })

            describe("async verb method errors", () => {
                verbs.forEach(verb => {
                    it("app." + verb + "() error is handled", (done) => {
                        const app = expresso();

                        app[verb]('/', async (req, res) => {
                            throw new Error();
                            res.send();
                        });

                        app.use(middleware.error((err, req, res, next) => {
                            res.status(500)
                            res.send('pass')
                        }))

                        chai.request(app)[verb]('/')
                            .end((err, res: Response) => {
                                if (err) return done(err)
                                expect(res.status).to.eq(500)
                                if (verb !== 'head') expect(res.text).to.eq('pass')
                                done();
                            })
                    })
                })
            })
        })
    })
})
