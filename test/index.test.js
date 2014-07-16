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
        __dirname + '/something/strange/there.js',
        __dirname + '/something/ignored.js'
      ];
    });

    before(function() {
      this.wildcard_method = function() {};
      this.some_method = function() {};
      this.some_other_method = function() {};
      this.some_nested_method = function() {};

      this.spies = {};
      this.spies[__dirname + '/something/here.js'] = this.wildcard_method;
      
      this.wildcard_method.some_method = this.some_method;
      this.wildcard_method._should_be_ignored = function() {};
      this.wildcard_method.property = "shouldn\'t make us crash";
      this.wildcard_method.nested = {
        some_nested_method: this.some_nested_method
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
      bootstrapEvents(emitter, targetDir, {
        ignore: /igno.*/
      });

      emitter.listeners('something.here.*')
        .should.have.lengthOf(1);
      emitter.listeners('something.here.some_method')
        .should.have.lengthOf(1);
      emitter.listeners('something.here.nested.some_nested_method')
        .should.have.lengthOf(1);
      emitter.listeners('something.strange.there.some_other_method')
        .should.have.lengthOf(1);
      emitter.listeners('something.here._should_be_ignored')
        .should.have.lengthOf(0);
      emitter.listeners('something.ignored')
        .should.have.lengthOf(0);

      emitter.listeners('something.here.*')[0]
        .should.equal(this.wildcard_method);
      emitter.listeners('something.here.some_method')[0]
        .should.equal(this.some_method);
      emitter.listeners('something.here.nested.some_nested_method')[0]
        .should.equal(this.some_nested_method);
      emitter.listeners('something.strange.there.some_other_method')[0]
        .should.equal(this.some_other_method);
    });
  });

  describe('._walk(dir)', function() {
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

  describe('._matches(pred, value)', function() {
    it('works with Function predicates', function() {
      var pred = function(value) {
        return value === 'something';
      };

      bootstrapEvents._matches(pred, 'something').should.be.ok;
      bootstrapEvents._matches(pred, 'else').should.not.be.ok;
    });

    it('works with RegExp predicates', function() {
      var pred = /Regular Expressions are [^bad]+/;

      bootstrapEvents._matches(pred, 'Regular Expressions are ok').should.be.ok;
      bootstrapEvents._matches(pred, 'Regular Expressions are ')
        .should.not.be.ok;
      bootstrapEvents._matches(pred, 'Regular Expressions are bad')
        .should.not.be.ok;
    });

    it('works with arrays of predicates', function() {
      var called = 0;
      var pred = [
        /[0-9]+/,
        function() { called += 1; return true; },
        1773
      ];

      bootstrapEvents._matches(pred, 10).should.not.be.ok;
      called.should.equal(1);
      bootstrapEvents._matches(pred, 'asdf').should.not.be.ok;
      called.should.equal(1);
      bootstrapEvents._matches(pred, 1773).should.be.ok;
      called.should.equal(2);
    });
  });
});
