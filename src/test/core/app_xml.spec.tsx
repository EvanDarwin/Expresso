/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

/** @jsx JSXXML */
import * as chai from "chai";
import {expect} from "chai";
import {CData, JSXXML} from "jsx-xml";
import {expresso} from "../../core";

describe("res.send()", () => {
    it("XML (JSXXML)", (done) => {
        const app = expresso();
        app.get('/', async (req, res) => {
            res.xml(<xml><CData>asdasd</CData></xml>);
        });

        chai.request(app).get('/')
            .end((err, res) => {
                if (err) return done(err)
                expect(res.status).to.eq(200)
                expect(res.text).to.eq('<?xml version="1.0"?><xml><![CDATA[asdasd]]></xml>')
                done();
            })
    })
})
