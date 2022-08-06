#!/bin/bash

i=1
AMOUNT=1000500
ENDPOINT='users'
FILENAME='data-1.json'

echo "{
  \"$ENDPOINT\": [" > $FILENAME

while [ $i -le $AMOUNT ]
do
  [ $(( $RANDOM % 2 )) == 0 ] && random_status="true" || random_status="false"
  if [ $i = $AMOUNT ]
  then
    echo "    {
      \"id\": $(( $RANDOM * $i )),
      \"username\": \"turing-$i\",
      \"firstname\": \"Alan\",
      \"lastname\": \"Turing\",
      \"status\": $random_status
    }" >> $FILENAME
  else
    echo "    {
      \"id\": $(( $RANDOM * $i )),
      \"username\": \"turing-$i\",
      \"firstname\": \"Alan\",
      \"lastname\": \"Turing\",
      \"status\": $random_status
    }," >> $FILENAME
  fi
  ((i++))
done

echo '  ]
}' >> $FILENAME
