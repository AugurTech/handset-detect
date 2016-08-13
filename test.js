'use strict';
let userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';

const HandSetDetect = require('./index.js')({
						// free: true,
                        hosted: true,
                        autoUpdate: true,
                        secret: 'fNY9Hx9ak932Bm37',
                        username: 'ebc9135b8d',
                        useMinData: true
                    });
// require('./index.js')({
//                         // enableAutoUpdates: true,
//                         secret: 'fNY9Hx9ak932Bm37',
//                         username: 'ebc9135b8d',
//                         // hosted: true,
//                         cloud: true
//                     })( userAgent, ( e, data )=> console.log( data ) );

// setInterval(()=>{
// 	console.time('lookup');
// 	let result = HandSetDetect( userAgent );
// 	console.timeEnd('lookup');
// 	console.log( result );
// }, 2e3 );


var cloudJSON = {
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
};