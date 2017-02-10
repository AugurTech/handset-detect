'use strict';
const Request = require('https').request;
const REQUEST_OPTIONS = {};

// TODO: Return Error if sends Unauthenticated route
function query( userAgent ) {
    return new Promise(( resolve, reject ) => {
        let streamWritable = Request( REQUEST_OPTIONS, onResponse ).once( 'error', onError );

        streamWritable.resolve = resolve;
        streamWritable.reject = reject;
        streamWritable.end( JSON.stringify({ 'user-agent': userAgent }) );
    });
}

function onResponse( streamReadable ) {
    streamReadable.setEncoding('utf8');
    streamReadable.resolve = this.resolve;
    streamReadable.reject = this.reject;
    streamReadable.on('data', onChunk )
        .once('end', onDataEnd )
        .once( 'error', onError )
        .data = '';
}

function onChunk( chunk ) {
    this.data += chunk;
}

function onError( error ) {
    this.reject( {error} );
}

function onDataEnd() {
    this.resolve( JSON.parse( this.data ) );
}

module.exports = function( requestOptions ) {
    for ( let option in requestOptions ) {
        REQUEST_OPTIONS[ option ] = requestOptions[ option ];
    }
    return query;
};
