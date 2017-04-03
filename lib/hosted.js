'use strict';
const TRAVERSAL_ORDER = [ '0', '1', 'browser', 'platform' ];
const EXTRAS_FILTER = new RegExp( ' |[^(\x20-\x7F)]*', 'g' );
const DEVICE_UA_FILTER = new RegExp( /_| |#|-|,|\.|\/|:|"|'/.source + '|[^(\x20-\x7F)]*', 'g' );
const CACHE = {};
const TREE = JSON.parse( require('fs').readFileSync(`${ __dirname }/database.json`) );

function parse( userAgent ) {
    const lowerCaseUA = userAgent.toLowerCase();

    if ( CACHE[ lowerCaseUA ] !== undefined ) {
        return CACHE[ lowerCaseUA ];
    }

    let parsedUserAgent;

    for ( let i = 0, j = TRAVERSAL_ORDER.length, rootNode, branch,
            normalizedUA = lowerCaseUA.replace( DEVICE_UA_FILTER , '' ),
            filter, path, leaf, extraInfo, order, indexFound;
            i < j;
            i++
        ) {
        rootNode = TRAVERSAL_ORDER[i];
        branch = TREE[ rootNode ];
        indexFound = undefined;

        if ( rootNode === 'browser' ) {
            normalizedUA = lowerCaseUA.replace( EXTRAS_FILTER, '' );
        }

        for ( let i = 0, j = branch.length; i < j; i++ ) {
            order = branch[i];

            for ( filter in order ) {
                if ( normalizedUA.includes( filter ) === true ) {
                    path = order[ filter ];

                    for ( leaf in path ) {
                        if ( normalizedUA.includes( leaf ) === true ) {
                            switch( rootNode ) {
                                case '0': {
                                    i++;
                                }
                                /*falls through*/
                                case '1': {
                                    parsedUserAgent = Object.assign( {}, path[ leaf ] );
                                    break;
                                }
                                case 'browser':
                                case 'platform': {
                                    extraInfo = path[ leaf ];

                                    if ( parsedUserAgent === undefined ) {
                                        parsedUserAgent = {};
                                    }

                                    for ( filter in extraInfo ) {
                                        parsedUserAgent[ filter ] = extraInfo[ filter ];
                                    }
                                    break;
                                }
                            }
                            // if you found the correct data point
                            // break out of the loop
                            indexFound = true;
                            break;
                        }
                    }
                }
                // if the correct data point has been found
                // then exit out of this loop
                if ( indexFound === true ) {
                    break;
                }
            }
        }
    }
    if ( parsedUserAgent !== undefined ) {
        CACHE[ lowerCaseUA ] = parsedUserAgent;
        return parsedUserAgent;
    }
}
module.exports = function() {
    return parse;
};