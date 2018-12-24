const gitBlame = require('git-blame');
const fs = require('fs');
const path = require('path');

const getCurrentKeys = (line, fileLines) => {
    let keys = [];
    const keyCapture = /([^\r\n:]+?)/g;
    const keyMatcher = /"([^\r\n:]+?)"\s*:/gi;
    const currentLine = fileLines[line];

    const matchedKeys = currentLine.match(keyMatcher);

    if (matchedKeys) {
        keys = matchedKeys.map(k => keyCapture.exec(k));
        console.log(keys);
    }

    return keys;
};

function analyzeUsage(input) {
    const file = fs.readFileSync(input, 'utf8');
    const fileLines = file.split('\n');

    const repoPath = path.resolve(('.git'));

    let commits = [];
    let currentCommit = {};
    gitBlame(repoPath, {file: input})
        .on('data', function (type, data) {
            if (type === 'line') {
                const keys = getCurrentKeys(data.finalLine, fileLines);

                if (!currentCommit.keys) {
                    currentCommit.keys = keys;
                } else {
                    currentCommit.keys.push(...keys);
                }
            } else if (type === 'commit') {
                currentCommit.timeStamp = data.author.timestamp;

                const dateMargin = Date.now() - data.author.timestamp * 1000;
                currentCommit.age = Math.floor(dateMargin / 2.628e+9);
                commits.push(currentCommit);
                currentCommit = {};
            }
        }).on('error', function (err) {
            console.error(err.message);
            process.exit(1);
        }).on('end', function () {
            console.log(...commits[1].keys);
        });
}

module.exports = {analyzeUsage};
