import * as chai from "chai";
import {expect} from "chai";
import {Logger} from "tslog";
import {expresso, middleware} from "../../core";

describe("core/app", () => {
    describe("expresso()", () => {
        describe("core bindings", () => {
            // no options
            const _app = expresso();

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

                // these will be NaN as there is no value on req.at
                it(".msTotal", () =>
                    expect(_app.request.msTotal).to.be.NaN)

                it(".currentMs", () =>
                    expect(_app.request.currentMs).to.be.NaN)
                // end NaN

                it(".uuid", () =>
                    expect(typeof _app.request.uuid).to.eq('string'));
            })
        })

        describe("expresso functionality", () => {
            describe("res.send()", () => {
                return true;
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
                                expect(res).to.have.status(201);
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

export {}
