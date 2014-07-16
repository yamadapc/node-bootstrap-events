bootstrap-events
================
[![Build Status](https://travis-ci.org/yamadapc/node-bootstrap-events.svg?branch=master)](https://travis-ci.org/yamadapc/node-bootstrap-events)
[![devDependency Status](https://david-dm.org/yamadapc/node-bootstrap-events/dev-status.svg)](https://david-dm.org/yamadapc/node-bootstrap-events#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/yamadapc/node-bootstrap-events/badge.png)](https://coveralls.io/r/yamadapc/node-bootstrap-events)

- - -

__NOTE:__ _This is still experimental code._

Bootstraps events based on the directory tree and found modules' exported
methods.

## Installing
You can install this module through:
```
npm install --save bootstrap-events
```

## Usage
```javascript
var path = require('path');
var events = require('events');
var bootstrapEvents = require('bootstrap-events');

var emitter = new events.EventEmitter();
var path = path.join(__dirname, 'root');
bootstrapEvents(emitter, path)
```

See the [example](example) directory for more information.

## Public API

### `bootstrapEvents(emitter, targetDir)`

Bootstraps a directories modules methods recursivelly into an event emitter.

#### Params:

* **EventEmitter** *emitter* The EventEmitter to attach listeners to
* **String** *targetDir* The directory to start the search in
* **Object** *[options]* An options object
* **Function|Mixed|RegExp|Array** *[options.ignore]* A file ignore pattern
* **Boolean** *[options.moduleWildcards=true]* Whether to set functions

#### Return:

* **EventEmitter** The `emitter` parameter

## Private API

### `_bootstrapObject(emitter, baseEventName, obj)`

Bootstraps an object `obj`'s methods recursivelly to the EventEmitter
`emitter` based on a base event name `baseEventName`.

#### Params:

* **EventEmitter** *emitter* The event emitter to attach listeners to
* **String** *baseEventName* The base event name
* **Object** *obj* An object to scan for handlers

#### Return:

* **EventEmitter** The `emitter` parameter

### `_walk(dir)`

Recursively walks a directory and returns paths to all found files.

#### Params:

* **String** *dir* The directory to walk

#### Return:

* **Array.<String>** paths All the found files' paths

### `_matches(pred, value)`

Checks if a file matches a predicate, value, regexp or Array of any of the
preceding.

#### Params:

* **Function|Mixed|RegExp|Array** *pred*
* **Mixed** *value*

#### Return:

* **Boolean** matches

## License

This code is licensed under the MIT license. See the [LICENSE](LICENSE) file for
more information.
