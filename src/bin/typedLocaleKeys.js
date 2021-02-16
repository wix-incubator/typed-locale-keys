#!/usr/bin/env node
const {generateLocaleFunction} = require('../tasks/generate-locale-function');
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
    .option('--functionName [name]', 'Generated function name', program.STRING, 'LocaleKeys', false)
    .option('--singleCurlyBraces [bool]', 'Use single curly braces', program.BOOL, undefined, false)
    .option('--reactHook [bool]', 'Generate React bindings (Provider and hook)', program.BOOL, undefined, false)
    .action(async ({source}, {output, functionName, nested, translate, showTranslations, singleCurlyBraces, reactHook}) => {
        const entryFilesByFunctionName = {};
        const packageJSON = await loadJsonFile('package.json');
        const configuration = Object.assign({}, {primaryOutput: './dist'}, packageJSON.typedLocaleKeys);

        const userEnteredOutput = output === defaultOutputDistinct ? undefined : output;
        const primaryOutput = userEnteredOutput || configuration.primaryOutput;

        Object.keys(configuration.entries).forEach((entryName) => {
            const entry = configuration.entries[entryName];
            const entrySource = entry.source || entry;
            const entryOutput = entry.output || primaryOutput;

            entryFilesByFunctionName[entryName] = {
                source: entrySource,
                output: entryOutput,
            };
        });

        if (singleCurlyBraces == undefined && configuration.singleCurlyBraces !== undefined) {
            singleCurlyBraces = configuration.singleCurlyBraces
        }

        if (reactHook == undefined && configuration.reactHook !== undefined) {
            reactHook = configuration.reactHook;
        }

        if (source) {
            entryFilesByFunctionName[functionName] = {
                source,
                output: primaryOutput
            };
        }

        Object.keys(entryFilesByFunctionName).forEach((entryName) => {
            const entry = entryFilesByFunctionName[entryName];

            generateLocaleFunction({
                input: entry.source,
                output: entry.output,
                functionName: entryName,
                nested,
                withTranslation: translate,
                showTranslations,
                singleCurlyBraces,
                reactHook
            });
        })
    });

program.parse(process.argv);
