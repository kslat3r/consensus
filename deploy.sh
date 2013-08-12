#!/bin/bash

cd /vagrant/workers/classifier/prod/
iron_worker upload classifier

cd ../../deleter/prod
iron_worker upload deleter

cd ../../..
git add .
git commit -m "Deploy"
git push prod master
