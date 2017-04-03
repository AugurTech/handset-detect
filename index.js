'use strict';
module.exports = function( config = {} ) {
    if ( config === null || Object.keys( config ).length === 0 ) {
        throw new Error('A config must be provided.');
    } else if ( config.free === undefined && config.module === undefined ) {
        throw new Error('Config must provide config.hosted === true or config.cloud === true. When using cloud, config.username && config.secret must be defined.');
    } else if ( config.free === undefined && config.username === undefined && config.secret === undefined ) {
        throw new Error('Config must provide username and secret or set the free parameter to true.');
    }

    const requestOptions = {
        headers: { 'content-type': 'application/json' },
        hostname: 'api.handsetdetection.com',
        method: config.autoUpdate === true? 'GET' : 'POST',
        path: `/apiv4/device/${ config.autoUpdate === true? 'fetcharchive' : 'detect' }.json`
    };
    const md5 = ( string )=> require('crypto').createHash('md5').update( string ).digest('hex');
    const HA1 = md5(`${ config.username }:APIv4:${ config.secret }`);
    const HA2 = md5(`${ requestOptions.method }:${ requestOptions.path }`);
    const cnonce = md5( Math.random().toString() );
    const response = md5(`${ HA1 }:APIv4:00000001:${ cnonce }:auth:${ HA2 }`);

    requestOptions.headers.authorization = `Digest username="${ config.username }", realm="APIv4", nonce="APIv4", uri="${ requestOptions.path }", cnonce="${ cnonce }", nc=00000001, qop=auth, response="${ response }", opaque="APIv4"`;

    if ( config.module === 'hosted' ) {
        if ( config.autoUpdate === true && require('cluster').isMaster === true ) {
            require('child_process').fork(
                __dirname + '/lib/manageDB.js',
                [ JSON.stringify({ config, requestOptions }) ]
            );
        }
    }

    return require(`${ __dirname }/lib/${ config.module || 'hosted' }.js`)( requestOptions, config.onlyLoad );
};
/*
    if this the first time the database is being download by NPM
    then decompress the database.json file
*/
if ( process.argv[2] !== undefined && require('fs').existsSync(`${ __dirname }/lib/database.json`) === false ) {
    require('child_process').exec('gunzip -k lib/database.json.gz -f');
}