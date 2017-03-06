'use strict';
const Request = require('https').request;
const REQUEST_OPTIONS = {};
let ONLY_LOAD;

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
    const data = JSON.parse( this.data ).hd_specs;
    if ( ONLY_LOAD !== undefined ) {
        const json = {};
        for ( let key in data ) {
            if ( ONLY_LOAD.indexOf( key ) !== -1 ) {
                json[ key ] = data[ key ];
            }
        }
        this.callback( null, json );
    } else {
        this.callback( null, data );
    }
}

module.exports = function( requestOptions, onlyLoad ) {
    for ( let option in requestOptions ) {
        REQUEST_OPTIONS[ option ] = requestOptions[ option ];
    }
    ONLY_LOAD = onlyLoad;
    return query;
};
