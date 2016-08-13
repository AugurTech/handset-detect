# The most advanced user-agent parser on the planet

See the full list of device's you can detect at http://www.handsetdetection.com/properties

This npm module includes a free UA parser DB and also works with paid-for versions of the DB.

Hit me up @NawarA on GitHub.

Here's how to use the lib:

##Example data this free library returns when parsing userAgents:
```javascript
let userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0_1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A523 Safari/8536.25';

parse( userAgent );
/*
    returns the following:
{
     general_vendor: 'Apple',
     general_model: 'iPhone',
     general_platform: 'iOS',
     general_platform_version: '9.1',
     general_platform_version_max: '3.1.3',
     general_browser: 'Mobile Safari',
     general_browser_version: '',
     general_image: 'appleiphone-1423539120-1.jpg',
     general_aliases: [],
     general_eusar: '0.97',
     general_battery: [ 'Li-Ion 1400 mAh' ],
     general_type: 'Mobile',
     general_cpu: [ 'ARM11', '412MHz' ],
     design_formfactor: 'Bar',
     design_dimensions: '115 x 61 x 11.6',
     design_weight: '135',
     design_antenna: 'Internal',
     design_keyboard: 'Screen',
     design_softkeys: '',
     design_sidekeys: [ 'Volume' ],
     display_type: 'TFT',
     display_color: 'Yes',
     display_colors: '16M',
     display_size: '3.5"',
     display_x: '320',
     display_y: '480',
     display_ppi: 162,
     display_pixel_ratio: '1.0',
     display_other: [ 'Capacitive', 'Touch', 'Multitouch', 'Gorilla Glass' ],
     memory_internal: [ '4GB', '8GB', '16GB RAM' ],
     memory_slot: [],
     network:
      [ 'GSM850',
        'GSM900',
        'GSM1800',
        'GSM1900',
        'Bluetooth 2.0',
        '802.11b',
        '802.11g',
        'GPRS',
        'EDGE' ],
     media_camera: [ '2MP', '1600x1200' ],
     media_secondcamera: [],
     media_videocapture: [],
     media_videoplayback: [ 'MPEG4', 'H.264' ],
     media_audio: [ 'MP3', 'AAC', 'WAV' ],
     media_other: [],
     features:
      [ 'Unlimited entries',
        'Multiple numbers per contact',
        'Picture ID',
        'Ring ID',
        'Calendar',
        'Alarm',
        'Document viewer',
        'Calculator',
        'Timer',
        'Stopwatch',
        'Computer sync',
        'OTA sync',
        'Polyphonic ringtones',
        'Vibration',
        'Phone profiles',
        'Flight mode',
        'Silent mode',
        'Speakerphone',
        'Accelerometer',
        'Voice recording',
        'Light sensor',
        'Proximity sensor',
        'SMS',
        'Threaded viewer',
        'Email',
        'Google Maps',
        'Audio/video player',
        'Games' ],
     connectors: [ 'USB', '3.5mm Audio', 'TV Out' ],
     benchmark_min: 10,
     benchmark_max: 50,
     general_app: '',
     general_app_version: '',
     general_app_category: '',
     general_language: '',
     general_virtual: 0,
     display_css_screen_sizes: [ '320x480' ]
}
    this userAgent parser returns this kind of data on:
    * bots
    * cameras
    * computers
    * gaming consoles
    * wearables
    * mobile devices / smartphones
    * netbooks
    * set-top-boxes
    * smart TVs
    * tablets
    * and more
*/
```

## Using the DB: in-memory option
The database will be loaded in-memory. The in-memory DB can be over 100 MB. If that's too big, then you can shrink the in-memory DB down to 10 MB, by using the config option `useMinData: true`. Using `useMinData` decreases the size of the DB and makes the DB return less data. To summarize, get every insight on the userAgent with the default setup, or get less insights. Your choice. Either way, query performance is the same.

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
#### NOTE: The first time you load this library on your machine
The free-edition comes in a zip and will need to extract itself. During this process, you'll see the following prompts:

`User-Agent-Parser: No database found. Loading...`

Once the zip is extracted, you'll see:

`User-Agent-Parser: Database extracted`

At this point, the database will process and save a cached version of itself in Redis, so you don't have to repeat this process ever again. Once its done, you'll see:

`User-Agent-Parser: Finished loading. Restart your app or workers so that they use the new database`

At this point, restart your app or server to have the most advanced UA parser...for free. Cheers

#####FREE DB UPDATES.
In case you want free database updates, then you can get them by signing up for a free API key. https://app.handsetdetection.com/signup
A free version of the database is already included in this repo / npm module.


## To use the Ultimate (aka paid-for) version of the database

### if you use a normal, single-event-loop node.js app
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

## Using the DB: API-based lookups are easy. Do this:
```javascript
let userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0_1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A523 Safari/8536.25';

const parse = require('handset-detect')({ cloud: true, username: 'userName', secret: 'yourSecret' });

parse( userAgent, function( error, success ) {
    console.log( error, success );
});
```