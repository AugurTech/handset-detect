/* globals describe, it, before */
'use strict';

const TEST_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25';
const HANDSET_DETECT_USERNAME = process.env.HANDSET_DETECT_USERNAME;
const HANDSET_DETECT_SECRET = process.env.HANDSET_DETECT_SECRET;

let assert = require('assert');
let handsetDetect = require('../');

let parse = handsetDetect({ cache:true, username:HANDSET_DETECT_USERNAME,secret:HANDSET_DETECT_SECRET});

let e, response;

describe( 'Cache Function', function() {
    it( 'should return the correct function when provided cache flag', function() {
        assert.equal(parse.name, 'parseUserAgent');
    });
});

describe( 'Cloud Parsing', function() {
    before( function( done ) {
        parse( TEST_UA )
        .then( ua_data => {
            response = ua_data;
            done();
        });
    });

    it( 'should return an object with no errors', function() {
        assert.equal(typeof response, 'object');
        assert.equal(e, null);
    });

    it( 'should return browser as Mobile Safari', function() {
        assert.equal(response.hd_specs.general_browser, 'Mobile Safari');
    });
});
