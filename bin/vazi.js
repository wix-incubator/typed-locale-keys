const program = require('commander');
const {generateLocaleClass} = require('../tasks/generate-locale-class');

program
    .command('generate <dir>', 'Generates a class from the keys of a locale.json file')
    .option('-o, --output', 'Destination path for generated class')
    .option('--className', 'Generated class name')
    .action(generateLocaleClass);
