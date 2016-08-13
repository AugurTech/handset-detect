# The most advanced user-agent parser on the planet

See the full list of device's you can detect at http://www.handsetdetection.com/properties

This npm module includes a free UA parser DB and also works with paid-for versions of the DB.

Hit me up @NawarA on GitHub.

Here's how to use the lib:

# Loading the DB in-memory
The database will be loaded in-memory. The in-memory DB can be over 100 MB. If that's too big, then you can shrink the in-memory DB down to 10 MB, by using the config option `useMinData: true`. Using `useMinData` decreases the size of DB, and make the DB return less userAgent insights. To summarize, get every insight on the userAgent with the default setup, or get less insights. Your choice. Either way, query performance is the same.

Performance: the first time you query a userAgent, it'll take a few milliseconds to return results. After that, an LRU cache kicks in -- so the same UA being looked up takes less than 1 millisecond to give you full results. Good code runs in less than a millisecond -- I hope you appreciate the blazing fast performance. Rock on

## To use the free-edition
Just do this:
```javascript
let userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0_1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A523 Safari/8536.25';

const parse = require('handset-detect')({
    hosted: true,
    free: true
});

console.log( parse( userAgent ) );
```
#### NOTE: The first you load this library on your machine
The free-edition comes in a zip and will need to extract itself once. During this process, you'll see the following prompts:

`User-Agent-Parser: No database found. Loading...`

Once the zip is extracted, you'll see:

`User-Agent-Parser: Database extracted`

At this point, the database will process and save a cached version of itself in Redis, so you don't have to repeat this process ever again. Once its done, you'll see:

`User-Agent-Parser: Finished loading. Restart your app or workers so that they use the new database`

At this point, restart your app or server to have the most advanced UA parser...for free. Cheers


## To use the Ultimate (aka paid-for) version of the database

### a normal, single-event-loop node.js app
```javascript
let userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0_1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A523 Safari/8536.25';

const parse = require('handset-detect')({
    hosted: true,
    //useMinData: true,
    autoUpdate: true,
    username: 'username',
    secret: 'yourSecret'
});

console.log( parse( userAgent ) );
```
#### NOTE: autoUpdate automatically downloads the latest version of the premium database, every 3 days.
When it updates the database, you'll see the following prompts:

`User-Agent-Parser: Updating database`

`User-Agent-Parser: Database extracted`

`User-Agent-Parser: Finished loading. Restart your app or workers so that they use the new database`

###If you use node's cluster modules (aka you use multiple event loops)

###On your master event-loop do this:
```javascript
require('handset-detect')({
    hosted: true,
    autoUpdate: true,
    username: 'username',
    secret: 'yourSecret'
});
```
The master event-loop will create a child event-loop which handles database downloads, extractions, and updates. This way, the database never blocks your master or worker event-loops.

###On your worker event-loops:
```javascript
let userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0_1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A523 Safari/8536.25';

const parse = require('handset-detect')({
    hosted: true,
    autoUpdate: true,
    username: 'username',
    secret: 'yourSecret'
});

console.log( parse( userAgent ) );
```

# API-based lookups are easy. Do this:
```javascript
let userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0_1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A523 Safari/8536.25';

const parse = require('handset-detect')({ cloud: true, username: 'userName', secret: 'yourSecret' });

parse( userAgent, function( error, success ) {
    console.log( error, success );
});
```