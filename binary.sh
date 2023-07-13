#!/bin/bash

if [ "$1" ]; then
    wget https://tengu712.lsv.jp/data/abp/$1 -O ./pages/data/$1
else
    wget https://tengu712.lsv.jp/data/abp/white.png -O ./pages/data/white.png
    wget https://tengu712.lsv.jp/data/abp/load.png -O ./pages/data/load.png
    wget https://tengu712.lsv.jp/data/abp/title.png -O ./pages/data/title.png
fi
