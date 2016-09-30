#!/usr/bin/env bash

set -xe

# Please update this accordingly to match your actual build and testing process

# npm test
#NODE_ENV=test gulp build --force # we are currently using this to get pass the CI because it currently fails
#NODE_ENV=test gulp test
gulp build

