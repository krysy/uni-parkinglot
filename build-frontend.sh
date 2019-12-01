#!/usr/bin/env bash


echo "BUILDING FRONTEND"
cd frontend/
yarn 
yarn build 
mv build/* ../webserver/public
echo "DONE BUILDING FRONTEND"