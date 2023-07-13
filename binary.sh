#!/bin/bash

if [ "$1" ]; then
    wget https://skdassoc.com/data/abp/$1 -O ./pages/data/$1
else
    wget https://skdassoc.com/data/abp/load.png -O ./pages/data/load.png
    wget https://skdassoc.com/data/abp/title.png -O ./pages/data/title.png
fi
