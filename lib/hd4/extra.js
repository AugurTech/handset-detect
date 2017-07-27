/*
** Copyright (c) Richard Uren 2012 - 2015 <richard@teleport.com.au>
** All Rights Reserved
**
** --
**
** LICENSE: Redistribution and use in source and binary forms, with or
** without modification, are permitted provided that the following
** conditions are met: Redistributions of source code must retain the
** above copyright notice, this list of conditions and the following
** disclaimer. Redistributions in binary form must reproduce the above
** copyright notice, this list of conditions and the following disclaimer
** in the documentation and/or other materials provided with the
** distribution.
**
** THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESS OR IMPLIED
** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
** NO EVENT SHALL CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
** INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
** BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS
** OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
** ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
** TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
** USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
** DAMAGE.
**
*/

const HDBase = require('./base');

class HDExtra extends HDBase {

  constructor(tree) {
    super(tree);
    this.data = null;
  }

  set(data) { this.data = data; }

  /**
   * Matches all HTTP header extras - platform, browser and app
   *
   * @param string cls Is 'platform','browser' or 'app'
   * @return an Extra on success, false otherwise
   **/
  matchExtra(cls, headers) {
    delete headers.profile;

    let order = this.detectionConfig[cls + '-ua-order'];
    let keys = Object.keys(headers);

    for(let key of keys) {
      // Append any x- headers to the list of headers to check
      if (!order.includes(key) && key.match(/^x-/i)) {
        order.push(key);
      }
    }

    for(let field of order) {
      if (headers[field]) {
        let _id = this.getMatch('user-agent', headers[field], cls, field, cls);
        if (_id) {
          let extra = this.findById(_id);
          return extra;
        }
      }
    }
    return false;
  }

  /**
   * Find a device by its id
   *
   * @param string _id
   * @return array device on success, false otherwise
   **/
  findById(_id) {
    return JSON.parse(JSON.stringify(this.tree.EXTRAS[_id]));
  }

  /**
   * Can learn language from language header or agent
   *
   * @param object headers A key => value array of sanitized http headers
   * @return array Extra on success, false otherwise
   **/
  matchLanguage(headers) {
    let extra = {
      _id: 0,
      Extra: {
        hd_specs: {
          general_language: '',
          general_language_full: ''
        }
      }
    };

    // Try directly from http header first
    if (headers.language) {
      let candidate = headers.language;
      if (Object.keys(this.detectionLanguages).includes(candidate) && this.detectionLanguages[candidate]) {
        extra.Extra.hd_specs.general_language =  candidate;
        extra.Extra.hd_specs.general_language_full = this.detectionLanguages[candidate];
        return extra;
      }
    }
    let checkOrder = this.detectionConfig['language-ua-order'].concat(Object.keys(headers));
    let languageList = this.detectionLanguages;
    for(let header of checkOrder) {
      let agent = headers[header];
      if (agent) {
        for(let code in languageList) {
          let full = languageList[code];
          if (agent.includes(code) && agent.match(new RegExp('[; \(]' + code + '[; \)]', 'i'))) {
            extra.Extra.hd_specs.general_language =  code;
            extra.Extra.hd_specs.general_language_full =  full;
            return extra;
          }
        }
      }
    }
    return false;
  }

  /**
   * Returns false if this device definitively cannot run this platform and platform version.
   * Returns true if its possible of if there is any doubt.
   *
   * Note : The detected platform must match the device platform. This is the stock OS as shipped
   * on the device. If someone is running a variant (eg CyanogenMod) then all bets are off.
   *
   * @param string specs The specs we want to check.
   * @return boolean false if these specs can not run the detected OS, true otherwise.
   **/
  verifyPlatform(specs=null) {
    let platform = this.data;
    let platformName = platform ? platform.Extra.hd_specs.general_platform.toLowerCase().trim() : '';
    let platformVersion = platform ? platform.Extra.hd_specs.general_platform_version.toLowerCase().trim() : '';
    let devicePlatformName = specs.general_platform.toLowerCase().trim();
    let devicePlatformVersionMin = specs.general_platform_version.toLowerCase().trim();
    let devicePlatformVersionMax = specs.general_platform_version_max.toLowerCase().trim();

    // Its possible that we didnt pickup the platform correctly or the device has no platform info
    // Return true in this case because we cant give a concrete false (it might run this version).
    if (!platform || !platformName || !devicePlatformName) {
      return true;
    }

    // Make sure device is running stock OS / Platform
    // Return true in this case because its possible the device can run a different OS (mods / hacks etc..)
    if (platformName !== devicePlatformName) {
      return true;
    }

    // Detected version is lower than the min version - so definetly false.
    if (platformVersion && devicePlatformVersionMin && this.comparePlatformVersions(platformVersion, devicePlatformVersionMin) <= -1) {
      return false;
    }

    // Detected version is greater than the max version - so definetly false.
    if (platformVersion && devicePlatformVersionMax && this.comparePlatformVersions(platformVersion, devicePlatformVersionMax) >= 1) {
      return false;
    }

    // Maybe Ok ..
    return true;
  }

  /**
   * Breaks a version number apart into its Major, minor and point release numbers for comparison.
   *
   * Big Assumption : That version numbers separate their release bits by '.' !!!
   * might need to do some analysis on the string to rip it up right.
   *
   * @param string versionNumber
   * @return array of ('major' => x, 'minor' => y and 'point' => z) on success, null otherwise
   **/
  breakVersionApart(versionNumber) {
    let tmp = (versionNumber + '.0.0.0').split('.');
    let reply = {};
    reply.major = tmp[0] !== '' ? tmp[0] : '0';
    reply.minor = tmp[1] !== '' ? tmp[1] : '0';
    reply.point = tmp[2] !== '' ? tmp[2] : '0';
    return reply;
  }

  /**
   * Helper for comparing two strings (numerically if possible)
   *
   * @param string a Generally a number, but might be a string
   * @param string b Generally a number, but might be a string
   * @return int
   **/
  compareSmartly(a, b) {
    let ia = parseInt(a);
    let ib = parseInt(b);
    return (!isNaN(ia) && !isNaN(ib)) ? ia - ib : a.localeCompare(b);
  }

  /**
   * Compares two platform version numbers
   *
   * @param string va Version A
   * @param string vb Version B
   * @return < 0 if a < b, 0 if a == b and > 0 if a > b : Also returns 0 if data is absent from either.
   */
  comparePlatformVersions(va, vb) {
    if (va === '' || vb === '') {
      return 0;
    }
    let versionA = this.breakVersionApart(va);
    let versionB = this.breakVersionApart(vb);
    let major = this.compareSmartly(versionA.major, versionB.major);
    let minor = this.compareSmartly(versionA.minor, versionB.minor);
    let point = this.compareSmartly(versionA.point, versionB.point);
    if (major) {
      return major;
    }
    if (minor) {
      return minor;
    }
    if (point) {
      return point;
    }
    return 0;
  }
}

module.exports = HDExtra;
