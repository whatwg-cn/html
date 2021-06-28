#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const tocPath = path.resolve(__dirname, '../src/SUMMARY.en.md');
const skeletonPath = path.resolve(__dirname, '../skeleton.html');
const tocFile = fs.createWriteStream(tocPath);
const srcpath = path.resolve(__dirname, '../source');
const parse = require('../lib/parse.js');
const utils = require('../lib/utils.js');

var file = parse(srcpath);
var root = file.root;
var skeleton = file.skeleton;

root.preOrderTraversal(function computePath(section, parents) {
    var slug = parents.concat(section).map(section => section.slug).join('/');
    var file = section.children.length ? `${slug}/index` : `${slug}`;
    section.path = file + '.en.html';
    skeleton = skeleton.replace(`<file src="${section.id}">`, `<file src="${file}">\n`);
});

root.preOrderTraversal(function generateTOC(section, parents, idx) {
    var blanks = utils.shift(parents.length);
    var line = `${blanks}${idx+1}. [${section.title}](${section.path})\n`;
    tocFile.write(line);
});

root.preOrderTraversal(function writeSection(section) {
    var filepath = path.resolve(__dirname, '../src', section.path);
    utils.writeFile(filepath, section.outerHTML + section.contentHTML);
});

tocFile.end();

utils.writeFile(skeletonPath, skeleton);
