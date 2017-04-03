/* globals describe, it, before */
'use strict';
require('colors');

const reportError = function( error ) {
    if ( error !== null ) {
        console.log( error );
    }
};

const Redis = require( 'redis' ).createClient().on( 'error', reportError );
const TEST_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25';
const REDIS_UA = 'Mozilla/5.0 (Windows; U; Windows NT 5.1; cs; rv:1.9.0.11) Gecko/2009060215 Firefox/3.0.11';
const assert = require( 'assert' ).deepStrictEqual;

const parse = require('../')({
        cache: true,
        username: process.env.HANDSET_DETECT_USERNAME,
        secret: process.env.HANDSET_DETECT_SECRET
    });

describe( 'Caching'.bold.cyan.underline, function() {
    before( function( done ) {
        assert( parse( REDIS_UA ), null );
        setTimeout( done, 500 );
    });

    it( 'should return the correct function when provided cache flag', function() {
        assert( parse.name, 'parseUserAgent' );
    });

    it( 'should load Redis into memory cache', function() {
        const redisTestData = parse('a');
        assert( redisTestData !== null, true );
        assert( redisTestData.b, 1 );
    });

    describe( 'Memory cache miss'.bold.blue, function() {
        let response;
        before( function() {
            response = parse( TEST_UA );
        });

        it( 'should return null', function() {
            assert( response, null );
        });
    });

    describe( 'Memory cache hit'.bold.blue, function() {
        let response;
        before( function( done ) {
            setTimeout( function() {
                response = parse( TEST_UA );
                done();
            }, 500);
        });

        it( 'should return object', function() {
            assert( response !== undefined && response !== null && response.constructor === Object , true );

        });

        it( 'should return browser as Mobile Safari', function() {
            assert( response.general_browser, 'Mobile Safari' );
        });
    });

    describe( 'Redis cache hit'.bold.blue, function() {
        let redis_res;
        let redis_ttl;
        before( function( done ) {
            Redis.get('cache:userAgentParser:' + TEST_UA, function( e, reply ) {
                if ( e !== null ) {
                    reportError( e );
                }

                redis_res = JSON.parse( reply );

                Redis.ttl('cache:userAgentParser:' + TEST_UA, function( e, reply ) {
                    if ( e !== null ) {
                        reportError( e );
                    }

                    redis_ttl = JSON.parse( reply );
                    done();
                });
            });
        });

        it( 'should store the user agent info', function() {
            assert( redis_res !== undefined && redis_res !== null && redis_res.constructor === Object , true );
        });

        it( 'should set the TLL', function() {
            assert( redis_ttl >= 1727998, true );
        });
    });
});
