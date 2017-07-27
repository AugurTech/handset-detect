'use strict';
const FileSystem = require('graceful-fs');
const Request = require('https').request;
const Unzip = require('unzip2').Extract;
const REQUEST_OPTIONS = {};
const stringifyDeterminstically = require('json-stable-stringify');
const ExecuteLinuxCommand = require('child_process').exec;
let VERBOSE;
let DATABASE_NAME;
let DATABASE_PATH_ZIP;
let DATABASE_PATH_FOLDER;
let MOCK_DOWNLOAD_PATH;

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
    if (typeof MOCK_DOWNLOAD_PATH === 'string') {
      reportLog('(Mock)');
      saveDBtoZipFile( FileSystem.createReadStream( MOCK_DOWNLOAD_PATH ) );
    } else {
      Request( REQUEST_OPTIONS, saveDBtoZipFile )
        .once( 'error', reportError )
        .end();
    }
}
function saveDBtoZipFile( readableStream ) {
    reportLog(`Saving ${DATABASE_PATH_ZIP}`);

    readableStream
        .pipe( FileSystem.createWriteStream( DATABASE_PATH_ZIP ) )
        .on( 'error', reportError )
        .once( 'finish', extractDBZipFile );
}
function extractDBZipFile() {
    reportLog(`Saved. Extracting ${DATABASE_PATH_ZIP} to ${DATABASE_PATH_FOLDER}/`);

    FileSystem
        .createReadStream( DATABASE_PATH_ZIP )
        .pipe( Unzip({ path: DATABASE_PATH_FOLDER }) )
        .on( 'error', reportError )
        .once( 'close', batchProcess.openDBCleanItAndSaveToFile );
}
/////////////////////////////
/*
    Create DATABASE_NAME from DATABASE_PATH_ZIP 
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
        reportLog(`Database extracted. Building ${DATABASE_NAME}`);
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
                //this.openFileReturnObject( file, fileName, fileName === 'Device'? this.TREE.DEVICE : this.TREE.EXTRAS, fileNumber.replace( UA_OR_JSON, '' ) );
                this.openFileReturnObject( file, fileName, fileName === 'Device'? this.TREE.DEVICE : this.TREE.EXTRAS, fileNumber.replace( /\.json/, '' ) );
            } else {
               if ( file.includes( '.json' ) ) {
                 this.openJSONFile( file );
               } else {
                 this.unitProcessed();
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
        // reportLog( ( this.itemsFinished / this.directory.length * 100 ).toFixed(2) + '%\r' );
    },
    openFileReturnObject( file, fileName, hashMap, fileNumber ) {
        fileName;
        FileSystem.readFile(`${ DATABASE_PATH_FOLDER }/${ file }`, function( error, buffer ) {
            if ( error !== null ) {
                return reportError( error );
            }
            const obj = JSON.parse( buffer );
            const databaseEntry = obj;

            if ( Object.keys( JSON.stringify( databaseEntry ) ).length !== 0 ) {
                hashMap[ fileNumber ] = databaseEntry;
            }
            batchProcess.unitProcessed();
        });
    },
    processingComplete() {
        FileSystem.writeFile( DATABASE_NAME + '.tmp', stringifyDeterminstically( this.TREE ), function( error ) {
            if ( error === null ) {
                reportLog('Database file written');
                FileSystem.rename(DATABASE_NAME + '.tmp', DATABASE_NAME, function(error) {
                    if ( error === null ) {
                        reportLog(`${DATABASE_NAME} has been updated. Restart your app or workers so that they use the new database`);
                    } else {
                        reportError(`User-Agent-Parser: ERROR: ${ error }`);
                    }
                });
            } else {
                reportError(`User-Agent-Parser: ERROR: ${ error }`);
            }
        });
        this.cleanup();
    },
    openJSONFile( file ) {
        FileSystem.readFile(`${ DATABASE_PATH_FOLDER }/${ file }`, function( error, buffer ) {
            if ( error === null ) {
                const treeName = file.replace( /\.json/, '' );
                const json = JSON.parse( buffer );

                // Convert objects to arrays
                const convert = function convert( x ) {
                    if (x.constructor.name === 'Object') {
                        return Object.keys(x).map( k => [k, convert(x[k])]);
                    } else if (x.constructor.name === 'Array') {
                        return x.map(v => convert(v));
                    }
                    return x;
                };
                batchProcess.TREE[ treeName ] = convert(json);
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
        ExecuteLinuxCommand(`rm ${ DATABASE_PATH_ZIP } & rm -r ${ DATABASE_PATH_FOLDER }`);
    }
};
(function() {
    const client = JSON.parse( process.argv[2] );

    VERBOSE = client.config.verbose;
    DATABASE_NAME = __dirname + `/${ client.config.free === true? 'community': ''}database.json`;
    DATABASE_PATH_ZIP = DATABASE_NAME + '.zip';
    DATABASE_PATH_FOLDER = `${__dirname}/${ client.config.free === true? 'community': ''}database-files`;
    if (process.env.HANDSET_DETECT_MOCK_DOWNLOAD_PATH) {
        MOCK_DOWNLOAD_PATH = `${process.env.HANDSET_DETECT_MOCK_DOWNLOAD_PATH}/${client.config.free === true? 'community': ''}ultimate.zip`;
    }
    Object.assign( REQUEST_OPTIONS, client.requestOptions );
    /* update the database   every 3 days */
    setInterval( downloadUpdatedDB, 2.592e8 );
    /* if there is no database, fetch and create one */
    FileSystem.readFile( DATABASE_NAME, function( error ) {
        if ( error !== null ) {
            downloadUpdatedDB();
        }
    });
})();
