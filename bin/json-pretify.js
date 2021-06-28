#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

if(process.argv.length < 3){
    console.error('Filepath not provided, usage:');
    console.error('  json-pretify.js <file>');
    console.error('  json-pretify.js ./foo.json');
    process.exit();
}

var filepath = process.argv[2];
filepath = path.resolve(process.cwd(), filepath);

var content = fs.readFileSync(filepath);
var js = JSON.parse(content);
fs.writeFileSync(filepath, JSON.stringify(js, null, 2));
