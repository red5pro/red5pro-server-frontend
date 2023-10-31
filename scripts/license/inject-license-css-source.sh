#!/bin/bash

# = NOTE =
# Use at root of repository: ./scripts/license/inject-license-css-source.sh
SRC=$(realpath src/static/css)
STRING="Copyright © 2015 Infrared5"
LICENSE=$(realpath scripts/license/LICENSE.css)

# clobber
# find "${SRC}/" -type f -name "*.css" -exec sh -c "cat scripts/LICENSE.css {} > $$.tmp && mv $$.tmp {}" \;

# check to see if already has license...
echo "Traversing ${SRC}..."
while IFS= read -r -d '' file; do
        f=$(basename $file)
        if [ "$f" == "bootstrap.min.css" ]; then
                echo "skipping $file"
        fi
        if [ "$f" == "style.css" ]; then
                echo "skipping $file"
        fi
        if grep -q "$STRING" "$file"; then
                echo "$file"
                echo "Already has license..."
        else
                cat "$LICENSE" "$file" > $$.tmp && mv $$.tmp "$file"
        fi
done < <(find "${SRC}/" -type f -name "*.css" -print0)

