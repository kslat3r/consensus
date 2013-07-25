#!/bin/bash

cd /vagrant/workers/prod/
iron_worker upload classifier

cd ../..
git add .
git commit -m "Deploy"
git push prod master
