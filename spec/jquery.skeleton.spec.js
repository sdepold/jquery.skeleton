const buster = require("buster")
    , fs     = require("fs.extra")
    , exec   = require("child_process").exec
    , wrench = require("wrench")

buster.testRunner.timeout = 10000
buster.spec.expose()

var execBinaryCommand = function(cmd, callback) {
  var self = this

  exec(__dirname + '/../bin/jquery.skeleton ' + cmd, {
    cwd: this.sandboxFolder
  }, function(err, stdout, stderr) {
    self.err    = err
    self.stdout = stdout
    self.stderr = stderr

    callback && callback()
  })
}

var copyFile = function(src, dest, callback) {
  fs.copy(src, dest, function(err) {
    if(err) {
      throw err
    } else {
      callback && callback()
    }
  })
}

var update = function(callback) {
  var self = this
}

describe('jquery.skeleton', function() {
  describe('binary', function() {
    before(function(done) {
      this.sandboxFolderName = 'jquery.' + (+new Date())
      this.sandboxFolder     = __dirname + '/sandbox/' + this.sandboxFolderName

      wrench.mkdirSyncRecursive(this.sandboxFolder)
      copyFile(__dirname + '/../package.json', this.sandboxFolder + '/package.json', done)
    })

    after(function() {
      wrench.rmdirSyncRecursive(__dirname + '/sandbox')
    })

    describe('init', function() {
      before(function(done) {
        execBinaryCommand.call(this, 'init', done)
      })

      it("doesn't throw an error", function() {
        expect(this.err).toBeNull()
      })

      it("creates a dist folder", function() {
        expect(fs.existsSync(this.sandboxFolder + '/dist')).toBeTrue()
      })

      it("creates a lib folder", function() {
        expect(fs.existsSync(this.sandboxFolder + '/lib')).toBeTrue()
      })

      it("creates a spec folder", function() {
        expect(fs.existsSync(this.sandboxFolder + '/spec')).toBeTrue()
      })

      it("creates a src folder", function() {
        expect(fs.existsSync(this.sandboxFolder + '/src')).toBeTrue()
      })

      it("adds busterjs to the package.json", function() {
        var packageContent = fs.readFileSync(this.sandboxFolder + '/package.json').toString()
          , packageJSON    = JSON.parse(packageContent)

        expect(packageJSON.devDependencies.buster).toBeDefined()
      })

      it("sets the test command in the package.json", function() {
        var packageContent = fs.readFileSync(this.sandboxFolder + '/package.json').toString()
          , packageJSON    = JSON.parse(packageContent)

        expect(packageJSON.scripts.test).toMatch(/.*minify.*buster-test/)
        expect(packageJSON.scripts.minify).toMatch(/.*compiler\.jar/)
        expect(packageJSON.scripts.minify.indexOf("sed -e 's/.*jquery\\.//'`.min.js")).not.toEqual(-1)
      })

      it("adds the buster.js to the spec folder", function() {
        expect(fs.existsSync(this.sandboxFolder + '/spec/buster.js')).toBeTrue()
      })

      it("adds the compiler.jar to the dist folder", function() {
        expect(fs.existsSync(this.sandboxFolder + '/dist/compiler.jar')).toBeTrue()
      })

      it("adds the minified version of jquery to the lib folder", function() {
        expect(fs.existsSync(this.sandboxFolder + '/lib/jquery-1.7.2.min.js')).toBeTrue()
      })

      it("adds the travis setup file to the target project's root", function() {
        expect(fs.existsSync(this.sandboxFolder + '/.travis.yml')).toBeTrue()
      })

      describe('spec file', function() {
        before(function() {
          this.filePath = this.sandboxFolder + '/spec/' + this.sandboxFolderName + '.spec.js'
        })

        it("adds a dummy spec file", function() {
          expect(fs.existsSync(this.filePath)).toBeTrue()
        })

        it("removes all occurrences of jquery.skeleton", function() {
          var specContent = fs.readFileSync(this.filePath).toString()
          expect(specContent.indexOf('jquery.skeleton')).toEqual(-1)
        })

        it("adds the project name", function() {
          var specContent = fs.readFileSync(this.filePath).toString()
          expect(specContent.indexOf(this.sandboxFolderName)).not.toEqual(-1)
        })
      })

      describe('spec file', function() {
        before(function() {
          this.filePath = this.sandboxFolder + '/src/' + this.sandboxFolderName + '.js'
        })

        it("adds a dummy src file", function() {
          expect(fs.existsSync(this.filePath)).toBeTrue()
        })

        it("removes all occurrences of jquery.skeleton", function() {
          var specContent = fs.readFileSync(this.filePath).toString()
          expect(specContent.indexOf('jquery.skeleton')).toEqual(-1)
        })

        it("adds the project name", function() {
          var specContent = fs.readFileSync(this.filePath).toString()
          expect(specContent.indexOf(this.sandboxFolderName.replace('jquery.', '$.fn.'))).not.toEqual(-1)
        })
      })
    })

    describe('update', function() {
      before(function(done) {
        var self = this

        execBinaryCommand.call(this, 'init', function() {
          var packageContent = fs.readFileSync(self.sandboxFolder + '/package.json').toString()
            , packageJSON    = JSON.parse(packageContent)

          delete packageJSON.dependencies.buster
          packageJSON.scripts.test = 'foo'

          fs.writeFileSync(self.sandboxFolder + '/package.json', JSON.stringify(packageJSON))

          execBinaryCommand.call(self, 'update', done)
        })
      })

      it("sets the test command in the package.json", function() {
        var packageContent = fs.readFileSync(this.sandboxFolder + '/package.json').toString()
          , packageJSON    = JSON.parse(packageContent)

        expect(packageJSON.scripts.test).toMatch(/.*minify.*buster-test/)
        expect(packageJSON.scripts.minify).toMatch(/.*compiler\.jar/)
        expect(packageJSON.scripts.minify.indexOf("sed -e 's/.*jquery\\.//'`.min.js")).not.toEqual(-1)
      })

      it("adds buster to the dev dependency list", function() {
        var packageContent = fs.readFileSync(this.sandboxFolder + '/package.json').toString()
          , packageJSON    = JSON.parse(packageContent)

        expect(packageJSON.devDependencies.buster).toBeDefined()
      })
    })

    describe('license', function() {
      before(function(done) {
        execBinaryCommand.call(this, 'init --license', done)
      })

      it("adds the MIT-LICENSE file", function() {
        expect(fs.existsSync(this.sandboxFolder + '/MIT-LICENSE')).toBeTrue()
      })

      it("adds a hint for the MIT license to the readme", function() {
        var readme = fs.readFileSync(this.sandboxFolder + '/README.md').toString()

        expect(readme.indexOf('## License')).not.toEqual(-1)
        expect(readme.indexOf('Hereby placed under MIT license.')).not.toEqual(-1)
      })
    })
  })
})
