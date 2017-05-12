'use strict';
const Request = require('https').request;
const REQUEST_OPTIONS = {};
const USER_AGENT = { 'user-agent': undefined };
let ONLY_LOAD;

function query( userAgent, callback ) {
    const streamWritable = Request( REQUEST_OPTIONS, onResponse ).once( 'error', callback );
    streamWritable.callback = callback;
    USER_AGENT['user-agent'] = userAgent;
    streamWritable.end( JSON.stringify( USER_AGENT ) );
}
function onResponse( streamReadable ) {
    streamReadable.callback = this.callback;
    streamReadable
        .setEncoding('utf8')
        .on( 'data', onChunk )
        .once( 'end', onDataEnd )
        .once( 'error', this.callback )
        .data = '';
}
function onChunk( chunk ) {
    this.data += chunk;
}
function onDataEnd() {
    const parsedUA = JSON.parse( this.data ).hd_specs;

    if ( parsedUA === undefined ) {
        this.callback('Unauthenticated');
    } else if ( ONLY_LOAD === undefined ) {
        this.callback( null, parsedUA );
    } else {
        const filteredParsedUA = {};

        for ( let property in parsedUA ) {
            if ( ONLY_LOAD.indexOf( property ) !== -1 ) {
                filteredParsedUA[ property ] = parsedUA[ property ];
            }
        }
        this.callback( null, filteredParsedUA );
    }
}

module.exports = function( requestOptions, onlyLoad ) {
    Object.assign( REQUEST_OPTIONS, requestOptions );
    ONLY_LOAD = onlyLoad;

    return query;
};