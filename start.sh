#!/usr/bin/env bash
set -e

npm run app_prod &
pid1=$!

npm run worker_prod &
pid2=$!

wait -n
kill $pid1 $pid2
