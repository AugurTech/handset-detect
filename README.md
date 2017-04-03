[![npm version](https://badge.fury.io/js/handset-detect.svg)](https://badge.fury.io/js/handset-detect)
[![Build Status](https://travis-ci.org/AugurTech/handset-detect.svg?branch=master)](https://travis-ci.org/AugurTech/handset-detect)
[![Dependency Status][david-image]][david-url]
[![devDependency Status][david-dev-image]][david-dev-url]

# High-peformance userAgent parser

A light-weight, high-performance userAgent parser that detects >50 browsers, ~40 OS's, >35,000 devices, bots, smart TVs, gaming consoles, and more. Optimized for Node.js.

#### Capabilities
###### browser detection
* 56 distinct browsers
* 1,179 browser versions
###### operating system detection
* 38 distinct operating systems detectable
* 359 OS versions
###### devices detection
* `35,156 devices` from `3,281 device manufacturers`
* Including `754 bots`, `14 cameras`, `12 computer devices`, `31 gaming consoles`, `1 glass device`, `25,035 mobile devices`, `30 netbooks`, `136 set-top-boxes`, `9,126 tablets`, `15 smart-tvs`, `2 smart-watches`

#### and more...
See the full list of devices you can detect at https://www.handsetdetection.com/properties


## How to use
```javascript
// load the library
const userAgentParser = require('handset-detect')({ free: true });
// have a userAgent? pump it into the library
const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';
// like this
userAgentParser( userAgent );
// returns an obj or undefined
```
### Sample response
```javascript
/*
    The object returned looks like this...
    NOTES:
        general_vendor === 'device maker'
        general_model === 'device model name'
        general_platform === 'OS name'
        general_type === 'device type, like PC, Mobile, SmartTV, etc'

    full parsedUA object below:
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
}*/
```
### That's all folks!
You know everything you need to know to rock and roll.

If you want to learn about more advanced usage, continue reading on. Otherwise, pump in those UAs, and get going!

# Performance
The first time you query a userAgent, it'll take a few milliseconds to return results. After that, a cache kicks in --- so the same UA being looked up takes less than 1 ms to return full results.

# Advanced usage
This client is the free version of a premium, enterprise-grade UA parser. If you have an enterprise license, then the following sections are designed for your advanced usage. If you do not have an enterprise API key, then no need to read the sections below, stick to example above and you'll be good to go.

#### Config options
```javascript
// enterprise setup
const config = {
    username: '007', //required to access enterprise
    secret: 'shhh', //required to access enterprise
    module: 'hosted', // required to be either hosted, cloud, or cache
    autoUpdate: false, // optional. for hosted, auto update your database.json file
    verbose: false,   // optional. make the library console.log, for debugging
    onlyLoad: []    // optional. only return the attributes you specify
};
const userAgentParser = require('handset-detect')( config );
```

### module `hosted`
```javascript
const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';

const userAgentParser = require('handset-detect')({
    module: 'hosted', // required
    autoUpdate: true, // optional
    //onlyLoad: ['general_model','general_browser','general_platform'], // optional
    username: 'username', // required
    secret: 'yourSecret' // required
});
// usage:
console.log( userAgentParser( userAgent ) );
// returns undefined if no results
// or returns an obj (see above for a sample response)
```
##### autoUpdate
If enabled, a new event loop is created on the master thread / master event loop. This forked event loop will manage datebase updates for you. A new database is downloaded every 3 days.

### module: `cloud`
```javascript
const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';

const userAgentParser = require('handset-detect')({
    module: 'cloud',
    username: 'userName',
    secret: 'yourSecret'
});

userAgentParser( userAgent, function( error, parsedUA ) {
    console.log({ error, parsedUA });
});
```

### module `caching`
Synchronous caching ability built on the `cloud` module. On cache miss returns null, and then does a `cloud` lookup in the background. Future requests for the same UA will be cached in Redis and in-memory. Redis cache is pulled into memory on process start. Redis cache TTL is set to 20 days.
```javascript
const userAgentParser = require('handset-detect')({
    module: 'cache',
    username: 'userName',
    secret: 'yourSecret'
});

console.log( userAgentParser( userAgent ) ); // => null
console.log( userAgentParser( userAgent ) ); // => actual data
```
[david-image]: https://david-dm.org/augurtech/handset-detect.svg
[david-url]: https://david-dm.org/augurtech/handset-detect
[david-dev-image]: https://david-dm.org/augurtech/handset-detect/dev-status.svg
[david-dev-url]: https://david-dm.org/augurtech/handset-detect#info=devDependencies