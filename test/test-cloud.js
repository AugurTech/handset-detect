/* globals describe, it, before */
'use strict';

const TEST_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36';
const HANDSET_DETECT_USERNAME = process.env.HANDSET_DETECT_USERNAME;
const HANDSET_DETECT_SECRET = process.env.HANDSET_DETECT_SECRET;

let assert = require('assert');
let handsetDetect = require('../');

let parse = handsetDetect({ cloud:true, username:HANDSET_DETECT_USERNAME,secret:HANDSET_DETECT_SECRET});


let e, response;

describe( 'Cloud Function', function() {
    it( 'should return the correct function when provided cloud flag', function() {
        assert.equal(parse.name, 'query');
    });
});

describe( 'Cloud Parsing', function() {
    before( function( done ) {
        parse( TEST_UA )
        .then(ua_data => {
            response = ua_data;
            done();
        });
    });
    it( 'should return an object with no errors', function() {
        assert.equal(typeof response, 'object');
        assert.equal(e, null);
    });

    it( 'should return browser as Chrome', function() {
        assert.equal(response.hd_specs.general_browser, 'Chrome');
    });
});
