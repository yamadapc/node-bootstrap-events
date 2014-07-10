'use strict'; /* global describe, it, before */
var Module = require('module');
var fs = require('fs');
var path = require('path');
var events = require('events');
var should = require('should');
var makeStub = require('mocha-make-stub');

var bootstrapEvents = require('..');

describe('bootstrapEvents', function() {
  describe('bootstrapEvents(emitter, targetDir)', function() {
    makeStub('walk', bootstrapEvents, '_walk', function() {
      return [
        __dirname + '/something/here.js',
        __dirname + '/something/strange/there.js'
      ];
    });

    before(function() {
      this.some_method = function() {};
      this.some_other_method = function() {};
      this.some_nested_method = function() {};

      this.spies = {};
      this.spies[__dirname + '/something/here.js'] = {
        some_method: this.some_method,
        _should_be_ignored: function() {},
        property: "shouldn\'t make us crash",
        nested: {
          some_nested_method: this.some_nested_method
        }
      };

      this.spies[__dirname + '/something/strange/there.js'] = {
        some_other_method: this.some_other_method
      };
    });

    makeStub('require', Module.prototype, 'require', function(path) {
      if(this.spies[path]) return this.spies[path];
      else return Module._load(path, this);
    }, true);

    it('registers events based on modules and their methods', function() {
      var emitter = new events.EventEmitter();
      var targetDir = __dirname;
      bootstrapEvents(emitter, targetDir);

      emitter.listeners('something.here.some_method')
        .should.have.lengthOf(1);
      emitter.listeners('something.here.nested.some_nested_method')
        .should.have.lengthOf(1);
      emitter.listeners('something.strange.there.some_other_method')
        .should.have.lengthOf(1);
      emitter.listeners('something.here._should_be_ignored')
        .should.have.lengthOf(0);

      emitter.listeners('something.here.some_method')[0]
        .should.equal(this.some_method);
      emitter.listeners('something.here.nested.some_nested_method')[0]
        .should.equal(this.some_nested_method);
      emitter.listeners('something.strange.there.some_other_method')[0]
        .should.equal(this.some_other_method);
    });
  });

  describe('.walk(dir)', function() {
    // top-level
    // |--file1
    // |--file2
    // |--dir1
    //    |--file3
    //    |--file4
    //    |--dir2
    //       |--file5
    //       |--dir3
    //          |
    makeStub('readdirSync', fs, 'readdirSync', function(dir) {
      if(dir === 'top-level') {
        return ['file1', 'file2', 'dir1'];
      } else if(dir === path.join('top-level', 'dir1')) {
        return ['file3', 'dir2', 'file4'];
      } else if(dir === path.join('top-level', 'dir1', 'dir2')) {
        return ['file5', 'dir3'];
      } else {
        return [];
      }
    });

    makeStub('statSync', fs, 'statSync', function(pth) {
      if(/file/.test(pth)) {
        return {
          isDirectory: function() { return false; }
        };
      } else {
        return {
          isDirectory: function() { return true; }
        };
      }
    });

    it('recursivelly finds files in a directory', function() {
      var ret = bootstrapEvents._walk('top-level');
      should.exist(ret);
      ret.should.be.instanceof(Array);
      ret.should.have.length(5);
      ret.should.eql([
        'top-level/file1',
        'top-level/file2',
        'top-level/dir1/file3',
        'top-level/dir1/dir2/file5',
        'top-level/dir1/file4',
      ]);
    });
  });
});
