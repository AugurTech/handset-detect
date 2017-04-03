/* globals describe, it*/
'use strict';

var assert = require('assert');
var handsetDetect = require('../');

describe( 'Initialize', function() {
    it( 'should be a function', function() {
        assert.equal(typeof handsetDetect, 'function');
    });

    it( 'should throw an error if no config', function() {
        assert.throws( handsetDetect, Error );
    });

    it( 'should throw an error if username and secret or free aren not provided', function() {
        assert.throws( () => handsetDetect({username:'test'}), Error );
        assert.throws( () => handsetDetect({secret:'test'}), Error );
        assert.throws( () => handsetDetect({}), Error );
    });

    it( 'should throw an error if cloud or hosted is not provided', function() {
        assert.throws( () => handsetDetect({free:true,cloud:'false'}), Error );
        assert.throws( () => handsetDetect({free:true,hosted:'false'}), Error );
    });

    it( 'should throw an error if cloud is provided but no username or password', function() {
        assert.throws( () => handsetDetect({cloud:true,username: 'test'}), Error );
        assert.throws( () => handsetDetect({cloud:true,secret:'test'}), Error );
    });
});