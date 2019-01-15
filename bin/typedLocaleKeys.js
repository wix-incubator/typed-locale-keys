#!/usr/bin/env node
const {generateLocaleClass} = require('../tasks/generate-locale-class');
const loadJsonFile = require('load-json-file');
const program = require('caporal');

const defaultOutputDistinct = './dist\u200C';

program
    .command('codegen', 'Generates a class from the keys of a locale.json file')
    .argument('[source]', 'Locale JSON file path')
    .option('-o, --output [dir]', 'Distribution directory for generated class', program.STRING, defaultOutputDistinct, false)
    .option('-g, --gracePeriod [months]', 'threshold(in months) for grace period of key. uses git history to determine age of key. NOTE: only works with --coverage true', program.INT, 3, false)
    .option('-n, --nested  [bool]', 'should create nested object', program.BOOLEAN, true, false)
    .option('-c, --coverage [bool]', 'should add istanbul coverage. NOTE: will wrap value with function', program.BOOLEAN, false, false)
    .option('-t, --translate [bool]', 'should add translate function. NOTE: will wrap value with function', program.BOOLEAN, true, false)
    .option('--className [name]', 'Generated class name', program.STRING, 'LocaleKeys', false)
    .action(async ({source}, {output, className, nested, coverage, translate, gracePeriod}) => {
        const entryFilesByClassName = {};
        const outputsDirectories = {};
        const packageJSON = await loadJsonFile('package.json');
        const configuration = Object.assign({}, { primaryOutput: './dist' }, packageJSON.typedLocaleKeys);

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
                coverage,
                translate,
                gracePeriod
            });
        })
    });

program.parse(process.argv);
