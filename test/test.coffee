expect = require('chai').expect
load = null

beforeEach -> global.sinon = require('sinon').sandbox.create()
afterEach  -> global.sinon.restore()

# rebuild
# before (done) ->
#   spawn = require('child_process').spawn
#   proc = spawn('npm', ['run', 'prepublish'], { stdio: 'inherit' })
#   proc.on 'exit', -> done()

# set up jsdom
before require('./support/jsdom')

before ->
  load = window.load

describe 'jsdom sanity', ->
  it 'load jsdom env', ->
    expect(window).to.be.a 'object'
    expect(window.document).to.be.a 'object'

  it 'should have yep', ->
    expect(window.yepnope).to.be.a 'function'

describe 'load', ->
  beforeEach ->
    global.yepnope = ->

  it 'defaults', ->
    ctx = load()
    expect(ctx.load).have.length 0

  it '.css', ->
    ctx = load()
      .css('foo.css')
    expect(ctx.load).have.length 1
    expect(ctx.load[0]).eq 'css!foo.css'

  describe '.js', ->
    it 'ok', ->
      ctx = load()
        .js('foo.js', -> true)

      expect(ctx.load).have.length 1
      expect(ctx.load[0]).eq 'foo.js'

    it 'ignores non-functions', ->
      ctx = load()
        .js(null)
        .js(null)

      expect(ctx.load).have.length 0

  describe '.then', ->
    it 'adds a callback', ->
      ctx = load()
        .js('foo.js', -> true)
        .then(-> "aoeu")

      expect(ctx.callbacks['foo.js'].toString()).to.match /aoeu/

    it 'does nothing without any assets', ->
      expect(=>
        ctx = load()
          .then(-> "aoeu")
      ).to.throw /nothing to attach/
