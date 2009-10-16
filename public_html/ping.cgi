#!/bin/sh

echo "Content-Type: text/html"
(cd /var/www/vhosts/wiki2 && git pull)

if [[ $? == 0 ]]; then
  echo "Status: 200 OK"
else
  echo "Status: 500 Internal Server Error"
fi

