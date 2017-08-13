const { createReadStream, readdirSync } = require('fs');
const { extname, join } = require('path');
const { test } = require('tap');
const Flattener = require('../');

//
// Read all of the *.tap files we have
//
const fixturesDir = join(__dirname, 'fixtures');
const files = readdirSync(fixturesDir)
  .filter(file => extname(file) === '.tap');

//
// Every test fixture, with or without subtests
// should have exactly eight (8) assert events
// (i.e. tests) once flattened.
//
files.forEach(file => {
  test(`${file} is flattened correctly`, (t) => {
    const flat = createReadStream(join(fixturesDir, file))
      .pipe(new Flattener());

    flat.on('plan', plan => {
      t.equal(plan.start, 1, 'should start at 1');
      t.equal(plan.end, 8, 'should end at 8');
    });

    flat.on('complete', result => {
      if (/failures/.test(file)) {
        //
        // All failing test fixtures have "failures" in the filename
        // and exactly two failing tests when flattened.
        //
        t.equal(result.ok, false, 'is not ok');
        t.equal(result.pass, 6, 'has six passing');
        t.equal(result.fail, 2, 'has two failures');
      } else {
        t.equal(result.ok, true, 'is ok');
        t.equal(result.pass, 8, 'has eight passing');
        t.equal(result.fail, 0, 'has zero failures');
      }

      t.equal(result.count, 8, 'has eight tests');
      t.done();
    });
  });
});
