var path = require('path');
var events = require('events');
var assert = require('assert');
var bootstrapEvents = require('..');

var emitter = new events.EventEmitter();
var path = path.join(__dirname, 'listeners');

bootstrapEvents(emitter, path);
assert(emitter.listeners('commands.*').length === 1);
assert(emitter.listeners('commands.test_command.do_something').length === 1);
assert(emitter.listeners('commands.test_command._doesnt_matter').length === 0);
assert(emitter.listeners('commands.test_command.also_doesnt_matter').length === 0);
