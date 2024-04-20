#!/bin/sh
npm install
mkdir dist
zip -n .sh -r9 carrier-retrier.zip node_modules/ utils/ config.mjs index.js package-lock.json package.json
mv -f carrier-retrier.zip dist/