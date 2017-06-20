// const hosted = require('../index.js')({
//     verbose: true,
//     secret: process.env.HANDSET_DETECT_SECRET,
//     username: process.env.HANDSET_DETECT_USERNAME,
//     module: 'hosted',
//     autoUpdate: true
// });
// const cloud = require('../index.js')({
//     secret: process.env.HANDSET_DETECT_SECRET,
//     username: process.env.HANDSET_DETECT_USERNAME,
//     module: 'cloud'
// });

// setTimeout( function() {
//    const userAgent =
//     // 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
//     // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/603.2.1 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.1'
//     // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/15.15063'
//     'Mozilla/5.0 (Linux; Android 4.1.2; DROID RAZR Build/9.8.2O-72_VZW-16) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.82 Mobile Safari/537.36'
//     ;
//     // console.time('Lookup');
//     // console.log( hosted( userAgent ) );
//     // console.timeEnd('Lookup');
//     // console.time('Lookup');
//     // console.log( hosted('Mozilla/5.0 (Linux; U; Android 2.0; en-us; Droid Build/ESD20) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17') );
//     // console.timeEnd('Lookup');

//     console.log( hosted( userAgent ) );
//     cloud( userAgent, ( error, data )=> console.log( error, data ) );

//     // process.exit();
// }, 3e3 );