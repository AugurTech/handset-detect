'use strict';
// process.env.UV_THREADPOOL_SIZE = 1e4;
const FileSystem = require('fs');
const Request = require('https').request;
const Unzip = require('unzip2').Extract;
const DATABASE_PATH_FOLDER = __dirname + '/database-files';
const DATABASE_NAME = __dirname + '/database.json';
const DATABASE_PATH_ZIP = DATABASE_NAME + '.zip';
const REQUEST_OPTIONS = {};
const UA_OR_JSON = /user-agent|\.json/g;
const stringifyDeterminstically = require('json-stable-stringify');
let VERBOSE;

process.once( 'disconnect', ()=> process.kill( process.pid, 'SIGKILL' ) );
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
    reportLog('Downloading database');

    Request( REQUEST_OPTIONS, saveDBtoZipFile )
        .once( 'error', reportError )
        .end();
}
function saveDBtoZipFile( readableStream ) {
    reportLog('Saving database.json.zip');

    readableStream
        .pipe( FileSystem.createWriteStream( DATABASE_PATH_ZIP ) )
        .once( 'finish', extractDBZipFile )
        .once( 'error', reportError );
}
function extractDBZipFile() {
    reportLog('Saved. Extracting database.json.zip to database-files/');

    FileSystem
        .createReadStream( DATABASE_PATH_ZIP )
        .pipe( Unzip({ path: DATABASE_PATH_FOLDER }) )
        .once( 'error', reportError )
        .once( 'close', batchProcess.openDBCleanItAndSaveToFile );
}
/////////////////////////////
/*
    Create database.json from database.json.zip
*/
const batchProcess = {
    TREE: {
        DEVICE: {},
        EXTRAS: {}
    },
    batches: 3,
    batchSize: undefined,
    index: 0,
    itemsFinished: 0,
    directory: [],
    processUpToThisNumber: 0,
    openDBCleanItAndSaveToFile() {
        reportLog('Database extracted. Building database.json');
        FileSystem.readdir( DATABASE_PATH_FOLDER, batchProcess.readDatabaseFilesDirectory );
    },
    readDatabaseFilesDirectory( error, directory ) {
        if ( error !== null ) {
            return reportError(`Could not start database update. Error=>${ error }`);
        }
        batchProcess.batchSize = Math.ceil( directory.length / batchProcess.batches );
        batchProcess.processUpToThisNumber = batchProcess.batchSize;
        batchProcess.directory = directory;
        batchProcess.decideWhatToProcessNext();
        batchProcess.processBatch();
    },
    decideWhatToProcessNext() {
        this.processUpToThisNumber =
            this.directory.length - this.index - this.batchSize >= 0?
                this.index + this.batchSize : this.index + this.batchSize + ( this.directory.length % this.batchSize - this.batchSize );
    },
    processBatch() {
        for ( let j = this.processUpToThisNumber, file, splitFileName, fileName, fileNumber; this.index < j; this.index++ ) {
            file = this.directory[ this.index ];
            splitFileName = file.split('_');
            fileName = splitFileName[0];
            fileNumber = splitFileName[1];

            if ( fileNumber !== undefined ) {
                this.openFileReturnObject( file, fileName, fileName === 'Device'? this.TREE.DEVICE : this.TREE.EXTRAS, fileNumber.replace( UA_OR_JSON, '' ) );
            } else {
                switch( file ) {
                    case 'user-agent0.json':
                    case 'user-agent1.json':
                    case 'user-agentbrowser.json':
                    case 'user-agentplatform.json': {
                        this.openJSONFile( file );
                        continue;
                    }
                    default: {
                        this.unitProcessed();
                    }
                }
            }
        }
    },
    unitProcessed() {
        if ( ++this.itemsFinished === this.directory.length ) {
            this.processingComplete();
        } else if ( this.itemsFinished === this.processUpToThisNumber ) {
            this.decideWhatToProcessNext();
            this.processBatch();
        }
        // console.log( ( this.itemsFinished / this.directory.length * 100 ).toFixed(2) + '%\r' );
    },
    openFileReturnObject( file, fileName, hashMap, fileNumber ) {
        FileSystem.readFile(`${ DATABASE_PATH_FOLDER }/${ file }`, function( error, buffer ) {
            if ( error ) {
                return reportError( error );
            }
            const obj = JSON.parse( buffer )[ fileName ].hd_specs;
            const databaseEntry = {
                model: obj.general_model || undefined,
                type: obj.general_type || undefined,
                vendor: obj.general_vendor || undefined,
                browser: obj.general_browser || undefined,
                browserVersion: obj.general_browser_version || undefined,
                platform: obj.general_platform || undefined,
                platformVersion: obj.general_platform_version || undefined
            };
            hashMap[ fileNumber ] = Object.keys( JSON.stringify( databaseEntry ) ).length !== 0?
                databaseEntry : undefined;

            batchProcess.unitProcessed();
        });
    },
    processingComplete() {
        FileSystem.writeFile( DATABASE_NAME, stringifyDeterminstically( this.TREE ), function( error ) {
            if ( error === null ) {
                reportLog('database.json has been updated. Restart your app or workers so that they use the new database');
            } else {
                reportError(`User-Agent-Parser: ERROR: ${ error }`);
            }
        });
        this.cleanup();
    },
    openJSONFile( file ) {
        FileSystem.readFile(`${ DATABASE_PATH_FOLDER }/${ file }`, function( error, buffer ) {
            if ( error === null ) {
                const treeName = file.replace( UA_OR_JSON, '' );
                const json = JSON.parse( buffer );
                const branchArray = [];
                // first make sure the trees are converted from a hashmap with index as keys
                // to an array, where the key-index is the index of the array, pointing to the
                // the hashmap's value. so create a one-to-one mapping
                for ( let i = 0, jsonKeys = Object.keys( json ), j = jsonKeys.length; i < j; i++ ) {
                    branchArray[ +jsonKeys[i] ] = json[ jsonKeys[i] ];
                }

                const compactedBranch = [];
                // the array is now possibly sparse, so go ahead and compact it down
                // so if our first array element is at index 250, then set it the
                // compacted array to start at index 0, and that index will point to
                // array[ 250 ]'s element, etc. this removes sparcity and keeps data intact
                for ( let i = 0, j = branchArray.length; i < j; i++ ) {
                    if ( branchArray[i] !== undefined ) {
                        compactedBranch[ compactedBranch.length ] = branchArray[i];
                    }
                }
                batchProcess.TREE[ treeName ] = compactedBranch;
                batchProcess.unitProcessed();
            } else {
                reportError( error );
            }
        });
    },
    cleanup() {
        this.TREE = {
            DEVICE: {},
            EXTRAS: {}
        };
        this.index = 0;
        this.itemsFinished = 0;
        require('child_process').exec(`rm ${ DATABASE_PATH_ZIP };rm -r ${ DATABASE_PATH_FOLDER }`);
    }
};
(function() {
    const client = JSON.parse( process.argv[2] );

    VERBOSE = client.config.verbose;

    Object.assign( REQUEST_OPTIONS, client.requestOptions );
    /* update the database every 3 days */
    setInterval( downloadUpdatedDB, 2.592e8 );
    // batchProcess.openDBCleanItAndSaveToFile();
})();