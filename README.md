bootstrap-events
================
[![Build Status](https://travis-ci.org/yamadapc/node-bootstrap-events.svg?branch=master)](https://travis-ci.org/yamadapc/node-bootstrap-events)
[![devDependency Status](https://david-dm.org/yamadapc/node-bootstrap-events/dev-status.svg)](https://david-dm.org/yamadapc/node-bootstrap-events#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/yamadapc/node-bootstrap-events/badge.png)](https://coveralls.io/r/yamadapc/node-bootstrap-events)

- - -

__NOTE:__ _This is still experimental code and hasn't yet been published to
npm._

Bootstraps events based on the directory tree and found modules' exported
methods.

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

## License

This code is licensed under the MIT license. See the [LICENSE](LICENSE) file for
more information.
