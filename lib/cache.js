'use strict';
const reportError = function( error ) {
    if ( error !== null ) {
        console.log( error );
    }
};
const Redis = require( 'redis' ).createClient().on( 'error', reportError );
const cacheInMemory = {};
const REQUEST_OPTIONS = {};
let cloudQuery;

Redis.keys('cache:userAgentParser:*', function( error, userAgentKeyList ) {
    if ( error !== null ) {
        return reportError( { from:'Load userAgentKeyList', error: error } );
    }

    let j = userAgentKeyList.length;
    for ( let i = 0; i < j; i++ ) {
        userAgentKeyList[i] = [ 'get', userAgentKeyList[i] ];
    }

    Redis.multi( userAgentKeyList ).exec( function( error, userAgentKeyCacheValues ) {
        if ( error !== null ) {
            return reportError( { from:'Load userAgentKeyCacheValues', error: error } );
        }
        j = userAgentKeyCacheValues.length;
        for ( let i = 0; i < j; i++ ) {
            cacheInMemory[
                userAgentKeyList[i][1].split(':')[2]
            ] = userAgentKeyCacheValues[i];
        }
    });
});

function updateCache( userAgent ) {
    const twentyDays = new Date().getTime() + 86400 * 1000 * 20;
    cloudQuery( userAgent, function( error, UA_DATA ) {
        reportError( error );

        cacheInMemory[ userAgent ] = UA_DATA;
        Redis.set( 'cache:userAgentParser:' + userAgent, JSON.stringify( UA_DATA ), reportError );
        Redis.expire( 'cache:userAgentParser:' + userAgent, twentyDays, reportError );
    });
}

function parseUserAgent( userAgent ) {
        if ( cacheInMemory[ userAgent ] !== undefined ) {
            return cacheInMemory[ userAgent ];
        } else {
            setImmediate( updateCache, userAgent );
            return null;
        }
}

module.exports = function( requestOptions ) {
    for ( let option in requestOptions ) {
        REQUEST_OPTIONS[ option ] = requestOptions[ option ];
    }
    cloudQuery = require( './cloud.js' )( REQUEST_OPTIONS );
    return parseUserAgent;
};
