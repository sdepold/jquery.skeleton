jquery.skeleton
===============

A skeleton builder for jquery plugins. Included is BusterJS for testing and Google Closure Compiler for minification.

## Getting started

So first of all you need to create a repository on Github and clone it. Respectively create a new folder. Afterwards do this:

```console
# clone the repo ...
git clone git://github.com/yourname/jquery.plugin-name.git

# ... or download the folder
mkdir jquery.plugin-name

# Initialize npm in that new folder and answer the questions.
npm init

# Add jquery.skeleton to your package.json.
npm install jquery.skeleton --save

# Execute the init process and let the magic happen.
node_modules/.bin/jquery.skeleton init
```

  - git clone git://github.com/yourname/jquery.plugin-name.git
  - mkdir jquery.plugin-name
- Initialize npm in that new folder.
  - npm init
- Add `jquery.skeleton` to your package.json.
  - npm install jquery.skeleton --save
- Execute the init process and let the magic happen.
  - node_modules/.bin/jquery.skeleton init
- Start coding!

## Test driven development
The major goal of the skeleton is actually to program in a test driven way. So once you ran all of the previous
commands, you will get access to [BusterJS](http://busterjs.org/). Here is how to go on coding:

- Run the BusterJS server.
  - node_modules/.bin/buster-server
- Point your server to http://localhost:1111 and capture your browser. Choose one of the following commands or do it just manually.
  - open http://localhost:1111/capture
  - firefox http://localhost:1111/capture
- Minify the code in the src folder and run the tests:
  - npm test

## Update current project
- Update your `jquery.skeleton` to the latest version of jquery.skeleton.
- Update your project:
  - node_modules/.bin/jquery.skeleton update

## Adding the MIT license to the project
- node_modules/.bin/jquery.skeleton license

## Overview of available commands
- node_modules/.bin/jquery.skeleton --help

## License

Hereby placed under MIT license.

