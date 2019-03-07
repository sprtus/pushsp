#!/usr/bin/env node

const program = require('commander');
const config = require('../src/config');

// Commands
const init = require('../src/init');
const pull = require('../src/pull');
const push = require('../src/push');

// Version
program.version('1.1.2');

// Init
program.command('init').action(cmd => init());

// Pull
program.command('pull').action(cmd => pull(config()));

// Push
program.command('push').action(cmd => push(config()));

// Parse command
program.parse(process.argv);

// Help
if (!program.args.length) program.help();
