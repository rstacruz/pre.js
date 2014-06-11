expect = require('chai').expect

beforeEach -> global.sinon = require('sinon').sandbox.create()
afterEach  -> global.sinon.restore()

load = null
yepnope = null

before (done) ->
  spawn = require('child_process').spawn
  proc = spawn('make', ['-B'])
  proc.on 'exit', -> done()

# set up jsdom
before require('./support/jsdom')

before ->
  load = window.Pre

# disable the check that stops multiple .run() calls
beforeEach ->
  load.ran = false

# prevent .run() from being called automatically
afterEach ->
  clearTimeout(load.timeout) if load.timeout?

describe 'jsdom sanity', ->
  it 'load jsdom env', ->
    expect(window).to.be.a 'object'
    expect(window.document).to.be.a 'object'

  it 'should have yep', ->
    expect(window.yepnope).to.be.a 'function'

describe 'pre.js', ->
  beforeEach ->
    yepnope = window.yepnope = sinon.spy()

  it 'defaults', ->
    ctx = load()
    expect(ctx.load).have.length 0

  it '.css', ->
    ctx = load()
      .css('foo.css')
    expect(ctx.load).have.length 1
    expect(ctx.load[0]).eq 'css!foo.css'

  it '.asset', ->
    ctx = load()
      .asset('img.png')
    expect(ctx.load).have.length 1
    expect(ctx.load[0]).eq 'preload!img.png'

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

  describe '.progress', ->
    it 'ok', ->
      called = ""

      ctx = load()
        .on('progress', -> called += '1')
        .on('progress', -> called += '2')

      triggerProgress = if ctx.triggerProgress then 'triggerProgress' else 'A'
      ctx[triggerProgress]('jquery.js', true)
      expect(called).to.eq "12"

  describe '.then', ->
    it 'adds a callback', ->
      ctx = load()
        .js('foo.js', -> true)
        .then(-> "aoeu")

      callbacks = ctx.callbacks || ctx.C
      expect(callbacks['foo.js'].toString()).to.match /aoeu/

    it 'adds 2 callbacks', ->
      ctx = load()
        .js('foo.js', -> true)
        .then(-> "aoeu")
        .then(-> "htns")

      callbacks = ctx.callbacks || ctx.C
      expect(callbacks['foo.js'][0]).to.match /aoeu/
      expect(callbacks['foo.js'][1]).to.match /htns/

    it 'does nothing without any assets', ->
      ctx = load()
        .then(-> "aoeu")

      callbacks = ctx.callbacks || ctx.C
      expect(Object.keys(callbacks)).have.length 0

  describe '.if', ->
    it 'false', ->
      callback = sinon.spy()
      ctx = load().if(false, callback)

      expect(callback.called).be.false
      expect(ctx.then).be.a 'function'

    it 'else', ->
      ifCallback = sinon.spy()
      elseCallback = sinon.spy()
      ctx = load().if(false, ifCallback, elseCallback)

      expect(ifCallback.called).be.false
      expect(elseCallback.calledOnce).be.true

    it 'true', ->
      callback = sinon.spy()
      ctx = load().if(true, callback)

      expect(callback.calledOnce).be.true
      expect(ctx.then).be.a 'function'

  describe 'loading', ->
    it 'runs .js', ->
      load().js('x').run()
      expect(yepnope.callCount).eql 1
      expect(yepnope.firstCall.args[0]).be.a 'object'
      expect(yepnope.firstCall.args[0].load).eql ['x']

    it 'runs .css', ->
      load().css('x').run()
      expect(yepnope.callCount).eql 1
      expect(yepnope.firstCall.args[0]).be.a 'object'
      expect(yepnope.firstCall.args[0].load).eql ['css!x']

  describe '.run', ->
    it 'can only be ran once', ->
      load().js('x').run().run()
      expect(yepnope.callCount).eql 1
