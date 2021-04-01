#!/bin/bash 
rm -rf ./build
cp -r ../client-webrtc/build/ .
npx kill-port 3000
nodemon
