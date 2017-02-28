/* globals describe, it, before */
'use strict';
const assert = require('assert').deepStrictEqual;
const handsetDetect = require('../');
const parse = handsetDetect({
    cloud: true,
    username: process.env.HANDSET_DETECT_USERNAME,
    secret: process.env.HANDSET_DETECT_SECRET
});


describe( 'Cloud Function', function() {
    it( 'should return the correct function when provided cloud flag', function() {
        assert( parse.name, 'query' );
    });
});

describe( 'Cloud Parsing', function() {
    let response;
    let possibleError;
    before( function( done ) {
        const TEST_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36';
        parse( TEST_UA, function( error, success ) {
            response = success;
            possibleError = error;
            done();
        });
    });
    it( 'should return an object with no errors', function() {
        assert( response !== undefined && response !== null && response.constructor === Object , true );
        assert( possibleError, null );
    });

    it( 'should return browser as Chrome', function() {
        assert( response.hd_specs.general_browser, 'Chrome' );
    });
});
