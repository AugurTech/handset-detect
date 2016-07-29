# handset-detect
An amazing user-agent parsing library supporting a wide range of devices, based on [api.handsetdetection.com]

If there are features you'd like added to this library, please code them and make a pull request! Here's how to use the lib:

# Cloud
Cloud lookups are easy. Do this:
```javascript
const HandSetDetectLookup = require('handset-detect').init({ cloud: true, username: 'userName', secret: 'yourSecret' });

let userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0_1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A523 Safari/8536.25';

HandSetDetect( userAgent, function( error, success ) {
    console.log( error, success );
});
```

# Self-Hosted Database
The self-hosted library needs to load tens of thousands of JSON files into memory. To do this efficiently, we load everything async where possible.

The declaration of the library (```require('handset-detect').init({ hosted: true });```) takes a few milliseconds to load, since its async loading. Meanwhile building and adding the data-structure into memory take a few seconds, since we open, parse, and process >28,000 JSON files into a memory-efficient data-structure. The takeaway, is that the library will be non-blocking on load, but will not be ready for maybe 2 seconds. At that point, all lookups will successfully return data.

A 10,000 item LRU cache is used to cache userAgents to their lookup results. This way, a lookup that takes 20 ms will instead take 0.02 ms to return full search results.

##Single-core Node.js process
```javascript
const EventEmitter = new ( require('events') )();

require('handset-detect').init({
    enableAutoUpdates: true,
    eventEmitter: EventEmitter,
    username: 'username',
    secret: 'yourSecret'
});

EventEmitter.on( 'HandSetDetection database updated', require('handset-detect').reloadLibrary );

const HandSetDetectLookup = require('handset-detect').init({ hosted: true });

let userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0_1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A523 Safari/8536.25';

setTimeout(()=> console.log( lookup( userAgent ), 5e3 );
```

## Multi-core Node.js processes

###For your master process:
```javascript
const Cluster = require('cluster');

const EventEmitter = new ( require('events') )();

require('handset-detect').init({
    enableAutoUpdates: true,
    eventEmitter: EventEmitter,
    username: 'username',
    secret: 'yourSecret'
});

EventEmitter.on( 'HandSetDetection database updated', informWorkersOfDBUpdate );

function informWorkersOfDBUpdate() {
    for ( let id in Cluster.workers ) {
        Cluster.workers[ id ].send('HandSetDetection database updated');
    }
}
```
###For your worker processes:
```javascript
const HandSetDetect = require('handset-detect');
const lookup = HandSetDetect.init({ hosted: true });

process.on( 'message', onMessageFromMaster );

function onMessageFromMaster( message ) {
    switch( message ) {
        case 'HandSetDetection database updated':
            return HandSetDetect.reloadLibrary();
    }
}

let userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0_1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A523 Safari/8536.25';
setTimeout(()=> console.log( lookup( userAgent ), 5e3 );
```