'use strict';
const reportErrorRedis = function( error ) {
    if ( error !== null ) {
        console.log( error );
    }
};
const Redis         = require( 'redis' ).createClient().on( 'error', reportErrorRedis );
const Time          = require( '@augur/augur-modules' )( 'time' );
const cacheInMemory = {};
const REQUEST_OPTIONS = {};

Redis.keys('cache:userAgentParser:*', function( error, userAgentKeyList ) {
    if ( error !== null ) {
        return reportErrorRedis({ from:'Load userAgentKeyList', error: error });
    }

    for ( let i = 0, j = userAgentKeyList.length; i < j; i++ ) {
        userAgentKeyList[i] = [ 'get', userAgentKeyList[i] ];
    }

    Redis.multi( userAgentKeyList ).exec(function( error, userAgentKeyCacheValues ) {
        if ( error !== null ) {
            return reportErrorRedis({ from:'Load userAgentKeyCacheValues', error: error });
        }
        for ( let i = 0, j = userAgentKeyCacheValues.length; i < j; i++ ) {
            cacheInMemory[ userAgentKeyList[i] ] = userAgentKeyCacheValues[i];
        }
    });
});

function updateCache( userAgent, UA_DATA ) {
    console.log('UPDATING CACHE');
    cacheInMemory[ userAgent ] = UA_DATA;
    setImmediate(function( userAgent, UA_DATA ) {
        const endOfMonth = Time('endOfMonth');

        Redis.set( 'cache:userAgentParser:' + userAgent, UA_DATA, reportErrorRedis );
        Redis.expire( 'cache:userAgentParser:' + userAgent, endOfMonth, reportErrorRedis );
    }, userAgent, UA_DATA );
}

async function parseUserAgent( userAgent ) { // jshint ignore:line
        if ( cacheInMemory[ userAgent ] !== undefined ) {
            return cacheInMemory[ userAgent ];
        } else {
            const UA_DATA = await require( './cloud.js' )( REQUEST_OPTIONS )( userAgent ); // jshint ignore:line
            updateCache( userAgent, UA_DATA );
            return UA_DATA;
        }
}

module.exports = function( requestOptions ) {
    for ( let option in requestOptions ) {
        REQUEST_OPTIONS[ option ] = requestOptions[ option ];
    }
    return parseUserAgent;
};
