const path    = require("path")
    , http    = require("http")
    , fs      = require("fs.extra")
    , program = require("commander")
    , version = JSON.parse(fs.readFileSync(__dirname + '/../package.json')).version
    , _       = require("underscore")
    , _s      = require("underscore.string")
    , wrench  = require("wrench")

var Helpers = module.exports = {
  License: {
    setup: function() {
      Helpers.copyFile(__dirname + '/../MIT-LICENSE', process.cwd() + '/MIT-LICENSE')
      Helpers.License.add()
    },

    add: function() {
      var readmePath = process.cwd() + '/README.md'
        , readme     = null

      try {
        readme = fs.readFileSync(readmePath).toString()
      } catch(e) {
        readme = ""
      }

      if(readme.indexOf('## License') === -1) {
        readme += "\n## License\n\nHereby placed under MIT license."
        fs.writeFileSync(readmePath, readme)
      }
    }
  },

  deleteFile: function(file) {
    try {
      fs.unlinkSync(file)
    } catch(e) {}
  },

  createFolder: function(path) {
    try {
      fs.mkdirSync(path)
      console.log('Successfully created the folder: ' + path)
    } catch(e) {
      console.log('Skipped creation of the folder: ' + path)
    }
  },

  copyFile: function(src, dest, callback) {
    fs.copy(src, dest, function(err) {
      if(err) {
        throw err
      } else {
        console.log('Copied file successfully: ' + src)
        callback && callback()
      }
    })
  },

  getTargetProjectName: function() {
    return process.cwd().replace(/.*jquery\./, '')
  },

  replaceSkeletonInFile: function(file) {
    var content = fs.readFileSync(file).toString().toString()

    content = content
      .replace('$.fn.skeleton', '$.fn.' + _s.camelize(Helpers.getTargetProjectName().replace('.', '_')))
      .replace("'skeleton'", "'" + Helpers.getTargetProjectName() + "'")
      .replace('jquery.skeleton', 'jquery.' + Helpers.getTargetProjectName())
      .replace('prints "skeleton"', 'prints "' + Helpers.getTargetProjectName() + '"')
      .replace('this.element.skeleton()', 'this.element.' + _s.camelize(Helpers.getTargetProjectName().replace('.', '_')) + '()')

    fs.writeFileSync(file, content)
  },

  addCommandsToPackageFile: function() {
    var sourcePackageContent = JSON.parse(fs.readFileSync(__dirname + '/../package.json'))
      , targetPackageContent = JSON.parse(fs.readFileSync(process.cwd() + '/package.json'))
      , commands = {
          "test": "npm run minify && npm run buster-test",
          "buster-test": "node_modules/.bin/buster-test",
          "minify": "java -jar dist/compiler.jar src/*.js --js_output_file=dist/jquery.`pwd|sed -e 's/.*jquery\\.//'`.min.js",
          "buster-capture": "(npm run buster-server &) && sleep 2 && npm run buster-capture-browser",
          "buster-capture-browser": "type -P open &>/dev/null && open 'http://localhost:1111/capture' || firefox 'http://localhost:1111/capture'",
          "buster-server": "node_modules/.bin/buster-server"
        }

    targetPackageContent.scripts = targetPackageContent.scripts || {}

    for(var commandName in commands) {
      var command = commands[commandName]

      targetPackageContent.scripts[commandName] = command
    }

    fs.writeFileSync(process.cwd() + '/package.json', JSON.stringify(targetPackageContent, null, 2))
  },

  addBusterJsDependencyToPackageFile: function() {
    var sourcePackageContent = JSON.parse(fs.readFileSync(__dirname + '/../package.json'))
      , targetPackageContent = JSON.parse(fs.readFileSync(process.cwd() + '/package.json'))

    targetPackageContent.devDependencies        = targetPackageContent.devDependencies || {}
    targetPackageContent.devDependencies.buster = sourcePackageContent.dependencies.buster

    delete targetPackageContent.dependencies.buster

    fs.writeFileSync(process.cwd() + '/package.json', JSON.stringify(targetPackageContent, null, 2))
  },

  addTravisConfig: function() {
    var packageContent = JSON.parse(fs.readFileSync(process.cwd() + '/package.json'))
      , travisContent  = fs.readFileSync(process.cwd() + '/.travis.yml').toString()
      , email          = packageContent.author.match(/<(.*)>/)

    if(email) {
      email = email[1]
      travisContent = travisContent.replace('- sascha@depold.com', '- ' + email)
    } else {
      travisContent = travisContent.replace("\nnotifications:\n  email:\n    - sascha@depold.com\n", '')
    }

    fs.writeFileSync(process.cwd() + '/.travis.yml', travisContent)
  }
}
