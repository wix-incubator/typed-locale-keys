const loadJsonFile = require('load-json-file');
var gitBlame = require('git-blame');
const fs = require('fs');
const util = require('util');
var path = require('path');


const outPutDir = './dist';
const outputFilePath = `${outPutDir}/temp.ts`;


class TSClassBuilder {

    createTsClassStringMember(keyProp, realKey) {
        return `    public ${keyProp} : string =  '${realKey}';\n`;
    }

    async get(srcObj) {
        let file;
        try {
            const readFile = util.promisify(fs.readFile);

            file = await readFile('./templates/localeKeysTemplate.ts', 'utf-8');
        } catch (err) {
            console.error(err);
        }

        let keysProps = '';
        Object.keys(srcObj).forEach(rootKey => keysProps += this.createTsClassStringMember(rootKey, srcObj[rootKey]));

        file = file.replace('/* placeholder: keys here */', keysProps.trim());
        return file;
    }
}


function getArgs() {
    let [, , args] = process.argv;

    args = Array.isArray(args) ? args : [args];

    const {input} = Object.assign({}, ...args.map(arg => {
        const [key, value] = arg.split('=');
        return {[key.slice(2)]: value};
    }));

    return {input}
}

async function generateJsFile(input) {
    const localeKeys = await loadJsonFile(input).then(localeKeys => {
        const final = {};
        Object.keys(localeKeys).forEach((key) => final[key.replace(/\./g, '_')] = key);
        return final;
    });

    const tsClassBuilder = new TSClassBuilder();

    const finalClass = await tsClassBuilder.get(localeKeys);


    if (!fs.existsSync(outPutDir)) {
        fs.mkdirSync(outPutDir);
    }

    fs.writeFileSync(outputFilePath, finalClass, 'utf-8');
}

function analyzeUsage(input) {

    var repoPath = path.resolve(('.git'));
    var file = outputFilePath;

    gitBlame(repoPath, {
        file: input,
    }).on('data', function (type, data) {
        // type can be 'line' or 'commit'
        if(type === 'commit') {
            console.log(type, data);
        }
    }).on('error', function (err) {
        console.error(err.message);
        process.exit(1);
    }).on('end', function () {
        console.log('±±±±±±±±±±±±±±±±±±');
        console.log("That's all, folks!");
    });
}

const {input} = getArgs();
generateJsFile(input);
analyzeUsage(input);
