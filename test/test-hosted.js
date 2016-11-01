/* globals describe, it, before */
'use strict';

const TEST_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36';
const HANDSET_DETECT_USERNAME = process.env.HANDSET_DETECT_USERNAME;
const HANDSET_DETECT_SECRET = process.env.HANDSET_DETECT_SECRET;

let assert = require('assert');
let handsetDetect = require('../');

// describe( 'Free Hosted Parsing', function() {
// 	let parse = handsetDetect({ hosted:true, free:true});
// 	it( 'should return the correct function when provided hosted flag', function() {
// 		assert.equal(parse.name, 'lookUp');
// 	});
// 	it( 'should return an object with no errors', function() {
// 		assert.equal(typeof parse( TEST_UA ), 'object');
// 	});
// 	it( 'should return browser as Chrome', function() {
// 		let parsedUA = parse( TEST_UA );
// 		console.log(parsedUA);
// 		assert.equal( parsedUA.general_browser , 'Chrome');
// 	});
// });

//        secret: 'fNY9Hx9ak932Bm37',
        // username: 'ebc9135b8d',

describe( 'UltimateDB Paid Hosted Parsing', function() {

	let parse = handsetDetect({
		        secret: HANDSET_DETECT_SECRET,
        username: HANDSET_DETECT_USERNAME,
        hosted:true, premium: true, onlyLoad: [
            'general_vendor',
            'general_model',
            'general_type',
            'general_browser',
            'general_browser_engine',
            'general_browser_version',
            'general_platform',
            'general_platform_version'
        ]});
	it( 'should return the correct function when provided hosted flag', function() {
		assert.equal(parse.name, 'lookUp');
	});
	it( 'should return an object with no errors', function() {
		assert.equal(typeof parse( TEST_UA ), 'object');
	});

	it( 'should return browser as Chrome', function() {
		let parsedUA = parse( TEST_UA );
		console.log(parsedUA);
		assert.equal( parsedUA.general_browser , 'Chrome');
	});
});