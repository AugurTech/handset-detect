'use strict';
const TRAVERSAL_ORDER = ['0','1','browser','platform'];
const EXTRAS_FILTER = new RegExp( ' |[^(\x20-\x7F)]*', 'g' );
const DEVICE_UA_FILTER = new RegExp( /_| |#|-|,|\.|\/|:|"|'/.source + '|[^(\x20-\x7F)]*', 'g' );
const CACHE = {};
let TREE = {};

function traverseTree( userAgent ) {
	const lowerCaseUserAgent = userAgent.toLowerCase();
	let normalizedUserAgent = lowerCaseUserAgent.replace( DEVICE_UA_FILTER , '' );
	let parsedUserAgent;

	for ( let i = 0, j = TRAVERSAL_ORDER.length, rootNode, branch, indexFound, filter, path, leaf, extraInfo; i < j; i++ ) {
		rootNode = TRAVERSAL_ORDER[i];
		// console.log(i);
		branch = TREE[ rootNode ];
		indexFound = undefined;

		if ( rootNode === 'browser' ) {
			normalizedUserAgent = lowerCaseUserAgent.replace( EXTRAS_FILTER, '' );
		}

		for ( let q = 0, length = branch.length, order; q < length; q++) {
			order = branch[q];

			for ( filter in order ) {
				if ( normalizedUserAgent.includes( filter ) === true ) {
					path = order[ filter ];

					for ( leaf in path ) {
						if ( normalizedUserAgent.includes( leaf ) === true ) {
							indexFound = true;

							switch( rootNode ) {
								case '0':
									i++;
									/*falls through*/
								case '1':
									parsedUserAgent = Object.assign( {}, path[ leaf ] );
									break;
								case 'browser':
								case 'platform':
									extraInfo = path[ leaf ];
									// console.log( extraInfo );
									if ( parsedUserAgent === undefined ) {
										parsedUserAgent = {};
									}
									for ( filter in extraInfo ) {
										parsedUserAgent[ filter ] = extraInfo[ filter ];
									}
									break;
							}
							// console.log({
							//     rootNode: rootNode,
							//     filter: filter,
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
	}
	if ( parsedUserAgent !== undefined ) {
		CACHE[ userAgent ] = parsedUserAgent;
		return parsedUserAgent;
	}
}

function lookUp( userAgent ) {
	return CACHE[ userAgent ] || traverseTree( userAgent );
}

module.exports = function( DATABASE_NAME ) {
	let loadDatabase = function( databaseName ) {
		try {
			TREE = JSON.parse( require('fs').readFileSync( __dirname + databaseName, 'utf8' ) );
		} catch( error ) {
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