#!/bin/bash

my_border_print() {
  BORDER_SIZE=${1}
  for index in $(seq 1 "$BORDER_SIZE")
  do
    echo -n "#"
  done
  echo ""
}

my_title_print() {
  MESSAGE=${1}
  MESSAGE_SIZE=${#1}
  BORDER_SIZE=$(($MESSAGE_SIZE + 6))

  my_border_print ${BORDER_SIZE}
  echo "## ${MESSAGE} ##"
  my_border_print ${BORDER_SIZE}
}

my_title_print "BUILDING"

echo ""
echo "Shell => ${SHELL}"
echo ""
echo "Build what?"
echo "=> bundle fast:  1"
echo "=> bundle small: 2"
echo ""

read USER_INPUT

case ${USER_INPUT} in
  1)
    echo "=> bundle fast"

    # npm run bunjs-build-debug
    npm run watch
    ;;
  2)
    echo "=> bundle small"
    npm run rollupjs-build-release
    ;;
  *)
    echo "=> INVALID CHOICE"
    ;;
esac
