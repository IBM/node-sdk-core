#!/bin/bash

# based on http://benlimmer.com/2013/12/26/automatically-publish-javadoc-to-gh-pages-with-travis-ci/

# checking the build/job numbers allows it to only publish once even though we test against multiple node.js versions

if [ "$TRAVIS_REPO_SLUG" == "IBM/node-sdk-core" ] && [ "$TRAVIS_PULL_REQUEST" == "false" ] && [ "$TRAVIS_BRANCH" ] && [ "$TRAVIS_BUILD_NUMBER.1" == "$TRAVIS_JOB_NUMBER" ]; then

  echo "Publishing JSDoc..."

  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "travis-ci"
  git clone --quiet --branch=gh-pages https://${GH_TOKEN}@github.com/IBM/node-sdk-core gh-pages > /dev/null

  pushd gh-pages
    # make a directory named after the branch/tag for the current build, replacing the previous one if present
    # on tagged builds, $TRAVIS_BRANCH is the tag (e.g. v1.2.3), otherwise it's the branch name (e.g. master)
    rm -rf $TRAVIS_BRANCH
    mkdir $TRAVIS_BRANCH
    cp -Rf ../doc/. ./$TRAVIS_BRANCH

    # update the latest/ symlink
    # on tagged builds, $TRAVIS_TAG is set to the tag, but it's blank on regular builds, unlike $TRAVIS_BRANCH
    if [ $TRAVIS_TAG ]; then
      rm latest
      ln -s ./$TRAVIS_TAG latest
    fi

    # todo: automatically delete folders that don't have a matching git branch

    echo "tags:"
    # sorted list of tags, newest first:
    git tag --sort -version:refname

    echo ""
    echo "branches:"
    # list branches
    git branch --remote | grep --invert-match gh-pages | sed -e 's/.*origin\/\(.*\)/\1/' | uniq

    # generate an incdex file listing all of the versions
    ../scripts/jsdoc/generate_index_html.sh > index.html

    # add all changes to git, including deleted files
    git add -f -A .
    git commit -m "Doc for $TRAVIS_BRANCH ($TRAVIS_COMMIT)"
    git push -fq origin gh-pages > /dev/null

  popd

  echo -e "Published Doc for $TRAVIS_BRANCH to gh-pages.\n"

else

  echo -e "Not publishing docs for build $TRAVIS_BUILD_NUMBER ($TRAVIS_JOB_NUMBER) on branch $TRAVIS_BRANCH of repo $TRAVIS_REPO_SLUG"

fi
