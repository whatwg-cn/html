#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const skeletonPath = path.resolve(__dirname, '../skeleton.html');

var skeleton = fs.readFileSync(skeletonPath, 'utf8');
var target = '',
    begin = 0;

var rFile = /<file src="([^"]*?)">/g,
    match;

var files = {};
var baseDir = path.resolve(__dirname, '../src');

findFiles(baseDir);

while (match = rFile.exec(skeleton)) {
    var file = path.resolve(__dirname, '../src', match[1]);
    minus(file + '.zh.html');
    minus(file + '.en.html');
}

var hasError = false;

Object.keys(files).forEach(filepath => {
  var occr = files[filepath];
  var file = filepath.substr(baseDir.length - 3);
  if (occr < 0 && /\.en\.html/.test(file)) {
    hasError = true;
    console.log('file missing:', file);
  }
  else if (occr > 0) {
    hasError = true;
    console.log('file not used:', file);
  }
})

if (!hasError) {
  console.log('All Files OK');
}

function findFiles(dir) {
  fs.readdirSync(dir).forEach(file => {
    var fullpath = path.resolve(dir, file);
    if (/\.(en|zh)\.html$/.test(file)) {
      plus(fullpath);
    }
    else if (/^[\w-]+$/.test(file)) {
      findFiles(fullpath);
    }
  })
}

function plus(key) {
  if (!files.hasOwnProperty(key)) {
    files[key] = 0;
  }
  files[key]++;
}

function minus(key) {
  if (!files.hasOwnProperty(key)) {
    files[key] = 0;
  }
  files[key]--;
}
