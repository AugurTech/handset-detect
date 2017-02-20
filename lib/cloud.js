'use strict';
const Request = require('https').request;
const REQUEST_OPTIONS = {};

// TODO: Return Error if sends Unauthenticated route
function query( userAgent, callback ) {
    let streamWritable = Request( REQUEST_OPTIONS, onResponse ).once( 'error', callback );
    streamWritable.callback = callback;
    streamWritable.end( JSON.stringify( { 'user-agent': userAgent } ) );
}

function onResponse( streamReadable ) {
    streamReadable.setEncoding( 'utf8' ).callback = this.callback;
    streamReadable.on( 'data', onChunk ).once( 'end', onDataEnd ).data = '';
}

function onChunk( chunk ) {
    this.data += chunk;
}

function onDataEnd() {
    this.callback( null, JSON.parse( this.data ) );
}

module.exports = function( requestOptions ) {
    for ( let option in requestOptions ) {
        REQUEST_OPTIONS[ option ] = requestOptions[ option ];
    }
    return query;
};
