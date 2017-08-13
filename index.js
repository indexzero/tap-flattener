const Parser = require('tap-parser');
const Minipass = require('minipass');
const enabled = require('enabled');
const debug = require('diagnostics')('tap-flattener');

const isSubtest = /#\sSubtest:\s/i;

/**
 * Stream compatible with tap-parser logic.
 */
class Flattener extends Minipass {
  constructor(opts, done) {
    super();

    if (typeof opts === 'function') {
      done = opts;
      opts = {};
    }

    if (done) {
      this.on('complete', done);
    }

    //
    // Create a tap-parser instance and listen to
    // the appropriate events for flattening.
    //
    this.parser = new Parser(opts);
    this.nextId = 0;
    this.ok = true;
    this.count = 0;
    this.pass = 0;
    this.fail = 0;
    this.bailout = false;
    this.todo = 0;
    this.skip = 0;
    this.failures = [];

    const events = {
      ignored: [
        'line', // Synthetic line events are not guaranteed to be equal.
        'plan'  // We generate this based on "assert" and "child" events.
      ],
      immutable: ['comment', 'extra', 'version'],
      mutable: ['assert', 'bailout', 'child', 'complete']
    };

    for (const name of events.immutable) {
      debug('Pass-through immutable event: ', name);
      this.parser.on(name, this.emit.bind(this, name));
    }

    this.parser.on('assert', this.onAssert.bind(this));
    this.parser.on('bailout', this.onBailout.bind(this));
    this.parser.on('child', this.onChild.bind(this));
    this.parser.on('complete', this.onComplete.bind(this));

    //
    // If we want to debug, then we debug what is ignored
    // as well.
    //
    if (enabled('tap-flattener')) {
      for (const name of events.ignored) {
        this.parser.on(name, this.onIgnore.bind(this, name));
      }
    }

    //
    // When this instance is piped to then pipe that
    // source to the tap-parser instance so that we
    // may get the appropriate events.
    //
    this.on('pipe', (src) => {
      src.pipe(this.parser);
    });
  }

  /**
   * Since not all TAP must have subtests, we only want to ignore those
   * assert events which immediately follow a complete event from a child
   * parser.
   * @param  {object} assert Details of the test assertion
   */
  onAssert(assert) {
    if (this.ignoreNextAssert) {
      this.onIgnore('assert', assert);
      this.ignoreNextAssert = false;
      return;
    }

    this.emit('assert', assert);
  }

  /**
   * Sets the bailout state on this instance before emitting the event.
   * @param  {string|boolean} reason Bailout reason, if provided.
   */
  onBailout(reason) {
    this.bailout = reason || true;
    this.emit('bailout', reason);
  }

  /**
   * The bulk of the logic around tap-flattener is here:
   * 1. Hoist all child assert events to the outer scope.
   * 2. Grab the first comment as the name of the parent test. This is a strong
   *    guarantee from tap-parser.
   * 3. Hoist all other comments to the outer scope.
   * 4. On complete, ignore the next outer assert event
   * 5. Ignore all other events: bailout, extra, line, plan
   *
   * Remark (indexzero): this is currently not recursive in nature and will not hoist
   * any subtests within subtests.
   *
   * @param  {Parser} child tap-parser instance for the subtest scope.
   */
  onChild(child) {
    let parentTest;

    child.once('comment', (comment) => {
      parentTest = comment.replace(isSubtest, '').trim();

      //
      // Remark: may want to ignore more comments from the child
      //
      child.on('comment', this.emit.bind(this, 'comment'));
    });

    child.on('assert', (assert) => {
      const hoisted = {
        id: ++this.nextId,
        name: [parentTest, assert.name].filter(Boolean).join(' '),
        ok: assert.ok
      };

      if (assert.todo) hoisted.todo = assert.todo;
      if (assert.skip) hoisted.skip = assert.skip;
      if (assert.diag) hoisted.diag = assert.diag;

      this.count += 1;
      if (hoisted.ok) {
        this.pass += 1;
      } else {
        this.ok = false;
        this.fail += 1;
        this.failures.push(hoisted);
      }

      this.emit('assert', hoisted);
    });

    //
    // By definition when the `child` emits a `complete` event the
    // next `assert` from the parent parser should be ignored since
    // all child subtests are now hoisted to the outer scope.
    //
    child.on('complete', (result) => {
      this.ignoreNextAssert = true;
    })
  }

  /**
   * When the parent tap-parser instance is complete, emit our
   * synthetic plan created from all child parsers and then a complete
   * event.
   */
  onComplete() {
    this.emit('plan', {
      start: 1,
      end: this.nextId
    });

    this.emit('complete', {
      ok: this.ok,
      count: this.count,
      pass: this.pass,
      fail: this.fail,
      bailout: this.bailout,
      todo: this.todo,
      skip: this.skip,
      failures: this.failures
    });
  }

  /**
   * Debug output for ignored `event`.
   * @param  {string} event Name of the ignored event.
   * @param  {Object} value Value emitted from the ignored event.
   */
  onIgnore(event, value) {
    debug('Ignore %s: %j', event, value);
  }
}

module.exports = Flattener;
