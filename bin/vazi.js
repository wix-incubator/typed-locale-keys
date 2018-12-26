#!/usr/bin/env node
const {generateLocaleClass} = require('../tasks/generate-locale-class');
const program = require('caporal');

program
    .command('generate', 'Generates a class from the keys of a locale.json file')
    .argument('[input]', 'Locale JSON file path')
    .option('-o, --output [dir]', 'Destination directory for generated class',program.STRING,'./dist', false)
    .option('--className [name]', 'Generated class name',program.STRING,'LocaleKeys', false)
    .action(generateLocaleClass);

program.parse(process.argv);
