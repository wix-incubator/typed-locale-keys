const {generateLocaleClass}  = require('./tasks/generate-locale-class');
const {analyzeUsage} = require('./tasks/analyze-usage');

const task = process.env.TASK;
const {
    npm_config_input: input,
    npm_config_output: output = './dist',
    npm_config_className: className
} = process.env;

switch(task) {
    case 'generate-locale-class':
        generateLocaleClass(input, output, className);
        break;
    case 'analyze-usage':
        analyzeUsage(input, output);
}
