#!/usr/bin/env node

const path = require('path')
const Promise = require('bluebird')
const dfnFile = path.resolve(__dirname, '../dfns.json')
const srcFile = path.resolve(__dirname, '../html/source')
const fs = require('fs-extra')
const utils = require('../lib/utils.js')
const parse5 = require('parse5')
const dom = require('../lib/dom.js')
const repo = require('../lib/repo.js')

Promise.all([
  utils.readStdin(),
  getDfns()
])
.spread((content, dfns) => content.replace(/<span>([\s\S]+?)<\/span>/g, (str, idstr) => {
  let id = normalize(idstr)
  let value = dfns[id]
  return value ? `<span data-x="${id}">${value}</span>` : str 
}))
.then(translated => process.stdout.write(translated))
.catch(console.error)

function updateCache () {
  return fs.readFile(srcFile, 'utf8')
  .then(extractDfns)
  .then(dfns => fs.writeJson(dfnFile, dfns, {spaces: 2}).then(() => dfns))
}

function extractDfns (content){
  let root = parse5.parse(content)
  let dfns = {}
  dom
  .dfs(root, node => {
    if (/^dfn|span$/.test(node.nodeName) && node.attrs['data-x']) {
      var id = normalize(node.attrs['data-x'])
      var value = node.innerHTML
    }
    if (!utils.hasChinese(value)) {
      return
    }
    if (node.nodeName === 'dfn' || !dfns[id]) {
      dfns[id] = value.trim().replace(/\s+/g, ' ')
    }
  })
  return dfns
}

function getDfns(){
  return Promise
  .all([ fs.stat(dfnFile), fs.stat(srcFile) ])
  .spread((dfn, src) => dfn.mtimeMs > src.mtimeMs ? fs.readJson(dfnFile) : updateCache())
  .catch(e => {
    if (e.code === 'ENOENT') return updateCache();
    throw e
  })
}

function normalize(id) {
  return id.trim().replace(/\s+/g, ' ').toLowerCase()
}
