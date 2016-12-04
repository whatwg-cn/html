const fs = require('fs');
const path = require('path');
const skeletonPath = path.resolve(__dirname, '../skeleton.html');

var skeleton = fs.readFileSync(skeletonPath, 'utf8');
var target = '',
    begin = 0;

var rFile = /<file src="([^"]*?)">/g,
    match;

while (match = rFile.exec(skeleton)) {
    var file = path.resolve(__dirname, '../src', match[1]);
    var content;
    try {
        content = fs.readFileSync(file + '.zh.html', 'utf8');
    } catch (e) {
        content = fs.readFileSync(file + '.en.html', 'utf8');
    }
    target += skeleton.slice(begin, match.index);
    target += content;
    begin = match.index + match[0].length;
}

target += skeleton.slice(begin);
process.stdout.write(target);
