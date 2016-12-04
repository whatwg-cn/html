const path = require('path');
const fs = require('fs');
const mkpath = require('mkpath');
const tocPath = path.resolve(__dirname, '../src/SUMMARY.en.md');
const skeletonPath = path.resolve(__dirname, '../skeleton.html');
const tocFile = fs.createWriteStream(tocPath);
const TreeNode = require('./tree.js');
const srcpath = path.resolve(__dirname, '../source');

var skeleton = '';
var sections = loadSource();
var root = buildTree(sections);

root.preOrderTraversal(function computePath(section, parents) {
    var slug = parents.concat(section).map(section => section.slug).join('/');
    var file = section.children.length ? `${slug}/index` : `${slug}`;
    section.path = file + '.en.html';
    skeleton = skeleton.replace(`<file src="${section.id}">`, `<file src="${file}">`);
});

root.preOrderTraversal(function generateTOC(section, parents, idx) {
    var blanks = shift(parents.length);
    var line = `${blanks}${idx+1}. [${section.title}](${section.path})\n`;
    tocFile.write(line);
});

root.preOrderTraversal(function writeSection(section) {
    var filepath = path.resolve(__dirname, '../src', section.path);
    writeFile(filepath, section.outerHTML + section.contentHTML);
});

tocFile.end();

writeFile(skeletonPath, skeleton);

function buildTree(sections) {
    var root = new TreeNode('root');
    var parents = [root];

    sections.forEach(function(node) {
        console.log('Section Found:', node.toString());
        while (parents.length && top(parents).level >= node.level) {
            parents.pop();
        }
        top(parents).children.push(node);
        parents.push(node);
    });

    return root;
}

function top(stk) {
    return stk.length ? stk[stk.length - 1] : undefined;
}

function writeFile(filepath, data) {
    mkpath(path.dirname(filepath), function(err) {
        if (err) return console.error('mkdir error', err);
        fs.writeFile(filepath, data, 'utf8', function(err) {
            if (err) return console.error('write file error', err);
            console.log(`${data.length} bytes written to ${filepath}`);
        });
    });
}

function shift(level) {
    var spaces = '                   ';
    return spaces.substr(0, level * 2);
}

function loadSource() {
    console.log('loading source HTML...');
    var content = fs.readFileSync(srcpath, 'utf8');

    var sections = [],
        match, begin = 0,
        id = 0, prev;
    var rHeader = /[ \t]*<h([2-6])([^>]*)>([\s\S]*?)<\/h[2-6]>/ig;
    while (match = rHeader.exec(content)) {
        var section = new TreeNode();
        section.id = id++;
        section.index = match.index;
        section.outerHTML = match[0];
        section.level = match[1];
        section.attrStr = match[2];
        section.title = match[3];
        match = /id=(?:"[^"]+"|[^'"\s]+|'[^']+')]/.exec(section.attrStr);
        if (match) {
            section.slug = normalizaSlug(match[1] || match[2] || match[3]);
        } else {
            section.slug = normalizaSlug(section.title);
        }

        
        if (id === 1) {
            skeleton = content.slice(begin, section.index);
        } else {
            prev = top(sections);
            prev.contentHTML = content.slice(begin, section.index);
            skeleton += `<file src="${prev.id}">`;
        }

        sections.push(section);
        begin = section.index + section.outerHTML.length;
    }
    match = content.match(/<\/body>\s*<\/html>/);
    prev = top(sections);
    prev.contentHTML = content.slice(begin, match.index);
    skeleton += `<file src="${prev.id}">`;
    skeleton += content.slice(match.index);

    return sections;
}

function normalizaSlug(str) {
    return str
        .replace(/['"]/g, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/[^\w]/g, ' ')
        .trim()
        .replace(/ +/g, '-')
        .toLowerCase()
        .substr(0, 128);
}
