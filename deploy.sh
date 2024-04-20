#!/bin/sh

aws lambda update-function-code --function-name retrier --zip-file fileb://dist/carrier-retrier.zip