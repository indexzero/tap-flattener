# tap-flattener

Flattens tap output including subtests into a single level hierarchy. Conforms to the same API and guarantees as `tap-parser`

## Motivation

There are cases for TAP interop with other platforms where the entirety of the [TAP 13] specification are not implemented. Specifically that subtests may not be supported given the [many flavors][subtests] possible. It is, however, also possible to "flatten" tap-output with subtests. e.g.:

```
$ cat test/fixtures/subtests.tap
TAP version 13
# Subtest: addition
    ok 1 - 1 + 2 = 3
    ok 2 - 5 + 5 = 10
    ok 3 - 1 + 0 = 1
    ok 4 - 1 + -1 = 0
    1..4
ok 1 - addition # time=4.511ms

# Subtest: multiplication
    ok 1 - 10 * 0 = 0
    ok 2 - 10 * 1 = 10
    ok 3 - 10 * 10 = 100
    ok 4 - 10 * 0.5 = 5
    1..4
ok 2 - multiplication # time=1.968ms

1..2
# time=14.141ms
```

when flattened would represent the same core eight assertions:

```
$ cat test/fixtures/subtests.tap | tap-flattener
TAP version 13
ok 1 - addition 1 + 2 = 3
ok 2 - addition 5 + 5 = 10
ok 3 - addition 1 + 0 = 1
ok 4 - addition 1 + -1 = 0
ok 5 - multiplication 10 * 0 = 0
ok 6 - multiplication 10 * 1 = 10
ok 7 - multiplication 10 * 10 = 100
ok 8 - multiplication 10 * 0.5 = 5
# time=14.141ms
1..8
```

## Usage

``` js
var Flatener = require('tap-flattener');
var flat = new Flatener(function (results) {
  console.dir(results);
});

process.stdin.pipe(flat);
```

## CLI

This package also has a `tap-flattener` command.

```
Usage:
  tap-flatener

Parses TAP data from stdin, and outputs the flattened TAP data to stdout.
```

## API

Under the covers, `tap-flattener` is writing to and reading from a `tap-parser` stream. As such it conforms to the same [core API] and [named events]. _The two exceptions to this are:_

- No `line` events are emitted. Listen for individual `assert`, `complete`, `plan`, and `version` events instead.
- No `child` events are emitted. **The subtests represented by these `child` events are instead transformed into `assert` events.**

## Run Tests

Tests are written with [tap] and can be run with `npm`:

```
npm test
```

##### LICENSE: MIT
##### AUTHOR: [Charlie Robbins](https://github.com/indexzero)

[core API]: https://github.com/tapjs/tap-parser#methods
[named events]: https://github.com/tapjs/tap-parser#events
[subtests]: https://github.com/tapjs/tap-parser#subtests
[TAP 13]: https://testanything.org/tap-version-13-specification.html
[tap]: http://www.node-tap.org/
