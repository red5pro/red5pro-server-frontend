#!/bin/bash

# = NOTE =
# Use at root of repository: ./scripts/license/inject-license-js-source.sh
SRC=$(realpath src/webapps/live/script)
STRING="Copyright © 2015 Infrared5"
LICENSE=$(realpath scripts/license/LICENSE.js)

# clobber
# find "${SRC}/" -type f -name "*.js" -exec sh -c "cat scripts/LICENSE.js {} > $$.tmp && mv $$.tmp {}" \;

# check to see if already has license...
echo "Traversing ${SRC}..."
while IFS= read -r -d '' file; do
        if grep -q "$STRING" "$file"; then
                echo "$file"
                echo "Already has license..."
        else
                cat "$LICENSE" "$file" > $$.tmp && mv $$.tmp "$file"
        fi
done < <(find "${SRC}/" -type f -name "*.js" -print0)
