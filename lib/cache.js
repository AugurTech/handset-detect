'use strict';
const Redis = require( 'redis' ).createClient().on( 'error', reportError );
const cacheInMemory = {};
let cloudQuery;

Redis.keys( 'cache:userAgentParser:*', function( error, userAgentKeyList ) {
    if ( error !== null ) {
        return reportError({ from:'Load userAgentKeyList', error: error });
    }
    for ( let i = 0, j = userAgentKeyList.length; i < j; i++ ) {
        userAgentKeyList[i] = [ 'get', userAgentKeyList[i] ];
    }

    Redis.multi( userAgentKeyList ).exec( function( error, userAgentKeyCacheValues ) {
        if ( error !== null ) {
            return reportError({ from:'Load userAgentKeyCacheValues', error: error });
        }
        for ( let i = 0, j = userAgentKeyCacheValues.length; i < j; i++ ) {
            cacheInMemory[ userAgentKeyList[i][1].slice( 22 ) ] = JSON.parse( userAgentKeyCacheValues[i] );
        }
    });
});
function parseUserAgent( userAgent ) {
    if ( cacheInMemory[ userAgent ] !== undefined ) {
        return cacheInMemory[ userAgent ];
    } else {
        cloudQuery( userAgent, function( error, UA_DATA ) {
            if ( error === null && UA_DATA !== undefined ) {
                cacheInMemory[ userAgent ] = UA_DATA;
                // expire in 20 days
                Redis.setex( 'cache:userAgentParser:' + userAgent, 1728000, JSON.stringify( UA_DATA ), reportError );
            } else {
                reportError( error );
            }
        });
        return null;
    }
}
function reportError( error ) {
    if ( error !== null ) {
        console.error( error );
    }
}
module.exports = function( requestOptions, onlyLoad ) {
    cloudQuery = require('./cloud.js')( requestOptions, onlyLoad );

    return parseUserAgent;
};