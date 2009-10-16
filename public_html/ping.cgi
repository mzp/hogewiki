#!/bin/sh

echo "Content-Type: text/html"
(cd /var/www/vhosts/wiki2 && git pull) > git-log.$$ 2>&1

if [[ $? == 0 ]]; then
  echo "Status: 200 OK"
else
  echo "Status: 500 Internal Server Error"
fi

echo ""

cat git-log.$$
rm git-log.$$
