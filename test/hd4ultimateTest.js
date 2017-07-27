/* globals it*/
'use strict';
const assert = require('assert');
const assertEqual = assert.deepStrictEqual;

module.exports = function (handsetDetect) {
  it('Windows PC running Chrome (HTTP)', function(done) {
    const res = handsetDetect({
      'user-agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
    });
    assertEqual(typeof res, 'object');
    assertEqual(res.hd_specs.general_type, 'Computer');
    done();
  });
  it('Junk user-agent (HTTP)', function(done) {
    const res = handsetDetect({
      'user-agent': 'aksjakdjkjdaiwdidjkjdkawjdijwidawjdiajwdkawdjiwjdiawjdwidjwakdjajdkad',
    });
    assertEqual(typeof res, 'undefined');
    done();
  });
  it('Wii (HTTP)', function(done) {
    const res = handsetDetect({
      'user-agent': 'Opera/9.30 (Nintendo Wii; U; ; 2047-7; es-Es)',
    });
    assertEqual(typeof res, 'object');
    assertEqual(res.hd_specs.general_type, 'Console');
    done();
  });
  it('iPhone (HTTP)', function(done) {
    const res = handsetDetect({
      'user-agent': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3 like Mac OS X; en-gb) AppleWebKit/533.17.9 (KHTML, like Gecko)',
    });
    assertEqual(typeof res, 'object');
    assertEqual(res.hd_specs.general_type, 'Mobile');
    assertEqual(res.hd_specs.general_vendor, 'Apple');
    assertEqual(res.hd_specs.general_model, 'iPhone');
    assertEqual(res.hd_specs.general_platform, 'iOS');
    assertEqual(res.hd_specs.general_platform_version, '4.3');
    assertEqual(res.hd_specs.general_language, 'en-gb');
    assert(res.hd_specs.hasOwnProperty('display_pixel_ratio'));
    assert(res.hd_specs.hasOwnProperty('display_ppi'));
    assert(res.hd_specs.hasOwnProperty('benchmark_min'));
    assert(res.hd_specs.hasOwnProperty('benchmark_max'));
    done();
  });
  it('iPhone - user-agent in random other header (HTTP)', function(done) {
    const res = handsetDetect({
      'user-agent': 'blahblahblah',
      'x-fish-header': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3 like Mac OS X; en-gb) AppleWebKit/533.17.9 (KHTML, like Gecko)',
    });
    assertEqual(typeof res, 'object');
    assertEqual(res.hd_specs.general_type, 'Mobile');
    assertEqual(res.hd_specs.general_vendor, 'Apple');
    assertEqual(res.hd_specs.general_model, 'iPhone');
    assertEqual(res.hd_specs.general_platform, 'iOS');
    assertEqual(res.hd_specs.general_platform_version, '4.3');
    assertEqual(res.hd_specs.general_language, 'en-gb');
    assert(res.hd_specs.hasOwnProperty('display_pixel_ratio'));
    assert(res.hd_specs.hasOwnProperty('display_ppi'));
    assert(res.hd_specs.hasOwnProperty('benchmark_min'));
    assert(res.hd_specs.hasOwnProperty('benchmark_max'));
    done();
  });
  it('iPhone 3GS (same UA as iPhone 3G, different x-local-hardwareinfo header) (HTTP, Hardware Info)', function(done) {
    const res = handsetDetect({
      'user-agent': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_2_1 like Mac OS X; en-gb) AppleWebKit/533.17.9 (KHTML, like Gecko)',
      'x-local-hardwareinfo': '320:480:100:100',
    });
    assertEqual(typeof res, 'object');
    assertEqual(res.hd_specs.general_type, 'Mobile');
    assertEqual(res.hd_specs.general_vendor, 'Apple');
    assertEqual(res.hd_specs.general_model, 'iPhone 3GS');
    assertEqual(res.hd_specs.general_platform, 'iOS');
    assertEqual(res.hd_specs.general_platform_version, '4.2.1');
    assertEqual(res.hd_specs.general_language, 'en-gb');
    assert(res.hd_specs.hasOwnProperty('display_pixel_ratio'));
    assert(res.hd_specs.hasOwnProperty('display_ppi'));
    assert(res.hd_specs.hasOwnProperty('benchmark_min'));
    assert(res.hd_specs.hasOwnProperty('benchmark_max'));
    done();
  });
  it('iPhone 3G (same UA as iPhone 3GS, different x-local-hardwareinfo header) (HTTP, Hardware Info B)', function(done) {
    const res = handsetDetect({
      'user-agent': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_2_1 like Mac OS X; en-gb) AppleWebKit/533.17.9 (KHTML, like Gecko)',
      'x-local-hardwareinfo': '320:480:100:72',
    });
    assertEqual(typeof res, 'object');
    assertEqual(res.hd_specs.general_type, 'Mobile');
    assertEqual(res.hd_specs.general_vendor, 'Apple');
    assertEqual(res.hd_specs.general_model, 'iPhone 3G');
    assertEqual(res.hd_specs.general_platform, 'iOS');
    assertEqual(res.hd_specs.general_platform_version, '4.2.1');
    assertEqual(res.hd_specs.general_language, 'en-gb');
    assert(res.hd_specs.hasOwnProperty('display_pixel_ratio'));
    assert(res.hd_specs.hasOwnProperty('display_ppi'));
    assert(res.hd_specs.hasOwnProperty('benchmark_min'));
    assert(res.hd_specs.hasOwnProperty('benchmark_max'));
    done();
  });
  it('iPhone - Crazy benchmark (eg from emulated desktop) with outdated OS (HTTP, Hardware Info C)', function(done) {
    const res = handsetDetect({
      'user-agent': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 2_0 like Mac OS X; en-gb) AppleWebKit/533.17.9 (KHTML, like Gecko)',
      'x-local-hardwareinfo': '320:480:200:1200',
    });
    assertEqual(typeof res, 'object');
    assertEqual(res.hd_specs.general_type, 'Mobile');
    assertEqual(res.hd_specs.general_vendor, 'Apple');
    assertEqual(res.hd_specs.general_model, 'iPhone 3G');
    assertEqual(res.hd_specs.general_platform, 'iOS');
    assertEqual(res.hd_specs.general_platform_version, '2.0');
    assertEqual(res.hd_specs.general_language, 'en-gb');
    assert(res.hd_specs.hasOwnProperty('display_pixel_ratio'));
    assert(res.hd_specs.hasOwnProperty('display_ppi'));
    assert(res.hd_specs.hasOwnProperty('benchmark_min'));
    assert(res.hd_specs.hasOwnProperty('benchmark_max'));
    done();
  });
  it('Detection test user-agent has been encoded with plus for space. (HTTP)', function(done) {
    const res = handsetDetect({
      'user-agent': 'Mozilla/5.0+(Linux;+Android+5.1.1;+SM-J110M+Build/LMY48B;+wv)+AppleWebKit/537.36+(KHTML,+like+Gecko)+Version/4.0+Chrome/47.0.2526.100+Mobile+Safari/537.36',
    });
    assertEqual(typeof res, 'object');
    assertEqual(res.hd_specs.general_type, 'Mobile');
    assertEqual(res.hd_specs.general_vendor, 'Samsung');
    assertEqual(res.hd_specs.general_model, 'SM-J110M');
    assertEqual(res.hd_specs.general_platform, 'Android');
    assertEqual(res.hd_specs.general_platform_version, '5.1.1');
    done();
  });
  it('iPhone 5s running Facebook 9.0 app (hence no general_browser set). (HTTP, FB iOS)', function(done) {
    const res = handsetDetect({
      'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_1_1 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Mobile/11D201 [FBAN/FBIOS;FBAV/9.0.0.25.31;FBBV/2102024;FBDV/iPhone6,2;FBMD/iPhone;FBSN/iPhone OS;FBSV/7.1.1;FBSS/2; FBCR/vodafoneIE;FBID/phone;FBLC/en_US;FBOP/5]',
      'Accept-Language': 'da, en-gb;q=0.8, en;q=0.7',
    });
    assertEqual(typeof res, 'object');
    assertEqual(res.hd_specs.general_type, 'Mobile');
    assertEqual(res.hd_specs.general_vendor, 'Apple');
    assertEqual(res.hd_specs.general_model, 'iPhone 5S');
    assertEqual(res.hd_specs.general_platform, 'iOS');
    assertEqual(res.hd_specs.general_platform_version, '7.1.1');
    assertEqual(res.hd_specs.general_language, 'da');
    assertEqual(res.hd_specs.general_language_full, 'Danish');
    assertEqual(res.hd_specs.general_app, 'Facebook');
    assertEqual(res.hd_specs.general_app_version, '9.0');
    assertEqual(res.hd_specs.general_browser, '');
    assertEqual(res.hd_specs.general_browser_version, '');
    assert(res.hd_specs.hasOwnProperty('display_pixel_ratio'));
    assert(res.hd_specs.hasOwnProperty('display_ppi'));
    assert(res.hd_specs.hasOwnProperty('benchmark_min'));
    assert(res.hd_specs.hasOwnProperty('benchmark_max'));
    done();
  });
  it('Android version is not supplied in UA & device base profile has more info than detected platform result (No platform overlay)', function(done) {
    const res = handsetDetect({
      'user-agent': 'Mozilla/5.0 (Linux; U; Android; en-ca; GT-I9500 Build) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
    });
    assertEqual(typeof res, 'object');
    assertEqual(res.hd_specs.general_type, 'Mobile');
    assertEqual(res.hd_specs.general_vendor, 'Samsung');
    assertEqual(res.hd_specs.general_model, 'GT-I9500');
    assertEqual(res.hd_specs.general_platform, 'Android');
    assertEqual(res.hd_specs.general_platform_version, '4.2.2');
    done();
  });
  it('Samsung GT-I9500 Native - Note : Device shipped with Android 4.2.2, so this device has been updated. (BI, Android)', function(done) {
    const res = handsetDetect({
      'ro.build.PDA': 'I9500XXUFNE7',
      'ro.build.changelist': '699287',
      'ro.build.characteristics': 'phone',
      'ro.build.date.utc': '1401287026',
      'ro.build.date': 'Wed May 28 23:23:46 KST 2014',
      'ro.build.description': 'ja3gxx-user 4.4.2 KOT49H I9500XXUFNE7 release-keys',
      'ro.build.display.id': 'KOT49H.I9500XXUFNE7',
      'ro.build.fingerprint': 'samsung/ja3gxx/ja3g:4.4.2/KOT49H/I9500XXUFNE7:user/release-keys',
      'ro.build.hidden_ver': 'I9500XXUFNE7',
      'ro.build.host': 'SWDD5723',
      'ro.build.id': 'KOT49H',
      'ro.build.product': 'ja3g',
      'ro.build.tags': 'release-keys',
      'ro.build.type': 'user',
      'ro.build.user': 'dpi',
      'ro.build.version.codename': 'REL',
      'ro.build.version.incremental': 'I9500XXUFNE7',
      'ro.build.version.release': '4.4.2',
      'ro.build.version.sdk': '19',
      'ro.product.board': 'universal5410',
      'ro.product.brand': 'samsung',
      'ro.product.cpu.abi2': 'armeabi',
      'ro.product.cpu.abi': 'armeabi-v7a',
      'ro.product.device': 'ja3g',
      'ro.product.locale.language': 'en',
      'ro.product.locale.region': 'GB',
      'ro.product.manufacturer': 'samsung',
      'ro.product.model': 'GT-I9500',
      'ro.product.name': 'ja3gxx',
      'ro.product_ship': 'true',
    });
    assertEqual(typeof res, 'object');
    assertEqual(res.hd_specs.general_type, 'Mobile');
    assertEqual(res.hd_specs.general_vendor, 'Samsung');
    assertEqual(res.hd_specs.general_model, 'GT-I9500');
    assertEqual(res.hd_specs.general_platform, 'Android');
    assertEqual(res.hd_specs.general_platform_version, '4.4.2');
    assertEqual(res.hd_specs.general_aliases[0], 'Samsung Galaxy S4');
    done();
  });
  it('Detection test Samsung GT-I9500 Native - Note : Device shipped with Android 4.2.2, so this device has been updated. (BI, Android, updated OS)', function(done) {
    const res = handsetDetect({
      'ro.build.id': 'KOT49H',
      'ro.build.version.release': '5.2',
      'ro.build.version.sdk': '19',
      'ro.product.brand': 'samsung',
      'ro.product.model': 'GT-I9500',
    });
    assertEqual(typeof res, 'object');
    assertEqual(res.hd_specs.general_type, 'Mobile');
    assertEqual(res.hd_specs.general_vendor, 'Samsung');
    assertEqual(res.hd_specs.general_model, 'GT-I9500');
    assertEqual(res.hd_specs.general_platform, 'Android');
    assertEqual(res.hd_specs.general_platform_version, '5.2');
    assertEqual(res.hd_specs.general_aliases[0], 'Samsung Galaxy S4');
    done();
  });
  it('Detection test Samsung GT-I9500 Native - Note : Device shipped with Android 4.2.2 (BI, Android, default OS)', function(done) {
    const res = handsetDetect({
      'ro.product.brand': 'samsung',
      'ro.product.model': 'GT-I9500',
    });
    assertEqual(typeof res, 'object');
    assertEqual(res.hd_specs.general_type, 'Mobile');
    assertEqual(res.hd_specs.general_vendor, 'Samsung');
    assertEqual(res.hd_specs.general_model, 'GT-I9500');
    assertEqual(res.hd_specs.general_platform, 'Android');
    assertEqual(res.hd_specs.general_platform_version, '4.2.2');
    assertEqual(res.hd_specs.general_aliases[0], 'Samsung Galaxy S4');
    done();
  });
  it('iPhone 4S Native (BI, iOS)', function(done) {
    const res = handsetDetect({
      'utsname.machine': 'iphone4,1',
      'utsname.brand': 'Apple',
    });
    assertEqual(typeof res, 'object');
    assertEqual(res.hd_specs.general_type, 'Mobile');
    assertEqual(res.hd_specs.general_vendor, 'Apple');
    assertEqual(res.hd_specs.general_model, 'iPhone 4S');
    assertEqual(res.hd_specs.general_platform, 'iOS');
    // Default shipped version in the absence of any version information
    assertEqual(res.hd_specs.general_platform_version, '5.0');
    done();
  });
  it('iPhone 4S Native (BI, iOS, overlay platform)', function(done) {
    const res = handsetDetect({
      'utsname.machine': 'iphone4,1',
      'utsname.brand': 'Apple',
      'uidevice.systemversion': '5.1',
      'uidevice.systemname': 'iphone os',
    });
    assertEqual(typeof res, 'object');
    assertEqual(res.hd_specs.general_type, 'Mobile');
    assertEqual(res.hd_specs.general_vendor, 'Apple');
    assertEqual(res.hd_specs.general_model, 'iPhone 4S');
    assertEqual(res.hd_specs.general_platform, 'iOS');
    assertEqual(res.hd_specs.general_platform_version, '5.1');
    done();
  });
  it('Windows Phone Native Nokia Lumia 1020 (A)', function(done) {
    const res = handsetDetect({
      'devicemanufacturer': 'nokia',
      'devicename': 'RM-875',
    });
    assertEqual(typeof res, 'object');
    assertEqual(res.hd_specs.general_type, 'Mobile');
    assertEqual(res.hd_specs.general_vendor, 'Nokia');
    assertEqual(res.hd_specs.general_model, 'RM-875');
    assertEqual(res.hd_specs.general_platform, 'Windows Phone');
    assertEqual(res.hd_specs.general_platform_version, '8.0');
    assertEqual(res.hd_specs.display_ppi, 326);
    done();
  });
  it('Windows Phone Native Nokia Lumia 1020 (B)', function(done) {
    const res = handsetDetect({
      'devicemanufacturer': 'nokia',
      'devicename': 'RM-875',
      'osname': 'windows phone',
      'osversion': '8.1',
    });
    assertEqual(typeof res, 'object');
    assertEqual(res.hd_specs.general_type, 'Mobile');
    assertEqual(res.hd_specs.general_vendor, 'Nokia');
    assertEqual(res.hd_specs.general_model, 'RM-875');
    assertEqual(res.hd_specs.general_platform, 'Windows Phone');
    assertEqual(res.hd_specs.general_platform_version, '8.1');
    assertEqual(res.hd_specs.display_ppi, 326);
    done();
  });
  it('iPhone  6 (BI, overlay)', function(done) {
    const res = handsetDetect({
      'utsname.brand': 'apple',
      'utsname.machine': 'iPhone7,2',
      'UIDevice.systemVersion': '9.2',
      'UIDevice.systemName': 'iPhone OS',
    });
    assertEqual(typeof res, 'object');
    assertEqual(res.hd_specs.general_type, 'Mobile');
    assertEqual(res.hd_specs.general_vendor, 'Apple');
    assertEqual(res.hd_specs.general_model, 'iPhone 6');
    assertEqual(res.hd_specs.general_platform, 'iOS');
    assertEqual(res.hd_specs.general_platform_version, '9.2');
    done();
  });
};
