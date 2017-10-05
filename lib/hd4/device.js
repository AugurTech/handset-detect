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
const HDExtra = require('./extra');
const DETECTIONV4_STANDARD = 0;
const DETECTIONV4_GENERIC= 1;

class HDDevice extends HDBase {
 
  constructor(tree) {
    super(tree);
    this.device = null;
    this.platform = null;
    this.browser = null;
    this.app = null;
    this.ratingResult = null;
    this.deviceHeaders = {};
    this.extraHeaders = {};
    this.Extra = new HDExtra(tree);
  }

  /**
    * Perform a local detection
   *
   * @param object headers HTTP headers as an assoc array. keys are standard http header names eg user-agent, x-wap-profile
   * @return bool true on success, false otherwise
   */
  localDetect(headersArg) {
    this.device = null;
    this.platform = null;
    this.browser = null;
    this.app = null;
    this.ratingResult = null;
    this.detectedRuleKey = {};
    this.reply = {};
    this.reply.status = 0;
    this.reply.message = '';
    let headers = {};
    // lowercase headers on the way in.
    for (let key in headersArg) {
      headers[key.toLowerCase()] = headersArg[key];
    }
    let hardwareInfo = headers['x-local-hardwareinfo'];
    delete headers['x-local-hardwareinfo'];

    // Is this a native detection or a HTTP detection ?
    if (this.hasBiKeys(headers)) {
      return this.v4MatchBuildInfo(headers);
    }
    return this.v4MatchHttpHeaders(headers, hardwareInfo);
  }

  /**
   * Returns the rating score for a device based on the passed values
   *
   * @param string deviceId : The ID of the device to check.
   * @param object props Properties extracted from the device (display_x, display_y etc .. )
   * @return array of rating information. (which includes 'score' which is an int value that is a percentage.)
   */
  findRating(deviceId, props) {
    let device = this.findById(deviceId);
    if (!device.Device.hd_specs) {
      return null;
    }

    let specs = device.Device.hd_specs;

    let total = 70;
    let result = {};

    // Display Resolution - Worth 40 points if correct
    result.resolution = 0;
    if (props.display_x && props.display_y) {
      let pMaxRes = Math.round(Math.max(props.display_x, props.display_y));
      let pMinRes = Math.round(Math.min(props.display_x, props.display_y));
      let sMaxRes = Math.round(Math.max(specs.display_x, specs.display_y));
      let sMinRes = Math.round(Math.min(specs.display_x, specs.display_y));
      if (pMaxRes === sMaxRes && pMinRes === sMinRes) {
        // Check for native match first
        result.resolution = 40;
      } else {
        // Check for css dimensions match.
        // css dimensions should be display_[xy] / display_pixel_ratio or others in other modes.
        // Devices can have multiple css display modes (eg. iPhone 6, iPhone 6+ Zoom mode)
        let cssScreenSizes = !specs.display_css_screen_sizes ? [] : specs.display_css_screen_sizes;
        for(let size of cssScreenSizes) {
          let dimensions = size.split('x');
          let tmpMaxRes = Math.round(Math.max(dimensions));
          let tmpMinRes = Math.round(Math.min(dimensions));
          if (pMaxRes === tmpMaxRes && pMinRes === tmpMinRes) {
            result.resolution = 40;
            break;
          }
        }
      }
    }

    // Display pixel ratio - 20 points
    result.display_pixel_ratio = 20;
    if (props.display_pixel_ratio) {
      // Note : display_pixel_ratio will be a string stored as 1.33 or 1.5 or 2, perhaps 2.0 ..
      if (specs.display_pixel_ratio === '' + Math.round(props.display_pixel_ratio/100, 2)) {
        result.display_pixel_ratio = 40;
      }
    }

    // Benchmark - 10 points - Enough to tie break but not enough to overrule display or pixel ratio.
    result.benchmark = 0;
    if (props.benchmark) {
      if (specs.benchmark_min && specs.benchmark_max) {
        if (props.benchmark >= parseInt(specs.benchmark_min) && props.benchmark <= parseInt(specs.benchmark_max)) {
          // Inside range
          result.benchmark = 10;
        }
      }
    }
    result.score = Object.keys(result).reduce((score, key) => score + result[key], 0);
    result.possible = total;
    result._id = deviceId;

    // Distance from mean used in tie breaking situations if two devices have the same score.
    result.distance = 100000;
    if (specs.benchmark_min && specs.benchmark_max && props.benchmark) {
      result.distance = Math.round(Math.abs(((specs.benchmark_min + specs.benchmark_max)/2) - props.benchmark));
    }
    return result;
  }

  /**
   * Overlays specs onto a device
   *
   * @param string specsField : Either 'platform', 'browser', 'language'
   * @return void
   **/
  specsOverlay(specsField, device, specs) {
    if (!specs) {
      return;
    }
    switch (specsField) {
      case 'platform' : {
        if (specs.hd_specs.general_platform && specs.hd_specs.general_platform_version) {
          device.Device.hd_specs.general_platform = specs.hd_specs.general_platform;
          device.Device.hd_specs.general_platform_version = specs.hd_specs.general_platform_version;
        } else if (specs.hd_specs.general_platform && specs.hd_specs.general_platform !== device.Device.hd_specs.general_platform) {
          device.Device.hd_specs.general_platform = specs.hd_specs.general_platform;
          device.Device.hd_specs.general_platform_version = '';
        }
      } break;

      case 'browser' : {
        if (specs.hd_specs.general_browser) {
          device.Device.hd_specs.general_browser = specs.hd_specs.general_browser;
          device.Device.hd_specs.general_browser_version = specs.hd_specs.general_browser_version;
        }

      } break;

      case 'app' : {
        if (specs.hd_specs.general_app) {
          device.Device.hd_specs.general_app = specs.hd_specs.general_app;
          device.Device.hd_specs.general_app_version = specs.hd_specs.general_app_version;
          device.Device.hd_specs.general_app_category = specs.hd_specs.general_app_category;
        }

      } break;

      case 'language' : {
        if (specs.hd_specs.general_language) {
          device.Device.hd_specs.general_language = specs.hd_specs.general_language;
          device.Device.hd_specs.general_language_full = specs.hd_specs.general_language_full;
        }
      } break;
    }
  }

  /**
   * Takes a string of onDeviceInformation and turns it into something that can be used for high accuracy checking.
   *
   * Strings a usually generated from cookies, but may also be supplied in headers.
   * The format is w;h;r;b where w is the display width, h is the display height, r is the pixel ratio and b is the benchmark.
   * display_x, display_y, display_pixel_ratio, general_benchmark
   *
   * @param string hardwareInfo String of light weight device property information, separated by ':'
   * @return array partial specs array of information we can use to improve detection accuracy
   **/
  infoStringToArray(hardwareInfo) {
    // Remove the header or cookie name from the string 'x-specs1a='
    if (hardwareInfo.includes('=')) {
      let tmp = hardwareInfo.split('=');
      if (!tmp[1]) {
        return {};
      } else {
        hardwareInfo = tmp[1];
      }
    }
    let reply = {};
    let info = hardwareInfo.split(':');
    if (info.length !== 4) {
      return {};
    }
    reply.display_x = parseInt(info[0].trim(), 10);
    reply.display_y = parseInt(info[1].trim(), 10);
    reply.display_pixel_ratio = parseInt(info[2].trim(), 10);
    reply.benchmark = parseInt(info[3].trim(), 10);
    return reply;
  }

  /**
   * Overlays hardware info onto a device - Used in generic replys
   *
   * @param object device
   * @param hardwareInfo
   * @return void
   **/
  hardwareInfoOverlay(device, infoArray) {
    if (infoArray) {
      if (infoArray.display_x) {
        device.Device.hd_specs.display_x = infoArray.display_x;
      }
      if (infoArray.display_y) {
        device.Device.hd_specs.display_y = infoArray.display_y;
      }
      if (infoArray.display_pixel_ratio) {
        device.Device.hd_specs.display_pixel_ratio = infoArray.display_pixel_ratio;
      }
    }
  }

  /**
   * Device matching
   *
   * Plan of attack :
   *  1) Look for opera headers first - as they're definitive
   *  2) Try profile match - only devices which have unique profiles will match.
   *  3) Try user-agent match
   *  4) Try other x-headers
   *  5) Try all remaining headers
   *
   * @param void
   * @return array The matched device or null if not found
   **/
  matchDevice(headers) {
    let agent = ''; // Remember the agent for generic matching later.
    let _id = null;
    // Opera mini sometimes puts the vendor # model in the header - nice! ... sometimes it puts ? # ? in as well
    if (headers['x-operamini-phone'] && headers['x-operamini-phone'].trim() !== '? # ?') {
      _id = this.getMatch('x-operamini-phone', headers['x-operamini-phone'], DETECTIONV4_STANDARD, 'x-operamini-phone', 'device');
      if (_id) {
        return this.findById(_id);
      }
      agent = headers['x-operamini-phone'];
      delete headers['x-operamini-phone'];
    }

    // Profile header matching
    if (headers.profile) {
      _id = this.getMatch('profile', headers.profile, DETECTIONV4_STANDARD, 'profile', 'device');
      if (_id) {
        return this.findById(_id);
      }
      delete headers.profile;
    }

    // Profile header matching
    if (headers['x-wap-profile']) {
      _id = this.getMatch('profile', headers['x-wap-profile'], DETECTIONV4_STANDARD, 'x-wap-profile', 'device');
      if (_id) {
        return this.findById(_id);
      }
      delete headers['x-wap-profile'];
    }

    // Match nominated headers ahead of x- headers
    let order = this.detectionConfig['device-ua-order'];
    for(let key in headers) {
      if (!order.includes(key) && key.match(/^x-/i)) {
        order.push(key);
      }
    }

    for(let item of order) {
      if (headers[item]) {
        let _id = this.getMatch('user-agent', headers[item], DETECTIONV4_STANDARD, item, 'device');
        if (_id) {
          return this.findById(_id);
        }
      }
    }

    // Generic matching - Match of last resort
    if (headers['x-operamini-phone-ua']) {
      _id = this.getMatch('user-agent', headers['x-operamini-phone-ua'], DETECTIONV4_GENERIC, 'agent', 'device');
    }
    if (!_id && headers.agent) {
      _id = this.getMatch('user-agent', headers.agent, DETECTIONV4_GENERIC, 'agent', 'device');
    }
    if (!_id && headers['user-agent']) {
      _id = this.getMatch('user-agent', headers['user-agent'], DETECTIONV4_GENERIC, 'agent', 'device');
    }

    if (_id) {
      return this.findById(_id);
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
    return JSON.parse(JSON.stringify(this.tree.DEVICE[_id]));
  }

  /**
   * BuildInfo Matching
   *
   * Takes a set of buildInfo key/value pairs & works out what the device is
   *
   * @param object buildInfo - Buildinfo key/value array
   * @return mixed device array on success, false otherwise
   */
  v4MatchBuildInfo(buildInfo) {
    // Nothing to check    
    if (!buildInfo || Object.keys(buildInfo).length === 0) {
      return false;
    }
    this.buildInfo = buildInfo;
    
    // Device Detection
    this.device = this.v4MatchBIHelper(buildInfo, 'device');
    if (!this.device) {
      return false;
    }
    
    // Platform Detection
    this.platform = this.v4MatchBIHelper(buildInfo, 'platform');
    if (this.platform) {
      this.specsOverlay('platform', this.device, this.platform.Extra);
    }

    this.reply.hd_specs = this.device.Device.hd_specs;
    return this.setError(0, 'OK');
  }
  
  /**
   * buildInfo Match helper - Does the build info match heavy lifting
   *
   * @param object buildInfo A buildInfo key/value array
   * @param string category - 'device' or 'platform' (cant match browser or app with buildinfo)
   * @return device or extra on success, false otherwise
   **/
  v4MatchBIHelper(buildInfo, category='device') {
    // ***** Device Detection *****
    let confBIKeys = this.detectionConfig[category + '-bi-order'];
    if (confBIKeys.length === 0 || !buildInfo || Object.keys(buildInfo).length === 0) {
      return null;
    }

    for(let platform in confBIKeys) {
      let set = confBIKeys[platform];
      for(let tuple of set) {
        let checking = true;
        let value = '';
        for(let item of tuple) {
          if (item === 'hd-platform') {
            value += '|' + platform;
          } else if (! buildInfo.hasOwnProperty(item)) {
            checking = false;
            break;
          } else {
            value += '|' + buildInfo[item];
          }
        }
        if (checking) {
          value = value.replace(/^[\| \t\n\r\0\x0B]*/g, '');
          value = value.replace(/[\| \t\n\r\0\x0B]*$/g, '');
          let subtree = (category === 'device') ? DETECTIONV4_STANDARD : category;
          value = (category === 'device') ? value = this.cleanStr(value) : this.extraCleanStr(value);
          let _id = this.getMatch('buildinfo', value, subtree, 'buildinfo', category);
          if (_id) {
            return (category === 'device') ? this.findById(_id) : this.Extra.findById(_id);
          }
        }
      }
    }
    
    // If we get this far then not found, so try generic.
    let platform = this.hasBiKeys(buildInfo);
    if (platform) {
      for(let value of ['generic|' + platform, platform + '|generic']) {
        let subtree = (category === 'device') ? DETECTIONV4_GENERIC : category;
        value = (category === 'device') ? this.cleanStr(value) : this.extraCleanStr(value);
        let _id = this.getMatch('buildinfo', value, subtree, 'buildinfo', category);
        if (_id) {
          return (category === 'device') ? this.findById(_id) : this.Extra.findById(_id);
        }
      }
    }    
    return null;
  }
  
  /**
   * Find the best device match for a given set of headers and optional device properties.
   *
   * In 'all' mode all conflicted devces will be returned as a list.
   * In 'default' mode if there is a conflict then the detected device is returned only (backwards compatible with v3).
   * 
   * @param object headers Set of sanitized http headers
   * @param string hardwareInfo Information about the hardware
   * @return array device specs. (device.hd_specs)
   **/
  v4MatchHttpHeaders(headers, hardwareInfo=null) {
    let hwProps = null;
    
    // Nothing to check    
    if (!headers || headers.length === 0) {
      return false;
    }
    delete headers.ip;
    delete headers.host;

    // Sanitize headers & cleanup language
    for(let key in headers) {
      let value = headers[key];
      key = key.toLowerCase(); 

      if (key === 'accept-language' || key === 'content-language') {
        key = 'language';
        let tmp = value.toLowerCase().replace(/ /g, '').split(/[,;]/);
        if (tmp[0]) {
          value = tmp[0];
        } else {
          continue;
        }
      } else if (key !== 'profile' && key !== 'x-wap-profile') {
        // Handle strings that have had + substituted for a space ie. badly (semi) url encoded..
        let stringLen = value.length;
        let spaces = stringLen - value.replace(/ /g, '').length;
        let plusses = stringLen - value.replace(/\+/g, '').length;
        if (spaces === 0 && plusses > 5 && stringLen > 20) {
          value = value.replace(/\+/g, ' ');
        }
      }
      this.deviceHeaders[key] = this.cleanStr(value);
      this.extraHeaders[key] = this.Extra.extraCleanStr(value);
    }
    this.device = this.matchDevice(this.deviceHeaders);
    if (!this.device) {
      if (!this.reply.status) {
        // If no downstream error set then return not found.
        return this.setError(301, 'Not Found');
      }
      // Error is already set, so return false 
      return false;
    }
    if (hardwareInfo) {
      hwProps = this.infoStringToArray(hardwareInfo);
    }

    // Stop on detect set - Tidy up and return
    if (this.device.Device.hd_ops.stop_on_detect) {
      // Check for hardwareInfo overlay
      if (this.device.Device.hd_ops.overlay_result_specs) {
        this.hardwareInfoOverlay(this.device, hwProps);
      }
      this.reply.hd_specs = this.device.Device.hd_specs;
      return this.setError(0, 'OK');
    }

    // Get extra info
    this.platform = this.Extra.matchExtra('platform', this.extraHeaders);
    this.browser = this.Extra.matchExtra('browser', this.extraHeaders);
    this.app = this.Extra.matchExtra('app', this.extraHeaders);
    this.language = this.Extra.matchLanguage(this.extraHeaders);

    // Find out if there is any contention on the detected rule.
    let deviceList = this.getHighAccuracyCandidates();
    if (deviceList && deviceList.length > 0) {

      // Resolve contention with OS check
      this.Extra.set(this.platform);
      let pass1List = [];
      for(let _id of deviceList) {
        let tryDevice = this.findById(_id);
        if (this.Extra.verifyPlatform(tryDevice.Device.hd_specs)) {
          pass1List.push(_id);
        }
      }

      // Contention still not resolved .. check hardware
      if (pass1List.length >= 2 && hwProps) {

        // Score the list based on hardware
        let result = [];
        for(let _id of pass1List) {
          let tmp = this.findRating(_id, hwProps);
          if (tmp) {
            tmp._id = _id;
            result.push(tmp);
          }
        }
        // Sort the results
        result.sort(this.hd_sortByScore);
        this.ratingResult = result;

        // Take the first one
        if (this.ratingResult[0].score !== 0) {
          let device = this.findById(result[0]._id);
          if (device) {
            this.device = device;
          }
        }
      }
    }

    // Overlay specs
    this.specsOverlay('platform', this.device, this.platform.Extra);
    this.specsOverlay('browser', this.device, this.browser.Extra);
    this.specsOverlay('app', this.device, this.app.Extra);
    this.specsOverlay('language', this.device, this.language.Extra);

    // Overlay hardware info result if required
    if (this.device.Device.hd_ops.overlay_result_specs && hardwareInfo) {
      this.hardwareInfoOverlay(this.device, hwProps);
    }
    this.reply.hd_specs = this.device.Device.hd_specs;
    return this.setError(0, 'OK');
  }

  /**
   * Determines if high accuracy checks are available on the device which was just detected
   *
   * @param void
   * @returns array, a list of candidate devices which have this detection rule or false otherwise.
   */
  getHighAccuracyCandidates() {
    let branch = this.getBranch('hachecks');
    let ruleKey = this.detectedRuleKey.device;
    for (let [key, node] of branch) {
      if (key === ruleKey) {
        return node;
      }
    }
    return false;
  }
  
  /**
   * Determines if hd4Helper would provide more accurate results.
   *
   * @param object headers HTTP Headers
   * @return true if required, false otherwise
   **/
  isHelperUseful(headers) {
    if (!headers || Object.keys(headers).length === 0) {
      return false;
    }
    delete headers.ip;
    delete headers.host;
    let tmp = this.localDetect(headers);
    if (!tmp) {
      return false;
    }
    tmp = this.getHighAccuracyCandidates();
    if (!tmp) {
      return false;
    }
    return true;
  }

  /**
   * Custom sort function for sorting results.
   *
   * Includes a tie-breaker for results which score out the same
   *
   * @param object result1
   * @param object result2
   * @return -1 (result1 < result2), 0 (result1 === result2) , 1 (result1 > result2)
   **/
  hd_sortByScore(d1, d2) {
    if ((d2.score - d1.score) !== 0) {
      return d2.score - d1.score;
    }
    return d1.distance - d2.distance;
  }  
}

module.exports = HDDevice;
