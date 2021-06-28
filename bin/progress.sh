#!/usr/bin/env bash

ALL=`find src -name *.en.html | wc -l`
ZH=`find src -name *.zh.html | wc -l`

echo Current Translate Progress: $(($ZH * 100 / $ALL))% \($ZH/$ALL\)
