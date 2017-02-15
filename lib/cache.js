'use strict';
const reportErrorRedis = function( error ) {
    if ( error !== null ) {
        console.log( error );
    }
};
const Redis = require( 'redis' ).createClient().on( 'error', reportErrorRedis );
const cacheInMemory = {};
const REQUEST_OPTIONS = {};
const cloudQuery = require( './cloud.js' )( REQUEST_OPTIONS );

Redis.keys('cache:userAgentParser:*', function( error, userAgentKeyList ) {
    if ( error !== null ) {
        return reportErrorRedis({ from:'Load userAgentKeyList', error: error });
    }

    let j = userAgentKeyList.length;
    for ( let i = 0; i < j; i++ ) {
        userAgentKeyList[i] = [ 'get', userAgentKeyList[i] ];
    }

    Redis.multi( userAgentKeyList ).exec(function( error, userAgentKeyCacheValues ) {
        if ( error !== null ) {
            return reportErrorRedis({ from:'Load userAgentKeyCacheValues', error: error });
        }
        j = userAgentKeyCacheValues.length;
        for ( let i = 0; i < j; i++ ) {
            cacheInMemory[ userAgentKeyList[i] ] = userAgentKeyCacheValues[i];
        }
    });
});

function updateCache( userAgent, UA_DATA ) {
    cacheInMemory[ userAgent ] = UA_DATA;
    setImmediate(function( userAgent, UA_DATA ) {
        const twentyDays = new Date().getTime() + 86400 * 1000 * 20;

        Redis.set( 'cache:userAgentParser:' + userAgent, JSON.stringify(UA_DATA), reportErrorRedis );
        Redis.expire( 'cache:userAgentParser:' + userAgent, twentyDays, reportErrorRedis );
    }, userAgent, UA_DATA );
}

async function parseUserAgent( userAgent ) { // jshint ignore:line
        if ( cacheInMemory[ userAgent ] !== undefined ) {
            return cacheInMemory[ userAgent ];
        } else {
            const UA_DATA = await cloudQuery( userAgent ); // jshint ignore:line
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
