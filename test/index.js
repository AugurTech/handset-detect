/* globals describe, before, it*/
'use strict';
require('colors');
const Assert = require('assert');
const HandsetDetect = require('../index.js');
const Redis = require('redis').createClient();

describe('Handset Detect integration tests\n'.underline.cyan.bold, function() {
    this.retries(3);
    this.timeout(10e3);
    describe('Library'.cyan, function() {
        before(function( done ) {
            Redis.keys('cache:userAgentParser:*', function( error, keysThatMatchPatternArray ) {
                Assert.deepStrictEqual( error, null );
                let i = keysThatMatchPatternArray.length;

                while ( i-- !== 0 ) {
                    keysThatMatchPatternArray[i] = [ 'del', keysThatMatchPatternArray[i] ];
                }
                keysThatMatchPatternArray.push([
                    'set',
                    'cache:userAgentParser:testUserAgent',
                    JSON.stringify({ testPassed: true }),
                    'EX',
                    30
                ]);
                Redis.multi( keysThatMatchPatternArray ).exec( done );
            });
        });
        it('should be a function', function() {
            Assert.deepStrictEqual( HandsetDetect.constructor, Function );
        });
        it('should throw an error if no config is provided', function() {
            Assert.throws( HandsetDetect, Error );
        });
        it('should throw an error if username and secret and module (or free) are not provided', function() {
            Assert.throws( ()=> HandsetDetect({}), Error );
            Assert.throws( ()=> HandsetDetect({ username: 'test' }), Error );
            Assert.throws( ()=> HandsetDetect({ secret: 'test' }), Error );
            Assert.throws( ()=> HandsetDetect({ secret: 'test', username: 'test' }), Error );
        });
        it('should throw an error if (cloud or autoUpdate) is provided but no username or password is provided', function() {
            Assert.throws( ()=> HandsetDetect({ module: 'cloud', username: 'test' }), Error );
            Assert.throws( ()=> HandsetDetect({ module: 'cloud', secret: 'test' }), Error );
            Assert.throws( ()=> HandsetDetect({ module: 'hosted', autoUpdate: true, username: 'test' }), Error );
            Assert.throws( ()=> HandsetDetect({ module: 'hosted', autoUpdate: true, secret: 'test' }), Error );
        });
    });
    describe('Cloud.js module'.cyan, function() {
        const assert = Assert.deepStrictEqual;
        const handsetDetect = HandsetDetect({
            module: 'cloud',
            onlyLoad: [
                'general_browser',
                'general_browser_version',
                'general_platform',
                'general_platform_version',
                'general_model',
                'general_vendor'
            ],
            username: process.env.HANDSET_DETECT_USERNAME,
            secret: process.env.HANDSET_DETECT_SECRET
        });

        describe('Cloud Function'.bold.blue, function() {
            it('should return the correct function when provided cloud flag', function() {
                assert( handsetDetect.name, 'query' );
            });
        });
        describe('Cloud Parsing'.bold.blue, function() {
            let parsedUA;
            let possibleError;
            before( function( done ) {
                const TEST_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36';
                handsetDetect( TEST_UA, function( error, success ) {
                    parsedUA = success;
                    possibleError = error;
                    done();
                });
            });
            it('should return an object with no errors', function() {
                assert( possibleError, null );
                assert( parsedUA.constructor, Object );
            });
            it('should return browser as Chrome', function() {
                assert( parsedUA.general_model, 'OS X PC' );
                assert( parsedUA.general_vendor, 'Generic' );
                assert( parsedUA.general_browser, 'Chrome' );
                assert( parsedUA.general_platform, 'OS X' );
            });
            it('should only return values passed in onlyLoad', function() {
                assert( parsedUA.display_ppi, undefined );
            });
        });
        describe('Major browser detection'.bold.blue, function() {
            testSafari( handsetDetect, true );
            testIE( handsetDetect, true );
        });
    });
    describe('Cache.js module'.cyan, function() {
        const TEST_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25';
        const assert = Assert.deepStrictEqual;
        let handsetDetect;

        before(function( done ) {
            handsetDetect = HandsetDetect({
                module: 'cache',
                username: process.env.HANDSET_DETECT_USERNAME,
                secret: process.env.HANDSET_DETECT_SECRET
            });
            setTimeout( done, 1e3 );
        });
        it('should return the correct function when provided cache flag', function() {
            assert( handsetDetect.name, 'parseUserAgent' );
        });

        it('should load Redis into memory cache', function() {
            const cachedInRedis = handsetDetect('testUserAgent');
            assert( cachedInRedis !== null, true );
            assert( cachedInRedis.testPassed, true );
        });
        describe('Memory cache miss'.bold.blue, function() {
            let response;
            before( function( done ) {
                response = handsetDetect( TEST_UA );
                done();
            });

            it('should return null', function() {
                assert( response, null );
            });
        });
        describe('Memory cache hit'.bold.blue, function() {
            let response;
            before( function( done ) {
                setTimeout( function() {
                    response = handsetDetect( TEST_UA );
                    done();
                }, 5e3 );
            });
            it('should return object', function() {
                assert( response && response.constructor === Object, true );
            });
            it('should return browser as Mobile Safari', function() {
                assert( response.general_browser, 'Mobile Safari' );
            });
        });
        describe('Redis cache hit'.bold.blue, function() {
            let redis_res;
            let redis_ttl;
            before( function( done ) {
                Redis.get('cache:userAgentParser:' + TEST_UA, function( error, reply ) {
                    assert( error, null );
                    redis_res = JSON.parse( reply );
                    Redis.ttl('cache:userAgentParser:' + TEST_UA, function( error, reply ) {
                        assert( error, null );
                        redis_ttl = JSON.parse( reply );
                        done();
                    });
                });
            });

            it('should store the user agent info', function() {
                assert( redis_res && redis_res.constructor === Object , true );
            });
            it('should set the correct TLL', function() {
                assert( 1727000 < redis_ttl && redis_ttl < 1728000, true );
            });
        });
    });
    describe('Hosted.js module'.cyan, function() {
        const TEST_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36';
        const assert = Assert.deepStrictEqual;
        describe('Free Hosted Parsing'.blue.bold, function() {
            const handsetDetect = HandsetDetect({ module: 'hosted', free: true, verbose: true });
            // console.log( handsetDetect( TEST_UA ) )

            it('should return the correct function when provided hosted flag', function() {
                assert( handsetDetect.constructor, Function );
            });
            it('should return an object with no errors', function() {
                assert( typeof handsetDetect( TEST_UA ), 'object');
            });
            it('should return browser as Chrome', function() {
                const parsedUA = handsetDetect( TEST_UA );
                assert( parsedUA.browser , 'Chrome');
            });
            describe('Major browser detection'.bold.blue, function() {
                testSafari( handsetDetect );
                testIE( handsetDetect );
            });
        });
        describe('UltimateDB Paid Hosted Parsing'.bold.blue, function() {
            const handsetDetect = HandsetDetect({
                verbose: true,
                secret: process.env.HANDSET_DETECT_SECRET,
                username: process.env.HANDSET_DETECT_USERNAME,
                module: 'hosted',
                autoUpdate: true,
                onlyLoad: [
                    'vendor',
                    'model',
                    'type',
                    'browser',
                    'browser_engine',
                    'browser_version',
                    'platform',
                    'platform_version'
                ]
            });
            it('should return the correct module', function() {
                assert( handsetDetect.constructor, Function );
            });
            it('should return an object with no errors', function() {
                assert( handsetDetect( TEST_UA ).constructor, Object );
            });
            it('should return browser as Chrome', function() {
                assert( handsetDetect( TEST_UA ).browser, 'Chrome' );
            });
            describe('Major browser detection'.bold.blue, function() {
                testSafari( handsetDetect );
                testIE( handsetDetect );
            });
        });
    });
});
function testSafari( handsetDetect, useCallback ) {
    it('it correct classify Safari 1.03 (Jaguar) to Safari 10.1 (Sierra) as "Safari"', function( done ) {
        const uaArray = [
            // OS X 10.2 Jaguar
            'Mozilla/5.0 (Macintosh; U; PPC Mac OS X; en-us) AppleWebKit/85.8.5 (KHTML, like Gecko) Safari/85.8.1',
            // OSX 10.3 Panther
            'Mozilla/5.0 (Macintosh; U; PPC Mac OS X; en-us) AppleWebKit/312.8.1 (KHTML, like Gecko) Safari/312.6',
            // OSX 10.4 Tiger
            'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_7; en-us) AppleWebKit/533.4 (KHTML, like Gecko) Version/4.1 Safari/533.4',
            // OSX 10.5 Leopard
            'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_5_8; zh-cn) AppleWebKit/533.20.25 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27',
            // OSX 10.6 Snow Leopard
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2',
            // OSX 10.7 Lion
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/534.52.7 (KHTML, like Gecko) Version/5.1.2 Safari/534.52.7',
            // OSX 10.8 Mountain Lion
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/600.8.9 (KHTML, like Gecko) Version/6.2.8 Safari/537.85.17',
            // OSX 10.9 Mavericks
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A',
            // OSX 10.10 Yosimite
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_7) AppleWebKit/602.1.35 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.4',
            // OSX 10.11 El Captain
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11) AppleWebKit/601.1.32 (KHTML, like Gecko) Version/8.1 Safari/601.1.32',
            // MacOS 10.12 Sierra
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/603.2.1 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.1'
        ];
        isCorrectBrowser( handsetDetect, uaArray, 'Safari', useCallback, done );
    });
}
function testIE( handsetDetect, useCallback ) {
    it('it correct classify IE 1 to IE 11 as "Internet Explorer"', function( done ) {
        const uaArray = [
            // IE 1
            'Mozilla/4.0 (compatible; MSIE 1.0.0; Windows 95; Trident/4.0)',
            // IE 2
            'Mozilla/1.22 (compatible; MSIE 2.0; Windows 95)',
            // IE 3
            'Mozilla/2.0 (compatible; MSIE 3.0; Windows 95)',
            // IE 4
            'Mozilla/4.0 (compatible; MSIE 4.01; Windows 95)',
            // IE 5
            'Mozilla/4.0 (compatible; MSIE 5.0; Windows ME) Opera 6.0 [de]',
            // IE 6
            'Mozilla/4.0 (compatible; MSIE 6.0b; Windows NT 4.0)',
            // IE 7
            'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 10.0; WOW64; Trident/7.0; Touch; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; Tablet PC 2.0)',
            // IE 8
            'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; WOW64; Trident/4.0; SLCC1; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET4.0E; .NET4.0C)',
            // IE 9
            'Mozilla/5.0 (Windows; U; MSIE 9.0; WIndows NT 9.0; en-US))',
            // IE 10
            'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 10.0; WOW64; Trident/7.0; Touch; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; Tablet PC 2.0)',
            // IE 11
            'Mozilla/5.0 (Windows NT 10.0; Trident/7.0; NP08; yie10; rv:11.0) like Gecko'
        ];
        isCorrectBrowser( handsetDetect, uaArray, 'Internet Explorer', useCallback, done );
    });
}
function isCorrectBrowser( handsetDetect, uaArray, browserName, useCallback, done ) {
    let i = uaArray.length;
    let queue = i;

    function correctBrowserTest( error, parsedUA ) {
        Assert.deepStrictEqual( error, null );
        Assert.deepStrictEqual( parsedUA.general_browser || parsedUA.browser, browserName );

        if ( --queue === 0 ) {
            done();
        }
    }
    while ( i-- !== 0 ) {
        if ( useCallback === true ) {
            handsetDetect( uaArray[i], correctBrowserTest );
        } else {
            correctBrowserTest( null, handsetDetect( uaArray[i] ) );
        }
    }
}