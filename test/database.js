/* globals describe, it*/
'use strict';
require('colors');
const HandsetDetect = require('../index.js');
const fs = require('fs');
const HANDSET_DETECT_SECRET = process.env.HANDSET_DETECT_SECRET || process.env.API_SECRET;
const HANDSET_DETECT_USERNAME = process.env.HANDSET_DETECT_USERNAME || process.env.API_USERNAME;

describe('Handset Detect database tests'.underline.cyan.bold, function() {
    this.timeout(10 * 60 * 1000);
    this.retries(3);
    it('should provide UltimateDB', function(done) {
        const dbFile = 'database.json';
        if (fs.existsSync(`${ __dirname }/../lib/${ dbFile }`)) {
            done();
        }
        HandsetDetect({
            verbose: true,
            secret: HANDSET_DETECT_SECRET,
            username: HANDSET_DETECT_USERNAME,
            module: 'hosted',
            autoUpdate: true });
        fs.watch(`${ __dirname }/../lib`, (eventType, filename) => {
            if (eventType === 'rename' && filename === dbFile) {
                done();
            }
        });
    });
    it('should provide the free database', function(done) {
        const dbFile = 'communitydatabase.json';
        if (fs.existsSync(`${ __dirname }/../lib/${ dbFile }`)) {
            done();
        }
        HandsetDetect({ module: 'hosted', free: true, verbose: true, autoUpdate: true });
        fs.watch(`${ __dirname }/../lib`, (eventType, filename) => {
            if (eventType === 'rename' && filename === dbFile) {
                done();
            }
        });
    });
});
