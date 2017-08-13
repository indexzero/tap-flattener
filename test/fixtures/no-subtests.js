const { test } = require('tap');

test('addition 1 + 2 = 3', (t) => {
  t.equal(3, 1 + 2);
  t.done();
});

test('addition 5 + 5 = 10', (t) => {
  t.equal(10, 5 + 5);
  t.done();
});

test('addition 1 + 0 = 1', (t) => {
  t.equal(1, 1 + 0);
  t.done();
});

test('addition 1 + -1 = 0', (t) => {
  t.equal(0, 1 + -1);
  t.done();
});

test('multiplication 10 * 0 = 0', (t) => {
  t.equal(0, 10 * 0);
  t.done();
});

test('multiplication 10 * 1 = 10', (t) => {
  t.equal(10, 10 * 1);
  t.done();
});

test('multiplication 10 * 10 = 100', (t) => {
  t.equal(100, 10 * 10);
  t.done();
});

test('multiplication 10 * 0.5 = 5', (t) => {
  t.equal(5, 10 * 0.5);
  t.done();
});
