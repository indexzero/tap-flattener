#!/usr/bin/env node

const yaml = require('js-yaml');
const Flattener = require('../');

const flat = new Flattener()
  .on('version', version => {
    console.log(`TAP version ${version}`);
  })
  .on('assert', res => {
    //
    // Used from tapjs/tap-parser under MIT
    // https://github.com/tapjs/tap-parser/blob/master/bin/cmd.js
    //
    const line = (res.ok ? '' : 'not ') + 'ok ' + res.id +
      (res.name ? ' - ' + res.name.replace(/ \{$/, '') : '') +
      (res.skip ? ' # SKIP' +
        (res.skip === true ? '' : ' ' + res.skip) : '') +
      (res.todo ? ' # TODO' +
        (res.todo === true ? '' : ' ' + res.todo) : '') +
      (res.time ? ' # time=' + res.time + 'ms' : '') +
      '\n' +
      (res.diag ?
         '  ---\n  ' +
         yaml.safeDump(res.diag).split('\n').join('\n  ').trim() +
         '\n  ...\n' :
         '');

    process.stdout.write(line);
  })
  .on('plan', plan => {
    console.log(`${plan.start}..${plan.end}`);
  })
  .on('bailout', reason => {
    console.log(`Bail out!${reason}`);
  })
  .on('comment', process.stdout.write.bind(process.stdout))
  .on('extra', process.stdout.write.bind(process.stdout));

process.stdin.pipe(flat);
process.on('exit', () => {
  if (!flat.ok) {
    process.exit(1);
  }
});
