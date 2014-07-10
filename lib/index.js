'use strict';
var fs = require('fs');
var path = require('path');

/**
 * Bootstraps a directories modules methods recursivelly into an event emitter.
 *
 * @api public
 *
 * @param {EventEmitter} emitter The EventEmitter to attach listeners to
 * @param {String} targetDir The directory to start the search in
 * @return {EventEmitter} The `emitter` parameter
 */

exports = module.exports = function bootstrapEvents(emitter, targetDir) {
  var files = exports._walk(targetDir);

  for(var i = 0, len = files.length; i < len; i++) {
    var file = files[i];
    if(path.extname(file) === '.js') {
      // listeners/to_something/here.js => listeners.to_something.here
      var baseEventName = path
          .relative(targetDir, file)
          .slice(0, -3)
          .split(path.sep)
          .join('.');

      var mod = require(file);

      exports._bootstrapObject(emitter, baseEventName, mod);
    }
  }

  return emitter;
};

/**
 * Bootstraps an object `obj`'s methods recursivelly to the EventEmitter
 * `emitter` based on a base event name `baseEventName`.
 *
 * @api private
 *
 * @param {EventEmitter} emitter The event emitter to attach listeners to
 * @param {String} baseEventName The base event name
 * @param {Object} obj An object to scan for handlers
 * @return {EventEmitter} The `emitter` parameter
 */

exports._bootstrapObject = function(emitter, baseEventName, obj) {
  var keys = Object.keys(obj);

  for(var i = 0, len = keys.length; i < len; i++) {
    var key = keys[i];
    // skip methods prefixed with '_'
    if(key[0] === '_') continue;

    var value = obj[key];
    if(value instanceof Function) {
      emitter.on(baseEventName + '.' + key, value);
    } else if(typeof value === 'object') {
      exports._bootstrapObject(emitter, baseEventName + '.' + key, value);
    }
  }

  return emitter;
};

/**
 * Recursively walks a directory and returns paths to all found files.
 *
 * @api private
 *
 * @param {String} dir The directory to walk
 * @return {Array.<String>} paths All the found files' paths
 */

exports._walk = function walk(dir) {
  var ret = [];
  var files = fs.readdirSync(dir);

  for(var i = 0, len = files.length; i < len; i++) {
    var pth = path.join(dir, files[i]);
    var stat = fs.statSync(pth);
    if(stat.isDirectory()) {
      ret = ret.concat(walk(pth));
    } else {
      ret.push(pth);
    }
  }

  return ret;
};
