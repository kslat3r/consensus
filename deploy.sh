#!/bin/bash

cd workers/prod/
iron_worker upload classifier

cd ../..
git push prod master
