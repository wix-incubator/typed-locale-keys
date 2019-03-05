#!/usr/bin/env node
const {generateLocaleClass} = require('../tasks/generate-locale-class');
const loadJsonFile = require('load-json-file');
const program = require('caporal');

const defaultOutputDistinct = './dist\u200C';

program
    .command('codegen', 'Generates a class from the keys of a locale.json file')
    .argument('[source]', 'Locale JSON file path')
    .option('-o, --output [dir]', 'Distribution directory for generated class', program.STRING, defaultOutputDistinct, false)
    .option('-n, --nested  [bool]', 'should create nested object', program.BOOLEAN, true, false)
    .option('-t, --translate [bool]', 'should add translate function. NOTE: will wrap value with function', program.BOOLEAN, true, false)
    .option('--showTranslations [bool]', 'add translations as function\'s comment', program.BOOLEAN, true, false)
    .option('--className [name]', 'Generated class name', program.STRING, 'LocaleKeys', false)
    .action(async ({source}, {output, className, nested, translate, showTranslations}) => {
        const entryFilesByClassName = {};
        const packageJSON = await loadJsonFile('package.json');
        const configuration = Object.assign({}, {primaryOutput: './dist'}, packageJSON.typedLocaleKeys);

        const userEnteredOutput = output === defaultOutputDistinct ? undefined : output;
        const primaryOutput = userEnteredOutput || configuration.primaryOutput;

        Object.keys(configuration.entries).forEach((entryName) => {
            const entry = configuration.entries[entryName];
            const entrySource = entry.source || entry;
            const entryOutput = entry.output || primaryOutput;

            entryFilesByClassName[entryName] = {
                source: entrySource,
                output: entryOutput,
            };
        });

        if (source) {
            entryFilesByClassName[className] = {
                source,
                output: primaryOutput
            };
        }

        Object.keys(entryFilesByClassName).forEach((entryName) => {
            const entry = entryFilesByClassName[entryName];

            generateLocaleClass({
                input: entry.source,
                output: entry.output,
                className: entryName,
                nested,
                translate,
                showTranslations
            });
        })
    });

program.parse(process.argv);
