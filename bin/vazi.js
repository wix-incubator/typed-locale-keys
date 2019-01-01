#!/usr/bin/env node
const {generateLocaleClass} = require('../tasks/generate-locale-class');
const program = require('caporal');

program
    .command('codegen', 'Generates a class from the keys of a locale.json file')
    .argument('[input]', 'Locale JSON file path')
    .option('-o, --output [dir]', 'Destination directory for generated class',program.STRING,'./dist', false)
    // .option('-t, --threashhold [dir]', 'threashold. only works with --coverage true',program.STRING,'./dist', false)
    .option('-n, --nested  [bool]', 'should create nested object',program.BOOLEAN,true, false)
    .option('-c, --coverage [bool]', 'should add istanbul coverage. NOTE: will wrap value with function',program.BOOLEAN,true, false)
    .option('-t, --translate [bool]', 'should add translate function. NOTE: will wrap value with function',program.BOOLEAN,true, false)
    .option('--className [name]', 'Generated class name',program.STRING,'LocaleKeys', false)
    .action(generateLocaleClass);

program.parse(process.argv);
