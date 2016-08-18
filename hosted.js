'use strict';
const TRAVERSAL_ORDER = ['0','1','browser','platform'];
const EXTRAS_FILTER = new RegExp( ' |[^(\x20-\x7F)]*', 'g' );
const DEVICE_UA_FILTER = new RegExp( /_| |#|-|,|\.|\/|:|"|'/.source + '|[^(\x20-\x7F)]*', 'g' );
const LRU_CACHE = require('lru-cache')( 100e3 );
const LRU_GET = LRU_CACHE.get.bind( LRU_CACHE );
const LRU_SET = LRU_CACHE.set.bind( LRU_CACHE );
let TREE = {};

function traverseTree( userAgent ) {
	const lowerCaseUserAgent = userAgent.toLowerCase();
	let normalizedUserAgent = lowerCaseUserAgent.replace( DEVICE_UA_FILTER , '' );
	let parsedUserAgent;

	for ( let i = 0, j = TRAVERSAL_ORDER.length, rootNode, branch, indexFound, node, path, leaf, extraInfo; i < j; i++ ) {
		rootNode = TRAVERSAL_ORDER[i];
		branch = TREE[ rootNode ];
		indexFound = undefined;

		if ( rootNode === 'browser' ) {
			normalizedUserAgent = lowerCaseUserAgent.replace( EXTRAS_FILTER, '' );
		}

		for ( node in branch ) {
			if ( normalizedUserAgent.includes( node ) === true ) {
				path = branch[ node ];

				for ( leaf in path ) {
					if ( normalizedUserAgent.includes( leaf ) === true ) {
						indexFound = true;

						switch( rootNode ) {
							case '0':
								i++;
								/*falls through*/
							case '1':
								parsedUserAgent = path[ leaf ];
								break;
							case 'browser':
							case 'platform':
								extraInfo = path[ leaf ];
								// console.log( extraInfo );
								if ( parsedUserAgent === undefined ) {
									parsedUserAgent = {};
								}
								for ( node in extraInfo ) {
									parsedUserAgent[ node ] = extraInfo[ node ];
								}
							break;
						}
						// console.log({
						//     rootNode: rootNode,
						//     node: node,
						//     leaf: leaf
						// });
						break;
					}
				}
			}
			if ( indexFound === true ) {
				break;
			}
		}
	}
	if ( parsedUserAgent !== undefined ) {
		process.nextTick( LRU_SET, userAgent, parsedUserAgent );
		return parsedUserAgent;
	}
}

function lookUp( userAgent ) {
	if ( !LRU_GET(userAgent) ) {
		console.log('traverseTree', userAgent);
	} else {
		console.log( 'cache-hit', userAgent, LRU_GET(userAgent) );
	}
	return LRU_GET( userAgent ) || traverseTree( userAgent );
}

module.exports = function( DATABASE_NAME ) {
	let loadDatabase = function( databaseName ) {
		try {
			TREE = JSON.parse( require('fs').readFileSync( __dirname + databaseName, 'utf8' ) );
		} catch( error ) {
			// console.log( databaseName, error );
			if ( databaseName === '/database.json' ) {
    			console.error( new Date().toISOString(), 'User-Agent-Parser: ERROR: Loading database. Reinstall this npm module' );
			} else {
				loadDatabase('/database.json');
			}
		}
	};
	loadDatabase( DATABASE_NAME );
	return lookUp;
};