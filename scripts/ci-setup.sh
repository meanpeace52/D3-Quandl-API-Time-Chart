#!/usr/bin/env bash

set -xe

\curl -sSL https://raw.githubusercontent.com/codeship/scripts/master/packages/mongodb.sh | bash -s
rvm use 2.2.0 --install
gem update --system
gem install sass --version "=3.3.7"
npm install --no-optional
npm install gulp -g


npm install -g http-server protractor
# Download and install selenium webdrivers
webdriver-manager update
# Run web driver in background, keeping in mind it takes a few seconds to become responsive
nohup bash -c "webdriver-manager start 2>&1 &" && sleep 9

