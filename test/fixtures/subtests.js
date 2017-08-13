const { test } = require('tap');

test('addition', (t) => {
  t.equal(3, 1 + 2, '1 + 2 = 3');
  t.equal(10, 5 + 5, '5 + 5 = 10');
  t.equal(1, 1 + 0, '1 + 0 = 1');
  t.equal(0, 1 + -1, '1 + -1 = 0');

  t.done();
});

test('multiplication', (t) => {
  t.equal(0, 10 * 0, '10 * 0 = 0');
  t.equal(10, 10 * 1, '10 * 1 = 10');
  t.equal(100, 10 * 10, '10 * 10 = 100');
  t.equal(5, 10 * 0.5, '10 * 0.5 = 5');
  t.done();
});
