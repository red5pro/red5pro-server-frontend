#!/bin/bash

# = NOTE =
# Use at root of repository: ./scripts/license/inject-license-html-source.sh
SRC=$(realpath src/webapps)
FIND="<\!doctype"
STRING="{{> license}}"

# clobber
# find "${SRC}/" -type f -name "*.html" -exec sed -i '1 a {{> license}}' {} \;

# check to see if already has license...
echo "Traversing ${SRC}..."
while IFS= read -r -d '' file; do
        if grep -q "$STRING" "$file"; then
                echo "$file"
                echo "Already has license..."
        else
                LINE=$(awk '/'$FIND'/{ print NR; exit }' "$file")
                sed -i ''$LINE' a {{> license}}' "$file"
        fi
done < <(find "${SRC}/" -type f -name "*.jsp" -print0)
