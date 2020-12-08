#!/bin/bash

# Specify Dokku repo/server/app we need to push to
DOKKU_REPO=dokku@138.197.223.251:three-videos

# Getting commit SHA1 for keeping track of versions
COMMIT_ID=$(git rev-parse --short HEAD)

# Build a new version
npm run build

# Creating a temporary directory with all the files we need to deploy
rm -rf package
mkdir -p package
mkdir -p package/frontend
# mkdir -p package/backend
cd package || exit

# Dokku is basically a repo we need to push to
# so here we create a one, add the files we need, and then push to Dokku
git init
# cp -R ../backend/* ./backend
cp -R ../build/* ./frontend

# Also need to install node_modules for server side stuff
cp ../package.json .
cp ../package-lock.json .

# Uncomment if you want to remove sourcemaps
# rm -rf ./frontend/static/js/*.js.map

# Add Dockerfile so Dokku knows what to do
cp ../.deploy/Dockerfile ./Dockerfile

# Committing and pushing
git add .
git commit -m "Deploying commit $COMMIT_ID"
git push --set-upstream $DOKKU_REPO master --force

# Cleaning up
cd ../
rm -rf package
