const buster = require("buster")
    , fs     = require("fs.extra")
    , path   = require("path")
    , exec   = require("child_process").exec
    , wrench = require("wrench")

buster.spec.expose()

var execBinaryCommand = function(cmd, path, callback) {
  exec(__dirname + '/../bin/jquery.skeleton ' + cmd, { cwd: path }, callback)
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

describe('jquery.skeleton.spec', function() {
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
        var self = this

        this.timeout = 1000

        execBinaryCommand('--init', this.sandboxFolder, function(err, stdout, stderr) {
          self.err    = err
          self.stdout = stdout
          self.stderr = stderr

          done()
        })
      })

      it("doesn't throw an error", function() {
        expect(this.err).toBeNull()
      })

      it("creates a dist folder", function() {
        expect(path.existsSync(this.sandboxFolder + '/dist')).toBeTrue()
      })

      it("creates a lib folder", function() {
        expect(path.existsSync(this.sandboxFolder + '/lib')).toBeTrue()
      })

      it("creates a spec folder", function() {
        expect(path.existsSync(this.sandboxFolder + '/spec')).toBeTrue()
      })

      it("creates a src folder", function() {
        expect(path.existsSync(this.sandboxFolder + '/src')).toBeTrue()
      })

      it("adds busterjs to the package.json", function() {
        var packageContent = fs.readFileSync(this.sandboxFolder + '/package.json').toString()
          , packageJSON    = JSON.parse(packageContent)

        expect(packageJSON.dependencies.buster).toBeDefined()
      })

      it("sets the test command in the package.json", function() {
        var packageContent = fs.readFileSync(this.sandboxFolder + '/package.json').toString()
          , packageJSON    = JSON.parse(packageContent)

        expect(packageJSON.scripts.test).toMatch(/.*compiler\.jar.*buster-test/)
        expect(packageJSON.scripts.test.indexOf("sed -e 's/.*jquery\\.//'`.min.js")).not.toEqual(-1)
      })

      it("adds the buster.js to the spec folder", function() {
        expect(path.existsSync(this.sandboxFolder + '/spec/buster.js')).toBeTrue()
      })

      it("adds the compiler.jar to the dist folder", function() {
        expect(path.existsSync(this.sandboxFolder + '/dist/compiler.jar')).toBeTrue()
      })

      it("adds the minified version of jquery to the lib folder", function() {
        expect(path.existsSync(this.sandboxFolder + '/lib/jquery-1.7.2.min.js')).toBeTrue()
      })

      it("adds the travis setup file to the target project's root", function() {
        expect(path.existsSync(this.sandboxFolder + '/.travis.yml')).toBeTrue()
      })

      describe('spec file', function() {
        before(function() {
          this.filePath = this.sandboxFolder + '/spec/' + this.sandboxFolderName + '.spec.js'
        })

        it("adds a dummy spec file", function() {
          expect(path.existsSync(this.filePath)).toBeTrue()
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
          expect(path.existsSync(this.filePath)).toBeTrue()
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
  })
})
