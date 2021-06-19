#!/usr/bin/env bash

if [ "$1" == "" ]; then
 echo version not specified
 exit 1
fi

if [ ! -d html ]; then
 mkdir html
fi

cd html

git init
git remote add origin https://github.com/whatwg/html.git
git fetch origin --depth=1 $1
git reset --hard FETCH_HEAD
git rev-parse HEAD > ../HTML_VERSION
rm -rf .git
