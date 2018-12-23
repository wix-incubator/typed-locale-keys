const loadJsonFile = require('load-json-file');
const fs = require('fs');
const util = require('util');


class TSClassBuilder {

    giveClassName() {
        return '';
    }

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


async function generateJsFile() {
    let [, , args] = process.argv;

    args = Array.isArray(args) ? args : [args];

    const {input} = Object.assign({}, ...args.map(arg => {
        const [key, value] = arg.split('=');
        return {[key.slice(2)]: value};
    }));

    const localeKeys = await loadJsonFile(input).then(localeKeys => {
        const final = {};
        Object.keys(localeKeys).forEach((key) => final[key.replace(/\./g,'_')] = key);
        return final;
    });

    const tsClassBuilder = new TSClassBuilder();

    const finalClass = await tsClassBuilder.get(localeKeys);

    var outPutDir = './dist';

    if (!fs.existsSync(outPutDir)){
        fs.mkdirSync(outPutDir);
    }

    fs.writeFileSync(`${outPutDir}/temp.ts`, finalClass, 'utf-8');
}

generateJsFile();
