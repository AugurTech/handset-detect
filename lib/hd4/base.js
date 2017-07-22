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

class HDBase {

  constructor(tree) {
    this.tree = tree;
    this.detectedRuleKey = {};
    this.reply = null;
    this.detectionConfig = { 
      'device-ua-order': ['x-operamini-phone-ua', 'x-mobile-ua', 'device-stock-ua', 'user-agent', 'agent'],
      'platform-ua-order': ['x-operamini-phone-ua', 'x-mobile-ua', 'device-stock-ua', 'user-agent', 'agent'],
      'browser-ua-order': ['user-agent', 'agent', 'device-stock-ua'],
      'app-ua-order': ['user-agent', 'agent', 'device-stock-ua'],
      'language-ua-order': ['user-agent', 'agent', 'device-stock-ua'],
      'device-bi-order': {
         'android': [
           ['ro.product.brand','ro.product.model'],
           ['ro.product.manufacturer','ro.product.model'],
           ['ro-product-brand','ro-product-model'],
           ['ro-product-manufacturer','ro-product-model'],
         ],
         'ios': [
           ['utsname.brand','utsname.machine']
         ],
         'windows phone': [
           ['devicemanufacturer','devicename']
         ]
      },
      'platform-bi-order': {
        'android': [
          ['hd-platform', 'ro.build.version.release'],
          ['hd-platform', 'ro-build-version-release'],
          ['hd-platform', 'ro.build.id'],
          ['hd-platform', 'ro-build-id']
        ],
        'ios': [ 
          ['uidevice.systemname','uidevice.systemversion'],
          ['hd-platform','uidevice.systemversion']
        ],
        'windows phone': [
          ['osname','osversion'],
          ['hd-platform','osversion']
        ]
      },
      'browser-bi-order': {},
      'app-bi-order': {}
    };
    this.detectionLanguages = { 
      'af': 'Afrikaans',
      'sq': 'Albanian',
      'ar-dz': 'Arabic (Algeria)',
      'ar-bh': 'Arabic (Bahrain)',
      'ar-eg': 'Arabic (Egypt)',
      'ar-iq': 'Arabic (Iraq)',
      'ar-jo': 'Arabic (Jordan)',
      'ar-kw': 'Arabic (Kuwait)',
      'ar-lb': 'Arabic (Lebanon)',
      'ar-ly': 'Arabic (libya)',
      'ar-ma': 'Arabic (Morocco)',
      'ar-om': 'Arabic (Oman)',
      'ar-qa': 'Arabic (Qatar)',
      'ar-sa': 'Arabic (Saudi Arabia)',
      'ar-sy': 'Arabic (Syria)',
      'ar-tn': 'Arabic (Tunisia)',
      'ar-ae': 'Arabic (U.A.E.)',
      'ar-ye': 'Arabic (Yemen)',
      'ar': 'Arabic',
      'hy': 'Armenian',
      'as': 'Assamese',
      'az': 'Azeri',
      'eu': 'Basque',
      'be': 'Belarusian',
      'bn': 'Bengali',
      'bg': 'Bulgarian',
      'ca': 'Catalan',
      'zh-cn': 'Chinese (China)',
      'zh-hk': 'Chinese (Hong Kong SAR)',
      'zh-mo': 'Chinese (Macau SAR)',
      'zh-sg': 'Chinese (Singapore)',
      'zh-tw': 'Chinese (Taiwan)',
      'zh': 'Chinese',
      'hr': 'Croatian',
      'cs': 'Czech',
      'da': 'Danish',
      'da-dk': 'Danish',
      'div': 'Divehi',
      'nl-be': 'Dutch (Belgium)',
      'nl': 'Dutch (Netherlands)',
      'en-au': 'English (Australia)',
      'en-bz': 'English (Belize)',
      'en-ca': 'English (Canada)',
      'en-ie': 'English (Ireland)',
      'en-jm': 'English (Jamaica)',
      'en-nz': 'English (New Zealand)',
      'en-ph': 'English (Philippines)',
      'en-za': 'English (South Africa)',
      'en-tt': 'English (Trinidad)',
      'en-gb': 'English (United Kingdom)',
      'en-us': 'English (United States)',
      'en-zw': 'English (Zimbabwe)',
      'en': 'English',
      'us': 'English (United States)',
      'et': 'Estonian',
      'fo': 'Faeroese',
      'fa': 'Farsi',
      'fi': 'Finnish',
      'fr-be': 'French (Belgium)',
      'fr-ca': 'French (Canada)',
      'fr-lu': 'French (Luxembourg)',
      'fr-mc': 'French (Monaco)',
      'fr-ch': 'French (Switzerland)',
      'fr': 'French (France)',
      'mk': 'FYRO Macedonian',
      'gd': 'Gaelic',
      'ka': 'Georgian',
      'de-at': 'German (Austria)',
      'de-li': 'German (Liechtenstein)',
      'de-lu': 'German (Luxembourg)',
      'de-ch': 'German (Switzerland)',
      'de-de': 'German (Germany)',
      'de': 'German (Germany)',
      'el': 'Greek',
      'gu': 'Gujarati',
      'he': 'Hebrew',
      'hi': 'Hindi',
      'hu': 'Hungarian',
      'is': 'Icelandic',
      'id': 'Indonesian',
      'it-ch': 'Italian (Switzerland)',
      'it': 'Italian (Italy)',
      'it-it': 'Italian (Italy)',
      'ja': 'Japanese',
      'kn': 'Kannada',
      'kk': 'Kazakh',
      'kok': 'Konkani',
      'ko': 'Korean',
      'kz': 'Kyrgyz',
      'lv': 'Latvian',
      'lt': 'Lithuanian',
      'ms': 'Malay',
      'ml': 'Malayalam',
      'mt': 'Maltese',
      'mr': 'Marathi',
      'mn': 'Mongolian (Cyrillic)',
      'ne': 'Nepali (India)',
      'nb-no': 'Norwegian (Bokmal)',
      'nn-no': 'Norwegian (Nynorsk)',
      'no': 'Norwegian (Bokmal)',
      'or': 'Oriya',
      'pl': 'Polish',
      'pt-br': 'Portuguese (Brazil)',
      'pt': 'Portuguese (Portugal)',
      'pa': 'Punjabi',
      'rm': 'Rhaeto-Romanic',
      'ro-md': 'Romanian (Moldova)',
      'ro': 'Romanian',
      'ru-md': 'Russian (Moldova)',
      'ru': 'Russian',
      'sa': 'Sanskrit',
      'sr': 'Serbian',
      'sk': 'Slovak',
      'ls': 'Slovenian',
      'sb': 'Sorbian',
      'es-ar': 'Spanish (Argentina)',
      'es-bo': 'Spanish (Bolivia)',
      'es-cl': 'Spanish (Chile)',
      'es-co': 'Spanish (Colombia)',
      'es-cr': 'Spanish (Costa Rica)',
      'es-do': 'Spanish (Dominican Republic)',
      'es-ec': 'Spanish (Ecuador)',
      'es-sv': 'Spanish (El Salvador)',
      'es-gt': 'Spanish (Guatemala)',
      'es-hn': 'Spanish (Honduras)',
      'es-mx': 'Spanish (Mexico)',
      'es-ni': 'Spanish (Nicaragua)',
      'es-pa': 'Spanish (Panama)',
      'es-py': 'Spanish (Paraguay)',
      'es-pe': 'Spanish (Peru)',
      'es-pr': 'Spanish (Puerto Rico)',
      'es-us': 'Spanish (United States)',
      'es-uy': 'Spanish (Uruguay)',
      'es-ve': 'Spanish (Venezuela)',
      'es': 'Spanish (Traditional Sort)',
      'es-es': 'Spanish (Traditional Sort)',
      'sx': 'Sutu',
      'sw': 'Swahili',
      'sv-fi': 'Swedish (Finland)',
      'sv': 'Swedish',
      'syr': 'Syriac',
      'ta': 'Tamil',
      'tt': 'Tatar',
      'te': 'Telugu',
      'th': 'Thai',
      'ts': 'Tsonga',
      'tn': 'Tswana',
      'tr': 'Turkish',
      'uk': 'Ukrainian',
      'ur': 'Urdu',
      'uz': 'Uzbek',
      'vi': 'Vietnamese',
      'xh': 'Xhosa',
      'yi': 'Yiddish',
      'zu': 'Zulu'
    };
    this.deviceUAFilter = /[ _\\#\-,\\.\/:"']/g;
    this.extraUAFilter = /[ ]/g;
  }

  /**
   * Error handling helper. Sets a message and an error code.
   *
   * @param status error code
   * @param msg message content
   * @return true if no error, or false otherwise.
   **/
  setError(status, msg) {
      this.error = msg;
      this.reply.status = status;
      this.reply.nessage = msg;
      return status === 0;
  }
  
  /**
   * String cleanse for extras matching.
   *
   * @param string str
   * @return string Cleansed string
   **/
  extraCleanStr(str) {
    str = str.replace(this.extraUAFilter, '');
    str = str.toLowerCase().replace(/[^(\x20-\x7F)]*/g, '');
    return str.trim();
  }

  /**
   * Standard string cleanse for device matching
   *
   * @param string str
   * @return string cleansed string
   **/
  cleanStr(str) {
    str = str.replace(this.deviceUAFilter, '');
    str = str.toLowerCase().replace(/[^(\x20-\x7F)]*/g, '');
    return str.trim();
  }
  /**
   * Helper for determining if a header has BiKeys
   *
   * @param object header
   * @return platform name on success, false otherwise
   **/
  hasBiKeys(headers) {
    let biKeys = this.detectionConfig['device-bi-order'];
    let dataKeys = Object.keys(headers).map(x => x.toLowerCase());

    // Fast check
    if (dataKeys.includes('agent')) {
      return false;
    }
    if (dataKeys.includes('user-agent')) {
      return false;
    }

    for(let platform in biKeys) {
      let set = biKeys[platform];
      for(let tuple of set) {
        let count = 0;
        let total = tuple.length;
        for(let item of tuple) {
          if (dataKeys.includes(item)) {
            count++;
          }
          if (count === total) {
            return platform;
          }
        }
      }
    }
    return false;
  }

  /**
   * The heart of the detection process
   *
   * @param string header The type of header we're matching against - user-agent type headers use a sieve matching, all others are hash matching.
   * @param string value The http header's sanitised value (could be a user-agent or some other x- header value)
   * @param string subtree The 0 or 1 for devices (isGeneric), category name for extras ('platform', 'browser', 'app')
   * @param string actualHeader Unused (optimized away)
   * @param string category : One of 'device', 'platform', 'browser' or 'app'
   * @return int node (which is an id) on success, false otherwise
   */
  getMatch(header, value, subtree='0', actualHeader='', category='device') {
    actualHeader = '';
    let f = 0;
    let r = 0;
    let treetag = header + subtree;

    // Fetch branch before validating params to confirm local files are installed correctly.
    let branch = this.getBranch(treetag);
    if (!branch || Object.keys(branch) === 0) {
      return false;
    }

    if (value.length < 4) {
      return false;
    }

    if (header === 'user-agent') {
      // Sieve matching strategy
      for(let [order, filters] of branch) {
        order;
        for(let [filter, matches] of filters) {
          ++f;
          if (typeof filter === 'string' && value.includes(filter)) {
            for(let [match, node] of matches) {
              ++r;
              if (typeof match === 'string' && value.includes(match)) {
                this.detectedRuleKey[category] = this.cleanStr(header) + ':' + this.cleanStr(filter) + ':' + this.cleanStr(match);
                return node;
              }
            }
          }
        }
      }
    } else {
      // Hash matching strategy
      for (let [key, node] of branch) {
        if (key === value) {
          return node;
        }
      }
    }
    return false;
  }

  /**
   * Find a branch for the matching process
    *
   * @param string branch The name of the branch to find
   * @return an assoc array on success, false otherwise.
   */
  getBranch(branch) {
    return this.tree[branch];
  }
}

module.exports = HDBase;
