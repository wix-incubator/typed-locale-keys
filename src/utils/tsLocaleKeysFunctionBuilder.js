const util = require('util');
const fs = require('fs');
const objectPath = require("object-path");
const stringifyObject = require("stringify-object");

const translateFunction = 'translate';

class TSLocaleKeysFunctionBuilder {

    constructor({nested, withTranslation, showTranslations, localeKeysJSON, functionName}) {
        this.localeKeysJSON = localeKeysJSON;
        this.withTranslation = withTranslation;
        this.nested = nested;
        this.showTranslations = showTranslations;
        this.functionName = functionName;
    }

    getArgumentsType(keyContent) {
        let argumentsDeclaration = '';
        const getParamWrapper = /{{[^}]+}}/g;
        const gettingParam = /[a-z0-9A-Z_$.]+/;
        const argumentsWrappers = keyContent.match(getParamWrapper);

        if (argumentsWrappers) {
            let options = {};
            argumentsWrappers.forEach(wrapper => {
                const argument = wrapper.match(gettingParam)[0];
                if (argument) {
                    objectPath.set(options, argument, ' any')
                }
            });
            argumentsDeclaration = JSON.stringify(options)
                .replace(/"/g, '')
                .replace(/,/g, ', ')
                .replace(/{/g, ' { ')
                .replace(/}/g, ' }');
        }

        return argumentsDeclaration;
    }

    getKeyConvertedValue(key) {
        const translation = this.localeKeysJSON[key];
        let functionValue = `'${key}'`;
        if (this.withTranslation) {
            let keyArguments = '';
            const keyArgumentsType = this.getArgumentsType(translation);
            let translateArguments = [functionValue];
            if (keyArgumentsType) {
                const keyArgumentName = 'options';
                keyArguments = `${keyArgumentName}:${keyArgumentsType}`;
                translateArguments.push(keyArgumentName)
            }

            const translateFunctionCall = `${translateFunction}(${translateArguments.join(', ')})`;

            functionValue = `(${keyArguments}) => ${translateFunctionCall}`;
        }

        if (this.showTranslations) {
            functionValue = `${functionValue} /* ${translation} */`
        }

        return functionValue;
    }

    getKeys(srcObj) {
        const indent = '    ';

        const stringifiedObject = stringifyObject(srcObj, {
            indent,
            transform: (_obj, _prop, originalValue) => {
                const realKeyValueExp = originalValue.match(/^'<-- value wrapper --(.*?)-->'/);
                if (!realKeyValueExp  || realKeyValueExp.length > 2) {
                    return originalValue;
                }
                return this.getKeyConvertedValue(realKeyValueExp[1]);
            }
        }).trim();

        return stringifiedObject.replace(/(\n)/g, `\n${indent}`);
    }

    getConstructorArgs(file) {
        let args = '';

        if (this.withTranslation) {
            args += `${translateFunction}: Function`;
        }

        return args.trim();
    }

    getInterfaceName(functionName) {
        return `I${functionName.charAt(0).toUpperCase()}${functionName.slice(1)}`;
    }

    unwrapUnnecessary$value(localeKeys, originalKeys) {
        let localeKeysUnwrapped = Object.assign({}, localeKeys);
        Object.assign(originalKeys).forEach((path) => {
            const current = objectPath.get(localeKeysUnwrapped, path);

            if (typeof current === 'object' &&
                typeof current.$value === 'string' &&
                Object.keys(current).length === 1) {
                const numberOfKeysInObject = Object.keys(current).length;

                if (numberOfKeysInObject === 1 ) {
                    localeKeysUnwrapped[path] = current.$value;
                }
            }
        });

        return localeKeysUnwrapped;
    };

    getLocaleKeys(allKeys) {
        let localeKeys = {};
        const wrapValueWithPlaceholder = key => `<-- value wrapper --${key}-->`;

        if (this.nested) {
            allKeys.forEach((key) => objectPath.set(localeKeys, `${key}.$value`, wrapValueWithPlaceholder(key)));
            localeKeys = this.unwrapUnnecessary$value(localeKeys, allKeys);
        } else {
            allKeys.forEach(key => localeKeys[key] = wrapValueWithPlaceholder(key));
        }

        return localeKeys;
    }

    async get(allKeys) {
        let templateFile;
        try {
            const readFile = util.promisify(fs.readFile);
            templateFile = await readFile(require.resolve('../templates/localeKeysFunctionTemplate.ts'), 'utf-8');
        } catch (err) {
            console.error(err);
        }

        const localeKeys = this.getLocaleKeys(allKeys);

        templateFile = templateFile.replace(/\bLocaleKeysTemplate\b/g, this.functionName.trim());
        templateFile = templateFile.replace(/\bILocaleKeysTemplate\b/g, this.getInterfaceName(this.functionName.trim()));
        templateFile = templateFile.replace('/* constructor args */', this.getConstructorArgs());
        templateFile = templateFile.replace('/* placeholder: keys here */', this.getKeys(localeKeys));
        return templateFile;
    }
}

module.exports = {TSLocaleKeysFunctionBuilder};
