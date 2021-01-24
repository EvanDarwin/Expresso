import {expect} from "chai";
import {expresso} from "../../core";

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
        })
    })
})

export {}
