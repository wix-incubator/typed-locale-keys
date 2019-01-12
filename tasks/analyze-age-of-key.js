const gitBlame = require('git-blame');
const path = require('path');

const getCurrentKeys = (content) => {
    let keys = [];
    const keyMatcher = /"([^\r\n:]+?)"\s*:/gi;

    const matchedKeys = content.match(keyMatcher);

    if (matchedKeys) {
        keys = matchedKeys.map(k => keyMatcher.exec(k)[1]);
    }

    return keys;
};

const convertKeyAgeObj = (commits) => {
    const keyAgeObj = {};

    Object.keys(commits).forEach((hash) => {
        const currentCommit = commits[hash];
        const {age, timeStamp} = currentCommit;
        const createdDate = new Date(timeStamp).toLocaleDateString();
        currentCommit.keys.forEach((key) => keyAgeObj[key] = {age, createdDate});
    });

    return keyAgeObj;
};

function analyzeAgeOfKey(input) {
    let resolve;
    const promise = new Promise(function (_resolve) {
        resolve = _resolve;
    });

    const repoPath = path.resolve(('.git'));

    let commits = {};
    let currentCommit = {};
    gitBlame(repoPath, {file: input, detectMoved: false})
        .on('data', function (type, data) {
            if (!commits[data.hash]) {
                commits[data.hash] = {};
            }

            currentCommit = commits[data.hash];

            if (type === 'line') {
                const keys = getCurrentKeys(data.content);

                if (!keys.length) {
                    return;
                }

                if (!currentCommit.keys) {
                    currentCommit.keys = keys;
                } else {
                    currentCommit.keys.push(...keys);
                }
            } else if (type === 'commit') {
                currentCommit.timeStamp = data.author.timestamp * 1000;

                const dateMargin = Date.now() - data.author.timestamp * 1000;
                currentCommit.age = Math.floor(dateMargin / 2.628e+9);
            }
        }).on('error', function (err) {
            if (err === 'non-zero exit code 128') {
                resolve({});
            }
            process.exit(1);
        }).on('end', function () {
            const keyAgeObj = convertKeyAgeObj(commits);
            resolve(keyAgeObj);
        });

    return promise;
}

module.exports = {analyzeAgeOfKey};
