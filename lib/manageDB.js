'use strict';
process.env.UV_THREADPOOL_SIZE = 1e4;
const FileSystem = require('fs');
const Request = require('https').request;
const Unzip = require('unzip2').Extract;
const DATABASE_PATH_FOLDER = __dirname + '/database-files';
const DATABASE_NAME = __dirname + '/database.json';
const DATABASE_PATH_ZIP = DATABASE_NAME + '.zip';
const REQUEST_OPTIONS = {};
const UA_OR_JSON = /user-agent|\.json/g;
let ONLY_LOAD;
const stringifyDeterminstically = require('json-stable-stringify');
let VERBOSE;

process
    .on( 'finished branch', onBranchDone )
    .once( 'disconnect', ()=> process.kill( process.pid, 'SIGKILL' ) );
/*
    Logging
*/
function reportLog( log ) {
    if ( log !== undefined && VERBOSE === true ) {
        console.log( new Date().toISOString(), 'User-Agent-Parser:', log );
    }
}
function reportError( error ) {
    if ( error !== null && VERBOSE === true ) {
        console.error( new Date().toISOString(), 'User-Agent-Parser: ERROR:', error );
    }
}
/*
    Download new database.zip
    extract .zip archive
*/
function downloadUpdatedDB() {
    Request( REQUEST_OPTIONS, saveDBtoZipFile )
        .once('error', reportError )
        .end();

    reportLog('Updating database');
}
function saveDBtoZipFile( readableStream ) {
    readableStream
        .pipe( FileSystem.createWriteStream( DATABASE_PATH_ZIP ) )
        .once( 'finish', extractDBZipFile )
        .once( 'error', reportError );
}
function extractDBZipFile() {
    FileSystem
        .createReadStream( DATABASE_PATH_ZIP )
        .pipe( Unzip({ path: DATABASE_PATH_FOLDER }) )
        .once( 'error', reportError )
        .once( 'close', openDBCleanItAndSaveToFile );
}
/////////////////////////////
/*
    Create database.json from database.json.zip
*/
let TREE = {};
let DEVICE_ARRAY = [];
let EXTRAS_ARRAY = [];
function openDBCleanItAndSaveToFile() {
    FileSystem.readdir( DATABASE_PATH_FOLDER, function( error, directory = [] ) {
        // get a list of all the files in the database directory
        if ( error !== null || directory.length === 0 ) {
            reportError({ from: 'openDBCleanItAndSaveToFile', error: error, directory: directory });
        }

        for ( let i = 0, j = directory.length, file, splitFileName, fileName, fileNumber; i < j; i++ ) {
            file = directory[i];
            splitFileName = file.split('_');
            fileName = splitFileName[0];
            fileNumber = splitFileName[1];

            if ( fileNumber !== undefined ) {
                // select either the DEVICE or EXTRAS array
                // and push into it (at the correct index),
                // the file its referring into
                // ugly, but most direct way to do so.
                [ fileName === 'Device'? DEVICE_ARRAY : EXTRAS_ARRAY ][
                    +fileNumber.replace( UA_OR_JSON, '' )
                ] = openFileReturnObject( file, fileName );
            } else {
                switch( file ) {
                    case 'user-agent0.json':
                    case 'user-agent1.json':
                    case 'user-agentbrowser.json':
                    case 'user-agentplatform.json': {
                        openJSONFile( file );
                    }
                }
            }
        }
    });
    reportLog('Database extracted');
}
function onBranchDone() {
    if ( Object.keys( TREE ).length === 4 ) {
        FileSystem.writeFile( DATABASE_NAME, stringifyDeterminstically( TREE ), function( error ) {
            if ( error === null ) {
                reportLog('Finished loading. Restart your app or workers so that they use the new database');
            } else {
                reportError(`User-Agent-Parser: ERROR: ${ error }`);
            }
        });
        TREE = {};
        DEVICE_ARRAY = [];
        EXTRAS_ARRAY = [];
        require('child_process')
            .exec(`rm ${ DATABASE_PATH_ZIP };rm -r ${ DATABASE_PATH_FOLDER }`);
    }
}
/*
    Throw out any empty or unwanted data points
    and return the JSON cleanup json as an object
*/
function openFileReturnObject( file, fileName ) {
    const obj = JSON.parse( FileSystem.readFileSync( DATABASE_PATH_FOLDER + '/' + file ))[ fileName ].hd_specs;

    for ( let property in obj ) {
        if ( ONLY_LOAD !== undefined && ONLY_LOAD.indexOf( property ) === -1 || obj[ property ] === '' ) {
            obj[ property ] = undefined;
        }
    }

    return obj;
}
function openJSONFile( file ) {
    FileSystem.readFile( DATABASE_PATH_FOLDER + '/' + file, function( error, buffer ) {
        if ( error === null ) {
            const treeName = file.replace( UA_OR_JSON, '' );
            const json = JSON.parse( buffer );
            const branchArray = [];

            for (
                let i = 0, branch, tree, leaf, filter,
                    filterIndex, jsonKeys = Object.keys( json ),
                    j = jsonKeys.length;
                i < j;
                i++
            ) {
                filterIndex = jsonKeys[i];
                filter = json[ filterIndex ];

                for ( tree in filter ) {
                    branch = filter[ tree ];

                    for ( leaf in branch ) {
                        branch[ leaf ] =
                            isNaN( treeName ) === true?
                                EXTRAS_ARRAY[ +branch[ leaf ] ] :
                                DEVICE_ARRAY[ +branch[ leaf ] ];
                    }
                }

                branchArray[ +filterIndex ] = json[ filterIndex ];
            }

            for ( let i = 0, j = branchArray.length; i < j; i++ ) {
                if ( branchArray[i] === undefined ) {
                    branchArray.splice( i, 1 );
                }
            }

            TREE[ treeName ] = branchArray;
            process.emit('finished branch');
        } else {
            reportError( error );
        }
    });
}
(function() {
    const client = JSON.parse( process.argv[2] );

    VERBOSE = client.config.verbose;
    ONLY_LOAD = client.config.onlyLoad;

    Object.assign( REQUEST_OPTIONS, client.requestOptions );
    /* update the database every 3 days */
    setInterval( downloadUpdatedDB, 2.592e8 );
})();