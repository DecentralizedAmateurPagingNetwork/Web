#!/bin/sh

while true
do
  wget -m -nv -nH -nd -np -R "index.html*" -e robots=off -P /app/dist/assets/coverage http://web.db0sda.ampr.org/dapnet-coverage/
  sleep 900
done
