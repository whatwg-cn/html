#!/usr/bin/env bash

set -e

open_count () {
  cat $1 | awk -F"<div" '{n+=NF>1?NF-1:0}END{print n}'
}
close_count () {
  cat $1 | awk -F"</div" '{n+=NF>1?NF-1:0}END{print n}'
}

files=$(find src -name *.zh.html -type f)
if [ "a$1" != "a" ]; then
  files=$1
fi

for file in $files
do
  open=`open_count $file`
  close=`close_count $file`
  
  opene=`open_count ${file/%.zh.html/.en.html}`
  closee=`close_count ${file/%.zh.html/.en.html}`

  delta=$((open-close))
  deltae=$((opene-closee))
  if (( delta != deltae )); then
    echo $file
    if (( delta > deltae )); then
      echo opened $((delta-deltae)) more
    else
      echo opened $((deltae-delta)) less
    fi 
    echo .zh.html open: $open close: $close
    echo .en.html open: $opene close: $closee
  fi
done

