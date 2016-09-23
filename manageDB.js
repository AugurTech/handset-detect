'use strict';
const FileSystem = require('fs');
const Request = require('https').request;
const Unzip = require('unzip2').Extract;
let DATABASE_PATH_FOLDER = __dirname +'/ultimate4';
let DATABASE_PATH_ZIP = DATABASE_PATH_FOLDER + '.zip';
let DATABASE_NAME = __dirname + '/database.json';
const REQUEST_OPTIONS = {};
const UA_OR_JSON = /user-agent|\.json/g;
let ONLY_LOAD = [];

process.on('disconnect', ()=> process.kill( process.pid, 'SIGKILL' ) );

function updateDatabase() {
    Request( REQUEST_OPTIONS, saveZipToFile ).once('error', reportError ).end();
    require('child_process').exec( 'rm -r ' + DATABASE_PATH_FOLDER );
    FileSystem.unlink( DATABASE_PATH_ZIP, function() {});
    reportLog('Updating database');
}
function saveZipToFile( readableStream ) {
    readableStream
        .pipe( FileSystem.createWriteStream( DATABASE_PATH_ZIP ) )
        .once('finish', extractDatabaseZipFile )
        .once('error', reportError );
}
function extractDatabaseZipFile() {
    FileSystem
        .createReadStream( DATABASE_PATH_ZIP )
        .pipe( Unzip({ path: DATABASE_PATH_FOLDER }) )
        .once('error', reportError )
        .once('close', emitDoneDownloading );
}
function emitDoneDownloading() {
    openDBCleanItAndSaveToFile();
    reportLog('Database extracted');
}
function reportLog( log ) {
    if ( log !== undefined ) {
        console.log( new Date().toISOString(), 'User-Agent-Parser:', log );
    }
}
function reportError( error ) {
    if ( error !== null ) {
        console.error( new Date().toISOString(), 'User-Agent-Parser: ERROR:', error );
    }
}
function openDBCleanItAndSaveToFile() {
    FileSystem.readdir( DATABASE_PATH_FOLDER, function( error, directory ) {
        if ( error !== null || directory === undefined ) {
            return reportError({ from: 'openDBCleanItAndSaveToFile', error: error, directory: directory });
        }
        let deviceHash = {};
        let extrasHash = {};
        let tree = {};

        for ( let i = 0, j = directory.length, file, splitFileName, fileName, fileNumber, hashTable; i < j; i++ ) {
            file = directory[i];
            splitFileName = file.split('_');
            fileName = splitFileName[0];
            fileNumber = splitFileName[1];

            if ( fileNumber !== undefined ) {
                hashTable = fileName === 'Device'? deviceHash : extrasHash;
                hashTable[ fileNumber.replace( UA_OR_JSON, '' ) ] = openFileReturnObject( file, fileName );
            } else if ( file.includes('.json') === true ) {
                switch( file ) {
                    case 'user-agent0.json':
                    case 'user-agent1.json':
                    case 'user-agentbrowser.json':
                    case 'user-agentplatform.json':
                        openJSONFile( file, tree );
                }
            }
        }
        for ( let rootNode in tree ) {
            let hashTable = rootNode === '0' || rootNode === '1'? deviceHash : extrasHash;
            let branch = tree[ rootNode ];

            for ( let node in branch ) {
                let subTree = branch[ node ];
                for ( let subNode in subTree ) {
                    tree[ rootNode ][ node ][ subNode ] = hashTable[ subTree[ subNode ] ];
                }
            }
        }
        FileSystem.writeFile( DATABASE_NAME, JSON.stringify( tree ), function( error ) {
            if ( error === null ) {
                reportLog('Finished loading. Restart your app or workers so that they use the new database');
            } else {
                console.error( new Date().toISOString(), 'User-Agent-Parser: ERROR:', error );
            }
        });
    });
}
function openFileReturnObject( file, dataType ) {
    let data = JSON.parse( FileSystem.readFileSync( DATABASE_PATH_FOLDER + '/' + file ) )[ dataType ].hd_specs;

    for ( let property in data ) {
        if ( ONLY_LOAD.length !== 0 && ONLY_LOAD.indexOf( property ) === -1 || data[ property ] === '' ) {
            data[ property ] = undefined;
        }
    }
    return data;
}
function openJSONFile( file, tree ) {
    let json = JSON.parse( FileSystem.readFileSync( DATABASE_PATH_FOLDER + '/' + file ) );
    let subTree = {};

    for ( let filter in json ) {
        let database = json[ filter ];

        for ( let rootNode in database ) {
            if ( subTree[ rootNode ] === undefined ) {
                subTree[ rootNode ] = {};
            }

            let branch = database[ rootNode ];

            for ( let leaf in branch ) {
                if ( subTree[ rootNode ][ leaf ] === undefined ) {
                    subTree[ rootNode ][ leaf ] = branch[ leaf ];
                }
            }
        }
    }
    tree[ file.replace( UA_OR_JSON, '' ) ] = subTree;
}
function loadOptionsAndcheckIfDBExists() {
    let config = JSON.parse( process.argv[2] );

    if ( config.onlyLoad !== undefined ) {
        ONLY_LOAD = config.onlyLoad;
    }

    if ( config.free === true ) {
        DATABASE_PATH_FOLDER = __dirname +'/free-edition';
        DATABASE_PATH_ZIP = DATABASE_PATH_FOLDER + '.zip';
    } else if ( config.autoUpdate === true && config.requestOptions !== undefined ) {
        let requestOptions = config.requestOptions;

        for ( let option in requestOptions ) {
            REQUEST_OPTIONS[ option ] = requestOptions[ option ];
        }
        /* update the database every 3 days */
        setInterval( updateDatabase, 2.592e8 );
        DATABASE_NAME = __dirname + '/database-premium.json';
    }

    FileSystem.readFile( DATABASE_NAME, function( error ) {
        if ( error !== null && error.code === 'ENOENT' ) {
            if ( config.free === true ) {
                extractDatabaseZipFile();
            } else if ( config.requestOptions !== undefined ) {
                updateDatabase();
            }
        }
    });
}
loadOptionsAndcheckIfDBExists();